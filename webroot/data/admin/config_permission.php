<?php
/**
 * 后台所有功能（同时用于导航条、功能搜索、权限设置）
 *
 * @version        $Id: config_permission.php 2013-12-29 下午22:07:19 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
$Payconfig= $dsql->dsqlOper($configPay, "results");
$bonusPayname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';

$menuData[0] = array(
    'menuName' => '系统',
    'menuId' => 'siteConfig',
    'subMenu' => array(
        0 => array(
            'menuName' => '基本设置',
            'subMenu' => array(
                0 => array(
                    'menuName' => '系统基本参数',
                    'menuUrl' => 'siteConfig.php',
                    'menuInfo' => '站点基本信息、综合首页风格、附件存储设置、计量单位、水印广告位置、会员中心展示、聚合数据（身份证识别、快递查询、归属地查询）、客服及聊天系统配置',
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '用户中心DIY',
                            'menuMark' => 'userCenterDiy'
                        )
                    )
                ) ,
                1 => array(
                    'menuName' => '网站安全设置',
                    'menuUrl' => 'siteSafe.php',
                    'menuInfo' => '配置系统安全信息，保留域名设置、IP访问限制、会员注册开关、敏感词过滤、验证码设置、安全相关设置、用户交互设置、发布内容审核、通讯加密等'
                ) ,
                2 => array(
                    'menuName' => '城市分站管理',
                    'menuUrl' => 'siteCity.php',
                    'menuInfo' => '开通多城市功能，个性化城市设置、城市商圈配置',
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '高级设置',
                            'menuMark' => 'siteCityAdvanced'
                        )
                    )
                ) ,
                3 => array(
                    'menuName' => '支付方式设置',
                    'menuUrl' => 'sitePayment.php',
                    'menuInfo' => '支付方式配置，如：微信支付、支付宝支付、充值卡支付等'
                ) ,
                4 => array(
                    'menuName' => '计划任务管理',
                    'menuUrl' => 'siteCron.php',
                    'menuInfo' => '计划任务是一项使系统在规定时间自动执行某些特定任务的功能，在需要的情况下，您也可以方便的将其用于站点功能的扩展。<br />计划任务是与系统核心紧密关联的功能特性，不当的设置可能造成站点功能的隐患，严重时可能导致站点无法正常运行，因此请务必仅在您对计划任务特性十分了解，并明确知道正在做什么、有什么样后果的时候才自行添加或修改任务项目。<br />此处和其他功能不同，本功能中完全按照站点系统默认时差对时间进行设定和显示，而不会依据某一用户或管理员的时差设定而改变显示或设置的时间值。'
                ) ,
                5 => array(
                    'menuName' => '操作日志管理',
                    'menuUrl' => 'siteLogs.php',
                    'menuInfo' => '网站管理员后台操作记录',
                    'city' => 1
                ) ,
                6 => array(
                    'menuName' => '网站地区设置',
                    'menuUrl' => 'siteAddr.php',
                    'menuInfo' => '配置网站常用地区信息，主要用于会员基本资料、收货地址等'
                ) ,
                7 => array(
                    'menuName' => '公交地铁设置',
                    'menuUrl' => 'siteSubway.php',
                    'menuInfo' => '配置城市地铁交通站点名称，主要用于团购、房产等模块'
                ) ,
                8 => array(
                    'menuName' => '国际区号管理',
                    'menuUrl' => 'sitePhoneAreaCode.php',
                    'menuInfo' => '配置系统支持的国家手机区号'
                ) ,
                9 => array(
                    'menuName' => '缓存优化配置',
                    'menuUrl' => 'siteCache.php',
                    'menuInfo' => 'Redis配置：提升程序性能和服务器的负载能力'
                ) ,
                10 => array(
                    'menuName' => '搜索优化配置',
                    'menuUrl' => 'elasticSearch.php',
                    'menuInfo' => 'Elasticsearch配置(es)：增强全站搜索能力，提升搜索效率'
                ),
                11 => array(
                    'menuName' => '清除页面缓存',
                    'menuUrl' => 'siteClearCache.php',
                    'menuInfo' => '自定义清除页面缓存文件'
                )
            )
        ) ,
        1 => array(
            'menuName' => '系统工具',
            'subMenu' => array(
                0 => array(
                    'menuName' => '系统模块管理',
                    'menuUrl' => 'moduleList.php',
                    'menuInfo' => '可对系统已安装模块卸载、启用、停用，也可安装官方提供的其它模块',
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '安装新模块',
                            'menuMark' => 'installMoudule'
                        ) ,
                        1 => array(
                            'menuName' => '修改模块',
                            'menuMark' => 'modifyMoudule'
                        ) ,
                        2 => array(
                            'menuName' => '卸载模块',
                            'menuMark' => 'uninstallMoudule'
                        )
                    )
                ) ,
                1 => array(
                    'menuName' => '生成静态页面',
                    'menuUrl' => 'createStaticPage.php',
                    'menuInfo' => '生成前台纯静态页面，提升页面打开速度'
                ) ,
                2 => array(
                    'menuName' => '模块域名管理',
                    'menuUrl' => 'siteModuleDomain.php',
                    'menuInfo' => '批量修改模块域名配置信息'
                ) ,
                3 => array(
                    'menuName' => '手机底部导航',
                    'menuUrl' => 'siteFooterBtn.php',
                    'menuInfo' => '自定义移动端各模块首页底部导航'
                ) ,
                4 => array(
                    'menuName' => 'DIY页面管理',
                    'menuUrl' => 'siteDiyConfig.php',
                    'menuInfo' => '自定义移动端页面模板'
                ) ,
                5 => array(
                    'menuName' => '消息通知配置',
                    'menuUrl' => 'siteNotify.php',
                    'menuInfo' => '管理站内信息提醒方式：如邮件、短信、微信公众号模板消息、网页即时消息通知、APP推送提醒'
                ) ,
                6 => array(
                    'menuName' => '商家域名管理',
                    'menuUrl' => 'siteBusinessDomain.php',
                    'menuInfo' => '批量管理商家域名配置信息',
                    'city' => 1
                ) ,
                7 => array(
                    'menuName' => '数据库内容替换',
                    'menuUrl' => 'dbReplace.php',
                    'menuInfo' => '可指定表、字段名进行替换操作操作'
                ) ,
                8 => array(
                    'menuName' => '执行SQL语句',
                    'menuUrl' => 'dbQuery.php',
                    'menuInfo' => '可针对每个数据表执行单行或者多行的SQL语句'
                ) ,
                9 => array(
                    'menuName' => '网站论坛整合',
                    'menuUrl' => 'siteBBS.php',
                    'menuInfo' => '支持Discuz!、PHPwind等论坛'
                ) ,
                10 => array(
                    'menuName' => '网站整合登录',
                    'menuUrl' => 'loginConnect.php',
                    'menuInfo' => '社交账号关联，如：微信登录、QQ登录、支付宝登录等'
                ) ,
                11 => array(
                    'menuName' => '网站附件管理',
                    'menuUrl' => 'siteFileManage.php',
                    'menuInfo' => '管理网站内上传的图片、视频、音频、文件等'
                )
            )
        ) ,
        2 => array(
            'menuName' => '其它设置',
            'subMenu' => array(
                0 => array(
                    'menuName' => '热门关键词管理',
                    'menuUrl' => 'hotKeywords.php',
                    'menuInfo' => '维护模块热门关键词',
                    'city' => 1
                ) ,
                1 => array(
                    'menuName' => '搜索关键词维护',
                    'menuUrl' => 'searchKeywords.php',
                    'menuInfo' => '维护网站搜索的关键词',
                    'city' => 1
                ) ,
                2 => array(
                    'menuName' => '单页文档管理',
                    'menuUrl' => 'siteSingel.php?action=singel',
                    'menuInfo' => '关于我们、联系我们、网站介绍等相关信息'
                ) ,
                3 => array(
                    'menuName' => '网站公告设置',
                    'menuUrl' => 'siteNotice.php',
                    'menuInfo' => '不同城市下平台的公告管理',
                    'city' => 1
                ) ,
                4 => array(
                    'menuName' => '帮助信息管理',
                    'menuUrl' => 'siteHelps.php',
                    'menuInfo' => '网站帮助、常见问题等维护'
                ) ,
                5 => array(
                    'menuName' => '网站协议管理',
                    'menuUrl' => 'siteSingel.php?action=agree',
                    'menuInfo' => '隐私政策协议、会员注册协议、充值提现协议、现金积分兑换等相关协议'
                ) ,
                6 => array(
                    'menuName' => '网站广告设置',
                    'menuUrl' => 'advList.php?action=siteConfig',
                    'menuInfo' => '管理网站大首页及公共页面的所有广告',
                    'city' => 1
                ) ,
                7 => array(
                    'menuName' => '首页友情链接',
                    'menuUrl' => 'friendLink.php?action=siteConfig',
                    'menuInfo' => '网站大首页友情链接',
                    'city' => 1
                ) ,
                8 => array(
                    'menuName' => '举报管理',
                    'menuUrl' => 'siteComplain.php',
                    'menuInfo' => '管理网站所有举报信息。',
                    'city' => 1
                ),
                9 => array(
                    'menuName' => '意见反馈管理',
                    'menuUrl' => 'suggestion.php',
                    'menuInfo' => '管理网站所有意见反馈信息。',
                    'city' => 1
                ),
                10 => array(
                    'menuName' => '用户投诉',
                    'menuUrl' => 'member/memberComplaintsList.php',
                    'menuInfo' => '用户投诉信息',
                )
            )
        ) ,
        3 => array(
            'menuName' => '邮件系统',
            'subMenu' => array(
                0 => array(
                    'menuName' => '邮箱账号管理',
                    'menuUrl' => 'emailAccount.php',
                    'menuInfo' => '管理系统发送邮件的帐号'
                ) ,
                2 => array(
                    'menuName' => '邮件发送日志',
                    'menuUrl' => 'siteMessageLog.php?action=email',
                    'menuInfo' => '邮件发送成功和失败的历史记录'
                ) ,
                3 => array(
                    'menuName' => '手动发送邮件',
                    'menuUrl' => 'siteSendMail.php',
                    'menuInfo' => '支持群发、可指定邮件标题、自定义邮件内容'
                )
            )
        ) ,
        4 => array(
            'menuName' => '短信系统',
            'subMenu' => array(
                0 => array(
                    'menuName' => '短信平台管理',
                    'menuUrl' => 'smsAccount.php',
                    'menuInfo' => '管理第三方短信发送渠道'
                ) ,
                2 => array(
                    'menuName' => '短信发送日志',
                    'menuUrl' => 'siteMessageLog.php?action=phone',
                    'menuInfo' => '短信发送成功和失败的历史记录'
                ) ,
                3 => array(
                    'menuName' => '发送手机短信',
                    'menuUrl' => 'smsSend.php',
                    'menuInfo' => '手动发送手机短信，支持群发'
                )
            )
        ) ,
        5 => array(
            'menuName' => '隐私保护通话',
            'subMenu' => array(
                0 => array(
                    'menuName' => '基本设置',
                    'menuUrl' => 'privatenumberConfig.php',
                    'menuInfo' => '设置隐私保护通话平台的APP_KEY、APP_SECRET、通话时长、话音文件及启用模块'
                ) ,
                1 => array(
                    'menuName' => '号码管理',
                    'menuUrl' => 'privatenumberList.php',
                    'menuInfo' => '管理系统正在使用的隐私保护通话的号码'
                ) ,
                2 => array(
                    'menuName' => '绑定记录',
                    'menuUrl' => 'privatenumberBind.php',
                    'menuInfo' => '查看系统所有的隐私保护通话号码的绑定记录'
                ) ,
                3 => array(
                    'menuName' => '呼叫记录',
                    'menuUrl' => 'privatenumberCall.php',
                    'menuInfo' => '查看系统所有的隐私保护通话号码的呼叫记录'
                )
            )
        ) ,
        6 => array(
            'menuName' => '付费查看电话',
            'subMenu' => array(
                0 => array(
                    'menuName' => '基本设置',
                    'menuUrl' => 'payPhoneConfig.php',
                    'menuInfo' => '设置付费查看电话功能开关、价格、权限等'
                ) ,
                1 => array(
                    'menuName' => '订单管理',
                    'menuUrl' => 'payPhoneOrder.php',
                    'menuInfo' => '管理付费查看电话的订单'
                )
            )
        )
    )
);
$menuData[1] = array(
    'menuName' => '用户',
    'menuId' => 'member',
    'subMenu' => array(
        0 => array(
            'menuName' => '用户管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '用户列表',
                    'menuUrl' => 'memberList.php',
                    'menuInfo' => '平台用户基本信息资料查看，如：会员类型、实名认证、用户资金、推荐关系等',
                    'city' => 1,
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '新增新用户',
                            'menuMark' => 'memberAdd',
                            'city' => 1
                        ) ,
                        1 => array(
                            'menuName' => '修改用户信息',
                            'menuMark' => 'memberEdit',
                            'city' => 1
                        ) ,
                        2 => array(
                            'menuName' => '删除用户',
                            'menuMark' => 'memberDel',
                            'city' => 1
                        ) ,
                        3 => array(
                            'menuName' => '用户积分管理',
                            'menuMark' => 'jfMember',
                            'city' => 1,
                            'menuChild' => array(
                                0 => array(
                                    'menuName' => '变动积分',
                                    'menuMark' => 'editjfMember',
                                    'city' => 1
                                ) ,
                                1 => array(
                                    'menuName' => '删除积分变动记录',
                                    'menuMark' => 'deljfMember',
                                    'city' => 1
                                )
                            )
                        ) ,
                        4 => array(
                            'menuName' => '帐户余额管理',
                            'menuMark' => 'moneyMember',
                            'city' => 1,
                            'menuChild' => array(
                                0 => array(
                                    'menuName' => '账户余额变动',
                                    'menuMark' => 'editMoneyMember',
                                    'city' => 1
                                ) ,
                                1 => array(
                                    'menuName' => '删除余额变动记录',
                                    'menuMark' => 'delMoneyMember',
                                    'city' => 1
                                )
                            )
                        ),
                        5 => array(
                            'menuName' => $bonusPayname . '余额管理',
                            'menuMark' => 'bonusMember',
                            'city' => 1,
                            'menuChild' => array(
                                0 => array(
                                    'menuName' => $bonusPayname . '余额变动',
                                    'menuMark' => 'editbonusMember',
                                    'city' => 1
                                ) ,
                                1 => array(
                                    'menuName' => '删除'. $bonusPayname .'变动记录',
                                    'menuMark' => 'delbonusMember',
                                    'city' => 1
                                )
                            )
                        ),
                        6 => array(
                            'menuName' => '保障金余额管理',
                            'menuMark' => 'promotionMember',
                            'city' => 1,
                            'menuChild' => array(
                                0 => array(
                                    'menuName' => '保障金余额变动',
                                    'menuMark' => 'editPromotionMember',
                                    'city' => 1
                                )
                            )
                        ) ,
                        7 => array(
                            'menuName' => '授权登录用户账号',
                            'menuMark' => 'authorizedLogin',
                            'city' => 1
                        )
                    )
                ) ,
                1 => array(
                    'menuName' => '消息管理',
                    'menuUrl' => 'memberLetter.php',
                    'menuInfo' => '系统发送的消息列表'
                ) ,
                2 => array(
                    'menuName' => '会员同步',
                    'menuUrl' => 'memberSync.php',
                    'menuInfo' => '论坛会员导入；需配置论坛整合'
                ) ,
                3 => array(
                    'menuName' => '消费排行',
                    'menuUrl' => 'memberStatistics.php',
                    'menuInfo' => '会员消费能力清单表',
                    'city' => 1
                ),
                4 => array(
                    'menuName' => '充值记录',
                    'menuUrl' => 'memberDepositLog.php',
                    'menuInfo' => '会员充值余额记录'
                ),
                5 => array(
                    'menuName' => '留言管理',
                    'menuUrl' => 'memberMessage.php',
                    'menuInfo' => '个人会员留言板内容管理'
                ),
                6 => array(
                    'menuName' => '登录记录',
                    'menuUrl' => 'memberLoginLog.php',
                    'menuInfo' => '站点会员登录信息表'
                ),
                7 => array(
                    'menuName' => '行为日志',
                    'menuUrl' => 'memberBehaviorLog.php',
                    'menuInfo' => '会员行为日志统计'
                ),
                8 => array(
                    'menuName' => '聊天记录',
                    'menuUrl' => 'memberImChat.php',
                    'menuInfo' => '会员聊天记录'
                )
            )
        ) ,
        1 => array(
            'menuName' => '用户等级',
            'subMenu' => array(
                0 => array(
                    'menuName' => '等级列表',
                    'menuUrl' => 'memberLevelList.php',
                    'menuInfo' => '会员等级名称及图示',
                ) ,
                1 => array(
                    'menuName' => '费用设置',
                    'menuUrl' => 'memberLevelCost.php',
                    'menuInfo' => '会员等级套餐设置'
                ) ,
                2 => array(
                    'menuName' => '特权设置',
                    'menuUrl' => 'memberLevelAuth.php',
                    'menuInfo' => '用户特权设置'
                ),
                3 => array(
                    'menuName' => '升级记录',
                    'menuUrl' => 'memberUpgradeLog.php',
                    'menuInfo' => '用户开通会员等级清单'
                )
            )
        ) ,
        2 => array(
            'menuName' => '超级管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '管理组',
                    'menuUrl' => 'adminGroup.php',
                    'menuInfo' => '设定管理员小组及小组所属权限',
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '添加管理组',
                            'menuMark' => 'addAdminGroup',
                        ) ,
                        1 => array(
                            'menuName' => '修改管理组',
                            'menuMark' => 'modifyAdminGroup',
                        ) ,
                        2 => array(
                            'menuName' => '删除管理组',
                            'menuMark' => 'delAdminGroup',
                        ) ,
                        3 => array(
                            'menuName' => '配置管理组权限',
                            'menuMark' => 'adminGroupPerm',
                        )
                    )
                ) ,
                1 => array(
                    'menuName' => '管理员列表',
                    'menuUrl' => 'adminList.php',
                    'menuInfo' => '查看管理员清单，进行资料维护和权限设置',
                    'city' => 1,
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '佣金统计',
                            'menuMark' => 'commissionAmount',
                        ),
                        1 => array(
                            'menuName' => '更新分站余额',
                            'menuMark' => 'updateCityAdminAmount',
                        )
                    )
                ) ,
                2 => array(
                    'menuName' => '添加管理员',
                    'menuUrl' => 'adminListAdd.php',
                    'menuInfo' => '添加系统管理员帐号',
                    'city' => 1
                )
            )
        ) ,
        3 => array(
            'menuName' => '分销系统',
            'subMenu' => array(
                0 => array(
                    'menuName' => '分销设置',
                    'menuUrl' => 'fenxiaoConfig.php',
                    'menuInfo' => '分销模式、分销等级、分销抽佣规则设置'
                ),
                1 => array(
                    'menuName' => '分销商',
                    'menuUrl' => 'fenxiaoUser.php',
                    'menuInfo' => '平台分销商申请信息及下线',
                    'city' => 1,
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '添加分销商权限',
                            'menuMark' => 'fenxiaoUserAdd',
                            'city' => 1
                        ) ,
                        1 => array(
                            'menuName' => '分销商审核权限',
                            'menuMark' => 'fenxiaoUserReview',
                            'city' => 1
                        ) ,
                        2 => array(
                            'menuName' => '分销商删除权限',
                            'menuMark' => 'fenxiaoUserDelete',
                            'city' => 1
                        )
                    )
                ),
                2 => array(
                    'menuName' => '海报管理',
                    'menuUrl' => 'fenxiaoPoster.php',
                    'menuInfo' => '分销商海报自定义'
                )
            )
        ),
        4 => array(
            'menuName' => '积分系统',
            'subMenu' => array(
                0 => array(
                    'menuName' => '积分设置',
                    'menuUrl' => 'pointsConfig.php',
                    'menuInfo' => '积分兑换比例、邀新奖励规则、消费返积分、积分抵扣的设置'
                )
            )
        ) ,
        5 => array(
            'menuName' => '签到系统',
            'subMenu' => array(
                0 => array(
                    'menuName' => '签到规则',
                    'menuUrl' => 'qiandaoConfig.php',
                    'menuInfo' => '签到功能设置及奖励配置'
                ) ,
                1 => array(
                    'menuName' => '签到记录',
                    'menuUrl' => 'qiandaoRecord.php',
                    'menuInfo' => '用户签到记录表',
                    'city' => 1
                )
            )
        ) 
    )
);

$moduleList = array();
$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name`, `subnav` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `parentid` != 0 ORDER BY `weight`");
$result = $dsql->dsqlOper($sql, "results");
if($result){
	foreach($result as $f_key => $f_val){
		$moduleList[$f_key]['menuName'] = $f_val['subject'] ? $f_val['subject'] : $f_val['title'];
		$moduleList[$f_key]['menuId'] = $f_val['name'];
		$moduleList[$f_key]['subMenu'] = objtoarr(json_decode($f_val['subnav']));
	}
}

$menuData[2] = array(
    'menuName' => '模块',
    'subMenu' => $moduleList
);


$menuData[3] = array(
    'menuName' => '财务',
    'menuId' => 'finance',
    'subMenu' => array(
        0 => array(
            'menuName' => '财务管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '平台收入',
                    'menuUrl' => 'platForm.php',
                    'menuInfo' => '统计平台收入明细'
                ) ,
                1 => array(
                    'menuName' => '分站收入',
                    'menuUrl' => 'commissionCount.php?gettype=substation',
                    'menuInfo' => '统计分站收入明细',
                    'city' => 1
                ) ,
                2 => array(
                    'menuName' => '分销商收入',
                    'menuUrl' => 'fenxiaoList.php',
                    'menuInfo' => '统计分销商收入明细',
                    'city' => 1
                ) ,
                3 => array(
                    'menuName' => '结算设置',
                    'menuUrl' => 'settlement.php',
                    'menuInfo' => '打赏结算、商家平台抽佣设置、分站抽佣设置、充值优惠设置、提现设置等'
                ) ,
                4 => array(
                    'menuName' => '提现管理',
                    'menuUrl' => 'withdraw.php',
                    'menuInfo' => '用户提现列表',
                    'menuChild' => array(
                        0 => array(
                            'menuName' => '提现审核权限',
                            'menuMark' => 'withdrawaudit',
                        ) ,
                        1 => array(
                            'menuName' => '提现打款权限',
                            'menuMark' => 'withdrawtransfer',
                        )
                    )
                ) ,
                5 => array(
                    'menuName' => '刷新置顶配置',
                    'menuUrl' => 'refreshTop.php',
                    'menuInfo' => '各模块的刷新置顶配置'
                ) ,
                6 => array(
                    'menuName' => '用户账单明细',
                    'menuUrl' => 'userPayLogs.php',
                    'menuInfo' => '用户收支记录表，可根据支付方式进行筛选',
                    'city' => 1
                ),
                7 => array(
                    'menuName' => '用户余额明细',
                    'menuUrl' => 'moneyLogs.php',
                    'menuInfo' => '用户余额消费记录表，可根据消费类型进行筛选',
                    'city' => 1
                ) ,
                8 => array(
                    'menuName' => '用户积分明细',
                    'menuUrl' => 'pointsLogs.php',
                    'menuInfo' => '用户积分使用记录',
                    'city' => 1
                ) ,
                9 => array(
                    'menuName' => $bonusPayname . '管理',
                    'menuUrl' => 'coupon.php',
                    'menuInfo' => $bonusPayname . '管理，生成' . $bonusPayname . '，查询' . $bonusPayname . '记录'
                ),
                10 => array(
                    'menuName' => $bonusPayname . '消费明细',
                    'menuUrl' => 'bonusLogs.php',
                    'menuInfo' => $bonusPayname . '消费使用记录',
                    'city' => 1
                ),
                11 => array(
                    'menuName' => '保障金记录',
                    'menuUrl' => 'bondLog.php',
                    'menuInfo' => '商户保障金缴纳记录',
                    'city' => 1
                ),
                12 => array(
                    'menuName' => '财务分账记录',
                    'menuUrl' => 'shareAllocation.php',
                    'menuInfo' => '微信服务商分账记录'
                ),
                13 => array(
                    'menuName' => '打赏礼物记录',
                    'menuUrl' => 'rewardLogs.php',
                    'menuInfo' => '用户打赏礼物记录',
                    'city' => 1
                ),
                14 => array(
                    'menuName' => '资金沉淀记录',
                    'menuUrl' => 'moneyPrecipitate.php',
                    'menuInfo' => '资金沉淀记录',
                    'city' => 1
                ),
                15 => array(
                    'menuName' => '配送员收入明细',
                    'menuUrl' => 'courierMoneyLogs.php',
                    'menuInfo' => '配送员收入明细记录',
                    'city' => 1
                ),
                16 => array(
                    'menuName' => '平台手续费明细',
                    'menuUrl' => 'ptChargeLogs.php',
                    'menuInfo' => '平台手续费明细',
                    'city' => 1
                )
            )
        )
    )
);


$menuData[4] = array(
    'menuName' => '微信',
    'menuId' => 'wechat',
    'subMenu' => array(
        0 => array(
            'menuName' => '微信管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '基本设置',
                    'menuUrl' => 'wechatConfig.php',
                    'menuInfo' => '微信公众号和小程序的基本信息填写'
                ) ,
                1 => array(
                    'menuName' => '用户管理',
                    'menuUrl' => 'wechatMember.php',
                    'menuInfo' => '同步微信公众号用户到后台'
                ) ,
                2 => array(
                    'menuName' => '菜单设置',
                    'menuUrl' => 'wechatMenu.php',
                    'menuInfo' => '微信公众号的自定义菜单配置',
                    'city' => 1
                ) ,
                3 => array(
                    'menuName' => '自动回复',
                    'menuUrl' => 'wechatAutoreply.php',
                    'menuInfo' => '微信公众号的自动回复配置',
                    'city' => 1
                ) ,
                4 => array(
                    'menuName' => '小程序码',
                    'menuUrl' => 'wxMiniProgramScene.php',
                    'menuInfo' => '查看后台自动生成的小程序码和创建小程序码'
                ) ,
                5 => array(
                    'menuName' => '推文助手',
                    'menuUrl' => 'wechatAssistant.php',
                    'menuInfo' => '一键复制信息，粘贴到公众平台图文素材编辑器内',
                    'city' => 1
                )
            )
        )
    )
);

$menuData[5] = array(
    'menuName' => '商家',
    'menuId' => 'business',
    'subMenu' => array(
        0 => array(
            'menuName' => '商家管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '商家列表',
                    'menuUrl' => 'businessList.php',
                    'menuInfo' => '新增和管理商家',
                    'city' => 1
                ) ,
                2 => array(
                    'menuName' => '入驻订单',
                    'menuUrl' => 'businessOrder.php',
                    'menuInfo' => '查看所有入驻商家的订单',
                    'city' => 1
                ),
                3 => array(
                    'menuName' => '商家介绍',
                    'menuUrl' => 'businessAbout.php',
                    'menuInfo' => '新增和管理商家介绍',
                    'city' => 1
                ) ,
                4 => array(
                    'menuName' => '商家动态',
                    'menuUrl' => 'businessNews.php',
                    'menuInfo' => '新增和管理商家动态',
                    'city' => 1
                ) ,
                5 => array(
                    'menuName' => '商家相册',
                    'menuUrl' => 'businessAlbums.php',
                    'menuInfo' => '新增和管理商家相册',
                    'city' => 1
                ) ,
                6 => array(
                    'menuName' => '商家视频',
                    'menuUrl' => 'businessVideo.php',
                    'menuInfo' => '新增和管理商家视频',
                    'city' => 1
                ) ,
                7 => array(
                    'menuName' => '商家全景',
                    'menuUrl' => 'businessPanor.php',
                    'menuInfo' => '新增和管理商家全景',
                    'city' => 1
                ) ,
                8 => array(
                    'menuName' => '商家点评',
                    'menuUrl' => 'businessComment.php',
                    'menuInfo' => '新增和管理对商家的评论',
                    'city' => 1
                ),
                10 =>array(
                    'menuName' => '员工账户',
                    'menuUrl' => 'employeeAccount.php',
                    'menuInfo' => '查看和删除员工信息，可以将员工数据导出',
                    'city' => 1
                ),
                9 => array(
                    'menuName' => '点餐打印机',
                    'menuUrl' => 'checkBusinessPrint.php',
                    'menuInfo' => '配置点餐打印机',
                    'city' => 1
                )
            )
        ),
        1 => array(
            'menuName' => '商家配置',
            'subMenu' => array(
                0 => array(
                    'menuName' => '基本配置',
                    'menuUrl' => 'businessConfig.php',
                    'menuInfo' => '配置商家相关的功能'
                ) ,
                2 => array(
                    'menuName' => '入驻配置',
                    'menuUrl' => 'businessJoinConfig.php',
                    'menuInfo' => '配置商家入驻套餐'
                ) ,
                3 => array(
                    'menuName' => '经营品类',
                    'menuUrl' => 'businessType.php',
                    'menuInfo' => '新增和管理商家入驻时选择的分类'
                ) ,
                4 => array(
                    'menuName' => '认证属性',
                    'menuUrl' => 'businessAuthAttr.php',
                    'menuInfo' => '新增和管理商家的认证属性'
                ) ,
                5 => array(
                    'menuName' => '广告管理',
                    'menuUrl' => 'siteConfig/advList.php?action=business',
                    'menuInfo' => '新增和管理广告位图片'
                ) ,
                6 => array(
                    'menuName' => '友情链接',
                    'menuUrl' => 'siteConfig/friendLink.php?action=business',
                    'menuInfo' => '新增和管理友情链接'
                ),
                7 => array(
                    'menuName' => '打印机管理',
                    'menuUrl' => 'businessPrinterList.php',
                    'menuInfo' => '配置店铺打印机',
                    'city' => 1
                )
            )
        ),
        2 => array(
            'menuName' => '订单管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '买单订单',
                    'menuUrl' => 'maiDanOrder.php',
                    'menuInfo' => '查看所有的买单订单数据，可以将买单订单数据导出',
                    'city' => 1
                ) ,
            )
        ),
    )
);

$menuData[6] = array(
    'menuName' => 'APP',
    'menuId' => 'app',
    'subMenu' => array(
        0 => array(
            'menuName' => 'APP管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => 'APP配置',
                    'menuUrl' => 'appConfig.php',
                    'menuInfo' => '和APP有关的功能配置'
                ),
                1 => array(
                    'menuName' => '推送配置',
                    'menuUrl' => 'pushConfig.php',
                    'menuInfo' => '配置阿里云移动推送'
                ),
            )
        )
    )
);

$menuData[7] = array(
    'menuName' => '插件',
    'menuId' => 'plugins',
    'subMenu' => array(
        0 => array(
            'menuName' => '插件管理',
            'subMenu' => array(
                0 => array(
                    'menuName' => '插件管理',
                    'menuUrl' => 'plugins.php',
                    'menuInfo' => '管理商店中安装的插件'
                )
            )
        )
    )
);

$menuData[8] = array(
    'menuName' => '商店',
    'menuId' => 'siteConfig',
    'subMenu' => array(
        0 => array(
            'menuName' => '火鸟商店',
            'subMenu' => array(
                0 => array(
                    'menuName' => '商店权限',
                    'menuUrl' => 'store.php',
                    'menuInfo' => '进入官方商店升级系统版本，安装模块和模板，并校验数据库和系统文件。'
                )
            )
        )
    )
);

