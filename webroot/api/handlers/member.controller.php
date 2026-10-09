<?php

/**
 * huoniaoTag模板标签函数插件-会员中心
 *
 * @param $params array 参数集
 * @return array
 */

function member($params, $content = "", &$smarty = array(), &$repeat = array())
{
    extract($params);
    $service = "member";
    if (empty($action)) return '';
    global $huoniaoTag;
    global $dsql;
    global $userLogin;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $template;
    global $cfg_errLoginCount;
    global $cfg_loginLock;
    global $langData;
    global $installModuleArr;
    global $cfg_cancellation_state;         //注销账户开关
    if (in_array('shop', $installModuleArr)) {
        include HUONIAOINC . "/config/shop.inc.php";
        $userid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT `shoptype` FROM `#@__shop_store` WHERE `userid` = " . $userid);
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $huoniaoTag->assign('shoptype', $res[0]['shoptype']);
        }

        $shop_huodongopen = $custom_huodongopen === '' ? array() : explode(",", $custom_huodongopen);
        $huoniaoTag->assign('shop_huodongopen', $shop_huodongopen);
        
        //0混合  1到店优惠  2送到家
        $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
        $huoniaoTag->assign('custom_huodongshoptypeopen', $huodongshoptypeopen);

    }

    //商家中心logo
    global $cfg_businesslogo;
    $huoniaoTag->assign('businesslogo', $cfg_businesslogo ? getFilePath($cfg_businesslogo) : $cfg_secureAccess . $cfg_basehost . '/templates/member/company/images/index2/icon_title.png');

    //输出明天和一周后的时间
    $huoniaoTag->assign('tomorrowDate', AddDay(time(), 1));
    $huoniaoTag->assign('addWeekDate', AddDay(time(), 6));
    //七天前的时间
    $agentime = strtotime(date("Y-m-d H:i:s", strtotime("-7 days")));
    $membertime = GetMkTime(time());
    $loginCount = $cfg_errLoginCount;   //登录错误次数限制
    $loginTimes = $cfg_loginLock;       //登录错误次数太多后需要等待的时间（单位：分钟）

    //用户基本信息
    $userinfo = $userLogin->getMemberInfo();

    //用户个人模块信息
    $memberModule = $userLogin->getMemberModule();

    //企业用户套餐信息
    $memberPackage = $userLogin->getMemberPackage();
    
    if($memberPackage == 'No data!'){
        $memberPackage = array();
    }

    //合并
    // $userinfo = array_merge($userinfo, $memberModule);
    $huoniaoTag->assign('memberModule', $memberModule);
    $memberExpired = 0;
    $qitime = $membertime - $agentime;
    $memberExpiredDay = '';
    if ($memberPackage && $memberPackage != 'No data!') {   //提前七天提示用户
        if ($memberPackage['package']['item']['store'][0]['name'] == 'shop') {
            $memberPackage['package']['expired'] = $memberPackage['package']['item']['store'][0]['expired'];
        }
        $time = time();
        if ($memberPackage['package']['expired'] - time() < $qitime) {
            $qitimestr = ceil(($memberPackage['package']['expired'] - time()) / 3600 / 24);
            if ($qitimestr > 0) {
                $memberExpiredDay = $qitimestr . '天';
            }
        }
    }

    //查询商城模块有效期
    $shopExpired = 0;
    if ($memberPackage && $memberPackage != 'No data!' && $memberPackage['package']['item'] && $memberPackage['package']['item']['store']) {
        foreach ($memberPackage['package']['item']['store'] as $key => $val) {
            if ($val['name'] == 'shop') {
                $shopExpired = $val['expired'] < $membertime ? 1 : 0;
            }
        }
    }

    if ($memberPackage && $memberPackage != 'No data!' && (($memberPackage['package']['expired'] && $memberPackage['package']['expired'] < $membertime) || $shopExpired)) {    //商家服务到期
        $memberExpired = 1;
        $huoniaoTag->assign('memberExpired', $memberExpired);
    }
    $huoniaoTag->assign('memberPackage', $memberPackage);
    $huoniaoTag->assign('memberExpiredDay', $memberExpiredDay);
    //注销账户显示开关
    $huoniaoTag->assign('cfg_cancellation_state', $cfg_cancellation_state);

    $userid = $userLogin->getMemberID();

    // $userinfo = $userLogin->getMemberInfo();

    $shoppagetype = $custom_huodongshoptypeopen;
    $huoniaoTag->assign('pagetype', $shoppagetype);

    if ($userinfo['is_staff'] == 1) {

        $userid = $userinfo['companyuid'];
    }
    if ($userinfo['userType'] == 2 || $userinfo['is_staff'] == 1) {
        $sql = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE `uid` = " . $userid . " ORDER BY `id` DESC");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $website = $res[0]['id'];
            // if($action != 'servicemeal' && $action != 'joinOrder' && $module != 'circle' && $res[0]['expired'] && $res[0]['expired'] < time()){

            //     //判断访问类型
            //     global $tpl;
            //     if(strstr($tpl, "company")){
            //         $param = array(
            //             'service' => 'member',
            //             'template' => 'servicemeal'
            //         );
            //         header("location:" . getUrlPath($param));
            //         die;
            //     }
            // }

            //输出商家所有信息到页面
            foreach ($res[0] as $key => $value) {
                $huoniaoTag->assign('businessDetail_' . $key, $value);
            }
        } else {
            // 更新会员类型为个人
            if ($userinfo['userType'] == 2) {
                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `mtype` = 1 WHERE `id` = " . $userid);
                $dsql->dsqlOper($sql, "update");

                $param = array(
                    "service" => "member",
                    "type" => "user",
                );
                header("location:" . getUrlPath($param));
                die;
            }
        }

        $showModule = checkShowModule($bind_module, 'manage');
        $huoniaoTag->assign('showModuleConfig', $showModule);

        $totalComment = 0;
        // foreach ($showModule as $key => $value) {
        //  $type = "";
        //  $sql = "";
        //  if(isset($value['sid']) && $value['sid']){
        //      $sid = $value['sid'];
        //      if($key == "shop" || $key == "tuan" || $key == "waimai"){
        //          $type == $key."_store";
        // $sql = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `type` = '$type' AND `aid` = $sid AND DATE_FORMAT(FROM_UNIXTIME(`dtime`), '%Y-%m-%d') = curdate()");
        //      }
        //  }
        //  if($sql){
        //      $totalComment += $dsql->dsqlOper($sql, "totalCount");
        //  }
        // }
        //当天
        $todayk = strtotime(date('Y-m-d'));
        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `type` = 'business' AND `aid` = $website AND `dtime` >$todayk AND `dtime` < $todaye");
        $totalComment += (int)$dsql->dsqlOper($sql, "totalCount");

        $huoniaoTag->assign('totalComment', $totalComment);
    }
    $edushow = 1;
    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `userid` = $userid");
    $res = $dsql->dsqlOper($sql, "results");

    $sql1 = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = " . $userid);
    $res1 = $dsql->dsqlOper($sql1, "results");
    if ($res || $res1) {
        $edushow = 1;
    }
    $huoniaoTag->assign('edushow', $edushow);

    //使用微信原生登录，小程序端如果禁用了微信原生登录，H5的登录页面也需要隐藏微信快捷登录按钮
    global $cfg_useWxMiniProgramLogin;
    $huoniaoTag->assign('useWxMiniProgramLogin', (int)$cfg_useWxMiniProgramLogin);

    if ($action == 'record' || $action == 'point' || $action == 'bill') {

        if ($action == 'record') {

            $leimuallarr = array(
                'chongzhi'          => '充值',
                'tixian'            => '提现',
                'huiyuanshengji'    => '会员升级',
                'shangjiaruzhu'     => '商家入驻',
                'jingjirentaocan'   => '经纪人套餐',
                'shuaxin'           => '刷新',
                'zhiding'           => '置顶',
                'dashang'           => '打赏',
                'liwu'              => '礼物',
                'baozhangjin'       => '保障金',
                'hehuorenruzhu'     => '合伙人入驻',
                'jiacu'             => '加粗',
                'jiahong'           => '加红',
                'fabuxinxi'         => '发布信息',
                'maidan'            => '买单',
                'xiaofei'           => '消费',
                'yongjin'           => '佣金',
                'fufeiyuedu'        => '付费阅读',
                'jifenduihuan'      => '积分兑换',
                'peifu'             => '赔付',
                'tuikuan'           => '退款',
                'shangpinxiaoshou'  => '商品销售',
                'yonghujili'        => '信息激励',
                'payPhone'          => '付费看电话'
            );
            $leimusql = $dsql->SetQuery("SELECT `ctype`,count(`id`) allnum FROM `#@__member_money` WHERE `ctype` !='' AND `ctype` != '0' GROUP BY `ctype`");
            $leimures = $dsql->dsqlOper($leimusql, 'results');

            $leimuarr = array();
            if ($leimures) {
                foreach ($leimures as $k => $v) {
                    $leimuarr[$k]['ctype']   = $v['ctype'];
                    $leimuarr[$k]['allnum']  = $v['allnum'];
                    $leimuarr[$k]['ctypename']  = $v['ctype'] != '' ? $leimuallarr[$v['ctype']] : " ";
                }
            }
        } else {
            $leimuarr = array(
                'qiandao'  => '签到',
                'zengsong' => '赠送',
                'xiaofei'  => '消费',
                'duihuan'  => '兑换',
                'chakanjianli' => '查看简历',
                'tuihui'   => '退回'
            );
        }


        $moduleList = array();
        $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name`, `subnav` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `parentid` != 0 ORDER BY `weight`");
        $result = $dsql->dsqlOper($sql, "results");
        if ($result) {
            foreach ($result as $f_key => $f_val) {
                $moduleList[$f_key]['menuName'] = $f_val['subject'] ? $f_val['subject'] : $f_val['title'];
                $moduleList[$f_key]['menuId']   = $f_val['name'];
            }
        }

        $huoniaoTag->assign('moduleList', $moduleList);
        $huoniaoTag->assign('leimuarr', $leimuarr);
    }

    if ($action == "recordDetail") {
        if ($recordid) {
            $detailHandels = new handlers("member", "recordDetail");
            $detailConfig  = $detailHandels->getHandle($recordid);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info']; //print_R($detailConfig);exit;
                if (is_array($detailConfig)) {
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }

                $leimuallarr = array(
                    'chongzhi'          => '充值',
                    'tixian'            => '提现',
                    'huiyuanshengji'    => '会员升级',
                    'shangjiaruzhu'     => '商家入驻',
                    'jingjirentaocan'   => '经纪人套餐',
                    'shuaxin'           => '刷新',
                    'zhiding'           => '置顶',
                    'dashang'           => '打赏',
                    'liwu'              => '礼物',
                    'baozhangjin'       => '保障金',
                    'hehuorenruzhu'     => '合伙人入驻',
                    'jiacu'             => '加粗',
                    'jiahong'           => '加红',
                    'fabuxinxi'         => '发布信息',
                    'maidan'            => '买单',
                    'xiaofei'           => '消费',
                    'yongjin'           => '佣金',
                    'fufeiyuedu'        => '付费阅读',
                    'jifenduihuan'      => '积分兑换',
                    'peifu'             => '赔付',
                    'tuikuan'           => '退款',
                    'shangpinxiaoshou'  => '商品销售'
                );
                $huoniaoTag->assign('leimuallarr', $leimuallarr);
                global $cfg_pointName;
                $huoniaoTag->assign('cfg_pointName', $cfg_pointName);
            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
        }
    }

    if ($action == "billDetail") {
        $id = $_GET['id'];
        if ($id) {
            $detailHandels = new handlers("member", "billDetail");
            $detailConfig  = $detailHandels->getHandle($id);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                if (is_array($detailConfig)) {
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html?from=billDetail");
            }
        }
    }

    if ($action == "consumeDetail") {
        $userLogin->checkUserIsLogin();
        if ($recordid) {
            $detailHandels = new handlers("member", "consumeDetail");
            $detailConfig  = $detailHandels->getHandle($recordid);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info']; //print_R($detailConfig);exit;
                if (is_array($detailConfig)) {
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }

                $leimuallarr = array(
                    'chongzhi'          => '充值',
                    'tixian'            => '提现',
                    'huiyuanshengji'    => '会员升级',
                    'shangjiaruzhu'     => '商家入驻',
                    'jingjirentaocan'   => '经纪人套餐',
                    'shuaxin'           => '刷新',
                    'zhiding'           => '置顶',
                    'dashang'           => '打赏',
                    'liwu'              => '礼物',
                    'baozhangjin'       => '保障金',
                    'hehuorenruzhu'     => '合伙人入驻',
                    'jiacu'             => '加粗',
                    'jiahong'           => '加红',
                    'fabuxinxi'         => '发布信息',
                    'maidan'            => '买单',
                    'xiaofei'           => '消费',
                    'yongjin'           => '佣金',
                    'fufeiyuedu'        => '付费阅读',
                    'jifenduihuan'      => '积分兑换',
                    'peifu'             => '赔付',
                    'tuikuan'           => '退款',
                    'shangpinxiaoshou'  => '商品销售'
                );
                $huoniaoTag->assign('leimuallarr', $leimuallarr);
                global $cfg_pointName;
                $huoniaoTag->assign('cfg_pointName', $cfg_pointName);
            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
        }
    }


    if ($action == "consumebill") {
        $userLogin->checkUserIsLogin();
        $moduleList = array();
        $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name`, `subnav` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `parentid` != 0 ORDER BY `weight`");
        $result = $dsql->dsqlOper($sql, "results");
        if ($result) {
            foreach ($result as $f_key => $f_val) {
                $moduleList[$f_key]['menuName'] = $f_val['subject'] ? $f_val['subject'] : $f_val['title'];
                $moduleList[$f_key]['menuId']   = $f_val['name'];
            }
        }

        $huoniaoTag->assign('moduleList', $moduleList);
    }
    //会员中心新发布页面
    if ($action == 'fabuJoin_touch_popup_3.4') {
        //预览
        $sql = $dsql->SetQuery("SELECT `config`, `children`,`browse`,`title` FROM `#@__site_config` WHERE `type` = '' OR `type` = 'fabu'");
        $result = $dsql->dsqlOper($sql, "results");
        if (!empty($result) && !empty($result[0]['config']) && !empty($result[0]['children'])) {
            if ($preview == 1) {
                $fabuModuleList = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                if (!$fabuModuleList) {
                    $huoniaoTag->assign('fabuModuleConfig', $result[0]['config'] ? unserialize($result[0]['config']) : '');
                    $huoniaoTag->assign('fabuModuleChildren', $result[0]['children'] ? unserialize($result[0]['children']) : '');
                    $huoniaoTag->assign('title', $result[0]['title'] ? unserialize($result[0]['title']) : '');
                } else {
                    $huoniaoTag->assign('fabuModuleConfig', $fabuModuleList['config'] ? $fabuModuleList['config'] : '');
                    $huoniaoTag->assign('fabuModuleChildren', $fabuModuleList['customChildren'] ? $fabuModuleList['customChildren'] : '');
                    $huoniaoTag->assign('title', $fabuModuleList['title'] ? $fabuModuleList['title'] : '');
                }
            } else {
                $huoniaoTag->assign('fabuModuleConfig', $result[0]['config'] ? unserialize($result[0]['config']) : '');
                $huoniaoTag->assign('fabuModuleChildren', $result[0]['children'] ? unserialize($result[0]['children']) : '');
                $huoniaoTag->assign('title', $result[0]['title'] ? unserialize($result[0]['title']) : '');
            }
        } else {
            $infoarr = fabuJoin();

            $huoniaoTag->assign('fabuModuleConfig', $infoarr['config'] ? $infoarr['config'] : '');
            $huoniaoTag->assign('fabuModuleChildren', $infoarr['children'] ? $infoarr['children'] : '');
            $huoniaoTag->assign('title', $infoarr['title'] ? $infoarr['title'] : '');
        }
    }

    //会员中心新发布页面
    if ($action == 'fabuJoin_touch_popup_3.4') {
        //预览
        $sql = $dsql->SetQuery("SELECT `config`, `children`,`browse`,`title` FROM `#@__site_config` WHERE `type` = '' OR `type` = 'fabu'");
        $result = $dsql->dsqlOper($sql, "results");
        if ($preview == 1) {
            $fabuModuleList = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
            if (!$fabuModuleList) {
                $huoniaoTag->assign('fabuModuleConfig', $result[0]['config'] ? unserialize($result[0]['config']) : '');
                $huoniaoTag->assign('fabuModuleChildren', $result[0]['children'] ? unserialize($result[0]['children']) : '');
                $huoniaoTag->assign('title', $result[0]['title'] ? unserialize($result[0]['title']) : '');
            } else {
                $huoniaoTag->assign('fabuModuleConfig', $fabuModuleList['config'] ? $fabuModuleList['config'] : '');
                $huoniaoTag->assign('fabuModuleChildren', $fabuModuleList['customChildren'] ? $fabuModuleList['customChildren'] : '');
                $huoniaoTag->assign('title', $fabuModuleList['title'] ? $fabuModuleList['title'] : '');
            }
        } else {
            $huoniaoTag->assign('fabuModuleConfig', $result[0]['config'] ? unserialize($result[0]['config']) : '');
            $huoniaoTag->assign('fabuModuleChildren', $result[0]['children'] ? unserialize($result[0]['children']) : '');
            $huoniaoTag->assign('title', $result[0]['title'] ? unserialize($result[0]['title']) : '');
        }
    }

    //会员中心新发布页面-电脑端
    if ($action == 'publish') {
        //预览
        $sql = $dsql->SetQuery("SELECT `config`, `children`,`browse`,`title` FROM `#@__site_config` WHERE `type` = 'fabuPc'");
        $result = $dsql->dsqlOper($sql, "results");
        if ($preview == 1) {
            $fabuModuleList = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
            if (!$fabuModuleList) {
                $huoniaoTag->assign('fabuModuleConfig', $result[0]['config'] ? unserialize($result[0]['config']) : '');
                $huoniaoTag->assign('fabuModuleChildren', $result[0]['children'] ? unserialize($result[0]['children']) : '');
                $huoniaoTag->assign('title', $result[0]['title'] ? unserialize($result[0]['title']) : '');
            } else {
                $huoniaoTag->assign('fabuModuleConfig', $fabuModuleList['config'] ? $fabuModuleList['config'] : '');
                $huoniaoTag->assign('fabuModuleChildren', $fabuModuleList['customChildren'] ? $fabuModuleList['customChildren'] : '');
                $huoniaoTag->assign('title', $fabuModuleList['title'] ? $fabuModuleList['title'] : '');
            }
        } else {
            $huoniaoTag->assign('fabuModuleConfig', $result[0]['config'] ? unserialize($result[0]['config']) : '');
            $huoniaoTag->assign('fabuModuleChildren', $result[0]['children'] ? unserialize($result[0]['children']) : '');
            $huoniaoTag->assign('title', $result[0]['title'] ? unserialize($result[0]['title']) : '');
        }
    }

    if ($action == "consume") {
        $userLogin->checkUserIsLogin();
        global  $userLogin;
        $userid = $userLogin->getMemberID();
        $bonus  = $userLogin->getMemberInfo($userid);
        $bonus  = $bonus['bonus'];
        $BeginDate                  = date('Y-m-01', strtotime(date("Y-m-d"))); //本月第一天
        $overDate                   = date('Y-m-d', strtotime("$BeginDate +1 month -1 day")); //本月最后一天
        $overDate                   = GetMkTime($overDate);  //本月第一天
        $BeginDate                  = GetMkTime($BeginDate);  //本月最后一天
        //查询本月消费金使用情况
        $Sumsql = $dsql->SetQuery("SELECT SUM(`amount`)bonusPrice FROM `#@__member_bonus` WHERE `userid` = '$userid'  AND `date` >= $BeginDate AND `date` <= $overDate AND `type` = 0");
        $bonusSum = $dsql->dsqlOper($Sumsql, "results");
        $usebonus            = (float)$bonusSum[0]['bonusPrice'];                     //本月已用消费金
        //额度;
        $configPay = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
        $Payconfig = $dsql->dsqlOper($configPay, "results");
        $monBonus = 0;
        if ($Payconfig) {
            $monBonus = unserialize($Payconfig[0]['pay_config']);
            $monBonus = $monBonus[0]['value'];
        }
        $surplusbonus        = sprintf("%.2f", $monBonus - (float)$bonusSum[0]['bonusPrice']);                     //本月剩余消费金额度
        //查询退回的订单
        $tui = $dsql->SetQuery("SELECT SUM(`amount`)amount  FROM `#@__member_bonus` WHERE `userid` = '$userid' AND `date` >= $BeginDate AND `date` <= $overDate  AND `info` like '%消费金退款%' ");
        $tuisql = $dsql->dsqlOper($tui, "results");
        $usebonus    -= $tuisql[0]['amount'] ? $tuisql[0]['amount'] : 0;
        $surplusbonus  += $tuisql[0]['amount'] ? $tuisql[0]['amount'] : 0;
        $huoniaoTag->assign('surplusbonus', $surplusbonus);
        $huoniaoTag->assign('usebonus', $usebonus);
        $huoniaoTag->assign('bonus', $bonus);

        //使用规则
        $huoniao_bonus_rule = '';
        $sql = $dsql->SetQuery("SELECT `body` FROM `#@__site_singellist` WHERE `title` = '消费金使用规则' ORDER BY `id` DESC LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $huoniao_bonus_rule = $ret[0]['body'];
        }
        $huoniaoTag->assign('huoniao_bonus_rule', $huoniao_bonus_rule);
    }



    // 移动端新版登陆注册页
    if (strpos($action, "login_touch_popup") !== false || $action == "connect") {
        global $cfg_seccodestatus;
        global $cfg_regstatus;
        global $cfg_regclosemessage;
        global $cfg_seccodetype;
        global $cfg_regtype;
        global $cfg_regfields;
        if ($cfg_regstatus == 0) {
            // die($cfg_regclosemessage);
        }


        // 绑定第三方账号
        if ($template == "connect") {
            $userLogin->checkUserIsLogin();

            $sameConnData = GetCookie('sameConnData');
            DropCookie('sameConnData');
            $huoniaoTag->assign('sameConnData', $sameConnData);
        }

        if (strpos($action, "login_touch_popup") !== false) {
            $outer = GetCookie("outer");
            if ($outer) {
                $file = HUONIAOROOT . "/api/private/" . $outer . "/" . $outer . ".class.php";
                if (is_file($file)) {
                    $outerObj = new $outer();
                    if (method_exists($outerObj, "listenLogin")) {
                        $outerObj->listenLogin($url, true);
                    }
                }
            }
        }

        $huoniaoTag->assign('cfg_regstatus', $cfg_regstatus);
        $huoniaoTag->assign('cfg_regclosemessage', $cfg_regclosemessage);

        $seccodestatus = explode(",", $cfg_seccodestatus);
        $regCode = "";
        if (in_array("reg", $seccodestatus)) {
            $regCode = 1;
        }
        $huoniaoTag->assign('regCode', $regCode);

        $huoniaoTag->assign('cfg_seccodetype', $cfg_seccodetype);
        $regtypeArr = explode(",", $cfg_regtype);
        //用来判断表单是否显示
        if (!empty($regtypeArr)) {
            $type = $regtypeArr[0] == 1 ? 1 : ($regtypeArr[0] == 2 ? 3 : 2);
            $huoniaoTag->assign('regable', $type);
        }
        $huoniaoTag->assign('regtypeArr', $regtypeArr);
        //会员注册字段
        $fieldsArr = explode(",", $cfg_regfields);
        $huoniaoTag->assign('fieldsArr', $fieldsArr);



        global $cfg_secqaastatus;
        $secqaastatus = explode(",", $cfg_secqaastatus);
        $regQa = "";
        if (in_array("reg", $secqaastatus)) {
            $regQa = 1;
        }
        $huoniaoTag->assign('regQa', $regQa);

        //随机选择一条问题
        $archives = $dsql->SetQuery("SELECT * FROM `#@__safeqa` ORDER BY RAND() LIMIT 1");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $huoniaoTag->assign('question', $results[0]['id']);
            $huoniaoTag->assign('regQuestion', $results[0]['question']);
        }


        //支付宝APP登录参数
        $alipay_app_login = array();

        $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
        $is_app = preg_match("/huoniao/", $useragent) ? 1 : 0;
        if ($is_app) {
            $sql = $dsql->SetQuery("SELECT `code`, `config` FROM `#@__site_loginconnect` WHERE `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $key => $value) {
                    if ($value['code'] == 'alipay') {
                        $config = unserialize($value['config']);

                        $configArr = array();
                        foreach ($config as $k => $v) {
                            $configArr[$v['name']] = $v['value'];
                        }

                        if ($configArr['appPrivate']) {
                            $rsaPrivateKey = $configArr['appPrivate'];

                            //公共参数
                            $alipay_app_login['apiname'] = 'com.alipay.account.auth';
                            $alipay_app_login['method'] = 'alipay.open.auth.sdk.code.get';
                            $alipay_app_login['app_id'] = $configArr['appid'];
                            $alipay_app_login['app_name'] = 'mc';
                            $alipay_app_login['biz_type'] = 'openservice';
                            $alipay_app_login['pid'] = $configArr['partner'];
                            $alipay_app_login['product_id'] = 'APP_FAST_LOGIN';
                            $alipay_app_login['scope'] = 'kuaijie';
                            $alipay_app_login['target_id'] = create_ordernum();
                            $alipay_app_login['auth_type'] = 'AUTHACCOUNT';   //AUTHACCOUNT代表授权；LOGIN代表登录
                            $alipay_app_login['sign_type'] = 'RSA2';
                            ksort($alipay_app_login);

                            $paramStr = "";
                            $paramStr_ = "";
                            foreach ($alipay_app_login as $key => $val) {
                                $paramStr .= $key . "=" . $val . "&";   //生成sign不需要encode
                                $paramStr_ .= $key . "=" . urlencode($val) . "&";   //最终输出需要encode
                            }

                            $paramStr = substr($paramStr, 0, -1);
                            $paramStr_ = substr($paramStr_, 0, -1);

                            //获取sign
                            $res = "-----BEGIN RSA PRIVATE KEY-----\n" .
                                wordwrap($rsaPrivateKey, 64, "\n", true) .
                                "\n-----END RSA PRIVATE KEY-----";
                            openssl_sign($paramStr, $sign, $res, OPENSSL_ALGO_SHA256);
                            $sign = urlencode(base64_encode($sign));

                            $alipay_app_login['sign'] = $sign;
                        }
                    }
                }
            }
        }
        $huoniaoTag->assign('alipay_app_login', json_encode($alipay_app_login));

        return;

        // 移动端信息发布及入驻商家页面
    } elseif ($action == "enter" || $action == "enter_contrast" || $action == "enter_single" || $action == "join_renew" || $action == "join_upgrade") {
        
        //商家功能开关
        $business_state = 1;  //0禁用  1启用
        $businessInc = HUONIAOINC . "/config/business.inc.php";
        if(file_exists($businessInc)){
            require($businessInc);
            $business_state = (int)$customBusinessState;  //配置文件中 0表示启用  1表示禁用  因为默认要开启商家功能
            $business_state = intval(!$business_state);
        }
        if(!$business_state){
            ShowMsg('系统未开启商家服务！', getUrlPath(array("service" => "member", "type" => "user")), 1);
            die;
        }

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {

            global $cfg_staticPath;
            global $cfg_staticVersion;
            $url = $cfg_secureAccess . $cfg_basehost;

            if (isApp()) {
                $html = <<<eot
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0">
    <title></title>
    <link rel="stylesheet" type="text/css" href="{$cfg_staticPath}css/core/touchBase.css?v=$cfg_staticVersion">
    <script src="{$cfg_staticPath}js/core/touchScale.js?v=$cfg_staticVersion"></script>
    <script src="{$cfg_staticPath}js/core/zepto.min.js?v=$cfg_staticVersion"></script>
    <style>
        html, body {height: 100%; background: rgba(0, 0, 0, .2);}
        .popup {position: fixed; width: 4.7rem; left: 50%; top: 50%; margin: -2.75rem 0 0 -2.35rem; padding: .5rem 0; background: #fff; border-radius: 4px; text-align: center;}
        .popup h3 {font-size: .3rem;}
        .popup img {width: 1rem; height: 1rem; display: block; margin: .3rem auto;}
        .popup a {width: 2.45rem; height: .58rem; display: block; margin: 0 auto; line-height: .58rem; color: #fff; font-size: .26rem; border-bottom: 5px solid #fcb0a4; border-radius: 4px; background-color: rgb(248, 63, 33);}
    </style>
    <script>
        window.open("{$url}/login.html");
    </script>
</head>
<body>
    <div class="popup">
        <h3>您还未登录，请先登录</h3>
        <img src="{$cfg_staticPath}images/login_tip_icon.png" />
        <a href="{$url}/login.html">立即登录</a>
    </div>
<script>
$(function(){
    //客户端登录验证
    if (device.indexOf('huoniao') > -1) {
        setupWebViewJavascriptBridge(function(bridge) {
            //未登录状态下，隔时验证是否已登录，如果已登录，则刷新页面
            var userid = $.cookie("HN_login_user");
            if(userid == null || userid == ""){
                var timer = setInterval(function(){
                    userid = $.cookie("HN_login_user");
                    if(userid){
                        $.ajax({
                            url: '/getUserInfo.html',
                            type: "get",
                            async: false,
                            dataType: "jsonp",
                            success: function (data) {
                                if(data){
                                    clearInterval(timer);
                                    bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo, 'dating_uid': data.dating_uid}, function(){});
                                    bridge.callHandler('pageReload', {}, function(responseData){});
                                }
                            }
                        });

                        // location.reload();
                    }
                }, 500);
            }else if($('.nlogin').size() > 0){
                location.reload();
            }
        })
    }
});
</script>
</body>
</html>
eot;
                echo $html;
                //                header("location:" . $url . '/login.html');
                die;
            } else {
                header("location:" . $url . '/login.html');
                die;
            }
        }

        // 判断是否已入驻
        // $sql = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE `uid` = $userid");
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret){
        //  if($ret[0]['state'] != 4){
        //      $huoniaoTag->assign("has_joinBusiness", 1);
        //
        //      if($action == "enter"){
        //          $param = array(
        //              "service" => "member",
        //          );
        //          header("location:".getUrlPath($param));
        //          die;
        //      }
        //  }
        //
        //  if($action == "join_renew" || $action == "join_upgrade"){
        //      if($ret[0]['state'] == 4){
        //          $url = $cfg_secureAccess.$cfg_basehost;
        //          header("location:".$url);
        //          die;
        //      }
        //      if($action == "join_upgrade" && $ret[0]['type'] == 2){
        //          $param = array(
        //              "service" => "member",
        //              "template" => "join_renew",
        //          );
        //          $url = getUrlPath($param);
        //          header("location:".$url);
        //          die;
        //      }
        //  }
        //
        //  global $data;
        //  $data = "";
        //  $typeArr = getParentArr("business_type", $ret[0]['typeid']);
        //  $typeArr = array_reverse(parent_foreach($typeArr, "typename"));
        //  $ret[0]['typeArr'] = join(" ", $typeArr);
        //  $huoniaoTag->assign("detail", $ret[0]);
        //
        //
        // }else{
        //  if($action == "join_renew" || $action == "join_upgrade"){
        //      $param = array(
        //          "service" => "member",
        //          "type" => "user",
        //          "template" => "enter",
        //      );
        //      header("location:".getUrlPath($param)."#join");
        //      die;
        //  }
        // }

        // $busiHandlers = new handlers("business", "config");
        // $busiConfig = $busiHandlers->getHandle();
        //
        // $busiConfig = is_array($busiConfig) ? $busiConfig['info'] : array();
        //
        // $allModuleArr = array();
        // $sql = $dsql->SetQuery("SELECT `name`, `title`, `subject` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `parentid` != 0");
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret){
        //  foreach ($ret as $key => $value) {
        //      $allModuleArr[$value['name']] = $value['subject'] ? $value['subject'] : $value['title'];
        //      }
        // }
        // $allStoreArr = array(
        //  "info" => $langData['siteConfig'][34][41],//二手店铺
        //  "shop" => $langData['siteConfig'][34][12],//商城店铺
        //  "tuan" => $langData['siteConfig'][34][13],//团购店铺
        //  "waimai" => $langData['siteConfig'][34][14],//外卖店铺
        //  "house" => $langData['siteConfig'][34][26],//房产中介
        //  "job" => $langData['siteConfig'][34][15],//招聘企业
        //  "dating" => $langData['siteConfig'][34][16],//婚恋门店
        //  "renovation" => $langData['siteConfig'][34][27],//装修公司
        //  "huangye" => $langData['siteConfig'][34][17],//黄页店铺
        //  "huodong" => $langData['siteConfig'][34][18],//活动店铺
        //  "car" => $langData['siteConfig'][34][19],//汽车店铺
        //  "homemaking" => $langData['homemaking'][10][29],//家政公司
        //  "marry" => $langData['marry'][5][0],//婚假公司
        //  "travel" => $langData['travel'][12][12],//旅游公司
        //  "education" => $langData['education'][7][4],//教育公司
        //  "pension" => $langData['pension'][0][0],//养老机构
        //
        // );
        // $autyTitle = array(
        //  "basic" => $langData['siteConfig'][34][20],//店铺基础信息
        //  "thumb" => $langData['siteConfig'][34][21],//相册/视频展示
        //  "custom" => $langData['siteConfig'][34][22],//自定义单页/背景音乐
        //  "newMedia" => $langData['siteConfig'][34][23],//720全景/互动直播
        //  "website" => $langData['siteConfig'][34][24],//企业官网
        //  "miniprogram" => $langData['siteConfig'][34][25],//店铺独立小程序
        // );
        //
        // $joinAuth = $busiConfig['joinAuth'];
        // foreach ($joinAuth as $key => $value) {
        //  if($key == "module" || $key == "store"){
        //      foreach ($value as $k => $v) {
        //          if($key == "module"){
        //              $title = $allModuleArr[$k];
        //          }else{
        //              $title = $allStoreArr[$k];
        //          }
        //          $joinAuth[$key][$k]['title'] = $title;
        //          $joinAuth[$key][$k]['type1'] = !isset($v['perm']) || array_search("1", $v['perm']) === false ? 0 : 1;
        //          $joinAuth[$key][$k]['type2'] = !isset($v['perm']) || array_search("2", $v['perm']) === false ? 0 : 1;
        //      }
        //  }else{
        //      $title = $autyTitle[$key];
        //      $joinAuth[$key]['title'] = $title;
        //      $joinAuth[$key]['type1'] = !isset($value['perm']) || array_search("1", $value['perm']) === false ? 0 : 1;
        //      $joinAuth[$key]['type2'] = !isset($value['perm']) || array_search("2", $value['perm']) === false ? 0 : 1;
        //  }
        // }
        // $busiConfig['joinAuth'] = $joinAuth;

        //单行业入驻
        if ($action == "enter_single") {
            $huoniaoTag->assign('module', $module);
        }
        $huoniaoTag->assign('package', (int)$package);


        //商家服务详情
    } elseif ($action == "servicemeal") {

        //验证登录状态
        $userLogin->checkUserIsLogin();

        //提取未开通的服务
        global $cfg_BusinessJoinConfig;
        $businessConfig = $cfg_BusinessJoinConfig;
        $userinfo = $userLogin->getMemberInfo();

        $notOpenModules = array();
        $notOpenModules['privilege'] = array();  //未开通的商家服务
        $notOpenModules['store'] = array();  //未开通的行业特权

        $userModules = $memberPackage['package']['modules'];  //会员已开通
        $userItems = $memberPackage['package']['item'];

        //店铺特权
        $already = array();
        if ($userModules['privilege']) {
            foreach ($userModules['privilege'] as $key => $value) {
                array_push($already, $value['name']);
            }
        }
        foreach ($businessConfig['privilege'] as $key => $value) {
            if (!in_array($key, $already)) {
                $value['name'] = $key;
                $notOpenModules['privilege'][] = $value;
            }
        }

        //行业特权
        $already = array();
        if ($userModules['store']) {
            foreach ($userModules['store'] as $key => $value) {
                array_push($already, $value['name']);
            }
        }

        foreach ($businessConfig['store'] as $key => $value) {
            if (!in_array($key, $already)) {
                $value['name'] = $key;
                $notOpenModules['store'][] = $value;
            }
        }
        $huoniaoTag->assign('notOpenModules', $notOpenModules);



        //入驻支付页面
    } elseif ($action == "enter_pay") {

        if ($ordernum) {

            $businessID = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid ORDER BY `id` DESC");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $businessID = $ret[0]['id'];
            }

            //查询订单信息
            $sql = $dsql->SetQuery("SELECT `bid`, `totalprice`, `date`, `package` FROM `#@__business_order` WHERE `state` = 0 AND `bid` = $businessID AND `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $bid = $ret[0]['bid'];
                $totalprice = $ret[0]['totalprice'];
                $date = $ret[0]['date'];
                $package = $ret[0]['package'] ? unserialize($ret[0]['package']) : array();

                $huoniaoTag->assign('ordernum', $ordernum);
                $huoniaoTag->assign('package', $package);

                if ($package['package'] == -1) {
                    $huoniaoTag->assign('packageName', $langData['business'][0][37]); //自选套餐
                } else {
                    global $cfg_BusinessJoinConfig;
                    $businessConfig = $cfg_BusinessJoinConfig;
                    $packageArr = $businessConfig['package'][$package['package']];
                    if ($packageArr) {

                        $huoniaoTag->assign('packageName', $packageArr['title']);

                        //没有查到套餐，跳回入驻页
                    } else {
                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "enter",
                        );
                        header("location:" . getUrlPath($param));
                        die;
                    }
                }

                $huoniaoTag->assign('bid', $bid);
                $huoniaoTag->assign('totalprice', $totalprice);
                $huoniaoTag->assign('date', ($date + 1800) - time());

                //没有查到订单，跳回入驻页
            } else {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "enter",
                );
                header("location:" . getUrlPath($param));
                die;
            }

            //没有订单号，跳回入驻页
        } else {
            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "enter",
            );
            header("location:" . getUrlPath($param));
            die;
        }


        //登录页面
    } elseif ($action == "login" || $action == "login_popup") {

        $url = $furl ? urldecode($furl) : ($path ? urldecode($path) : $_SERVER['HTTP_REFERER']);
        if (strstr($url, "logout.html") || strstr($url, "login.html") || empty($url)) {
            $url = $cfg_secureAccess . $cfg_basehost;
        }

        $indexUrl = $cfg_secureAccess . $cfg_basehost;
        if (strstr($url, "security.html") || $url == $indexUrl) {
            $param = array("service" => "member",   "type" => "user");
            $url = getUrlPath($param);     //个人会员域名
        }

        $url = strip_tags($url);

        //如果是从小程序端过来的登录请求，这里强制退出，不然会出现跳转到404页面的问题
        if(isset($_GET['wxMiniProgramLogin']) && $wxMiniProgramLogin == 1){
            $userLogin->exitMember();
        }

        //检验用户登录状态
        if ($userLogin->getMemberID() > -1) {

            $urlArr = parse_url($url);
            $host = $urlArr['host'];

            if ($_SERVER['HTTP_HOST'] != $host) {
                //header('location:'.$cfg_secureAccess.$host.'/index.php?service=member&template=ssoUserRedirect&site='.$host.'&furl='.$url);
                //die;
            }

            if ($action == "login") {
                header('location:' . $url);
            }

            $huoniaoTag->assign('isLogin', 1);
        }

        global $cfg_seccodestatus;
        $seccodestatus = explode(",", $cfg_seccodestatus);
        $loginCode = "";
        if (in_array("login", $seccodestatus)) {
            $loginCode = 1;
        }
        $huoniaoTag->assign('loginCode', $loginCode);
        $huoniaoTag->assign("redirectUrl", urlencode(htmlspecialchars($url)));
        $huoniaoTag->assign('site', htmlspecialchars($site));

        global $cfg_agreeProtocol;
        $huoniaoTag->assign('cfg_agreeProtocol', (int)$cfg_agreeProtocol);

        putSession('loginRedirect', $url);

        $outer = GetCookie("outer");
        if ($outer) {
            $file = HUONIAOROOT . "/api/private/" . $outer . "/" . $outer . ".class.php";
            if (is_file($file)) {
                $outerObj = new $outer();
                if (method_exists($outerObj, "listenLogin")) {
                    $outerObj->listenLogin($url);
                }
            }
        }

        //支付宝APP登录参数
        $alipay_app_login = array();

        $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
        $is_app = preg_match("/huoniao/", $useragent) ? 1 : 0;
        if ($is_app) {
            $sql = $dsql->SetQuery("SELECT `code`, `config` FROM `#@__site_loginconnect` WHERE `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $key => $value) {
                    if ($value['code'] == 'alipay') {
                        $config = unserialize($value['config']);

                        $configArr = array();
                        foreach ($config as $k => $v) {
                            $configArr[$v['name']] = $v['value'];
                        }

                        if ($configArr['appPrivate']) {
                            $rsaPrivateKey = $configArr['appPrivate'];

                            //公共参数
                            $alipay_app_login['apiname'] = 'com.alipay.account.auth';
                            $alipay_app_login['method'] = 'alipay.open.auth.sdk.code.get';
                            $alipay_app_login['app_id'] = $configArr['appid'];
                            $alipay_app_login['app_name'] = 'mc';
                            $alipay_app_login['biz_type'] = 'openservice';
                            $alipay_app_login['pid'] = $configArr['partner'];
                            $alipay_app_login['product_id'] = 'APP_FAST_LOGIN';
                            $alipay_app_login['scope'] = 'kuaijie';
                            $alipay_app_login['target_id'] = create_ordernum();
                            $alipay_app_login['auth_type'] = 'AUTHACCOUNT';   //AUTHACCOUNT代表授权；LOGIN代表登录
                            $alipay_app_login['sign_type'] = 'RSA2';
                            ksort($alipay_app_login);

                            $paramStr = "";
                            $paramStr_ = "";
                            foreach ($alipay_app_login as $key => $val) {
                                $paramStr .= $key . "=" . $val . "&";   //生成sign不需要encode
                                $paramStr_ .= $key . "=" . urlencode($val) . "&";   //最终输出需要encode
                            }

                            $paramStr = substr($paramStr, 0, -1);
                            $paramStr_ = substr($paramStr_, 0, -1);

                            //获取sign
                            $res = "-----BEGIN RSA PRIVATE KEY-----\n" .
                                wordwrap($rsaPrivateKey, 64, "\n", true) .
                                "\n-----END RSA PRIVATE KEY-----";
                            openssl_sign($paramStr, $sign, $res, OPENSSL_ALGO_SHA256);
                            $sign = urlencode(base64_encode($sign));

                            $alipay_app_login['sign'] = $sign;
                        }
                    }
                }
            }
        }
        $huoniaoTag->assign('alipay_app_login', json_encode($alipay_app_login));



        return;


        //单点登录页面
    } elseif ($action == "sso") {

        //单点登录、退出
        if ($do == "sso") {

            $userinfo = array();
            $userid = $_GET['userid'];
            if ($userid) {
                $RenrenCrypt = new RenrenCrypt();
                $uid = (int)$RenrenCrypt->php_decrypt(base64_decode($userid));
                $member = new member();
                $uinfo = $member->detail($uid, true);

                // $userinfo['uid']      = $userid;
                $userinfo['userid']   = $uinfo['userid'];
                $userinfo['userType'] = $uinfo['userType'];
                $userinfo['username'] = $uinfo['username'];
                $userinfo['nickname'] = $uinfo['nickname'];
                $userinfo['photo']    = $uinfo['photo'];
                $userinfo['message']  = $uinfo['message'];
                $userinfo['userid_encode']  = $uinfo['userid_encode'];

                //根据会员类型不同，返回不同的域名
                global $userDomain;
                global $busiDomain;
                $domain = $userDomain;
                if ($uinfo['userType'] == 2) {
                    $domain = $busiDomain;
                }
                $userinfo['userDomain'] = $domain;

                $userinfo = json_encode($userinfo);
            }
            $huoniaoTag->assign('do', $do);
            $huoniaoTag->assign('userArr', $userinfo ? $userinfo : '');
        } else {

            //获取主站用户信息
            $userid = "";
            $mid = $userLogin->getMemberID();
            if ($mid > -1) {
                $RenrenCrypt = new RenrenCrypt();
                $userid = base64_encode($RenrenCrypt->php_encrypt($mid));
            }

            $huoniaoTag->assign('site', $site);
            $huoniaoTag->assign('userid', $userid);
        }
        return;
    } elseif ($action == "ssoUserRedirect") {
        $huoniaoTag->assign('site', $site);
        $huoniaoTag->assign('furl', $furl);


        //单点登录页面，会员绑定独立域名专用
    } elseif ($action == "ssoUser") {

        //单点登录、退出
        if ($do == "sso") {

            $userinfo = "";
            $userid = (int)$_GET['userid'];
            if ($userid) {
                $RenrenCrypt = new RenrenCrypt();
                $uid = $RenrenCrypt->php_decrypt(base64_decode($userid));
                $member = new member();
                $uinfo = $member->detail($uid, true);

                //              $userinfo['uid']      = $userid;
                $userinfo['uid']      = $uinfo['userid_encode'];
                $userinfo['userid']   = $uinfo['userid'];
                $userinfo['userType'] = $uinfo['userType'];
                $userinfo['username'] = $uinfo['username'];
                $userinfo['nickname'] = $uinfo['nickname'];
                $userinfo['photo']    = $uinfo['photo'];
                $userinfo['message']  = $uinfo['message'];

                //根据会员类型不同，返回不同的域名
                global $userDomain;
                global $busiDomain;
                $domain = $userDomain;
                if ($uinfo['userType'] == 2) {
                    $domain = $busiDomain;
                }
                $userinfo['userDomain'] = $domain;

                $userinfo = json_encode($userinfo);
            }
            $huoniaoTag->assign('do', $do);
            $huoniaoTag->assign('userArr', $userinfo);
        } else {

            //获取主站用户信息
            $userid = "";
            $mid = $userLogin->getMemberID();
            if ($mid > -1) {
                $RenrenCrypt = new RenrenCrypt();
                $userid = base64_encode($RenrenCrypt->php_encrypt($mid));
            }

            $huoniaoTag->assign('site', $site);
            $huoniaoTag->assign('userid', $userid);
        }
        return;


        //判断登录
    } elseif ($action == "loginCheck") {

        //判断是否提交
        if (empty($_REQUEST)) {
            header('location:' . $cfg_secureAccess . $cfg_basehost);
            die();
        }

        //检验用户登录状态
        // if($userLogin->getMemberID() > -1){

        //     echo '<span style="display:none;">1001</span>';
        //     die;

        // }else{

        //判断验证码
        global $cfg_seccodestatus;
        $seccodestatus = explode(",", $cfg_seccodestatus);
        if (in_array("login", $seccodestatus)) {
            if (strtolower($vericode) != $_SESSION['huoniao_vdimg_value']) {
                if ($platform == 'app') {
                    die(json_encode(array('state' => 200, 'info' => $langData['siteConfig'][21][222])));
                } else {
                    echo "202|" . $langData['siteConfig'][21][222];  //验证码输入错误，请重试！
                }
                die;
            }
        }

        $ip = GetIP();
        $ipaddr = getIpAddr($ip);
        $archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
        $results = $dsql->dsqlOper($archives, "results");

        //登录前验证
        if ($results) {
            $count = $results[0]['count'];
            $timedifference = GetMkTime(time()) - $results[0]['date'];
            if ($timedifference / 60 < $loginTimes && $count >= $loginCount && $loginCount > 0 && $loginTimes > 0) {
                if ($platform == 'app') {
                    die(json_encode(array(
                        'state' => 201,
                        'info' => str_replace('1', ceil($loginTimes - $timedifference / 60), $langData['siteConfig'][21][223]),
                        'second' => (ceil($loginTimes - $timedifference / 60) * 60)
                    )));
                } else {
                    echo '201|' . str_replace('1', ceil($loginTimes - $timedifference / 60), $langData['siteConfig'][21][223]);  //您错误的次数太多，请1分钟后重试！
                }
                die;
            }
        }

        $res = $userLogin->memberLogin($username, $password);
        //success
        if ($res == 1) {
            $userid = $userLogin->getMemberID();

            //记录当前设备s
            $sql = $dsql->SetQuery("SELECT `sourceclient` FROM `#@__member`  WHERE `id` = '$userid'");
            $client = $dsql->dsqlOper($sql, "results");
            if ($client[0]['sourceclient']) {
                $sourceclientAll = unserialize($client[0]['sourceclient']);
            }

            //苹果新版本不再传设备信息，为了使用推送功能，这里需要记录苹果设备
            $isIOSApp = isIOSApp() && !isAndroidApp();
            $deviceTitle = $isIOSApp ? 'iphone' : $deviceTitle;
            $deviceType = $isIOSApp ? 'iphone' : $deviceType;
            $deviceSerial = $isIOSApp ? 'iphone' : $deviceSerial;

            $sourceArr = array(
                "title" => $deviceTitle,
                "type"  => $deviceType,
                "serial" => $deviceSerial,
                "pudate" => time()
            );

            $sourceclients = array();
            if (!empty($deviceTitle) && !empty($deviceSerial) && !empty($deviceType)) {
                if (!empty($sourceclientAll)) {
                    $sourceclients = $sourceclientAll;
                    //$foundTitle  = array_search($deviceTitle, array_column($sourceclientAll, 'title'));
                    $foundSerial = array_search($deviceSerial, array_column($sourceclientAll, 'serial'));
                    //$foundType   = array_search($deviceType, array_column($sourceclientAll, 'type'));
                    if ($foundSerial) {
                        //如果已有，更新时间，以Serial为准
                        $sourceclients[$foundSerial]['pudate'] = time();
                    } else {
                        array_push($sourceclients, $sourceArr);
                    }
                } else {
                    $sourceclients[] = $sourceArr;
                }
                $sourceclients = serialize($sourceclients);

                $where_ = "`sourceclient` = '$sourceclients',";
            }
            //记录当前设备e

            //APP端和小程序端需要创建令牌
            $tokenField = $access_token = $refresh_token = "";

            $createApiTokenByPlatform = createApiTokenByPlatform($userid, $path);
            $access_token = $createApiTokenByPlatform['access_token'];
            $refresh_token = $createApiTokenByPlatform['refresh_token'];
            if((isApp() || isWxMiniprogram() || isByteMiniprogram()) && $access_token && $refresh_token){
                $_platform = getCurrentTerminal();
                $tokenField = ", `access_token_".$_platform."` = '" . urldecode($access_token) . "', `refresh_token_".$_platform."` = '" . urldecode($refresh_token) . "'";
            }

            $nowTime = GetMktime(time());

            $archives = $dsql->SetQuery("UPDATE `#@__member` SET  $where_ `logincount` = `logincount` + 1, `lastlogintime` = " . GetMkTime(time()) . ", `lastloginip` = '" . $ip . "', `lastloginipaddr` = '" . $ipaddr . "', `online` = '$nowTime' " . $tokenField . " WHERE `id` = " . $userid);
            $dsql->dsqlOper($archives, "update");

            $loginPlatform = '电脑端';
            if (isApp()) {
                $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP';
            } elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {
                if(isWxMiniprogram()){
                    $loginPlatform = '微信小程序';
                }elseif(isByteMiniprogram()){
                    $loginPlatform = '抖音小程序';
                }
            } elseif (isMobile()) {
                if (isWeixin()) {
                    $loginPlatform = '微信公众号';
                } else {
                    $loginPlatform = 'H5';
                }
            }

            //保存到主表
            $useragent = $_SERVER['HTTP_USER_AGENT'];
            $_ip = $ip . ':' . $_SERVER['REMOTE_PORT'];
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_login` (`userid`, `logintime`, `loginip`, `ipaddr`, `platform`, `useragent`) VALUES ('$userid', '" . GetMkTime(time()) . "', '$_ip', '$ipaddr', '$loginPlatform', '$useragent')");
            $dsql->dsqlOper($archives, "update");

            //记录用户行为日志
            memberLog($userid, 'member', '', 0, 'insert', '用户登录(' . $loginPlatform . ')', '', $archives);

            $userinfoArr = array();
            $userinfo = $userLogin->getMemberInfo();

            unset($userinfo['description']);


            $userinfo['access_token'] = $access_token;
            $userinfo['refresh_token'] = $refresh_token;


            $addStaff = GetCookie('addStaff');
            if (!empty($addStaff) && $userinfo['userType'] != 2) {
                /*商家添加员工*/
                $staffsql = $dsql->SetQuery("SELECT `id` FROM `#@__staff` WHERE `uid` = '$userid' ");
                $staffres = $dsql->dsqlOper($staffsql, "results");
                if (!$staffres && is_array($staffres)) {
                    $nowtime = GetMkTime(time());
                    $upstaffsql = $dsql->SetQuery("INSERT INTO `   #@__staff` (`sid`,`uid`,`pubdate`)VALUES ('$addStaff','$userid','$nowtime')");
                    $staffid = $dsql->dsqlOper($upstaffsql, "lastid");
                    DropCookie('addStaff');

                    //记录用户行为日志
                    memberLog($userid, 'member', 'staff', $staffid, 'insert', '添加员工账号', '', $upstaffsql);
                }
            }
            foreach ($userinfo as $key => $value) {
                array_push($userinfoArr, '"' . $key . '": "' . $value . '"');
            }
            if ($platform == 'app') {
                die(json_encode(array('state' => 100, 'info' => array(
                    'passport' => $userinfo['userid'],
                    'username' => $userinfo['username'],
                    'nickname' => $userinfo['nickname'],
                    'userid_encode' => $userinfo['userid_encode'],
                    'cookiePre' => $userinfo['cookiePre'],
                    'photo' => $userinfo['photo'],
                    'dating_uid' => $userinfo['dating_uid'],
                    'access_token' => $access_token,
                    'refresh_token' => $refresh_token
                ))));

                //小程序中
            } elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {

                //查询用户的unionid/openid/field_session/phone
                $sql = $dsql->SetQuery("SELECT `wechat_conn`, `wechat_mini_openid`, `wechat_mini_session`, `phone` FROM `#@__member` WHERE `id` = " . $userid);
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret || !is_array($ret)){
                    echo "202|用户信息查询失败！";die;
                }

                $data = array(
                    0 => $ret[0]['wechat_conn'],
                    1 => $ret[0]['wechat_mini_openid'],
                    2 => $ret[0]['wechat_mini_session'],
                    3 => $ret[0]['phone'],
                );

                //返回unionid、openid、session_key的加密信息，以供系统登录
                $RenrenCrypt = new RenrenCrypt();
                $key = base64_encode($RenrenCrypt->php_encrypt(join("@@@@", $data)));

                //如果path是http地址
                $url = '';
                if(strstr($path, 'http')){
                    $url = $path;
                    $path = '';
                }

                //如果路径为空，取来源页面
                if(!$path && !$url){
                    $url = $_SERVER['HTTP_REFERER'];
                }

                $_url = $cfg_secureAccess . $cfg_basehost . '/?action=wxMiniProgramLogin&key=' . $key . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&uid=' . $userid . '&path=' . $path . '&redirect=' . urlencode(preg_replace("/forcelogout/", 'loginsuccess', $url));

                $userinfoArr = json_encode(array('url' => $_url));
                $userinfoStr = '<script>var userinfo = ' . $userinfoArr . ';</script>';
                echo '<span style="display:none;">' . $userinfoStr . '100|</span>';


                // $_act = '';
                // if(isWxMiniprogram()){
                //     $_act = 'wxMiniProgramLogin';
                // }elseif(isByteMiniprogram()){
                //     $_act = 'byteMiniProgramLogin';
                // }               

                // $userinfoArr = json_encode(array('url' => $cfg_secureAccess . $cfg_basehost . '/include/json.php?action=' . $_act . '&uid=' . $userid . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&path=' . $path . '&url=' . $url));
                // $userinfoStr = '<script>var userinfo = ' . $userinfoArr . ';</script>';
                // echo '<span style="display:none;">' . $userinfoStr . '100|</span>';
            } else {
                $userinfoStr = '<script>var userinfo = {' . join(', ', $userinfoArr) . '}</script>';
                echo '<span style="display:none;">' . $userinfoStr . '100|</span>';
            }
            die;

            //error
        } else if ($res == -1 || $res == -2 || $res == -3 || $res == -4 || $res == -5) {

            //如果有记录则错误次数加1
            if ($results) {
                //计算最后一次错误是否是在$loginTimes分钟之前，如果是则重置错误次数
                if ($timedifference / 60 > $loginTimes) {
                    $count = 1;
                } else {
                    $count = $results[0]['count'] >= $loginCount ? 0 : $results[0]['count'];
                    $count++;
                }
                $archives = $dsql->SetQuery("UPDATE `#@__failedlogin` SET `count` = " . $count . ", `date` = " . GetMkTime(time()) . " WHERE `ip` = '" . $ip . "'");
                $results = $dsql->dsqlOper($archives, "update");

                //没有记录则新增一条
            } else {
                $count = 1;
                $archives = $dsql->SetQuery("INSERT INTO `#@__failedlogin` (`ip`, `count`, `date`) VALUES ('$ip', $count, " . GetMkTime(time()) . ")");
                $results = $dsql->dsqlOper($archives, "update");
            }

            if ($res == -3) {
                if ($platform == 'app') {
                    die(json_encode(array('state' => 200, 'info' => $langData['siteConfig'][21][256])));
                } else {
                    echo '201|' . $langData['siteConfig'][21][256];  //账号等待审核中，请稍候重试！
                }
            } elseif ($res == -4) {
                if ($platform == 'app') {
                    die(json_encode(array('state' => 200, 'info' => $langData['siteConfig'][21][257])));
                } else {
                    echo '201|' . $langData['siteConfig'][21][257];  //账号审核被拒绝，请联系客服处理！
                }
            } elseif ($res == -5) {
                if ($platform == 'app') {
                    die(json_encode(array('state' => 200, 'info' => $langData['siteConfig'][0][17])));
                } else {
                    echo '201|' . $langData['siteConfig'][0][17];  //账号审核被拒绝，请联系客服处理！
                }
            } else {
                if ($platform == 'app') {
                    die(json_encode(array('state' => 200, 'info' => $langData['siteConfig'][21][224])));
                } else {
                    echo '201|' . $langData['siteConfig'][21][224];  //用户名或密码错误，请重试！
                }
            }
            die;
        }
        // }
        return;

        //退出登录
    } elseif ($action == "logout") {

        $userLogin->exitMember();
        $url = $url ?: $_SERVER['HTTP_REFERER'];
        if (strstr($url, "logout.html") || strstr($url, "fpwd.html") || strstr($url, "register.html") || empty($url)) {
            $url = $cfg_secureAccess . $cfg_basehost;
        }

        //如果是通过设置页面退出的，退出后回到我的页面
        if (strstr($url, 'setting.html')) {
            $param = array("service" => "member", "type" => "user");
            $url = getUrlPath($param);
        }

        //小程序端指定跳转页面
        if (isWxMiniprogram() && $redirect) {
            $url = $redirect;
        }

        //判断是否开启论坛同步，如果开启则显示退出过程，如果没有开启，程序自动跳走
        global $cfg_bbsState;
        global $cfg_bbsType;
        if ($cfg_bbsState == 1 && $cfg_bbsType != "") {
            $huoniaoTag->assign("redirectUrl", $url);
        } elseif ($from != 'app') {
            PutCookie("logout_time", time(), 60);
            header('location:' . $url);
            die;
        }
        return;

        //注册页面
    } elseif ($action == "register") {
        //检验用户登录状态
        if ($userLogin->getMemberID() > -1) {
            global $cfg_basehost;
            $url = $cfg_secureAccess . $cfg_basehost;
            header('location:' . $url);
            die;
        }

        global $cfg_seccodestatus;
        global $cfg_regstatus;
        global $cfg_regclosemessage;
        global $cfg_seccodetype;
        global $cfg_regtype;
        global $cfg_regfields;
        if ($cfg_regstatus == 0) {
            die($cfg_regclosemessage);
        }

        $seccodestatus = explode(",", $cfg_seccodestatus);
        $regCode = "";
        if (in_array("reg", $seccodestatus)) {
            $regCode = 1;
        }
        $huoniaoTag->assign('regCode', $regCode);

        $huoniaoTag->assign('cfg_seccodetype', $cfg_seccodetype);

        //新版三种方式不可以同时显示
        if ($cfg_regtype == '1,2,3') {
            $cfg_regtype = '2,3';
        }

        $regtypeArr = explode(",", $cfg_regtype);
        //用来判断表单是否显示
        if (!empty($regtypeArr)) {
            $type = $regtypeArr[0] == 1 ? 1 : ($regtypeArr[0] == 2 ? 3 : 2);
            $huoniaoTag->assign('regable', $type);
        }
        $huoniaoTag->assign('regtypeArr', $regtypeArr);

        //会员注册字段
        $fieldsArr = explode(",", $cfg_regfields);
        $huoniaoTag->assign('fieldsArr', $fieldsArr);

        global $cfg_agreeProtocol;
        $huoniaoTag->assign('cfg_agreeProtocol', (int)$cfg_agreeProtocol);

        global $cfg_secqaastatus;
        $secqaastatus = explode(",", $cfg_secqaastatus);
        $regQa = "";
        if (in_array("reg", $secqaastatus)) {
            $regQa = 1;
        }
        $huoniaoTag->assign('regQa', $regQa);

        //随机选择一条问题
        $archives = $dsql->SetQuery("SELECT * FROM `#@__safeqa` ORDER BY RAND() LIMIT 1");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $huoniaoTag->assign('question', $results[0]['id']);
            $huoniaoTag->assign('regQuestion', $results[0]['question']);
        }

        $huoniaoTag->assign("redirectUrl", $furl ? urlencode(htmlspecialchars($furl)) : '');

        return;

        //找回密码
    } elseif ($action == "fpwd") {

        $type = empty($type) ? "phone" : $type;
        $type = $type != "phone" && $type != "email" ? "phone" : $type;
        $huoniaoTag->assign("fptype", $type);

        //判断注册
    } elseif ($action == "registerCheck") {

        global $cfg_regstatus;
        global $cfg_regclosemessage;
        if ($cfg_regstatus == 0) {
            die('200|' . $cfg_regclosemessage);
        }

        //验证用户名
        if (empty($username)) {
            die('201|' . $langData['siteConfig'][21][225]);  //请输入用户名！
        }
        preg_match("/^[a-zA-Z]{1}[0-9a-zA-Z_]{4,15}$/iu", $username, $matchUsername);
        if (!$matchUsername) {
            die('201|' . $langData['siteConfig'][21][226]);  //用户名格式有误！<br />英文字母、数字、下划线以内的5-20个字！<br />并且只能以字母开头！
        }
        if (!checkMember($username)) {
            die('201|' . $langData['siteConfig'][21][227]); //用户名已存在！
        }

        //验证密码
        if (empty($password)) {
            die('202|' . $langData['siteConfig'][20][164]);  //请输入密码
        }
        // preg_match('/^.{5,}$/', $password, $matchPassword);
        // if (!$matchPassword) {
        //     die('202|' . $langData['siteConfig'][21][103]);  //密码长度最少为5位！
        // }
        $validatePassword = validatePassword($password);
        if($validatePassword != 'ok'){
            die('202|' . $validatePassword);
        }

        //真实姓名
        if (empty($nickname)) {
            die('203|' . $langData['siteConfig'][20][248]);  //请输入真实姓名
        }
        preg_match('/^[a-z\/ ]{2,20}$/iu', $nickname, $matchNickname);
        preg_match('/^[\x{4e00}-\x{9fa5}·]{2,20}$/iu', $nickname, $matchNickname1);
        if (!$matchNickname && !$matchNickname1) {
            die('203|' . $langData['siteConfig'][21][228]);  //真实姓名格式有误！<br />中文、英文字母、空格、反斜线(/)以内的2-20个字！<br />如：刘德华、刘 德华、Last/Frist Middle
        }

        //邮箱
        if (empty($email)) {
            die('204|' . $langData['siteConfig'][21][36]);  //请输入邮箱地址！
        }
        preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $email, $matchEmail);
        if (!$matchEmail) {
            die('204|' . $langData['siteConfig'][21][229]);  //邮箱格式有误！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `email` = '$email'");
        $return = $dsql->dsqlOper($archives, "results");
        if ($return) {
            die('204|' . $langData['siteConfig'][21][230]);  //此邮箱已被注册！
        }

        //手机
        if (empty($phone)) {
            die('205|' . $langData['siteConfig'][20][239]);  //请输入手机号
        }
        preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $phone, $matchPhone);
        if (!$matchPhone) {
            // die('205|' . $langData['siteConfig'][21][98]);  //手机号码格式错误
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `phone` = '$phone'");
        $return = $dsql->dsqlOper($archives, "results");
        if ($return) {
            die('205|' . $langData['siteConfig'][21][231]); //此手机号已被注册！
        }

        if ($mtype == 2) {
            if (empty($company)) {
                die('206|' . $langData['siteConfig'][21][232]);  //请输入公司名称
            }
        }

        //判断安全问题
        global $cfg_secqaastatus;
        $secqaastatus = explode(",", $cfg_secqaastatus);
        if (in_array("reg", $secqaastatus)) {
            $archives = $dsql->SetQuery("SELECT * FROM `#@__safeqa` WHERE `id` = $question AND `answer` = '" . $answer . "'");
            $results = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                die('207|' . $langData['siteConfig'][21][233]);  //安全问题输入错误，请重试！
            }
        }

        //判断验证码
        global $cfg_seccodestatus;
        $seccodestatus = explode(",", $cfg_seccodestatus);
        if (in_array("reg", $seccodestatus)) {
            if (strtolower($vericode) != $_SESSION['huoniao_vdimg_value']) {
                die('208|' . $langData['siteConfig'][21][222]);  //验证码输入错误，请重试！
            }
        }

        $passwd   = $userLogin->_getSaltedHash($password);
        $regtime  = GetMkTime(time());
        $regip    = GetIP();
        $regipaddr = getIpAddr($regip);

        $archives = $dsql->SetQuery("SELECT `regtime` FROM `#@__member` WHERE `regip` = '$regip' AND `state` = 1 ORDER BY `id` DESC LIMIT 0, 1");
        $return = $dsql->dsqlOper($archives, "results");
        if ($return) {
            global $cfg_regtime;
            if (round(($regtime - $return[0]['regtime']) / 60) < $cfg_regtime) {
                die('200|' . str_replace('1', $cfg_regtime, $langData['siteConfig'][21][234]));  //本站限制每次注册间隔时间为1分钟，请稍后再注册。
            }
        }

        //保存到主表
        $regfrom = getCurrentTerminal();
        $archives = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `company`, `regtime`, `regip`, `regipaddr`, `state`, `regfrom`) VALUES ('$mtype', '$username', '$passwd', '$nickname', '$email', '0', '$phone', '0', '$company', '$regtime', '$regip', '$regipaddr', '0', '$regfrom')");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if ($aid) {

            $loginPlatform = '电脑端';
            if (isApp()) {
                $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP';
            } elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {
                if(isWxMiniprogram()){
                    $loginPlatform = '微信小程序';
                }elseif(isByteMiniprogram()){
                    $loginPlatform = '抖音小程序';
                }
            } elseif (isMobile()) {
                if (isWeixin()) {
                    $loginPlatform = '微信公众号';
                } else {
                    $loginPlatform = 'H5';
                }
            }

            //记录用户行为日志
            memberLog($aid, 'member', '', 0, 'insert', '用户注册(' . $loginPlatform . ')', '', $archives);

            //论坛同步
            $data['username'] = $username;
            $data['password'] = $password;
            $data['email']    = $email;
            $userLogin->bbsSync($data, "register");

            //自动登录
            $ureg = $userLogin->memberLogin($username, $password);

            $RenrenCrypt = new RenrenCrypt();
            $userid = base64_encode($RenrenCrypt->php_encrypt($aid));

            //注册验证
            global $cfg_regverify;
            $cfg_regverify = 0;  //不再需要此功能

            //不验证
            if ($cfg_regverify == 0) {
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `state` = 1 WHERE `id` = '$aid'");
                $dsql->dsqlOper($archives, "update");

                // die('100|'.$cfg_secureAccess.$cfg_basehost.'/registerSuccess.html');
                die('100|' . $cfg_secureAccess . $cfg_basehost);

                //邮箱验证
            } elseif ($cfg_regverify == 1) {
                die('100|' . $cfg_secureAccess . $cfg_basehost . '/registerVerifyEmail.html?userid=' . $userid);

                //手机验证
            } elseif ($cfg_regverify == 2) {
                die('100|' . $cfg_secureAccess . $cfg_basehost . '/registerVerifyPhone.html?userid=' . $userid);
            }
        } else {
            die('200|' . $langData['siteConfig'][21][235]);  //注册失败，请稍候重试！
        }
        return;


        //判断注册用户名、邮件、手机
    } elseif ($action == "registerCheck_v1") {

        $mtype = !empty($mtype) ? $mtype : 1;
        $regtime  = GetMkTime(time());
        $regip    = GetIP();
        $regipaddr = getIpAddr($regip);

        $archives = $dsql->SetQuery("SELECT `regtime` FROM `#@__member` WHERE `regip` = '$regip' AND `state` = 1 ORDER BY `id` DESC LIMIT 0, 1");
        $return = $dsql->dsqlOper($archives, "results");
        if ($return) {
            global $cfg_regtime;
            if (round(($regtime - $return[0]['regtime']) / 60) < $cfg_regtime) {
                die('200|' . str_replace('1', $cfg_regtime, $langData['siteConfig'][21][234]));  //本站限制每次注册间隔时间为1分钟，请稍后再注册。
            }
        }

        //邀请注册，生成随机密码
        if ($from == 'invite') {
            $password = create_sess_id();
        }

        //验证密码
        if (!$bindMobile) {
            if (empty($password)) {
                die('202|' . $langData['siteConfig'][20][164]);  //请输入密码
            }
            // preg_match('/^.{5,}$/', $password, $matchPassword);
            // if (!$matchPassword) {
            //     die('202|' . $langData['siteConfig'][21][103]);  //密码长度最少为5位！
            // }
            $validatePassword = validatePassword($password);
            if($validatePassword != 'ok'){
                die('202|' . $validatePassword);
            }

            $passwd    = $userLogin->_getSaltedHash($password);
        }

        //记录当前设备s
        $sourceArr = array(
            "title" => $deviceTitle,
            "type"  => $deviceType,
            "serial" => $deviceSerial,
            "pudate" => time()
        );
        if (!empty($deviceTitle) && !empty($deviceSerial) && !empty($deviceType)) {
            $sourceclient[] = $sourceArr;
            $sourceclient   = serialize($sourceclient);
        }
        //记录当前设备e


        //APP端和小程序端需要创建令牌
        $tokenFieldKey = $tokenFieldVal = $access_token = $refresh_token = "";

        //用户名
        if ($rtype == 1) {
            global $cfg_regstatus;
            global $cfg_regclosemessage;
            if ($cfg_regstatus == 0) {
                die('200|' . $cfg_regclosemessage);
            }

            //验证用户名
            if (empty($account)) {
                die('201|' . $langData['siteConfig'][21][225]);  //请输入用户名！
            }
            preg_match("/^[a-zA-Z]{1}[0-9a-zA-Z_]{4,15}$/iu", $account, $matchUsername);
            if (!$matchUsername) {
                die('201|' . $langData['siteConfig'][21][226]);  //用户名格式有误！<br />英文字母、数字、下划线以内的5-20个字！<br />并且只能以字母开头！
            }
            if (!checkMember($account)) {
                die('201|' . $langData['siteConfig'][21][227]); //用户名已存在！
            }

            //真实姓名
            if (isset($nickname)) {
                if (empty($nickname)) {
                    die('203|' . $langData['siteConfig'][20][248]);  //请输入真实姓名
                }
                preg_match('/^[a-z\/ ]{2,20}$/iu', $nickname, $matchNickname);
                preg_match('/^[\x{4e00}-\x{9fa5}·]{2,20}$/iu', $nickname, $matchNickname1);
                if (!$matchNickname && !$matchNickname1) {
                    die('203|' . $langData['siteConfig'][21][228]);  //真实姓名格式有误！<br />中文、英文字母、空格、反斜线(/)以内的2-20个字！<br />如：刘德华、刘 德华、Last/Frist Middle
                }
            } else {
                $nickname = $account;
            }

            //邮箱
            if (isset($email)) {
                if (empty($email)) {
                    die('204|' . $langData['siteConfig'][21][36]);  //请输入邮箱地址！
                }
                preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $email, $matchEmail);
                if (!$matchEmail) {
                    die('204|' . $langData['siteConfig'][21][229]);  //邮箱格式有误！
                }
                $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `email` = '$email'");
                $return = $dsql->dsqlOper($archives, "results");
                if ($return) {
                    die('204|' . $langData['siteConfig'][21][230]);  //此邮箱已被注册！
                }
            }

            //手机
            if (isset($phone)) {
                if (empty($phone)) {
                    die('205|' . $langData['siteConfig'][20][239]);  //请输入手机号
                }
                preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $phone, $matchPhone);
                if (!$matchPhone) {
                    // die('205|' . $langData['siteConfig'][21][98]);  //手机号码格式错误
                }

                $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `phone` = '$phone'");
                $return = $dsql->dsqlOper($archives, "results");
                if ($return) {
                    die('205|' . $langData['siteConfig'][21][231]); //此手机号已被注册！
                }
            }

            //判断验证码
            global $cfg_seccodetype;
            if (!empty($cfg_seccodetype)) {
                if (strtolower($vericode) != $_SESSION['huoniao_vdimg_value']) {
                    die('208|' . $langData['siteConfig'][21][222]);  //验证码输入错误，请重试！
                }
            }

            $regtime  = GetMkTime(time());
            $regip    = GetIP();
            $regipaddr = getIpAddr($regip);
            $regfrom = getCurrentTerminal();

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `realname`, `email`, `emailCheck`, `areaCode`, `phone`, `phoneCheck`, `company`, `regtime`, `regip`, `regipaddr`, `logincount`, `lastlogintime`, `lastloginip`, `lastloginipaddr`, `state`, `regfrom`, `sourceclient`" . $tokenFieldKey . ") VALUES ('$mtype', '$account', '$passwd', '$nickname', '$nickname', '$email', '0', '$areaCode', '$phone', '0', '$company', '$regtime', '$regip', '$regipaddr', 1, '$regtime', '$regip', '$regipaddr', '1', '$regfrom', '$sourceclient'" . $tokenFieldVal . ")");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if ($aid) {

                $loginPlatform = '电脑端';
                if (isApp()) {
                    $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP';
                } elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {
                    if(isWxMiniprogram()){
                        $loginPlatform = '微信小程序';
                    }elseif(isByteMiniprogram()){
                        $loginPlatform = '抖音小程序';
                    }
                } elseif (isMobile()) {
                    if (isWeixin()) {
                        $loginPlatform = '微信公众号';
                    } else {
                        $loginPlatform = 'H5';
                    }
                }

                //记录用户行为日志
                memberLog($aid, 'member', '', 0, 'insert', '用户注册(' . $loginPlatform . ')', '', $archives);

                $createApiTokenByPlatform = createApiTokenByPlatform($aid, $path);
                $access_token = $createApiTokenByPlatform['access_token'];
                $refresh_token = $createApiTokenByPlatform['refresh_token'];

                $userLogin->registGiving($aid);

                //论坛同步
                global $cfg_bbsState;
                global $cfg_bbsType;
                if ($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()) {
                    $data['username'] = $account;
                    $data['password'] = $password;
                    $data['email']    = $email;
                    $userLogin->bbsSync($data, "register");
                }

                //自动登录
                $ureg = $userLogin->memberLogin($account, $password);

                $RenrenCrypt = new RenrenCrypt();
                $userid = base64_encode($RenrenCrypt->php_encrypt($aid));

                //注册验证
                global $cfg_regverify;
                $cfg_regverify = 0;  //不再需要此功能

                //不验证
                if ($cfg_regverify == 0) {

                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `state` = 1 WHERE `id` = '$aid'");
                    $dsql->dsqlOper($archives, "update");

                    $return = '100|' . $cfg_secureAccess . $cfg_basehost;
                    //                    if($liveurl = GetCookie('live_share_url')){
                    //                        $return = $return . '|' . $liveurl;
                    //                    }
                    // die('100|'.$cfg_secureAccess.$cfg_basehost.'/registerSuccess.html');

                    //小程序端
                    if ($path) {
                        die('100|' . $cfg_secureAccess . $cfg_basehost . '/include/json.php?action=wxMiniProgramLogin&uid=' . $aid . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&path=' . $path);
                    } else {
                        die($return);
                    }

                    //邮箱验证
                } elseif ($cfg_regverify == 1) {
                    $return = '100|' . $cfg_secureAccess . $cfg_basehost . '/registerVerifyEmail.html?userid=' . $userid;
                    //                    if($liveurl = GetCookie('live_share_url')){
                    //                        $return = $return . '|' . $liveurl;
                    //                    }
                    die($return);

                    //手机验证
                } elseif ($cfg_regverify == 2) {
                    $return = '100|' . $cfg_secureAccess . $cfg_basehost . '/registerVerifyPhone.html?userid=' . $userid;
                    //                    if($liveurl = GetCookie('live_share_url')){
                    //                        $return = $return . '|' . $liveurl;
                    //                    }
                    die($return);
                }
            } else {
                die('200|' . $langData['siteConfig'][21][235]);  //注册失败，请稍候重试！
            }
            return;
        }

        //邮箱
        if ($rtype == 2) {

            if (empty($account)) die('201|' . $langData['siteConfig'][21][36]);  //请输入邮箱地址！
            if (empty($vcode)) die('201|' . $langData['siteConfig'][21][236]);  //请输入邮箱验证码！
            if (empty($password)) die('201|' . $langData['siteConfig'][21][237]);  //请输入登录密码！

            preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $account, $matchEmail);
            if (!$matchEmail) {
                die('204|' . $langData['siteConfig'][21][229]);  //邮箱格式有误！
            }

            $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `email` = '$account'");
            $return = $dsql->dsqlOper($archives, "results");
            if ($return) {
                die('204|' . $langData['siteConfig'][21][230]);  //此邮箱已被注册！
            }


            //验证输入的验证码
            $archives = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'email' AND `lei` = 'signup' AND `user` = '$account' AND `code` = '$vcode'");
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                die('204|' . $langData['siteConfig'][21][222]);  //验证码输入错误，请重试！
            } else {

                //24小时有效期
                if (round(($regtime - $results[0]['pubdate']) / 3600) > 24) die('204|' . $langData['siteConfig'][21][33]);  //验证码已过期，请重新获取！

                //验证通过删除发送的验证码
                $archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'email' AND `lei` = 'signup' AND `user` = '$account' AND `code` = '$vcode'");
                $dsql->dsqlOper($archives, "update");
            }


            //保存到主表
            $nickname = preg_replace('/([0-9a-zA-Z]{3})(.*?)@(.*?)/is', "$1***@$3", $account);
            $regfrom = getCurrentTerminal();
            $archives = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `email`, `emailCheck`, `regtime`, `regip`, `regipaddr`, `state`, `regfrom`, `sourceclient`, `logincount`, `lastlogintime`, `lastloginip`, `lastloginipaddr`" . $tokenFieldKey . ") VALUES ('$mtype', '$account', '$passwd', '$nickname', '$account', '1', '$regtime', '$regip', '$regipaddr', '1', '$regfrom', '$sourceclient', 1, '$regtime', '$regip', '$regipaddr'" . $tokenFieldVal . ")");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if ($aid) {    
                
                $loginPlatform = '电脑端';
                if (isApp()) {
                    $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP';
                } elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {
                    if(isWxMiniprogram()){
                        $loginPlatform = '微信小程序';
                    }elseif(isByteMiniprogram()){
                        $loginPlatform = '抖音小程序';
                    }
                } elseif (isMobile()) {
                    if (isWeixin()) {
                        $loginPlatform = '微信公众号';
                    } else {
                        $loginPlatform = 'H5';
                    }
                }

                //记录用户行为日志
                memberLog($aid, 'member', '', 0, 'insert', '用户注册(' . $loginPlatform . ')', '', $archives);

                $createApiTokenByPlatform = createApiTokenByPlatform($aid, $path);
                $access_token = $createApiTokenByPlatform['access_token'];
                $refresh_token = $createApiTokenByPlatform['refresh_token'];

                $userLogin->registGiving($aid);

                //论坛同步
                global $cfg_bbsState;
                global $cfg_bbsType;
                if ($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()) {
                    $accountData = explode("@", $account);
                    $data['username'] = $accountData[0];
                    $data['password'] = $password;
                    $data['email']    = $account;
                    $userLogin->bbsSync($data, "register");
                }

                //自动登录
                $ureg = $userLogin->memberLogin($account, $password);

                //小程序端
                if ($path) {
                    die('100|' . $cfg_secureAccess . $cfg_basehost . '/include/json.php?action=wxMiniProgramLogin&uid=' . $aid . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&path=' . $path);
                } else {
                    die('100|' . $cfg_secureAccess . $cfg_basehost);
                }
            } else {
                die('200|' . $langData['siteConfig'][21][235]);  //注册失败，请稍候重试！
            }
        }


        //手机
        if ($rtype == 3) {

            if (empty($areaCode)) die('201|' . $langData['siteConfig'][21][238]);  //请输入区域码！
            if (empty($account)) die('201|' . $langData['siteConfig'][20][239]);  //请输入手机号
            if (empty($vcode)) die('201|' . $langData['siteConfig'][20][28]);  //请输入短信验证码
            if (empty($password)) die('201|' . $langData['siteConfig'][21][237]);  //请输入登录密码！

            $areaCode = (int)$areaCode;

            $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $international = $results[0]['international'];
                if (!$international) {
                    $areaCode = "";
                }
            } else {
                return array("state" => 200, "info" => $langData['siteConfig'][33][3]); //短信平台未配置，发送失败！
            }

            /*preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $account, $matchPhone);
            if(!$matchPhone){
                die('205|手机格式有误');
            }*/

            $phone_ishave = false;
            $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `phone` = '$account' AND `phoneCheck` = 1 AND `mtype` != 0 AND `mtype` != 3");
            $return = $dsql->dsqlOper($archives, "results");
            if ($return) {
                $phone_ishave = true;
                // 第三方登陆绑定手机号进来时，此处忽略手机号是否已注册的验证
                if (empty($bindMobile) || $code == "email") {
                    die('205|' . $langData['siteConfig'][21][231]); //此手机号已被注册！
                }
            }

            //验证输入的验证码
            $newUser = 0;
            $user_sql = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'signup' AND `user` = '" . $areaCode . $account . "' AND `code` = '$vcode'");
            $results  = $dsql->dsqlOper($user_sql, "results");
            if (!$results) {
                die('205|' . $langData['siteConfig'][21][222]);  //验证码输入错误，请重试！
            } else {

                //5分钟有效期
                if ($regtime - $results[0]['pubdate'] > 300) die('205|' . $langData['siteConfig'][21][33]);  //验证码已过期，请重新获取！

                //验证通过删除发送的验证码
                $archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'signup' AND `user` = '" . $areaCode . $account . "' AND `code` = '$vcode'");
                $dsql->dsqlOper($archives, "update");
            }

            // 通过邮箱注册或第三方登陆进来
            if ($bindMobile) {
                $RenrenCrypt = new RenrenCrypt();
                $uid = $RenrenCrypt->php_decrypt(base64_decode($bindMobile));
                // 查询用户
                // 邮箱
                if ($code == "email") {
                    $archives = $dsql->SetQuery("SELECT `username`, `email`, `paypwd`, `sourceclient` FROM `#@__member` WHERE `id` = $uid");
                    $results  = $dsql->dsqlOper($archives, "results");
                    if ($results) {
                        // 手机号已存在，验证该手机号账号是否已绑定邮箱
                        if ($phone_ishave) {
                            die('205|' . $langData['siteConfig'][21][231]); //此手机号已被注册！
                            // $sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `phone` = '$account' AND `email` = ''");
                            // $ret = $dsql->dsqlOper($sql, "results");
                            // // 未绑定邮箱
                            // if($ret){
                            //  $sql = $dsql->SetQuery("UPDATE `#@__member` SET `email` WHERE `id` = ".$ret[0]['id']);
                            //  $ret = $dsql->dsqlOper($sql, "update");
                            //  if($ret == "ok"){
                            //      // 删除当前邮箱账号重新登陆
                            //      $sql = $dsql->SetQuery("DELETE FROM `#@__member` WHERE `id` = $uid");
                            //      $ret = $dsql->dsqlOper($sql, "update");

                            //      global $cfg_cookiePath;
                            //      global $cfg_onlinetime;
                            //      $data = $ret[0]['id'].'&'.$ret[0]['password'];
                            //      $RenrenCrypt = new RenrenCrypt();
                            //      $userid = base64_encode($RenrenCrypt->php_encrypt($data));
                            //      PutCookie($userLogin->keepMemberID, $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);

                            //      PutCookie("connect_uid", "");
                            //      die('100|'.$cfg_secureAccess.$cfg_basehost);
                            //  }else{
                            //      die('200|' . $langData['siteConfig'][21][239]);  //绑定手机号失败，请重试！
                            //  }
                            // }else{
                            //  die('205|' . $langData['siteConfig'][21][231]); //此手机号已被注册！
                            // }
                        } else {
                            $username = $results[0]['username'];
                            $password = $results[0]['paypwd'];
                            $email    = $results[0]['email'];
                            //记录当前设备s
                            if ($results[0]['sourceclient']) {
                                $sourceclientAll = unserialize($results[0]['sourceclient']);
                            }
                            $sourceclients = array();
                            if (!empty($deviceTitle) && !empty($deviceSerial) && !empty($deviceType)) {
                                if (!empty($sourceclientAll)) {
                                    $sourceclients = $sourceclientAll;
                                    //$foundTitle  = array_search($deviceTitle, array_column($sourceclientAll, 'title'));
                                    $foundSerial = array_search($deviceSerial, array_column($sourceclientAll, 'serial'));
                                    //$foundType   = array_search($deviceType, array_column($sourceclientAll, 'type'));
                                    if ($foundSerial) {
                                        //如果已有，更新时间，以Serial为准
                                        $sourceclients[$foundSerial]['pudate'] = time();
                                    } else {
                                        array_push($sourceclients, $sourceArr);
                                    }
                                } else {
                                    $sourceclients[] = $sourceArr;
                                }
                                $sourceclients = serialize($sourceclients);

                                $where_ = "`sourceclient` = '$sourceclients',";
                            }
                            //记录当前设备e
                        }
                    } else {
                        die('200|' . $langData['siteConfig'][21][239]);  //绑定手机号失败，请重试！
                    }

                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET $where_ `areaCode` = '$areaCode', `phone` = '$account', `phoneCheck` = '1', `state` = 1, `paypwd` = '' WHERE `id` = $uid");

                    // 第三方登陆
                } else {

                    $code_field = $code == "wechat" ? ",`wechat_conn`, `wechat_openid`" : ($code ? ",`" . $code . "_conn`" : '');
                    $archives = $dsql->SetQuery("SELECT `username`, `photo`, `nickname` " . $code_field . " FROM `#@__member` WHERE `id` = $uid");
                    $results  = $dsql->dsqlOper($archives, "results");
                    if ($results) {
                        // 手机号已存在，验证该手机号账号是否已绑定第三方账号
                        if ($phone_ishave) {
                            $sql = $dsql->SetQuery("SELECT `id`, `password`, `sourceclient`, `photo`, `nickname`, `" . $code . "_conn` FROM `#@__member` WHERE `phone` = '$account' AND `" . $code . "_conn` = '' AND `mtype` != 0 AND `mtype` != 3");
                            $ret = $dsql->dsqlOper($sql, "results");
                            // 未绑定第三方账号
                            if ($ret) {
                                $up_field = '';
                                // 更新已存在账号第三方绑定信息
                                if ($code == "wechat") {
                                    $up_field = "`wechat_conn` = '" . $results[0]['wechat_conn'] . "', `wechat_openid` = '" . $results[0]['wechat_openid'] . "'";
                                } elseif($code) {
                                    $up_field = "`" . $code . "_conn` = '" . $results[0][$code . "_conn"] . "'";
                                }
                                if (empty($ret[0]['photo'])) {
                                    $up_field .= ", `photo` = '" . $results[0]['photo'] . "'";
                                }
                                if (empty($ret[0]['nickname'])) {
                                    $up_field .= ", `nickname` = '" . $results[0]['nickname'] . "'";
                                }
                                //记录当前设备s
                                if ($ret[0]['sourceclient']) {
                                    $sourceclientAll = unserialize($ret[0]['sourceclient']);
                                }
                                $sourceclients = array();
                                if (!empty($deviceTitle) && !empty($deviceSerial) && !empty($deviceType)) {
                                    if (!empty($sourceclientAll)) {
                                        $sourceclients = $sourceclientAll;
                                        //$foundTitle  = array_search($deviceTitle, array_column($sourceclientAll, 'title'));
                                        $foundSerial = array_search($deviceSerial, array_column($sourceclientAll, 'serial'));
                                        //$foundType   = array_search($deviceType, array_column($sourceclientAll, 'type'));
                                        if ($foundSerial) {
                                            //如果已有，更新时间，以Serial为准
                                            $sourceclients[$foundSerial]['pudate'] = time();
                                        } else {
                                            array_push($sourceclients, $sourceArr);
                                        }
                                    } else {
                                        $sourceclients[] = $sourceArr;
                                    }
                                    $sourceclients = serialize($sourceclients);
                                    $up_field .= ", `sourceclient` = '" . $sourceclients . "'";
                                }
                                //记录当前设备e
                                $sql = $dsql->SetQuery("UPDATE `#@__member` SET " . $up_field . " WHERE `id` = " . $ret[0]['id']);

                                $res = $dsql->dsqlOper($sql, "update");
                                if ($res == "ok") {
                                    // 删除当前第三方账号，登陆已存在账号
                                    $sql = $dsql->SetQuery("DELETE FROM `#@__member` WHERE `id` = $uid");
                                    $dsql->dsqlOper($sql, "update");

                                    // 查询微信临时表-pc端同步登陆
                                    $sql = $dsql->SetQuery("UPDATE `#@__site_wxlogin` SET `uid` = " . $ret[0]['id'] . " WHERE `uid` = $uid");
                                    $dsql->dsqlOper($sql, "update");

                                    $userLogin->keepUserID = $userLogin->keepMemberID;
                                    $userLogin->userID = $ret[0]['id'];
                                    $userLogin->userPASSWORD = $ret[0]['password'];
                                    $userLogin->keepUser();

                                    PutCookie("connect_uid", "");
                                    die('100|' . $cfg_secureAccess . $cfg_basehost);
                                } else {
                                    die('200|' . $langData['siteConfig'][21][239]);  //绑定手机号失败，请重试！
                                }
                                // 已绑定第三方账号
                            } else {
                                die('205|' . $langData['siteConfig'][33][38]); //该手机号码已注册并绑定了第三方账号，如需将手机号绑定此第三方账号，请先用手机登陆，然后在安全中心进行解绑，然后再绑定此第三方账号！
                            }
                        } else {
                            $username = $results[0]['username'];
                            $password = "";
                            $chcode = strtolower(create_check_code(8));
                        }
                    } else {
                        die('200|' . $langData['siteConfig'][21][239]);  //绑定手机号失败，请重试！
                    }

                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `areaCode` = '$areaCode', `phone` = '$account', `phoneCheck` = '1', `state` = 1 WHERE `id` = $uid");


                    //如果是从绑定手机页操作的，并且系统开启了第三方登录必须登录手机，这里绑定后，进行送积分等操作
                    if ($bindMobile) {
                        $userLogin->registGiving($uid);
                    }
                }

                $ret = $dsql->dsqlOper($sql, "update");
                if ($ret == "ok") {

                    // 用户登陆后再清除
                    // PutCookie("connect_uid", "");




                    if ($code == "email") {

                        //论坛同步
                        global $cfg_bbsState;
                        global $cfg_bbsType;
                        if ($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()) {
                            $accountData = explode("@", $email);
                            $data['username'] = $accountData[0];
                            $data['password'] = $password;
                            $data['email']    = $account;
                            $userLogin->bbsSync($data, "register");
                        }
                    } else {

                        //如果是微信扫码登录，需要更新临时登录日志
                        if ($state) {
                            $archives = $dsql->SetQuery("UPDATE `#@__site_wxlogin` SET `uid` = '$uid' WHERE `state` = '$state'");
                            $results = $dsql->dsqlOper($archives, "update");
                        }

                        //论坛同步
                        global $cfg_bbsState;
                        global $cfg_bbsType;
                        if ($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()) {
                            $data['username'] = $username;
                            $data['password'] = $password;
                            $data['email']    = $chcode . "@qq.com";
                            $userLogin->bbsSync($data, "register");
                        }
                    }

                    $aid = $uid;
                } else {
                    die('200|' . $langData['siteConfig'][21][239]);  //绑定手机号失败，请重试！
                }
            } else {

                //保存到主表
                $nickname = preg_replace('/(1[23456789]{1}[0-9])[0-9]{4}([0-9]{4})/is', "$1****$2", $account);
                $regfrom = getCurrentTerminal();
                $user_sql = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `areaCode`, `phone`, `phoneCheck`, `regtime`, `regip`, `regipaddr`, `state`, `regfrom`, `purviews`, `sourceclient`, `logincount`, `lastlogintime`, `lastloginip`, `lastloginipaddr`" . $tokenFieldKey . ") VALUES ('$mtype', '$account', '$passwd', '$nickname', '$areaCode', '$account', '1', '$regtime', '$regip', '$regipaddr', '1', '$regfrom', '', '$sourceclient', 1, '$regtime', '$regip', '$regipaddr'" . $tokenFieldVal . ")");
                $aid = $dsql->dsqlOper($user_sql, "lastid");
                $newUser = 1;
            }


            if (is_numeric($aid)) {

                $loginPlatform = '电脑端';
                if (isApp()) {
                    $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP';
                } elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {
                    if(isWxMiniprogram()){
                        $loginPlatform = '微信小程序';
                    }elseif(isByteMiniprogram()){
                        $loginPlatform = '抖音小程序';
                    }
                } elseif (isMobile()) {
                    if (isWeixin()) {
                        $loginPlatform = '微信公众号';
                    } else {
                        $loginPlatform = 'H5';
                    }
                }

                //记录用户行为日志
                if($newUser){
                    memberLog($aid, 'member', '', 0, 'insert', '用户注册(' . $loginPlatform . ')', '', $user_sql);
                }else{
                    memberLog($aid, 'member', '', 0, 'insert', '用户登录(' . $loginPlatform . ')', '', $user_sql);
                }

                if (!$bindMobile) {
                    $userLogin->registGiving($aid);
                }

                $createApiTokenByPlatform = createApiTokenByPlatform($aid, $path);
                $access_token = $createApiTokenByPlatform['access_token'];
                $refresh_token = $createApiTokenByPlatform['refresh_token'];

                $addStaff = GetCookie('addStaff');

                if (!empty($addStaff)) {
                    /*商家添加员工*/
                    $staffsql = $dsql->SetQuery("SELECT `id` FROM `#@__staff` WHERE `uid` = '$aid' ");

                    $staffres = $dsql->dsqlOper($staffsql, "results");

                    if (!$staffres && is_array($staffres)) {

                        /*查询有无商家*/
                        $businseesql = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__business_list` WHERE `id` = '$addStaff'");

                        $businessres = $dsql->dsqlOper($businseesql, "results");

                        if (!empty($businessres) && is_array($businessres)) {

                            $storetitle = $businessres[0]['title'];

                            $nowtime = GetMkTime(time());

                            $upstaffsql = $dsql->SetQuery("INSERT INTO `#@__staff` (`sid`,`uid`,`pubdate`)VALUES ('$addStaff','$aid','$nowtime')");

                            $dsql->dsqlOper($upstaffsql, "update");

                            global $cfg_onlinetime;
                            PutCookie('is_staffsuccess', 1, $cfg_onlinetime * 60 * 60);
                            PutCookie('storetitle', "您已成为" . $storetitle . "员工", $cfg_onlinetime * 60 * 60);

                            DropCookie('addStaff');
                        }
                    }
                }

                //论坛同步
                global $cfg_bbsState;
                global $cfg_bbsType;
                if ($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()) {
                    $chcode = strtolower(create_check_code(8));
                    $data['username'] = $account;
                    $data['password'] = $passwd;
                    $data['email']    = $chcode . "@qq.com";
                    $userLogin->bbsSync($data, "register");
                }

                //自动登录
                $ureg = $userLogin->memberLogin($account, $password);

                //小程序端
                if ($path) {
                    die('100|' . $cfg_secureAccess . $cfg_basehost . '/include/json.php?action=wxMiniProgramLogin&uid=' . $aid . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&path=' . $path);
                } else {

                    //APP端
                    if (isApp()) {
                        $userinfo = $userLogin->getMemberInfo($aid);
                        $userinfo['access_token'] = $access_token;
                        $userinfo['refresh_token'] = $refresh_token;

                        $userinfo = array(
                            'state' => '100',
                            'passport' => $aid,
                            'username' => $userinfo['username'],
                            'nickname' => $userinfo['nickname'],
                            'userid_encode' => $userinfo['userid_encode'],
                            'cookiePre' => $userinfo['cookiePre'],
                            'photo' => $userinfo['photo'],
                            'dating_uid' => $userinfo['dating_uid'],
                            'access_token' => $access_token,
                            'refresh_token' => $refresh_token
                        );

                        $userinfoArr = array();
                        foreach ($userinfo as $key => $value) {
                            array_push($userinfoArr, '"' . $key . '": "' . $value . '"');
                        }
                        $userinfoStr = '<script>var userinfo = {' . join(', ', $userinfoArr) . '}</script>';
                        echo '<span style="display:none;">' . $userinfoStr . '100|</span>';
                        die;
                    }

                    die('100|' . $cfg_secureAccess . $cfg_basehost);
                }
            } else {
                die('200|' . $langData['siteConfig'][21][235]);  //注册失败，请稍候重试！
            }
        }
        return;


        //注册成功，不需要验证
    } elseif ($action == "registerSuccess") {

        $memberId = $userLogin->getMemberID();
        if ($memberId > -1) {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = '$memberId'");
            $return = $dsql->dsqlOper($archives, "results");
            if ($return) {

                $huoniaoTag->assign('username', $return[0]['username']);
                $huoniaoTag->assign('email', $return[0]['email']);
                $huoniaoTag->assign('phone', $return[0]['phone']);
            } else {
                die('会员不存在！');
            }
        } else {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/login.html?furl=' . $furl);
        }
        return;

        //注册成功，邮箱验证
    } elseif ($action == "registerVerifyEmail") {

        $RenrenCrypt = new RenrenCrypt();
        $uid = $RenrenCrypt->php_decrypt(base64_decode($userid));

        if (!empty($userid)) {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = '$uid'");
            $return = $dsql->dsqlOper($archives, "results");
            if ($return) {

                $username   = $return[0]['username'];
                $email      = $return[0]['email'];
                $state      = $return[0]['state'];

                global $cfg_webname;
                global $cfg_basehost;

                if (empty($return[0]['sendEmail'])) {
                    if ($state == 0) {

                        //获取邮件内容
                        $cArr = getInfoTempContent("mail", '会员-帐号激活-发送邮件', array("email" => $email, "userid" => $userid));
                        $title = $cArr['title'];
                        $content = $cArr['content'];

                        if ($title == "" && $content == "") {
                            // showMsg("邮件通知功能未开启，邮件发送失败！", "login.html?furl=".$furl);
                        }

                        sendmail($email, $title, $content);

                        $now = GetMkTime(time());
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `sendEmail` = " . $now . " WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                    } else {
                        $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
                        showMsg($langData['siteConfig'][21][240], "login.html?furl=" . $furl);  //您已完成邮箱验证，请登录！
                        die;
                    }
                }

                $huoniaoTag->assign('email', $email);
            } else {
                die('会员不存在！');
            }
        } else {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/login.html?furl=' . $furl);
        }
        return;

        //邮箱验证
    } elseif ($action == "memberVerifyEmail") {

        $RenrenCrypt = new RenrenCrypt();
        $uid = $RenrenCrypt->php_decrypt(base64_decode($userid));

        if (!empty($userid)) {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = '$uid'");
            $return = $dsql->dsqlOper($archives, "results");
            if ($return) {

                $username   = $return[0]['username'];
                $email      = $return[0]['email'];
                $state      = $return[0]['state'];
                $sendEmail  = $return[0]['sendEmail'];

                if ($state != 0) {
                    $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
                    showMsg($langData['siteConfig'][21][240], "login.html?furl=" . $furl);  //您已完成邮箱验证，请登录！
                    die;
                }

                $regtime  = GetMkTime(time());
                if (round(($regtime - $sendEmail) / 3600) > 24) {

                    $archives = $dsql->SetQuery("DELETE FROM `#@__member` WHERE `id` = " . $uid);
                    $dsql->dsqlOper($archives, "update");

                    showMsg($langData['siteConfig'][21][241], "register.html");  //您的邮件验证已超过24小时的有效时间，请重新注册！
                    die;
                }

                global $cfg_webname;
                global $cfg_basehost;

                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `state` = 1, `emailCheck` = 1 WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");

                $huoniaoTag->assign('username', $username);
                $huoniaoTag->assign('email', $email);

                global $cfg_cookiePath;
                global $cfg_onlinetime;
                PutCookie("login_user", $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);
            } else {
                die('会员不存在！');
            }
        } else {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/login.html?furl=' . $furl);
        }
        return;

        //获取登录用户信息
    } elseif ($action == "getUserInfo") {

        $userinfo = array();
        if ($userLogin->getMemberID() > -1) {
            $userinfo = $userLogin->getMemberInfo();
        }
        if ($userinfo) {
            if ($callback) {
                echo $callback . '(' . json_encode($userinfo) . ')';
            } else {
                echo json_encode($userinfo);
            }
        }
        die;

        //站内消息
    } elseif ($action == "message") {

        if (isApp() && $userid == -1) {
            global $cfg_staticPath;
            global $cfg_staticVersion;
            $url = $cfg_secureAccess . $cfg_basehost;

            $html = <<<eot
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0">
    <title></title>
    <link rel="stylesheet" type="text/css" href="{$cfg_staticPath}css/core/touchBase.css?v=$cfg_staticVersion">
    <script src="{$cfg_staticPath}js/core/touchScale.js?v=$cfg_staticVersion"></script>
    <script src="{$cfg_staticPath}js/core/zepto.min.js?v=$cfg_staticVersion"></script>
    <style>
        html, body {height: 100%; background: rgba(0, 0, 0, .2);}
        .popup {position: fixed; width: 4.7rem; left: 50%; top: 50%; margin: -2.75rem 0 0 -2.35rem; padding: .5rem 0; background: #fff; border-radius: 4px; text-align: center;}
        .popup h3 {font-size: .3rem;}
        .popup img {width: 1rem; height: 1rem; display: block; margin: .3rem auto;}
        .popup a {width: 2.45rem; height: .58rem; display: block; margin: 0 auto; line-height: .58rem; color: #fff; font-size: .26rem; border-bottom: 5px solid #fcb0a4; border-radius: 4px; background-color: rgb(248, 63, 33);}
    </style>
    <script>
        window.open("{$url}/login.html");
    </script>
</head>
<body>
    <div class="popup">
        <h3>您还未登录，请先登录</h3>
        <img src="{$cfg_staticPath}images/login_tip_icon.png" />
        <a href="{$url}/login.html">立即登录</a>
    </div>
</body>
</html>
eot;
            echo $html;
            die;
        }

        $userLogin->checkUserIsLogin();

        $page = empty($page) ? 1 : $page;
        $huoniaoTag->assign('atpage', $page);
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('pushMessage', $pushMessage);  //来源是否推送过来的，message.html?pushMessage=1

        //站内消息详细信息
    } elseif ($action == "message_detail") {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $id = (int)$id;
        if (empty($id)) {
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
            die;
        }

        $sql = $dsql->SetQuery("SELECT log.`state`, l.`title`, l.`body`, l.`urlParam`, l.`date` FROM `#@__member_letter_log` log LEFT JOIN `#@__member_letter` l ON l.`id` = log.`lid` WHERE l.`type` = 0 AND log.`id` = $id AND log.`uid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $data = $ret[0];

            //更新状态
            if ($data['state'] == 0) {
                $sql = $dsql->SetQuery("UPDATE `#@__member_letter_log` SET `state` = 1 WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
            //跳转
            if (!empty($data['urlParam'])) {
                $param = unserialize($data['urlParam']);
                //APP端重定向到个人中心 by gz 20181018
                if (is_array($param) && $param['service'] == 'member' && !$param['type'] && isApp()) {
                    if (
                        strstr($param['template'], 'withdraw') ||
                        strstr($param['template'], 'security') ||
                        strstr($param['template'], 'point') ||
                        strstr($param['template'], 'upgrade') ||
                        (strstr($param['template'], 'manage') && (strstr($param['action'], 'article') || strstr($param['action'], 'info'))) ||
                        strstr($param['template'], 'record')
                    ) {
                        $param['type'] = 'user';
                    }

                    if (
                        $param['template'] == 'config' && $param['action'] == 'business'
                    ) {
                        $param['type'] = 'user';
                        $param['template'] = 'business';
                        $param['action'] = 'config';
                    }
                }
                //外卖订单详情只允许移动端访问
                if (
                    is_array($param) &&
                    (
                        ($param['service'] == 'member' && $param['template'] == 'orderdetail' && ($param['action'] == 'waimai' || $param['module'] == 'paotui')) ||
                        ($param['template'] == 'orderdetail' && $param['action'] == 'travel') ||
                        ($param['template'] == 'orderdetail' && $param['action'] == 'homemaking') ||
                        ($param['service'] == 'circle' && $param['template'] == 'blog_detail') ||
                        ($param['service'] == 'member' && $param['action'] == 'tuan-unuse') ||
                        strstr($param['template'], 'paidui') ||
                        strstr($param['template'], 'maidan') ||
                        strstr($param['template'], 'diancan') ||
                        strstr($param['template'], 'dingzuo') ||
                        ($param['template'] == 'order-business' && $param['param'] == 'type=dingzuo') ||
                        ($param['template'] == 'order-business' && $param['param'] == 'type=diancan') ||
                        ($param['template'] == 'order-business' && $param['param'] == 'type=paidui') ||
                        ($param['template'] == 'order-business' && $param['param'] == 'type=maidan')
                    ) && !isMobile()
                ) {
                    $data['body'] = '<div style="margin-top: 100px; text-align: center;"><img src="/include/qrcode.php?data=' . getUrlPath($param) . '" /><br />请扫码在手机端查看！</div>';
                } else {
                    if (is_string($param) && (strstr($param, 'miniprogram://') > -1 || strstr($param, 'wxMiniprogram://') > -1)) {
                        $data['body'] = '<div style="margin-top: 100px; text-align: center;"><img src="/include/qrcode.php?data=' . getUrlPath(array('service' => 'member', 'type' => 'user', 'template' => 'message')) . '" /><br />请扫码在微信端查看！</div>';
                    } else {
                        if (isMobile() && $param['service'] == 'member' && $param['template'] == 'orderdetail' && $param['action'] == 'awardlegou' && !$param['type']) {
                            $data['body'] = '请在电脑端查看订单！';
                        } else {
                            $_url = is_array($param) ? getUrlPath($param) : $param;
                            header("location:" . $_url);
                            die;
                        }
                    }
                }
            }

            //一般是会员升级之类的不需要查看详情的消息，直接跳转到交易明细页
            if (strstr($data['body'], 'first') && strstr($data['body'], 'remark')) {
                $param = array(
                    'service' => 'member',
                    'type' => 'user',
                    'template' => 'record'
                );
                header("location:" . getUrlPath($param));
                die;
            }

            $huoniaoTag->assign('title', $data['title']);
            $huoniaoTag->assign('body', $data['body']);
            $huoniaoTag->assign('date', date("Y-m-d H:i:s", $data['date']));
        } else {
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
            die;
        }
        return;
    } elseif ($action == "config_marry_hotel") {
        $detailHandels = new handlers('marry', "storeDetail");
        $detailConfig  = $detailHandels->getHandle(array("id" => $id, "istype" => $istype, "typeid" => $typeid, "businessid" => $businessid));
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                foreach ($detailConfig as $key => $value) {

                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                $huoniaoTag->assign('id', (int)$id);
            }

            //酒店特色
            $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 179 ORDER BY `weight` ASC");
            $results = $dsql->dsqlOper($archives, "results");
            $list = array();
            foreach ($results as $value) {
                $list[$value['id']] = $value['id'];
            }
            $huoniaoTag->assign('tslist', $list);
        }
    }
    //房产经纪人
    elseif (stripos($action, "config-house") !== false) {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();
        $jjr = 0;

        $sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $jjr = 1;

            $contorllerFile = dirname(__FILE__) . '/house.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;
                require_once($contorllerFile);

                $param = array(
                    "action" => "broker-detail",
                    "id"     => $ret[0]['id'],
                    "u"      => 1
                );
                house($param);
            }
        }
        $huoniaoTag->assign("jjr", $jjr);

        $zjcom = 0;
        $sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjcom` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $zjcom = 1;
        }
        $huoniaoTag->assign("zjcom", $zjcom);


        //管理发布的信息
    } elseif ($action == "fabusuccess" || $action == "car_entrust" || $action == "car_receive_broker" || $action == "car-broker" || $action == "manage" || $action == "fabu" || $action == "order" || $action == "orderlist" || $action == "team" || $action == "teamAdd" || $action == "albums" || $action == "albumsAdd" || $action == "case" || $action == "caseAdd" || $action == "booking" || $action == "post" || $action == "collections" || $action == "invitation" || $action == "resume" || $action == "house-broker" || $action == "statistics" || $action == "statistics" || $action == "house_receive_broker" || $action == "house_entrust" || $action == "education-order"  || $action == "education-yuyue"  || $action == "logoff" || $action == 'info' || $action == 'fabu_worker_seek' || $action == 'fabu_post_seek' || $action == 'fabu_job_seek') {

        //新版管理页面
        $newManageFile = HUONIAOROOT . '/templates/member/touch/uniapp/index.html';

        global $busiDomain;
        global $dirDomain;

        //判断是否企业会员中心
        $ischeck = explode($busiDomain, $dirDomain);

        if(isMobile() && (($action == 'manage' && $module != 'live' && $module != 'tuan') || ($action == 'order' && $module != 'business' && count($ischeck) <= 1)) && file_exists($newManageFile)){
            $module = $module ? $module : '';
            $huoniaoTag->assign("module", $module);

            global $cfg_staticPath;
            global $cfg_basedomain;
            $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径
            $huoniaoTag->assign('templets_skin', $cfg_basedomain . '/templates/member/touch/uniapp/');  //模板路径

            $huoniaoTag->display($newManageFile);
            die;
        }

        if (in_array('info', $installModuleArr)) {
            include(HUONIAOROOT . "/include/config/info.inc.php");
            $huoniaoTag->assign('cfg_cost', $cfg_cost ? $cfg_cost : 0);
            //        $status = explode(',',$custom_excitation);
            $status =  $custom_excitation;
            $bao     = $status;
            if ($cfg_isvalid == '1') {               //是否设置永久有效期
                $cfg_valid = $cfg_valid ? unserialize($cfg_valid) : unserialize('a:1:{i:0;a:3:{s:3:"day";i:3650;s:7:"daytime";i:315360000;s:5:"price";d:1;}}');
                $valid = $cfg_valid;                    //永久有效期
            } else {
                $valid = array();
            }
            $info = unserialize($cfg_info_Smart);                //有效期
            $info_smart = 'a:2:{i:0;a:5:{s:5:"times";i:0;s:3:"day";i:3;s:7:"daytime";i:259200;s:7:"dayText";s:3:"天";s:5:"price";d:5;}i:1;a:5:{s:5:"times";i:0;s:3:"day";i:7;s:7:"daytime";i:604800;s:7:"dayText";s:3:"天";s:5:"price";d:10;}}';  //默认 有效期
            $huoniaoTag->assign('info', $info ? $info : unserialize($info_smart));
            $huoniaoTag->assign('valid', $valid);
            $huoniaoTag->assign('hongbao', $hongbao);
            $huoniaoTag->assign('bao', $bao);
            $huoniaoTag->assign('typeid', $typeid);
            $huoniaoTag->assign('fabuTips', $customFabuTips);
        }

        //分类信息页如果只是看分类，不需要验证登录，其他情况都需要验证登录$photo
        if (($action == 'info' && !$category) || $action != 'info') {
            $userLogin->checkUserIsLogin();
        }

        $userid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if ($module == 'shop' && $action == "fabu") {
            include HUONIAOINC . "/config/shop.inc.php";
            $huoniaoTag->assign('shopPeisongState', $customshopPeisongState);

            $_promotion = $userinfo['promotion'];

            //如果是员工账号，以下数据按商家账号查询
            if ($userinfo['is_staff'] == 1) {
                $userid = $userinfo['companyuid'];
                $_userinfo = $userLogin->getMemberInfo($userid);
                $_promotion = $_userinfo['promotion'];
            }

            //判断保障金是否足额
            if($customfabuShopPromotion > 0 && $_promotion < $customfabuShopPromotion){
                $param = array(
                    'service' => 'member',
                    'template' => 'promotion'
                );
                $url = getUrlPath($param);
                echo "<script>alert('保障金余额必须大于".$customfabuShopPromotion."元才可以发布商品，请缴纳后发布！');location.href='".$url."';</script>";
                die;
            }

            $Sql = $dsql->SetQuery("SELECT `id`,`toshop`,`distribution`,`express`,`merchant_deliver`,`shoptype` FROM `#@__shop_store` WHERE 1=1 AND `userid` = '$userid'");
            $Res = $dsql->dsqlOper($Sql, "results");

            if ($Res) {
                $shoptypexianshi = 0;

                if (($Res[0]['toshop'] == 1 && $Res[0]['distribution'] == 0 && $Res[0]['express'] == 0 && $Res[0]['merchant_deliver'] == 0) || $Res[0]['shoptype'] == 2) {
                    $shoptypexianshi  = 1;
                }
            }
            $huoniaoTag->assign('distribution', (int)$Res[0]['distribution']);
            $huoniaoTag->assign('merchant_deliver', (int)$Res[0]['merchant_deliver']);
            $huoniaoTag->assign('express', (int)$Res[0]['express']);
            $huoniaoTag->assign('shoptype', (int)$Res[0]['shoptype']);
            $huoniaoTag->assign('toshop', (int)$Res[0]['toshop']);
            $huoniaoTag->assign('shoptypexianshi', $shoptypexianshi);
            $huoniaoTag->assign('modAdrr', $id ? 0 : (int)$modAdrr);

            //查询店铺商品是否有团购商品
            $Sql = $dsql->SetQuery("SELECT t.`typesales` FROM `#@__shop_product`t LEFT JOIN `#@__shop_store` s ON t.`store` = s.`id` WHERE 1=1 AND s.`userid` = '$userid'");
            $Res = $dsql->dsqlOper($Sql, "results");
            $typesales = array_column($Res, 'typesales');
            $typesalestate = 0;
            if (in_array("1", $typesales)) {
                $typesalestate = 1;
            }
            $huoniaoTag->assign('typesalestate', (int)$typesalestate);

            //查询店铺配送方式
            $peiSql = $dsql->SetQuery("SELECT `merchant_deliver`,`distribution` FROM `#@__shop_store` WHERE 1=1 AND `userid` = '$userid'");
            $peiRes = $dsql->dsqlOper($peiSql, "results");
            if ($peiRes[0]['merchant_deliver'] == 1) {
                $shipping = 2;
            }
            if ($peiRes[0]['distribution'] == 1) {
                $shipping = 0;
            }
            $huoniaoTag->assign('shipping', (int)$shipping);
        }
        if ($action == "education-order" || $action == "education-yuyue") {

            $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `state` = 1 AND `userid` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if (!empty($res[0]['id'])) {
                $isEducationStore = true;
            } else {
                $isEducationStore = false;
            }

            if ($userinfo['userType'] == 2) {
                $userid = $res[0]['id'];
            }
            if ($userid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `state` = 1 AND `userid` = $userid");
                $res = $dsql->dsqlOper($sql, "results");
                if (!empty($res[0]['id'])) {
                    $isEducationTutor = true;
                } else {
                    $isEducationTutor = false;
                }
            }
            if (!$isEducationStore && !$isEducationTutor) {
                // die("<script>alert('请先申请家教或者入驻教育商家') </script>");
            }
            $huoniaoTag->assign('isEducationStore', $isEducationStore);
            $huoniaoTag->assign('isEducationTutor', $isEducationTutor);
        }
        if ($module == 'info') {
            include(HUONIAOROOT . "/include/config/info.inc.php");
            $huoniaoTag->assign('custom_excitation', $custom_excitation);
            require(HUONIAOINC . "/config/refreshTop.inc.php");
            $huoniaoTag->assign('cfg_info_topPlan', unserialize($cfg_info_topPlan) ? unserialize($cfg_info_topPlan)  : '');
            if ($id) {
                $sql = $dsql->SetQuery("SELECT `waitPay` FROM `#@__infolist` WHERE `id` = $id");
                $res = $dsql->dsqlOper($sql, "results");
                if ($res[0]['waitPay']) {
                    $huoniaoTag->assign('waitPay', $res[0]['waitPay']);
                }
            }
        }


        if ($action == 'post') {
            $module = 'job';
        }
        if ($module == 'sfcar') {
            include(HUONIAOROOT . "/include/config/sfcar.inc.php");
            $huoniaoTag->assign('insertselect', $customInsertselect);
        }
        if ($module == "renovation") {

            $Identity  = array();


            $foremansql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = $userid");
            $foremanret = $dsql->dsqlOper($foremansql, "results");


            if ($foremanret) {
                $foremanarr = array('type' => 'foreman', 'typeid' => '1', 'id' => $foremanret[0]['id']);

                $Identity['foreman'] = $foremanarr;
            } else {

                $Identity['foreman'] = array();
            }

            $teamsql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = $userid");
            $teamret = $dsql->dsqlOper($teamsql, "results");

            if ($teamret) {
                $teamarr = array('type' => 'designer', 'typeid' => '2', 'id' => $teamret[0]['id']);

                $Identity["designer"] = $foremanarr;
            } else {
                $Identity['designer'] = array();
            }

            $storesql  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE  `userid` = $userid");
            $storeres  = $dsql->dsqlOper($storesql, "results");

            if ($storeres) {
                $storearr = array('type' => 'store', 'typeid' => '0', 'id' => $storeres[0]['id']);

                $Identity['store'] = $storearr;
            } else {

                $Identity['store'] = array();
            }
            $huoniaoTag->assign('Identity', $Identity);
            $huoniaoTag->assign('fabutype', $fabutype);
        }
        if ($userinfo['userType'] == 2 && !empty($module) && $module != 'circle' && $module != 'info' && $module != 'sfcar' && $module != 'tieba' && $module != 'vote' && $action != 'order' && $module != 'article' && !verifyModuleAuth(array("module" => $module))) {
            if ($action == 'post' && verifyModuleAuth(array("module" => $module))) {
                $param = array(
                    'service' => 'member',
                    'template' => 'config',
                    'action' => $module
                );
                echo '<script>alert("' . $langData['siteConfig'][27][42] . '");location.href="' . getUrlPath($param) . '"</script>';  //请先配置商家信息！
                die;
            }

            $param = array(
                'service' => 'member',
                'template' => 'servicemeal'
            );

            if ($module) {
                echo '<script>alert("' . $langData['siteConfig'][27][146] . getModuleTitle(array('name' => $module)) . '");location.href="' . getUrlPath($param) . '"</script>';  //请先入驻   模块
            } else {
                header("location:" . getUrlPath($param) . '?from=controller_2051');
            }
            die;
        }
        //发布前验证实名认证
        if ($action == 'fabu') {
            //实名认证
            $f_url = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);

            global $cfg_memberVerified;
            global $cfg_memberVerifiedInfo;
            if ($cfg_memberVerified && (($userinfo['userType'] == 1 && $userinfo['certifyState'] != 1) || ($userinfo['userType'] == 2 && $userinfo['licenseState'] != 1))) {
                $param = array(
                    'service' => 'siteConfig',
                    'template' => 'certification'
                );
                header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=verified');
                die;
            }

            // 手机认证
            global $cfg_memberBindPhone;
            global $cfg_memberBindPhoneInfo;
            global $cfg_periodicCheckPhone;
            global $cfg_periodicCheckPhoneCycle;
            $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
            $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天
            if ($cfg_memberBindPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || ($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle))) {
                $param = array(
                    'service' => 'siteConfig',
                    'template' => 'certification'
                );
                header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=phone');
                die;
            }

            // 关注公众号
            global $cfg_memberFollowWechat;
            global $cfg_memberFollowWechatInfo;
            if ($cfg_memberFollowWechat && !$userinfo['wechat_subscribe']) {
                $param = array(
                    'service' => 'siteConfig',
                    'template' => 'certification'
                );
                header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=wechat');
                die;
            }

            //资讯发布前验证是否入驻自媒体
            if ($module == 'article') {
                $obj = new article();
                $check = $obj->selfmedia_verify($userLogin->getMemberID(), "", "check", $vdata);
                if ($check != "ok") {
                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "config-selfmedia"
                    );
                    $selfmediaurl = getUrlPath($param);
                    $selfmediadInfo = $langData['siteConfig'][33][50]; //请先入驻自媒体！
                    $selfmediadInfo = "您还没有入驻自媒体";
                    die('<meta charset="UTF-8"><script type="text/javascript">alert("' . $selfmediadInfo . '");location.href="' . $selfmediaurl . '";</script>');
                    //header("location:".$url);die;
                }
                $file = HUONIAOINC . "/plugins/5/getInfo.php";
                if (is_file($file)) {
                    $huoniaoTag->assign('reprintUrl', "/include/plugins/5/getInfo.php");
                }

                $huoniaoTag->assign('ac_id', $vdata['id']);
                $huoniaoTag->assign('ac_name', $vdata['ac_name']);
                $huoniaoTag->assign('ac_type', $vdata['type']);
            }
            //家政
            if ($module == 'homemaking') {
                $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__homemaking_store` WHERE `state` = 1 AND `userid` = $userid");
                $res = $dsql->dsqlOper($sql, "results");
                if (empty($res[0]['id'])) {
                    $param = array(
                        "service"  => "member",
                        "template" => "config-homemaking"
                    );
                    $homemakingurl = getUrlPath($param);
                    $homemakingInfo = $langData['homemaking'][8][43]; //请先入驻家政公司！
                    die('<meta charset="UTF-8"><script type="text/javascript">alert("' . $homemakingInfo . '");location.href="' . $homemakingurl . '";</script>');
                    //header("location:".$url);die;
                }
                $huoniaoTag->assign('homemaking_store_title', $res[0]['title']);
                $realmoney = json_decode($res[0]['realprice'], true);
                $huoniaoTag->assign('realmoney', $realmoney);
            }
        }
        $huoniaoTag->assign('module', $module);
        $page = empty($page) ? 1 : $page;
        $huoniaoTag->assign('atpage', $page);
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('do', $do);
        $huoniaoTag->assign('id', (int)$id);
        $huoniaoTag->assign('typeid', (int)$typeid);
        $huoniaoTag->assign('userid', (int)$userid);
        if ($action == "fabu") {
            //只有升级的会员或企业会员才有权限访问 by 20170726
            if ($userinfo['level'] == 0 && $userinfo['userType'] == 1) {
                // $param = array(
                //  "service"  => "member",
                //  "type"     => "user",
                //  "template" => "upgrade"
                // );
                // $url = getUrlPath($param);
                // header("location:" . $url);
                // die;
            }


            //获取图片配置参数
            require(HUONIAOINC . "/config/" . $module . ".inc.php");

            if ($customUpload == 1) {
                $huoniaoTag->assign('thumbSize', $custom_thumbSize);
                $huoniaoTag->assign('thumbType', "*." . str_replace("|", ";*.", $custom_thumbType));
                $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                $huoniaoTag->assign('atlasType', "*." . str_replace("|", ";*.", $custom_atlasType));
            }
            //房产单独配置
            if ($module == "house") {
                if ($type == "sale") {
                    $customAtlasMax = $custom_houseSale_atlasMax;
                } elseif ($type == "zu") {
                    $customAtlasMax = $custom_houseZu_atlasMax;
                } elseif ($type == "xzl") {
                    $customAtlasMax = $custom_houseXzl_atlasMax;
                    // 配套设施
                    $tempSql = $dsql::SetQuery("SELECT `id`,`typename` 'name' FROM `#@__houseitem` WHERE `parentid` = 113 ORDER BY `weight` ASC");
                    $peitaoCfg = $dsql->dsqlOper($tempSql, "results");
                    $peitaoCfgTemp = array();
                    foreach ($peitaoCfg as $peitaoCfgI) {
                        $peitaoCfgTemp[$peitaoCfgI['id']] = array("name" => $peitaoCfgI['name'], "py" => GetPinyin($peitaoCfgI['name']));
                    }
                    $peitaoCfg = $peitaoCfgTemp;
                    $huoniaoTag->assign('peitaoCfg', $peitaoCfg);
                } elseif ($type == "sp") {
                    $customAtlasMax = $custom_houseSp_atlasMax;
                } elseif ($type == "cf") {
                    $customAtlasMax = $custom_houseCf_atlasMax;
                } elseif ($type == "cw") {
                    $customAtlasMax = $custom_houseCw_atlasMax;
                }

                if ($type == "baobei") {
                    if (empty($id)) {
                        header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
                        die;
                    }

                    $loupantitlesql = $dsql->SetQuery("SELECT `title`,`addr`,`fenxiaotitle`,`fenxiaotime` FROM  `#@__house_loupan` WHERE `id` = '$id'");

                    $loupantitleres = $dsql->dsqlOper($loupantitlesql, "results");

                    $huoniaoTag->assign('loupantitle', $loupantitleres[0]['title']);
                    $huoniaoTag->assign('addr', $loupantitleres[0]['addr']);
                    $huoniaoTag->assign('fenxiaotitle', $loupantitleres[0]['fenxiaotitle']);
                    $huoniaoTag->assign('fenxiaotime', date('Y-m-d', $loupantitleres[0]['fenxiaotime']));
                    $huoniaoTag->assign('loupanid', $id);
                    $huoniaoTag->assign('jzrusername', $ret[0]['nickname']);
                    $huoniaoTag->assign('jzrphone', $ret[0]['phone']);
                }
                $customAtlasMax = $customAtlasMax == "" ? 9 : $customAtlasMax;
                $zjusercom      = 0;
                //判断是否经纪人
                if ($do != "edit") {
                    $sql = $dsql->SetQuery("SELECT `id`, `meal` FROM `#@__house_zjuser` WHERE `userid` = $userid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {

                        $config = $ret[0]['meal'] ? unserialize($ret[0]['meal']) : array();
                        $house  = new house();
                        $check  = $house->checkZjuserMeal($config);
                        if ($check['state'] == 200) {
                            $huoniaoTag->assign('zjuserMealInfo', $check['info']);
                        }
                    } else {
                        if ($userinfo['userType'] == 2) {
                            $zjusercom = 1;
                        } elseif ($userinfo['userType'] == 1) {
                            $zjusercom = 2;
                        }
                    }
                }
                $huoniaoTag->assign('zjusercom', $zjusercom);

                $huoniaoTag->assign('customFabuCheckPhone', (int)$customFabuCheckPhone);

                // 分类信息
            } elseif ($module == "info") {

                $huoniaoTag->assign('customFabuCheckPhone', (int)$customFabuCheckPhone);

                //汽车
            } elseif ($module == "car") {
                $_promotion = $userinfo['promotion'];

                //判断保障金是否足额
                if($customfabuShopPromotion > 0 && $_promotion < $customfabuShopPromotion){
                    $param = array(
                        'service' => 'member',
                        'template' => 'promotion'
                    );
                    $url = getUrlPath($param);
                    echo "<script>alert('保障金余额必须大于".$customfabuShopPromotion."元才可以发布商品，请缴纳后发布！');location.href='".$url."';</script>";
                    die;
                }

                $customAtlasMax = $custom_car_atlasMax ? $custom_car_atlasMax : 9;

                //家政
            } elseif ($module == "homemaking") {
                $customAtlasMax = $custom_homemaking_atlasMax ? $custom_homemaking_atlasMax : 9;

                $sql = $dsql->SetQuery("SELECT `flag` FROM `#@__homemaking_list` WHERE `id` = '$id'");

                $res = $dsql->dsqlOper($sql, "results");

                $homemakingHandlers = new handlers("homemaking", "config");
                $homemakingConfig   = $homemakingHandlers->getHandle();
                $homemakingConfig   = $homemakingConfig['info'];

                $homemakingTag_all = $homemakingConfig['homemakingFlag'];
                $homemakingTag_all_ = array();

                if (!empty($res[0]['flag'])) {
                    $homemakingTag_ = explode('|', $res[0]['flag']);
                } else {
                    $homemakingTag_ = array();
                }
                foreach ($homemakingTag_all as $v) {
                    $homemakingTag_all_[] = array(
                        'name' => $v,
                        'icon' => 'b_sertag_' . GetPinyin($v) . '.png',
                        'active' => in_array($v, $homemakingTag_) ? 1 : 0
                    );
                }
                // $realmoney = json_decode($res[0]['realprice'],true);
                $huoniaoTag->assign('homemakingTag_state', $homemakingTag_all_);
                // $huoniaoTag->assign('realmoney', $realmoney);

                //婚嫁
            } elseif ($module == "marry") {
                //婚纱摄影套餐分类
                $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 20 ORDER BY `weight` ASC");
                $results = $dsql->dsqlOper($archives, "results");
                $list = array(0 => '请选择');
                foreach ($results as $value) {
                    $list[$value['id']] = $value['typename'];
                }
                $huoniaoTag->assign('planmealstylelist', $list);
                $huoniaoTag->assign('planmealstyle', $planmealstyle);

                //婚纱摄影-风格
                $fg_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
                $fg_results = $dsql->dsqlOper($fg_archives, "results");
                $fg_archives_list = array(0 => '请选择');
                foreach ($fg_results as $value) {
                    $fg_archives_list[$value['id']] = $value['typename'];
                }
                $huoniaoTag->assign('fg_archives_list', $fg_archives_list);
                //婚纱摄影-场景
                $cj_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 25 ORDER BY `weight` ASC");
                $cj_results = $dsql->dsqlOper($cj_archives, "results");
                $cj_archives_list = array(0 => '请选择');
                foreach ($cj_results as $value) {
                    $cj_archives_list[$value['id']] = $value['typename'];
                }
                $huoniaoTag->assign('cj_archives_list', $cj_archives_list);
                //婚纱摄影新娘婚纱服装
                $stylexn_clothing = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 28 ORDER BY `weight` ASC");
                $xn_clothingresults = $dsql->dsqlOper($stylexn_clothing, "results");
                $clothixn_list = array(0 => '请选择');
                foreach ($xn_clothingresults as $v) {
                    $clothixn_list[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('clothixn_list', $clothixn_list);

                //婚纱摄影新郎婚纱服装
                $stylexl_clothing = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 31 ORDER BY `weight` ASC");
                $xl_clothingresults = $dsql->dsqlOper($stylexl_clothing, "results");
                $xl_clothinglist = array(0 => '请选择');
                foreach ($xl_clothingresults as $v) {
                    $xl_clothinglist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('xl_clothinglist', $xl_clothinglist);
                $huoniaoTag->assign('xl_clothing', $xl_clothing == "" ? 0 : $xl_clothing);

                //婚纱摄影,拍摄场景
                $styleshot = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 35 ORDER BY `weight` ASC");
                $styleshotresults = $dsql->dsqlOper($styleshot, "results");
                $shotlist = array(0 => '请选择');
                foreach ($styleshotresults as $v) {
                    $shotlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('shotlist', $shotlist);
                $huoniaoTag->assign('shot', $shot == "" ? 0 : $shot);
                //婚纱摄影,婚纱内景数量
                $styleinterior = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 39 ORDER BY `weight` ASC");
                $interiorresults = $dsql->dsqlOper($styleinterior, "results");
                $interiorlist = array(0 => '请选择');
                foreach ($interiorresults as $v) {
                    $interiorlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('interiorlist', $interiorlist);
                $huoniaoTag->assign('interior', $interior == "" ? 0 : $interior);
                //婚纱摄影,婚纱外景数量
                $stylelocation = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 44 ORDER BY `weight` ASC");
                $locationresults = $dsql->dsqlOper($stylelocation, "results");
                $locationlist = array(0 => '请选择');
                foreach ($locationresults as $v) {
                    $locationlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('locationlist', $locationlist);
                $huoniaoTag->assign('location', $location == "" ? 0 : $location);
                //婚纱摄影,拍摄天数
                $psdayarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 47 ORDER BY `weight` ASC");
                $psdayresults = $dsql->dsqlOper($psdayarchives, "results");
                $psdaylist = array(0 => '请选择');
                foreach ($psdayresults as $v) {
                    $psdaylist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('psdaylist', $psdaylist);
                $huoniaoTag->assign('psday', $psday == "" ? 0 : $psday);
                //婚纱摄影,拍摄相册数量
                $xcnumberarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 50 ORDER BY `weight` ASC");
                $xcnumberresults = $dsql->dsqlOper($xcnumberarchives, "results");
                $xcnumberlist = array(0 => '请选择');
                foreach ($xcnumberresults as $v) {
                    $xcnumberlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('xcnumberlist', $xcnumberlist);
                $huoniaoTag->assign('xcnumber', $xcnumber == "" ? 0 : $xcnumber);

                //婚纱摄影,拍摄相框数量
                $xknumberarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 53 ORDER BY `weight` ASC");
                $xknumberresults = $dsql->dsqlOper($xknumberarchives, "results");
                $xknumberlist = array(0 => '请选择');
                foreach ($xknumberresults as $v) {
                    $xknumberlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('xknumberlist', $xknumberlist);
                $huoniaoTag->assign('xknumber', $xknumber == "" ? 0 : $xknumber);

                //摄影跟拍选择风格
                $sy_shexiang = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 81 ORDER BY `weight` ASC");
                $shexiangresults = $dsql->dsqlOper($sy_shexiang, "results");
                $shexianglist = array(0 => '请选择');
                foreach ($shexiangresults as $v) {
                    $shexianglist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('shexianglist', $shexianglist);
                $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);
                //摄影跟拍选择类别
                $sy_leibie = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 79 ORDER BY `weight` ASC");
                $sy_leibieresults = $dsql->dsqlOper($sy_leibie, "results");
                $sy_leibielist = array(0 => '请选择');
                foreach ($sy_leibieresults as $v) {
                    $sy_leibielist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('leibielist', $sy_leibielist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                //摄影跟拍 拍摄团队
                $sy_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
                $sy_teamresults = $dsql->dsqlOper($sy_teamarchives, "results");
                $sy_teamlist = array(0 => '请选择');
                foreach ($sy_teamresults as $v) {
                    $sy_teamlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('sy_teamlist', $sy_teamlist);
                $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);

                //珠宝首饰选择材质
                $caizhiarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 70 ORDER BY `weight` ASC");
                $caizhiresults = $dsql->dsqlOper($caizhiarchives, "results");
                $caizhilist = array(0 => '请选择');
                foreach ($caizhiresults as $v) {
                    $caizhilist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('caizhilist', $caizhilist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                //珠宝首饰选择类型
                $zbarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 73 ORDER BY `weight` ASC");
                $zbresults = $dsql->dsqlOper($zbarchives, "results");
                $zblist = array(0 => '请选择');
                foreach ($zbresults as $v) {
                    $zblist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('zblist', $zblist);
                $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);
                //摄像跟拍选择风格
                $sx_shexiang = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 61 ORDER BY `weight` ASC");
                $sx_results = $dsql->dsqlOper($sx_shexiang, "results");
                $sxlist = array(0 => '请选择');
                foreach ($sx_results as $v) {
                    $sxlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('sxlist', $sxlist);
                $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);
                //新娘跟妆选择风格
                $xnarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
                $xnresults = $dsql->dsqlOper($xnarchives, "results");
                $xnlist = array(0 => '请选择');
                foreach ($xnresults as $v) {
                    $xnlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('xnlist', $xnlist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                //新娘跟妆 化妆师资历
                $xn = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
                $resultxn = $dsql->dsqlOper($xn, "results");
                $listnx = array(0 => '请选择');
                foreach ($resultxn as $v) {
                    $listnx[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('listnx', $listnx);
                $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);

                $tagArr = $custommarryTag ? explode("|", $custommarryTag) : array();
                $huoniaoTag->assign('tagArr', $tagArr);
                $huoniaoTag->assign('tagSel', $tagSel);
                if (!empty($tagArr)) $tagArr = join('|', $tagArr);


                $huoniaoTag->assign('tagSel', $tag ? explode("|", $tag) : array());

                //摄像跟拍选择类别
                $sx_leibie = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 58 ORDER BY `weight` ASC");
                $sx_leibieresults = $dsql->dsqlOper($sx_leibie, "results");
                $sx_leibielist = array(0 => '请选择');
                foreach ($sx_leibieresults as $v) {
                    $sx_leibielist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('sx_leibielist', $sx_leibielist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                //摄像跟拍 拍摄团队
                $sx_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
                $sx_teamresults = $dsql->dsqlOper($sx_teamarchives, "results");
                $sx_teamlist = array(0 => '请选择');
                foreach ($sx_teamresults as $v) {
                    $sx_teamlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('sx_teamlist', $sx_teamlist);
                $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);

                //婚纱礼服选择风格
                $hsarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
                $hsarchives = $dsql->dsqlOper($hsarchives, "results");
                $hslist = array(0 => '请选择');
                foreach ($hsarchives as $v) {
                    $hslist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('hslist', $hslist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                //婚纱礼服套餐主推
                $hs_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 86 ORDER BY `weight` ASC");
                $hs_teamresults = $dsql->dsqlOper($hs_teamarchives, "results");
                $hs_teamlist = array(0 => '请选择');
                foreach ($hs_teamresults as $v) {
                    $hs_teamlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('hs_teamlist', $hs_teamlist);
                $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
                //婚纱礼服主推款式
                $zt_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 88 ORDER BY `weight` ASC");
                $zt_teamresults = $dsql->dsqlOper($zt_teamarchives, "results");
                $zt_teamlist = array(0 => '请选择');
                foreach ($zt_teamresults as $v) {
                    $zt_teamlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('zt_teamlist', $zt_teamlist);
                $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
                //婚纱摄影选择风格
                $stylearchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
                $styleresults = $dsql->dsqlOper($stylearchives, "results");
                $stylelist = array(0 => '请选择');
                foreach ($styleresults as $v) {
                    $stylelist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('styleList', $stylelist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                // 主持人
                $hostarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
                $hostresults = $dsql->dsqlOper($hostarchives, "results");
                $hostlist = array(0 => '请选择');
                foreach ($hostresults as $v) {
                    $hostlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('hostlist', $hostlist);
                $huoniaoTag->assign('host', $host == "" ? 0 : $host);
                //婚纱礼服售卖方式
                $cs_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 90 ORDER BY `weight` ASC");
                $cs_teamresults = $dsql->dsqlOper($cs_teamarchives, "results");
                $cs_teamlist = array(0 => '请选择');
                foreach ($cs_teamresults as $v) {
                    $cs_teamlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('cs_teamlist', $cs_teamlist);
                $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
                //策划管理 套餐风格
                $tcarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
                $tcresults = $dsql->dsqlOper($tcarchives, "results");
                $tclist = array(0 => '请选择');
                foreach ($tcresults as $v) {
                    $tclist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('tclist', $tclist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                //策划管理 婚礼类别
                $hlarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 94 ORDER BY `weight` ASC");
                $hlresults = $dsql->dsqlOper($hlarchives, "results");
                $hllist = array(0 => '请选择');
                foreach ($hlresults as $v) {
                    $hllist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('hllist', $hllist);
                $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);

                //策划管理 选择颜色
                $ysarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 97 ORDER BY `weight` ASC");
                $ysresults = $dsql->dsqlOper($ysarchives, "results");
                $yslist = array(0 => '请选择');
                foreach ($ysresults as $v) {
                    $yslist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('yslist', $yslist);
                $huoniaoTag->assign('colour', $colour == "" ? 0 : $colour);
                //策划管理 策划师
                $plannerarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
                $plannerresults = $dsql->dsqlOper($plannerarchives, "results");
                $plannerlist = array(0 => '请选择');
                foreach ($plannerresults as $v) {
                    $plannerlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('plannerlist', $plannerlist);
                $huoniaoTag->assign('planner', $planner == "" ? 0 : $planner);
                //策划管理 督导师
                $supervisorarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
                $supervisorresults = $dsql->dsqlOper($supervisorarchives, "results");
                $supervisorlist = array(0 => '请选择');
                foreach ($supervisorresults as $v) {
                    $supervisorlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('supervisorlist', $supervisorlist);
                $huoniaoTag->assign('supervisor', $supervisor == "" ? 0 : $supervisor);
                //策划管理 主持人
                $ch_hostarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
                $ch_hostresults = $dsql->dsqlOper($ch_hostarchives, "results");
                $ch_hostlist = array(0 => '请选择');
                foreach ($ch_hostresults as $v) {
                    $ch_hostlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('ch_hostlist', $ch_hostlist);
                $huoniaoTag->assign('host', $host == "" ? 0 : $host);
                //策划管理  摄影师
                $photographerarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
                $photographerresults = $dsql->dsqlOper($photographerarchives, "results");
                $photographerlist = array(0 => '请选择');
                foreach ($photographerresults as $v) {
                    $photographerlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('photographerlist', $photographerlist);
                $huoniaoTag->assign('photographer', $photographer == "" ? 0 : $photographer);
                //策划管理  cameraman //摄像师
                $cameramanarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
                $cameramanresults = $dsql->dsqlOper($cameramanarchives, "results");
                $cameramanlist = array(0 => '请选择');
                foreach ($cameramanresults as $v) {
                    $cameramanlist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('cameramanlist', $cameramanlist);
                $huoniaoTag->assign('cameraman', $cameraman == "" ? 0 : $cameraman);
                //套餐类型
                $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 10 ORDER BY `weight` ASC");
                $results = $dsql->dsqlOper($archives, "results");
                $list = array(0 => '请选择');
                foreach ($results as $value) {
                    $list[$value['id']] = $value['typename'];
                }
                $huoniaoTag->assign('protypeList', $list);
                $huoniaoTag->assign('protype', $protype == "" ? 0 : $protype);
                //选择类型
                $stylearchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 12 ORDER BY `weight` ASC");
                $styleresults = $dsql->dsqlOper($stylearchives, "results");
                $stylelist = array(0 => '请选择');
                foreach ($styleresults as $v) {
                    $stylelist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('styleList', $stylelist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);

                //选择类型婚礼主持
                $zcstylearchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 12 ORDER BY `weight` ASC");
                $zcstyleresults = $dsql->dsqlOper($zcstylearchives, "results");
                $zcstylelist = array(0 => '请选择');
                foreach ($zcstyleresults as $v) {
                    $zcstylelist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('zcstylelist', $zcstylelist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);


                //选择主持人风格
                $zcrchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
                $zcresults = $dsql->dsqlOper($zcrchives, "results");
                $zclist = array(0 => '请选择');
                foreach ($zcresults as $v) {
                    $zclist[$v['id']] = $v['typename'];
                }
                $huoniaoTag->assign('zclist', $zclist);
                $huoniaoTag->assign('style', $style == "" ? 0 : $style);
                $huoniaoTag->assign('module', $module);
                if ($type == "field") { //婚宴场地
                    $customAtlasMax = $custom_marryhotelfield_atlasMax ? $custom_marryhotelfield_atlasMax : 9;
                } elseif ($type == "rental") { //婚车
                    $customAtlasMax = $custom_marryweddingcar_atlasMax ? $custom_marryweddingcar_atlasMax : 9;
                } elseif ($type == "case") { //案例
                    $customAtlasMax = $custom_marryplancase_atlasMax ? $custom_marryplancase_atlasMax : 9;
                } elseif ($type == "meal") { //套餐
                    $customAtlasMax = $custom_marryplanmeal_atlasMax ? $custom_marryplanmeal_atlasMax : 9;

                    $sql = $dsql->SetQuery("SELECT `tag` FROM `#@__marry_planmeal` WHERE `id` = '$id'");
                    $res = $dsql->dsqlOper($sql, "results");

                    $marryHandlers = new handlers("marry", "config");
                    $marryConfig   = $marryHandlers->getHandle();
                    $marryConfig   = $marryConfig['info'];

                    $marryTag_all  = $marryConfig['marryTag'];
                    $marryTag_all_ = array();

                    if (!empty($res[0]['tag'])) {
                        $marryTag_ = explode('|', $res[0]['tag']);
                    } else {
                        $marryTag_ = array();
                    }
                    foreach ($marryTag_all as $v) {
                        $marryTag_all_[] = array(
                            'name' => $v,
                            'icon' => 'b_sertag_' . GetPinyin($v) . '.png',
                            'active' => in_array($v, $marryTag_) ? 1 : 0
                        );
                    }

                    $huoniaoTag->assign('marryTag_state', $marryTag_all_);
                }

                //旅游
            } elseif ($module == "travel") {
                if ($type == "hotel") { //酒店
                    $customAtlasMax = $custom_travelhotel_atlasMax ? $custom_travelhotel_atlasMax : 9;
                    require(HUONIAOINC . "/config/travel.inc.php");
                    $customtravelhotelTag = $customtravelhotelTag;
                    $tagArrr = $customtravelhotelTag ? explode("|", $customtravelhotelTag) : array();
                    $huoniaoTag->assign('tagArrr', $tagArrr);


                    //酒店分类
                    $travelHandlers = new handlers($module, "travelhotel_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $module_type = $travelConfig['info'];
                        $huoniaoTag->assign('module_type', $module_type);
                    }

                    //窗户分类
                    $travelHandlers = new handlers($module, "iswindow_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $iswindow_type = $travelConfig['info'];
                        $huoniaoTag->assign('iswindow_type', $iswindow_type);
                    }

                    //房间类型
                    $travelHandlers = new handlers($module, "room_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $room_type = $travelConfig['info'];
                        $huoniaoTag->assign('room_type', $room_type);
                    }

                    //早餐分类
                    $travelHandlers = new handlers($module, "breakfast_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $breakfast_type = $travelConfig['info'];
                        $huoniaoTag->assign('breakfast_type', $breakfast_type);
                    }
                } elseif ($type == "ticket") { //景点门票
                    //景区分类
                    $travelHandlers = new handlers($module, "star_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $star_type = $travelConfig['info'];
                        $huoniaoTag->assign('star_type', $star_type);
                    }
                    $customAtlasMax = $custom_travelticket_atlasMax ? $custom_travelticket_atlasMax : 9;
                } elseif ($type == "rentcar") { //旅游租车
                    $customAtlasMax = $custom_travelrentcar_atlasMax ? $custom_travelrentcar_atlasMax : 9;
                } elseif ($type == "visa") { //旅游签证
                    //入境次数分类
                    $travelHandlers = new handlers($module, "visa_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $visa_type = $travelConfig['info'];
                        $huoniaoTag->assign('visa_type', $visa_type);
                    }
                    $customAtlasMax = $custom_travelvisa_atlasMax ? $custom_travelvisa_atlasMax : 9;
                } elseif ($type == "agency") { //周边游
                    $customAtlasMax = $custom_travelagency_atlasMax ? $custom_travelagency_atlasMax : 9;
                    //景区分类
                    $travelHandlers = new handlers($module, "star_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $star_type = $travelConfig['info'];
                        $huoniaoTag->assign('star_type', $star_type);
                    }

                    $customAtlasMax = $custom_travelagency_atlasMax ? $custom_travelagency_atlasMax : 9;
                    //景区分类
                    $travelHandlers = new handlers($module, "star_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $star_type = $travelConfig['info'];
                        $huoniaoTag->assign('star_type', $star_type);
                    }
                    //周边游分类
                    $travelHandlers = new handlers($module, "travelagency_type");
                    $travelConfig   = $travelHandlers->getHandle();
                    if ($travelConfig['state'] == 100) {
                        $travelagency_type = $travelConfig['info'];
                        $huoniaoTag->assign('travelagency_type', $travelagency_type);
                    }
                } elseif ($type == "strategy") { //旅游攻略
                    $customAtlasMax = $custom_travelstrategy_atlasMax ? $custom_travelstrategy_atlasMax : 9;
                }

                //教育
            } elseif ($module == "education") {
                //是否有教师
                if ($type == "courses") {
                    $userid = $userLogin->getMemberID();
                    $customAtlasMax = $custom_educationcourses_atlasMax ? $custom_educationcourses_atlasMax : 9;
                    $isteacher = 0;
                    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `userid` = $userid");
                    $res = $dsql->dsqlOper($sql, "results");
                    if (!empty($res[0]['id'])) {
                        $storeid = $res[0]['id'];
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_teacher` WHERE `company` = " . $res[0]['id']);
                        $res = $dsql->dsqlOper($sql, "results");
                        if (!empty($res[0]['id'])) {
                            $isteacher = 1;
                        }
                    }
                    $huoniaoTag->assign('isteacher', (int)$isteacher);
                    $huoniaoTag->assign('storeid', (int)$storeid);

                    $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__education_item` WHERE `parentid` = '3'");
                    $res = $dsql->dsqlOper($sql, "results");
                    $huoniaoTag->assign('itemall', $res ? json_encode($res) : '[]');
                }
            } elseif ($module == "shop") {
                if ($type == 'branch') {
                    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_branch_store` WHERE `userid` = $userid");
                    $res = $dsql->dsqlOper($sql, "results");
                    if ($res) {
                        $branchStoreId = $res[0]['id'];
                    }
                }
            } elseif ($module == "pension") {
                if ($type == 'albums') {
                    $storeid = 0;
                    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__pension_store` WHERE `userid` = $userid");
                    $res = $dsql->dsqlOper($sql, "results");
                    if (!empty($res[0]['id'])) {
                        $storeid = 1;
                    }
                }
            } elseif ($module == "renovation") {
                $customAtlasMax = $custom_renovationcourses_atlasMax ? $custom_renovationcourses_atlasMax : 9;
                $ftype = 0;
                if ($typename == "foreman") {
                    $ftype = 1;
                } elseif ($typename == "designer") {
                    $ftype = 2;
                } else {
                    $ftype = 0;
                }
                $huoniaoTag->assign('fid', $fid);
                $huoniaoTag->assign('ftype', $ftype);
                $huoniaoTag->assign('typename', $typename);

                //                if(){
                //
                //                       if($id){
                //                           $detailHandels = new handlers("renovation", "diaryDetail");
                //                           $detailConfig  = $detailHandels->getHandle($id);
                //
                //                           if(is_array($detailConfig) && $detailConfig['state'] == 100){
                //                               $detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
                //                               if(is_array($detailConfig)){
                //                                   foreach ($detailConfig as $key => $value) {
                //                                       $huoniaoTag->assign('detail_'.$key, $value);
                //                                   }
                //                               }
                //
                //                               $huoniaoTag->assign('id', (int)$id);
                //                               $huoniaoTag->assign('module', 'travel');
                //
                //                           }else{
                //                               header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                //                           }
                //                       }
                //                   }

            }
            //            elseif($module =='business'){
            //                 if($type == 'staff'){
            //                     $staffHandlers = new handlers($module, "staffDetail");
            //                     $staffConfig   = $staffHandlers->getHandle($id);
            //                     if(is_array($staffConfig) && $staffConfig['state'] == 100) {
            //                         $detailConfig = $detailConfig['info'];
            //                         if (is_array($detailConfig)) {
            //
            //                             foreach ($detailConfig as $key => $value) {
            //                                     $huoniaoTag->assign('detail_' . $key, $value);
            //                             }
            //                         }
            //                     }
            //                 }
            //
            //            }

            $huoniaoTag->assign('storeid', (int)$storeid);
            $huoniaoTag->assign('atlasMax', (int)$customAtlasMax);
            $huoniaoTag->assign('softSize', (int)$custom_softSize);
            $huoniaoTag->assign('branchStoreId', (int)$branchStoreId);

            global $cfg_videoSize;
            $huoniaoTag->assign('videoSize', (int)$cfg_videoSize);



            $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;

                if ($module != 'business') {
                    require($contorllerFile);
                }

                if ($do == "edit") {
                    global $do;
                    global $oper;
                    $do = "edit";
                    $oper = "user";
                    $param = array(
                        "realServer" => "member",
                        "action" => "detail",
                        "type"   => $type,
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "marry") {
                    $param = array(
                        "action" => "fabu",
                        "type"   => $type,
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "shop" && $type == 'branch') {
                    $param = array(
                        "action" => "fabu",
                        "type"   => $type,
                        "id"     => $id ? $id : $branchStoreId
                    );
                    $module($param);
                }

                if ($module == "awardlegou") {
                    $param = array(
                        "action" => "fabu",
                        "typeid" => $typeid
                    );
                    $module($param);
                }

                if ($module == "travel") {
                    $param = array(
                        "action" => "fabu",
                        "type"   => $type,
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "education") {
                    if ($type == 'tutor' || $type == 'setup') {
                        $id = 1;
                        if ($type == 'setup') {
                            $type = 'tutor';
                        }
                    }
                    $param = array(
                        "action" => "fabu",
                        "type"   => $type,
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "pension") {
                    $param = array(
                        "action" => "fabu",
                        "type"   => $type,
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "homemaking" && empty($type)) {
                    $param = array(
                        "action" => "fabu",
                        "id"     => $id
                    );
                    $module($param);
                } elseif ($module == "homemaking" && $type == 'nanny') {
                    $param = array(
                        "action" => "nannydetail",
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "car") {
                    $param = array(
                        "action" => "fabu",
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "info") {
                    $param = array(
                        "action" => "category",
                        "typeid" => $typeid
                    );
                    $module($param);
                }

                if ($module == "tuan") {
                    $param = array(
                        "action" => "fabu",
                        "id"     => $id
                    );
                    $module($param);
                }

                if ($module == "shop") {
                    $param = array(
                        "action" => "fabu",
                        "typeid" => $typeid
                    );
                    $module($param);
                }

                if ($module == "build") {
                    $param = array(
                        "action" => "fabu"
                    );
                    $module($param);
                }

                if ($module == "furniture") {
                    $param = array(
                        "action" => "fabu"
                    );
                    $module($param);
                }

                if ($module == "home") {
                    $param = array(
                        "action" => "fabu"
                    );
                    $module($param);
                }

                if ($module == "waimai") {
                    $param = array(
                        "action" => "fabu",
                        "id" => $id
                    );
                    $module($param);
                }

                if ($module == "huodong") {
                    $param = array(
                        "action" => "fabu",
                        "id" => $id
                    );
                    $module($param);
                }

                if ($module == "website") {
                    $param = array(
                        "action" => "fabu",
                        "act" => $type,
                        "id" => $id
                    );
                    $module($param);
                }

                if ($module == "business" && $type != 'custom_menu') {
                    $param = array(
                        "action" => "fabu",
                        "act" => $type,
                        "id" => $id
                    );
                    $module($param);
                }

                if ($module == "vote") {
                    $param = array(
                        "action" => "fabu",
                        "id" => $id
                    );
                    $module($param);
                }

                if ($module == "live") {
                    if (!empty($id)) {
                        global $userLogin;
                        global $dsql;
                        global $cfg_secureAccess;
                        global $cfg_basehost;
                        //$sql = $dsql->SetQuery("SELECT `title`,`click`,`litpic`,`ftime`,`typeid`,`catid`,`flow`,`way`,`pushurl` FROM `huoniao_livelist` where id =(SELECT max(`id`) i FROM `#@__livelist` where user='$userid')");
                        $sql = $dsql->SetQuery("SELECT `id`,`title`,`click`,`litpic`,`startmoney`,`endmoney`,`password`,`ftime`,`typeid`,`catid`,`flow`,`way`,`pushurl`,`note`,`menu`,`pulltype`,`pullurl_pc`,`pullurl_touch`,`lng`,`lat`, `location`,`state` FROM `#@__livelist` where id='$id'");
                        $res = $dsql->dsqlOper($sql, "results");
                        if ($res) {

                            $litpicS   = $res[0]['litpic'];
                            $litpic    = !empty($res[0]['litpic']) ? (strpos($res[0]['litpic'], 'images') ? $cfg_secureAccess . $cfg_basehost . $res[0]['litpic'] : getFilePath($res[0]['litpic'])) : $cfg_secureAccess . $cfg_basehost . '/static/images/404.jpg';

                            $typeid        = $res[0]['typeid'];
                            $title         = empty($res[0]['title'])   ? $langData['siteConfig'][34][39] : $res[0]['title']; //无标题
                            $ftime         = !empty($res[0]['ftime']) ? date("Y-m-d H:i:s", $res[0]['ftime']) : date("Y-m-d H:i:s", time());
                            $password      = $res[0]['password'];
                            $way           = $res[0]['way'];
                            $catid         = $res[0]['catid'];
                            $startmoney    = $res[0]['startmoney'];
                            $endmoney      = $res[0]['endmoney'];
                            $flow          = $res[0]['flow'];
                            $note          = $res[0]['note'];
                            $location      = $res[0]['location'];
                            $menu          = $res[0]['menu'];
                            $pushurl       = $res[0]['pushurl'];
                            $pulltype      = $res[0]['pulltype'];
                            $pullurl_pc    = $res[0]['pullurl_pc'];
                            $pullurl_touch = $res[0]['pullurl_touch'];
                            $state         = $res[0]['state'];
                            $lnglat = '';
                            if (!empty($res[0]['lng']) && !empty($res[0]['lat'])) {
                                $lnglat    = $res[0]['lng'] . ',' . $res[0]['lat'];
                            }

                            //直播中或已经结束的，不可以修改
                            if ($state) {
                                $urlparam = array(
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "livedetail",
                                    "param"    => "id=" . $id
                                );
                                $url  = getUrlPath($urlparam);
                                header('location:' . $url);
                                die;
                            }

                            $huoniaoTag->assign('lnglat', $lnglat);
                            $huoniaoTag->assign('catid', $catid);
                            $huoniaoTag->assign('typeid', $typeid);
                            $huoniaoTag->assign('location', $location);
                            $huoniaoTag->assign('flow', $flow);
                            $huoniaoTag->assign('way', $way);
                            $huoniaoTag->assign('ftime', $ftime);
                            $huoniaoTag->assign('ftime_', $res[0]['ftime']);
                            $huoniaoTag->assign('title', $title);
                            $huoniaoTag->assign('litpic', $litpic);
                            $huoniaoTag->assign('password', $password);
                            $huoniaoTag->assign('startmoney', $startmoney);
                            $huoniaoTag->assign('endmoney', $endmoney);
                            $huoniaoTag->assign('flow', $flow);
                            $huoniaoTag->assign('litpicS', $litpicS);
                            $huoniaoTag->assign('note', $note);
                            $huoniaoTag->assign('menuArr', $menu ? unserialize($menu) : array());
                            $huoniaoTag->assign('pulltype', $pulltype);
                            $huoniaoTag->assign('pushurl', $pushurl);
                            $huoniaoTag->assign('pullurl_pc', $pullurl_pc);
                            $huoniaoTag->assign('pullurl_touch', $pullurl_touch);
                        }
                    }
                    $urlparam = array(
                        "service"     => "member",
                        "type"         => "user",
                        "template"    => "livedetail"
                    );
                    $url  = getUrlPath($urlparam);
                    $huoniaoTag->assign('url', $url);
                }


                if ($type == 'custom_menu') {
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__business_menu` WHERE `uid` = $userid ORDER BY `weight`, `id`");
                    $res = $dsql->dsqlOper($sql, "results");

                    $huoniaoTag->assign('menuList', $res);
                }
            }

            //团队
        } elseif ($action == "teamAdd") {

            $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;
                require($contorllerFile);

                if (!empty($id)) {
                    $param = array(
                        "id"     => $id,
                        "action" => "designer-detail"
                    );
                    $module($param);
                }
            }

            $huoniaoTag->assign('identity', $identity);
            //效果图
        } elseif ($action == "albumsAdd") {

            $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;
                require($contorllerFile);

                if (!empty($id)) {
                    $param = array(
                        "id"     => $id,
                        "action" => "albums-detail"
                    );
                    $module($param);
                }

                require(HUONIAOINC . "/config/renovation.inc.php");

                if ($customUpload == 1) {
                    $huoniaoTag->assign('thumbSize', $custom_thumbSize);
                    $huoniaoTag->assign('thumbType', "*." . str_replace("|", ";*.", $custom_thumbType));
                    $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                    $huoniaoTag->assign('atlasType', "*." . str_replace("|", ";*.", $custom_atlasType));
                }

                $huoniaoTag->assign('atlasMax', (int)$custom_case_atlasMax);

                $param = array("action" => "getDesignerByEnter");
                $module($param);
            }

            //案例
        } elseif ($action == "caseAdd") {

            $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;
                require($contorllerFile);

                if (!empty($id)) {
                    $param = array(
                        "id"     => $id,
                        "action" => "case-detail"
                    );
                    $module($param);
                }

                require(HUONIAOINC . "/config/renovation.inc.php");

                if ($customUpload == 1) {
                    $huoniaoTag->assign('thumbSize', $custom_thumbSize);
                    $huoniaoTag->assign('thumbType', "*." . str_replace("|", ";*.", $custom_thumbType));
                    $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                    $huoniaoTag->assign('atlasType', "*." . str_replace("|", ";*.", $custom_atlasType));
                }

                $huoniaoTag->assign('atlasMax', (int)$custom_diary_atlasMax);

                $param = array("action" => "getDesignerByEnter");
                $module($param);
            }

            //职位
        } elseif ($action == "post" && ($do == "add" || $do == "edit")) {

            $module = "job";
            $userid = $userLogin->getMemberID();

            $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
            if (file_exists($contorllerFile)) {
                $handler = true;
                require($contorllerFile);
            }

            $param = array(
                'service' => 'member',
                'template' => 'config',
                'action' => $module
            );

            //判断公司状态
            $userSql    = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__job_company` WHERE `userid` = " . $userid);
            $userResult = $dsql->dsqlOper($userSql, "results");
            if (!$userResult) {
                echo '<script>alert("您还未开通招聘公司店铺！");location.href="' . getUrlPath($param) . '"</script>';
                die;
            }

            if ($userResult[0]['state'] == 0) {
                echo '<script>alert("您的公司信息还在审核中，请通过审核后再发布！");location.href="' . getUrlPath($param) . '"</script>';
                die;
            }

            if ($userResult[0]['state'] == 2) {
                echo '<script>alert("您的公司信息审核失败，请通过审核后再发布！");location.href="' . getUrlPath($param) . '"</script>';
                die;
            }

            if (!empty($id)) {

                global $oper;
                $oper = "user";

                $param = array(
                    "id"     => $id,
                    "action" => "job"
                );
                $module($param);
            } else {
                $userLogin->checkUserIsLogin();
                $userid = $userLogin->getMemberID();
                $sql = $dsql->SetQuery("SELECT `contact`, `email` FROM `#@__job_company` WHERE `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $huoniaoTag->assign('job_tel', $ret[0]['contact']);
                    $huoniaoTag->assign('job_email', $ret[0]['email']);
                }
            }

            //房产经纪人/中介公司收到的入驻申请/收到的房源委托
        } elseif ($action == "house-broker" || $action == "house_receive_broker" || $action == "house_entrust") {

            $comid = 0;
            $userid = $userLogin->getMemberID();
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $comid = $ret[0]['id'];
            }
            $huoniaoTag->assign('comid', $comid);
            $huoniaoTag->assign('id', (int)$id);

            // 统计
        } elseif ($action == "statistics") {

            $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
            if (file_exists($contorllerFile)) {
                $handler = true;
                require($contorllerFile);
            }

            if ($module == "vote") {
                $param = array(
                    "action" => "detail",
                    "id" => $id
                );
                $module($param);
            }

            //汽车顾问 入驻申请 委托卖车
        } elseif ($action == "car_entrust" || $action == "car-broker" || $action == "car_receive_broker") {
            $comid = 0;
            $userid = $userLogin->getMemberID();
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $comid = $ret[0]['id'];
            }
            $huoniaoTag->assign('comid', $comid);
            $huoniaoTag->assign('id', (int)$id);
        }
        // 黄页
        if ($module == "huangye") {
            $userid = $userLogin->getMemberID();

            $typeHandels = new handlers($module, "type");
            $typeConfig  = $typeHandels->getHandle(array("son" => 1));
            if ($typeConfig && $typeConfig['state'] == 100) {
                $typeList = $typeConfig['info'];
            } else {
                $typeList = array();
            }
            $huoniaoTag->assign('typeList', $typeList);

            $sql = $dsql->SetQuery("SELECT * FROM `#@__huangyelist` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            // print_r($ret);
            if ($ret) {
                $id = $ret[0]['id'];
                foreach ($ret[0] as $key => $value) {
                    if ($key == "pics") {
                        $value = !empty($value) ? explode(",", $value) : array();
                    }
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                $lnglat  = $ret[0]['longitude'] . "," . $ret[0]['latitude'];
                $huoniaoTag->assign('detail_lnglat', $lnglat == "," ? "" : $lnglat);

                // 获取导航内容
                $navSql  = $dsql->SetQuery("SELECT *  FROM `#@__huangyenav` WHERE `aid` = " . $id . " ORDER BY `weight` ASC");
                $navRet = $dsql->dsqlOper($navSql, "results");
                if (!$navRet) {
                    $navList = array();
                } else {
                    $navList = $navRet;
                }

                $huoniaoTag->assign('navList', $navList);
            } else {
                $id = 0;
            }
            $huoniaoTag->assign('id', $id);
        }

        //家政 当前会员是否为派单人员
        global $installModuleArr;
        if ($action == "order" || $action == "orderlist") {
            if (in_array('homemaking', $installModuleArr)) {
                $userid = $userLogin->getMemberID();
                $sql = $dsql->SetQuery("SELECT `id`,`company` FROM `#@__homemaking_personal` WHERE `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                $huoniaoTag->assign('personalId', !empty($ret) && is_array($ret) ? (int)$ret[0]['id'] : 0);
                $huoniaoTag->assign('dspid', $ret[0]['id'] ? $ret[0]['id'] : ' ');
            }
        }

        if ($action == "order" && in_array('shop', $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_branch_store` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            $huoniaoTag->assign('branchStorelId', $ret[0]['id'] ? $ret[0]['id'] : 0);


            if ($module == 'shop') {

                $cattime = GetMkTime(time());

                $cattime = $cattime + 3600 * 24 * 3;

                $proquansql  = $dsql->SetQuery("SELECT q.`id` FROM `#@__shop_order` o LEFT  JOIN `#@__shopquan` q ON o.`id` = q.`orderid` WHERE `expireddate` > $cattime AND q.`usedate` = 0 AND o.`userid` ='$userid' AND o.`orderstate` != 4 AND o.`orderstate` != 7 AND o.`orderstate` != 10");
                $proquanres  = $dsql->dsqlOper($proquansql, "totalCount");

                $huoniaoTag->assign('proquanres', $proquanres);
            }
        }



        //发布成功
        if ($action == "fabusuccess") {
            require(HUONIAOINC . "/config/refreshTop.inc.php");
            if (in_array($module, $installModuleArr)) {
                // if ($module == "info") {
                    $titleBlodlDay   = $cfg_info_titleBlodlDay;
                    $titleBlodlPrice = $cfg_info_titleBlodlPrice;
                    $titleRedDay     = $cfg_info_titleRedDay;
                    $titleRedPrice   = $cfg_info_titleRedPrice;

                    $tab = '';
                    if ($module == "car" || $module == "huodong" || $module == "tieba" || $module == "vote" || $module == "sfcar") {
                        $tab = $module . "_list";
                    } elseif ($module == "education") {
                        $tab = $module . "_courses";
                    } else {
                        $tab = $module . "list";
                    }

                    $admin = "admin";
                    if ($module == "car" || $module == "info" || $module == "house" || $module == "sfcar") {
                        $admin = "userid";
                    } elseif ($module == "huodong" || $module == "tieba") {
                        $admin = "uid";
                    } elseif ($module == "live") {
                        $admin = "user";
                    }

                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `" . $admin . "` = $userid AND`id` = $id");
                // }
                $ret = $dsql->dsqlOper($sql, "results");
                if (empty($ret)) {
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "action"   => "manage",
                        "template" => $module
                    );
                    $url = getUrlPath($param);
                    header("location:" . $url);
                    die;
                }

                $huoniaoTag->assign('titleBlodlDay', $titleBlodlDay);
                $huoniaoTag->assign('titleBlodlPrice', $titleBlodlPrice);
                $huoniaoTag->assign('titleRedDay', $titleRedDay);
                $huoniaoTag->assign('titleRedPrice', $titleRedPrice);
            }
            
        } elseif ($action == "fabu_job_seek") {
            $detailHandels = new handlers("job", "getItem");
            $detailConfig  = $detailHandels->getHandle(array("name" => "pgeducation,pgwelfare"));
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                $huoniaoTag->assign("jobItems", $detailConfig);
            }
        }
        // 企业会员没有入驻此模块
        // if($userinfo['userType'] == 2 && $module && $module != 'waimai' && $module != 'paotui' && $module != 'circle'){
        //
        //  if(!verifyModuleAuth(array("module" => $module))){
        //
        //
        //      $param = array(
        //          "service"  => "member",
        //          "template" => "module"
        //      );
        //      if(isMobile()){
        //          $param['template'] = 'appmanage';
        //      }
        //      $url = getUrlPath($param);
        //
        //      $furl = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
        //
        //      header("location:" . $url . "?furl=" . $furl);
        //      die;
        //  }
        // }
        return;

        //商铺配置
    } elseif ($action == "config") {
        $uid = $userLogin->getMemberID();
        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('yingye', (int)$yingye);

        if ($module == 'shop') {
            include HUONIAOINC . "/config/shop.inc.php";
            $tuan = $dsql->SetQuery("SELECT `promotype` FROM `#@__shop_product` WHERE `promotype` = 1 AND `store` = '$id'");
            $tuanresult = $dsql->dsqlOper($tuan, "results");
            $tuantype = 0;
            if ($tuanresult) {
                $tuantype = 1;
            }
            $huoniaoTag->assign('tuantype', $tuantype);
            $huoniaoTag->assign('shopCourierState', (int)$custom_shopCourierState);  //平台配送开关，0启用  1禁用

            //0混合  1到店优惠  2送到家
            $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
            $huoniaoTag->assign('custom_huodongshoptypeopen', $huodongshoptypeopen);
        
            //销售类型 1到店消费  3商家自配  4快递
            $saleType = $custom_saleType == '' ? array('1', '3','4') : explode(",", $custom_saleType);
            $huoniaoTag->assign('custom_saleType', $saleType);

            //判断商铺是否配置过
            $configstore = $dsql->SetQuery("SELECT `id`,`shoptype`,`express`,`toshop` FROM `#@__shop_store` WHERE `userid` = '$uid'");
            $storeres = $dsql->dsqlOper($configstore, "results");
            $configstate = $detail_shoptype = 0;
            if ($storeres) {
                $configstate  = 1;
                $detail_shoptype = (int)$storeres[0]['shoptype'];
            }

            $huoniaoTag->assign('shoptype',  $detail_shoptype == "" ? ($huodongshoptypeopen != 0 ? $huodongshoptypeopen : 1) : $detail_shoptype);
            $huoniaoTag->assign('configstate', $configstate);
            $fabustatus = 0;
            if ($storeres[0]['shoptype'] == 1 && $storeres[0]['express'] == 1 && $storeres[0]['toshop'] == 1) {
                $fabustatus = 1;
            } elseif ($storeres[0]['shoptype'] == 2) {                //电商类型
                $fabustatus = 1;
            }
            if ($storeres[0]['id']) {
                $id = $storeres[0]['id'];
            }
            $huoniaoTag->assign('id', (int)$id);
            $huoniaoTag->assign('shopPeisongState', $customshopPeisongState);
            $huoniaoTag->assign('fabustatus', $fabustatus);
            $huoniaoTag->assign('$customqualification', $customqualification != '' ? explode("|", $customqualification) : array());

            //入驻审核开关
            include HUONIAOINC . "/config/shop.inc.php";
            $huoniaoTag->assign('editModuleJoinCheck', $customEditJoinCheck);
        }
        if ($module == "business" && isMobile()) {
            $url_ = GetCurUrl();
            $url = getUrlPath(array("service" => "member", "type" => "user", "template" => "business-config"));
            if (!strstr($url, $url_)) {
                header("location:" . $url);
                die;
            }
        }


        $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';

        //获取图片配置参数
        require(HUONIAOINC . "/config/" . $module . ".inc.php");
        $huoniaoTag->assign('atlasMax', $customAtlasMax);
        $huoniaoTag->assign('storeatlasMax', $custom_store_atlasMax);
        if ($module == 'shop') {

            $tuanTag =  $customtuanTag != '' ? explode("|", $customtuanTag) : array();

            $huoniaoTag->assign('tuanTag', $tuanTag);

            /*商家资质*/
            $Sql = $dsql->SetQuery("SELECT `typename`,`id` FROM `#@__shop_authattr`");
            $Res = $dsql->dsqlOper($Sql, "results");

            $huoniaoTag->assign('authattr', $Res ? $Res : array());
        }

        //汽车
        if ($module == 'car') {
            // 获取商家模块公共配置
            $uid = $userLogin->getMemberID();

            //查询是否填写过入驻申请
            $sql = $dsql->SetQuery("SELECT `tag` FROM `#@__car_store` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");

            $carHandlers = new handlers("car", "config");
            $carConfig   = $carHandlers->getHandle();
            $carConfig   = $carConfig['info'];

            $carTag_all = $carConfig['carTag'];
            $carTag_all_ = array();

            if (!empty($ret[0]['tag'])) {
                $carTag_ = explode('|', $ret[0]['tag']);
            } else {
                $carTag_ = array();
            }
            foreach ($carTag_all as $v) {
                $carTag_all_[] = array(
                    'name' => $v,
                    'icon' => 'b_sertag_' . GetPinyin($v) . '.png',
                    'active' => in_array($v, $carTag_) ? 1 : 0
                );
            }

            $huoniaoTag->assign('carTag_state', $carTag_all_);
        } elseif ($module == 'travel') { //旅游
            $travelHandlers = new handlers($module, "module_type");
            $travelConfig   = $travelHandlers->getHandle();
            if ($travelConfig['state'] == 100) {
                $module_type = $travelConfig['info'];
                $huoniaoTag->assign('module_type', $module_type);
            }
        } elseif ($module == 'pension') { // TODO 养老机构
            $pensionHandlers = new handlers($module, "pensionitem");
            $pensionConfig   = $pensionHandlers->getHandle(array("type" => 2));
            if ($pensionConfig['state'] == 100) {
                $jglx_type = $pensionConfig['info']; //print_R($jglx_type);exit;
                $huoniaoTag->assign('jglx_type', $jglx_type);
            }

            $pensionConfig   = $pensionHandlers->getHandle(array("type" => 5));
            if ($pensionConfig['state'] == 100) {
                $fwnr_type = $pensionConfig['info'];
                $huoniaoTag->assign('fwnr_type', $fwnr_type);
            }

            $pensionConfig   = $pensionHandlers->getHandle(array("type" => 1));
            if ($pensionConfig['state'] == 100) {
                $zgdx_type = $pensionConfig['info'];
                $huoniaoTag->assign('zgdx_type', $zgdx_type);
            }

            $pensionConfig   = $pensionHandlers->getHandle(array("type" => 3));
            if ($pensionConfig['state'] == 100) {
                $fjlx_type = $pensionConfig['info'];
                $huoniaoTag->assign('fjlx_type', $fjlx_type);
            }

            $pensionConfig   = $pensionHandlers->getHandle(array("type" => 4));
            if ($pensionConfig['state'] == 100) {
                $tsfw_type = $pensionConfig['info'];
                $huoniaoTag->assign('tsfw_type', $tsfw_type);
            }
        }

        if (file_exists($contorllerFile)) {
            //声明以下均为接口类
            $handler = true;
            require_once($contorllerFile);

            $param = array(
                "action" => "storeDetail",
            );

            $module($param);


            // 获取商家公共配置
            $businessHandlers = new handlers("business", "storeDetail");
            $businessDetail = $businessHandlers->getHandle();

            if (is_array($businessDetail) && $businessDetail['state'] != 200) {
                $businessDetail = $businessDetail['info'];
            }
            $huoniaoTag->assign('businessDetail', $businessDetail);

            if ($module == "house") {
                $zjcom = 0;
                $sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjcom` WHERE `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $zjcom = 1;
                }
                $huoniaoTag->assign("zjcom", $zjcom);
            } elseif ($module == "car") {
                $zjcom = 0;
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $zjcom = 1;
                }
                $huoniaoTag->assign("zjcom", $zjcom);
            } elseif ($module == "education") {
                $zjcom = 0;
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $zjcom = 1;
                }
                $huoniaoTag->assign("zjcom", $zjcom);
            }

            // 配置页面显示模板列表
            global $template;
            global $module;
            if ($template == 'config' && ($module == 'member' || $module == 'website')) {
                //touch模板
                $dir = HUONIAOROOT . "/templates/website/";
                $floders = listDir($dir . '/touch');
                $skins = array();
                if (!empty($floders)) {
                    $i = 0;
                    foreach ($floders as $key => $floder) {
                        $config = $dir . '/touch/' . $floder . '/config.xml';
                        if (file_exists($config)) {
                            //解析xml配置文件
                            $xml = new DOMDocument();
                            libxml_disable_entity_loader(false);
                            $xml->load($config);
                            $data = $xml->getElementsByTagName('Data')->item(0);
                            $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                            $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                            $skins[$i]['tplname'] = $tplname;
                            $skins[$i]['directory'] = $floder;
                            $skins[$i]['copyright'] = $copyright;
                            $i++;
                        }
                    }
                }
                $huoniaoTag->assign('touchTplList', $skins);
                $huoniaoTag->assign('touchTemplate', $customTouchTemplate);
            }
        }

        //店铺商品分类
    } elseif ($action == "category") {

        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('module', $module);

        global $userLogin;
        $userid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `userid` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $huoniaoTag->assign('storeid', $ret[0]['id']);
        }

        $detailHandels = new handlers($module, "category");
        $detailConfig  = $detailHandels->getHandle(array("son" => 1));

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig  = $detailConfig['info'];
            if (is_array($detailConfig)) {

                $huoniaoTag->assign('typeList', $detailConfig);
            }
        }
        return;

        //商城发布商品选择模板
    } elseif ($action == "shop_modtype") {

        //实名认证
        $f_url = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);

        global $cfg_memberVerified;
        global $cfg_memberVerifiedInfo;
        if ($cfg_memberVerified && (($userinfo['userType'] == 1 && $userinfo['certifyState'] != 1) || ($userinfo['userType'] == 2 && $userinfo['licenseState'] != 1))) {
            $param = array(
                'service' => 'siteConfig',
                'template' => 'certification'
            );
            header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=verified');
            die;
        }

        // 手机认证
        global $cfg_memberBindPhone;
        global $cfg_memberBindPhoneInfo;
        global $cfg_periodicCheckPhone;
        global $cfg_periodicCheckPhoneCycle;
        $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
        $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天
        if ($cfg_memberBindPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || ($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle))) {
            $param = array(
                'service' => 'siteConfig',
                'template' => 'certification'
            );
            header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=phone');
            die;
        }

        // 关注公众号
        global $cfg_memberFollowWechat;
        global $cfg_memberFollowWechatInfo;
        if ($cfg_memberFollowWechat && !$userinfo['wechat_subscribe']) {
            $param = array(
                'service' => 'siteConfig',
                'template' => 'certification'
            );
            header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=wechat');
            die;
        }

        $uid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        $_promotion = $userinfo['promotion'];

        //如果是员工账号，以下数据按商家账号查询
        if ($userinfo['is_staff'] == 1) {
            $uid = $userinfo['companyuid'];
            $_userinfo = $userLogin->getMemberInfo($uid);
            $_promotion = $_userinfo['promotion'];
        }

        include HUONIAOINC . "/config/shop.inc.php";

        if($customfabuShopPromotion > 0 && $_promotion < $customfabuShopPromotion){
            $param = array(
                'service' => 'member',
                'template' => 'promotion'
            );
            $url = getUrlPath($param);
            echo "<script>alert('保障金余额必须大于".$customfabuShopPromotion."元才可以发布商品，请缴纳后发布！');location.href='".$url."';</script>";
            die;
        }
        
        //判断商铺是否配置过
        $configstore = $dsql->SetQuery("SELECT `id`,`shoptype`,`express`,`toshop` FROM `#@__shop_store` WHERE `userid` = '$uid'");
        $storeres = $dsql->dsqlOper($configstore, "results");
        $huoniaoTag->assign('shoptype', $storeres[0]['shoptype']);
        $fabustatus = 0;
        if ($storeres[0]['shoptype'] == 1 && $storeres[0]['express'] == 1 && $storeres[0]['toshop'] == 1) {
            $fabustatus = 1;
        } elseif ($storeres[0]['shoptype'] == 2) {                //电商类型
            $fabustatus = 1;
        }

        if(!$storeres){
            $param = array(
                "service" => "member",
                "template" => "config",
                "action" => "shop"
            );
            $shopUrl = getUrlPath($param);
            $back = 'window.location.href = "'.$shopUrl.'"';
            $infos = "请先开通商城店铺！";
            echo '<script>setTimeout(function(){alert("'.$infos.'");'.$back.'}, 500)</script>';
            die;
        }

        $huoniaoTag->assign('fabustatus', $fabustatus);

        //0混合  1到店优惠  2送到家
        $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
        $huoniaoTag->assign('custom_huodongshoptypeopen', $huodongshoptypeopen);

        //运费模板
    } elseif ($action == "logistic") {

        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('do', $do);
        $huoniaoTag->assign('id', (int)$id);

        $contorllerFile = dirname(__FILE__) . '/' . $module . '.controller.php';
        if (file_exists($contorllerFile)) {
            //声明以下均为接口类
            $handler = true;
            require_once($contorllerFile);

            if ($id != 0) {
                $param = array(
                    "action" => "logisticDetail",
                    "id"     => $id
                );
                $module($param);
            } else {
                $param = array(
                    "action" => "logistic"
                );
                $module($param);
            }
        }
        // 获取会员列表
    } elseif ($action == "memberList") {


        //首页
    } elseif ($template == "index" || $template == "free") {
        $userid = $userLogin->getMemberID();

        $branch = 0;
        global $installModuleArr;
        if (in_array('shop', $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT t.`id`branchid,t.`title`, t.`tel`, t.`qq`, t.`address`,t.`project`,y.`typename`industry,t.`qq`,t.`wechatcode`,s.`title`stitle,t.`people`,t.`logo` FROM `#@__shop_store` s RIGHT JOIN `#@__shop_branch_store` t ON t.`branchid` = s.`id` LEFT JOIN `#@__shop_type` y ON t.`industry` = y.`id` WHERE s.`userid` = " . $userid);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret && is_array($ret)){
                $branch = 1;
            }
        }
        $huoniaoTag->assign('branch', $branch);

        $preview = $_GET['preview'];
        $preview = (int)$preview;

        //手机版首页不需要验证是否登录 by:20161231 guozi
        if (!isMobile() && !$preview) {
            $userLogin->checkUserIsLogin();
        }

        //个人会员移动端首页模板自定义
        global $cfg_userCenterTouchTemplateType;
        global $cfg_busiCenterTouchTemplateType;
        $userCenterTouchTemplateType = (int)$cfg_userCenterTouchTemplateType;
        $busiCenterTouchTemplateType = (int)$cfg_busiCenterTouchTemplateType;

        global $cfg_basedomain;
        global $userDomain;
        global $busiDomain;
        global $cfg_staticPath;
        global $dirDomain;

        //判断是否企业会员中心
        $ischeck = explode($busiDomain, $dirDomain);

        //个人会员中心DIY模式
        if($userCenterTouchTemplateType && isMobile() && count($ischeck) <= 1){

            //获取模板配置信息
            $detailHandels = new handlers("siteConfig", "userCenterDiy");
            $detailConfig  = $detailHandels->getHandle(array("preview" => $preview));
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {

                $templateConfig = $detailConfig['info'];
                $huoniaoTag->assign('config', is_array($templateConfig) ? json_encode($templateConfig, JSON_UNESCAPED_UNICODE) : array());

                
                $huoniaoTag->assign('userDomain', $userDomain);
                $huoniaoTag->assign('busiDomain', $busiDomain);
                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径
                $huoniaoTag->assign('templets_skin', $cfg_basedomain . '/templates/member/touch/');  //模板路径

                $templates = HUONIAOROOT . '/templates/member/touch/index_diy.html';
                if(file_exists($tplDir.$templates)){
                    $huoniaoTag->display($templates);
                }else{
                    die('index_diy.html模板文件不存在，请到后台商店同步此文件后重新访问！');
                }
                die;
                
            }
        }

        //商家会员中心DIY模式
        if($busiCenterTouchTemplateType && isMobile() && count($ischeck) > 1){

            //获取模板配置信息
            $detailHandels = new handlers("siteConfig", "busiCenterDiy");
            $detailConfig  = $detailHandels->getHandle(array("preview" => $preview));
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {

                $templateConfig = $detailConfig['info'];
                $huoniaoTag->assign('config', is_array($templateConfig) ? json_encode($templateConfig, JSON_UNESCAPED_UNICODE) : array());

                
                $huoniaoTag->assign('userDomain', $userDomain);
                $huoniaoTag->assign('busiDomain', $busiDomain);
                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径
                $huoniaoTag->assign('templets_skin', $cfg_basedomain . '/templates/member/company/touch/diy/');  //模板路径

                $templates = HUONIAOROOT . '/templates/member/company/touch/diy/index.html';
                if(file_exists($tplDir.$templates)){
                    $huoniaoTag->display($templates);
                }else{
                    die('商家会员中心DIY模板文件不存在，请到后台商店同步此文件后重新访问！');
                }
                die;
                
            }
        }



        //获取自定义封面背景图片
        $userinfo = $userLogin->getMemberInfo();
        $userid = $userLogin->getMemberID();

        //移动端商家中心个人会员不得进入
        if ($userinfo['userType'] == 1 && isMobile()) {
            $userLogin->checkUserIsLogin();
        }

        if ($userid > 0) {
            //查询签到信息
            global $cfg_qiandao_state;
            if ($cfg_qiandao_state && $userid > 0) {
                //统计登录会员总签到天数
                $totalQiandao = 0;
                $sql = $dsql->SetQuery("SELECT `id`, `date` FROM `#@__member_qiandao` WHERE `uid` = $userid ORDER BY `date` DESC");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $totalQiandao = count($ret);
                }
                $huoniaoTag->assign("totalQiandao", $totalQiandao);

                //判断是否已经签到
                $todayQiandao = 0;
                if ($ret) {
                    $lastQiandao = GetMkTime(date("Y-m-d", $ret[0]['date']));
                    $today = GetMkTime(date("Y-m-d", time()));

                    if ($lastQiandao == $today) {
                        $todayQiandao = 1;
                    }
                }
                $huoniaoTag->assign("todayQiandao", $todayQiandao);
            }

            //查询红娘信息
            global $installModuleArr;
            if (in_array('dating', $installModuleArr)) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__dating_member` WHERE `type` = 0 AND `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $uid = $ret[0]['id'];
                    $huoniaoTag->assign("datign_user", $uid);
                }

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__dating_member` WHERE `type` = 1 AND `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $hnUid = $ret[0]['id'];
                    $huoniaoTag->assign("datign_hn", $hnUid);
                }
            }

            //查询工长设计师
            if (in_array('renovation', $installModuleArr)) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $foremanuid = $ret[0]['id'];
                    $huoniaoTag->assign("renovation_foremanuid", $foremanuid);
                }

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $teamuid = $ret[0]['id'];
                    $huoniaoTag->assign("renovation_teamuid", $teamuid);
                }
            }
        }

        $tempbg = $userinfo['tempbg'];
        if (!empty($tempbg)) {
            $archives = $dsql->SetQuery("SELECT `big` FROM `#@__member_coverbg` WHERE `id` = " . $tempbg);
            $results = $dsql->dsqlOper($archives, "results");
            // var_dump($tempbg);die;
            if ($results) {
                $huoniaoTag->assign('bannerUrl', getFilePath($results[0]['big']));
            }
        }

        //商家中心获取餐饮模块状态
        if ($userinfo['userType'] == 2) {

            $sql = $dsql->SetQuery("SELECT `id`, `diancan_state`, `dingzuo_state`, `paidui_state`, `maidan_state`, `bind_module` FROM `#@__business_list` WHERE `uid` = " . $userid . " ORDER BY `id` DESC");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $business = $res[0];

                $huoniaoTag->assign('diancan_state', $res[0]['diancan_state']);
                $huoniaoTag->assign('dingzuo_state', $res[0]['dingzuo_state']);
                $huoniaoTag->assign('paidui_state', $res[0]['paidui_state']);
                $huoniaoTag->assign('maidan_state', $res[0]['maidan_state']);
            } else {
                $business = "";
            }


            //获取外卖配置信息和店铺配送模式
            if (in_array("waimai", $installModuleArr)) {

                include(HUONIAOROOT . "/include/config/waimai.inc.php");
                $huoniaoTag->assign('waimai_otherpeisong', (int)$custom_otherpeisong);  //0平台配送  大于0表示第三方配送
                
                $waimai_sid = 0;
                if ($memberPackage && $memberPackage != 'No data!' && $memberPackage['package']['modules'] && $memberPackage['package']['modules']['store']) {
                    foreach ($memberPackage['package']['modules']['store'] as $key => $val) {
                        if ($val['name'] == 'waimai') {
                            $waimai_sid = (int)$val['sid'];
                        }
                    }
                }

                //店铺自己配送
                $waimai_merchant_deliver = 0;
                if($waimai_sid){
                    $sql = $dsql->SetQuery("SELECT `merchant_deliver` FROM `#@__waimai_shop` WHERE `id` = $waimai_sid");
                    $waimai_merchant_deliver = (int)$dsql->getOne($sql);
                }
                $huoniaoTag->assign('waimai_merchant_deliver', (int)$waimai_merchant_deliver);  //0关闭  1开启

            }

        }

        $house_comid = 0;
        global $installModuleArr;
        if (in_array("house", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $house_comid = $ret[0]['id'];
            }
        }
        $huoniaoTag->assign('house_comid', $house_comid);

        $car_comid = 0;
        global $installModuleArr;
        if (in_array("car", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $car_comid = $ret[0]['id'];
            }
        }
        $huoniaoTag->assign('car_comid', $car_comid);

        // 移动端商家首页获取可管理的模块
        // if(isMobile()){
        //  global $ischeck;
        //  if(count($ischeck) > 1){
        //
        //      if($business){
        //          $bind_module = $business['bind_module'] ? explode(',', $business['bind_module']) : array();
        //      }else{
        //          $bind_module = array();
        //      }
        //
        //      $res = checkShowModule($bind_module, 'show', 'getConfig', 'getUrl');
        //      $showModule = $res['res'];
        //      $config = $res['config'];
        //      $huoniaoTag->assign('showModule', $showModule);
        //      $huoniaoTag->assign('businessConfig', $config);
        //
        //      $huoniaoTag->assign('business', $business);
        //  }
        // }

        // return;

        //其它需要验证登录的页面


        $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `state` = 1 AND `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!empty($res[0]['id'])) {
            $isEducationStore = true;
        } else {
            $isEducationStore = false;
        }
        if ($userinfo['userType'] == 2 && $isEducationStore) {
            $userid = $res[0]['id'];
        }
        if ($userid) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `state` = 1 AND `userid` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if (!empty($res[0]['id'])) {
                $isEducationTutor = true;
            } else {
                $isEducationTutor = false;
            }
        }
        if (!$isEducationStore && !$isEducationTutor) {
            // die("<script>alert('请先申请家教或者入驻教育商家') </script>");
        }
        $huoniaoTag->assign('isEducationStore', $isEducationStore);
        $huoniaoTag->assign('isEducationTutor', $isEducationTutor);
    } elseif (
        $template == "order"                //管理订单
        || $template == "record"        //余额明细
        || $template == "pocket"        //我的账户
        || $template == "bill"        //账单明细
        || $template == "message"       //系统消息
        || $template == "systemMsg"     //系统通知
        || $template == "profile"       //基本资料
        || $template == "portrait"      //修改头像
        // || $template == "connect"        //社交帐号绑定
        || $template == "loginrecord"   //登录记录
        || $template == "point"     //积分记录
        || $template == "coupon"        //优惠券
        || $template == "address"       //收货地址
        || $template == "address_add"       //收货地址
        || $template == "business-about"   //商家介绍
        || $template == "business-news"    //商家动态
        || $template == "business-albums"  //商家相册
        || $template == "business-video"   //商家视频
        || $template == "business-panor"   //商家全景
        || $template == "business-comment" //商家点评
        || $template == "business-staff" //商家点评
        || $template == "myquan"  //优惠券
        || $template == "quan" //优惠券
        || $template == "address_waimai"  //外卖收货地址
        || $template == "new_address_waimai"  //新增外卖收货地址
        || $template == "recharge"  //购物卡充值
    ) {
        $userLogin->checkUserIsLogin();

        $userinfo = $userLogin->getMemberInfo();

        if ($template == "business-staff" && $userinfo['is_staff'] == 1) {

            $param = array(
                "service"  => "member",
                "type"     => "user"
            );

            header('location:' . getUrlPath($param));
        }
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('from', $from ? $from : 'address');

        //修改头像页输出头像尺寸
        if ($template == 'portrait') {
            global $cfg_photoSmallWidth;
            global $cfg_photoSmallHeight;
            global $cfg_photoMiddleWidth;
            global $cfg_photoMiddleHeight;
            global $cfg_photoLargeWidth;
            global $cfg_photoLargeHeight;
            $huoniaoTag->assign('smallWidth', $cfg_photoSmallWidth);
            $huoniaoTag->assign('smallHeight', $cfg_photoSmallHeight);
            $huoniaoTag->assign('middleWidth', $cfg_photoMiddleWidth);
            $huoniaoTag->assign('middleHeight', $cfg_photoMiddleHeight);
            $huoniaoTag->assign('largeWidth', $cfg_photoLargeWidth);
            $huoniaoTag->assign('largeHeight', $cfg_photoLargeHeight);
        }

        //获取商家ID
        if ($template == "business-comment") {
            global $userLogin;
            $userid = $userLogin->getMemberID();
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = " . $userid . " ORDER BY `id` DESC");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $business = $res[0];
                $huoniaoTag->assign('businessID', $business['id']);
            }
        }

        //外卖收货地址
        if ($template == 'new_address_waimai') {
            $hasDefault = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_address` WHERE `uid` = $userid AND `def` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $hasDefault = 1;
            }
            $huoniaoTag->assign('hasDefault', $hasDefault);
        }

        //添加收货地址
        if ($template == 'address' || $template == 'address_add') {

            $logitcpros  = explode('|', $logitcpros);
            $huoniaoTag->assign('logitcpros', $logitcpros);
            $huoniaoTag->assign('confirmtype', $confirmtype);
            $huoniaoTag->assign('addressid', (int)$addressid);
            unset($_GET['adsid'], $_GET['addressid']);
            $queryStr = http_build_query($_GET);
            $urlparam = urldecode($queryStr);
            $huoniaoTag->assign('urlParam', $urlparam);

            if ($addressid) {
                $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `id` = '$addressid'");
                $res      = $dsql->dsqlOper($archives, "results");
                if (!$res) {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html?from=member.con.address_add");
                }

                $res[0]['lnglat'] = $res[0]['lng'].','.$res[0]['lat'];

                $huoniaoTag->assign('adddetail', $res ? $res[0] : array());
            }
        }

        if ($template != "address") return;

        //提现
    } elseif ($template == "withdraw" || $template == "bankCard" || $template == "alipay-record" || $action == 'addAccount') {
        $userLogin->checkUserIsLogin();
        $uid = $userLogin->getMemberID();

        //提现必须实名认证
        if ($template == "withdraw") {
            if ($userinfo['certifyState'] != 1) {
                $param = array(
                    'service' => 'member',
                    'type' => 'user',
                    'template' => 'security-shCertify'
                );
                $f_url = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
                $url = getUrlPath($param) . '?from=' . $f_url . '&type=verified';
                die('<meta charset="UTF-8"><script type="text/javascript">alert("' . $langData['siteConfig'][33][49] . '");top.location="' . $url . '";</script>');
                die;
            }
        }

        global $cfg_minWithdraw;  //起提金额
        global $cfg_maxWithdraw;  //最多提现
        global $cfg_withdrawFee;  //手续费
        global $cfg_withdrawCycle;  //提现周期  0不限制  1每周  2每月
        global $cfg_withdrawCycleWeek;  //周几
        global $cfg_withdrawCycleDay;  //几日
        global $cfg_withdrawPlatform;  //提现平台
        global $cfg_withdrawNote;  //提现说明
        global $cfg_miniProgramAppid;
        global $cfg_miniProgramId;

        $cfg_minWithdraw = (float)$cfg_minWithdraw;
        $cfg_maxWithdraw = (float)$cfg_maxWithdraw;
        $cfg_withdrawFee = (float)$cfg_withdrawFee;
        $cfg_withdrawCycle = (int)$cfg_withdrawCycle;
        $withdrawPlatform = $cfg_withdrawPlatform ? unserialize($cfg_withdrawPlatform) : array('weixin', 'alipay', 'bank');

        //提现周期
        $withdrawCycleState = 1;
        $withdrawCycleNote = '';
        if ($cfg_withdrawCycle) {
            //周几
            if ($cfg_withdrawCycle == 1) {

                $week = date("w", time());
                if ($week != $cfg_withdrawCycleWeek) {
                    $array = $langData['siteConfig'][34][5];  //array('周日', '周一', '周二', '周三', '周四', '周五', '周六')
                    $withdrawCycleState = 0;
                    $withdrawCycleNote = str_replace('1', $array[$cfg_withdrawCycleWeek], $langData['siteConfig'][36][0]);  //当前不可提现，提现时间：每周一
                }

                //几日
            } elseif ($cfg_withdrawCycle == 2) {

                $day = date("d", time());
                if ($day != $cfg_withdrawCycleDay) {
                    $withdrawCycleState = 0;
                    $withdrawCycleNote = str_replace('1', $cfg_withdrawCycleDay, $langData['siteConfig'][36][1]);  //当前不可提现，提现时间：每月1日
                }
            }
        }

        $huoniaoTag->assign("from", $from);
        $huoniaoTag->assign("minWithdraw", $cfg_minWithdraw);
        $huoniaoTag->assign("maxWithdraw", $cfg_maxWithdraw);
        $huoniaoTag->assign("withdrawFee", $cfg_withdrawFee);
        $huoniaoTag->assign("withdrawCycleState", $withdrawCycleState);
        $huoniaoTag->assign("withdrawCycleNote", $withdrawCycleNote);
        $huoniaoTag->assign("withdrawPlatform", $withdrawPlatform);
        $huoniaoTag->assign("withdrawNote", nl2br($cfg_withdrawNote));
        $huoniaoTag->assign("miniProgramAppid", $cfg_miniProgramAppid);
        $huoniaoTag->assign("miniProgramId", $cfg_miniProgramId);

        //查询选用的帐号
        $id = (int)$id;
        $type = !empty($type) ? $type : ($new ? 'bank' : ($withdrawPlatform ? $withdrawPlatform[0] : ''));
        $bank = $alipay = array();
        if ($id) {
            $sql = $dsql->SetQuery("SELECT `bank`, `bankCode`, `bankName`, `cardnum`, `cardname` FROM `#@__member_withdraw_card` WHERE `id` = $id AND `uid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret && is_array($ret)) {
                if ($ret[0]['bank'] != 'alipay') {
                    $bank = $ret[0];
                    $bank['cardnumLast'] = substr($bank['cardnum'], -4);
                } else {
                    $type = "alipay";
                    $alipay = $ret[0];
                }
            }
        }

        //提取第一个帐号
        if (empty($bank)) {
            $sql = $dsql->SetQuery("SELECT `bank`, `bankCode`, `bankName`, `cardnum`, `cardname` FROM `#@__member_withdraw_card` WHERE `uid` = $uid AND `bank` != 'alipay' AND `bank` != 'weixin' ORDER BY `id` DESC LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret && is_array($ret)) {
                $bank = $ret[0];
                $bank['cardnumLast'] = substr($bank['cardnum'], -4);
            }
        }
        if (empty($alipay)) {
            $sql = $dsql->SetQuery("SELECT `bank`, `cardnum`, `cardname` FROM `#@__member_withdraw_card` WHERE `uid` = $uid AND `bank` = 'alipay' ORDER BY `id` DESC LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret && is_array($ret)) {
                $alipay = $ret[0];
            }
        }

        $huoniaoTag->assign("type", $type);
        $huoniaoTag->assign("bank", $bank);
        $huoniaoTag->assign("alipay", $alipay);
        $huoniaoTag->assign("new", $new);
        $huoniaoTag->assign("mod", $mod);


        //查询是否已经绑定了微信
        $wechat_openid = $wechat_mini_openid = '';
        $sql = $dsql->SetQuery("SELECT `wechat_openid`, `wechat_mini_openid` FROM `#@__member` WHERE `id` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $wechat_openid = $ret[0]['wechat_openid'];
            $wechat_mini_openid = $ret[0]['wechat_mini_openid'];

            if ($wechat_openid || $wechat_mini_openid) {
                $huoniaoTag->assign("alreadyBindWeixin", 1);
            }
        }


        //我的收藏
    } elseif ($template == "collection" || $template == 'collect' || $template == 'history') {
        $userLogin->checkUserIsLogin();

        if($template != 'history'){
            if ($module == '') {
                $detailHandels = new handlers("member", "collectCount");
                $detailConfig  = $detailHandels->getHandle();

                $detailConfig = $detailConfig['info'];

                $huoniaoTag->assign("allnumber", (int)$detailConfig['allnumber']);
                $huoniaoTag->assign("modulelist", !$detailConfig['list'] ? array() : $detailConfig['list']);
            }
        }
        $huoniaoTag->assign("module", $module);
        $huoniaoTag->assign("type", $type);
        //收银结算
    } elseif ($template == "checkout") {
        $userLogin->checkUserIsLogin();


        //打赏收益
    } elseif ($template == "reward") {
        $userLogin->checkUserIsLogin();
        $uid = $userLogin->getMemberID();
        global $cfg_liveFee;

        //计算打赏总收入
        $totalAmount =  $yttotalAmount = $liveAmount = $liveAmount1 = 0;
        $sql = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `state` = 1 AND `touid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if (is_numeric($ret[0]['totalAmount'])) {
            $totalAmount = $ret[0]['totalAmount'];
        }
        /*查询用户所有的直播*/

        // $sql = $dsql->SetQuery("SELECT p.`amount`,  p.`settle`  FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = h.`live_id` LEFT JOIN `huoniao_live_member` m  ON m.`aid` = h.`live_id` WHERE 1 = 1 AND m.`uid` = $uid AND p.`status` = 1  AND h.`payid` = p.`order_id`");
        $sql = $dsql->SetQuery("SELECT p.`amount`,  p.`settle`  FROM `#@__livelist` l LEFT JOIN `#@__live_reward` r ON l.`id` = r.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = r.`live_id`  WHERE 1 = 1 AND l.`user` = $uid AND p.`status` = 1  AND r.`payid` = p.`order_id`");
        //统计直播礼物收入
        $giftTotal =  $ytgiftTotall = 0;

        $ret = $dsql->dsqlOper($sql . " AND r.`gift_id` > 0", "results");
        if ($ret) {
            foreach ($ret as $key => $value) {
                if ($value['settle'] > 0) {
                    $giftTotal += sprintf('%.2f', $value['settle']);
                } else {
                    $liveFee = 100 - $cfg_liveFee;
                    $giftTotal += sprintf('%.2f', $value['amount'] * $liveFee / 100);
                }
            }
        }
        $totalAmount += $giftTotal;
        $huoniaoTag->assign('giftTotal', sprintf('%.2f', $giftTotal));


        //统计直播打赏收入
        $rewardTotal = $ytrewardTotal =  0;
        $ret = $dsql->dsqlOper($sql . " AND r.`gift_id` = 0", "results");
        if ($ret) {

            foreach ($ret as $key => $value) {
                if ($value['settle'] > 0) {
                    $rewardTotal += sprintf('%.2f', $value['settle']);
                } else {
                    $liveFee = 100 - $cfg_liveFee;
                    $rewardTotal += sprintf('%.2f', $value['amount'] * $liveFee / 100);
                }
            }
        }
        $huoniaoTag->assign('rewardTotal', sprintf('%.2f', $rewardTotal));
        $huoniaoTag->assign('cfg_liveFee', $cfg_liveFee);

        //统计直播红包
        $hongbaoTotal = $ythongbaoTotal =  0;
        $sql1 = $dsql->SetQuery("SELECT SUM(`recv_money`) totalAmount FROM `#@__live_hrecv_list` WHERE `recv_user` =  $uid");
        $ret = $dsql->dsqlOper($sql1, "results");
        if (is_numeric($ret[0]['totalAmount'])) {
            $hongbaoTotal = $ret[0]['totalAmount'];
        }
        $huoniaoTag->assign('hongbaoTotal', $hongbaoTotal);


        /***********************昨日*******************************/

        /*计算昨日收入*/
        $yesterdaystr = mktime(0, 0, 0, date('m'), date('d') - 1, date('Y'));
        $yesterdayend = mktime(0, 0, 0, date('m'), date('d'), date('Y')) - 1;

        $ytsql = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `state` = 1 AND `touid` = $uid AND `date`>= '" . $yesterdaystr . "' AND `date` <= '" . $yesterdayend . "'");
        $ytret = $dsql->dsqlOper($ytsql, "results");
        if (is_numeric($ytret[0]['totalAmount'])) {
            $yttotalAmount = $ytret[0]['totalAmount'];
        }
        $wheredate = " AND r.`date`>= '" . $yesterdaystr . "' AND r.`date` <= '" . $yesterdayend . "'";

        //统计直播礼物收入昨日
        $ret = $dsql->dsqlOper($sql . " AND r.`gift_id` > 0" . $wheredate, "results");
        if ($ret) {

            foreach ($ret as $key => $value) {
                if ($value['settle'] > 0) {
                    $ytgiftTotal += sprintf('%.2f', $value['settle']);
                } else {
                    $liveFee = 100 - $cfg_liveFee;
                    $ytgiftTotal += sprintf('%.2f', $value['amount'] * $liveFee / 100);
                }
            }
        }

        $yttotalAmount += $ytgiftTotal;
        //统计直播打赏昨日收入
        $ret = $dsql->dsqlOper($sql . " AND r.`gift_id` = 0" . $wheredate, "results");
        if ($ret) {

            foreach ($ret as $key => $value) {
                if ($value['settle'] > 0) {
                    $ytrewardTotal += sprintf('%.2f', $value['settle']);
                } else {
                    $liveFee = 100 - $cfg_liveFee;
                    $ytrewardTotal += sprintf('%.2f', $value['amount'] * $liveFee / 100);
                }
            }
        }

        $ytrewardTotal += $ytrewardTotal;
        //直播红包昨日收入
        $sql = $dsql->SetQuery("SELECT SUM(`recv_money`) totalAmount FROM `#@__live_hrecv_list` WHERE `recv_user` =  $uid  AND `date`>= '" . $yesterdaystr . "' AND `date` <= '" . $yesterdayend . "'");
        $ret = $dsql->dsqlOper($sql, "results");
        if (is_numeric($ytret[0]['totalAmount'])) {
            $ythongbaoTotal = $ret[0]['totalAmount'];
        }
        $ytrewardTotal += $ythongbaoTotal;
        /*******************************************************/


        //计算打赏总人数
        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__member_reward` WHERE `state` = 1 AND `touid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if (is_numeric($ret[0]['totalCount'])) {
            $totalCount = $ret[0]['totalCount'];
        }

        $sql = $dsql->SetQuery("SELECT count(r.`id`) totalCount FROM `#@__livelist` m LEFT JOIN `#@__live_payorder` p  ON  m.`id` = p.`live_id` LEFT JOIN `#@__live_reward` r ON r.`payid` = p.`order_id` WHERE m.`user` = $uid AND r.`gift_id` = 0 AND p.`status` =1");
        $ret = $dsql->dsqlOper($sql, "results");
        if (is_numeric($ret[0]['totalCount'])) {
            $totalCount1 = $ret[0]['totalCount'];
        }

        $totalCount += $totalCount1;
        $sql = $dsql->SetQuery("SELECT count(r.`id`) totalCount FROM `#@__livelist` m LEFT JOIN `#@__live_payorder` p  ON  m.`id` = p.`live_id` LEFT JOIN `#@__live_reward` r ON r.`payid` = p.`order_id` WHERE m.`user` = $uid AND r.`gift_id` = 0 AND p.`status` =1");
        $ret = $dsql->dsqlOper($sql, "results");
        if (is_numeric($ret[0]['totalCount'])) {
            $totalCount2 = $ret[0]['totalCount'];
        }
        $totalCount += $totalCount2;
        $huoniaoTag->assign('totalMoney', sprintf("%.2f", $totalAmount));
        $huoniaoTag->assign('yttotalMoney', sprintf("%.2f", $yttotalAmount));
        $huoniaoTag->assign('totalCount', (int)$totalCount);


        //帐户充值
    } elseif ($template == "deposit" || $template == "convert") {

        $userLogin->checkUserIsLogin();

        $userinfo = $userLogin->getMemberInfo();
        $totalMoney = number_format($userinfo['money'], 2);
        $huoniaoTag->assign('totalMoney', $totalMoney);
        $huoniaoTag->assign('paytype', $paytype);

        $moneryvarr = array('10', '50', '100', '150', '200', '500');

        global $cfg_chongzhiCheckType;
        global $cfg_chongzhiyhFee;
        global $cfg_chongzhilimit;

        $huoniaoTag->assign('moneryvarr', $moneryvarr);
        $huoniaoTag->assign('cfg_chongzhiCheckType', $cfg_chongzhiCheckType);
        $huoniaoTag->assign('cfg_chongzhiyhFee', $cfg_chongzhiyhFee);
        $huoniaoTag->assign('cfg_chongzhilimit', $cfg_chongzhilimit);
        return;

        //安全中心
    } elseif ($template == "security") {

        $userLogin->checkUserIsLogin();

        $huoniaoTag->assign('doget', $doget);

        //获取会员的安全保护问题
        $question1 = $question2 = "";
        $archives = $dsql->SetQuery("SELECT `question` FROM `#@__member_security` WHERE `uid` = '" . $userLogin->getMemberID() . "'");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $question = explode("$$", $results[0]['question']);
            $question1 = $question[0];
            $question2 = $question[1];
        }
        $url = isset($_SESSION['loginRedirectInfo']) ? $_SESSION['loginRedirectInfo'] : "";
        if ($url) {
            $url = $url;
        } else {
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "security",
            );
            $url = getUrlPath($param);
        }
        $huoniaoTag->assign('pageUrl', $url);
        $huoniaoTag->assign('question1', $question1);
        $huoniaoTag->assign('question2', $question2);

        return;
        // 绑定第三方账号
        // }elseif($template == "connect"){
        //     $userLogin->checkUserIsLogin();
        //
        //     $sameConnData = GetCookie('sameConnData');
        //     DropCookie('sameConnData');
        //     $huoniaoTag->assign('sameConnData', $sameConnData);

        //发布举报
    } elseif ($action == "complain") {

        if (!empty($_POST)) {
        } else {
            $huoniaoTag->assign('module', $module);
            $huoniaoTag->assign('dopost', $dopost);
            $huoniaoTag->assign('aid', $aid);
            $huoniaoTag->assign('commonid', $commonid);
        }

        //邮箱绑定返回页面
    } elseif ($template == "bindemail") {

        $userLogin->checkUserIsLogin();

        $state = 0;
        if (empty($data)) {
            $content = $langData['siteConfig'][21][244];  //绑定失败，请检查链接地址是否完整！
        } else {

            //数据解密
            $mid = $userLogin->getMemberID();
            $RenrenCrypt = new RenrenCrypt();
            $data = $RenrenCrypt->php_decrypt(base64_decode($data));
            $arr = explode("$$", $data);
            $uid  = $arr[0];
            $ip   = $arr[1];
            $time = $arr[2];

            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "security",
                "doget"    => "chemail"
            );
            $bindUrl = getUrlPath($param);

            if (!is_numeric($uid) || !is_numeric($time)) {
                $content = str_replace('1', $bindUrl, $langData['siteConfig'][21][245]);  //绑定失败，链接地址失效，请回到【<a href="1">绑定页面</a>】重新操作！
            } else {

                //判断是否同一帐号
                if ($mid != $uid) {
                    $content = $langData['siteConfig'][21][246];  //绑定失败，请确认 <u>当前登录用户</u> 与 <u>邮箱链接中的用户</u> 是否一致！
                } else {

                    //验证是否过期
                    $now = GetMkTime(time());
                    if ($now - $time > 24 * 3600) {
                        $content = str_replace('1', $bindUrl, $langData['siteConfig'][21][247]);  //绑定失败，邮件链接已超过24小时的有效时间，请【<a href="1">重新绑定</a>】！
                    } else {

                        //验证会员
                        $archives = $dsql->SetQuery("SELECT `id`, `emailCheck` FROM `#@__member` WHERE `id` = '$uid'");
                        $user = $dsql->dsqlOper($archives, "results");
                        if (!$user) {
                            $content = $langData['siteConfig'][21][248];  //绑定失败，会员不存在或已经删除，请确认后重试！
                        } else {

                            $state = 1;
                            if ($user[0]['emailCheck'] == 1) {
                                $content = $langData['siteConfig'][21][249];  //您已经成功绑定，无须再次提交！
                            } else {

                                //验证通过删除发送的验证码
                                $archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'email' AND `lei` = 'bind' AND `byid` = '$uid'");
                                $dsql->dsqlOper($archives, "update");

                                //更新用户状态
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `emailCheck` = 1 WHERE `id` = '$uid'");
                                $dsql->dsqlOper($archives, "update");

                                $content = $langData['siteConfig'][21][250];  //恭喜您，绑定成功！
                            }
                        }
                    }
                }
            }
        }

        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('content', $content);
        return;


        //重置密码
    } elseif ($template == "resetpwd") {

        if (empty($data)) {
            $huoniaoTag->assign("empty", "yes");
            return;
        }

        //验证安全链接
        $RenrenCrypt = new RenrenCrypt();
        $dataCode = $RenrenCrypt->php_decrypt(base64_decode($data));

        $dataArr = explode("$$", $dataCode);
        if (count($dataArr) != 5) {
            $huoniaoTag->assign("empty", "yes");
            return;
        }
        if (empty($dataArr[0]) || empty($dataArr[4])) {
            $huoniaoTag->assign("empty", "yes");
            return;
        }

        if ($dataArr[0] == 1) {
            $archives = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE (`mtype` = 1 || `mtype` = 2) AND `email` = '" . $dataArr[1] . "'");
        } elseif ($dataArr[0] == 2) {
            $archives = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE (`mtype` = 1 || `mtype` = 2) AND `phone` = '" . $dataArr[1] . "'");
        }
        $results  = $dsql->dsqlOper($archives, "results");
        if (!$results) {
            $huoniaoTag->assign("empty", "yes");
            return;
        }
        $old = $results[0]['password'];

        $now = GetMkTime(time());
        if ($now - $dataArr[3] > 24 * 3600) {
            $huoniaoTag->assign("empty", "yes");
            return;
        }

        if (empty($old)) {
            if ($dataArr[4] != $dataArr[3]) {
                $huoniaoTag->assign("empty", "yes");
                return;
            }
        } else {

            if ($dataArr[4] != substr($old, 0, 10)) {
                $huoniaoTag->assign("empty", "yes");
                return;
            }
        }

        $huoniaoTag->assign("data", $data);


        //提现详细信息
    } elseif ($template == "withdraw_log") {

        $huoniaoTag->assign("from", $from);


        //提现详细信息
    } elseif ($template == "withdraw_log_detail") {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        if (empty($id)) {
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
            die;
        }

        if ($type == "p") {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__member_putforward` WHERE `id` = $id AND `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $results = $ret[0];
                $huoniaoTag->assign('tab', 'p');
                $huoniaoTag->assign('bank', $results['bank']);
                $huoniaoTag->assign('type', $results['type']);
                $huoniaoTag->assign('order_id', $results['order_id']);
                $huoniaoTag->assign('cardname', $results['cardname']);
                $huoniaoTag->assign('amount', $results['amount']);
                $huoniaoTag->assign('pubdate', date("Y-m-d H:i:s", $results['pubdate']));
                $huoniaoTag->assign('paydate', $results['paydate'] ? date("Y-m-d H:i:s", $results['paydate']) : "");
                $huoniaoTag->assign('state', $results['state']);
                $huoniaoTag->assign('note', $results['note']);
            } else {
                header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
                die;
            }
        } else {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__member_withdraw` WHERE `id` = $id AND `uid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $results = $ret[0];
                $huoniaoTag->assign('tab', 'w');
                $huoniaoTag->assign('bank', $results['bank']);
                $huoniaoTag->assign('bankCode', $results['bankCode']);
                $huoniaoTag->assign('bankName', $results['bankName']);
                if ($results['bank'] == "alipay") {
                    $huoniaoTag->assign('cardnum', $results['cardnum']);
                } else {
                    $cardnum = str_split($results['cardnum'], 4);
                    $huoniaoTag->assign('cardnum', join(" ", $cardnum));
                }
                $huoniaoTag->assign('cardname', $results['cardname']);
                $huoniaoTag->assign('amount', $results['amount']);
                $huoniaoTag->assign('price', $results['price']);
                $huoniaoTag->assign('shouxuprice', $results['shouxuprice']);
                $huoniaoTag->assign('tdate', date("Y-m-d H:i:s", $results['tdate']));
                $huoniaoTag->assign('state', $results['state']);
                $withdraw_note = $results['note'];
                if (strstr($withdraw_note, "Openid校验失败") || strstr($withdraw_note, "产品权限异常")) {
                    $withdraw_note = "提现失败，请联系平台管理员";
                }
                $huoniaoTag->assign('note', $withdraw_note);

                //电子回单
                $receipt = $results['receipt'] ? getFilePath($results['receipt']) : '';

                //由于微信安卓端小程序不支持预览PDF，所以这里直接不输出
                global $isminiprogram;
                if ($isminiprogram && strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'android') !== false) {
                    $receipt = '';
                }

                $huoniaoTag->assign('receipt', $receipt);
                $huoniaoTag->assign('rdate', date("Y-m-d H:i:s", $results['rdate']));
            } else {
                header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
                die;
            }
        }

        $huoniaoTag->assign("from", $from);

        return;
        //
    } elseif ($action == "refunddetail") {
        $orderId = (int)$_GET['id'] ? (int)$_GET['id'] : $id;
        $huoniaoTag->assign('proid', $proid);
        $huoniaoTag->assign('module', $module);
        global $cfg_pointName;
        $huoniaoTag->assign('cfg_pointName', $cfg_pointName);
        $huoniaoTag->assign('id', $orderId);
        $huoniaoTag->assign('refundReason', json_encode($numArr));
        $detailHandels = new handlers($module, "orderDetail");
        //        $detailConfig  = $detailHandels->getHandle($orderId);
        $detailConfig  = $detailHandels->getHandle(array("id" => $orderId, "proid" => (int)$proid));
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                $param = array("service" => "member");
                $busiDomain = getUrlPath($param);     //商家会员域名

                global $cfg_secureAccess;
                $currentPageUrl = $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];



                foreach ($detailConfig as $key => $value) {
                    if ($key == 'proarr') {
                        $huoniaoTag->assign('detail_product', $value);
                    } else {

                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
                $huoniaoTag->assign('id', $orderId);
            }
        }
    } elseif ($action == 'refunddetail_shop_express') {
        $orderId = (int)$_GET['id'] ? (int)$_GET['id'] : $id;
        $huoniaoTag->assign('id', $orderId);
        $huoniaoTag->assign('proid', (int)$proid);
        $huoniaoTag->assign('module', 'shop');
        //订单详情页面
    } elseif ($action == "platformjoin") {
        $orderId = (int)$_GET['id'] ? (int)$_GET['id'] : $id;

        $huoniaoTag->assign('module', $module);
        global $cfg_pointName;
        $huoniaoTag->assign('cfg_pointName', $cfg_pointName);
        $huoniaoTag->assign('id', $orderId);
        $huoniaoTag->assign('proid', (int)$proid);
        $huoniaoTag->assign('refundReason', json_encode($numArr));
        $detailHandels = new handlers($module, "orderDetail");
        $detailConfig  = $detailHandels->getHandle(array("id" => $orderId, "proid" => (int)$proid));
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                $param = array("service" => "member");
                $busiDomain = getUrlPath($param);     //商家会员域名

                global $cfg_secureAccess;
                $currentPageUrl = $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
                foreach ($detailConfig as $key => $value) {
                    if ($key == 'product') {
                        $huoniaoTag->assign('detail_product', $value[0]);
                    } else {

                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
                $huoniaoTag->assign('id', $orderId);
            }
        }
    } elseif ($action == 'returngoods') {

        $orderId = (int)$_GET['id'] ? (int)$_GET['id'] : $id;
        $huoniaoTag->assign('id', $orderId);
        $huoniaoTag->assign('proid', $proid);
    } elseif ($action == "refund") {
        if ($module == 'shop') {
            if ($id && $proid) {
                $Sql = $dsql->SetQuery("SELECT t.`ret_negotiate`,o.`userid`,o.`store` FROM `#@__shop_order_product`t LEFT JOIN `#@__shop_order` o ON t.`orderid` = o.`id`  WHERE  t.`orderid` = '$id' AND t.`proid` = '$proid'");
                $Res = $dsql->dsqlOper($Sql, "results");
                if ($Res) {

                    $userid = $Res[0]['userid'];
                    $store  = $Res[0]['store'];

                    /*用户*/
                    $userSql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE 1=1 AND `id` = '$userid'");
                    $userRes = $dsql->dsqlOper($userSql, "results");
                    $photo   = getFilePath($userRes[0]['photo']);
                    $huoniaoTag->assign('photo', $photo);

                    /*商家*/
                    $businessSql = $dsql->SetQuery("SELECT `logo` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$store'");
                    $businessRes = $dsql->dsqlOper($businessSql, "results");
                    $logo        = getFilePath($businessRes[0]['logo']);
                    $huoniaoTag->assign('logo', $logo);
                } else {

                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                }
                $huoniaoTag->assign(
                    'ret_negotiate',
                    $Res[0]['ret_negotiate'] != '' ? json_encode(unserialize($Res[0]['ret_negotiate'])) : ''
                );
            } else {
                if ($id) {
                    //            $ret_negotiate['numeber'] = 1;
                    //            $ret_negotiate[0]['typename']      = '买家创建了退款申请';
                    //            $ret_negotiate[0]['refundtype']    = '仅退款';
                    //            $ret_negotiate[0]['refundinfo']    = '尺码拍错/不喜欢/效果差';
                    //            $now                               = GetMkTime(time());
                    //            $ret_negotiate[0]['datetime']      = $now;
                    //            $ret_negotiate[0]['tuikuanmoney']  = $now;
                    //            $ret_negotiate[0]['type']          = 0;
                    //
                    //            $ret_negotiate[1]['typename']      = '商家拒绝退款';
                    //            $ret_negotiate[1]['refundinfo']    = '不想给你退'; +
                    //            $ret_negotiate[1]['datetime']      = $now + 1800;
                    //            $ret_negotiate[1]['type']          = 1;

                    $Sql = $dsql->SetQuery("SELECT `ret_negotiate`,`userid`,`store` FROM `#@__shop_order` WHERE 1=1 AND `id` = '$id'");
                    $Res = $dsql->dsqlOper($Sql, "results");
                    if ($Res) {

                        $userid = $Res[0]['userid'];
                        $store = $Res[0]['store'];

                        /*用户*/
                        $userSql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE 1=1 AND `id` = '$userid'");
                        $userRes = $dsql->dsqlOper($userSql, "results");
                        $photo = getFilePath($userRes[0]['photo']);
                        $huoniaoTag->assign('photo', $photo);

                        /*商家*/
                        $businessSql = $dsql->SetQuery("SELECT `logo` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$store'");
                        $businessRes = $dsql->dsqlOper($businessSql, "results");
                        $logo = getFilePath($businessRes[0]['logo']);
                        $huoniaoTag->assign('logo', $logo);
                    } else {
                        header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                    }
                    $huoniaoTag->assign(
                        'ret_negotiate',
                        $Res[0]['ret_negotiate'] != '' ? json_encode(unserialize($Res[0]['ret_negotiate'])) : ''
                    );
                } else {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                }
            }
        }

        $huoniaoTag->assign('do', $do);
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('proid', $proid);
        global $cfg_pointName;
        $huoniaoTag->assign('cfg_pointName', $cfg_pointName);

        include(HUONIAOROOT . "/include/config/" . $module . ".inc.php");


        $numArr = $customrefundReason != '' ? explode('|', $customrefundReason) : array();

        $huoniaoTag->assign('refundReason', json_encode($numArr));
        $detailHandels = new handlers($module, "orderDetail");
        $detailConfig  = $detailHandels->getHandle(array("id" => $id, "proid" => (int)$proid));

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                $param = array("service" => "member");
                $busiDomain = getUrlPath($param);     //商家会员域名

                global $cfg_secureAccess;
                $currentPageUrl = $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];



                foreach ($detailConfig as $key => $value) {

                    if ($key == 'proarr') {
                        $huoniaoTag->assign('detail_product', $value);
                    } else {

                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
                $huoniaoTag->assign('id', (int)$id);
            }
        }
        //订单详情页面
    } elseif ($action == "orderdetail" || $action == 'refunddetail_shop' || $action == 'shop_changeprice') {

        global $userLogin;
        global $cfg_thumbType;
        global $cfg_atlasType;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html?furl=" . $furl);
        } else {

            $huoniaoTag->assign('peerpay', (int)$peerpay);

            $huoniaoTag->assign('module', $module);

            if ($module == "business") {
                $huoniaoTag->assign('type', $type);
                $act = $type . "OrderDetail";
            } elseif ($module == "paotui") {
                $module = "waimai";
                $act = "orderPaotuiDetail";
                include(HUONIAOROOT . "/include/config/waimai.inc.php");
                $huoniaoTag->assign('customIsopencode', $customIsopencode);
            } else {
                $act = "orderDetail";
            }



            // 退款通知买家时，消息通知跳转链接为商家会员中心，所以这里加个验证跳转
            if ($module == "info") {
                global $tpl;
                if (strstr($tpl, 'company')) {
                    $userinfo = $userLogin->getMemberInfo();
                    if ($userinfo['userType'] == 1) {
                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "info",
                            "type"   => "user",
                            "id"       => $id,
                            "param"       => 'type=out'
                        );
                        $url = getUrlPath($paramBusi);
                    }
                }
            }

            if ($action == 'refunddetail_shop' ||  $action == 'shop_changeprice') {
                $module = 'shop';
            }

            //代付开关
            if($module == 'shop'){
                include HUONIAOINC . '/config/shop.inc.php';
                $huoniaoTag->assign('peerpayState', $custompeerpay);
            }

            $detailHandels = new handlers($module, $act);
            $detailConfig  = $detailHandels->getHandle($id);

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig  = $detailConfig['info'];
                if (is_array($detailConfig)) {

                    $param = array("service"  => "member");
                    $busiDomain = getUrlPath($param);     //商家会员域名

                    global $cfg_secureAccess;
                    $currentPageUrl = $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

                    //团购券类型的订单直接跳转至已消费团购券列表
                    if ($module == 'tuan' && !$detailConfig['product']['tuantype'] && strstr($currentPageUrl, $busiDomain)) {
                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "quan",
                            "action"   => $_GET['from'] == 'record' ? "tuan" : "tuan-unuse",
                            "param"    => 'ordernum=' . $detailConfig['ordernum']
                        );
                        $url = getUrlPath($paramBusi);
                        header("location:" . $url);
                        die;
                    }

                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                    $huoniaoTag->assign('id', (int)$id);


                    //已完成订单输出上传配置参数paotui-buy.html
                    // if($key == "orderstate" && $value == 3){
                    //获取图片配置参数
                    require(HUONIAOINC . "/config/" . $module . ".inc.php");

                    if ($module == 'waimai') {
                        $huoniaoTag->assign('cstime', $cstime);
                        $huoniaoTag->assign('csprice', $csprice);
                    }

                    if ($module == 'awardlegou') {
                        $huoniaoTag->assign('customWeichaononote', $customWeichaononote);
                        $huoniaoTag->assign('customYichaononote', $customYichaononote);
                        $huoniaoTag->assign('customWeichaonote', $customWeichaonote);
                        $huoniaoTag->assign('customYichaonote', $customYichaonote);
                        $huoniaoTag->assign('customCanceltime', $customCanceltime);
                    }
                    if ($customUpload == 1) {
                        $huoniaoTag->assign('thumbSize', $custom_thumbSize);
                        $huoniaoTag->assign('thumbType', str_replace("|", ",", $custom_thumbType));
                        $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                        $huoniaoTag->assign('atlasType', str_replace("|", ",", $custom_atlasType));
                    } else {
                        $huoniaoTag->assign('thumbType', str_replace("|", ",", $cfg_thumbType));
                        $huoniaoTag->assign('atlasType', str_replace("|", ",", $cfg_atlasType));
                    }
                    $huoniaoTag->assign('atlasMax', (int)$customAtlasMax);

                    // }

                }

                if ($module == 'awardlegou') {
                    $huoniaoTag->assign('confirmDay', $confirmDay < 1 ? 1 : $confirmDay);
                    $huoniaoTag->assign('customautotuikuan', $customautotuikuan < 1 ? 1 : $customautotuikuan);
                    $huoniaoTag->assign('customautotuihuo', $customautotuihuo < 1 ? 1 : $customautotuihuo);
                    $huoniaoTag->assign('customofftuikuan', $customofftuikuan < 1 ? 1 : $customofftuikuan);
                }

                if ($module == 'shop') {
                    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_branch_store` WHERE `userid` = $userid");
                    $res = $dsql->dsqlOper($sql, "results");
                    if ($res) {
                        $branchStoreId = $res[0]['id'];
                    }
                }

                $levelarr = array();

                $delivery = array();
                if ($module == 'waimai') {

                    $sql = $dsql->SetQuery("SELECT `id`,`privilege` FROM `#@__member_level` ORDER BY `id` ASC");
                    $ret = $dsql->dsqlOper($sql, "results");

                    if ($ret) {
                        foreach ($ret as $key => $value) {
                            $id         = $value['id'];
                            $privilege  = unserialize($value['privilege']);
                            $waimai     = $privilege['waimai'];

                            $levelarr[$id] = $waimai;
                            $delivery[$id]['type'] = $privilege['delivery'][0]['type'];
                            $delivery[$id]['val']  = $privilege['delivery'][0]['val'];
                        }
                    }

                    $huoniaoTag->assign('levelarr', $levelarr);
                    $huoniaoTag->assign('delivery', $delivery);
                    $sqll = $dsql->SetQuery("SELECT `delivery_count` FROM `#@__member` WHERE `id` = $userid");
                    $ress = $dsql->dsqlOper($sqll, "results");
                    if ($ress) {
                        $delivery_count = $ress[0]['delivery_count'];
                        $huoniaoTag->assign('delivery_count', (int)$delivery_count);
                        // var_dump($delivery_count);die;
                    }
                }


                $huoniaoTag->assign('rates', (int)$rates);
                $huoniaoTag->assign('branch', (int)$branch);
                $huoniaoTag->assign('branchStoreId', (int)$branchStoreId);
                $huoniaoTag->assign('type', $type);
            } else {

                if ($module == 'shop' || $module == 'waimai' || $module == 'tuan' || $module == "paimai") {


                    $paramurl = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "order",
                        "module"   => $module
                    );
                    $orderurl = getUrlPath($paramurl);

                    header("location:" . $orderurl);
                } else {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                }
            }
        }
        return;
        //评价
    } elseif ($action == "write-comment") {
        global $userLogin;
        global $cfg_thumbType;
        global $cfg_atlasType;
        $userid = $userLogin->getMemberID();

        if ($userid == -1) {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html?furl=" . $furl);
        } else {

            $huoniaoTag->assign('module', $module);
            $huoniaoTag->assign('id', (int)$id);

            //获取图片配置参数
            if ($module == "paotui") {
                $module = "waimai";
                $ordertype = "paotui";
            }
            require(HUONIAOINC . "/config/" . $module . ".inc.php");

            $huoniaoTag->assign('CommentCheck', (int)$customCommentCheck);
            if ($customUpload == 1) {
                $huoniaoTag->assign('thumbSize', $custom_thumbSize);
                $huoniaoTag->assign('thumbType', str_replace("|", ",", $custom_thumbType));
                $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                $huoniaoTag->assign('atlasType', str_replace("|", ",", $custom_atlasType));
            } else {
                $huoniaoTag->assign('thumbType', str_replace("|", ",", $cfg_thumbType));
                $huoniaoTag->assign('atlasType', str_replace("|", ",", $cfg_atlasType));
            }

            if ($module == 'waimai') {
                $ordertype = empty($ordertype) || $ordertype != "paotui" ? "waimai" : "paotui";
                if ($ordertype == "paotui") {
                    $detailHandels = new handlers($module, "orderPaotuiDetail");
                } else {
                    $detailHandels = new handlers($module, "orderDetail");
                }
            } else {
                $detailHandels = new handlers($module, "orderDetail");
            }
            $detailConfig  = $detailHandels->getHandle($id);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig  = $detailConfig['info'];
                if (is_array($detailConfig)) {

                    // 区分外卖
                    if ($module == 'waimai') {
                        $type = $ordertype == "paotui" ? 1 : 0;
                        // 修改评论使用
                        // $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `oid` = $id AND `uid` = $userid AND `type` = $type");
                        // $type_ = $ordertype == "paotui" ? 'paotui-order' : 'waimai-order';
                        // $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `userid` = '$userid' AND `oid` = '$id' AND `type` = '$type_' AND `pid` = 0");
                        $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `uid` = '$userid' AND `oid` = '$id' AND `type` = '$type'");
                        $ret = $dsql->dsqlOper($sql, 'results');
                        $common = array();
                        if ($ret) {
                            $pics = $ret[0]['pics'];
                            if ($pics != "") $ret[0]['pics'] = explode(",", $pics);
                            $common = $ret[0];
                        } else {
                            $common = array("id" => "", "isanony" => 0, "star" => 0, "starps" => 0, "content" => "", "contentps" => "", "litpic" => "");
                        }
                        $huoniaoTag->assign('common', $common);
                        $huoniaoTag->assign('ordertype', $ordertype);

                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_' . $key, $value);
                        }
                    } elseif ($module == 'homemaking') {
                        if ($detailConfig['orderstate'] == 11 || $detailConfig['orderstate'] == 12) {
                            $sql = $dsql->SetQuery("SELECT * FROM `#@__public_comment_all` WHERE `oid` = '$id' AND `type` = 'homemaking-order' ");
                            $ret = $dsql->dsqlOper($sql, 'results');
                            $huoniaoTag->assign('product', $detailConfig['product']);
                            $huoniaoTag->assign('ret', $ret[0]);
                        } else {
                            $param = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "module"   => "homemaking",
                                "id"       => $id
                            );

                            header("location:" . getUrlPath($param));
                        }
                    } else {

                        if ($detailConfig['orderstate'] == 3) {
                            // echo"<pre>";
                            // var_dump($detailConfig['product']);die;
                            $huoniaoTag->assign('product', $detailConfig['product']);
                        } else {

                            $param = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "module"   => "shop",
                                "id"       => $id
                            );

                            header("location:" . getUrlPath($param));
                        }
                    }
                }
            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
        }
        return;

        //招聘求职
    } elseif ($action == "job" || $action == "index_job" || $action == "post_detail") {
        //招聘我的页面不需要验证登录，现已提供未登录样式
        if($action != 'index_job'){
            $userLogin->checkUserIsLogin();
        }
        $userid = $userLogin->getMemberID();
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('type', $type);
        //当前的 cid
        $sql = $dsql::SetQuery("select id from `#@__job_company` where `userid`=$userid");
        $cid = $dsql->getOne($sql) ?: 0;
        $huoniaoTag->assign("job_cid", $cid);
        //简历
        if ($module == "resume") {

            //查询是否有简历
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=" . $userid);
            $huoniaoTag->assign("hasResume", $dsql->getOne($sql) > 0 ? 1 : 0);

            //变量注册
            $detailHandels = new handlers("job", "getItemOne");
            $advantage = $detailHandels->getHandle(array("name" => "advantage"));
            if (is_array($advantage) && $advantage['state'] == 100) {
                $huoniaoTag->assign("advantage", $detailConfig['info']);
            } else {
                $huoniaoTag->assign("advantage", array());
            }

            global $cfg_photoSize;
            global $cfg_photoType;
            $huoniaoTag->assign('photoSize', $cfg_photoSize);
            $huoniaoTag->assign('photoType', str_replace("|", ",", $cfg_photoType));

            $detailHandels = new handlers($action, "resumeDetail");
            $detailConfig = $detailHandels->getHandle(array("default" => 1));

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                if (is_array($detailConfig)) {

                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
            }
        }
        //对我感兴趣
        elseif ($module == "interested") {
            //查询是否有简历
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=" . $userid);
            $huoniaoTag->assign("hasResume", $dsql->getOne($sql) > 0 ? 1 : 0);
        }
        //用户端pc，页面job-index
        elseif ($module == "index" || $action == "index_job") {
            //收藏职位统计
            $sql = $dsql::SetQuery("SELECT count(c.`aid`) FROM `#@__member_collect` c,`#@__job_post` p WHERE c.`module` = 'job' AND c.`action` = 'job' AND c.`userid` = '$userid' AND p.`id`=c.`aid`");
            $collectJobCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("collectJobCount", $collectJobCount);
            //收藏公司数
            $sql = $dsql::SetQuery("SELECT count(`aid`) FROM `#@__member_collect` c,`#@__job_company` p WHERE c.`module` = 'job' AND c.`action` = 'company' AND c.`userid` = '$userid' AND p.`id`=c.`aid`");
            $collectCompanyCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("collectCompanyCount", $collectCompanyCount);
            //投递统计
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` d left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $userid");
            $deliveryCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("deliveryCount", $deliveryCount);
            //面试统计
            $invitationList = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_invitation` where `userid`=$userid and `state`=1 and `date`>=unix_timestamp(current_timestamp)"));
            $huoniaoTag->assign("invitationCount", $invitationList);
            //投递小红点
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` d left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $userid and d.`u_read`=0");
            $deliveryPoint = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("deliveryPoint", $deliveryPoint);
            //面试小红点
            $invitationPoint = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_invitation` where `userid`=$userid and `state`=1 and `date`>=unix_timestamp(current_timestamp) and `u_read`=0"));
            $huoniaoTag->assign("invitationPoint", $invitationPoint);
            //关注公司小红点
            $sql = $dsql::SetQuery("SELECT count(`aid`) FROM `#@__member_collect` c,`#@__job_company` p WHERE c.`module` = 'job' AND c.`action` = 'company' AND c.`userid` = '$userid' AND p.`id`=c.`aid` AND c.`u_read`=0");
            $collectCompanyPoint = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("collectCompanyPoint", $collectCompanyPoint);
            //收藏职位小红点
            $sql = $dsql::SetQuery("SELECT count(`aid`) FROM `#@__member_collect` c,`#@__job_post` p WHERE c.`module` = 'job' AND c.`action` = 'job' AND c.`userid` = '$userid' AND p.`id`=c.`aid` and c.`u_read`=0");
            $collectJobPoint = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("collectJobPoint", $collectJobPoint);

            include(HUONIAOINC . '/config/job.inc.php');
            $huoniaoTag->assign("customPgCustomName", $customPgCustomName);
        }
        if ($action == "post_detail") {
            //简历份数，默认简历id和标题
            $huoniaoTag->assign("resumeCount", (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=$userid and `del`=0")));
            $defaultResumeDetail = $dsql->getArr($dsql::SetQuery("select `id`,`alias` from `#@__job_resume` where `userid`=$userid and `default`=1 and `del`=0"));
            $huoniaoTag->assign('resumeDefaultId', (int)$defaultResumeDetail['id']);
            $huoniaoTag->assign("resumeDefaultName", $defaultResumeDetail['alias']);
        }
    } elseif ($action == "manage_worker") {
        $sql = "select count(*) from `#@__job_pg` where 1=1 and `del`=0";
        $sql2 = "select count(*) from `#@__job_qz` where 1=1 and `del`=0";
        $memberInfo = $userLogin->getMemberInfo();
        $sql .= " AND (`userid`=$userid";
        $sql2 .= " AND (`userid`=$userid";
        if ($memberInfo['phoneCheck'] == 1) {
            $sql .= " or `phone`='{$memberInfo['phone']}'";
            $sql2 .= " or `phone`='{$memberInfo['phone']}'";
        }
        $sql .= ")";
        $sql2 .= ")";
        $pgCount = (int)$dsql->getOne($dsql::SetQuery($sql));
        $qzCount = (int)$dsql->getOne($dsql::SetQuery($sql2));
        $huoniaoTag->assign("pgCount", $pgCount);
        $huoniaoTag->assign("qzCount", $qzCount);
    } elseif ($action == "renovation") {
        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('module', $module);
        $Identity  = array();


        $foremansql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = $userid");
        $foremanret = $dsql->dsqlOper($foremansql, "results");


        if ($foremanret) {
            $foremanarr = array('type' => 'foreman', 'typeid' => '1', 'id' => $foremanret[0]['id']);

            $Identity['foreman'] = $foremanarr;
        } else {

            $Identity['foreman'] = array();
        }

        $teamsql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = $userid");
        $teamret = $dsql->dsqlOper($teamsql, "results");

        if ($teamret) {
            $teamarr = array('type' => 'designer', 'typeid' => '2', 'id' => $teamret[0]['id']);

            $Identity["designer"] = $teamarr;
        } else {
            $Identity['designer'] = array();
        }

        $storesql  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE  `userid` = $userid");
        $storeres  = $dsql->dsqlOper($storesql, "results");

        if ($storeres) {
            $storearr = array('type' => 'store', 'typeid' => '0', 'id' => $storeres[0]['id']);

            $Identity['store'] = $storearr;
        } else {

            $Identity['store'] = array();
        }
        if (!empty($type)) {
            $huoniaoTag->assign('Identity', $Identity[$type]);
        } else {
            $huoniaoTag->assign('Identity', $Identity);
        }

        //        var_dump($Identity);die;

        foreach ($Identity as $key => $value) {
            $huoniaoTag->assign($key, $value);
        }
        if ($module == "profile" || $module == "case" || $module == "article" || $module == "customer") {
            $id = $Identity[$type]['id'];
            $huoniaoTag->assign('id', $id);
            global $cfg_photoSize;
            global $cfg_photoType;
            $huoniaoTag->assign('photoSize', $cfg_photoSize);
            $huoniaoTag->assign('photoType', str_replace("|", ",", $cfg_photoType));
            if ($type == 'foreman') {
                $actiondetail = "foremanDetail";
                $profiletype      = '1';
            } else {
                $actiondetail =  "teamDetail";
                $profiletype      = '2';
            }
            $huoniaoTag->assign('profiletype', $profiletype);
            $detailHandels = new handlers($action, $actiondetail);
            $detailConfig  = $detailHandels->getHandle($id);
            //            echo '<pre>';
            //            var_dump($detailConfig);die;

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                if (is_array($detailConfig)) {

                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
            }
        }

        //外卖菜单
    } elseif ($action == "waimai-menus" || $action == "waimai-albums" || $action == "waimai-albums-add") {

        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('module', $module);

        global $userLogin;
        $userid = $userLogin->getMemberID();
        $storeid = 0;
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_store` WHERE `userid` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $storeid = $ret[0]['id'];
        }
        $huoniaoTag->assign('storeid', $storeid);
        return;

        //活动报名
    } elseif ($action == "huodong-reg") {
        $userLogin->checkUserIsLogin();

        $id = (int)$id;
        $huoniaoTag->assign("id", $id);

        //自助建站设计
    } elseif ($action == "dressup-website") {
        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            $param = array(
                "service"  => "member",
                "template" => "config",
                "action"   => "website"
            );
            header('location:' . getUrlPath($param));
        }

        $site = $userResult[0]['id'];
        $huoniaoTag->assign('PROJECTID', $site);

        //我参与的活动
    } elseif ($action == "huodong-join") {
        $userLogin->checkUserIsLogin();

        // 第三方登陆用户绑定手机号
    } elseif ($action == "bindMobile") {

        if ($userLogin->getMemberID() > -1) {
            header("location:" . $cfg_secureAccess . $cfg_basehost);
        }

        $uid = GetCookie("connect_uid") ? GetCookie("connect_uid") : $connect_uid;
        if (empty($uid)) {

            //APP端手机号码绑定成功后执行appLoginFinish和goBack方法导致刷新所有页面，绑定手机号码的页面如果重复刷新，会强制跳回到大首页，在APP端会回不到用户中心，所以这里限制跳转
            if(isApp()){
                die;
            }
            
            header("location:" . $cfg_secureAccess . $cfg_basehost);
        }

        PutCookie("connect_uid", $uid, 300, '/');

        if (empty($type)) {
            header("location:/404.html");
        }

        $url = isset($_SESSION['loginRedirect']) ? $_SESSION['loginRedirect'] : "";
        if (strstr($url, "logout.html") || strstr($url, "login.html") || strstr($url, "registerCheck") !== FALSE) {
            $url = "";
        }
        $huoniaoTag->assign('code', $type);
        $huoniaoTag->assign('connect_uid', $uid);
        $huoniaoTag->assign('loginRedirect', $url);
        $huoniaoTag->assign('redirectUrl', $url);


        //系统版本信息
    } elseif ($action == "version") {

        $sql = $dsql->SetQuery("SELECT `logo`, `android_version`, `ios_version`, `android_download`, `ios_download` FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $data = $ret[0];

            $huoniaoTag->assign('logo', getFilePath($data['logo']));
            $huoniaoTag->assign('android_version', $data['android_version']);
            $huoniaoTag->assign('ios_version', $data['ios_version']);
            $huoniaoTag->assign('android_download', $data['android_download']);
            $huoniaoTag->assign('ios_download', $data['ios_download']);
        }

        //会员升级 20170725
    } elseif ($action == "upgrade" || $action == "myhui" || $action == "opendetail") {
        $uid = $userLogin->getMemberID();
        $userLogin->checkUserIsLogin();

        global $installModuleArr;
        
        global $cfg_ucenterLinks;
        $cfg_ucenterLinks = explode(',', $cfg_ucenterLinks);

        if($action == 'upgrade' && !in_array('vip', $cfg_ucenterLinks)){
            $param = array(
                "service" => "member",
                "type" => "user"
            );
            $url = getUrlPath($param);
            die('<meta charset="UTF-8"><script type="text/javascript">alert("系统未开启VIP会员功能！");top.location="'.$url.'";</script>');
        }

        //信息
        $memberLevelAuth    = getMemberLevelAuth($userinfo['level']);
        $infoCount          = (int)$memberLevelAuth['info'];
        $houseCount         = (int)$memberLevelAuth['house'];
        $tiebaCount         = (int)$memberLevelAuth['tieba'];
        $huodongCount       = (int)$memberLevelAuth['huodong'];
        $liveCount          = (int)$memberLevelAuth['live'];
        $educationCount     = (int)$memberLevelAuth['education'];
        $carCount           = (int)$memberLevelAuth['car'];
        $voteCount          = (int)$memberLevelAuth['vote'];
        //本周
        $today = GetMkTime(date('Y-m-d', (time() - ((date('w', time()) == 0 ? 7 : date('w', time())) - 1) * 24 * 3600)));
        $tomorrow = $today + 604800;

        //info
        if (in_array("info", $installModuleArr)) {
            $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadyinfoFabu = $ret[0]['total'];
                $privilegeinfo['info']  = abs($infoCount - $alreadyinfoFabu);
            }
        }

        //house
        $saleCount = $zuCount = $xzlCount = $spCount = $cfCount = 0;

        //二手房已发布数量
        if (in_array("house", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_sale` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $saleCount = $ret[0]['total'];
            }

            //租房已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_zu` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $zuCount = $ret[0]['total'];
            }

            //写字楼已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_xzl` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $xzlCount = $ret[0]['total'];
            }

            //商铺已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_sp` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $spCount = $ret[0]['total'];
            }

            //厂房已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_cf` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $cfCount = $ret[0]['total'];
            }

            //车位已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_cw` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $cwCount = $ret[0]['total'];
            }
        }

        $alreadyhouseFabu       = $saleCount + $zuCount + $xzlCount + $spCount + $cfCount + $cwCount;

        $privilegeinfo['house'] = abs($houseCount - $alreadyhouseFabu);

        //tieba
        if (in_array("tieba", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__tieba_list` WHERE `uid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadytiebaFabu       = $ret[0]['total'];
                $privilegeinfo['tieba'] = abs($tiebaCount - $alreadytiebaFabu);
            }
        }

        //huodong
        if (in_array("huodong", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__huodong_list` WHERE `uid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadyhuodongFabu         = $ret[0]['total'];
                $privilegeinfo['huodong']   = abs($huodongCount - $alreadyhuodongFabu);
            }
        }

        //live

        if (in_array("live", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__livelist` WHERE `user` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadylivegFabu           = $ret[0]['total'];
                $privilegeinfo['live']      = abs($liveCount - $alreadylivegFabu);
            }
        }

        //education
        if (in_array("education", $installModuleArr)) {
            $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__education_courses` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadyeducationFabu           = $ret[0]['total'];
                $privilegeinfo['education']     = abs($educationCount - $alreadyeducationFabu);
            }
        }

        //car
        if (in_array("car", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__car_list` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadycarFabu             = $ret[0]['total'];
                $privilegeinfo['car']       = abs($carCount - $alreadycarFabu);
            }
        }

        //vote
        if (in_array("vote", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__vote_list` WHERE `admin` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadyvoteFabu            = $ret[0]['total'];
                $privilegeinfo['vote']      = abs($voteCount - $alreadyvoteFabu);
            }
        }

        //sfcar
        if (in_array("sfcar", $installModuleArr)) {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__sfcar_list` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadyvoteFabu            = $ret[0]['total'];
                $privilegeinfo['sfcar']     = abs($voteCount - $alreadyvoteFabu);
            }
        }


        //会员拥有的权益
        $huoniaoTag->assign('privilegeinfo', $privilegeinfo);

        //充值记录
        $sql        = $dsql->SetQuery("SELECT * FROM `#@__member_levelinfo` WHERE `userid` = $uid");
        $levelinfo  = $dsql->dsqlOper($sql, "results");

        // echo "<pre>";
        // var_dump($privilegeinfo);die;
        $huoniaoTag->assign('levelinfo', $levelinfo);
    } elseif ($action == "upgrade-pay") {

        $userLogin->checkUserIsLogin();

        $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "upgrade"
        );
        $upgradeUrl = getUrlPath($param);

        if (empty($level) || empty($day) || empty($daytype)) {
            header("location:" . $upgradeUrl);
            die;
        }

        //验证是否合法
        $sql = $dsql->SetQuery("SELECT `name`, `cost` FROM `#@__member_level` WHERE `id` = $level");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            $name = $ret[0]['name'];
            $_day = $price = 0;
            $_daytype = "";
            $cost = !empty($ret[0]['cost']) ? unserialize($ret[0]['cost']) : array();

            if ($cost) {
                foreach ($cost as $key => $value) {
                    if ($value['day'] == $day && $value['daytype'] == $daytype) {
                        $_day = $day;
                        $_daytype = $value['daytype'];
                        $price = $value['price'];
                    }
                }

                if (empty($_day)) {
                    header("location:" . $upgradeUrl);
                    die;
                }

                $huoniaoTag->assign('name', $name);
                $huoniaoTag->assign('level', $level);
                $huoniaoTag->assign('day', $_day);
                $huoniaoTag->assign('daytype', $_daytype);
                $huoniaoTag->assign('price', $price);
            } else {
                header("location:" . $upgradeUrl);
                die;
            }
        } else {
            header("location:" . $upgradeUrl);
            die;
        }

        //商家入驻 20170803
        //手机版有入驻前的介绍页面，电脑版没有，所以需要增加以下判断
        // 20180815
        // 电脑版也进入enter-upload页面
        // }elseif($action == "enter"){

        //  $param = array(
        //      "service"  => "member",
        //      "type"     => "user",
        //      "template" => "enter-upload"
        //  );
        //  header("location:" . getUrlPath($param));
        //  die;

        //填写入驻资料
    } elseif ($action == "enter-upload" || strpos($action, "business-enter") !== false || strpos($action, "business-config") !== false || strpos($action, "business-custom") !== false) {
        // 移动端跳到个人中心
        if ($action == "business-config") {
            if (isMobile()) {
                $url_ = GetCurUrl();
                $url = getUrlPath(array("service" => "member", "type" => "user", "template" => $action));
                if (!strstr($url, $url_)) {
                    header("location:" . $url);
                    die;
                }
            }
        }
        $userLogin->checkUserIsLogin();

        //查询当前登录会员是否已经填写过资料
        //如果已经填写过，直接跳转至选择开通模块页
        //如果已经付过钱，需要跳转到等待审核页面
        //如果已经入驻成功，跳转到成功页面
        $uid = $userLogin->getMemberID();

        //查询是否填写过入驻申请
        $sql = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE `uid` = $uid ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $state = $ret[0]['state'];

            // 更新会员状态为企业会员,如果后台将此会员类型设为普通会员，会导致页面无法访问
            // $sql = $dsql->SetQuery("UPDATE `#@__member` SET `mtype` = 2 WHERE `id` = $uid AND `mtype` = 1");
            // $dsql->dsqlOper($sql, "update");

            $sql = $dsql->SetQuery("SELECT `mtype` FROM `#@__member` WHERE `id` = $uid");
            $ret_ = $dsql->dsqlOper($sql, "results");
            // 待审核或待支付
            if ($ret_[0]['mtype'] != 2 && $state == 4) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                );
                $url = getUrlPath($param);
                die('<meta charset="UTF-8"><script type="text/javascript">alert("' . $langData['siteConfig'][33][51] . '");top.location="' . $url . '";</script>'); //您的帐号会员类型异常，请联系管理员！
            }
            if ($ret[0]['state'] == 4) {
                // $param = array(
                //  "service" => "member",
                //  "type" => "user",
                // );
                // $url = getUrlPath($param);
                // die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$langData['siteConfig'][21][181].'");top.location="'.$url.'";</script>');//您还没有入驻商家！
            }

            $openweek = explode(',', $ret[0]['openweek']);
            $openweek_str = opentimeFormat($ret[0]['openweek']);
            $opentimes = explode(',', $ret[0]['opentimes']);
            $ret[0]["openweek"]         = $openweek;
            $ret[0]["openweek_str"]     = $openweek_str;
            $ret[0]["opentimes"]        = $opentimes;
            $ret[0]["opentimes_str"]    = join(' ', $opentimes);

            $ret[0]["opentime"] = $openweek_str . ' ' . join(' ', $opentimes);

            foreach ($ret[0] as $key => $value) {
                if ($key == "addrid") {
                    $value = empty($value) ? "" : $value;
                }
                if ($key == "tel" || $key == "qq" || $key == "email") {
                    $value_ = empty($value) ? array() : explode(",", $value);
                    $huoniaoTag->assign($key . 'Arr', $value_);
                }
                if ($key == "logo" || $key == "wechatqr" || $key == "video_pic" || $key == "mappic") {
                    $huoniaoTag->assign($key . 'Source', $value);
                    $value = $value ? getFilePath($value) : "";
                }
                if (($key == "banner" || $key == "video" || $key == "qj_file" || $key == "quality") && $value) {
                    $source = explode(',', $value);
                    $res = array();
                    foreach ($source as $k => $v) {
                        $res[$k]['path'] = getFilePath($v);
                        $res[$k]['source'] = $v;
                    }
                    $huoniaoTag->assign($key . 'Arr', $res);
                }
                if ($key == "custom_nav") {
                    $custom_navArr = array();
                    if ($value) {
                        $value_ = explode("|", $value);
                        foreach ($value_ as $k => $v) {
                            $d = explode(',', $v);
                            $custom_navArr[$k] = array(
                                'icon' => $d[0],
                                'iconSource' => getFilePath($d[0]),
                                'title' => $d[1],
                                'url' => $d[2],
                            );
                        }
                    }
                    $huoniaoTag->assign('custom_navArr', $custom_navArr);
                }

                if ($key == "circle") {
                    $circle_ids = array();
                    $circleName = array();
                    if ($value) {
                        if ($ret[0]['addrid']) {
                            $sql = $dsql->SetQuery("SELECT * FROM `#@__site_city_circle` WHERE `id` IN (" . $value . ") ORDER BY `id`");
                            $res = $dsql->dsqlOper($sql, "results");
                            if ($res) {
                                foreach ($res as $k => $v) {
                                    if ($v['qid'] == $ret[0]['addrid']) {
                                        $circle_ids[] = $v['id'];
                                        $circleName[] = $v['name'];
                                    }
                                }
                            }
                        }
                        $value_ = join(",", $circle_ids);
                        if ($value_ != $value) {
                            $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `circle` = '$value_' WHERE `uid` = $uid");
                            $dsql->dsqlOper($sql, "update");
                        }
                    }
                    $circle_ids = $value ? explode(",", $value) : array();
                    $huoniaoTag->assign('circle_ids', $circle_ids);
                    $huoniaoTag->assign('circleName', join(" ", $circleName));

                    if ($value) {
                        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_city_circle` WHERE `id` IN (" . $value . ")");
                        $res = $dsql->dsqlOper($sql, "results");
                    }
                }

                // if($key == "weeks"){
                //     $weekDay = "";
                //
                //     if($value){
                //         $value_ = explode(",", $value);
                //         $weeks = $langData['siteConfig'][34][5];
                //         if(count($value_) == 1){
                //             $weekDay = $value_[0];
                //         }else{
                //             $value_t = array();
                //             foreach ($value_ as $k => $v) {
                //                 if($k == 0){
                //                     $value_t[0] = $weeks[$v-1];
                //                 }
                //                 if($k > 0 && $k + 1 == count($value_)){
                //                     $value_t[1] = $weeks[$v-1];
                //                 }
                //                 if($k > 0 && $v - $value_[$k-1] > 1){
                //                     $value_t[0] = $weeks[$v-1];
                //                     $value_t[1] = $weeks[$value_[0]-1];
                //                     break;
                //                 }
                //             }
                //             $weekDay = $value_t[0] . $langData['siteConfig'][13][7] . $value_t[1];//至
                //         }
                //     }
                //     $huoniaoTag->assign('weekDay', $weekDay);
                //
                // }
                //
                // if($key == "opentime"){
                //     $value = str_replace(";", "-", $value);
                // }

                if ($key == "tag_shop") {
                    $huoniaoTag->assign('tag_shopArr', $value ? explode("|", $value) : array());
                }

                $huoniaoTag->assign($key, $value);
            }

            // 输出自定义菜单
            if ($action == "business-config_custom" || $action == "business-custom_menu") {
                $sql = $dsql->SetQuery("SELECT * FROM `#@__business_menu` WHERE `uid` = $uid ORDER BY `weight`, `id`");
                $res = $dsql->dsqlOper($sql, "results");

                $huoniaoTag->assign('menuList', $res);
            }

            // 获取商家模块公共配置
            $businessHandlers = new handlers("business", "config");
            $businessConfig  = $businessHandlers->getHandle();
            $businessConfig = $businessConfig['info'];

            $businessTag_all = $businessConfig['businessTag'];
            $businessTag_all_ = array();

            $businessTag = $ret[0]['tag'];
            if ($businessTag) {
                $businessTag_ = explode('|', $businessTag);
            } else {
                $businessTag_ = array();
            }
            foreach ($businessTag_all as $v) {
                $businessTag_all_[] = array(
                    'name' => $v,
                    'icon' => 'b_sertag_' . GetPinyin($v) . '.png',
                    'active' => in_array($v, $businessTag_) ? 1 : 0
                );
            }

            $huoniaoTag->assign('businessTag_state', $businessTag_all_);
        } else {
            $userinfo = $userLogin->getMemberInfo();
            if ($userinfo['userType'] == 1) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "enter"
                );
            } else {
                $param = array(
                    "service" => "member",
                );
            }
            $url = getUrlPath($param);
            header("location:" . $url);
        }


        //选择要开通的模块
        //选择开通年限&选择支付方式
    } elseif ($action == "enter-review") {

        $userLogin->checkUserIsLogin();
        $uid = $userLogin->getMemberID();

        //查询是否填写过入驻申请
        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__business_list` WHERE `uid` = $uid ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            $id = $ret[0]['id'];
            $state = $ret[0]['state'];

            //状态为3时表示已经支付完成，待审核
            if ($state != 3) {
                $param = array(
                    "service"  => "member",
                    "type" => "user"
                );
                header("location:" . getUrlPath($param));
                die;
            }

            //没填写过的，跳转到首页
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost);
        }


        //保障金
    } elseif ($action == "promotion" || $action == "extract" || $action == "payment") {

        $userLogin->checkUserIsLogin();

        $huoniaoTag->assign("type", $type);

        global $cfg_promotion_note;
        global $cfg_promotion_least;
        global $cfg_promotion_limitVal;
        global $cfg_promotion_limitType;
        global $cfg_promotion_reason;

        $limitType = '';
        if ($cfg_promotion_limitType == 1) {
            $limitType = 'day';
        } elseif ($cfg_promotion_limitType == 2) {
            $limitType = 'month';
        } elseif ($cfg_promotion_limitType == 3) {
            $limitType = 'year';
        }

        //查询可提取的保障金 = 一年前的缴纳总额 - 已提取总额
        $totalPromotion = $alreadyExtract = 0;
        $uid = $userLogin->getMemberID();
        $yearAgo = GetMkTime(date("Y-m-d H:i:s", strtotime("-" . $cfg_promotion_limitVal . " " . $limitType)));

        if ($cfg_promotion_limitVal) {
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) as total FROM `#@__member_promotion` WHERE `type` = 1 AND `uid` = $uid AND `date` < $yearAgo");
        } else {
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) as total FROM `#@__member_promotion` WHERE `type` = 1 AND `uid` = $uid");
        }
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $totalPromotion = $ret[0]['total'];
        }
        $sql = $dsql->SetQuery("SELECT SUM(`amount`) as total FROM `#@__member_promotion` WHERE `type` = 0 AND (`state` = 0 OR `state` = 1) AND `uid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $alreadyExtract = $ret[0]['total'];
        }
        $extract = $totalPromotion - $alreadyExtract;
        $huoniaoTag->assign("extract", sprintf('%.2f', $extract < 0 ? 0 : $extract));

        $huoniaoTag->assign('cfg_promotion_note', $cfg_promotion_note);
        $huoniaoTag->assign('cfg_promotion_least', ($cfg_promotion_least ? (float)$cfg_promotion_least : ''));
        $huoniaoTag->assign('cfg_promotion_limitVal', ($cfg_promotion_limitVal ? (int)$cfg_promotion_limitVal : ''));
        $huoniaoTag->assign('cfg_promotion_limitType', (int)($cfg_promotion_limitType ? $cfg_promotion_limitType : 1));
        $huoniaoTag->assign('cfg_promotion_reason', $cfg_promotion_reason ? explode("\r\n", $cfg_promotion_reason) : array());


        //模块管理
    } elseif ($action == "module") {

        $userLogin->checkUserIsLogin();

        $huoniaoTag->assign("type", (int)$type);
        $huoniaoTag->assign("state", $state);

        $url = $furl ? urldecode($furl) : $_SERVER['HTTP_REFERER'];
        $huoniaoTag->assign("url", $url);

        //商家服务-配置
    } elseif ($action == "business-service" || $action == "business-service-setting") {
        $userLogin->checkUserIsLogin();

        $param = array("type" => $type);
        $serviceHandel = new handlers("business", "serviceConfig");
        $serviceConfig  = $serviceHandel->getHandle($param);
        if (is_array($serviceConfig) && $serviceConfig['state'] == 100) {
            $serviceConfig  = $serviceConfig['info'];
            if (is_array($serviceConfig)) {
                foreach ($serviceConfig as $key => $value) {
                    $huoniaoTag->assign($key, $value);
                }
            }
        }

        $huoniaoTag->assign('type', $type);

        //商家服务-订单内标
    } elseif ($action == "business-service-order") {
        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('state', $state);

        //商家点餐-商品
    } elseif ($action == "business-service-list") {

        $userLogin->checkUserIsLogin();
        $uid = $userLogin->getMemberID();

        if ($type == "diancan") {

            $param = array(
                "service" => "member",
                "template" => $action
            );
            $url = getUrlPath($param);

            if ($dopost == "edit" || $dopost == "add") {
                $id = (int)$id;
                $huoniaoTag->assign('pics', '[]');
                if ($dopost == "edit") {
                    if (empty($id)) {
                        header("location:$url");
                        return;
                    } else {
                        //获取信息内容
                        $sql = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_list` WHERE `id` = $id AND `uid` = $uid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {

                            foreach ($ret[0] as $key => $value) {

                                //商品属性
                                if ($key == "nature") {
                                    $value = unserialize($value);
                                }

                                //图片
                                if ($key == "pics") {
                                    $value = !empty($value) ? json_encode(explode(",", $value)) : "[]";
                                }

                                //标签，表字段从label变更成了tag，前端还是用的label，这里重置为label
                                if ($key == "tag") {
                                    $key = "label";
                                }

                                $huoniaoTag->assign($key, $value);
                            }
                        } else {
                            header("location:$url");
                            return;
                        }
                    }
                }
                $huoniaoTag->assign("id", $id);
            } else {
                $huoniaoTag->assign("title", $title);
                $huoniaoTag->assign("typename", $typename);
                $huoniaoTag->assign("typeid", (int)$typeid);
            }
        } elseif ($type == 'dingzuo') {
            $detailHandels = new handlers('business', "dingzuoCategory");
            $detailConfig  = $detailHandels->getHandle(array("son" => 1, "tab" => $dopost));

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig  = $detailConfig['info'];
                if (is_array($detailConfig)) {

                    $huoniaoTag->assign('typeList', $detailConfig);
                }
            }
        }


        $huoniaoTag->assign("type", $type);
        $huoniaoTag->assign("dopost", $dopost);


        //商家服务-订单列表
    } elseif ($action == "business-diancan-order" || $action == "business-dingzuo-order" || $action == "business-paidui-order" || $action == "business-maidan-order" || $action == "business-maidan-orderdetail") {
        $userLogin->checkUserIsLogin();

        $huoniaoTag->assign("type", $type);

        //买单订单详情
        if ($action == "business-maidan-orderdetail") {
            $id = (int)$id;
            $detailHandels = new handlers("business", "maidanOrderDetail");
            $detailConfig  = $detailHandels->getHandle(array('id' => $id, 'u' => 1));

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig  = $detailConfig['info'];
                if (is_array($detailConfig)) {
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
        }


        //会员主页
    } elseif ($action == "user" || $action == "user_fans" || $action == "user_follow" || $action == "user_visitor" || $action == "user_message" ||  $action == "user_fabu" ||  $action == "user_info") {
        $huoniaoTag->assign("type", $type);
        $id = (int)$id;  //如果不强制获取，会报sql错误

        //如果不传id，使用当前登录用户的ID
        if(!$id){
            $id = $userLogin->getMemberID();
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/user/" . $id);
            die;
        }

        // var_dump($_REQUEST);die;
        //查询用户信息

        $sql = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`mtype`,m.`state`, m.`company`, m.`level`, m.`photo`, m.`sex`,m.`birthday`,m.`qq`, m.`phone`,m.`regtime`,l.`name` level_name, l.`icon` level_icon, a.`typename` addr, count(mes.`id`) totalMessage, (SELECT count(f.`id`) FROM `#@__member_follow` f LEFT JOIN `#@__member` m1 ON m1.`id` = f.`tid` WHERE f.`fid` = $id AND m1.id != '' AND m1.`mtype`!=0) as totalFans, (SELECT count(f.`id`) FROM `#@__member_follow` f LEFT JOIN `#@__member` m2 ON m2.`id` = f.`fid`  WHERE f.`tid` = $id  AND m2.`id` != '' AND m2.`mtype`!=0) as totalFollow ,(SELECT count(`id`) FROM `#@__member_visitor` WHERE `tid` =$id) as totalVisitor FROM `#@__member` m LEFT JOIN `#@__member_level` l ON l.`id` = m.`level` LEFT JOIN `#@__site_area` a ON a.`id` = m.`addr` LEFT JOIN `#@__member_message` mes ON mes.`tid` = m.`id` WHERE m.`id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret && is_array($ret) && $ret[0]['id']) {

            $data = $ret[0];

            //如果访问的个人主页是商家则重定向跳转到商家端主页
            if ($data['mtype'] == 2 && $data['state'] == 1 && $template != 'user_fans' && $template != 'user_follow') {
                $uid = $id;
                $info = $userLogin->getMemberInfo($uid);
                $busiId = $info['busiId'];
                $param = array(
                    "service" => "business",
                    "template" => "detail",
                    "id" => $busiId
                );
                $resumeUrl = getUrlPath($param);
                header('location:' . $resumeUrl);
                die;
            }

            $nickname   = $data['mtype'] == 2 ? (!empty($data['company']) ? $data['company'] : $data['nickname']) : $data['nickname'];
            $level      = $data['level'];
            $qq         = $data['qq'];
            $phone      = $data['phone'];
            $regtime    = (int)((time() - $data['regtime']) / 31104000);
            $birthday   = $data['birthday'] != '' ? date("Y-m-d", $data['birthday']) : '';
            $photo      = !empty($data['photo']) ? getFilePath($data['photo']) : "";
            $addr       = $data['addr'];
            $sex        = $data['sex'];
            $level_name = $data['level_name'];
            $level_icon = !empty($data['level_icon']) ? getFilePath($data['level_icon']) : "";
            $totalMessage = (int)$data['totalMessage'];
            $totalFans    = (int)$data['totalFans'];
            $totalFollow  = (int)$data['totalFollow'];
            $totalVisitor = (int)$data['totalVisitor'];

            $huoniaoTag->assign('id', $id);
            $huoniaoTag->assign('regtime', $regtime);
            $huoniaoTag->assign('regtime_', $data['regtime']);
            $huoniaoTag->assign('nickname', $nickname);
            $huoniaoTag->assign('birthday', $birthday);
            $huoniaoTag->assign('photo', $photo);
            $huoniaoTag->assign('sex', $sex);
            $huoniaoTag->assign('level', $level);
            $huoniaoTag->assign('level_name', $level_name);
            $huoniaoTag->assign('level_icon', $level_icon);
            $huoniaoTag->assign('addr', $addr);
            $huoniaoTag->assign('totalMessage', $totalMessage);
            $huoniaoTag->assign('totalFans', $totalFans);
            $huoniaoTag->assign('totalFollow', $totalFollow);
            $huoniaoTag->assign('totalVisitor', $totalVisitor);

            $huoniaoTag->assign('action', $action);

            //判断当前登录会员是否已经关注过要访问的会员
            $userid     = $userLogin->getMemberID();
            $userinfo   = $userLogin->getMemberInfo($id);
            $memberModule = $userLogin->getMemberModule($id);
            $huoniaoTag->assign('userModulearr', $memberModule);
            if ($userid > 0) {
                // $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = $id AND `fortype` = ''");
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = $id"); //新版个人中心不再判断关注来源
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret && is_array($ret)) {
                    $huoniaoTag->assign('isfollow', 1);
                }

                //记录浏览记录
                if ($userid != $id) {
                    $time = time();
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_visitor` WHERE `uid` = $userid AND `tid` = $id");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        //浏览过的更新时间
                        $sql = $dsql->SetQuery("UPDATE `#@__member_visitor` SET `date` = $time WHERE `uid` = $userid AND `tid` = id");
                        $dsql->dsqlOper($sql, "update");
                    } else {
                        //新增记录
                        $sql = $dsql->SetQuery("INSERT INTO `#@__member_visitor` (`uid`, `tid`, `date`) VALUES ('$userid', '$id', '$time')");
                        $dsql->dsqlOper($sql, "update");
                    }
                }
            }

            //简历地址
            if (in_array("job", $installModuleArr)) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `userid` = $id");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret && is_array($ret)) {
                    $resumeid = $ret[0]['id'];
                    $param = array(
                        "service" => "job",
                        "template" => "resume",
                        "id" => $resumeid
                    );
                    $resumeUrl = getUrlPath($param);
                    $huoniaoTag->assign("resumeUrl", $resumeUrl);
                }
            }

            //交友地址
            if (in_array("dating", $installModuleArr)) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__dating_member` WHERE `userid` = $id");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret && is_array($ret)) {
                    $datingid = $ret[0]['id'];
                    $param = array(
                        "service" => "dating",
                        "template" => "u",
                        "id" => $datingid
                    );
                    $datingUrl = getUrlPath($param);
                    $huoniaoTag->assign("datingUrl", $datingUrl);
                }
            }

            $detailHandels  = new handlers('member', "fabuCount");
            $detailConfig   = $detailHandels->getHandle(array("uid" => $id));
            $detailConfig   = $detailConfig['state'] == 100 ? $detailConfig['info'] : array();

            $modulename     = $detailConfig ? array_column($detailConfig, 'title', 'modulename') : array();
            $usercountall   = $detailConfig ? array_column($detailConfig, 'countall', 'modulename') : array();
            $allcount       = $detailConfig ? array_sum($usercountall) : 0;
            if ((is_array($memberModule) && is_array($memberModule['userModulearr']) && !in_array('circle', $memberModule['userModulearr'])) || !isMobile()) {
                if ($qmodule == '') {
                    $fmodule = array_keys(array_filter($usercountall));
                    $qmodule = $fmodule[0] ? $fmodule[0] :  '';
                }
            } else {
                $qmodule = $qmodule ? $qmodule : '';
            }
            $huoniaoTag->assign("module", $qmodule);
            $huoniaoTag->assign("detailConfig", $detailConfig); //发布统计
            $huoniaoTag->assign("modulename", $modulename); //模块名字
            $huoniaoTag->assign("usercountall", $usercountall); //用户发布的数量
            $huoniaoTag->assign("allcount", $allcount); //用户总发布的数量

            //房产经济人
            if (in_array("house", $installModuleArr)) {
                $housesql  = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $id AND `state` = 1");
                $houseres  = $dsql->dsqlOper($housesql, "results");
                if ($houseres) {
                    $param = array(
                        "service"     => "house",
                        "template"    => "broker-detail",
                        "id"          => $houseres[0]['id']
                    );
                }
            }
            $is_zjuer = empty($houseres) ? 0 : 1;
            $huoniaoTag->assign("is_zjuer", $is_zjuer);
            $huoniaoTag->assign("zjuerurl", $param ? getUrlPath($param) : 'javascript:;');
            $huoniaoTag->assign("housecount", $usercountall['house']);

            //自媒体
            if (in_array("article", $installModuleArr)) {
                $param = array();
                $articlesql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia` WHERE `userid` = $id AND `state` = 1");
                $articleres = $dsql->dsqlOper($articlesql, "results");

                $sql    = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__articlelist_all` WHERE `admin` = $id AND `arcrank` = 1  AND `del` =0");
                $result = $dsql->dsqlOper($sql, "results");
                $param = array(
                    "service"     => "article",
                    "template"    => "mddetail",
                    "id"          => $articleres[0]['id']
                );
            }
            $is_selfmedia = empty($articleres) ? 0 : 1;
            $huoniaoTag->assign("is_selfmedia", $is_selfmedia);
            $huoniaoTag->assign("selfmediaurl", getUrlPath($param));
            $huoniaoTag->assign("selfmediacount", (int)$result[0]['countall']);
            $huoniaoTag->assign("selfmediaid", (int)$articleres[0]['id']);


            //家教
            if (in_array("education", $installModuleArr)) {
                $param = array();
                $educationsql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = $id AND `state` = 1");
                $educationres = $dsql->dsqlOper($educationsql, "results");
                $param = array(
                    "service"     => "education",
                    "template"    => "tutor-detail",
                    "id"          => $educationres[0]['id']
                );
            }
            $is_tutor = empty($educationres) ? 0 : 1;
            $huoniaoTag->assign("is_tutor", $is_tutor);
            $huoniaoTag->assign("tutorurl", getUrlPath($param));
            $huoniaoTag->assign("educationcount", $usercountall['education']);

            $usertagarr = array_count_values(explode(',', $is_zjuer . "," . $is_selfmedia . "," . $is_tutor));

            if ($usertagarr['1'] == 1) {
                $huoniaoTag->assign("on_usertag", 1);
            }

            //圈子统计
            if (in_array('circle', $installModuleArr)) {
                require(HUONIAOINC . "/config/circle.inc.php");
                //点赞
                $circlesql  = $dsql->SetQuery("SELECT sum(`zan`) zanall,(SELECT count(`id`) FROM `#@__circle_dynamic_all`WHERE `userid` = $id  AND `state` = 1 AND `zan`> $customhot ) as hotall FROM `#@__circle_dynamic_all` WHERE `userid` = $id  AND `state` = 1");
                $circleres  = $dsql->dsqlOper($circlesql, "results");
                $zanall = $circleres['0']['zanall'];
                $hotall = $circleres['0']['hotall'];
            }
            $huoniaoTag->assign("hotall", (int)$hotall);
            $huoniaoTag->assign("zanall", (int)$zanall);

            //热门
            // var_dump($circleres);die;
            // 家装
            $huoniaoTag->assign("pctempbg", is_array($userinfo) ? $userinfo['pctempbg'] : '');
            $huoniaoTag->assign("mtempbgurl", is_array($userinfo) ? getFilePath($userinfo['mtempbgurl']) : '');

            //简历
            $rsumeid = 0;
            if (in_array('job', $installModuleArr)) {
                $rsumesql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `userid` = $id");
                $rsumeres = $dsql->dsqlOper($rsumesql, "results");
                if ($rsumeres) {
                    $rsumeid = $rsumeres[0]['id'];
                }
            }
            $huoniaoTag->assign("rsumeid", (int)$rsumeid);

            //IP属地，这里根据最后一次登录IP地址获取
            $ipaddr = '';
            $sql = $dsql->SetQuery("SELECT `ipaddr` FROM `#@__member_login` WHERE `userid` = $id ORDER BY `id` DESC LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $ipaddr = $ret[0]['ipaddr'];
            }
            $huoniaoTag->assign("iphome", getIpHome($ipaddr));
        } else {
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
            die;
        }

        //签到
    } elseif ($action == "qiandao") {

        $userLogin->checkUserIsLogin();
        $uid = $userLogin->getMemberID();

        //统计登录会员总签到天数
        $totalQiandao = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `date` FROM `#@__member_qiandao` WHERE `uid` = $uid ORDER BY `date` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $totalQiandao = count($ret);
        }
        $huoniaoTag->assign("totalQiandao", $totalQiandao);

        //统计连续签到天数
        $dateArr = array();
        if ($ret) {
            foreach ($ret as $key => $value) {
                array_push($dateArr, $value['date']);
            }
        }
        $huoniaoTag->assign("totalLianqian", getContinueDay($dateArr));

        //判断是否已经签到
        $todayQiandao = 0;
        if ($ret) {
            $lastQiandao = GetMkTime(date("Y-m-d", $ret[0]['date']));
            $today = GetMkTime(date("Y-m-d", time()));

            if ($lastQiandao == $today) {
                $todayQiandao = 1;
            }
        }
        $huoniaoTag->assign("todayQiandao", $todayQiandao);

        global $cfg_qiandao_state;
        if (!$cfg_qiandao_state) {
            die($langData['siteConfig'][22][127]);  //签到功能未开启！
        }
    } elseif ($action == "verify-tuan") {
        $cardnum = htmlspecialchars(RemoveXSS($_GET['cardnum']));
        $cardnum = empty($cardnum) ? array("") : explode(',', $cardnum);
        $huoniaoTag->assign('cardnum', $cardnum);
    } elseif ($action == "verify-shop") {
        $cardnum = htmlspecialchars(RemoveXSS($_GET['cardnum']));
        $cardnum = empty($cardnum) ? array("") : explode(',', $cardnum);
        $huoniaoTag->assign('cardnum', $cardnum);
    } elseif ($action == "livedetail" || $action == "livedetail_vurl" || $action == "livedetail_lx" || $action == "livedetail_menu" || $action == "live_imgtext" || $action == "live_prolist" || $action == "live_userlist" || $action == "live_comment" || $action == "live_hongbao" || $action == "live_gift" || $action == "live_income" || $action == "live_reward" || $action == "live_charts") {
        $id = (int)$id;
        $huoniaoTag->assign('id', $id);
        global $userLogin;
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_liveFee;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html");
        }
        //$sql = $dsql->SetQuery("SELECT `title`,`click`,`litpic`,`ftime`,`typeid`,`catid`,`flow`,`way`,`pushurl` FROM `huoniao_livelist` where id =(SELECT max(`id`) i FROM `#@__livelist` where user='$userid')");//
        $sql = $dsql->SetQuery("SELECT `id`,`up`,`title`,`way`,`streamname`, `user`,`starttime`,`state`,`click`,`replay`,`livetime`,`litpic`,`password`,`startmoney`,`endmoney`,`ftime`,`typeid`,`catid`,`flow`,`way`,`pushurl`,`pullurl_pc`,`pullurl_touch`,`pulltype`, `arcrank`,`menu`,`pubdate`,`note`, `location`, `lng`, `lat`, `replaystate` FROM `#@__livelist` where id='$id' and user='$userid'");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            //播放地址
            $id = $res[0]['id'];
            $PulldetailHandels = new handlers('live', "getPullSteam");
            $param = array('id' => $id, 'type' => 'm3u8');
            $PulldetailConfig  = $PulldetailHandels->getHandle($param);
            if ($PulldetailConfig['state'] == 100) {
                $huoniaoTag->assign('pullUrl', $PulldetailConfig['info']);
            }
            if (isMobile()) {
                if ($res[0]['way'] == 1) {
                    $param = array(
                        "service"     => "live",
                        "template"    => "detail",
                        "id"          => $id
                    );
                } else {
                    $param = array(
                        "service"     => "live",
                        "template"    => "h_detail",
                        "id"          => $id
                    );
                }
            } else {
                $param = array(
                    "service"     => "live",
                    "template"    => "detail",
                    "id"          => $id
                );
            }
            $webUrl = getUrlPath($param);
            //直播时间
            $starttime = !empty($res[0]['starttime']) ? $res[0]['starttime'] : time();
            $livetime  = !empty($res[0]['livetime']) ? $res[0]['livetime'] : 0;
            //直播限制
            $member = getMemberDetail($userid);
            if (!empty($member['level'])) {
                $archives = $dsql->SetQuery("SELECT * FROM `#@__member_level` WHERE `id` = " . $member['level']);
                $results  = $dsql->dsqlOper($archives, "results");
                $fabuAmount = !empty($results[0]['privilege']) ? unserialize($results[0]['privilege']) : array('livetime' => 0);
            } else {
                require(HUONIAOINC . "/config/settlement.inc.php");
                $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array('livetime' => 0);
            }

            $state  = (int)$res[0]['state'];
            $huoniaoTag->assign('state', $state);

            //直播中，并且没有直播时长的，用当前时间减去开始时间
            if ($state == 1 && !$livetime) {
                $livetime = (time() - $starttime) * 1000;
            }

            $huoniaoTag->assign('starttime', $starttime);
            $huoniaoTag->assign('livetime', (string)$livetime);
            $huoniaoTag->assign('liveLimitTime', $fabuAmount['livetime']);

            if ($livetime) {
                $minute = (int)($livetime / 1000 / 60);
                $second = $livetime / 1000 % 60;
            }
            $huoniaoTag->assign('minute', (int)$minute);
            $huoniaoTag->assign('second', (int)$second);

            $up  = $res[0]['up'];
            // $streamname  = $res[0]['streamname'];
            $streamName = 'live' . $res[0]['id'] . '-' . $res[0]['user'];
            //直播分类
            $archives  = $dsql->SetQuery("SELECT `typename` FROM `#@__livetype` WHERE `id` = " . $res[0]['typeid']);
            $result    = $dsql->dsqlOper($archives, "results");
            $typename  = !empty($result[0]['typename']) ? $result[0]['typename'] : '';
            //直播类型
            $catidtype = empty($res[0]['catid']) ? $langData['siteConfig'][31][56] : ($res[0]['catid'] == 1 ? $langData['siteConfig'][31][57] : $langData['siteConfig'][19][889]); //公开 加密 收费
            $catid = $res[0]['catid'];
            $title     = empty($res[0]['title'])   ? $langData['siteConfig'][34][39] : $res[0]['title']; //无标题
            //流畅度
            $flowname  = empty($res[0]['flow'])  ? $langData['siteConfig'][31][61] : ($res[0]['flow'] == 1  ? $langData['siteConfig'][31][62] : $langData['siteConfig'][31][63]); //流畅 普清 高清
            $flow  = $res[0]['flow'];
            $password  = $res[0]['password'];
            $startmoney  = $res[0]['startmoney'];
            $endmoney  = $res[0]['endmoney'];
            //直播方式
            $wayname   = empty($res[0]['way'])   ? $langData['siteConfig'][31][53] : $langData['siteConfig'][31][54]; //横屏 竖屏
            $way       = $res[0]['way'];
            $click   = empty($res[0]['click'])   ? '0' : $res[0]['click'];
            $replay   = empty($res[0]['replay'])   ? '0' : $res[0]['replay'];
            $litpic    = !empty($res[0]['litpic']) ? (strpos($res[0]['litpic'], 'images') ? $cfg_secureAccess . $cfg_basehost . $res[0]['litpic'] : getFilePath($res[0]['litpic'])) : $cfg_secureAccess . $cfg_basehost . '/static/images/404.jpg';
            $ftime = !empty($res[0]['ftime']) ? date("Y.m.d H:i", $res[0]['ftime']) : date("Y.m.d H:i", time());
            $pushurl = !empty($res[0]['pushurl']) ? $res[0]['pushurl'] : '';
            $huoniaoTag->assign('typename', $typename);
            $huoniaoTag->assign('catidtype', $catidtype);
            $huoniaoTag->assign('catid', $catid);
            $huoniaoTag->assign('flowname', $flowname);
            $huoniaoTag->assign('flow', $flow);
            $huoniaoTag->assign('startmoney', $startmoney);
            $huoniaoTag->assign('endmoney', $endmoney);
            $huoniaoTag->assign('password', $password);
            $huoniaoTag->assign('click', $click);
            $huoniaoTag->assign('replay', $replay);
            $huoniaoTag->assign('wayname', $wayname);
            $huoniaoTag->assign('up', $up);
            $huoniaoTag->assign('way', $way);
            $huoniaoTag->assign('ftime', $ftime);
            $huoniaoTag->assign('ftime_', $res[0]['ftime']);
            $huoniaoTag->assign('pubdate', $res[0]['pubdate']);
            $huoniaoTag->assign('title', $title);
            $huoniaoTag->assign('pushurl', $res[0]['pushurl']);
            $huoniaoTag->assign('litpic', $litpic);
            $huoniaoTag->assign('webUrl', $webUrl);
            $huoniaoTag->assign('streamname', $streamName);
            $huoniaoTag->assign('pulltype', $res[0]['pulltype']);
            $huoniaoTag->assign('pullurl_pc', $res[0]['pullurl_pc']);
            $huoniaoTag->assign('pullurl_touch', $res[0]['pullurl_touch']);
            $huoniaoTag->assign('arcrank', $res[0]['arcrank']);
            $huoniaoTag->assign('note', $res[0]['note']);
            $huoniaoTag->assign('location', $res[0]['location']);
            $huoniaoTag->assign('lng', $res[0]['lng']);
            $huoniaoTag->assign('lat', $res[0]['lat']);
            $huoniaoTag->assign('replaystate', $res[0]['replaystate']);

            //统计礼物收入
            $giftTotal = 0;
            $sql = $dsql->SetQuery("SELECT sum(r.`amount`) total FROM `#@__live_reward` r LEFT JOIN `#@__live_payorder` p  ON r.`payid` = p.`order_id` WHERE r.`live_id` = $id AND r.`gift_id` != 0 AND p.`status` =1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $giftTotal = $ret[0]['total'];
            }
            $huoniaoTag->assign('giftTotal', sprintf('%.2f', ($giftTotal * (100 - $cfg_liveFee) / 100)));

            //统计打赏收入
            $rewardTotal = 0;
            $sql = $dsql->SetQuery("SELECT sum(r.`amount`) total FROM `#@__live_reward`  r LEFT JOIN `#@__live_payorder` p  ON r.`payid` = p.`order_id` WHERE r.`live_id` = $id AND r.`gift_id` = 0 AND p.`status` =1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $rewardTotal = $ret[0]['total'];
            }
            $huoniaoTag->assign('rewardTotal', sprintf('%.2f', ($rewardTotal * (100 - $cfg_liveFee) / 100)));


            //自定义菜单
            $menu = "";
            if ($res[0]['menu']) {
                $menu = unserialize($res[0]['menu']);
                if ($menu !== false) {
                    foreach ($menu as $key => $value) {
                        if (!$value['show']) {
                            // unset($menu[$key]);
                        }
                    }
                    $menu = array_values($menu);
                }
            }
            if (!$menu) {
                $menu = array(
                    0 => array('sys' => 0, 'name' => '介绍', 'show' => 1, 'url' => ''),
                    1 => array('sys' => 1, 'name' => '图文', 'show' => 1, 'url' => ''),
                    2 => array('sys' => 2, 'name' => '互动', 'show' => 1, 'url' => ''),
                    3 => array('sys' => 3, 'name' => '商品', 'show' => 1, 'url' => ''),
                    4 => array('sys' => 4, 'name' => '榜单', 'show' => 1, 'url' => ''),
                );
            }
            $huoniaoTag->assign('menu', $menu);

            $huoniaoTag->assign('module', 'live');


            //红包管理页面
            if ($action == "live_hongbao") {

                //汇总
                $totalAmount = $totalCount = 0;
                $sql = $dsql->SetQuery("SELECT count(`id`) totalCount, sum(`amount`) totalAmount FROM `#@__live_hongbao` WHERE `live_id` = $id AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $totalAmount = $ret[0]['totalAmount'];
                    $totalCount = $ret[0]['totalCount'];
                }
                $huoniaoTag->assign('totalAmount', sprintf('%.2f', $totalAmount));
                $huoniaoTag->assign('totalCount', (int)$totalCount);

                //我领取的
                $myAmount = $myCount = 0;
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_hongbao` WHERE `live_id` = $id AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $key => $value) {
                        $hid = $value['id'];
                        $sql = $dsql->SetQuery("SELECT count(`id`) totalCount, sum(`recv_money`) totalAmount FROM `#@__live_hrecv_list` WHERE `hid` = $hid AND `recv_user` = $userid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $myAmount += $ret[0]['totalAmount'];
                            $myCount += $ret[0]['totalCount'];
                        }
                    }
                }
                $huoniaoTag->assign('myAmount', sprintf('%.2f', $myAmount));
                $huoniaoTag->assign('myCount', (int)$myCount);
            }


            //礼物收入
            // if($action == "live_gift"){

            //汇总
            $totalAmount = 0;
            $sql = $dsql->SetQuery("SELECT p.`amount`, p.`settle` FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = h.`live_id` WHERE h.`gift_id` > 0 AND h.`live_id` = $id AND p.`status` = 1  AND h.`payid` = p.`order_id`");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                foreach ($ret as $key => $value) {
                    if ($value['settle'] > 0) {
                        $totalAmount += sprintf('%.2f', $value['settle']);
                    } else {
                        $liveFee = 100 - $cfg_liveFee;
                        $totalAmount += sprintf('%.2f', $value['amount'] * $liveFee / 100);
                    }
                }
            }
            $huoniaoTag->assign('giftTotalAmount', sprintf('%.2f', $totalAmount));
            // }


            //打赏收入
            // if($action == "live_reward"){

            //汇总
            $totalAmount = 0;
            $sql = $dsql->SetQuery("SELECT p.`amount`, p.`settle` FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = h.`live_id` WHERE h.`gift_id` = 0 AND h.`live_id` = $id AND p.`status` = 1 AND h.`payid` = p.`order_id`");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                foreach ($ret as $key => $value) {
                    if ($value['settle'] > 0) {
                        $totalAmount += sprintf('%.2f', $value['settle']);
                    } else {
                        $liveFee = 100 - $cfg_liveFee;
                        $totalAmount += sprintf('%.2f', $value['amount'] * $liveFee / 100);
                    }
                }
            }
            $huoniaoTag->assign('rewardTotalAmount', sprintf('%.2f', $totalAmount));
            // }


            //付费收益
            // if($action == "live_income"){

            //汇总
            $totalAmount = 0;
            $totalCount = 0;
            $sql = $dsql->SetQuery("SELECT sum(p.`amount`) totalAmount, count(p.`id`) totalCount FROM `#@__live_payorder` p WHERE p.`status` = 1 AND p.`live_id` = $id AND p.`paysee` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $totalAmount = $ret[0]['totalAmount'];
                $totalCount = $ret[0]['totalCount'];
            }
            $huoniaoTag->assign('incomeTotalAmount', sprintf('%.2f', $totalAmount));
            $huoniaoTag->assign('incomeTotalCount', (int)$totalCount);
            // }


        } else {

            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "manage",
                "module" => "live"
            );
            header("location:" . getUrlPath($param));
        }


        //app配置
        $appinfo = array();
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $appRet = $dsql->dsqlOper($sql, "results");
        if ($appRet && is_array($appRet)) {
            $data = $appRet[0];
            $appinfo = array(
                'name' => $data['appname'],
                'logo' => getFilePath($data['logo']),
                'subtitle' => $data['subtitle'] ? $data['subtitle'] : '使用APP操作更方便',
                'wx_appid' => $data['wx_appid'],
                'URLScheme_Android' => $data['URLScheme_Android'],
                'URLScheme_iOS' => $data['URLScheme_iOS'],
            );
        }
        $huoniaoTag->assign('appinfo', json_encode($appinfo));


        // 提现
    } elseif ($action == "put_forward") {

        if (empty($type)) {
            $type = "alipay";
        }

        $type = $type != "alipay" && $type != "wxpay" ? "alipay" : $type;

        $param = array(
            "service" => "member",
            "type" => "user",
        );

        if (empty($module)) {
            header("location:" . getUrlPath($param));
            die;
        }

        $min = 0;
        if ($type == "alipay") {
            $min = 0.1;
            $title = "提现到支付宝";
        } elseif ($type == "wxpay") {
            $min = 0.3;
            $title = "提现到微信";
        }

        $detail = array();

        if ($module == "dating") {
            $param = array("utype" => $utype);
            $moduleHandels = new handlers('dating', "putForward");
            $moduleConfig  = $moduleHandels->getHandle($param);
            if (is_array($moduleConfig) && $moduleConfig['state'] == 100) {
                $detail = $moduleConfig['info'];
            } else {
                echo '<script>alert("' . $moduleConfig['info'] . '");window.history.go(-1);</script>';
                die;
            }

            if ($detail['minPutMoney'] < $min) {
                $detail['minPutMoney'] = $min;
            }
        }

        $detail['module'] = str_replace(PHP_EOL, '', $module);
        $detail['type'] = $type;
        $detail['utype'] = (int)$utype;
        $detail['title'] = $title;

        $huoniaoTag->assign("detail", $detail);

        $url = $cfg_secureAccess . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
        $url = $url ? urlencode($url) : "";
        $huoniaoTag->assign("url", $url);


        // 入驻商家支付页面
    } elseif ($action == "joinPay") {
        $uid = $userLogin->getMemberID();
        if ($uid == -1 || empty($ordernum)) {
            header("location:" . $cfg_secureAccess . $cfg_basehost);
            die;
        }
        // 入驻商家
        $channelName = "入驻商家";
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`totalprice`, o.`state` FROM `#@__business_order` o LEFT JOIN `#@__business_list` b ON b.`id` = o.`bid` WHERE b.`uid` = $uid AND o.`ordernum` = '$ordernum'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $state = $ret[0]['state'];
            if ($state == 1) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "joinPayreturn",
                    "param" => "ordernum=" . $ordernum
                );
                header("location:" . getUrlPath($param));
                die;
            } else {
                $totalAmount = $ret[0]['totalprice'];
                $ordernum = $ordernum;
                $huoniaoTag->assign('totalAmount', $totalAmount);
                $huoniaoTag->assign('ordernum', $ordernum);
            }
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost);
            die;
        }
        $huoniaoTag->assign("channelName", $channelName);
        // 支付结果页面
    } elseif ($action == "joinPayreturn") {
        $uid = $userLogin->getMemberID();
        if ($uid == -1 || empty($ordernum)) {
            header("location:" . $cfg_secureAccess . $cfg_basehost);
            die;
        }
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`totalprice`, o.`state`, o.`ordertype` FROM `#@__business_order` o LEFT JOIN `#@__business_list` b ON b.`id` = o.`bid` WHERE o.`ordernum` = '$ordernum' AND b.`uid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $state = $ret[0]['state'];
            $ordertype = $ret[0]['ordertype'];
            $param = array(
                "service" => "member"
            );
            if ($ordertype == "join") {
                $param['type'] = "user";
            }
            $url = getUrlPath($param);

            $huoniaoTag->assign('state', $state);
            $huoniaoTag->assign('url', $url);
        }

        // 选择区域
    } elseif ($action == "choose_address") {
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            header("location:" . $cfg_secureAccess . $cfg_basehost);
            die;
        }
        $showMap = 1;
        if ($ser == "business") {
            $sql = $dsql->SetQuery("SELECT `lng`, `lat`, `addrid`, `cityid`, `address`, `landmark` FROM `#@__business_list` WHERE `uid` = $uid ORDER BY `id` DESC");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $lng = $ret[0]['lng'];
                $lat = $ret[0]['lat'];
                $addrid = $ret[0]['addrid'];
                $cityid = $ret[0]['cityid'];
                $address = $ret[0]['address'];
                $landmark = $ret[0]['landmark'];
            } else {
                $param = array(
                    "service" => "member",
                    "type" => "user"
                );
                header("location:" . getUrlPath($param));
                die;
            }
        } elseif ($ser == "house") {
            $showMap = 0;
            $sql = $dsql->SetQuery("SELECT `addr`, `cityid`, `address` FROM `#@__house_zjcom` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $addrid = $ret[0]['addr'];
                $cityid = $ret[0]['cityid'];
                $address = $ret[0]['address'];
            } else {
                $param = array(
                    "service" => "member",
                );
                header("location:" . getUrlPath($param));
                die;
            }
        }
        $huoniaoTag->assign('showMap', $showMap);
        $huoniaoTag->assign('ser', $ser);
        $huoniaoTag->assign('act', $act);
        $huoniaoTag->assign('lng', $lng);
        $huoniaoTag->assign('lat', $lat);
        $huoniaoTag->assign('addrid', $addrid);
        $huoniaoTag->assign('cityid', $cityid);
        $huoniaoTag->assign('address', $address);
        $huoniaoTag->assign('landmark', $landmark);

        // 商家模块管理
    } elseif ($action == "appmanage") {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `type`, `bind_module` FROM `#@__business_list` WHERE `uid` = " . $userid);
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $type = $res[0]['type'];
            $bind_module = $res[0]['bind_module'] ? explode(',', $res[0]['bind_module']) : array();
        } else {
            $param = array(
                "service" => "member",
                "type" => "user",
            );
            header("location:" . getUrlPath($param));
            die;
        }

        $showModule = checkShowModule($bind_module, 'manage', '', 'getUrl');

        $huoniaoTag->assign('showModule', $showModule);

        // 自助建站自定义导航
    } elseif ($action == "website-custom_nav") {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $custom_navArr = array();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $website = $ret[0]['id'];
            $huoniaoTag->assign('has_website', 1);
            $sql = $dsql->SetQuery("SELECT `id`, `alias`, `icon`, `title`, `jump_url` FROM `#@__website_touch` WHERE `sys` = 0 AND `website` = $website");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $key => $value) {
                    $custom_navArr[$key] = array(
                        'id' => $value['id'],
                        'icon' => $value['icon'],
                        'iconSource' => $value['icon'] ? getFilePath($value['icon']) : "",
                        'title' => $value['title'],
                        'url' => $value['jump_url'],
                    );
                }
            }
            $huoniaoTag->assign('custom_navArr', $custom_navArr);
        }

        // 入驻经纪人
    } elseif ($action == "enter_house") {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $obj = new house();
        $config = $obj->config();

        $hotline = $config['hotline'];
        $logoUrl = $config['logoUrl'];
        $channelDomain = $config['channelDomain'];
        $channelName = $config['channelName'];

        $huoniaoTag->assign('hotline', $hotline);
        $huoniaoTag->assign('logoUrl', $logoUrl);
        $huoniaoTag->assign('channelName', $channelName);
        $huoniaoTag->assign('channelDomain', $channelDomain);

        // 验证入驻情况
        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__house_zjuser` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign('enter_zjuser', $res ? 1 : 0);

        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__house_zjcom` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign('enter_zjcom', $res ? 1 : 0);

        $huoniaoTag->assign('type', $type);

        //房产预约委托
    } elseif (
        $template == "house_yuyue_list"
        || $template == "house_yuyue"
        || $template == "house_entrust"
        || $template == "house_enturst_list"
        || $template == "car_entrust"
    ) {
        $userLogin->checkUserIsLogin();
        // 经纪人套餐列表
    } elseif ($template == "house_meallist") {

        $obj = new house();
        $config = $obj->config();

        $zjuserPriceCost = $config['zjuserPriceCost'];

        $huoniaoTag->assign('zjuserPriceCost', $zjuserPriceCost);
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('item', $item);
        $huoniaoTag->assign('upgrade', (int)$upgrade);

        //楼盘报备
    } elseif ($template == 'house_loupan' || $template == 'house_baobei' || $template == 'house_loupan_printVisitConfirm') {
        $userLogin->checkUserIsLogin();

        //打印带访确认单
        if ($template == 'house_loupan_printVisitConfirm') {
            $bdID = (int)$id;

            //根据报备ID查询报备信息
            $sql = $dsql->SetQuery("SELECT f.`jzrid` uid, f.`username` name,f.`usertel` tel,f.`note`,f.`pubdate`, p.`title` loupan, p.`visitConfirmPrintTemplate` FROM `#@__house_fenxiaobb` f LEFT JOIN `#@__house_zjuser` z ON f.`jzrid` = z.`id` LEFT JOIN `#@__member` m ON z.`userid` = m.`id` LEFT JOIN `#@__house_loupan` p ON p.`id` = f.`lid` WHERE f.`id` = " . $bdID);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $data = $ret[0];
                $name = $data['name'];  //客户姓名
                $tel = $data['tel'];  //客户电话
                $note = $data['note'];  //备注
                $time = date('Y-m-d H:i:s', $data['pubdate']);  //报备时间
                $loupan = $data['loupan'];  //报备楼盘
                $uid = $data['uid'];  //报备人
                $visitConfirmPrintTemplate = $data['visitConfirmPrintTemplate'];  //打印模板

                global $cfg_shortname;
                $channel = $cfg_shortname;  //报备渠道

                $uinfo = $userLogin->getMemberInfo($v['uid']);
                $seller = $uinfo['nickname'];  //渠道销售

                $receiptArr = $visitConfirmPrintTemplate ? unserialize($visitConfirmPrintTemplate) : array();  //打印模板

                if (!$receiptArr) {
                    echo '<script>alert("该楼盘未配置带访确认单打印模板，请联系客服处理！");location.href="house_baobei.html"</script>';
                    die;
                }

                $huoniaoTag->assign('name', $name);
                $huoniaoTag->assign('tel', $tel);
                $huoniaoTag->assign('note', $note);
                $huoniaoTag->assign('time', $time);
                $huoniaoTag->assign('loupan', $loupan);
                $huoniaoTag->assign('channel', $channel);
                $huoniaoTag->assign('seller', $seller);
                $huoniaoTag->assign('receipt', $receiptArr);

                $bgimg = $receiptArr['image'];
                $width = $height = 0;
                if ($bgimg) {
                    $RenrenCrypt = new RenrenCrypt();
                    $imgid = $RenrenCrypt->php_decrypt(base64_decode($bgimg));

                    if (is_numeric($id)) {
                        $attachment = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = " . $imgid);
                        $results = $dsql->dsqlOper($attachment, "results");
                        if ($results) {
                            $width = $results[0]['width'];
                            $height = $results[0]['height'];
                        }
                    }
                }
                $huoniaoTag->assign('width', $width);
                $huoniaoTag->assign('height', $height);
            } else {
                echo '<script>alert("信息获取失败！");location.href="house_baobei.html"</script>';
                die;
            }
        }

        // 支付
    } elseif ($action == "pay") {
        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $data = $_GET;
        unset($data['paytype']);
        unset($data['useBalance']);
        unset($data['balance']);

        extract($data);

        $param = array("service" => "member", "type" => "user");
        if (empty($ordertype) || empty($ordernum)) {
            header("location:" . getUrlPath($param));
            die;
        }
        $allowUseMoney = true;
        if ($ordertype == "deposit" || $ordertype == "recharge") {
            $allowUseMoney = false;
        }

        $paramsHtml = "";
        global $service;
        // 重置service
        if ($ordertype == "refreshTop") {
            $service = "siteConfig";
        }
        unset($data['ordernum']);
        foreach ($data as $key => $value) {
            $key = htmlspecialchars(RemoveXSS($key));
            $value = htmlspecialchars(RemoveXSS($value));
            $paramsHtml .= "<input type=\"hidden\" name=\"{$key}\" value=\"{$value}\" />";
        }

        if ($ordertype == "videoPay") {
            if (!isMobile()) {
                $param = array("service" => "video");
                header("location:" . getUrlPath($param));
                die;
            }
            $service = "video";
            $amountsql = $dsql->SetQuery("SELECT l.`body` FROM `#@__pay_log`l WHERE l.`ordernum` = '" . $ordernum . "' AND `ordertype` = 'video'");
            $amountres = $dsql->dsqlOper($amountsql, "results");
            if (empty($amountres) && is_array($amountres)) {
                $param = array("service" => "video", "type" => "user");
                header("location:" . getUrlPath($param));
                die;
            }
            $body = unserialize($amountres[0]['body']);

            $param = array(
                "service"     => "video",
                "template"    => "detail",
                "id"          => $body['aid']
            );
            $url = getUrlPath($param);
            $paramsHtml .= "<input type=\"hidden\" name=\"tourl\" value=\"{$url}\" />";
            $paramsHtml .= "<input type=\"hidden\" name=\"aid\" value=\"{$body['aid']}\" />";
        }

        // echo "<pre>";$tourl
        // var_dump($memberlevelList);die;
        $paramsHtml .= "<input type=\"hidden\" name=\"final\" value=\"1\" />";  // 最终支付
        $huoniaoTag->assign('paramsHtml', $paramsHtml);
        $huoniaoTag->assign('ordertype', $ordertype);
        $huoniaoTag->assign('ordernum', $ordernum);
        $huoniaoTag->assign('level', $level);
        $huoniaoTag->assign('day', $day);
        $huoniaoTag->assign('daytype', $daytype);
        $huoniaoTag->assign('totalAmount', $amount);
        $huoniaoTag->assign('service', $service);
        $huoniaoTag->assign('title', $title);
        $huoniaoTag->assign('orderurl', 'javascript:;');
        $huoniaoTag->assign('allowUseMoney', $allowUseMoney);
    } elseif ($action == "housem") { //房源管理
        $userLogin->checkUserIsLogin();

        $type = $type ? $type : 'cf';
        $huoniaoTag->assign('type', $type);

        //配置自媒体
    } elseif (stripos($action, "config-selfmedia") !== false) {

        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();
        $is_join = 0;

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $is_join = 1;

            $contorllerFile = dirname(__FILE__) . '/article.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;
                require_once($contorllerFile);
                $param = array(
                    "action" => "mddetail",
                    "id"     => $ret[0]['id'],
                    "u"      => 1
                );
                article($param);
            }
            // 判断是否为子管理员
        } else {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__article_selfmedia_manager` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $is_join = 2;
            }
        }
        $huoniaoTag->assign("is_join", $is_join);

        $article = new article();
        $config = $article->config();

        $huoniaoTag->assign('selfmediaGrantImg', $config['selfmediaGrantImg']);
        $huoniaoTag->assign('selfmediaGrantTpl', $config['selfmediaGrantTpl']);
        $huoniaoTag->assign('selfmediaAgreement', $config['selfmediaAgreement']);

        //入驻汽车经销商 预约管理 顾问管理 顾问入驻电脑端
    } elseif ($action == "enter_car" || $action == "car_enter" || $action == "car" || $action == "carappoint" || $action == "adviser_car_add") {
        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $obj = new car();
        $config = $obj->config();

        $hotline = $config['hotline'];
        $logoUrl = $config['logoUrl'];
        $channelDomain = $config['channelDomain'];
        $channelName = $config['channelName'];

        $huoniaoTag->assign('hotline', $hotline);
        $huoniaoTag->assign('logoUrl', $logoUrl);
        $huoniaoTag->assign('channelName', $channelName);
        $huoniaoTag->assign('channelDomain', $channelDomain);
        $huoniaoTag->assign('id', $id);

        // 验证入驻情况
        $sql        = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__car_adviser` WHERE `userid` = $userid");
        $adviserres = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign('enter_zjuser', $adviserres ? 1 : 0);

        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__car_store` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign('enter_zjcom', $res[0]['id'] ? 1 : 0);
        if ($res) {
            $huoniaoTag->assign('store', $res[0]['id']);
        }


        if ($action == "car_enter") { //立即申请汽车顾问
            if (!empty($adviserres[0]['id'])) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "car-config"
                );
                header("location:" . getUrlPath($param));
                die;
            }
        } elseif ($action == "adviser_car_add") {
            $comid = $res[0]['id'];
            if ($do == "edit") {
                $detailHandels = new handlers("car", "adviserList");
                $detailConfig  = $detailHandels->getHandle(array("type" => 'getnormal', "u" => '1', "userid" => $id, "comid" => $comid));
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig  = $detailConfig['info'];
                    if (is_array($detailConfig)) {
                        //输出详细信息
                        foreach ($detailConfig['list'][0] as $key => $value) {
                            $huoniaoTag->assign('detail_' . $key, $value);
                        }
                    }
                } else {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                }
            }
        } elseif ($action == "enter_car") {
            $userinfo = $userLogin->getMemberInfo();
            if ($userinfo['userType'] == 1) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "enter"
                );
                $url = getUrlPath($param);
                header("location:" . $url);
            } else {
                if (!empty($res[0]['id'])) {
                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "config-car"
                    );
                    header("location:" . getUrlPath($param));
                    die;
                }
            }
        }

        $huoniaoTag->assign('type', $type);
    } elseif (stripos($action, "config-car") !== false) { //移动端商家配置

        $userLogin->checkUserIsLogin();
        $contorllerFile = dirname(__FILE__) . '/car.controller.php';

        //获取图片配置参数
        require(HUONIAOINC . "/config/car.inc.php");
        $huoniaoTag->assign('atlasMax', $customAtlasMax);
        $huoniaoTag->assign('storeatlasMax', $custom_store_atlasMax);

        // 获取商家模块公共配置
        $uid = $userLogin->getMemberID();

        //查询是否填写过入驻申请
        $sql = $dsql->SetQuery("SELECT `tag` FROM `#@__car_store` WHERE `userid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");

        $carHandlers = new handlers("car", "config");
        $carConfig   = $carHandlers->getHandle();
        $carConfig   = $carConfig['info'];

        $carTag_all = $carConfig['carTag'];
        $carTag_all_ = array();

        if (!empty($ret[0]['tag'])) {
            $carTag_ = explode('|', $ret[0]['tag']);
        } else {
            $carTag_ = array();
        }
        foreach ($carTag_all as $v) {
            $carTag_all_[] = array(
                'name' => $v,
                'py'   => GetPinyin($v),
                'icon' => 'b_sertag_' . GetPinyin($v) . '.png',
                'active' => in_array($v, $carTag_) ? 1 : 0
            );
        }

        $huoniaoTag->assign('carTag_state', $carTag_all_);

        if (file_exists($contorllerFile)) {
            //声明以下均为接口类
            $handler = true;
            require_once($contorllerFile);

            $param = array(
                "action" => "storeDetail",
            );

            car($param);

            $zjcom = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $zjcom = 1;
            }
            $huoniaoTag->assign("zjcom", $zjcom);
        }
    } elseif ($action == 'car-config') {
        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();
        $jjr = 0;

        $sql = $dsql->SetQuery("SELECT * FROM `#@__car_adviser` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $jjr = 1;

            $contorllerFile = dirname(__FILE__) . '/car.controller.php';
            if (file_exists($contorllerFile)) {
                //声明以下均为接口类
                $handler = true;
                require_once($contorllerFile);

                $param = array(
                    "action" => "broker-detail",
                    "id"     => $ret[0]['id'],
                    "u"      => 1
                );
                car($param);
            }
        }
        $huoniaoTag->assign("jjr", $jjr);

        $zjcom = 0;
        $sql = $dsql->SetQuery("SELECT * FROM `#@__car_store` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $zjcom = 1;
        }
        $huoniaoTag->assign("zjcom", $zjcom);
    } elseif ($action == 'homemaking-nanny' || $action == 'homemaking-personal') { //保姆/月嫂管理 服务人员
        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();

        $huoniaoTag->assign("module", 'homemaking');
        $huoniaoTag->assign("state", $state);
        $huoniaoTag->assign("type", $type);
        $huoniaoTag->assign("typeid", $typeid ? $typeid : 0);
    } elseif ($action == "homemaking-cancelservice" || $action == "homemaking-cancel" || $action == "homemaking-service" || $action == "homemaking-repair" || $action == "homemaking-dispatch") { //家政申请退款 确认服务费 售后维保 派单

        if ($action == "homemaking-cancel" || $action == "homemaking-cancelservice") {

            $detailHandels = new handlers("homemaking", "config");
            $configArr  = $detailHandels->getHandle();
            $huoniaoTag->assign('refundReason', json_encode($configArr['info']['refundReason']));
            $huoniaoTag->assign('afterSalesType', json_encode($configArr['info']['afterSalesType']));
        }

        $huoniaoTag->assign('type', $type ? $type : 0);

        $detailHandels = new handlers("homemaking", "orderDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig  = $detailConfig['info']; //print_R($detailConfig);exit;
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                require(HUONIAOINC . "/config/homemaking.inc.php");

                if ($customUpload == 1) {
                    $huoniaoTag->assign('thumbSize', $custom_thumbSize);
                    $huoniaoTag->assign('thumbType', str_replace("|", ",", $custom_thumbType));
                    $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                    $huoniaoTag->assign('atlasType', str_replace("|", ",", $custom_atlasType));
                } else {
                    $huoniaoTag->assign('thumbType', str_replace("|", ",", $cfg_thumbType));
                    $huoniaoTag->assign('atlasType', str_replace("|", ",", $cfg_atlasType));
                }
                $huoniaoTag->assign('atlasMax', (int)$customAtlasMax);
            }

            $huoniaoTag->assign('rates', (int)$rates);
            $huoniaoTag->assign('type', $type);
            $huoniaoTag->assign('id', (int)$id);
            $huoniaoTag->assign('module', 'homemaking');
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
    } elseif ($action == "talkhistory") {
        if ($id && $proid && $module == 'shop') {
            $Sql = $dsql->SetQuery("SELECT t.`ret_negotiate`,o.`userid`,o.`store` FROM `#@__shop_order_product`t LEFT JOIN `#@__shop_order` o ON t.`orderid` = o.`id`  WHERE  t.`orderid` = '$id' AND t.`proid` = '$proid'");
            $Res = $dsql->dsqlOper($Sql, "results");
            if ($Res) {

                $userid = $Res[0]['userid'];
                $store  = $Res[0]['store'];

                /*用户*/
                $userSql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE 1=1 AND `id` = '$userid'");
                $userRes = $dsql->dsqlOper($userSql, "results");
                $photo   = getFilePath($userRes[0]['photo']);
                $huoniaoTag->assign('photo', $photo);

                /*商家*/
                $businessSql = $dsql->SetQuery("SELECT `logo` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$store'");
                $businessRes = $dsql->dsqlOper($businessSql, "results");
                $logo        = getFilePath($businessRes[0]['logo']);
                $huoniaoTag->assign('logo', $logo);
            } else {

                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
            $huoniaoTag->assign(
                'ret_negotiate',
                $Res[0]['ret_negotiate'] != '' ? json_encode(unserialize($Res[0]['ret_negotiate'])) : ''
            );
        } else {
            if ($id && $module == 'shop') {
                //            $ret_negotiate['numeber'] = 1;
                //            $ret_negotiate[0]['typename']      = '买家创建了退款申请';
                //            $ret_negotiate[0]['refundtype']    = '仅退款';
                //            $ret_negotiate[0]['refundinfo']    = '尺码拍错/不喜欢/效果差';
                //            $now                               = GetMkTime(time());
                //            $ret_negotiate[0]['datetime']      = $now;
                //            $ret_negotiate[0]['tuikuanmoney']  = $now;
                //            $ret_negotiate[0]['type']          = 0;
                //
                //            $ret_negotiate[1]['typename']      = '商家拒绝退款';
                //            $ret_negotiate[1]['refundinfo']    = '不想给你退'; +
                //            $ret_negotiate[1]['datetime']      = $now + 1800;
                //            $ret_negotiate[1]['type']          = 1;

                $Sql = $dsql->SetQuery("SELECT `ret_negotiate`,`userid`,`store` FROM `#@__shop_order` WHERE 1=1 AND `id` = '$id'");
                $Res = $dsql->dsqlOper($Sql, "results");
                if ($Res) {

                    $userid = $Res[0]['userid'];
                    $store = $Res[0]['store'];

                    /*用户*/
                    $userSql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE 1=1 AND `id` = '$userid'");
                    $userRes = $dsql->dsqlOper($userSql, "results");
                    $photo = getFilePath($userRes[0]['photo']);
                    $huoniaoTag->assign('photo', $photo);

                    /*商家*/
                    $businessSql = $dsql->SetQuery("SELECT `logo` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$store'");
                    $businessRes = $dsql->dsqlOper($businessSql, "results");
                    $logo = getFilePath($businessRes[0]['logo']);
                    $huoniaoTag->assign('logo', $logo);
                } else {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                }
                $huoniaoTag->assign(
                    'ret_negotiate',
                    $Res[0]['ret_negotiate'] != '' ? json_encode(unserialize($Res[0]['ret_negotiate'])) : ''
                );
            } elseif ($module == 'shop') {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
        }
        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('proid', (int)$proid);
    } elseif ($action == "refuserefund") {
        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('proid', $proid);
    } elseif ($action == "homemaking-courier") { //派单员订单

        $detailHandels = new handlers("homemaking", "personalDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig  = $detailConfig['info']; //print_R($detailConfig);exit;
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }

            $huoniaoTag->assign('rates', (int)$rates);
            $huoniaoTag->assign('type', $type);
            $huoniaoTag->assign('id', (int)$id);
            $huoniaoTag->assign('module', 'homemaking');
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
        $huoniaoTag->assign('id', (int)$id);
        $huoniaoTag->assign('module', 'homemaking');
    } elseif ($action == "homemaking-courierorder") {
        $userid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_personal` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign('personalId', $ret[0]['id'] ? $ret[0]['id'] : 0);

        //统计
    } elseif ($action == "homemaking-count") {
        //统计
        if ($id) {
            // $uidarchives = $dsql->SetQuery("SELECT s.`userid` FROM `#@__homemaking_personal` p LEFT JOIN `#@__homemaking_store` s ON p.`company` = s.`id` WHERE p.`userid` = $userid");
            // $uresults = $dsql->dsqlOper($uidarchives,"results");
            // $where = "`dispatchid` = $id AND `orderstate` = '11'";
            // if ($datetime) {
            //  $time = explode(',', $datetime);
            //  $where .= "AND statementtime BETWEEN $time[0] AND $time[1]";
            // }
            // $group = "group by o.`proid` ";
            // $counsql = $dsql->SetQuery("SELECT o.`id` , o.`online` , o.`proid` , sum(o.`procount`) as num, sum(o.`orderprice`) as yuyue , sum(o.`price`) as follow  , l.`title` FROM `#@__homemaking_order` o  LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` WHERE".$where.$group);
            // $coutresult = $dsql->dsqlOper($counsql,"results");
            $huoniaoTag->assign('id', (int)$id);
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }

        // 分销
    } elseif (strstr($action, 'fenxiao')) {
        global $cfg_fenxiaoState;
        if ($cfg_fenxiaoState != 1) {
            header("location:/404.html");
            die;
        }
        $uid = $userLogin->getMemberID();
        if ($uid <= 0) {
            $param = array(
                "service" => "siteConfig",
                "template" => "login",
            );
            header("location:" . getUrlPath($param));
            die;
        }

        $sql = $dsql->SetQuery("SELECT `id`, `state`, `level` FROM `#@__member_fenxiao_user` WHERE `uid` = $uid");
        $check = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign('tj_state', $check ? $check[0]['state'] : -1);

        //分销商等级
        global $cfg_fenxiaoType;
        global $cfg_fenxiaoLevel;
        $fenxiaoLevel = $cfg_fenxiaoLevel ? unserialize($cfg_fenxiaoLevel) : array();
        if ($cfg_fenxiaoType && $fenxiaoLevel && $check) {
            $huoniaoTag->assign('fxLevelName', $fenxiaoLevel[$check[0]['level']]['name']);
        }

        if ($action == 'fenxiao_join') {
            if ($check && $check[0]['state'] == 1) {
            }
        } else {
            if (!$check || $check[0]['state'] != 1) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "fenxiao_join",
                );
                header("location:" . getUrlPath($param));
                die;
            }

            // 我的分销首页
            if ($action == 'fenxiao' || $action == 'fenxiao_charts') {
                $from_username = "";
                $from_userid = 0;
                $sql = $dsql->SetQuery("SELECT m2.`id`, m2.`username` FROM `#@__member` m1 LEFT JOIN `#@__member` m2 ON m2.`id` = m1.`from_uid` WHERE m1.`id` = $uid");
                $res = $dsql->dsqlOper($sql, "results");
                if ($res) {
                    $from_username = $res[0]['username'];
                    $from_userid = $res[0]['id'];
                }
                $huoniaoTag->assign('from_username', $from_username);
                $huoniaoTag->assign('from_userid', $from_userid);

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__member_fenxiao` WHERE `uid` = $uid");
                $res = $dsql->dsqlOper($sql, "results");
                $huoniaoTag->assign('totalAmount', $res[0]['total'] ? $res[0]['total'] : 0);
            } elseif ($action == 'fenxiao_user') {
            } elseif ($action == 'fenxiao_commission') {
            } elseif ($action == 'fenxiao_commission_detail') {
                $id = (int)$id;
                $ser = new member(array("id" => $id));
                $order  = $ser->fenxiaoDetail();
                if (empty($order)) {
                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "fenxiao_commission",
                    );
                    header("location:" . getUrlPath($param));
                    die;
                }
                $huoniaoTag->assign('order', $order);
            }
        }
    } elseif ($action == "marry") { //婚嫁
        $huoniaoTag->assign('typeid', $typeid ? (int)$typeid : 0);

        $huoniaoTag->assign('typeid', $typeid ? (int)$typeid : 0);
        $huoniaoTag->assign('module', 'marry');
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('tagSel', $tagSel);
        $sql = $dsql->SetQuery("SELECT `id`, `title`, `bind_module` FROM `#@__marry_store` WHERE `state` = 1 AND `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!empty($res[0]['id']) && !empty($res[0]['bind_module'])) {
            $isMarryStore = true;
            $bind_moduleArr = explode(',', $res[0]['bind_module']);
            $huoniaoTag->assign('bind_moduleArr', $bind_moduleArr);
        } else {
            $isMarryStore = false;
        }
        $huoniaoTag->assign('isMarryStore', $isMarryStore);
    } elseif ($action == "marry-planmeal") { //套餐
        $huoniaoTag->assign('typeid', $typeid ? (int)$typeid : 0);
        $huoniaoTag->assign('module', 'marry');
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('tagSel', $tagSel);
    } elseif ($action == "fabu-tarvel-strategy") {
        $huoniaoTag->assign('type', $module);
        $huoniaoTag->assign('id', $id);
    } elseif ($action == "travel") { //旅游
        $userLogin->checkUserIsLogin();

        $sql = $dsql->SetQuery("SELECT `id`, `title`, `bind_module` FROM `#@__travel_store` WHERE `state` = 1 AND `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!empty($res[0]['id']) && !empty($res[0]['bind_module'])) {
            $isTravelStore = true;
            $bind_moduleArr = explode(',', $res[0]['bind_module']);
            $huoniaoTag->assign('bind_moduleArr', $bind_moduleArr);
        } else {
            $isTravelStore = false;
        }
        if ($userinfo['userType'] == 1) {
            $isTravelStore = true;
        }
        $huoniaoTag->assign('isTravelStore', $isTravelStore);
        $huoniaoTag->assign('type', $module);
    } elseif ($action == "travel-strategy" || $action == "travel-fabu-travel-hotel" || $action == "travel-ticket" || $action == "travel-video" || $action == "travel-rentcar" || $action == "travel-visa" || $action == "travel-agency") { //TODO: 旅游酒店
        $userLogin->checkUserIsLogin();
        $huoniaoTag->assign('module', 'travel');
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('type', $type);
        // 发布图文直播·管理评论
    } elseif ($action == "live_imgtext" || $action == "live_comment" || $action == "fabu_live_imgtext") {
        $userLogin->checkUserIsLogin();
        $userid = $userLogin->getMemberID();
        $id = (int)$id;
        if ($id) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` where id='$id' and user='$userid'");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $huoniaoTag->assign('id', $id);
                $huoniaoTag->assign('atlasMax', 9);
                return;
            }
        }
        header("location:/404.html");
        die;
    } elseif ($action == "travel-cancelhotel" || $action == "travel-cancelticket" || $action == "travel-canceldetail") { //旅游申请退款
        $userLogin->checkUserIsLogin();

        $detailHandels = new handlers("travel", "orderDetail");
        $detailConfig  = $detailHandels->getHandle($id);


        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig  = $detailConfig['info']; //print_R($detailConfig);exit;
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    if ($key == 'retDate') {
                        $threeDay = date("Y-m-d", strtotime($value . "+1 day"));
                        $huoniaoTag->assign('threeDay', $threeDay);
                    }
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }

            $huoniaoTag->assign('id', (int)$id);
            $huoniaoTag->assign('module', 'travel');
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
    } elseif ($action == "verify-travel") {
        $cardnum = htmlspecialchars(RemoveXSS($_GET['cardnum']));
        $cardnum = empty($cardnum) ? array("") : explode(',', $cardnum);
        $huoniaoTag->assign('cardnum', $cardnum);
    } elseif ($action == "education") {

        $userLogin->checkUserIsLogin();

        $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `state` = 1 AND `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!empty($res[0]['id'])) {
            $isEducationStore = true;
        } else {
            $isEducationStore = false;
        }
        if ($userinfo['userType'] == 2) {
            $userid = $res[0]['id'];
        }
        if ($userid) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `state` = 1 AND `userid` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if (!empty($res[0]['id'])) {
                $isEducationTutor = true;
            } else {
                $isEducationTutor = false;
            }
        }
        if (!$isEducationStore && !$isEducationTutor) {
            // die("<script>alert('请先申请家教或者入驻教育商家') </script>");
        }
        $huoniaoTag->assign('isEducationStore', $isEducationStore);
        $huoniaoTag->assign('isEducationTutor', $isEducationTutor);
    } elseif ($action == "pension-award" || $action == "pension-invitation") {
        $userLogin->checkUserIsLogin();
        $typeArr = empty($action) ? array("") : explode('-', $action);
        $huoniaoTag->assign('type', $typeArr[1]);
    } elseif ($action == 'fabu_circle') {
        $huoniaoTag->assign('topicid', htmlspecialchars(RemoveXSS($_REQUEST['topicid'])));
        $huoniaoTag->assign('topicname', htmlspecialchars(RemoveXSS($_REQUEST['topicname'])));
    }
    //商城查看评价
    if ($action == 'commentdetail_shop') {
        $huoniaoTag->assign('id', (int)$id);
        $detailHandels = new handlers('shop', "orderDetail");
        $detailConfig  = $detailHandels->getHandle($id);
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }
        }
    }
    if ($action == 'fabu_circle') {

        //实名认证
        $f_url = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);

        global $cfg_memberVerified;
        global $cfg_memberVerifiedInfo;
        if ($cfg_memberVerified && (($userinfo['userType'] == 1 && $userinfo['certifyState'] != 1) || ($userinfo['userType'] == 2 && $userinfo['licenseState'] != 1))) {
            $param = array(
                'service' => 'siteConfig',
                'template' => 'certification'
            );
            header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=verified');
            die;
        }

        // 手机认证
        global $cfg_memberBindPhone;
        global $cfg_memberBindPhoneInfo;
        global $cfg_periodicCheckPhone;
        global $cfg_periodicCheckPhoneCycle;
        $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
        $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天
        if ($cfg_memberBindPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || ($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle))) {
            $param = array(
                'service' => 'siteConfig',
                'template' => 'certification'
            );
            header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=phone');
            die;
        }

        // 关注公众号
        global $cfg_memberFollowWechat;
        global $cfg_memberFollowWechatInfo;
        if ($cfg_memberFollowWechat && !$userinfo['wechat_subscribe']) {
            $param = array(
                'service' => 'siteConfig',
                'template' => 'certification'
            );
            header("location:" . getUrlPath($param) . '?from=' . $f_url . '&type=wechat');
            die;
        }

        $huoniaoTag->assign('topicid', htmlspecialchars(RemoveXSS($_REQUEST['topicid'])));
        $huoniaoTag->assign('topicname', htmlspecialchars(RemoveXSS($_REQUEST['topicname'])));
    }

    if (strpos($action, "dating-") !== false) {

        $contorllerFile = dirname(__FILE__) . '/dating.controller.php';
        if (file_exists($contorllerFile)) {
            //声明以下均为接口类
            $handler = true;
            require_once($contorllerFile);
        }

        $userLogin->checkUserIsLogin();

        $params['realServer'] = "member";
        $act = substr($action, 7);
        $params['action'] = $act;
        $params['template'] = $act;
        dating($params);

        foreach ($_GET as $k => $v) {
            $k = htmlspecialchars(RemoveXSS($k));
            $v = htmlspecialchars(RemoveXSS($v));
            if($k == 'utype'){
                $v = (int)$v;
            }
            $huoniaoTag->assign($k, $v);
        }

        //交友相册
        if ($action == "dating-album-add") {
            //获取图片配置参数
            require(HUONIAOINC . "/config/dating.inc.php");

            if ($customUpload == 1) {
                $huoniaoTag->assign('atlasSize', $custom_atlasSize);
                $huoniaoTag->assign('atlasType', "*." . str_replace("|", ";*.", $custom_atlasType));
            }
            $huoniaoTag->assign('atlasMax', (int)$customAtlasMax);
        }
    }

    if ($action == 'renovation_zb_detail') {
        //        echo '32121';die;
        $userLogin->checkUserIsLogin();
        $detailHandels = new handlers("renovation", "zhaobiaoDetail");
        $detailConfig  = $detailHandels->getHandle($id);
        $detailConfig = $detailConfig['info'];
        if (is_array($detailConfig)) {
            foreach ($detailConfig as $key => $value) {
                $huoniaoTag->assign('detail_' . $key, $value);
            }
        }
    }

    //发布普工求职
    if ($action == "fabu_post_seek" || $action == "fabu_post_seek") {
        include(HUONIAOINC . "/config/job.inc.php");
        $huoniaoTag->assign("fabuCheck", $custom_fabuCheck);
    }

    //邀请有礼、提现
    if ($action == 'invite' || $action == 'withdraw' || $action == 'inviteWithdraw' || $action == 'inviteRegister' || $action == 'inviteGzh') {

        require(HUONIAOINC . "/config/pointsConfig.inc.php");
        $huoniaoTag->assign('cfg_pointRegGivingRec', floatval($cfg_pointRegGivingRec));
        $huoniaoTag->assign('cfg_moneyRegGivingRec', floatval($cfg_moneyRegGivingRec));
        $huoniaoTag->assign('cfg_moneyRegGivingWithdraw', floatval($cfg_moneyRegGivingWithdraw));
        $huoniaoTag->assign('cfg_recRegisterGuide', (int)$cfg_recRegisterGuide);

        $regGivingQuan = 0;
        if ($cfg_regGivingQuan) {
            $cfg_regGivingQuan = explode(',', $cfg_regGivingQuan);
            foreach ($cfg_regGivingQuan as $key => $value) {
                $regmodule = explode('_', $value);
                $regid    = $regmodule[1];                  //  quan  id
                $regname  = $regmodule[0];                      //  类型  shop  / waimai
                if ($regname == 'waimai') {
                    $sql = $dsql->SetQuery("SELECT `money` FROM `#@__waimai_quan` WHERE `id` = " . $regid);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $regGivingQuan += $ret[0]['money'];
                    }
                } elseif ($regname == 'shop') {
                    $sql = $dsql->SetQuery("SELECT `promotio` FROM `#@__shop_quan` WHERE `id` = " . $regid);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $regGivingQuan += $ret[0]['promotio'];
                    }
                }
            }
        }
        $huoniaoTag->assign('regGivingQuan', floatval($regGivingQuan));

        //查询奖金和推荐人数
        if ($action == 'invite' || $action == 'inviteWithdraw' || $action == 'withdraw' || $action == 'inviteGzh') {
            $userLogin->checkUserIsLogin();

            $totalBonus = $totalPeople = 0;
            $sql = $dsql->SetQuery("SELECT count(`id`) totalPeople, sum(`money`) totalBonus FROM `#@__member_invite` WHERE `fid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $totalBonus = $ret[0]['totalBonus'];
                $totalPeople = $ret[0]['totalPeople'];
            }
            $huoniaoTag->assign('totalBonus', floatval($totalBonus));
            $huoniaoTag->assign('totalPeople', (int)$totalPeople);
            $huoniaoTag->assign('module', $module);
        }

        //查询已经提现金额
        if ($action == 'inviteWithdraw' || $action == 'withdraw') {

            $totalWithdrawn = $totalReviewWithdrawn = 0;  //已经提现   审核中
            $sql = $dsql->SetQuery("SELECT (SELECT sum(`amount`) FROM `#@__member_withdraw` WHERE `uid` = $userid AND `state` = 1 AND `type` = 2) as totalWithdrawn, (SELECT sum(`amount`) FROM `#@__member_withdraw` WHERE `uid` = $userid AND `state` = 0 AND `type` = 2) as totalReviewWithdrawn FROM `#@__member_withdraw` WHERE `uid` = $userid AND `type` = 2");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $totalWithdrawn = $ret[0]['totalWithdrawn'];
                $totalReviewWithdrawn = $ret[0]['totalReviewWithdrawn'];
            }
            $huoniaoTag->assign('totalWithdrawn', floatval($totalWithdrawn));
            $huoniaoTag->assign('totalReviewWithdrawn', floatval($totalReviewWithdrawn));
            $canWithdrawn = floatval($totalBonus - $totalWithdrawn - $totalReviewWithdrawn);
            $huoniaoTag->assign('totalCanWithdrawn', $canWithdrawn > 0 ? $canWithdrawn : 0);
        }

        //邀请注册
        if ($action == 'inviteRegister') {

            //已登录的跳回会员中心
            if ($userid > -1) {
                header('location:' . getUrlPath(array('service' => 'member', 'type' => 'user')));
                die;
            }

            //没有推荐人信息，跳回首页
            $fromShare = (int)$fromShare;
            if (!$fromShare) {
                header('location:' . getUrlPath(array('service' => 'siteConfig')));
                die;
            }

            $_userinfo = $userLogin->getMemberInfo($fromShare);
            $huoniaoTag->assign('userinfo', $_userinfo);
        }

        //关注公众号
        if ($action == 'inviteGzh') {

            $data = array(
                'module' => 'member',
                'type'   => 'bind',
                'aid'    => $userid,
                'from'   => 'bind'
            );
            $handlers = new handlers("siteConfig", "getWeixinQrPost");
            $post   = $handlers->getHandle($data);
            $img = '';
            if ($post['state'] == 100) {
                $img = $post['info'];
            }
            $huoniaoTag->assign('img', $img);
        }
    }

    if ($action == 'fabu_shop_bargain' || $action == 'fabu_shop_tuan' || $action == 'fabu_shop_secKill' || $action == 'fabu_shop_qianggou') {

        $userLogin->checkUserIsLogin();

        global $customshopbargainingnomoney;

        $huoniaoTag->assign('shopbargainingnomone', $shopbargainingnomone);
        $huoniaoTag->assign('id', $id);
        if ($id) {
            $detailHandels = new handlers("shop", "huodongDetail");
            $detailConfig  = $detailHandels->getHandle($id);
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }
        }
    }

    if ($action == "quanDetail" || $action == "fabuquan") {
        $huoniaoTag->assign('id', $id);
        if ($id) {
            $detailHandels = new handlers("shop", "quanDetail");
            $detailConfig  = $detailHandels->getHandle($id);
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }
        }
    }

    if ($action == 'shop_huodong' || $action == 'shop_hasjoin') {
        require(HUONIAOINC . "/config/shop.inc.php");

        $huodongopenarr = array();

        if ($custom_huodongopen != '') {

            $huodongopenarr = explode(',', $custom_huodongopen);
        }

        $huoniaoTag->assign('huodongopenarr', $huodongopenarr);

        $guigeState = 0;
        if ($id) {
            $archives = $dsql->SetQuery("SELECT `specification`,`speCustom` FROM `#@__shop_product` WHERE `id` = '1122'");
            $res = $dsql->dsqlOper($archives, "results");
            $sep = !empty($res[0]['speCustom']) ? unserialize($res[0]['speCustom']) : NULL;
            if (!empty($res[0]['specification']) || !empty($sep)) {
                $guigeState = 1;
            }
        }
        $huoniaoTag->assign('guigeState', $guigeState);
    }


    if ($action == "shop_type") {

        $huoniaoTag->assign("typeid", (int)$typeid);
        $huoniaoTag->assign("id", (int)$id);
        $huoniaoTag->assign("modAdrr", (int)$modAdrr);
    }

    //模块我的页面，如：index_article/index_info等
    $actionarr = explode('_', $action);
    if ($actionarr[0] == 'index' && $actionarr[1] != '') {
        if ($userid <= 0) {
            $userid =  0;
        }
        /*身份验证*/
        if ($actionarr[1] == 'house') {
            $sql = $dsql->SetQuery("SELECT `id`, `meal` FROM `#@__house_zjuser` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            /*$zjusercom 0-经纪人身份，1-企业身份不是经纪人，2-自由人 3-中介经纪人*/
            $zjusercom = 0;
            if ($ret) {
                if ($userinfo['userType'] == 2) {
                    $zjusercom = 3;
                }
            } else {
                if ($userinfo['userType'] == 2) {
                    $zjusercom = 1;
                } elseif ($userinfo['userType'] == 1) {
                    $zjusercom = 2;
                }
            }
            $huoniaoTag->assign('zjusercom', $zjusercom);

            /*浏览量*/
            $ishavesql = $dsql->SetQuery("SHOW TABLES LIKE '#@__" . $actionarr[1] . "_historyclick'");
            $ishaveres = $dsql->dsqlOper($ishavesql, "results");
            $totalclick = 0;
            $uid = $userinfo['userid'];
            if ($ishaveres && $uid > 0) {
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $actionarr[1] . "_historyclick`  WHERE  `uid` = " . $uid);
                $totalclick = $dsql->dsqlOper($archives, "totalCount");
            }
            $huoniaoTag->assign('totalclick', $totalclick);
        }
        if ($actionarr[1] == 'homemaking') {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_personal` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            $personalId =  $ret[0]['id'] ? $ret[0]['id'] : 0;
            $huoniaoTag->assign('personalId', $personalId);
            $detailHandels = new handlers("homemaking", "orderList");
            if ($personalId != 0) {
                $state = 20;
                $dispatchid = $personalId;
            } else {
                $state = 20;
                $dispatchid = '';
            }
            $param = array(
                'state'       => $state,
                'dispatchid'  => $dispatchid,
                'backTotal'   => '1',
            );
            $detailConfig  = $detailHandels->getHandle($param);
            $servednum = $qdnum = 0;
            if ($detailConfig['state'] == 100 && is_array($detailConfig)) {
                $servednum    = $detailConfig['info']['state20'];
                $qdnum        = $detailConfig['info']['state10'];
            }
            $huoniaoTag->assign('servednum', $servednum);
            $huoniaoTag->assign('qdnum', $qdnum);
        }


        /*今日粉丝关注*/
        $gzfansall = $fansall = $todayfansall = $todayclick = $todayshouyi = $messcount = 0;
        $began = strtotime(date("Y-m-d") . " 00:00");
        $end   = strtotime(date("Y-m-d") . " 23:59");
        $uid   = $userinfo['userid'];
        if ($uid <= 0) {
            $uid =  0;
        }

        if ($actionarr[1] != 'live') {
            $followtable = 'member_follow';
            $joinsql     = ' LEFT JOIN `#@__member` m ON m.`id` = f.';
        } else {
            $followtable = 'live_follow';
            $archives         = $dsql->SetQuery("SELECT f.`id` FROM `#@__" . $followtable . "` f LEFT JOIN `#@__member` m ON m.`id` = f.fid  WHERE  f.`tid` = $uid AND f.`date` >= $began AND f.`date` <= $end AND m.`state` = 1 AND m.`is_cancellation` = 0");
            $todayfansall     = $dsql->dsqlOper($archives, "totalCount");
        }
        /*关注*/
        $archives    = $dsql->SetQuery("SELECT f.`id` FROM `#@__" . $followtable . "` f LEFT JOIN `#@__member` m ON m.`id` = f.tid  WHERE  f.`fid` = $uid AND m.`state` = 1 AND m.`is_cancellation` = 0 AND m.`mtype`!=0");
        $fansall     = $dsql->dsqlOper($archives, "totalCount");
        /*粉丝*/
        $archives    = $dsql->SetQuery("SELECT f.`id` FROM `#@__" . $followtable . "` f LEFT JOIN `#@__member` m ON m.`id` = f.fid WHERE  f.`tid` = $uid AND m.`state` = 1 AND m.`is_cancellation` = 0 AND m.`mtype`!=0");
        $gzfansall   = $dsql->dsqlOper($archives, "totalCount");

        /*今日收益(打赏)*/
        if ($actionarr[1] == 'article' || $actionarr[1] == 'live' || $actionarr[1] == 'circle' || $actionarr[1] == 'tieba' || $actionarr[1] == 'chat' || $actionarr[1] == 'dating') {
            $archives         = $dsql->SetQuery("SELECT sum(`amount`) todayshouyi FROM `#@__member_reward` WHERE `state` = 1 AND `touid` = $uid AND `module` = '" . $actionarr[1] . "' AND `date` >= $began AND `date` <= $end");
            $results          = $dsql->dsqlOper($archives, "results");
            $todayshouyi = 0;
            if ($results) {
                $todayshouyi      = (float)$results[0]['todayshouyi'];
            }

            if ($actionarr[1] == 'live') {
                $sql1          = $dsql->SetQuery("SELECT sum(p.`amount`) todayshouyi FROM `#@__livelist` l LEFT JOIN `huoniao_live_reward` r ON l.`id` = r.`live_id` LEFT JOIN `huoniao_live_payorder` p ON p.`live_id` = r.`live_id` WHERE l.`user` = $uid AND p.`status` = 1 AND r.`payid` = p.`order_id` AND p.`date` >= $began AND p.`date` <= $end");
                $res1          = $dsql->dsqlOper($sql1, "results");
                $todayshouyi   += $res1[0]['todayshouyi'];

                $sql2         = $dsql->SetQuery("SELECT sum(`recv_money`) todayshouyi FROM `#@__live_hrecv_list` l LEFT JOIN `huoniao_live_hongbao` hb ON l.`hid` = hb.`id` WHERE  `recv_user` = $uid AND hb.`date` >= $began AND hb.`date` <= $end");
                $res2         = $dsql->dsqlOper($sql2, "results");
                $todayshouyi  += $res2[0]['todayshouyi'];
            }
        }

        /*今日收益(商品销售)*/
        if ($actionarr[1] == 'huodong') {
            $sysql = $dsql->SetQuery("SELECT SUM(`amount`) todayshouyi FROM `#@__member_money` WHERE `ordertype` = 'huodong' AND `type` = 1 AND `montype` != 1 AND `showtype` = 0 AND `date` >= $began AND `date` <= $end AND `userid` = $uid");
            $syres = $dsql->dsqlOper($sysql, "results");
            $todayshouyi = sprintf('%.2f', $syres[0]['todayshouyi']);

            /*今日报名*/
            $bmsql     = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_list` WHERE `uid` = $userid");
            $bmres     = $dsql->dsqlOper($bmsql, 'results');
            $todaybm   = 0;
            if ($bmres) {
                $hid = array_column($bmres, 'id');
                $hid = $hid ? join(',', $hid) : '';
                $archives        = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_reg` WHERE FIND_IN_SET(`hid`,'$hid') AND `date` >= $began AND `date` <= $end");
                $todaybm         = $dsql->dsqlOper($archives, "totalCount");
            }
            $huoniaoTag->assign('todaybm', $todaybm);
        }

        if ($actionarr[1] == 'article') {
            //            $archives    = $dsql->SetQuery("SELECT f.`id` FROM `#@__member_follow` f LEFT JOIN `#@__article_selfmedia` s ON s.`id` = f.`fid` WHERE `fid` = $uid AND f.`fortype` = 'media' AND s.`state` = 1 ");
            //            $totalCount  = $dsql->dsqlOper($archives, "totalCount");
            //            $gzfansall   += $totalCount;
            //
            //            $archives    = $dsql->SetQuery("SELECT f.`id` FROM `#@__member_follow` f LEFT JOIN `#@__article_selfmedia` s ON s.`id` = f.`fid` WHERE `tid` = $uid AND f.`fortype` = 'media' AND s.`state` = 1 AND f.`date` >= $began AND f.`date` <= $end");
            //            $totalCount  = $dsql->dsqlOper($archives, "totalCount");
            //            $todayfansall+= $totalCount;

            /*今日涨粉*/
            $archives         = $dsql->SetQuery("SELECT f.`id` FROM `#@__member_follow` f LEFT JOIN `#@__member` m ON m.`id` = f.tid WHERE  f.`tid` = $uid AND f.`date` >= $began AND f.`date` <= $end AND m.`state` = 1 AND m.`is_cancellation` = 0");
            $todayfansall     = $dsql->dsqlOper($archives, "totalCount");
        }

        /*商城最新物流*/
        if ($actionarr[1] == 'shop') {
            $shopordersql   = $dsql->SetQuery("SELECT o.`exp_number`,o.`exp_company`,o.`contact`,o.`id`,p.`litpic` FROM `#@__shop_order` o LEFT JOIN `#@__shop_order_product` op ON o.`id` = op.`orderid` LEFT JOIN `#@__shop_product` p ON op.`proid` = p.`id` WHERE 1=1 ORDER BY o.`exp_date` DESC LIMIT 0,1");
            $shoporderres   = $dsql->dsqlOper($shopordersql, 'results');
            if ($shoporderres) {

                //顺丰快递必须添加收或寄件人手机尾号4位(单号:4位手机号)。例如：SF12345678:0123
                if ($shoporderres[0]["exp_company"] == 'sf') {
                    $shoporderres[0]["exp_number"] = $shoporderres[0]["exp_number"] . ':' . substr($shoporderres[0]["contact"], -4);
                }

                $expTrack = getExpressTrack($shoporderres[0]["exp_company"], $shoporderres[0]["exp_number"], 'shop_order', $shoporderres[0]['id']);
                $expTrack = $expTrack ? unserialize($expTrack) : array();
                $orderlitpic = $shoporderres[0]['litpic'] != '' ? getFilePath($shoporderres[0]['litpic']) : '';
                $huoniaoTag->assign('expTrack', $expTrack);
                $huoniaoTag->assign('orderlitpic', $orderlitpic);
            }
        }

        /*贴吧打赏*/
        if ($actionarr[1] == 'tieba') {
            $archives         = $dsql->SetQuery("SELECT `uid` FROM `#@__member_reward` WHERE `state` = 1 AND `touid` = $uid AND `module` = '" . $actionarr[1] . "' ORDER BY `date` DESC");
            $messcount        = $dsql->dsqlOper($archives, "totalCount");
            $memberList = array();
            if ($messcount != 0) {
                $messres    = $dsql->dsqlOper($archives, "results");
                foreach ($messres as $k => $v) {
                    $membersql       = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE  `id` = '" . $v['uid'] . "'");
                    $memberres       = $dsql->dsqlOper($membersql, "results");
                    array_push($memberList, array(
                        'id'    => $v['userid'],
                        'photo' => $memberres[0]['photo'] != '' ? getFilePath($memberres[0]['photo']) : ''
                    ));
                }
            }
            $huoniaoTag->assign("messcount", (int)$messcount);
            $huoniaoTag->assign("memberList", $memberList);
        }

        /*二手信息*/
        if ($actionarr[1] == 'info') {
            /*累积卖出多少钱*/
            //查询店铺
            $allxsmoney = $allxscount = $allfbcount = 0;
            $citysql = $dsql->SetQuery("SELECT `id` FROM  `#@__infoshop` WHERE `id` = " . $uid);
            $cityres = $dsql->dsqlOper($citysql, "results");
            if ($cityres[0]['id']) {
                $sql            = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` l LEFT JOIN `#@__info_order` ON l.`id` = o.`prod` WHERE l.`userid` = '" . $uid . "' AND o.`orderstate` = 4 AND  o.`store` = " . $cityres[0]['id']);
                $allxscount     = $dsql->dsqlOper($sql, "totalCount");
            }

            $sql            = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE  `userid` = '$uid' AND `del` = 0");
            $allfbcount     = $dsql->dsqlOper($sql, "totalCount");
            if ($cityres && $cityres[0]['id']) {
                $sql            = $dsql->SetQuery("SELECT sum(o.`price`) allxsmoney FROM `#@__info_order` o WHERE o.`orderstate` = 4 AND  o.`store` = " . $cityres[0]['id']);
                $storeinfo      = $dsql->dsqlOper($sql, "results");
                $allxsmoney     += $storeinfo[0]['allxsmoney'];
            } else {
                $sql            = $dsql->SetQuery("SELECT sum(o.`price`) allxsmoney FROM `#@__info_order` o LEFT JOIN `#@__infolist` l ON l.`id` = o.`prod` WHERE l.`userid` = '" . $uid . "' AND o.`orderstate` = 4 ");
                $storeinfo      = $dsql->dsqlOper($sql, "results");
                $allxsmoney     += $storeinfo[0]['allxsmoney'];
            }
            $huoniaoTag->assign("allxsmoney", (int)$allxsmoney);
            $huoniaoTag->assign("allxscount", sprintf('%.2f', $allxscount));
            $huoniaoTag->assign("allfbcount", (int)$allfbcount);
        }

        $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `userid` = '" . $uid . "'");
        if ($actionarr[1] == 'info' || $actionarr[1] == 'education' || $actionarr[1] == 'car' || $actionarr[1] == 'huodong' || $actionarr[1] == 'job' || $actionarr[1] == 'shop' || $actionarr[1] == 'tieba' || $actionarr[1] == 'tuan' || $actionarr[1] == 'business' || $actionarr[1] == 'travel') {
            /*关注机构*/
            $storegzcount     = $dsql->dsqlOper($archives . "  AND `module` = '" . $actionarr[1] . "' AND `action` = 'store-detail'", "totalCount");
            if ($actionarr[1] != 'job') {
                $kechengzcount    = $dsql->dsqlOper($archives . "  AND `module` = '" . $actionarr[1] . "' AND `action` != 'store-detail'", "totalCount");
            } else {
                $archives          = $dsql->SetQuery("SELECT m.`id` FROM `#@__member_collect` m LEFT JOIN `#@__job_post` p ON p.`id` = m.`aid` WHERE m.`userid` = '" . $uid . "'");
                $kechengzcount     = $dsql->dsqlOper($archives . "  AND m.`module` = '" . $actionarr[1] . "' AND m.`action` = 'job' AND p.`id` != '' AND p.`state` = 1  AND p.`valid` > " . time(), "totalCount");
            }

            $huoniaoTag->assign('storegzcount', $storegzcount);
            $huoniaoTag->assign('kechengzcount', $kechengzcount);  // job收藏职位
        }

        /*今日浏览量*/
        $ishavesql        = $dsql->SetQuery("SHOW TABLES LIKE '#@__" . $actionarr[1] . "_historyclick'");
        $ishaveres        = $dsql->dsqlOper($ishavesql, "results");
        if ($ishaveres) {
            $archives         = $dsql->SetQuery("SELECT `id` FROM `#@__" . $actionarr[1] . "_historyclick`  WHERE  `fuid` = $uid AND `date` >= $began AND `date` <= $end");
            $todayclick       = $dsql->dsqlOper($archives, "totalCount");
        }

        /*job-已投简历*/
        if ($actionarr[1] == 'job') {
            //新：关注的公司数
            $sql = $dsql::SetQuery("select count(*) from `#@__member_collect` where `module`='job' and `action`='company' and `userid`=$uid");
            $cCompany = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("collectCompany", $cCompany);

            //我的面投递，统计
            $sql = $dsql::SetQuery("select d.*,i.`state` 'invition_state',i.`pubdate` 'invition_pubdate' from `#@__job_delivery` d left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $uid");
            $delivery0 = $dsql->count($sql . " and d.`state`=0 and d.`read`=0 and d.`u_read`=0");
            $huoniaoTag->assign("delivery0", $delivery0);
            $delivery1 = $dsql->count($sql . " and d.`state`=0 and d.`read`=1 and d.`u_read`=0");
            $huoniaoTag->assign("delivery1", $delivery1);
            $delivery2 = $dsql->count($sql . " " . $dsql::SetQuery("and d.`state`=1 and !EXISTS(select g.id from `#@__job_invitation` g where g.`did`=d.`id`) and d.`u_read`=0"));
            $huoniaoTag->assign("delivery2", $delivery2);
            $delivery3 = $dsql->count($sql . " and d.`state`=1 and i.`did`!=0 and i.`state`=1");  //无论用户是否阅读
            $huoniaoTag->assign("delivery3", $delivery3);
            $delivery4 = $dsql->count($sql . " and d.`state`=2 and d.`u_read`=0");
            $huoniaoTag->assign("delivery4", $delivery4);
            //对我感兴趣
            //找出我所有的简历id
            $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `userid`=$uid");
            $rids = $dsql->getArr($sql);
            if ($rids) {
                $rids = join(",", $rids);
                $collectSql = $dsql::SetQuery("select 'collect' as 'op', `aid` 'rid',`userid` 'cu',`pubdate` 'time' from `#@__member_collect` where `module`='job' and `action`='resume' and `aid` in ($rids)");
                $clickSql = $dsql::SetQuery("select 'click' as 'op', `aid` 'rid',`uid` 'cu',`date` 'time' from `#@__job_historyclick` where `module`='job' and `module2`='resumeDetail' and `fuid`=$uid");
                //默认情况下，是全部，则两条sql混合
                $allSql = $dsql->getOne("SELECT count(*) FROM (" . $collectSql . " UNION ALL " . $clickSql . ") t order by `time` desc");
                $huoniaoTag->assign("interestMe", $allSql);
            } else {
                $huoniaoTag->assign("interestMe", 0);
            }

            //面试统计
            $invitationList = $dsql->getArr($dsql::SetQuery("select `u_read` from `#@__job_invitation` where `userid`=$uid and `state`=1 and `date`>=unix_timestamp(current_timestamp)"));
            $huoniaoTag->assign("invitationCount", count($invitationList));
            if (count($invitationList) == 0) {
                $huoniaoTag->assign("invitationNotice", 0);
            } else {
                $huoniaoTag->assign("invitationNotice", in_array(0, $invitationList) ? 1 : 0);
            }
            /*默认简历详情*/
            $detailHandels = new handlers('job', "resumeDetail");
            $detailConfig = $detailHandels->getHandle(array("default" => 1));

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                if (is_array($detailConfig)) {
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
                $ishavejl = 1;
            } else {
                $ishavejl = 0;
            }
            $huoniaoTag->assign('ishavejl', $ishavejl);

            $archives      = $dsql->SetQuery("SELECT `id` FROM `#@__job_invitation` WHERE 1 = 1 AND `rid` = '$rid'");
            $yqcount       = $dsql->dsqlOper($archives, "totalCount");
            $huoniaoTag->assign('yqcount', $yqcount);
        }

        /*pension-老人信息*/
        if ($actionarr[1] == 'pension') {
            $detailHandels = new handlers('pension', 'elderlyDetail');
            $detailConfig  = $detailHandels->getHandle();
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig  = $detailConfig['info'];
                if (is_array($detailConfig)) {
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
                $huoniaoTag->assign('pensionState', $state);
            }
        }

        /*商家订单统计*/
        if ($actionarr[1] == 'business') {
            $businessorder = 0;
            /*点餐order*/
            $diancansql         = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_order` WHERE `uid` = $uid");
            $diancancount       = $dsql->dsqlOper($diancansql, "totalCount");
            $businessorder      += $diancancount;

            /*订座order*/
            $dingzuosql         = $dsql->SetQuery("SELECT `id` FROM `#@__business_dingzuo_order` WHERE `uid` = $uid");
            $dingzuocount       = $dsql->dsqlOper($dingzuosql, "totalCount");
            $businessorder      += $dingzuocount;

            /*买单order*/
            $maidansql          = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_order` WHERE `uid` = $uid");
            $maidancount        = $dsql->dsqlOper($maidansql, "totalCount");
            $businessorder      += $maidancount;
            $huoniaoTag->assign('businessorder', $businessorder);
        }

        /*外卖*/
        if ($actionarr[1] == 'waimai') {
            $levelsql = $dsql->SetQuery("SELECT * FROM `#@__member_level` ORDER BY `id` ASC");
            $levelre = $dsql->dsqlOper($levelsql, "results");

            $levle = $levelre[0];
            $levle['privilege'] = $levle['privilege'] != '' ? unserialize($levle['privilege']) : '';
            $huoniaoTag->assign('waimaizk', $levle['privilege']['waimai']);
            $huoniaoTag->assign('quan', is_array($levle['privilege']['quan']) ? count($levle['privilege']['quan']) : 0);
        }

        /*旅游代付款订单统计*/
        if ($actionarr[1] == 'travel') {
            $lrsql        = $dsql->SetQuery("SELECT `id` FROM `#@__travel_order` WHERE  `orderstate` = 0");
            $wfkcount     = $dsql->dsqlOper($archives, "totalCount");
            $huoniaoTag->assign('wfkcount', $wfkcount);
        }

        /*足迹*/
        if ($actionarr[1] != 'circle' && $actionarr[1] != 'waimai') {
            if($actionarr[1] == 'job'){
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $actionarr[1] . "_historyclick`  WHERE `module2` = 'postDetail' and `uid` = $uid ");
            }else{
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $actionarr[1] . "_historyclick`  WHERE  `uid` = $uid ");
            }
            $todayzjcount = $dsql->dsqlOper($archives, "totalCount");
        }

        //查询工长设计师
        if ($actionarr[1] == 'renovation') {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $foremanuid = $ret[0]['id'];
                $huoniaoTag->assign("renovation_foremanuid", $foremanuid);
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $teamuid = $ret[0]['id'];
                $huoniaoTag->assign("renovation_teamuid", $teamuid);
            }
        }

        $huoniaoTag->assign('gzfansall', $gzfansall);
        $huoniaoTag->assign('fansall', $fansall);
        $huoniaoTag->assign('todayfansall', $todayfansall);
        $huoniaoTag->assign('todayclick', (int)$todayclick);
        $huoniaoTag->assign('todayzjcount', (int)$todayzjcount);  // 足迹
        $huoniaoTag->assign('todayshouyi', sprintf('%.2f', $todayshouyi));
    }


    //朋友代付
    if ($action == 'daipay' || $action == 'daipay_return') {

        if (!empty($module) && !empty($ordernum)) {

            //当前登录人信息
            if ($userinfo) {
                $huoniaoTag->assign('userinfo', $userinfo);
            }
            $huoniaoTag->assign('module', $module);
            $huoniaoTag->assign('ordernum', $ordernum);
            $huoniaoTag->assign('confirmtype', $confirmtype);
            $huoniaoTag->assign('isPeerpay', (int)$peerpay);

            $param = array(
                'service' => 'member',
                'type' => 'user',
                'template' => 'daipay',
                'param' => 'module=' . $module . '&confirmtype=' . $confirmtype . '&ordernum=' . $ordernum . '&peerpay=1'
            );
            $huoniaoTag->assign('daipayUrl', urlencode(getUrlPath($param)));

            //订单商品信息
            $proList = array();

            //查询订单信息
            //团购
            if ($module == 'tuan') {

                //代付开关
                include HUONIAOINC . '/config/tuan.inc.php';
                if (!$custompeerpay) {
                    echo '<script>alert("系统未开启代付功能！");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
                    die;
                }

                $sql = $dsql->SetQuery("SELECT o.`procount`, o.`orderprice`, o.`propolic`, o.`orderstate`, o.`userid`, o.`proid`, o.`orderdate`, o.`peerpay` FROM `#@__tuan_order` o WHERE o.`ordernum` IN ('$ordernum')");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    $state = 0;  //未付
                    $totalPrice = 0;
                    foreach ($ret as $key => $value) {
                        $orderprice = sprintf('%.2f', $value['orderprice']);  //订单金额
                        $procount = $value['procount'];  //数量
                        $propolic = $value['propolic'];  //运费
                        $policy = unserialize($propolic);
                        $orderstate = $value['orderstate'];
                        $proid = $value['proid'];
                        $orderdate = $value['orderdate'];
                        $peerpay = $value['peerpay'];
                        $uid = $value['userid'];

                        //已付
                        if ($orderstate != 0) {
                            $state = 1;
                        }

                        //查询分享人信息
                        $uinfo = $userLogin->getMemberInfo($uid);
                        $huoniaoTag->assign('uinfo', $uinfo);

                        //总价
                        $totalAmount = $orderprice * $procount;

                        if (!empty($propolic) && !empty($policy)) {
                            $freight  = $policy['freight'];
                            $freeshi  = $policy['freeshi'];

                            //如果达不到免物流费的数量，则总价再加上运费
                            if ($procount <= $freeshi) {
                                $totalAmount += $freight;
                            }
                        }

                        $totalPrice += $totalAmount;

                        $configHandels = new handlers('tuan', "detail");
                        $detailConfig = $configHandels->getHandle($value['proid']);
                        if ($detailConfig && $detailConfig['state'] == 100) {
                            $proList[$p]['title']     = $detailConfig['info']['title'];
                            $proList[$p]['litpic']    = $detailConfig['info']['litpic'];
                            $proList[$p]['url']       = $detailConfig['info']['url'];
                            $proList[$p]['price']     = $value['orderprice'];
                            $proList[$p]['priceArr']  = explode('.', sprintf('%.2f', $value['orderprice']));
                            $proList[$p]['count']     = $value['procount'];
                        }
                    }

                    $orderpriceArr = explode('.', $totalPrice);
                    $huoniaoTag->assign('orderprice', $totalPrice);
                    $huoniaoTag->assign('orderpriceArr', $orderpriceArr);
                    $huoniaoTag->assign('state', $state);
                    $huoniaoTag->assign('peerpay', $peerpay);  //代付人

                    $second = $orderdate + 1800 - time(); //半个小时有效期
                    $second = $second < 0 ? 0 : $second;
                    $huoniaoTag->assign('second', $second);  //剩余时间
                    $huoniaoTag->assign('expiredDate', $orderdate + 1800);  //剩余时间

                    $RenrenCrypt = new RenrenCrypt();
                    $encodeid = base64_encode($RenrenCrypt->php_encrypt($ordernum));

                    $param       = array(
                        "service"  => "tuan",
                        "template" => "pay",
                        "param"    => "ordernum=" . $encodeid . "&peerpay=1"
                    );
                    $payurlParam = getUrlPath($param);
                    $huoniaoTag->assign('payurl', $payurlParam);
                } else {
                    echo '<script>alert("代付订单已失效，请让朋友重新发给您~");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
                    die;
                }


                //外卖
            } elseif ($module == 'waimai') {

                //代付开关
                include HUONIAOINC . '/config/waimai.inc.php';
                if (!$custompeerpay) {
                    echo '<script>alert("系统未开启代付功能！");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
                    die;
                }

                $sql = $dsql->SetQuery("SELECT o.`amount`, o.`state`, o.`uid`, o.`food`, o.`pubdate`, o.`peerpay`, o.`sid` FROM `#@__waimai_order_all` o WHERE o.`ordernum` = '$ordernum'");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    $value = $ret[0];

                    $state = 0;  //未付
                    $amount = sprintf('%.2f', $value['amount']);  //订单金额
                    $state = $value['state'];
                    $pubdate = $value['pubdate'];
                    $peerpay = $value['peerpay'];
                    $uid = $value['uid'];

                    //已付
                    if ($state != 0) {
                        $state = 1;
                    }

                    //查询分享人信息
                    $uinfo = $userLogin->getMemberInfo($uid);
                    $huoniaoTag->assign('uinfo', $uinfo);

                    $orderpriceArr = explode('.', $amount);
                    $huoniaoTag->assign('orderprice', $amount);
                    $huoniaoTag->assign('orderpriceArr', $orderpriceArr);
                    $huoniaoTag->assign('state', $state);
                    $huoniaoTag->assign('peerpay', $peerpay);  //代付人

                    $second = $pubdate + 1800 - time(); //半个小时有效期
                    $second = $second < 0 ? 0 : $second;
                    $huoniaoTag->assign('second', $second);  //剩余时间
                    $huoniaoTag->assign('expiredDate', $pubdate + 1800);  //剩余时间

                    $param       = array(
                        "service"  => "waimai",
                        "template" => "pay",
                        "param"    => "ordernum=" . $ordernum . "&peerpay=1"
                    );
                    $payurlParam = getUrlPath($param);
                    $huoniaoTag->assign('payurl', $payurlParam);

                    //商品链接
                    $param       = array(
                        "service"  => "waimai",
                        "template" => "shop",
                        "id"       => $value['sid'],
                        "param"    => "foodid=%foodid%&typeid=%typeid%"
                    );
                    $proUrl = getUrlPath($param);

                    $foodArr = unserialize($value['food']);
                    foreach ($foodArr as $k => $v) {
                        $foodsql = $dsql->SetQuery("SELECT `pics`, `typeid` FROM `#@__waimai_list` WHERE `id` = " . $v['id']);
                        $foodre  = $dsql->dsqlOper($foodsql, "results");
                        $pics = explode(',', $foodre['0']['pics']);
                        $litpic = getFilePath($pics[0]);

                        array_push($proList, array(
                            'title' => $v['title'],
                            'litpic' => $litpic,
                            'url' => str_replace('%foodid%', $v['id'], str_replace('%typeid%', $foodre[0]['typeid'], $proUrl)),
                            'price' => $v['price'],
                            'priceArr' => explode('.', sprintf('%.2f', $v['price'])),
                            'count' => $v['count']
                        ));
                    }
                } else {

                    //跑腿
                    $sql = $dsql->SetQuery("SELECT o.`amount`, o.`state`, o.`uid`, o.`pubdate`, o.`peerpay` FROM `#@__paotui_order` o WHERE o.`ordernum` = '$ordernum'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {

                        $value = $ret[0];

                        $state = 0;  //未付
                        $amount = sprintf('%.2f', $value['amount']);  //订单金额
                        $state = $value['state'];
                        $pubdate = $value['pubdate'];
                        $peerpay = $value['peerpay'];
                        $uid = $value['uid'];

                        //已付
                        if ($state != 0) {
                            $state = 1;
                        }

                        //查询分享人信息
                        $uinfo = $userLogin->getMemberInfo($uid);
                        $huoniaoTag->assign('uinfo', $uinfo);

                        $orderpriceArr = explode('.', $amount);
                        $huoniaoTag->assign('orderprice', $amount);
                        $huoniaoTag->assign('orderpriceArr', $orderpriceArr);
                        $huoniaoTag->assign('state', $state);
                        $huoniaoTag->assign('peerpay', $peerpay);  //代付人
                        $huoniaoTag->assign('paotuitype', '1');  //p跑腿

                        $second = $pubdate + 1800 - time(); //半个小时有效期
                        $second = $second < 0 ? 0 : $second;
                        $huoniaoTag->assign('second', $second);  //剩余时间
                        $huoniaoTag->assign('expiredDate', $pubdate + 1800);  //剩余时间

                        $param       = array(
                            "service"  => "waimai",
                            "template" => "pay",
                            "param"    => "ordertype=paotui&ordernum=" . $ordernum . "&peerpay=1"
                        );
                        $payurlParam = getUrlPath($param);
                        $huoniaoTag->assign('payurl', $payurlParam);
                    } else {
                        echo '<script>alert("代付订单已失效，请让朋友重新发给您~");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
                        die;
                    }
                }

                //商城
            } elseif ($module == 'shop') {

                //代付开关
                include HUONIAOINC . '/config/shop.inc.php';
                if (!$custompeerpay) {
                    echo '<script>alert("系统未开启代付功能！");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
                    die;
                }

                $sql = $dsql->SetQuery("SELECT o.`id`, o.`amount`, o.`logistic`, o.`orderstate`, o.`userid`, o.`orderdate`, o.`peerpay`,o.`point`,o.`changeprice`,o.`changetype` FROM `#@__shop_order` o WHERE o.`ordernum` IN ('$ordernum')");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    $state = 0;  //未付
                    $totalPrice = 0;
                    foreach ($ret as $key => $value) {
                        $amount     = sprintf('%.2f', $value['amount']);  //订单金额
                        $propolic   = $value['logistic'];  //运费
                        $orderstate = $value['orderstate'];
                        $orderdate  = $value['orderdate'];
                        $peerpay    = $value['peerpay'];
                        $order_point      = (float)$value['point'];
                        $uid     = $value['userid'];
                        $oid     = $value['id'];

                        //已付
                        if ($orderstate != 0) {
                            $state = 1;
                        }
                        global $cfg_pointRatio;
                        if($cfg_pointRatio){
                            $pointprice =   $order_point / $cfg_pointRatio;
                            $amount =  $amount - $pointprice;
                        }
                        if ($value['changetype'] == 1) {
                            $amount =  $value['changeprice'];
                        }
                        //查询分享人信息
                        $uinfo = $userLogin->getMemberInfo($uid);
                        $huoniaoTag->assign('uinfo', $uinfo);

                        //总价
                        $totalAmount = (float)$amount;

                        //                        if(!empty($propolic) && !empty($policy)){
                        //                            $freight  = $policy['freight'];
                        //                            $freeshi  = $policy['freeshi'];
                        //
                        //                            //如果达不到免物流费的数量，则总价再加上运费
                        //                            if($procount <= $freeshi){
                        //                                $totalAmount += $freight;
                        //                            }
                        //                        }

                        $totalPrice += $totalAmount;

                        $sql = $dsql->SetQuery("SELECT * FROM `#@__shop_order_product` WHERE `orderid` = " . $oid);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $p = 0;
                            foreach ($ret as $key => $value) {
                                $configHandels = new handlers('shop', "detail");
                                $detailConfig = $configHandels->getHandle($value['proid']);
                                if ($detailConfig && $detailConfig['state'] == 100) {
                                    $proList[$p]['title']     = $detailConfig['info']['title'];
                                    $proList[$p]['litpic']    = $detailConfig['info']['litpic'];
                                    $proList[$p]['url']    = $detailConfig['info']['url'];
                                    $proList[$p]['price']     = $value['price'];
                                    $proList[$p]['priceArr']  = explode('.', sprintf('%.2f', $value['price']));
                                    $proList[$p]['count']     = $value['count'];
                                }
                            }
                        }
                    }

                    $orderpriceArr = explode('.', (float)$totalPrice);
                    $huoniaoTag->assign('orderprice', $totalPrice);
                    $huoniaoTag->assign('orderpriceArr', $orderpriceArr);
                    $huoniaoTag->assign('state', $state);
                    $huoniaoTag->assign('peerpay', $peerpay);  //代付人

                    $second = $orderdate + 1800 - time(); //半个小时有效期
                    $second = $second < 0 ? 0 : $second;
                    $huoniaoTag->assign('second', $second);  //剩余时间
                    $huoniaoTag->assign('expiredDate', $orderdate + 1800);  //剩余时间

                    $RenrenCrypt = new RenrenCrypt();
                    $encodeid = base64_encode($RenrenCrypt->php_encrypt($ordernum));

                    $param = array(
                        "service"  => "shop",
                        "template" => "pay",
                        "param"    => "ordernum=" . $encodeid . "&peerpay=1"
                    );
                    $payurlParam = getUrlPath($param);
                    $huoniaoTag->assign('payurl', $payurlParam);
                } else {
                    echo '<script>alert("代付订单已失效，请让朋友重新发给您~");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
                    die;
                }
            }

            $trueuid = $userLogin->getMemberID();

            $idtype = 0;

            if ($trueuid == $uid) {

                $idtype = 1; /*自己*/
            } elseif ($trueuid == $peerpay) {

                $idtype = 2; /*代付人*/
            }

            $oparam = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "order",
                "module"   => $module
            );

            $orderurlParam = getUrlPath($oparam);
            $huoniaoTag->assign('orderurl', $orderurlParam);

            $huoniaoTag->assign('idtype', $idtype);
            $huoniaoTag->assign('proList', $proList);
        } else {
            echo '<script>alert("代付链接错误，请让朋友重新发给您~");location.href="' . $cfg_secureAccess . $cfg_basehost . '"</script>';
            die;
        }
    }

    //婚嫁频道
    if ($action == 'marry') {

        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('typeid ', $typeid);
        $huoniaoTag->assign('ordertype', $ordertype);
        $huoniaoTag->assign('tagSel', $tag ? explode("|", $tag) : array());
    }

    /*房产管理*/

    if ($action == 'supplier') {

        if ($userid < 0) {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html?furl=" . $furl);
        }
        //招聘业务
        if ($partner == "job") {

            // 由于招聘业务有独立的套餐属性，这里不再强制验证是否已经入驻企业，后续如果更新了商家入驻规则，再做优化
            // $ver = verifyModuleAuth(array("module" => "job", "type" => ""));
            // if (!$ver) {
            //     //招聘不强制开通店铺，要在这里面开通
            //     $url = getUrlPath(array(
            //         "service" => "member"
            //     ));
            //     echo "<script>alert('抱歉，您没有招聘店铺权限，请先入驻！');location.href='$url';</script>";
            //     die;
            // }
            
            //联系客服
            require(HUONIAOINC . "/config/job.inc.php");
            global $cfg_hotline;
            $huoniaoTag->assign("hotline", $hotline_config == 0 ? $cfg_hotline : $customHotline); //客服座机
            $huoniaoTag->assign("JobWechat", $customJobWechat); //客服微信
            $huoniaoTag->assign("customJobQQ", $customJobQQ); //客服QQ
            $huoniaoTag->assign("customKefuImg", getFilePath($customKefuImg)); //客服QQ
            $huoniaoTag->assign("customJobQrCode", getFilePath($customJobQrCode)); //客服二维码
            $huoniaoTag->assign("customJob_fee", $customJob_fee); //职位单个购买
            $huoniaoTag->assign("customResume_down_fee", $customResume_down_fee); //简历单条下载
            $huoniaoTag->assign("customJob_top_fee", $customJob_top_fee); //置顶一天
            $huoniaoTag->assign("customJob_refresh_fee", $customJob_refresh_fee); //刷新一次
            $huoniaoTag->assign("customAgentCheck", $customagentCheck); //发布更新职位是否需要审核
            //当前的 cid
            $sql = $dsql::SetQuery("select id from `#@__job_company` where `userid`=$userid");
            $cid = $dsql->getOne($sql) ?: 0;
            $huoniaoTag->assign("job_cid", $cid);
            if(!$cid && $template!="company_info" && $template!="index" && $template!="job"){
                global $cfg_secureAccess;
                global $cfg_basehost;
                header("location: {$cfg_secureAccess}{$cfg_basehost}/supplier/job/company_info.html");die;
            }
            //如果存在cid，尝试获取所有的信息
            $job_company_state = 0;
            if ($cid) {
                $handlers = new handlers("job", "companyDetail");
                $companyDetail = $handlers->getHandle();
                if ($companyDetail['state'] == 100) {
                    $companyDetail = $companyDetail['info'];
                    $job_company_state = (int)$companyDetail['state'];
                    foreach ($companyDetail as $key => $value) {
                        $huoniaoTag->assign("company_" . $key, $value);
                    }
                }
            }
            //投递未读消息
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `cid`=$cid and `u_read`=0 and `del`=0");
            $newDelivery = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("newDelivery", $job_company_state != 1 ? 0 : $newDelivery);
            //投递待处理
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `cid`=$cid and `state`=0 and `del`=0");
            $pendingDelivery = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("pendingDelivery", $job_company_state != 1 ? 0 : $pendingDelivery);
            //职位通知【审核通过、审核拒绝等】
            $sql = $dsql::SetQuery("select count(*) from `#@__job_message` where `uid`=$userid and `read`=0");
            $postMessage = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("postMessage", $postMessage);
            //系统消息
            $sql = $dsql::SetQuery("SELECT count(log.`id`) FROM `#@__member_letter_log` log LEFT JOIN `#@__member_letter` l ON l.`id` = log.`lid` WHERE log.`uid` = $userid AND log.`state` = '0' ORDER BY log.`id` DESC");
            $systemMessage = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("systemMessage", $systemMessage);
            //投递的简历【所有】
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `cid`=$cid and `del`=0");
            $deliveryUserCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("deliveryUserCount", $job_company_state != 1 ? 0 : $deliveryUserCount);
            //面试的简历【所有】
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `cid`=$cid");
            $invitationUserCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("invitationUserCount", $job_company_state != 1 ? 0 : $invitationUserCount);
            //已下载简历统计
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume_download` where `cid`=$cid and `del`=0");
            $resumeDownUserCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("resumeDownUserCount", $job_company_state != 1 ? 0 : $resumeDownUserCount);
            //收藏的简历【所有】
            $sql = $dsql::SetQuery("SELECT count(*) FROM `#@__member_collect` c left join `#@__job_resume` r on c.`aid`=r.`id` WHERE c.`module` = 'job' AND c.`action` = 'resume' AND c.`userid` = '$userid' and r.`id` is not null");
            $collectResumeCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("collectResumeCount", $job_company_state != 1 ? 0 : $collectResumeCount);
            //浏览简历统计
            $sql = $dsql::SetQuery("SELECT count(*) FROM `#@__job_historyclick` c left join `#@__job_resume` r on c.`aid`=r.`id` WHERE c.`module` = 'job' AND c.`module2` = 'resumeDetail' AND c.`uid` = '$userid' and r.`id` is not null");
            $clickResumeCount = (int)$dsql->getOne($sql);
            $huoniaoTag->assign("clickResumeCount", $job_company_state != 1 ? 0 : $clickResumeCount);
            //首页
            if ($template == "index" || $template == "job") {
                $detailHandels = new handlers("job", "managerCount");
                $detailConfig  = $detailHandels->getHandle();
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    $huoniaoTag->assign("managerCount", $detailConfig);
                }
                //总投递、今日投递
                $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where cid=$cid and `del`=0 and `date`>".strtotime(date("Y-m-d 00:00:00")));
                $jobDeliveryCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("jobDeliveryCount", $jobDeliveryCount);
                $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where cid=$cid and `del`=0");
                $jobDeliveryDayCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("jobDeliveryDayCount", $jobDeliveryDayCount);
                //总面试、今日面试
                $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where cid=$cid and `pubdate`>".strtotime(date("Y-m-d 00:00:00")));
                $jobInvitationCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("jobInvitationCount", $jobInvitationCount);
                $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where cid=$cid");
                $jobInvitationDayCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("jobInvitationDayCount", $jobInvitationDayCount);
                //昨日对我感兴趣、今日对我感兴趣
                $jobs = $dsql->getArr($dsql::SetQuery("select `id` from `#@__job_post` where `company`=$cid and `del`=0"));
                if(empty($jobs)){
                    $collectSql = $dsql::SetQuery("select 'collect' as 'type','company' as 'contentType',c.`aid`,c.`userid`,c.`pubdate` 'date' from `#@__member_collect` c where c.`module`='job' and (c.`action`='company' and c.`aid`=$cid)");
                    $clickSql = $dsql::SetQuery("select 'click' as 'type','company' as 'contentType',h.`aid`,h.`uid` 'userid',h.`date` from `#@__job_historyclick` h where h.`module`='job' and (h.`module2`='companyDetail' and h.`aid`=$cid)");
                }else{
                    $jobs = join(",",$jobs);
                    $collectSql = $dsql::SetQuery("select 'collect' as 'type',(case when `action`='company' then 'company' else 'job' end ) as 'contentType',c.`aid`,c.`userid`,c.`pubdate` 'date' from `#@__member_collect` c where c.`module`='job' and ((c.`action`='company' and c.`aid`=$cid) or (c.`action`='job' and c.`aid` in ($jobs)))");
                    $clickSql = $dsql::SetQuery("select 'click' as 'type',(case when `module2`='companyDetail' then 'company' else 'job' end) as 'contentType',h.`aid`,h.`uid` 'userid',h.`date` from `#@__job_historyclick` h where h.`module`='job' and ((h.`module2`='postDetail' and h.`aid` in($jobs)) or (h.`module2`='companyDetail' and h.`aid`=$cid))");
                }
                $allSql = "SELECT count(*) FROM (".$collectSql." UNION ALL ".$clickSql.") t";
                $allSql1 = $allSql." left join ".$dsql::SetQuery("`#@__job_resume`")." r on t.`userid`=r.`userid` where r.`default`=1 and r.`private`=0 and r.`state`=1 and r.`del`=0 and r.`id` is not null and t.`date`>".(strtotime(date("Y-m-d 00:00:00"))-86400)." and t.`date`<".(strtotime(date("Y-m-d 23:59:59"))-86400)." order by t.`date` desc";
                $allSql2 = $allSql." left join ".$dsql::SetQuery("`#@__job_resume`")." r on t.`userid`=r.`userid` where r.`default`=1 and r.`private`=0 and r.`state`=1 and r.`del`=0 and r.`id` is not null and t.`date`>".(strtotime(date("Y-m-d 00:00:00")))." and t.`date`<".(strtotime(date("Y-m-d 23:59:59")))." order by t.`date` desc";
                $yesterdayDateInterest = (int)$dsql->getOne($allSql1);
                $todayDateInterest = (int)$dsql->getOne($allSql2);
                $huoniaoTag->assign("yesterdayDateInterest",$yesterdayDateInterest);
                $huoniaoTag->assign("todayDateInterest",$todayDateInterest);
                //近一周更新n份简历
                $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `update_time`>".(strtotime(date("Y-m-d 00:00:00"))-7*86400));
                $weekUpdateResumeCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("weekUpdateResumeCount", $weekUpdateResumeCount);
            }
            //公司信息
            elseif ($template == "company_info") {
            }
            //人才库
            elseif ($template == "personList") {
                $detailHandels = new handlers("job", "getItem");
                $detailConfig  = $detailHandels->getHandle(array("name" => "education,experience,startWork,jobNature"));
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    $huoniaoTag->assign("jobItems", $detailConfig);
                }
            }
            //职位管理
            elseif ($template == "postManage") {
            }
            //简历
            elseif ($template == "resumeManage") {
                $detailHandels = new handlers("job", "companyDetail");
                $detailConfig  = $detailHandels->getHandle(array("id" => $cid));
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    foreach ($detailConfig as $detailKey => $detailVal){
                        $huoniaoTag->assign("detail_".$detailKey, $detailVal);
                    }
                }
                //简历收藏
                if ($_GET['type'] == 1) {
                }
                //简历管理
                else {
                }
            }
            //招聘日程
            elseif ($template == "interviewManage") {
                $detailHandels = new handlers("job", "companyDetail");
                $detailConfig  = $detailHandels->getHandle(array("id" => $cid));
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    foreach ($detailConfig as $detailKey => $detailVal){
                        $huoniaoTag->assign("detail_".$detailKey, $detailVal);
                    }
                }
                //今日待面试的数量
                if($cid){
                    $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `cid`=$cid and `state`=1 and `date`>".time()." and `date`<".strtotime(date("Y-m-d 23:59:59")));
                    $huoniaoTag->assign("currentDayInterview",(int)$dsql->getOne($sql));
                }else{
                    $huoniaoTag->assign("currentDayInterview",0);
                }
            }
            //招聘会
            elseif ($template == "jobfairList") {
            }
            //增值包、套餐
            elseif ($template == "jobmeal") {
                $detailHandels = new handlers("job", "companyDetail");
                $detailConfig  = $detailHandels->getHandle(array("id" => $cid));
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    foreach ($detailConfig as $detailKey => $detailVal){
                        $huoniaoTag->assign("detail_".$detailKey, $detailVal);
                    }
                }
                //增值包
                if ($_GET['tab'] == 1) {
                }
                //招聘套餐
                else {
                }
            }
            //设置
            elseif($template=="setting"){
                $logintime = $dsql->getOne($dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`=29 order by `id` desc limit 1"));
                $huoniaoTag->assign("logintime",$logintime);
            }
        }
        //原楼盘业务
        elseif ($partner == "loupan") {

            $loupansql = $dsql->SetQuery("SELECT `id`,`litpic`,`title`,`deliverdate`,`views`,`salestate`,`fenxiaotitle`,`fenxiaotime` FROM `#@__house_loupan` WHERE `manageuid` = '$userid' AND `state` = 1");

            $loupanres = $dsql->dsqlOper($loupansql, "results");

            if (!$loupanres) {
                echo '<script>alert("您没有可管理楼盘!");location.href="' . $cfg_secureAccess . $cfg_basehost . '/u"</script>';  //请先配置商家信息！
                die;
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/u");
                //            header("location:".$cfg_secureAccess.$cfg_basehost);
            }
            $loupanid = (int)$loupanres[0]['id'];

            $loupandetail = $loupanres[0];
            $huoniaoTag->assign('title', $loupandetail['title']);
            $huoniaoTag->assign('fenxiaotitle', $loupandetail['fenxiaotitle']);
            $huoniaoTag->assign('fenxiaotime', $loupandetail['fenxiaotime'] ? date('Y-m-d H:i:s', $loupandetail['fenxiaotime']) : '');
            $huoniaoTag->assign('loupanid', $loupanid);

            $detailHandels = new handlers("house", "loupanDetail");
            $detailConfig = $detailHandels->getHandle($loupanid);


            $litpic = getFilePath($loupanres[0]['litpic']);

            $huoniaoTag->assign('litpic', $litpic);
            $huoniaoTag->assign('views', $loupanres[0]['views']);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                if (is_array($detailConfig)) {
                    if ($partner == 'loupan') {

                        /*足迹浏览量*/
                        $zujicountsql = $dsql->SetQuery("SELECT `id` FROM `#@__house_historyclick` WHERE  `module` = 'house' AND `module2` = 'loupanDetail' AND `aid` = '$loupanid'");

                        $countclick = $dsql->dsqlOper($zujicountsql, "totalCount");

                        $huoniaoTag->assign('countclick', $countclick);

                        $salestatestr = '';
                        switch ($loupandetail['salestate']) {
                            case 0:
                                $salestatestr = '新盘待售';
                                break;
                            case 1:
                                $salestatestr = '在售';
                                break;
                            case 2:
                                $salestatestr = '尾盘';
                                break;
                            case 3:
                                $salestatestr = '售磬';
                                break;
                        }
                        $huoniaoTag->assign('salestate', $salestatestr);

                        $param = array(
                            "service" => "house",
                            "template" => "loupan-detail",
                            "id" => $loupanid
                        );
                        $loupanurl = getUrlPath($param);

                        $huoniaoTag->assign('loupanurl', $loupanurl);

                        $huoniaoTag->assign('deliverdate', date('Y-m-d', $loupandetail['deliverdate']));


                        /*资讯动态*/
                        $loupannewssql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupannews` WHERE  `loupan`  = '$loupanid'");

                        $loupannewsres = $dsql->dsqlOper($loupannewssql, "totalCount");

                        $huoniaoTag->assign('oupannews', (int)$loupannewsres);

                        /*销售顾问*/

                        $gwsql = $dsql->SetQuery("SELECT g.`id` FROM `#@__house_gw` g LEFT JOIN `#@__member` m ON m.`id` = g.`userid` WHERE m.`id` IS NOT NULL AND g.`loupanid` = '$loupanid'");

                        $gwcount = $dsql->dsqlOper($gwsql, "totalCount");

                        $huoniaoTag->assign('gwcount', (int)$gwcount);


                        /*意向客户*/

                        $yxsql = $dsql->SetQuery(" SELECT * FROM (SELECT t.`id`, t.`uid`,t.`name`,t.`phone`,t.`state`,t.`pubdate`,'huodong' type, 'loupan' action  FROM `#@__house_loupantuan` t WHERE  t.`aid` = '$loupanid' UNION ALL SELECT  n.`id`, n.`uid`,n.`name`,n.`phone`,n.`state`,n.`pubdate`,n.`type`, n.`action` FROM `#@__house_notice` n WHERE n.`action` = 'loupan' AND  n.`aid` = '$loupanid') as tn");
                        $yxcount = $dsql->dsqlOper($yxsql, "totalCount", 'ASSOC', NULL, 0);

                        $huoniaoTag->assign('yxcount', (int)$yxcount);

                        /*分销报备*/

                        $fenxiaosql = $dsql->SetQuery("SELECT `id` FROM `#@__house_fenxiaobb` WHERE `lid`= '$loupanid'");

                        //总条数
                        $fenxiaocount = $dsql->dsqlOper($fenxiaosql, "totalCount");

                        $huoniaoTag->assign('fenxiaocount', (int)$fenxiaocount);

                        //                    echo "<pre>";
                        //                    var_dump($detailConfig);die;
                        //输出详细信息
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_' . $key, $value);
                        }

                        if ($template == 'base_info' || $template == 'ba<x>se_info') {

                            $archives = $dsql->SetQuery("SELECT `typename`,`id` FROM `#@__houseitem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
                            $results = $dsql->dsqlOper($archives, "results");
                            $protypeval = array();

                            if ($results) {
                                $protypeval = $results;
                            }

                            $huoniaoTag->assign('protypelist', json_encode($protypeval, true));
                        } elseif ($template == 'detail_info') {
                            $archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
                            $results = $dsql->dsqlOper($archives, "results");
                            $list = array();
                            foreach ($results as $value) {
                                array_push($list, $value['typename']);
                            }
                            $huoniaoTag->assign('buildlist', $list);

                            $archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
                            $results = $dsql->dsqlOper($archives, "results");
                            $list = array(0 => '请选择');
                            foreach ($results as $value) {
                                $list[$value['id']] = $value['typename'];
                            }
                            $huoniaoTag->assign('zhuangxiuList', $list);
                        }

                        if ($subordinate == 'albums-detail') {

                            //                        if(!$id){
                            //                            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                            //                        }


                            if ($id) {
                                $huoniaoTag->assign('albumid', (int)$id);
                                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_album` WHERE `id` = " . $id);
                                $results = $dsql->dsqlOper($archives, "results");

                                if (empty($results)) {
                                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                                }

                                $title = $results[0]['title'];
                                $weight = $results[0]['weight'];
                                $huoniaoTag->assign('title', $title);
                                //图表信息
                                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = " . $id . " ORDER BY `id` ASC");
                                $results = $dsql->dsqlOper($archives, "results");

                                if (!empty($results)) {
                                    $imglist = array();
                                    foreach ($results as $key => $value) {
                                        $imglist[$key]["path"] = $value["picPath"];
                                        $imglist[$key]["id"] = $value["id"];
                                        $imglist[$key]["pathsour"] = getFilePath($value["picPath"]);
                                        $imglist[$key]["info"] = $value["picInfo"];
                                    }
                                }
                                $huoniaoTag->assign('imglist', $imglist ? json_encode($imglist, true) : '');
                            }
                        } elseif ($subordinate == 'add_huxing') {
                            //                        if(!$id){
                            //                            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                            //                        }

                            //                        if($id){

                            $huoniaoTag->assign('id', $id);
                            $detailHandels = new handlers('house', "apartmentDetail");
                            $detailConfig = $detailHandels->getHandle($id);
                            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                                $detailConfig = $detailConfig['info'];
                                if (is_array($detailConfig)) {
                                    //输出详细信息
                                    foreach ($detailConfig as $key => $value) {
                                        $huoniaoTag->assign('hx_' . $key, $value);
                                    }
                                }
                            }
                            //                        }
                        } elseif ($subordinate == 'add_article') {

                            //                        if($id){

                            $huoniaoTag->assign('id', $id);
                            $detailHandels = new handlers('house', "loupanNewsDetail");
                            $detailConfig = $detailHandels->getHandle($id);
                            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                                $detailConfig = $detailConfig['info'][0];
                                if (is_array($detailConfig)) {
                                    //输出详细信息
                                    foreach ($detailConfig as $key => $value) {
                                        $huoniaoTag->assign('at_' . $key, $value);
                                    }
                                }
                            }
                            //                        }
                        } elseif ($subordinate == 'shapan') {

                            $loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE `id` = " . $loupanid);
                            $loupanResult = $dsql->getTypeName($loupanSql);
                            if (!$loupanResult) die('楼盘不存在！');
                            $huoniaoTag->assign('loupaname', $loupanResult[0]['title']);

                            //获取该楼盘的户型数据
                            $apartment = array();
                            $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = $loupanid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if($ret){
                                $apartment = $ret;
                            }
                            $huoniaoTag->assign('apartment', $apartment);

                            $sql = $dsql->SetQuery("SELECT `litpic`, `data` FROM `#@__house_shapan` WHERE `loupan` = $loupanid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $ret = $ret[0];
                                $huoniaoTag->assign('litpic', $ret['litpic']);

                                $dataArr = unserialize($ret['data']);
                                foreach($dataArr as $k => $v){
                                    $dataArr[$k]['apartment'] = explode(',', $v['apartment']);
                                }
                                
                                $huoniaoTag->assign('data', $dataArr);
                            }
                        } elseif ($subordinate == 'add_adviser') {

                            $gwlist = array();
                            if ($id) {
                                //                            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                                $huoniaoTag->assign('aid', (int)$id);

                                $archives = $dsql->SetQuery("SELECT g.* FROM `#@__house_gw` g LEFT JOIN  `#@__member` m ON  g.`userid` = m.`id` WHERE g.`id` = " . $id);
                                $results = $dsql->dsqlOper($archives, "results");

                                $gwlist = array();
                                if (!empty($results)) {
                                    $gwlist = $results;

                                    $uinfo = $userLogin->getMemberInfo($gwlist[0]['userid']);
                                    $gwlist[0]['username'] = $gwlist[0]['name'] ? $gwlist[0]['name'] : $uinfo['nickname'];
                                    $gwlist[0]['photo'] = $gwlist[0]['photo'] ? $gwlist[0]['photo'] : $uinfo['photo'];
                                    $gwlist[0]['phone'] = $gwlist[0]['phone'] ? $gwlist[0]['phone'] : $uinfo['phone'];
                                }
                            }
                            $huoniaoTag->assign('gwlist', $gwlist ? json_encode($gwlist, true) : '');
                        } elseif ($subordinate == 'add_huodong') {

                            //                        if(!$id){
                            //                            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                            //                        }
                            $loupansql = $dsql->SetQuery("SELECT * FROM `#@__house_huodong` WHERE 1=1 AND `id`  = '$id'");

                            $results = $dsql->dsqlOper($loupansql, "results");

                            $huodonglist = array();
                            if (!empty($results)) {
                                $huodonglist = $results[0];
                            }
                            $huoniaoTag->assign('huodonglist', $huodonglist);
                        }
                    }
                }
            }
        }
    }


    /*员工认证*/
    if ($action == 'addStaff') {
        if (empty($sid)) {
            echo '<script>alert("参数错误");location.href="' . $cfg_secureAccess, $cfg_basehost . '"</script>';  //请先配置商家信息！
            die;
        }
        if ($userid < 0) {
            /*记录商家添加员工*/
            global $cfg_onlinetime;
            PutCookie('addStaff', $sid, $cfg_onlinetime * 60 * 60);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/register.html");
            die;
        } else {
            if ($userinfo['userType'] == 2) {

                echo '<script>alert("现已是企业会员,暂不可绑定");location.href="' . $cfg_secureAccess, $cfg_basehost . '"</script>';  //请先配置商家信息！
                die;
            } else {
                $staffsql = $dsql->SetQuery("SELECT `id` FROM `#@__staff` WHERE `uid` = '$userid'");

                $staffres = $dsql->dsqlOper($staffsql, "results");

                if ($staffres && is_array($staffres)) {
                    echo '<script>alert("现已是店铺员工,暂不可绑定");location.href="' . $cfg_secureAccess, $cfg_basehost . '"</script>';  //请先配置商家信息！
                    die;
                }

                /*查询有无商家*/
                $businseesql = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__business_list` WHERE `id` = '$sid'");

                $businessres = $dsql->dsqlOper($businseesql, "results");

                if (empty($businessres) && is_array($businessres)) {
                    echo '<script>alert("未找到该商家");location.href="' . $cfg_secureAccess, $cfg_basehost . '"</script>';  //请先配置商家信息！
                    die;
                }

                $storetitle = $businessres[0]['title'];

                $nowtime = GetMkTime(time());

                $upstaffsql = $dsql->SetQuery("INSERT INTO `#@__staff` (`sid`,`uid`,`pubdate`)VALUES ('$sid','$userid','$nowtime')");

                $upstaffres = $dsql->dsqlOper($upstaffsql, "update");

                if ($upstaffres == 'ok') {

                    $param = array(
                        'service' => 'member',
                        'type'    => 'user'
                    );
                    global $cfg_onlinetime;
                    PutCookie('is_staffsuccess', 1, $cfg_onlinetime * 60 * 60);
                    PutCookie('storetitle', "您已成为" . $storetitle . "员工", $cfg_onlinetime * 60 * 60);
                    DropCookie('addStaff');
                    header("location:" . getUrlPath($param));
                    die;
                } else {
                    echo '<script>alert("添加员工失败！请联系管理员");location.href="' . $cfg_secureAccess, $cfg_basehost . '"</script>';  //请先配置商家信息！
                    die;
                }
            }
            /*查詢該用戶是否綁定店鋪或者是否是店鋪管理員*/
        }
    } elseif ($action == 'workPlatform') {
        /*员工工作台*/

        $userLogin->checkUserIsLogin();
        // if($userid < 0){
        //     header("location:/?service=waimai&do=courier&template=login");
        //     die;
        // }

        if ($userinfo['staffid']) {
            $staffHandlers = new handlers("business", "staffDetail");
            $staffConfig   = $staffHandlers->getHandle($userinfo['staffid']);
            if (is_array($staffConfig) && $staffConfig['state'] == 100) {
                $staffConfig = $staffConfig['info'];
                if (empty($staffConfig['auth']['shop']) && empty($staffConfig['auth']['tuan']) && empty($staffConfig['auth']['huodong']) && empty($staffConfig['auth']['travel'])) {
                    echo '<script>alert("暂无权限!");location.href="' . $cfg_secureAccess, $cfg_basehost . '/u"</script>';  //请先配置商家信息！
                    die;
                }
                if (is_array($staffConfig)) {
                    foreach ($staffConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                }
            } else {
                header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
                die;
            }
        }


        /*
         * 分店
         */
        $userid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT t.`id`branchid,t.`title`, t.`tel`, t.`qq`, t.`address`,t.`project`,y.`typename`industry,t.`qq`,t.`wechatcode`,s.`title`stitle,t.`people`,t.`logo` FROM `#@__shop_store` s RIGHT JOIN `#@__shop_branch_store` t ON t.`branchid` = s.`id` LEFT JOIN `#@__shop_type` y ON t.`industry` = y.`id` WHERE s.`userid` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        $branch = 0;
        if ($ret) {
            $branch = 1;
        }
        $huoniaoTag->assign('branchtitle', $ret[0]['title']);
        $huoniaoTag->assign('branchtel', $ret[0]['tel']);
        $huoniaoTag->assign('branchlogo', getFilePath($ret[0]['logo']));
        $huoniaoTag->assign('branchpeople', $ret[0]['people']);
        $huoniaoTag->assign('branchaddress', $ret[0]['address']);
        $huoniaoTag->assign('branchproject', $ret[0]['project']);
        $huoniaoTag->assign('branchindustry', $ret[0]['industry']);
        $huoniaoTag->assign('branchqq', $ret[0]['qq']);
        $huoniaoTag->assign('branchwechatcode', $ret[0]['wechatcode']);
        $huoniaoTag->assign('stitle', $ret[0]['stitle']);
        $huoniaoTag->assign('branchid', $ret[0]['branchid']);
        $huoniaoTag->assign('branch', $branch);
        $huoniaoTag->assign('ret', $ret);
    } elseif ($action == 'shop_branch_detail') {
        /*
         * 分店
         */
        $userid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT t.`id`branchid,t.`title`, t.`tel`, t.`qq`, t.`address`,t.`project`,y.`typename`industry,t.`qq`,t.`wechatcode`,s.`title`stitle,t.`people`,t.`logo` FROM `#@__shop_store` s LEFT JOIN `#@__shop_branch_store` t ON t.`branchid` = s.`id` LEFT JOIN `#@__shop_type` y ON t.`industry` = y.`id` WHERE t.`id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        $branch = 0;
        if ($ret) {
            $branch = 1;
        }
        $huoniaoTag->assign('branchtitle', $ret[0]['title']);
        $huoniaoTag->assign('branchtel', $ret[0]['tel']);
        $huoniaoTag->assign('branchlogo', getFilePath($ret[0]['logo']));
        $huoniaoTag->assign('branchpeople', $ret[0]['people']);
        $huoniaoTag->assign('branchaddress', $ret[0]['address']);
        $huoniaoTag->assign('branchproject', $ret[0]['project']);
        $huoniaoTag->assign('branchindustry', $ret[0]['industry']);
        $huoniaoTag->assign('branchqq', $ret[0]['qq']);
        $huoniaoTag->assign('branchwechatcode', $ret[0]['wechatcode']);
        $huoniaoTag->assign('stitle', $ret[0]['stitle']);
        $huoniaoTag->assign('branchid', $ret[0]['branchid']);
        $huoniaoTag->assign('branch', $branch);
    }


    /*商城个人页*/

    if ($action == 'index_shop') {
        $userid = $userLogin->getMemberID();
        $shopsort = array();
        $quan =  array();
        //查询会员是否已经是会员
        $sql = $dsql->SetQuery("SELECT `level`, `expired`,`addr`, `cityid` FROM `#@__member` WHERE `id` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $_level = $ret[0]['level'];
            // 查询该等级特权-赠送平台券
            $authSql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = $_level");
            $authRet = $dsql->dsqlOper($authSql, "results");
            $authCfg = unserialize($authRet[0]['privilege']);
            if ($authCfg) {
                array_push($shopsort, $authCfg['shop']);
                array_push($quan, $authCfg['quan'][0]['num']);
                $shoplevel = $shopsort ? min($shopsort) : 0;
                $quanstate = $quan ? max($quan) : 0;
                $huoniaoTag->assign('shoplevel', $shoplevel);
                $huoniaoTag->assign('quanstate', $quanstate);
            } else {
                $authSql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE 1 = 1 ");
                $authRet = $dsql->dsqlOper($authSql, "results");
                foreach ($authRet as $kk => $vv) {
                    $pri = unserialize($vv['privilege']);
                    array_push($shopsort, $pri['shop']);
                    array_push($quan, $pri['quan'][0]['num']);
                }
                $shoplevel = $shopsort ? min($shopsort) : 0;
                $quanstate = $quan ? max($quan) : 0;
                $huoniaoTag->assign('shoplevel', $shoplevel);
                $huoniaoTag->assign('quanstate', $quanstate);
                $authCfg = unserialize($authRet[0]['privilege']);
            }
        }


        $cattime = GetMkTime(time());

        $cattime = $cattime + 3600 * 24 * 3;

        $datetime = GetMkTime(time());
        $proquansql  = $dsql->SetQuery("SELECT q.`id` FROM `#@__shop_order` o LEFT  JOIN `#@__shopquan` q ON o.`id` = q.`orderid` WHERE q.`expireddate` > $datetime AND q.`usedate` = 0 AND o.`userid` ='$userid' AND o.`protype` = 1 AND o.`orderstate` !=4 AND  o.`orderstate` !=7 AND o.`orderstate` != 10 ");

        $proquanres  = $dsql->dsqlOper($proquansql, "totalCount");

        $huoniaoTag->assign('proquanres', $proquanres);

        $datetime = GetMkTime(time());
        /*砍价*/
        $kanjiqsql = $dsql->Setquery("SELECT b.`gfinalmoney`,b.`gnowmoney`,b.`gmoney`,p.`title`,b.`enddate`,p.`litpic`,b.`id` FROM `#@__shop_bargaining` b LEFT JOIN `#@__shop_product` p ON b.`proid` = p.`id` LEFT  JOIN `#@__shop_huodongsign` h ON b.`hid` = h.`id` WHERE  h.`ktime` <= '$datetime' AND h.`etime` >= '$datetime' AND b.`userid` = '$uid'  AND b.`state` = 0 ORDER BY b.`pubdate`");

        $kanjiqres = $dsql->dsqlOper($kanjiqsql, "results");

        $kanjiaarr = array();

        if ($kanjiqres && is_array($kanjiqres)) {

            $kanjiaarr['gfinalmoney'] = $kanjiqres[0]['gfinalmoney'];
            $kanjiaarr['gnowmoney']   = $kanjiqres[0]['gnowmoney'];
            $kanjiaarr['gmoney']      = $kanjiqres[0]['gmoney'];
            $kanjiaarr['enddate']     = $kanjiqres[0]['enddate'];
            $kanjiaarr['title']       = $kanjiqres[0]['title'];
            $kanjiaarr['id']          = $kanjiqres[0]['id'];
            $kanjiaarr['litpic']      = $kanjiqres[0]['litpic'] != '' ? getFilePath($kanjiqres[0]['litpic']) : '';

            $param = array(
                'service'  => 'shop',
                'template' => 'bargain_detail',
                'id'       => $kanjiqres[0]['id']
            );

            $kanjiaarr['url']         = getUrlPath($param);
        }
        $huoniaoTag->assign('kanjiaarr', $kanjiaarr);
        /*拼团*/

        $time = GetMkTime(time());
        $pintuansql = $dsql->SetQuery("SELECT sp.`id` pid,sp.`people`,sp.`enddate`,p.`title`,p.`litpic`,p.`id`,h.`huodongnumber`,sp.`user` FROM `#@__shop_tuanpin` sp LEFT JOIN `#@__shop_product` p ON sp.`proid` = p.`id` LEFT JOIN `#@__shop_huodongsign` h ON sp.`hid` = h.`id` WHERE sp.`userid` = '$uid' AND sp.`state` = 1 AND sp.`enddate` > $time ORDER BY sp.`pubdate`");


        $pintuanres = $dsql->dsqlOper($pintuansql, "results");

        $pintuanarr = $userarrpic =  array();

        if ($pintuanres && is_array($pintuanres)) {

            $pintuanarr['pid']            = $pintuanres[0]['pid'];
            $pintuanarr['people']         = $pintuanres[0]['people'];
            $pintuanarr['huodongnumber']  = $pintuanres[0]['huodongnumber'];
            $pintuanarr['enddate']        = $pintuanres[0]['enddate'];
            $pintuanarr['user']           = $pintuanres[0]['user'];
            $pintuanarr['chanum']         = $pintuanres[0]['huodongnumber'] - $pintuanres[0]['people'];
            $pintuanarr['title']          = $pintuanres[0]['title'];
            $pintuanarr['litpic']         = $pintuanres[0]['litpic'] != '' ? getFilePath($pintuanres[0]['litpic']) : '';

            $param = array(
                'service'  => 'shop',
                'template' => 'detail',
                'id'       => $pintuanres[0]['id']
            );

            $param1 = array(
                'service'  => 'shop',
                'template' => 'dindan',
                'id'       => $pintuanres[0]['pid']
            );

            $pintuanarr['url']              = getUrlPath($param);
            $pintuanarr['orderurl']         = getUrlPath($param1);

            $userarr = $pintuanres[0]['user'] != '' ? explode(',', $pintuanres[0]['user'])  : array();

            foreach ($userarr as $index => $item) {

                $usersql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE `id` = '$item'");

                $userres = $dsql->dsqlOper($usersql, "results");


                array_push($userarrpic, $userres[0]['photo'] != '' ? getFilePath($userres[0]['photo']) : '');
            }

            $pintuanarr['userarr'] = $userarrpic;
        }

        $huoniaoTag->assign('pintuanarr', $pintuanarr);

        /*店铺id*/
        $Sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE 1=1 AND `userid` = '$userid' ");
        $Res = $dsql->dsqlOper($Sql, "results");

        $huoniaoTag->assign('shopid', (int)$Res[0]['id']);

        /*
         * 分店
         */
        $sql = $dsql->SetQuery("SELECT t.`id`branchid,t.`title`, t.`tel`, t.`qq`, t.`address`,t.`project`,y.`typename`industry,t.`qq`,t.`wechatcode`,s.`title`stitle,t.`people`,t.`logo`,t.`branchid` storeid FROM `#@__shop_store` s LEFT JOIN `#@__shop_branch_store` t ON t.`branchid` = s.`id` LEFT JOIN `#@__shop_type` y ON t.`industry` = y.`id` WHERE t.`userid` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        $branch = 0;
        if ($ret) {
            $branch = 1;
        }
        $huoniaoTag->assign('branchtitle', $ret[0]['title']);
        $huoniaoTag->assign('branchtel', $ret[0]['tel']);
        $huoniaoTag->assign('branchlogo', getFilePath($ret[0]['logo']));
        $huoniaoTag->assign('branchpeople', $ret[0]['people']);
        $huoniaoTag->assign('branchaddress', $ret[0]['address']);
        $huoniaoTag->assign('branchproject', $ret[0]['project']);
        $huoniaoTag->assign('branchindustry', $ret[0]['industry']);
        $huoniaoTag->assign('branchqq', $ret[0]['qq']);
        $huoniaoTag->assign('branchwechatcode', $ret[0]['wechatcode']);
        $huoniaoTag->assign('stitle', $ret[0]['stitle']);
        $huoniaoTag->assign('branchid', $ret[0]['branchid']);
        $huoniaoTag->assign('storeid', $ret[0]['storeid']);
        $huoniaoTag->assign('branch', $branch);
    }
    //查询用户激励红包详情
    if ($action == 'reward_fabu') {

        $trueuid = $userLogin->getMemberID();
        $userinfo  = $userLogin->getMemberInfo($trueuid);
        $archives = $dsql->SetQuery("SELECT `id`,`hongbaoPrice`,`hongbaoCount`,`rewardPrice`,`rewardCount`,`status`,`hasSetjili` FROM `#@__infolist` WHERE `id` = '$id'");
        $res = $dsql->dsqlOper($archives, "results");
        $huoniaoTag->assign('hongbaoPrice', $res[0]['hongbaoPrice']);
        $huoniaoTag->assign('hongbaoCount', $res[0]['hongbaoCount']);
        $huoniaoTag->assign('rewardPrice', $res[0]['rewardPrice']);
        $huoniaoTag->assign('id', $res[0]['id']);
        $huoniaoTag->assign('rewardCount', $res[0]['rewardCount']);
        $huoniaoTag->assign('hasSetjili', $res[0]['hasSetjili']);

        include(HUONIAOROOT . "/include/config/info.inc.php");
        $status = explode(',', $custom_excitation);
        $hongbao = $status[0];
        //        $bao     =$status[1];
        $bao = $custom_excitation;
        $huoniaoTag->assign('hongbao', $hongbao);
        $huoniaoTag->assign('bao', $bao);
        $huoniaoTag->assign('userinfo', $userinfo);
        $huoniaoTag->assign('cfg_cost', $cfg_cost ? $cfg_cost : 0);
    }
    if ($action == 'logistics') {
        if ($oid) {

            $ordersql = $dsql->SetQuery("SELECT o.`store`,o.`exp_track`,o.`address`,o.`people`,o.`exp_company`,o.`exp_number`,o.`contact`,o.`exp_date`,o.`shipping`,o.`orderdate`,o.`paydate`,o.`confirmdate`,o.`orderstate` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE o.`id` = '$oid'");
            $orderres = $dsql->dsqlOper($ordersql, "results");

            $shop_storeid = (int)$orderres[0]['store'];
            foreach ($orderres[0] as $key => $value) {

                if ($key == 'exp_track') {

                    $huoniaoTag->assign('exp_track', $value);
                } elseif ($key == 'exp_company') {

                    $huoniaoTag->assign('exp_company', $value);
                } elseif ($key == 'exp_number') {

                    $huoniaoTag->assign('exp_number', $value);
                } elseif ($key == 'exp_date') {

                    $huoniaoTag->assign('exp_date', $value);
                } else {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }

            $results = $orderres[0];
            $expTrack = $results["exp_track"];
            if ((!$expTrack || $expTrack == 'a:0:{}') && ($results["orderstate"] == 3 || $results["orderstate"] == 4 || $results["orderstate"] == 6 || $results["orderstate"] == 7) && $results["exp_company"] != 'else') {

                //顺丰快递必须添加收或寄件人手机尾号4位(单号:4位手机号)。例如：SF12345678:0123
                if ($results["exp_company"] == 'sf') {
                    $sql = $dsql->SetQuery("SELECT `contact` FROM `#@__shop_store` WHERE `id` = '$shop_storeid'");
                    $store_contact = $dsql->getOne($sql); 
                    $results["exp_number"] = $results["exp_number"] . ':' . substr($store_contact, -4);
                }

                $expTrack = getExpressTrack($results["exp_company"], $results["exp_number"], 'shop_order', $oid);
            }
            $expTrack = $expTrack ? unserialize($expTrack) : array();

            $huoniaoTag->assign('expTrack', $expTrack);
        } else {
            header('location:' . $cfg_secureAccess . $cfg_basehost . '/404.html');
            die;
        }
    }

    if ($action == 'shop') {
        //入驻审核开关
        include HUONIAOINC . "/config/shop.inc.php";
        $huoniaoTag->assign('editModuleJoinCheck', $customEditJoinCheck);

        if ($userid == -1) {
            $furl = urlencode($cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html?furl=" . $furl);
        }
        $huoniaoTag->assign('hotline', $customHotline);
        $shopSql = $dsql->SetQuery("SELECT `id`,`state` FROM `#@__shop_store` WHERE 1=1 AND `userid` = '$userid'");
        $shopRes = $dsql->dsqlOper($shopSql, "results");
        if ($shopRes) {

            $id = $shopRes[0]['id'];
            $storeState = $shopRes[0]['state'];
            $Sql = $dsql->SetQuery("SELECT `id`,`title`,`logo`,`state`,`shoptype`,`refuse` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$id' ");
            $Res = $dsql->dsqlOper($Sql, "results");
            if ($Res) {

                if ((int)$Res[0]['shoptype'] == 0) {
                    $param = array(
                        "service" => "member",
                        "template" => "config-shop",
                    );
                    header("location:" . getUrlPath($param));
                }

                $huoniaoTag->assign('shopname', $Res[0]['title']);
                $huoniaoTag->assign('storeState', $storeState);
                $huoniaoTag->assign('storeRefuse', $Res[0]['refuse']);
                $huoniaoTag->assign('shopid', (int)$id);
                $huoniaoTag->assign('state', (int)$Res[0]['state']);
                $huoniaoTag->assign('shoptypeshoptype', (int)$Res[0]['shoptype']);
                $huoniaoTag->assign('logo', getFilePath($Res[0]['logo']));

                $yesterdayk = strtotime(date('Y-m-d', strtotime('-1 day')));
                $yesterdaye = strtotime(date('Y-m-d 23:59:59', strtotime('-1 day')));

                $todayk = strtotime(date('Y-m-d'));
                $todaye = strtotime(date('Y-m-d 23:59:59'));

                /*今日 昨日 待支付 待确认 配送中 退款 订单*/
                $ordersql = $dsql->SetQuery("SELECT
                count(CASE WHEN `orderdate` > '$yesterdayk' AND `orderdate` <= '$yesterdaye' THEN `id` ELSE null END) as yesterdayorder,
                count(CASE WHEN `orderdate` > '$todayk' AND `orderdate` <= '$todaye' THEN `id` ELSE null END) as todayorder ,
                SUM(CASE WHEN `orderdate` > '$yesterdayk' AND `orderdate` <= '$yesterdaye' AND `paydate` > 0 THEN `amount` ELSE null END) as yesterdamoney ,
                SUM(CASE WHEN `orderdate` > '$todayk' AND `orderdate` <= '$todaye' AND `paydate` > 0 THEN `amount` ELSE null END) as todaymoney,
                count(CASE WHEN `orderstate` = 0 THEN `id` ELSE null END) as nopaycount,
                count(CASE WHEN `orderstate` = 1 AND `protype` = 0  AND 1 = (CASE	WHEN  `pinid` != 0 THEN CASE WHEN `pinstate` THEN 1 ELSE 0 END ELSE 1=1 END	) THEN `id` ELSE null END) as confirmedcount,
                count(CASE WHEN `orderstate` = 6 AND (((`exp_date` != 0 OR `peidate` != 0) OR `peisongid` != 0)) THEN `id` ELSE null END) as peisongcount
                FROM `#@__shop_order` WHERE 1=1 AND `store`  = '$id'");
                $orderres = $dsql->dsqlOper($ordersql, "results");

                $waituse = 0;
                $sql = $dsql->SetQuery("SELECT count(*) FROM (SELECT count(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shopquan` sq ON sq.`orderid` = o.`id` WHERE o.`store` = $id AND o.`protype` = 1 AND o.`orderstate` != 4 AND o.`orderstate` != 7 AND sq.`expireddate` > '$datetime' AND  o.`orderstate` != 10 AND sq.`usedate` = 0 GROUP BY o.`id`) as a");
                $waituse = (int)$dsql->getOne($sql);

                $tuikuancount = 0;
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE 1=1 AND `store`  = '$id'");
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    foreach ($results as $a => $b) {
                        // $sql = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__shop_order_product` WHERE `orderid` = " . $b['id'] . " AND (`ret_state` = 1 OR `ret_ok_date` !='')");
                        $sql = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__shop_order_product` WHERE `orderid` = " . $b['id'] . " AND `ret_state` = 1");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $tuikuancount += $ret[0]['id'];
                    }
                }
                $huoniaoTag->assign('yesterdayorder', $orderres ? (int)$orderres[0]['yesterdayorder'] : 0);                     //昨日订单
                $huoniaoTag->assign('todayorder', $orderres ? (int)$orderres[0]['todayorder'] : 0);                             //今日订单
                $huoniaoTag->assign('yesterdamoney', $orderres ? sprintf('%.2f', $orderres[0]['yesterdamoney']) : 0);    //昨日成交
                $huoniaoTag->assign('todaymoney', $orderres ? sprintf('%.2f', $orderres[0]['todaymoney']) : 0);          //今日成交
                $huoniaoTag->assign('nopaycount', $orderres ? (int)$orderres[0]['nopaycount'] : 0);                             //待支付
                $huoniaoTag->assign('confirmedcount', $orderres ? (int)$orderres[0]['confirmedcount'] : 0);                     //待确认
                $huoniaoTag->assign('waituse', $waituse);                     //待使用
                $huoniaoTag->assign('peisongcount', $orderres ? (int)$orderres[0]['peisongcount'] : 0);                         //配送中
                //                $huoniaoTag->assign('tuikuancount', (int)$orderres[0]['tuikuancount']);                         //退款
                $huoniaoTag->assign('tuikuancount', (int)$tuikuancount);                         //退款
                /*昨日今日访问量*/
                $clickSql = $dsql->SetQuery("SELECT
                count(CASE WHEN `date` > '$yesterdayk' AND `date` <= '$yesterdaye' THEN k.`id` ELSE null END) as yesterdayclick,
                count(CASE WHEN `date` > '$todayk' AND `date` <= '$todaye' THEN k.`id` ELSE null END) as todayclick
                FROM `#@__shop_historyclick` k LEFT JOIN  `#@__shop_product` t ON k.`aid` = t.`id` WHERE 1=1 AND t.`store`  = '$id' AND `module2` = 'detail'");
                $clickRes = $dsql->dsqlOper($clickSql, "results");

                $huoniaoTag->assign('yesterdayclick', $clickRes ? (int)$clickRes[0]['yesterdayclick'] : 0);                     //今日访问量
                $huoniaoTag->assign('todayclick', $clickRes ? (int)$clickRes[0]['todayclick'] : 0);                             //昨日访问量

            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
            }
        } else {
            $param = array(
                "service" => "member",
                "template" => "config-shop",
            );
            header("location:" . getUrlPath($param));
            die;
        }
    }
    global $template;
    if (empty($smarty)) return;

    if (!isset($return))
        $return = 'row'; //返回的变量数组名

    //注册一个block的索引，照顾smarty的版本
    if (method_exists($smarty, 'get_template_vars')) {
        $_bindex = $smarty->get_template_vars('_bindex');
    } else {
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if (!$_bindex) {
        $_bindex = array();
    }

    if ($return) {
        if (!isset($_bindex[$return])) {
            $_bindex[$return] = 1;
        } else {
            $_bindex[$return]++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

    //对象$smarty上注册一个数组以供block使用
    if (!isset($smarty->block_data)) {
        $smarty->block_data = array();
    }

    //得一个本区块的专属数据存储空间
    $dataindex = md5(__FUNCTION__ . md5(serialize($params)));
    $dataindex = substr($dataindex, 0, 16);

    //使用$smarty->block_data[$dataindex]来存储
    if (!$smarty->block_data[$dataindex]) {
        //取得指定动作名
        $moduleHandels = new handlers($service, $action);
        $moduleReturn  = $moduleHandels->getHandle($params);
        if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';

        $moduleReturn  = $moduleReturn['info'];  //返回数据

        $pageInfo_ = $moduleReturn['pageInfo'];
        if ($pageInfo_) {

            //如果有分页数据则提取list键
            $moduleReturn  = $moduleReturn['list'];

            //把pageInfo定义为global变量
            global $pageInfo;
            $pageInfo = $pageInfo_;

            $smarty->assign("pageInfo", $pageInfo);
        }

        $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据
        reset($smarty->block_data[$dataindex]);
    }

    //果没有数据，直接返回null,不必再执行了
    if (!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    if ($action == "type") {
        //print_r($smarty->block_data[$dataindex]);die;
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if (list($key, $item) = each($smarty->block_data[$dataindex])) {
        $smarty->assign($return, $item);
        $repeat = true;
    }

    //如果已经到达最后，重置数组指针，重复执行开关置位0
    if (!$item) {
        reset($smarty->block_data[$dataindex]);
        $repeat = false;
    }

    //打印内容
    print $content;
}
