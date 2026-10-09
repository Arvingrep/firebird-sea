var moduleLink = [
  {
    listName: "汽车管理",
    code: "car",
    list: [
      {
        link: memberDomain + "/car.html",
        linkText: "汽车主页",
      },
      {
        homePage: "car",
        link: memberDomain + "/car.html",
        linkText: "店铺主页",
      },
      {
        link: memberDomain + "/manage-car.html",
        mini:"/pages/packages/mcenter/fabu/fabu?mold=car&code=1",
        linkText: "车源管理",
      },
      {
        link: memberDomain + "/carappoint.html",
        linkText: "客户管理",
      },
      {
        link: memberDomain + "/config-car.html",
        linkText: "店铺配置",
      },
      {
        link: memberDomain + "/car-broker.html",
        linkText: "顾问管理",
      },
      {
        link: businessUrl + "/servicemeal.html?mod=car",
        linkText: "会员续费",
      },
    ],
  },
  {
    listName: "婚嫁管理",
    code: "marry",
    list: [
      {
        link: businessUrl + "/marry.html",
        linkText: "婚嫁主页",
      },
      {
        homePage: "marry",
        link: businessUrl + "/config-marry.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/config-marry.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/marry-customer.html",
        linkText: "客户管理",
      },
      {
        link: businessUrl + "/marry-customer.html",
        linkText: "客户管理",
      },
      {
        link: businessUrl + "/marry-manage.html",
        linkText: "经营类别",
      },
      {
        link: businessUrl + "/marry-planmeal.html",
        linkText: "套餐管理",
      },
      {
        link: businessUrl + "/marry-plancase.html",
        linkText: "案例管理",
      },
      {
        link: businessUrl + "/config_marry_hotel.html",
        linkText: "酒店配置",
      },
      {
        link: businessUrl + "/marry-hotelfield.html",
        linkText: "婚宴场地",
      },
      {
        link: businessUrl + "/marry-hotelmenu.html",
        linkText: "婚宴菜单",
      },
    ],
  },
  {
    listName: "商城管理",
    code: "shop",
    list: [
      {
        link: businessUrl + "/shop.html",
        linkText: "商城主页",
      },
      {
        homePage: "shop",
        link: businessUrl + "/config-shop.html",
        linkText: "店铺主页",
        mini:'/pages/packages/shop/store-detail/store-detail',
        miniPath_code:"shop",
      },
      {
        link: businessUrl + "/config-shop.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/category-shop.html",
        linkText: "分类管理",
      },
      {
        link: businessUrl + "/manage-shop.html",
        mini:"/pages/packages/mcenter/bfabu/bfabu?mold=shop&code=1",
        linkText: "商品管理",
      },
      {
        link: businessUrl + "/order-shop.html",
        linkText: "订单管理",
      },
      {
        link: businessUrl + "/shop_huodong.html",
        linkText: "活动报名",
      },
      {
        link: businessUrl + "/verify-shop.html",
        linkText: "核销商品券",
      },
      {
        link: businessUrl + "/quan-shop.html",
        linkText: "优惠券管理",
      },
      {
        link: businessUrl + "/manage-shop-branch.html",
        linkText: "分店管理",
      },
      {
        link: businessUrl + "/logistic-shop.html",
        linkText: "运费模板",
      },
      {
        link: businessUrl + "/business-staff.html",
        linkText: "员工管理",
      },
      {
        link: businessUrl + "/config-shop_yingye.html",
        linkText: "营业信息",
      },
      {
        link: businessUrl + "/config-shop_album.html",
        linkText: "店铺相册",
      },
      {
        link: businessUrl + "/config-shop_adv.html",
        linkText: "主页广告",
      },
    ],
  },
  {
    listName: "资讯管理",
    code: "article",
    list: [
      {
        homePage: "article",
        link: masterDomain + "/article/mddetail?id=",
        linkText: "资讯主页",
        mini:'/pages/packages/article/mddetail/index',
        miniPath_code:"article",
      },
      {
        link: memberDomain + "/config-selfmedia.html",
        linkText: "入驻自媒体",
      },
      {
        link: memberDomain + "/manage-article.html",
        "mini":"/pages/packages/mcenter/fabu/fabu?mold=article&code=1",
        linkText: "资讯管理",
      },
      {
        link: memberDomain + "/fabu-article.html",
        linkText: "发布资讯",
      },
    ],
  },
  {
    listName: "房产管理",
    code: "house",
    list: [
      {
        link: businessUrl + "/house.html",
        linkText: "房产主页",
      },
      {
        homePage: "house",
        link: businessUrl + "/config-house.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/config-house.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/house-broker.html",
        linkText: "经纪人",
      },
      {
        link: businessUrl + "/house_receive_broker.html",
        linkText: "入驻申请",
      },
      {
        link: businessUrl + "/house_entrust.html",
        linkText: "房源委托",
      },
      {
        link: businessUrl + "/house_liulan.html",
        linkText: "浏览记录",
      },
    ],
  },
  {
    listName: "招聘管理",
    code: "job",
    list: [
      {
        link: masterDomain + "/supplier/job?appFullScreen=1",
        linkText: "招聘管理",
      },
      {
        link: masterDomain + "/job/company?id=",
        homePage: "job", //表示招聘主页
        mini:"/pages/packages/job/company/company",
        miniPath_code:'job',
        linkText: "招聘主页",
      },
      {
        link: masterDomain + "/supplier/job/company_info.html?appFullScreen",
        linkText: "招聘信息配置",
      },
      {
        link: masterDomain + "/supplier/job/postManage.html?appFullScreen",
        linkText: "职位管理",
      },
      {
        link: masterDomain + "/supplier/job/resumeManage.html",
        linkText: "简历管理",
      },
      {
        link: masterDomain + "/supplier/job/interviewManage.html?appFullScreen",
        linkText: "面试日程",
      },
      {
        link: masterDomain + "/supplier/job/jobfairList.html",
        linkText: "招聘会管理",
      },
      {
        link: masterDomain + "/supplier/job/jobaddrmange.html",
        linkText: "工作地址",
      },
      {
        link: job_channel + "/general",
        linkText: "普工招聘",
        mini:'/pages/packages/job/general/general',
        
      },
      {
        link: job_channel + "/talent?appFullScreen",
        linkText: "人才库",
        mini:'/pages/packages/job/talent/talent'
      },
    ],
  },
  {
    listName: "装修管理",
    code: "renovation",
    list: [
      {
        link: businessUrl + "/renovation.html",
        linkText: "装修主页",
      },
      {
        homePage: "renovation",
        link: businessUrl + "/config-renovation.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/config-renovation.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/renovation-honor.html",
        linkText: "店铺资质",
      },
      {
        link: businessUrl + "/renovation-dynamic.html",
        linkText: "店铺动态",
      },
      {
        link: businessUrl + "/renovation-zb.html",
        linkText: "招标管理",
      },
      {
        link: businessUrl + "/renovation-customer.html",
        linkText: "客户管理",
      },
      {
        link: businessUrl + "/team-renovation.html",
        linkText: "团队管理",
      },
      {
        link: businessUrl + "/renovation-case.html",
        linkText: "装修案例",
      },
      {
        link: businessUrl + "/albums-renovation.html",
        linkText: "效果图",
      },
      {
        link: businessUrl + "/renovation-site.html",
        linkText: "装修工地",
      },
    ],
  },
  {
    listName: "团购管理",
    code: "tuan",
    list: [
      {
        link: businessUrl + "/config-tuan.html",
        linkText: "团购配置",
      },
      {
        link: businessUrl + "/tuan.html",
        linkText: "团购主页",
      },
      {
        homePage: "tuan",
        link: businessUrl + "/config-tuan.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/manage-tuan.html",
        mini:"/pages/packages/mcenter/bfabu/bfabu?mold=tuan&code=1",
        linkText: "团购管理",
      },
      {
        link: businessUrl + "/verify-tuan.html",
        linkText: "团购核销券",
      },
      {
        link: businessUrl + "/quan-tuan.html",
        linkText: "核销记录",
      },
      {
        link: businessUrl + "/order-tuan.html",
        linkText: "团购订单",
      },
    ],
  },
  {
    listName: "交友管理",
    code: "dating",
    list: [
      {
        homePage: "dating",
        link: masterDomain + "/dating/store_detail-90.html",
        linkText: "交友主页",
      },
      {
        link: masterDomain + "/dating/store_hn.html",
        linkText: "交友红娘",
      },
      {
        link: masterDomain + "/store_income.html",
        linkText: "收入明细",
      },
      {
        link: masterDomain + "/dating/store_receiveapply.html",
        linkText: "会员申请",
      },
    ],
  },
  {
    listName: "旅游管理",
    code: "travel",
    list: [
      {
        link: memberDomain + "/travel",
        linkText: "旅游主页",
      },
      {
        homePage:"travel",
        link: businessUrl + "/config-travel.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/config-travel.html",
        linkText: "店铺配置",
      },
      {
        link: memberDomain + "/fabu-travel-strategy.html",
        linkText: "发布旅游攻略",
      },
      {
        link: memberDomain + "/travel_strategy.html",
        linkText: "旅游攻略",
      },
      {
        link: memberDomain + "/travel_video.html",
        linkText: "旅游视频",
      },
      {
        link: businessUrl + "/order-travel.html",
        linkText: "订单管理",
      },
      {
        link: businessUrl + "/travel-ticket.html",
        linkText: "景点门票",
      },
      {
        link: businessUrl + "/travel-agency.html",
        linkText: "周边游",
      },
      {
        link: businessUrl + "/travel-rentcar.html",
        linkText: "旅游租车",
      },
      {
        link: businessUrl + "/travel-visa.html",
        linkText: "旅游签证",
      },
      {
        link: businessUrl + "/travel-hotel.html",
        linkText: "旅游酒店",
      },
    ],
  },
  {
    listName: "教育管理",
    code: "education",
    list: [
      {
        link: memberDomain + "/education.html",
        linkText: "教育主页",
   
      },
      {
        homePage:"education",
        link: memberDomain + "/manage-education.html",
        mini:"/pages/packages/mcenter/bfabu/bfabu?mold=education&code=1",
        linkText: "店铺主页",
      },
      {
        link: memberDomain + "/manage-education.html",
        mini:"/pages/packages/mcenter/bfabu/bfabu?mold=education&code=1",
        linkText: "课程管理",
      },
      {
        link: memberDomain + "/education-order.html",
        "mini":"/pages/member/order/index?mod=education",
        linkText: "报名管理",
      },
      {
        link: businessUrl + "/config-education.html",
        linkText: "公司配置",
      },
      {
        link: businessUrl + "/education-teacher.html",
        linkText: "教师管理",
      },
    ],
  },
  {
    listName: "活动管理",
    code: "huodong",
    list: [
      {
        homePage: "huodong",
        link: masterDomain + "/business/huodong.html",
        linkText: "活动主页",
      },
      {
        link: masterDomain + "/huodong/fabu.html",
        linkText: "发布活动",
      },
      {
        link: memberDomain + "/manage-huodong.html",
        mini:"/pages/packages/mcenter/fabu/fabu?mold=huodong&code=1",
        linkText: "活动管理",
      },
    ],
  },
  {
    listName: "养老管理",
    code: "pension",
    list: [
      {
        link: businessUrl + "/pension.html",
        linkText: "养老主页",
      },
      {
        homePage: "pension",
        link: businessUrl + "/booking-pension.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/booking-pension.html",
        linkText: "预约管理",
      },
      {
        link: businessUrl + "/pension-award.html",
        linkText: "入住申请",
      },
      {
        link: businessUrl + "/config-pension.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/pension-invitation.html",
        linkText: "邀请管理",
      },
    ],
  },
  {
    listName: "商品拍卖",
    code: "paimai",
    list: [
      {
        homePage:"paimai",
        link: businessUrl + "/config-paimai.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/config-paimai.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/manage-paimai.html",
        mini:"/pages/packages/mcenter/bfabu/bfabu?mold=paimai&code=1",
        linkText: "商品管理",
      },
      {
        link: businessUrl + "/order-paimai.html",
        mini:"/pages/member/order/index/order?mod=paimai",
        linkText: "订单管理",
      },
    ],
  },
  {
    listName: "家政服务",
    code: "homemaking",
    list: [
      {
        link: businessUrl + "/config-homemaking.html",
        linkText: "店铺配置",
      },
      {
        link: businessUrl + "/homemaking.html",
        linkText: "家政主页",
      },
      {
        code: "homemaking",
        link: businessUrl + "/homemaking.html",
        linkText: "店铺主页",
      },
      {
        link: businessUrl + "/manage-homemaking.html",
        "mini":"/pages/packages/mcenter/bfabu/bfabu?mold=homemaking&code=1",
        linkText: "服务管理",
      },
      {
        link: businessUrl + "/homemaking-personal.html",
        linkText: "人员管理",
      },
      {
        link: businessUrl + "/order-homemaking.html",
        linkText: "订单管理",
      },
      {
        link: businessUrl + "/order-homemaking.html?state=1",
        linkText: "待确认订单",
      },
      {
        link: businessUrl + "/homemaking-nanny.html",
        linkText: "保姆/月嫂管理",
      },
      {
        link: businessUrl + "/fabu-homemaking-nanny.html",
        linkText: "新增保姆/月嫂",
      },
    ],
  },
  {
    listName: "视频直播",
    code: "live",
    list: [
      {
        link: memberDomain + "/live.html",
        linkText: "直播主页",
      },
      {
        link: memberDomain + "/fabu-live.html",
        linkText: "发布直播",
      },
      {
        link: memberDomain + "/manage-live.html",
        mini:"/pages/packages/mcenter/fabu/fabu?mold=live&code=1",
        linkText: "直播管理",
      },
    ],
  },
];
var linkListBox = [
  {
    listName: "商家/权限",
    list: [
      {
        link: masterDomain + "/business/detail.html",
        needId: true,
        linkText: "商家主页",
      },
      {
        link: businessUrl + "/business-staff.html",
        linkText: "员工管理",
      },
      {
        link: memberDomain + "/enter.html",
        linkText: "商家入驻",
      },
      {
        link: memberDomain + "/business-config.html",
        linkText: "商家信息",
      },
      {
        link: masterDomain + "/business/allComment.html",
        needId: true,
        linkText: "评价管理",
      },
      {
        link: businessUrl + "/checkout.html",
        linkText: "数据结算",
      },
      {
        link: memberDomain + "/pocket.html?dtype=0",
        linkText: "钱包",
      },
      {
        link: memberDomain + "/security-shCertify.html",
        linkText: "商家认证",
      },
      {
        link: memberDomain + "/withdraw.html",
        linkText: "申请提现",
      },
      {
        link: memberDomain + "/enter_contrast.html",
        linkText: "商家套餐与服务",
      },
      {
        link: businessUrl + "/servicemeal.html",
        linkText: "我的商家套餐",
      },
      {
        link: businessUrl + "/enter-order.html",
        linkText: "商家开通记录",
      },
    ],
  },
  {
    listName: "个人中心",
    list: [
      {
        link: memberDomain + '/?currentPageOpen=1&appFullScreen=1&appIndex=1',
        linkText: "切换个人版",
        mini:'/pages/member/index/index',
      },
      {
        link: memberDomain + "/upgrade.html",
        linkText: "VIP中心",
      },
      {
        link: masterDomain + "/user",
        linkText: "个人中心",
      },
      {
        link: memberDomain + "/profile.html",
        linkText: "个人资料",
        mini:'/pages/member/profile/index',
      },
      {
        link: memberDomain + "/setting.html",
        linkText: "系统设置",
      },
      {
        link: memberDomain + "/qiandao",
        linkText: "签到",
      },
      {
        link: masterDomain + "/integral",
        linkText: "积分商城",
      },
      {
        link: memberDomain + "/pocket.html?dtype=0",
        linkText: "账户余额",
      },
      {
        link: memberDomain + "/record.html",
        linkText: "余额明细",
      },
      {
        link: memberDomain + "/pocket.html?dtype=1",
        linkText: "我的积分",
      },
      {
        link: memberDomain + "/myquan",
        linkText: "我的优惠券",
      },
      {
        link: memberDomain + "/consume",
        linkText: "购物卡余额",
      },
      {
        link: memberDomain + "/deposit.html?paytype=deposit",
        linkText: "余额充值",
      },
      {
        link: memberDomain + "/recharge.html",
        linkText: "购物卡充值",
      },
      {
        link: memberDomain + "/collect.html",
        linkText: "我的收藏",
      },
      {
        link: memberDomain + "/manage.html",
        mini:"/pages/packages/mcenter/fabu/fabu",
        linkText: "我的发布",
      },
      {
        link: memberDomain + "/history.html",
        linkText: "历史浏览",
      },
      {
        link: masterDomain + "/user/29/fans",
        linkText: "我的粉丝",
      },
      {
        link: masterDomain + "/user/29/follow",
        linkText: "我的关注",
      },
      {
        link: memberDomain + "/im/commt_list.html#zan",
        linkText: "我的获赞",
      },
      {
        link: memberDomain + "/message.html",
        linkText: "我的消息",
        mini:'/pages/member/message/index',
      },
      {
        link: memberDomain + "/fabuJoin_touch_popup_3.4.html",
        linkText: "快捷发布",
      },
      {
        link: memberDomain,
        linkText: "我的",
      },
      {
        link: masterDomain + "/shop/cart.html",
        linkText: "购物车",
        mini:'/pages/packages/shop/cart/cart'
      },
      {
        link: memberDomain + "/orderlist.html?state=1",
        "mini":"/pages/member/order/index?state=1",
        linkText: "待付款",
      },
      {
        link: memberDomain + "/orderlist.html?state=2",
        "mini":"/pages/member/order/index?state=2",
        linkText: "待使用",
      },
      {
        link: memberDomain + "/orderlist.html?state=3",
        "mini":"/pages/member/order/index?state=3",
        linkText: "待发货",
      },
      {
        link: memberDomain + "/orderlist.html?state=4",
        "mini":"/pages/member/order/index?state=4",
        linkText: "待收货",
      },
      {
        link: memberDomain + "/orderlist.html?state=5",
        "mini":"/pages/member/order/index?state=5",
        linkText: "待评价",
      },
      {
        link: memberDomain + "/orderlist.html?state=6",
        "mini":"/pages/member/order/index?state=6",
        linkText: "待分享",
      },
      {
        link: memberDomain + "/orderlist.html?state=7",
        "mini":"/pages/member/order/index?state=7",
        linkText: "退款售后",
      },
      {
        link: memberDomain + "/orderlist.html",
        "mini":"/pages/member/order/index",
        linkText: "个人订单(全部)",
      },
      {
        "link":memberDomain + "/order.html",
        "mini":"/pages/packages/mcenter/order/order",
        "linkText":"订单列表(汇总)"
      },
      {
        link: memberDomain + "/address.html",
        linkText: "收货地址管理",
      },
      {
        link: memberDomain + "/quan.html",
        linkText: "待兑券码",
      },
      {
        link: memberDomain + "/invite.html",
        linkText: "邀新有礼",
      },
      {
        link: memberDomain + "/fenxiao.html",
        linkText: "分销",
      },
      {
        link: memberDomain + "/reward.html",
        linkText: "打赏收益",
      },
      {
        link: memberDomain + "/security.html",
        linkText: "安全中心",
      },
      {
        link: masterDomain + "/mobile.html",
        linkText: "下载APP",
      },
      {
        link: "tel:" + hotLine,
        linkText: "官方客服",
      },
    ],
  },
];

var allModels = [
  {
    "noVIPInd": '',
    "compsArr": [
        {
            "id": 30,
            "sid": "busiInfo_1723540294231",
            "typename": "busiInfo",
            "text": "会员信息",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "themeType": "light",
                "bgType": "image",
                "style": {
                    "bgID": "",
                    "bgColor": "#FFFFFF",
                    "bgImage": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/bg_10.png",
                    "bgHeight": 600,
                    "marginLeft": 20
                },
                "business": {
                    "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_white.png",
                    "link": memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
                    "text": "个人版",
                    "linkInfo": {
                        "linkText": "切换个人版",
                        "type": 1
                    }
                },
                "rtBtns": {
                    "btns": [
                        {
                            "id": "scan1723540415479",
                            "text": "扫码",
                            "icon": masterDomain + "/static/images/admin/siteConfigPage/scanDefault.png",
                            "link": "",
                            "linkInfo": {
                                "type": 2,
                                "linkText": "扫码"
                            }
                        },
                        {
                            "id": 1723540424661,
                            "text": "",
                            "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_set1.png",
                            "link":memberDomain + "/setting.html",
                            "linkInfo": {
                                "linkText": "系统设置",
                                "selfSetTel": 0,
                                "type": 1,
                                "name": "",
                                "id": "other_1_17255038004",
                                "homePage": "",
                                "needId": false
                            }
                        }
                    ],
                    "txtStyle": 0
                },
                "rightInfo": {
                    "btnStyle": 3,
                    "btn": {
                        "style": {
                            "textColor": "#ffffff",
                            "btnBgColor": "",
                            "bordeColor": "",
                            "borderSize": ""
                        },
                        "text": "我的主页",
                        "icon":masterDomain + "/static/images/admin/siteConfigPage/hom_icon.png",
                        "link":masterDomain + "/business/detail.html",
                        "linkInfo": {
                            "linkText": "商家主页",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_0_17255038000",
                            "homePage": "",
                            "needId": true
                        }
                    }
                },
                "showHeader": 1,
                "link": masterDomain + "/business/detail.html",
                "linkInfo": {
                    "linkText": "商家主页",
                    "selfSetTel": 0,
                    "type": 1,
                    "name": "",
                    "id": "other_0_17255038000",
                    "homePage": "",
                    "needId": true
                }
            }
        },
        {
            "id": 32,
            "sid": "dataCount_1723540450033",
            "typename": "dataCount",
            "text": "数据组",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "numSet": {
                    "id": 1,
                    "numShow": [
                        {
                            "id": 1,
                            "text": "余额",
                            "num": "0",
                            "showText": "余额",
                            "link": memberDomain + '/pocket'
                        },
                        {
                            "id": 2,
                            "text": "积分",
                            "num": "0",
                            "showText": "积分",
                            "link": memberDomain + '/pocket?dtype=1'
                        },
                        {
                            "id": 6,
                            "text": "今日客流",
                            "num": "0",
                            "showText": "今日客流"
                        }
                    ],
                    "style": {
                        "numColor": "#ffffff",
                        "textColor": "#ffffff",
                        "bgColor": "",
                        "bordeColor": "",
                        "borderSize": "",
                        "borderRadiusTop": 24,
                        "borderRadiusBottom": 24,
                        "paddingLeft": 30,
                        "marginLeft": 30,
                        "marginTop": 0
                    },
                    "txtDefine": false
                },
                "splitLine": 0,
                "title": {
                    "show": false,
                    "text": "数据概况",
                    "style": {
                        "color": "#000000"
                    }
                },
                "more": {
                    "text": "查看更多",
                    "arr": 0,
                    "show": false,
                    "link": "",
                    "linkInfo": {
                        "linkText": "",
                        "type": ""
                    },
                    "style": {
                        "color": "#a1a7b3"
                    }
                }
            }
        },
        {
            "id": 31,
            "sid": "order_1724306036417",
            "typename": "order",
            "text": "订单管理",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "title": {
                    "show": true,
                    "text": "商城订单",
                    "style": {
                        "color": "#333333"
                    }
                },
                "more": {
                    "text": "全部",
                    "arr": false,
                    "show": true,
                    "link":businessUrl + "/order-shop.html",
                    "linkInfo": {
                        "linkText": "订单管理",
                        "selfSetTel": 0,
                        "type": 1,
                        "name": "",
                        "id": "link_shop_17255038005",
                        "homePage": "",
                        "needId": false
                    },
                    "style": {
                        "color": "#a1a7b3"
                    }
                },
                "styletype": 2,
                "orderInfo": {
                    "code": "shop",
                    "title": "商城",
                    "ajax": "/include/ajax.php?service=shop&action=orderList&store=1&page=1&pageSize=1",
                    "showData": [
                        {
                            "id": 2,
                            "text": "待付款",
                            "link":businessUrl + "/order-shop.html?state=0",
                            "param": "unpaid",
                            "icon": "",
                            "numShow": 10,
                            "style": {
                                "color": "#333333"
                            },
                            "linkInfo": {
                                "type": 1,
                                "linkText": "待付款"
                            }
                        },
                        {
                            "id": 4,
                            "text": "待发货",
                            "link":businessUrl + "/order-shop.html?state=1",
                            "param": "ongoing",
                            "icon": "",
                            "numShow": 10,
                            "style": {
                                "color": "#333333"
                            },
                            "linkInfo": {
                                "type": 1,
                                "linkText": "待发货"
                            }
                        },
                        {
                            "id": 5,
                            "text": "配送中",
                            "link":businessUrl + "/order-shop.html?state=6,2",
                            "param": "recei2",
                            "icon": "",
                            "numShow": 10,
                            "style": {
                                "color": "#333333"
                            },
                            "linkInfo": {
                                "type": 1,
                                "linkText": "配送中"
                            }
                        },
                        
                        {
                            "id": 6,
                            "text": "退款售后",
                            "link":businessUrl + "/refundlist_shop.html",
                            "param": "refunded",
                            "icon": "",
                            "numShow": 10,
                            "style": {
                                "color": "#333333"
                            },
                            "linkInfo": {
                                "type": 1,
                                "linkText": "退款售后"
                            }
                        },
                        {
                            "id": 3,
                            "text": "待售后",
                            "link":businessUrl + "/order-shop.html?state=6,3",
                            "param": "unused",
                            "icon": "",
                            "numShow": 10,
                            "style": {
                                "color": "#E30404"
                            },
                            "linkInfo": {
                                "type": 1,
                                "linkText": "待使用"
                            }
                        }
                    ]
                },
                "style": {
                    "textColor": "#333333",
                    "labColor": "#FF3419",
                    "iconSize": 80,
                    "borderRadiusTop": 24,
                    "borderRadiusBottom": 0,
                    "marginTop": 20,
                    "marginLeft": 0,
                    "paddingLeft": 20
                }
            }
        },
        
        {
            "id": 20,
            "sid": "msg_1724306228347",
            "typename": "msg",
            "text": "消息通知",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "title": {
                    "text": "通知",
                    "image": "",
                    "type": "text",
                    "style": {
                        "color": "#FE6A19"
                    }
                },
                "msgType": 1,
                "listShow": 10,
                "listArr": [
                    {
                        "link": "",
                        "text": "",
                        "linkInfo": {
                            "lineText": "",
                            "type": 1
                        }
                    }
                ],
                "splitLine": 0,
                "style": {
                    "textColor": "#192233",
                    "bgColor": "#F5F6FA",
                    "opacity": 100,
                    "borderRadiusTop": 20,
                    "borderRadiusBottom": 20,
                    "borderColor": "",
                    "borderSize": "",
                    "marginTop": 22,
                    "marginLeft": 30,
                    "height": 80,
                    "splitLine": "",
                    "paddingLeft": 0
                }
            }
        },
        {
          "id": 33,
          "sid": "busiVip_1723540891975",
          "typename": "busiVip",
          "text": "商家会员",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "styletype": 2,
              "vipShow": 1,
              "setInfo": {
                  "noVip": {
                      "imgPath": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip1.png",
                      "link":memberDomain + "/enter_contrast.html",
                      "linkInfo": {
                          "type": 1,
                          "text": "",linkText:'商家套餐与服务'
                      },
                      "style": {
                          "height": 638
                      }
                  },
                  "isVip": {
                    "imgPath": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip1.png",
                    "link":memberDomain + "/enter_contrast.html",
                    "linkInfo": {
                        "type": 1,
                        "text": "",linkText:'商家套餐与服务'
                    },
                    "style": {
                        "height": 638
                    }
                  },
                  "style": {
                      "borderRadius": 24,
                      "marginTop": 20,
                      "marginLeft": 0
                  }
              }
          }
      },
        {
            "id": 34,
            "sid": "ibtns_1723541696405",
            "typename": "ibtns",
            "text": "重点按钮组",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "styletype": 2,
                "title": {
                    "show": true,
                    "text": "商品管理",
                    "style": {
                        "color": "#000000"
                    }
                },
                "more": {
                    "text": "全部管理",
                    "arr": false,
                    "show": true,
                    "link": businessUrl + "/shop.html",
                    "linkInfo": {
                        "linkText": "商城主页",
                        "selfSetTel": 0,
                        "type": 1,
                        "name": "",
                        "id": "link_shop_17255038000",
                        "homePage": "",
                        "needId": false
                    },
                    "style": {
                        "color": "#a1a7b3",
                        "initColor": "#a1a7b3"
                    }
                },
                "btns_imp": [
                    {
                        "id": 1,
                        "title": "",
                        "subTitle": "在售/下架商品",
                        "icon": "",
                        "link":businessUrl + "/manage-shop.html",
                        "btnBg": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_bg1.png",
                        "linkInfo": {
                            "linkText": "商品管理",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_shop_17255038004",
                            "homePage": "",
                            "mini":"/pages/packages/mcenter/bfabu/bfabu?mold=shop&code=1",
                            "needId": false
                        },
                        "text": "商品管理"
                    },
                    {
                        "id": 2,
                        "title": "",
                        "subTitle": "核销商品券",
                        "icon": "",
                        "link":businessUrl + "/verify-shop.html",
                        "btnBg": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_bg2.png",
                        "linkInfo": {
                            "linkText": "核销商品券",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_shop_17255038007",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "扫码核销"
                    }
                ],
                "btns": [
                    {
                        "id": 1,
                        "title": "",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon2.png",
                        "link":businessUrl + "/order-shop.html",
                        "linkInfo": {
                            "linkText": "订单管理",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_shop_17255038005",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "订单管理"
                    },
                    {
                        "id": 2,
                        "title": "",
                        "icon":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon1.png",
                        "link":businessUrl + "/logistic-shop.html",
                        "linkInfo": {
                            "linkText": "运费模板",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_shop_172550380010",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "运费模版"
                    },
                    
                    {
                        "id": 3,
                        "title": "",
                        "icon":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon3.png",
                        "link":businessUrl + "/config-shop.html",
                        "linkInfo": {
                            "linkText": "店铺主页",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_shop_17255038001",
                            "homePage": "shop",
                            "needId": false
                        },
                        "text": "店铺主页"
                    },{
                      "id": 4,
                      "title": "",
                      "icon":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon4.png",
                      "link":businessUrl + "/config-shop.html",
                      "linkInfo": {
                          "linkText": "店铺配置",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_shop_17255038002",
                          "needId": false
                      },
                      "text": "店铺配置"
                  },
                ],
                "style": {
                    "textColor": "#000000",
                    "subColor": "#999999",
                    "sub_opacity": 100,
                    "bgColor": "#ffffff",
                    "btnSize": 76,
                    "borderRadius": 24,
                    "marginTop": 20,
                    "marginLeft": 20,
                    "paddingLeft": 26
                }
            }
        },
        {
            "id": 35,
            "sid": "storeMan_1723542547708",
            "typename": "storeMan",
            "text": "门店服务",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "isStore": true,
                "column": 4,
                "title": {
                    "show": true,
                    "text": "门店服务",
                    "style": {
                        "color": "#333333"
                    }
                },
                "btns": [
                    {
                        "id": "maidan",
                        "text": "买单",
                        "lab": {
                            "show": true,
                            "text": "新收款"
                        },
                        "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/maidan.png",
                        "link":businessUrl + "/business-maidan-order.html",
                        "linkInfo": {
                            "type": 1,
                            "linkText": "买单",
                            "homePage": "maidan"
                        }
                    },
                    {
                        "id": "paidui",
                        "text": "排队",
                        "lab": {
                            "show": false,
                            "text": ""
                        },
                        "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/paidui.png",
                        "link":businessUrl + "/business-paidui-order.html",
                        "linkInfo": {
                            "type": 1,
                            "linkText": "排队",
                            "homePage": "paidui"
                        }
                    },
                    {
                        "id": "diancan",
                        "text": "点餐",
                        "lab": {
                            "show": true,
                            "text": "待确认"
                        },
                        "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/diancan.png",
                        "link":businessUrl + "/business-diancan-order.html",
                        "linkInfo": {
                            "type": 1,
                            "linkText": "点餐",
                            "homePage": "diancan"
                        }
                    },
                    {
                        "id": "dingzuo",
                        "text": "订座",
                        "lab": {
                            "show": true,
                            "text": "待确认"
                        },
                        "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/dingzuo.png",
                        "link":businessUrl + "/business-dingzuo-order.html",
                        "linkInfo": {
                            "type": 1,
                            "linkText": "订座",
                            "homePage": "dingzuo"
                        }
                    }
                ],
                "serviceShow": 1,
                "style": {
                    "color": "#333333",
                    "fontSize": 24,
                    "cardBg": "#ffffff",
                    "btnSize": 80,
                    "marginTop": 20,
                    "marginLeft": 20,
                    "paddingLeft": 32,
                    "borderRadiusTop": 24,
                    "borderRadiusBottom": 24,
                    "labBgColor": "#FF524D",
                    "labColor": "#ffffff"
                },
                "more": {
                    "text": "查看更多",
                    "arr": 1,
                    "show": false,
                    "link": "",
                    "linkInfo": {
                        "linkText": "",
                        "type": 0
                    },
                    "style": {
                        "color": "#a1a7b3",
                        "initColor": "#a1a7b3"
                    }
                }
            }
        }
    ],
    "pageSet": {
        "showType": 1,
        "title": {
            "text": "",
            "posi": "center",
            "style": {
                "color": "#000000"
            }
        },
        "rBtns": {
            "showType": 0,
            "btns": [],
            "style": {
                "color": ""
            }
        },
        "bgType": "color",
        "style": {
            "background": "#ffffff",
            "start": 62,
            "borderRadius": 24,
            "marginTop": 20,
            "marginLeft": 20,
            "bgColor1": "#F5F7FA",
            "bgColor2": "#F5F7FA",
            "bgImgColor": "#ff5c37"
        },
        "h5FixedTop": 1
    },
    "dataAjax": {
        "job": [],
        "data": [
            1,
            2,
            6
        ],
        "fuwu": []
    },
    "cover": "/siteConfig/atlas/large/2024/09/05/17255083634750.jpg"
}
,
{
  "noVIPInd": '',
  "compsArr": [
      {
          "id": 30,
          "sid": "busiInfo_1723424362027",
          "typename": "busiInfo",
          "text": "会员信息",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "themeType": "dark",
              "bgType": "image",
              "style": {
                  "bgID": "",
                  "bgColor": "#FFFFFF",
                  "bgImage": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/bg_11.png",
                  "bgHeight": 744,
                  "marginLeft": 20
              },
              "business": {
                  "icon":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_black.png",
                  "link":memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
                  "text": "个人版",
                  "linkInfo": {
                      "linkText": "切换个人版",
                      "type": 1
                  }
              },
              "rtBtns": {
                  "btns": [
                      {
                          "id": "scan1723424438365",
                          "text": "扫码",
                          "icon":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/scanIcon.png?v=1",
                          "link": "",
                          "linkInfo": {
                              "type": 2,
                              "linkText": "扫码"
                          }
                      },
                      {
                          "id": 1724118976222,
                          "text": "",
                          "icon":masterDomain + "/static/images/admin/siteMemberPage/icon02.png",
                          "link":memberDomain + "/setting.html",
                          "linkInfo": {
                              "linkText": "系统设置",
                              "selfSetTel": 0,
                              "type": 1,
                              "name": ""
                          }
                      }
                  ],
                  "txtStyle": 0
              },
              "rightInfo": {
                  "btnStyle": 2,
                  "btn": {
                      "style": {
                          "textColor": "#333333",
                          "text_opacity": 60,
                          "iconColor": ""
                      },
                      "icon":masterDomain + "/static/images/admin/siteConfigPage/score_icon.png",
                      "link": "主页",
                      "linkInfo": {
                          "linkText": "",
                          "type": 1
                      }
                  }
              },
              "link": masterDomain + "/business/detail.html",
              "linkInfo": {
                  "linkText": "商家主页",
                  "selfSetTel": 0,
                  "type": 1,
                  "name": "",
                  "id": "other_0_17255038000",
                  "homePage": "",
                  "needId": true
                },
              "showHeader": 1
          }
      },
      {
          "id": 32,
          "sid": "dataCount_1724739580346",
          "typename": "dataCount",
          "text": "数据组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "numSet": {
                  "id": 1,
                  "numShow": [
                      {
                          "id": 1,
                          "text": "余额",
                          "num": "0",
                          "showText": "余额",
                          "link": memberDomain + '/pocket'
                      },
                      {
                          "id": 2,
                          "text": "积分",
                          "num": "0",
                          "showText": "积分",
                          "link": memberDomain + '/pocket?dtype=1'
                      },
                      {
                          "id": 3,
                          "text": "今日收益",
                          "num": "648.96",
                          "showText": "今日收益"
                      }
                  ],
                  "style": {
                      "numColor": "#F65100",
                      "textColor": "#616266",
                      "bgColor": "",
                      "bordeColor": "",
                      "borderSize": "",
                      "borderRadiusTop": 24,
                      "borderRadiusBottom": 24,
                      "paddingLeft": 30,
                      "marginLeft": 30,
                      "marginTop": 0
                  },
                  "txtDefine": false
              },
              "splitLine": 0,
              "title": {
                  "show": false,
                  "text": "数据概况",
                  "style": {
                      "color": "#000000"
                  }
              },
              "more": {
                  "text": "查看更多",
                  "arr": 0,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": ""
                  },
                  "style": {
                      "color": "#a1a7b3"
                  }
              }
          }
      },
      {
          "id": 6,
          "sid": "adv_1724739913179",
          "typename": "adv",
          "text": "瓷片广告位",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "sid": 1,
              "column": 2,
              "list": [
                  {
                      "image":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv1.png",
                      "link":businessUrl + "/manage-homemaking.html",
                      "linkInfo": {
                          "linkText": "服务管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_homemaking_17255038003",
                          "homePage": "",
                          "mini":"/pages/packages/mcenter/bfabu/bfabu?mold=homemaking&code=1",
                          "needId": false
                      }
                  },
                  {
                      "image": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv2.png",
                      "link":businessUrl + "/homemaking-personal.html",
                      "linkInfo": {
                          "linkText": "人员管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_homemaking_17255038004",
                          "homePage": "",
                          "needId": false
                      }
                  }
              ],
              "style": {
                  "marginTop": 20,
                  "marginLeft": 20,
                  "borderRadius": 24,
                  "height": 134,
                  "splitMargin": 20
              }
          }
      },
      {
        "id": 33,
        "sid": "busiVip_1724743523964",
        "typename": "busiVip",
        "text": "商家会员",
        "noVipShow": 1,
        "openVipMod": "",
        "content": {
            "styletype": 2,
            "vipShow": 1,
            "setInfo": {
                "noVip": {
                    "imgPath": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip2.png",
                    "link":memberDomain + "/enter_contrast.html",
                    "linkInfo": {
                        "type": 1,
                        "text": "",linkText:'商家套餐与服务'
                    },
                    "style": {
                        "height": 160
                    }
                },
                "isVip": {
                  "imgPath": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip2.png",
                  "link":memberDomain + "/enter_contrast.html",
                  "linkInfo": {
                      "type": 1,
                      "text": "",linkText:'商家套餐与服务'
                  },
                  "style": {
                      "height": 160
                  }
                },
                "style": {
                    "borderRadius": 24,
                    "marginTop": 20,
                    "marginLeft": 20
                }
            }
        }
    },
      {
          "id": 31,
          "sid": "order_1725937951844",
          "typename": "order",
          "text": "订单管理",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "title": {
                  "show": true,
                  "text": "订单管理",
                  "style": {
                      "color": "#333333"
                  }
              },
              "more": {
                  "text": "查看更多",
                  "arr": 1,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": 1
                  },
                  "style": {
                      "color": "#a1a7b3"
                  }
              },
              "styletype": 1,
              "orderInfo": {
                  "code": "homemaking",
                  "title": "家政订单",
                  "ajax": "/include/ajax.php?service=homemaking&action=orderList&store=1&page=1&pageSize=1",
                  "showData": [
                      {
                          "id": 3,
                          "text": "待确认",
                          "link":businessUrl + "/order-homemaking.html?state=1",
                          "param": "state1",
                          "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/order_01.png",
                          "numShow": 8,
                          "style": {
                              "color": "#333333"
                          },
                          "linkInfo": {
                              "type": 1,
                              "linkText": "待确认"
                          }
                      },
                      {
                          "id": 4,
                          "text": "待服务",
                          "link":businessUrl + "/order-homemaking.html?state=20",
                          "param": "state20",
                          "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/order_02.png",
                          "numShow": 23,
                          "style": {
                              "color": "#333333"
                          },
                          "linkInfo": {
                              "type": 1,
                              "linkText": "待服务"
                          }
                      },
                      {
                          "id": 5,
                          "text": "待验收",
                          "link":businessUrl + "/order-homemaking.html?state=5",
                          "param": "state5",
                          "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/order_04.png",
                          "numShow": 6,
                          "style": {
                              "color": "#333333"
                          },
                          "linkInfo": {
                              "type": 1,
                              "linkText": "待验收"
                          }
                      },
                      {
                          "id": 6,
                          "text": "退款售后",
                          "link":businessUrl + "/order-homemaking.html?state=8",
                          "param": "state8",
                          "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/order_07.png",
                          "numShow": 3,
                          "style": {
                              "color": "#333333"
                          },
                          "linkInfo": {
                              "type": 1,
                              "linkText": "退款售后"
                          }
                      }
                  ]
              },
              "style": {
                  "textColor": "#333333",
                  "labColor": "#FF3419",
                  "iconSize": 68,
                  "borderRadiusTop": 24,
                  "borderRadiusBottom": 24,
                  "marginTop": 20,
                  "marginLeft": 20,
                  "paddingLeft": 20
              }
          }
      },
      {
          "id": 32,
          "sid": "dataCount_1724740692519",
          "typename": "dataCount",
          "text": "数据组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "numSet": {
                  "id": 2,
                  "numShow": [
                      {
                          "id": 7,
                          "text": "订单量",
                          "num": "568",
                          "secNum": 0,
                          "showText": "今日订单(笔)",
                          "link":businessUrl + "/checkout.html"
                      },
                      {
                          "id": 8,
                          "text": "成交额",
                          "num": "12584.75",
                          "secNum": 0,
                          "showText": "今日成交额",
                          "link":businessUrl + "/checkout.html"
                      },
                      {
                          "id": 6,
                          "text": "客流",
                          "num": "1.3w",
                          "secNum": 0,
                          "showText": "今日客流(人)"
                      }
                  ],
                  "secData": 1,
                  "style": {
                      "numColor": "#090909",
                      "textColor": "#777777",
                      "secDataColor": "#7f7f7f",
                      "bgColor": "#ffffff",
                      "bordeColor": "",
                      "borderSize": "",
                      "borderRadiusTop": 20,
                      "borderRadiusBottom": 20,
                      "paddingLeft": 0,
                      "marginLeft": 20,
                      "marginTop": 20
                  }
              },
              "splitLine": 0,
              "title": {
                  "show": true,
                  "text": "数据概况",
                  "style": {
                      "color": "#000000"
                  }
              },
              "more": {
                  "text": "查看更多",
                  "arr": 0,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": ""
                  },
                  "style": {
                      "color": "#a1a7b3"
                  }
              }
          }
      },
      
      {
          "id": 35,
          "sid": "storeMan_1725508605563",
          "typename": "storeMan",
          "text": "门店服务",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "isStore": true,
              "column": 4,
              "title": {
                  "show": true,
                  "text": "常用管理",
                  "style": {
                      "color": "#333333"
                  }
              },
              "btns": [
                  {
                      "id": "maidan",
                      "text": "买单",
                      "lab": {
                          "show": true,
                          "text": "新收款"
                      },
                      "icon":masterDomain + "/static/images/admin/siteMemberPage/defaultImg/maidan.png",
                      "link":businessUrl + "/business-maidan-order.html",
                      "linkInfo": {
                          "type": 1,
                          "linkText": "买单"
                      }
                  },
                  {
                      "id": 1725508614163,
                      "text": "团购管理",
                      "link":businessUrl + "/manage-tuan.html",
                      "linkInfo": {
                          "linkText": "团购管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_tuan_17255038002",
                          "mini":"/pages/packages/mcenter/bfabu/bfabu?mold=tuan&code=1",
                          "homePage": "",
                          "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/paidui.png",
                  },
                  {
                      "id": 1725508733251,
                      "text": "店铺配置",
                      "link":memberDomain + "/business-config.html",
                      "linkInfo": {
                          "linkText": "商家信息",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038003",
                          "homePage": "",
                          "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/diancan.png",
                  }
              ],
              "serviceShow": 0,
              "style": {
                  "color": "#333333",
                  "fontSize": 24,
                  "cardBg": "#ffffff",
                  "btnSize": 80,
                  "marginTop": 20,
                  "marginLeft": 20,
                  "paddingLeft": 32,
                  "borderRadiusTop": 24,
                  "borderRadiusBottom": 24,
                  "labBgColor": "#FF524D",
                  "labColor": "#ffffff"
              },
              "more": {
                  "text": "查看更多",
                  "arr": 1,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": 0
                  },
                  "style": {
                      "color": "#a1a7b3",
                      "initColor": "#a1a7b3"
                  }
              }
          }
      }
  ],
  "pageSet": {
      "showType": 1,
      "title": {
          "text": "",
          "posi": "center",
          "style": {
              "color": "#000000"
          }
      },
      "rBtns": {
          "showType": 2,
          "btns": [
              {
                  "id": 1725937051233,
                  "icon": "",
                  "text": "",
                  "link": "",
                  "linkInfo": {
                      "type": "",
                      "linkText": ""
                  }
              }
          ],
          "style": {
              "color": ""
          }
      },
      "bgType": "color",
      "style": {
          "background": "#ffffff",
          "start": 24,
          "borderRadius": 24,
          "marginTop": 20,
          "marginLeft": 20,
          "bgColor1": "#f5f7fa",
          "bgColor2": "",
          "bgImgColor": "#fef7eb",
      },
      "h5FixedTop": 1
  },
  "dataAjax": {
      "job": [],
      "data": [
          1,
          2,
          3,
          7,
          8,
          6,
          20,
          18,
          13
      ],
      "fuwu": []
  },
  "cover": "/siteConfig/atlas/large/2024/09/10/17259379627309.jpg"
},
  


  {
    "noVIPInd": "",
    "compsArr": [
        {
            "id": 30,
            "sid": "busiInfo_1723424362027",
            "typename": "busiInfo",
            "text": "会员信息",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "showHeader": 1,
                "themeType": "light",
                "bgType": "image",
                "style": {
                    "bgID": "",
                    "bgColor": "#FFFFFF",
                    "bgImage": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/bg_12.png",
                    "bgHeight": 744,
                    "marginLeft": 20
                },
                "business": {
                    "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_white.png",
                    "link": memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
                    "text": "个人版",
                    "linkInfo": {
                        "linkText": "切换个人版",
                        "type": 1
                    }
                },
                "rtBtns": {
                    "btns": [
                        {
                            "id": "scan1723424438365",
                            "text": "扫码",
                            "icon": masterDomain + "/static/images/admin/siteConfigPage/scanDefault.png",
                            "link": "",
                            "linkInfo": {
                                "type": 2,
                                "linkText": "扫码"
                            }
                        },
                        {
                            "id": 1724118976222,
                            "text": "",
                            "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_set1.png",
                            "link": memberDomain + "/setting.html",
                            "linkInfo": {
                                "linkText": "系统设置",
                                "selfSetTel": 0,
                                "type": 1,
                                "name": "",
                                "id": "other_1_17255038004",
                                "homePage": "",
                                "needId": false
                            }
                        }
                    ],
                    "txtStyle": 0
                },
                "rightInfo": {
                    "btnStyle": 2,
                    "btn": {
                        "style": {
                            "textColor": "#FFFFFF",
                            "text_opacity": 60,
                            "iconColor": ""
                        },
                        "icon": masterDomain + "/static/images/admin/siteConfigPage/score_icon.png",
                        "link": masterDomain + "/business/allComment.html",
                        "linkInfo": {
                            "linkText": "评价管理",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_0_17255038004",
                            "homePage": "",
                            "needId": true
                        }
                    }
                },
                "link": masterDomain + "/business/detail.html",
                "linkInfo": {
                    "linkText": "商家主页",
                    "selfSetTel": 0,
                    "type": 1,
                    "name": "",
                    "id": "other_0_17255038000",
                    "homePage": "",
                    "needId": true
                }
            }
        },
        {
            "id": 32,
            "sid": "dataCount_1724119007551",
            "typename": "dataCount",
            "text": "数据组",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "numSet": {
                    "id": 1,
                    "numShow": [
                        {
                            "id": 1,
                            "text": "余额",
                            "num": "0",
                            "showText": "余额",
                            "link": memberDomain + "/pocket"
                        },
                        {
                            "id": 2,
                            "text": "积分",
                            "num": "0",
                            "showText": "积分",
                            "link": memberDomain + "/pocket?dtype=1"
                        },
                        {
                            "id": 6,
                            "text": "今日客流",
                            "num": "1.3w",
                            "showText": "今日客流"
                        }
                    ],
                    "style": {
                        "numColor": "#ffffff",
                        "textColor": "#ffffff",
                        "bgColor": "",
                        "bordeColor": "",
                        "borderSize": "",
                        "borderRadiusTop": 24,
                        "borderRadiusBottom": 24,
                        "paddingLeft": 30,
                        "marginLeft": 30,
                        "marginTop": 0
                    },
                    "txtDefine": false
                },
                "splitLine": 0,
                "title": {
                    "show": false,
                    "text": "数据概况",
                    "style": {
                        "color": "#000000"
                    }
                },
                "more": {
                    "text": "查看更多",
                    "arr": 0,
                    "show": false,
                    "link": "",
                    "linkInfo": {
                        "linkText": "",
                        "type": ""
                    },
                    "style": {
                        "color": "#a1a7b3"
                    }
                }
            }
        },
        {
            "id": 33,
            "sid": "busiVip_1724119060191",
            "typename": "busiVip",
            "text": "商家会员",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "styletype": 2,
                "vipShow": 1,
                "setInfo": {
                    "noVip": {
                        "imgPath": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip3.png",
                        "link": memberDomain + "/enter_contrast.html",
                        "linkInfo": {
                            "type": 1,
                            "text": "",
                            "linkText": "商家套餐与服务"
                        },
                        "style": {
                            "height": 164
                        }
                    },
                    "isVip": {
                        "imgPath": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip3.png",
                        "link": memberDomain + "/enter_contrast.html",
                        "linkInfo": {
                            "type": 1,
                            "text": "",
                            "linkText": "商家套餐与服务"
                        },
                        "style": {
                            "height": 164
                        }
                    },
                    "style": {
                        "borderRadius": 24,
                        "marginTop": 0,
                        "marginLeft": 24
                    }
                }
            }
        },
        {
            "id": 6,
            "sid": "adv_1724119133679",
            "typename": "adv",
            "text": "瓷片广告位",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "sid": 1,
                "column": 2,
                "list": [
                    {
                        "image": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv3.png",
                        "link": businessUrl + "/house_entrust.html",
                        "linkInfo": {
                            "linkText": "房源委托",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_house_17255038005",
                            "homePage": "",
                            "needId": false
                        }
                    },
                    {
                        "image": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv4.png",
                        "link": ""
                    }
                ],
                "style": {
                    "marginTop": 20,
                    "marginLeft": 24,
                    "borderRadius": 24,
                    "height": 140,
                    "splitMargin": 18
                }
            }
        },
        {
            "id": 36,
            "sid": "jobMan_1724119185047",
            "typename": "jobMan",
            "text": "招聘管理",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "title": {
                    "text": "我的招聘",
                    "style": {
                        "color": "#000000"
                    },
                    "show": true
                },
                "more": {
                    "text": "查看更多",
                    "arr": false,
                    "show": true,
                    "link": masterDomain + "/supplier/job?appFullScreen=1",
                    "linkInfo": {
                        "linkText": "招聘管理",
                        "selfSetTel": 0,
                        "type": 1,
                        "name": "",
                        "id": "link_job_17255038000",
                        "homePage": "",
                        "needId": false
                    },
                    "style": {
                        "color": "#a1a7b3",
                        "initColor": "#a1a7b3"
                    }
                },
                "numShow": [
                    {
                        "id": 1,
                        "text": "面试日程",
                        "link": masterDomain + "/supplier/job/interviewManage.html?appFullScreen",
                        "num": 3,
                        "lab": {
                            "show": true,
                            "text": ""
                        },
                        "showText": "面试日程"
                    },
                    {
                        "id": 2,
                        "text": "待处理投递",
                        "link": masterDomain + "/supplier/job/resumeManage.html?appFullScreen",
                        "num": 3,
                        "lab": {
                            "show": true,
                            "text": "新投递"
                        },
                        "showText": "未读简历"
                    },
                    {
                        "id": 3,
                        "text": "下载的简历",
                        "link": masterDomain + "/supplier/job/resumeManage.html?type=2&appFullScreen",
                        "num": 3,
                        "lab": {
                            "show": true,
                            "text": ""
                        },
                        "showText": "简历管理"
                    },
                    {
                        "id": 4,
                        "text": "职位管理",
                        "link": masterDomain + "/supplier/job/postManage.html?appFullScreen",
                        "num": 3,
                        "lab": {
                            "show": true,
                            "text": ""
                        },
                        "showText": "职位管理"
                    }
                ],
                "btns": [
                    {
                        "id": 1,
                        "text": "公司信息",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon1.png",
                        "link": masterDomain + "/supplier/job/company_info.html?appFullScreen",
                        "linkInfo": {
                            "linkText": "商家配置",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": ""
                        }
                    },
                    {
                        "id": 1724119260335,
                        "text": "招聘主页",
                        "link": masterDomain + "/job/company?id=",
                        "linkInfo": {
                            "linkText": "招聘主页",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_job_17255038001",
                            "homePage": "job",
                            "needId": false,
                            "mini": "/pages/packages/job/company/company",
                            "miniPath_code": "job"
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon2.png"
                    },
                    {
                        "id": 1724119261333,
                        "text": "人才库",
                        "link": masterDomain + "/job/talent?appFullScreen",
                        "linkInfo": {
                            "linkText": "人才库",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "mini": "/pages/packages/job/talent/talent",
                            "id": "link_job_17255038009",
                            "homePage": "",
                            "needId": false
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon3.png"
                    },
                    {
                        "id": 1724119262645,
                        "text": "快招专区",
                        "link": masterDomain + "/job/general",
                        "linkInfo": {
                            "linkText": "普工招聘",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_job_17255038008",
                            "homePage": "",
                            "needId": false,
                            "mini": "/pages/packages/job/general/general"
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon4.png"
                    }
                ],
                "style": {
                    "numColor": "#45474C",
                    "numTextColor": "#192233",
                    "numText_opacity": 100,
                    "btnTextColor": "#192233",
                    "btnText_opacity": 100,
                    "labBgColor": "#FF524D",
                    "labBg_opacity": 100,
                    "labColor": "#ffffff",
                    "btnSize": 72,
                    "borderRadiusTop": 24,
                    "borderRadiusBottom": 24,
                    "marginTop": 20,
                    "marginLeft": 20,
                    "paddingLeft": 20
                }
            }
        },
        {
            "id": 34,
            "sid": "ibtns_1724119355382",
            "typename": "ibtns",
            "text": "重点按钮组",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "styletype": 1,
                "title": {
                    "show": true,
                    "text": "我的房产",
                    "style": {
                        "color": "#333333"
                    }
                },
                "more": {
                    "text": "查看更多",
                    "arr": 1,
                    "show": false,
                    "link": "",
                    "linkInfo": {
                        "linkText": "",
                        "type": 0
                    },
                    "style": {
                        "color": "#a1a7b3",
                        "initColor": "#a1a7b3"
                    }
                },
                "btns_imp": [
                    {
                        "id": 1,
                        "title": "",
                        "subTitle": "管理社区发言",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon6.png",
                        "btnBg": "",
                        "link": memberDomain + "/manage-tieba.html",
                        "linkInfo": {
                            "linkText": "",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "",
                            "mini":"/pages/packages/mcenter/fabu/fabu?mold=tieba&code=1",
                            "homePage": ""
                        },
                        "text": "我的发帖"
                    },
                    {
                        "id": 2,
                        "title": "",
                        "subTitle": "直播互动带货",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon5.png",
                        "btnBg": "",
                        "link": memberDomain + "/manage-live.html",
                        "linkInfo": {
                            "linkText": "直播管理",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_live_17255038002",
                            "mini":"/pages/packages/mcenter/fabu/fabu?mold=live&code=1",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "我的直播"
                    }
                ],
                "btns": [
                    {
                        "id": 4,
                        "title": "",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/house_icon1.png",
                        "link": businessUrl + "/config-house.html",
                        "linkInfo": {
                            "linkText": "店铺配置",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_house_17255038002",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "店铺配置"
                    },
                    {
                        "id": 2,
                        "title": "",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/house_icon2.png",
                        "link": businessUrl + "/config-house.html",
                        "linkInfo": {
                            "linkText": "店铺主页",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_house_17255038001",
                            "homePage": "house",
                            "needId": false
                        },
                        "text": "店铺主页"
                    },
                    {
                        "id": 1,
                        "title": "",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/house_icon3.png",
                        "link": businessUrl + "/house-broker.html",
                        "linkInfo": {
                            "linkText": "经纪人",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_house_17255038003",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "经纪人"
                    },
                    {
                        "id": 3,
                        "title": "",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/house_icon4.png",
                        "link": businessUrl + "/house_entrust.html",
                        "linkInfo": {
                            "linkText": "房源委托",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "link_house_17255038005",
                            "homePage": "",
                            "needId": false
                        },
                        "text": "房源委托"
                    }
                ],
                "style": {
                    "textColor": "#333333",
                    "subColor": "#999999",
                    "sub_opacity": 100,
                    "bgColor": "#ffffff",
                    "btnSize": 76,
                    "borderRadius": 24,
                    "marginTop": 20,
                    "marginLeft": 20,
                    "paddingLeft": 26
                }
            }
        },
        {
            "id": 35,
            "sid": "storeMan_1724119508911",
            "typename": "storeMan",
            "text": "普通按钮组",
            "noVipShow": 1,
            "openVipMod": "",
            "content": {
                "isStore": false,
                "column": 4,
                "title": {
                    "show": true,
                    "text": "更多功能",
                    "style": {
                        "color": "#333333"
                    }
                },
                "btns": [
                    {
                        "id": 1724119523525,
                        "text": "商家服务",
                        "link": memberDomain + "/enter_contrast.html",
                        "linkInfo": {
                            "linkText": "商家套餐与服务",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_0_17255038009",
                            "homePage": "",
                            "needId": false
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon1.png"
                    },
                    {
                        "id": 1724119522749,
                        "text": "下载app",
                        "link": masterDomain + "/mobile.html",
                        "linkInfo": {
                            "linkText": "下载APP",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_1_172550380037",
                            "homePage": "",
                            "needId": false
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon2.png"
                    },
                    {
                        "id": 1724119520949,
                        "text": "我的钱包",
                        "link": memberDomain + "/pocket.html?dtype=0",
                        "linkInfo": {
                            "linkText": "账户余额",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_1_17255038007",
                            "homePage": "",
                            "needId": false
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon3.png"
                    },
                    {
                        "id": 1,
                        "text": "客服帮助",
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon4.png",
                        "lab": {
                            "show": false,
                            "text": ""
                        },
                        "link": "tel:0512-67581578",
                        "linkInfo": {
                            "linkText": "官方客服",
                            "selfSetTel": 0,
                            "type": 4,
                            "name": "",
                            "id": "other_1_172550380038",
                            "homePage": "",
                            "needId": false
                        }
                    },
                    {
                        "id": 1724119521909,
                        "text": "安全中心",
                        "link": memberDomain + "/security.html",
                        "linkInfo": {
                            "linkText": "安全中心",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_1_172550380036",
                            "homePage": "",
                            "needId": false
                        },
                        "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon5.png"
                    }
                ],
                "serviceShow": 0,
                "style": {
                    "color": "#333333",
                    "fontSize": 24,
                    "cardBg": null,
                    "btnSize": 68,
                    "marginTop": 20,
                    "marginLeft": 6,
                    "paddingLeft": 32,
                    "borderRadiusTop": 24,
                    "borderRadiusBottom": 24,
                    "labBgColor": "#FF524D",
                    "labColor": "#ffffff"
                },
                "more": {
                    "text": "查看更多",
                    "arr": 1,
                    "show": false,
                    "link": "",
                    "linkInfo": {
                        "linkText": "",
                        "type": 0
                    },
                    "style": {
                        "color": "#a1a7b3",
                        "initColor": "#a1a7b3"
                    }
                },
                "btnRadius": true
            }
        }
    ],
    "pageSet": {
        "showType": 1,
        "title": {
            "text": "",
            "posi": "left",
            "style": {
                "color": "#FFFFFF"
            }
        },
        "rBtns": {
            "showType": 0,
            "btns": [
                {
                    "id": 1726715818757,
                    "icon": "",
                    "text": "",
                    "link": "",
                    "linkInfo": {
                        "type": "",
                        "linkText": ""
                    }
                }
            ],
            "style": {
                "color": ""
            }
        },
        "bgType": "image",
        "style": {
            "background": "#2b79ff",
            "start": 68,
            "borderRadius": 24,
            "marginTop": 20,
            "marginLeft": 20,
            "bgColor1": "#F7F8FA",
            "bgColor2": "#FFFFFF",
            "bgImgColor": "#2c81ff"
        },
        "h5FixedTop": 1
    },
    "dataAjax": {
        "job": [
            1,
            2,
            3,
            4
        ],
        "data": [
            1,
            2,
            6
        ],
        "fuwu": []
    },
    "cover": "/siteConfig/atlas/large/2024/09/19/17267159056595.jpg"
},

{
  "noVIPInd": "",
  "compsArr": [
      {
          "id": 30,
          "sid": "busiInfo_1723424362027",
          "typename": "busiInfo",
          "text": "会员信息",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
             "showHeader":1,
              "themeType": "dark",
              "bgType": "image",
              "style": {
                  "bgID": "",
                  "bgColor": "#FFFFFF",
                  "bgImage":masterDomain + "/static/images/admin/siteConfigPage/defaultImg/busi_bg01.png",
                  "bgHeight": 744,
                  "marginLeft": 20
              },
              "business": {
                  "icon":masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_black.png",
                  "link":memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
                  "text": "个人版",
                  "linkInfo": {
                      "linkText": "切换个人版",
                      "type": 1
                  }
              },
              "rtBtns": {
                  "btns": [
                      {
                          "id": "scan1723424438365",
                          "text": "扫码",
                          "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/scanIcon.png?v=1",
                          "link": "",
                          "linkInfo": {
                              "type": 2,
                              "linkText": "扫码"
                          }
                      },
                      {
                          "id": "drop1723424439339",
                          "text": "",
                          "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_dropMenu.png",
                          "link": "",
                          "dropMenu": {
                              "styletype": 1,
                              "linkArr": [
                                  {
                                      "text": "",
                                      "icon": "",
                                      "link": "",
                                      "linkInfo": {
                                          "type": 1,
                                          "linkText": ""
                                      }
                                  },
                                  {
                                      "text": "",
                                      "icon": "",
                                      "link": "",
                                      "linkInfo": {
                                          "type": 1,
                                          "linkText": ""
                                      }
                                  }
                              ]
                          },
                          "linkInfo": {
                              "type": 3,
                              "linkText": ""
                          }
                      }
                  ],
                  "txtStyle": 0
              },
              "rightInfo": {
                "btnStyle": 1,
                "btn": {
                    "style": {
                        "textColor": "#97989C",
                        "text_opacity": 100,
                        "iconColor": "",
                        "icon_opacity": 100
                    },
                    "text": "",
                    "link": masterDomain + "/business/detail.html",
                    "linkInfo": {
                        "linkText": "商家主页",
                        "selfSetTel": 0,
                        "type": 1,
                        "name": "",
                        "id": "other_0_17255038000",
                        "homePage": "",
                        "needId": true
                    }
                }
            },
              "link": masterDomain + "/business/detail.html",
              "linkInfo": {
                  "linkText": "商家主页",
                  "selfSetTel": 0,
                  "type": 1,
                  "name": "",
                  "id": "other_0_17255038000",
                  "homePage": "",
                  "needId": true
              }
          }
      },
      {
          "id": 32,
          "sid": "dataCount_1723424376618",
          "typename": "dataCount",
          "text": "数据组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "numSet": {
                  "id": 1,
                  "numShow": [
                      {
                          "id": 1,
                          "text": "余额",
                          "num": "8450.05",
                          "showText": "余额",
                          "link": memberDomain + '/pocket'
                      },
                      {
                          "id": 2,
                          "text": "积分",
                          "num": "0",
                          "showText": "积分",
                          "link": memberDomain + '/pocket?dtype=1'
                      },
                      {
                          "id": 3,
                          "text": "今日收益",
                          "num": "5450.05",
                          "showText": "今日收益"
                      }
                  ],
                  "style": {
                      "numColor": "#000000",
                      "textColor": "#45474C",
                      "bgColor": "",
                      "bordeColor": "",
                      "borderSize": "",
                      "borderRadiusTop": 0,
                      "borderRadiusBottom": 0,
                      "paddingLeft": 0,
                      "marginLeft": 0,
                      "marginTop": 0
                  },
                  "txtDefine": false
              },
              "splitLine": 0,
              "title": {
                  "show": false,
                  "text": "数据概况",
                  "style": {
                      "color": "#000000"
                  }
              },
              "more": {
                  "text": "查看更多",
                  "arr": 0,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": ""
                  },
                  "style": {
                      "color": "#a1a7b3"
                  }
              }
          }
      },
      {
          "id": 33,
          "sid": "busiVip_1723424508453",
          "typename": "busiVip",
          "text": "商家会员",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "styletype": 2,
              "vipShow": 1,
              "setInfo": {
                  "noVip": {
                      "imgPath":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip4.png",
                      "link":memberDomain + "/enter_contrast.html",
                      "linkInfo": {
                          "type": 1,
                          "text": "",linkText:'商家套餐与服务'
                      },
                      "style": {
                          "height": 174
                      }
                  },
                  "isVip": {
                    "imgPath":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip4.png",
                    "link":memberDomain + "/enter_contrast.html",
                    "linkInfo": {
                        "type": 1,
                        "text": "",linkText:'商家套餐与服务'
                    },
                    "style": {
                        "height": 174
                    }
                  },
                  "style": {
                      "borderRadius": 0,
                      "marginTop": 0,
                      "marginLeft": 0
                  }
              }
          }
      },
      {
          "id": 20,
          "sid": "msg_1723424666284",
          "typename": "msg",
          "text": "消息通知",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "title": {
                  "text": "消息",
                  "image": "",
                  "type": "text",
                  "style": {
                      "color": "#0080FF"
                  }
              },
              "msgType": 1,
              "listShow": 10,
              "listArr": [
                  {
                      "link": "",
                      "text": "",
                      "linkInfo": {
                          "lineText": "",
                          "type": 1
                      }
                  }
              ],
              "splitLine": 2,
              "style": {
                  "textColor": "#192233",
                  "bgColor": "#ffffff",
                  "opacity": 100,
                  "borderRadiusTop": 0,
                  "borderRadiusBottom": 0,
                  "borderColor": "",
                  "borderSize": "",
                  "marginTop": 0,
                  "marginLeft": 0,
                  "height": 87,
                  "splitLine": "#EEEEEE",
                  "paddingLeft": 30
              }
          }
      },
      {
          "id": 35,
          "sid": "storeMan_1723424854947",
          "typename": "storeMan",
          "text": "普通按钮组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "isStore": false,
              "column": 5,
              "title": {
                  "show": false,
                  "text": "",
                  "style": {
                      "color": "#333333"
                  }
              },
              "btns": [
                  {
                      "id": 1,
                      "text": "商家主页",
                      "link":masterDomain + "/business/detail.html",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon6.png",
                      "lab": {
                          "show": false,
                          "text": ""
                      },
                      "linkInfo": {
                          "linkText": "商家主页",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038000",
                          "homePage": "",
                          "needId": true
                      }
                  },
                  {
                      "id": 1723424947668,
                      "text": "商家信息",
                      "link":memberDomain + "/business-config.html",
                      "linkInfo": {
                          "linkText": "商家信息",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038003",
                          "homePage": "",
                          "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon7.png",
                  },
                  {
                      "id": 1723424948627,
                      "text": "评价管理",
                      "link":masterDomain + "/business/allComment.html",
                      "linkInfo": {
                          "linkText": "评价管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038004",
                          "homePage": "",
                          "needId": true
                      },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon8.png",
                  },
                  {
                      "id": 1723424949939,
                      "text": "数据结算",
                      "link":businessUrl + "/checkout.html",
                      "linkInfo": {
                          "linkText": "数据结算",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038005",
                          "homePage": "",
                          "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon9.png",
                  },
                  {
                      "id": 1723424953475,
                      "text": "钱包",
                      "link":memberDomain + "/pocket.html?dtype=0",
                      "linkInfo": {
                          "linkText": "钱包",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038006",
                          "homePage": "",
                          "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon10.png",
                  }
              ],
              "serviceShow": 0,
              "style": {
                  "color": "#333333",
                  "fontSize": 24,
                  "cardBg": "#ffffff",
                  "btnSize": 80,
                  "marginTop": 0,
                  "marginLeft": 0,
                  "paddingLeft": 32,
                  "borderRadiusTop": 0,
                  "borderRadiusBottom": 24,
                  "labBgColor": "#FF524D",
                  "labColor": "#ffffff"
              },
              "more": {
                  "text": "查看更多",
                  "arr": 1,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": 0
                  },
                  "style": {
                      "color": "#a1a7b3",
                      "initColor": "#a1a7b3"
                  }
              },
              "btnsArr": [],
              "btnRadius": false
          }
      },
      {
          "id": 32,
          "sid": "dataCount_1723427300949",
          "typename": "dataCount",
          "text": "数据组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "numSet": {
                  "id": 3,
                  "titleNum": {
                      "numShow": {
                          "id": 1,
                          "text": "账户余额",
                          "num": "8450.05",
                          "showText": "账户余额",
                          "link": memberDomain + '/pocket'
                      },
                      "btn": {
                          "btnText": "提现",
                          "link":memberDomain + "/withdraw.html",
                          "linkInfo": {
                              "linkText": "申请提现",
                              "selfSetTel": 0,
                              "type": 1,
                              "name": "",
                              "id": "other_0_17255038008",
                              "homePage": "",
                              "needId": false
                          }
                      },
                      "style": {
                          "numColor": "#0080FF",
                          "btnColor": "#0080FF",
                          "textColor": "#000000"
                      }
                  },
                  "numShow": [
                      {
                          "id": 3,
                          "text": "今日收益",
                          "num": "5450.05",
                          "showText": "今日收益",
                          "link":businessUrl + '/checkout.html'
                      },
                      {
                          "id": 4,
                          "text": "本月收益",
                          "num": "8950.43",
                          "showText": "本月收益",
                          "link":businessUrl + '/checkout.html'
                      },
                      {
                          "id": 11,
                          "text": "上月收益",
                          "num": "9854.25",
                          "showText": "上月收益",
                          "link":businessUrl + '/checkout.html'
                      }
                  ],
                  "style": {
                      "numColor": "#000000",
                      "textColor": "#777777",
                      "bgColor": "#ffffff",
                      "bordeColor": "",
                      "borderSize": "",
                      "borderRadiusTop": 20,
                      "borderRadiusBottom": 20,
                      "paddingLeft": 20,
                      "marginLeft": "20",
                      "marginTop": 20
                  },
                  "txtDefine": false
              },
              "splitLine": 0,
              "title": {
                  "show": true,
                  "text": "数据概况",
                  "style": {
                      "color": "#000000"
                  }
              },
              "more": {
                  "text": "查看更多",
                  "arr": 0,
                  "show": true,
                  "link":businessUrl + "/checkout.html",
                  "linkInfo": {
                      "linkText": "数据结算",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_0_17255038005",
                      "homePage": "",
                      "needId": false
                  },
                  "style": {
                      "color": "#a1a7b3"
                  }
              }
          }
      },
      {
          "id": 34,
          "sid": "ibtns_1723425114611",
          "typename": "ibtns",
          "text": "重点按钮组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "styletype": 2,
              "title": {
                  "show": true,
                  "text": "汽车管理",
                  "style": {
                      "color": "#333333"
                  }
              },
              "more": {
                  "text": "全部管理",
                  "arr": false,
                  "show": true,
                  "link":memberDomain + "/car.html",
                  "linkInfo": {
                      "linkText": "汽车主页",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_car_17255038000",
                      "homePage": "",
                      "needId": false
                  },
                  "style": {
                      "color": "#a1a7b3",
                      "initColor": "#a1a7b3"
                  }
              },
              "btns_imp": [
                  {
                      "id": 1,
                      "title": "",
                      "subTitle": "在售二手车",
                      "icon": "",
                      "btnBg": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_bg3.png",
                      "link": "",
                      "link": memberDomain + "/manage-car.html",
                      "linkInfo": {
                        "linkText": "车源管理",
                        "selfSetTel": 0,
                        "type": 1,
                        "name": "",
                        "id": "link_car_17255038002",
                        "homePage": "",
                        "mini":"/pages/packages/mcenter/fabu/fabu?mold=car&code=1",
                        "needId": false
                    },
                      "text": "车源管理"
                  },
                  {
                      "id": 2,
                      "title": "",
                      "subTitle": "",
                      "icon": "",
                      "btnBg":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_bg4.png",
                      "link": memberDomain + "/carappoint.html",
                      "linkInfo": {
                          "linkText": "客户管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_car_17255038003",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "客户管理"
                  }
              ],
              "btns": [
                  {
                      "id": 1,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon7.png",
                      "link":memberDomain + "/manage-car.html",
                      "linkInfo": {
                          "linkText": "车源管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_car_17255038002",
                          "mini":"/pages/packages/mcenter/fabu/fabu?mold=car&code=1",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "售车顾问"
                  },
                  {
                      "id": 2,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon8.png",
                      "link":businessUrl + "/servicemeal.html?mod=car",
                      "linkInfo": {
                          "linkText": "汽车门户",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "car_vip",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "商家续费"
                  },
                  {
                      "id": 3,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon9.png",
                      "link": memberDomain + "/config-car.html",
                        "linkInfo": {
                            "linkText": "店铺配置",
                        "selfSetTel": 0,
                        "type": 1,
                        "name": "",
                        "id": "link_car_17255038004",
                        "homePage": "",
                        "needId": false
                       },
                      "text": "店铺设置"
                  },
                  {
                      "id": 4,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon10.png",
                      "link":memberDomain + "/car.html",
                      "linkInfo": {
                          "linkText": "店铺主页",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_car_17255038001",
                          "homePage": "car",
                          "needId": false
                      },
                      "text": "店铺主页"
                  }
              ],
              "style": {
                  "textColor": "#333333",
                  "subColor": "#999999",
                  "sub_opacity": 100,
                  "bgColor": "#ffffff",
                  "btnSize": 76,
                  "borderRadius": 24,
                  "marginTop": 20,
                  "marginLeft": 20,
                  "paddingLeft": 26
              }
          }
      },
      {
          "id": 34,
          "sid": "ibtns_1723427157756",
          "typename": "ibtns",
          "text": "重点按钮组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "styletype": 2,
              "title": {
                  "show": true,
                  "text": "旅游管理",
                  "style": {
                      "color": "#333333"
                  }
              },
              "more": {
                  "text": "全部管理",
                  "arr": 1,
                  "show": true,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": 0
                  },
                  "style": {
                      "color": "#a1a7b3",
                      "initColor": "#a1a7b3"
                  }
              },
              "btns_imp": [
                  {
                      "id": 1,
                      "title": "",
                      "subTitle": "在租车型",
                      "icon":"",
                      "link":businessUrl + "/travel-rentcar.html",
                      "btnBg":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_bg5.png",
                      "linkInfo": {
                          "linkText": "旅游租车",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_travel_17255038009",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "租车管理"
                  },
                  {
                      "id": 2,
                      "title": "",
                      "subTitle": "推广文章/植入",
                      "icon": "",
                      "link":memberDomain + "/travel_strategy.html",
                      "btnBg":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_bg6.png",
                      "linkInfo": {
                          "linkText": "旅游攻略",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_travel_17255038004",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "旅游攻略"
                  }
              ],
              "btns": [
                  {
                      "id": 1,
                      "title": "",
                      "icon":  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon11.png",
                      "link":businessUrl + "/order-travel.html",
                      "linkInfo": {
                          "linkText": "订单管理",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_travel_17255038006",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "订单管理"
                  },
                  {
                      "id": 2,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon8.png",
                      "link":businessUrl + "/servicemeal.html?mod=travel",
                      "linkInfo": {
                          "linkText": "旅游频道",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "travel_vip",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "商家续费"
                  },
                  {
                      "id": 3,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon9.png",
                      "link":businessUrl + "/config-travel.html",
                      "linkInfo": {
                          "linkText": "店铺配置",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_travel_17255038002",
                          "homePage": "",
                          "needId": false
                      },
                      "text": "店铺设置"
                  },
                  {
                      "id": 4,
                      "title": "",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/ibtn_icon10.png",
                      "link":businessUrl + "/config-travel.html",
                      "linkInfo": {
                          "linkText": "店铺主页",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "link_travel_17255038001",
                          "homePage": "travel",
                          "needId": false
                      },
                      "text": "店铺主页"
                  }
              ],
              "style": {
                  "textColor": "#333333",
                  "subColor": "#999999",
                  "sub_opacity": 100,
                  "bgColor": "#ffffff",
                  "btnSize": 76,
                  "borderRadius": 24,
                  "marginTop": 20,
                  "marginLeft": 20,
                  "paddingLeft": 26
              }
          }
      },
      {
          "id": 35,
          "sid": "storeMan_1723427661724",
          "typename": "storeMan",
          "text": "普通按钮组",
          "noVipShow": 1,
          "openVipMod": "",
          "content": {
              "isStore": false,
              "column": 4,
              "title": {
                  "show": true,
                  "text": "常用功能",
                  "style": {
                      "color": "#333333"
                  }
              },
              "btns": [
                  {
                      "id": 1,
                      "text": "商家服务",
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon1.png",
                      "lab": {
                        "show": false,
                        "text": ""
                      },
                      "link": memberDomain + "/enter_contrast.html",
                      "linkInfo": {
                          "linkText": "商家套餐与服务",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_0_17255038009",
                          "homePage": "",
                          "needId": false
                      },
                  },
                  {
                      "id": 1723427681628,
                      "text": "下载App",
                      "link": masterDomain + "/mobile.html",
                      "linkInfo": {
                          "linkText": "下载APP",
                          "selfSetTel": 0,
                          "type": 1,
                          "name": "",
                          "id": "other_1_172550380037",
                          "homePage": "",
                          "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon2.png",
                  },
                  {
                      "id": 1723427682356,
                      "text": "我的钱包",
                      "link": memberDomain + "/pocket.html?dtype=0",
                      "linkInfo": {
                            "linkText": "账户余额",
                            "selfSetTel": 0,
                            "type": 1,
                            "name": "",
                            "id": "other_1_17255038007",
                            "homePage": "",
                            "needId": false
                        },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon3.png",
                  },
                  {
                      "id": 1723427683388,
                      "text": "客服帮助",
                      "link": "tel:" + hotLine,
                      "linkInfo": {
                        "linkText": "官方客服",
                        "selfSetTel": 0,
                        "type": 4,
                        "name": "",
                        "id": "other_1_172550380038",
                        "homePage": "",
                        "needId": false
                      },
                      "icon": masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon4.png",
                  }
              ],
              "serviceShow": 0,
              "style": {
                  "color": "#333333",
                  "fontSize": 24,
                  "cardBg": "#ffffff",
                  "btnSize": 68,
                  "marginTop": 20,
                  "marginLeft": 20,
                  "paddingLeft": 32,
                  "borderRadiusTop": 24,
                  "borderRadiusBottom": 24,
                  "labBgColor": "#FF524D",
                  "labColor": "#ffffff"
              },
              "more": {
                  "text": "查看更多",
                  "arr": 1,
                  "show": false,
                  "link": "",
                  "linkInfo": {
                      "linkText": "",
                      "type": 0
                  },
                  "style": {
                      "color": "#a1a7b3",
                      "initColor": "#a1a7b3"
                  }
              },
              "btnsArr": []
          }
      }
  ],
  "pageSet": {
      "showType": 1,
      "title": {
          "text": "",
          "posi": "left",
          "style": {
              "color": "#000000"
          }
      },
      "rBtns": {
          "showType": 0,
          "btns": [],
          "style": {
              "color": ""
          }
      },
      "bgType": "color",
      "style": {
          "background": "#ffffff",
          "start": 0,
          "borderRadius": 24,
          "marginTop": 20,
          "marginLeft": 20,
          "bgColor1": "#F5F7FA",
          "bgColor2": "",
          "bgImgColor":"#cae0fb"
      },
      "h5FixedTop":1,
  },
  "dataAjax": {
      "job": [],
      "data": [
          1,
          2,
          3,
          4,
          11
      ],
      "fuwu": []
  },
  "cover": "/siteConfig/atlas/large/2024/09/05/17255130432411.jpg"
},

{
  noVIPInd: "",
  compsArr:
    [
      {
        id: 30,
        sid: "busiInfo_1723424362027",
        typename: "busiInfo",
        text: "会员信息",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            showHeader:1,
            themeType: "light",
            bgType: "image",
            style:
              {
                bgID: "",
                bgColor: "#FFFFFF",
                bgImage: masterDomain + "/static/images/admin/siteMemberPage/defaultImg/bg_14.png",
                bgHeight: 840,
                marginLeft: 20,
              },
            business:
              {
                icon:  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_white.png",
                link: memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
                text: "个人版",
                linkInfo: { linkText: "切换个人版", type: 1 },
              },
            rtBtns:
              {
                btns:
                  [
                    {
                      id: "scan1723424438365",
                      text: "扫码",
                      icon:  masterDomain + "/static/images/admin/siteConfigPage/scanDefault.png",
                      link: "",
                      linkInfo: { type: 2, linkText: "扫码" },
                    },
                    {
                      id: 1724118976222,
                      text: "",
                      icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_set1.png",
                      link: memberDomain + "/setting.html",
                      linkInfo:
                        {
                          linkText: "系统设置",
                          selfSetTel: 0,
                          type: 1,
                          name: "",
                        },
                    },
                  ],
                txtStyle: 0,
              },
            rightInfo:
              {
                btnStyle: 2,
                btn:
                  {
                    style:
                      {
                        textColor: "#ffffff",
                        text_opacity: 60,
                        iconColor: "",
                      },
                    icon: masterDomain + "/static/images/admin/siteConfigPage/score_icon.png",
                    link: "主页",
                    linkInfo: { linkText: "", type: 1 },
                  },
              },
              "link": masterDomain + "/business/detail.html",
              "linkInfo": {
                  "linkText": "商家主页",
                  "selfSetTel": 0,
                  "type": 1,
                  "name": "",
                  "id": "other_0_17255038000",
                  "homePage": "",
                  "needId": true
              }
          },
      },
      
      {
        id: 35,
        sid: "storeMan_1724135722283",
        typename: "storeMan",
        text: "普通按钮组",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            isStore: false,
            column: 4,
            title: { show: false, text: "", style: { color: "#ffffff" } },
            btns:
              [
                {
                  id: 1,
                  text: "扫码验券",
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon11.png",
                  lab: { show: false, text: "" },
                  "link": businessUrl + "/verify-tuan.html",
                  "linkInfo": {
                      "linkText": "团购核销券",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_tuan_17255038004",
                      "homePage": "",
                      "needId": false
                  }
                },
                {
                  id: 1724135758265,
                  text: "验证记录",
                  "link": businessUrl + "/quan-tuan.html",
                  "linkInfo": {
                      "linkText": "核销记录",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_tuan_17255038005",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon12.png",
                },
                {
                  id: 1724135759065,
                  text: "员工管理",
                  "link": businessUrl + "/business-staff.html",
                  "linkInfo": {
                      "linkText": "员工管理",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_0_17255038001",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon13.png",
                },
                {
                  id: 1724135760185,
                  text: "团购管理",
                  "link": businessUrl + "/manage-tuan.html",
                  "linkInfo": {
                      "linkText": "团购管理",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_tuan_17255038003",
                      "homePage": "",
                      "mini":"/pages/packages/mcenter/bfabu/bfabu?mold=tuan&code=1",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon14.png",
                },
              ],
            serviceShow: 0,
            style:
              {
                color: "#ffffff",
                fontSize: 24,
                cardBg: null,
                btnSize: 80,
                marginTop: 0,
                marginLeft: 20,
                paddingLeft: 32,
                borderRadiusTop: 24,
                borderRadiusBottom: 24,
                labBgColor: "#FF524D",
                labColor: "#ffffff",
              },
            more:
              {
                text: "查看更多",
                arr: 1,
                show: false,
                link: "",
                linkInfo: { linkText: "", type: 0 },
                style: { color: "#a1a7b3", initColor: "#a1a7b3" },
              },
            btnRadius: true,
          },
      },
      {
        id: 33,
        sid: "busiVip_1724119060191",
        typename: "busiVip",
        text: "商家会员",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            styletype: 2,
            vipShow: 1,
            setInfo:
              {
                noVip:
                  {
                    imgPath: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip5.png",
                    "link": memberDomain + "/enter_contrast.html",
                    "linkInfo":
                      { "type": 1, "text": "", linkText:'商家套餐与服务' },
                    style: { height: 350 },
                  },
                isVip:
                  {
                    imgPath: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/busiVip5.png",
                    "link": memberDomain + "/enter_contrast.html",
                    "linkInfo":
                      { "type": 1, "text": "", linkText:'商家套餐与服务' },
                    style: { height: 350 },
                  },
                style: { borderRadius: 24, marginTop: 6, marginLeft: 24 },
              },
          },
      },
      {
        id: 20,
        sid: "msg_1724136132794",
        typename: "msg",
        text: "消息通知",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            title:
              {
                text: "通知",
                image: "",
                type: "text",
                style: { color: "#FF551D" },
              },
            msgType: 1,
            listShow: 10,
            listArr:
              [{ link: "", text: "", linkInfo: { lineText: "", type: 1 } }],
            splitLine: 0,
            style:
              {
                textColor: "#726136",
                bgColor: "#FFF2DF",
                opacity: 100,
                borderRadiusTop: 20,
                borderRadiusBottom: 20,
                borderColor: "",
                borderSize: "",
                marginTop: 20,
                marginLeft: 20,
                height: 80,
                splitLine: "",
                paddingLeft: 0,
              },
          },
      },
      {
        id: 35,
        sid: "storeMan_1724224582285",
        typename: "storeMan",
        text: "普通按钮组",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            isStore: false,
            column: 5,
            title: { show: false, text: "", style: { color: "#333333" } },
            btns:
              [
                {
                  id: 1724224593398,
                  text: "店铺",
                  "link": businessUrl + "/config-tuan.html",
                  "linkInfo": {
                      "linkText": "店铺主页",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_tuan_17255038002",
                      "homePage": "tuan",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon15.png",
                },
                {
                  id: 1,
                  text: "交易",
                  link: memberDomain + "/record.html",
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon16.png",
                  lab: { show: false, text: "" },
                  linkInfo: { type: 1, linkText: "" },
                },
                {
                  id: 1724224594125,
                  text: "营销",
                  "link": memberDomain + "/fenxiao.html",
                  "linkInfo": {
                      "linkText": "分销",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_1_172550380035",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon17.png",
                },
                {
                  id: 1724224594885,
                  text: "订单",
                  "link": businessUrl +  "/order-tuan.html",
                  "linkInfo": {
                      "linkText": "团购订单",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_tuan_17255038006",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon18.png",
                },
                {
                  id: 1724224595749,
                  text: "数据",
                  "link": businessUrl +  "/checkout.html",
                  "linkInfo": {
                      "linkText": "数据结算",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_0_17255038005",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon24.png",
                },
              ],
            serviceShow: 0,
            style:
              {
                color: "#333333",
                fontSize: 24,
                cardBg: "#ffffff",
                btnSize: 90,
                marginTop: 20,
                marginLeft: 20,
                paddingLeft: 32,
                borderRadiusTop: 24,
                borderRadiusBottom: 0,
                labBgColor: "#FF524D",
                labColor: "#ffffff",
              },
            more:
              {
                text: "查看更多",
                arr: 1,
                show: false,
                link: "",
                linkInfo: { linkText: "", type: 0 },
                style: { color: "#a1a7b3", initColor: "#a1a7b3" },
              },
            btnRadius: false,
          },
      },
      {
        id: 35,
        sid: "storeMan_1724224662829",
        typename: "storeMan",
        text: "普通按钮组",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            isStore: false,
            column: 5,
            title: { show: false, text: "", style: { color: "#333333" } },
            btns:
              [
                {
                  id: 1,
                  text: "活动报名",
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon19.png",
                  lab: { show: false, text: "" },
                  "link": businessUrl + "/shop_huodong.html",
                  "linkInfo": {
                      "linkText": "活动报名",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_shop_17255038006",
                      "homePage": "",
                      "needId": false
                  }
                },
                {
                  id: 1724224712813,
                  text: "评价管理",
                  "link": masterDomain + "/business/allComment.html",
                  "linkInfo": {
                      "linkText": "评价管理",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_0_17255038004",
                      "homePage": "",
                      "needId": true
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon20.png",
                },
                {
                  id: 1724224713581,
                  text: "财务管理",
                  "link": memberDomain + "/record.html",
                  "linkInfo": {
                      "linkText": "余额明细",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_1_17255038008",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon21.png",
                },
                {
                  id: 1724224714381,
                  text: "门店优惠码",
                  "link": businessUrl + "/quan-shop.html",
                  "linkInfo": {
                      "linkText": "优惠券管理",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "link_shop_17255038008",
                      "homePage": "",
                      "needId": false
                  },
                  icon:masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon22.png",
                },
                {
                  id: 1724224732838,
                  text: "消费卡",
                  "link": memberDomain + "/consume",
                  "linkInfo": {
                      "linkText": "购物卡余额",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_1_172550380011",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/btn_icon23.png",
                },
              ],
            serviceShow: 0,
            style:
              {
                color: "#333333",
                fontSize: 24,
                cardBg: "#ffffff",
                btnSize: 72,
                marginTop: 0,
                marginLeft: 20,
                paddingLeft: 32,
                borderRadiusTop: 0,
                borderRadiusBottom: 24,
                labBgColor: "#FF524D",
                labColor: "#ffffff",
              },
            more:
              {
                text: "查看更多",
                arr: 1,
                show: false,
                link: "",
                linkInfo: { linkText: "", type: 0 },
                style: { color: "#a1a7b3", initColor: "#a1a7b3" },
              },
            btnsArr: [],
            btnRadius: false,
          },
      },
      {
        id: 32,
        sid: "dataCount_1724226208840",
        typename: "dataCount",
        text: "数据组",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            numSet:
              {
                id: 4,
                numShow:
                  [
                    {
                      id: 6,
                      text: "今日客流",
                      num: "1.3w",
                      showText: "今日客流",
                    },
                    {
                      id: 3,
                      text: "今日收益",
                      num: "5450.05",
                      showText: "今日收益",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 7,
                      text: "今日订单",
                      num: "568",
                      showText: "今日订单",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 8,
                      text: "今日成交额",
                      num: "15008.8",
                      showText: "今日成交额",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 4,
                      text: "本月收益",
                      num: "8950.43",
                      showText: "本月收益",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 5,
                      text: "累计收益",
                      num: "99888.08",
                      showText: "累计收益",
                      link:businessUrl + '/checkout.html'
                    },
                  ],
                style:
                  {
                    numColor: "#000000",
                    textColor: "#777777",
                    bgColor: "#ffffff",
                    bordeColor: "",
                    borderSize: "",
                    borderRadiusTop: 20,
                    borderRadiusBottom: 20,
                    paddingLeft: 0,
                    marginLeft: 20,
                    marginTop: 20,
                  },
                txtDefine: false,
              },
            splitLine: 0,
            title:
              { show: true, text: "今日数据", style: { color: "#000000" } },
            more:
              {
                text: "查看更多",
                arr: 0,
                show: false,
                link: "",
                linkInfo: { linkText: "", type: "" },
                style: { color: "#a1a7b3" },
              },
          },
      },
    ],
  pageSet:
    {
      showType: 1,
      title: { text: "", posi: "center", style: { color: "#000000" } },
      rBtns: { showType: 0, btns: [], style: { color: "" } },
      bgType: "color",
      style:
        {
          background: "#ffffff",
          start: 24,
          borderRadius: 24,
          marginTop: 20,
          marginLeft: 20,
          bgColor1: "#f5f7fa",
          bgColor2: "",
          "bgImgColor":"#212833"
        },
      h5FixedTop:1,
    },
  dataAjax: { job: [], data: [6, 3, 7, 8, 4, 5] },
  cover: "/siteConfig/atlas/large/2024/08/22/17242952937361.jpg",
},

{
  noVIPInd: "",
  compsArr:
    [
      {
        id: 30,
        sid: "busiInfo_1723424362027",
        typename: "busiInfo",
        text: "会员信息",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            showHeader:1,
            themeType: "light",
            bgType: "image",
            style:
              {
                bgID: "",
                bgColor: "#FFFFFF",
                bgImage: masterDomain + "/static/images/admin/siteMemberPage/defaultImg/bg_15.png",
                bgHeight: 744,
                marginLeft: 20,
              },
            business:
              {
                icon:  masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_white.png",
                link: memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
                text: "个人版",
                linkInfo: { linkText: "切换个人版", type: 1 },
              },
            rtBtns:
              {
                btns:
                  [
                    {
                      id: "scan1723424438365",
                      text: "扫码",
                      icon: masterDomain + "/static/images/admin/siteConfigPage/scanDefault.png",
                      link: "",
                      linkInfo: { type: 2, linkText: "扫码" },
                    },
                    {
                      id: 1724118976222,
                      text: "",
                      icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/top_set1.png",
                      link: memberDomain + "/setting.html",
                      linkInfo:
                        {
                          linkText: "系统设置",
                          selfSetTel: 0,
                          type: 1,
                          name: "",
                        },
                    },
                  ],
                txtStyle: 0,
              },
            rightInfo:
              {
                btnStyle: 1,
                btn:
                  {
                    style:
                      {
                        textColor: "#F7BAB7",
                        text_opacity: 100,
                        iconColor: "#F7BAB7",
                        icon_opacity: 100,
                      },
                    text: " ",
                    link: "",
                    linkInfo: { linkText: "", type: 1 },
                  },
              },
              "link": masterDomain + "/business/detail.html",
              "linkInfo": {
                  "linkText": "商家主页",
                  "selfSetTel": 0,
                  "type": 1,
                  "name": "",
                  "id": "other_0_17255038000",
                  "homePage": "",
                  "needId": true
              }
          },
      },
      {
        id: 6,
        sid: "adv_1724119133679",
        typename: "adv",
        text: "瓷片广告位",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            sid: 1,
            column: 3,
            list:
              [
                {
                  image: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv_5.png",
                  "link": masterDomain+ "/business",
                  "linkInfo": {
                      "linkText": "火鸟商家",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "module_66",
                      "homePage": "",
                      "needId": false
                  }
                },
                {
                  image: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv_6.png",
                  "link": masterDomain + "/task/?appFullScreen=1",
                  "linkInfo": {
                      "linkText": "任务悬赏",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "task",
                      "id": "module_95",
                      "homePage": "",
                      "needId": false
                  }
                },
                {
                  image: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/adv_7.png",
                  "link": masterDomain + "/dating",
                  "linkInfo": {
                      "linkText": "互动交友",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "dating",
                      "id": "module_45",
                      "homePage": "",
                      "needId": false
                  }
                },
              ],
            style:
              {
                marginTop: 20,
                marginLeft: 24,
                borderRadius: 24,
                height: 168,
                splitMargin: 18,
              },
          },
      },
      {
        id: 33,
        sid: "busiVip_1724119060191",
        typename: "busiVip",
        text: "商家会员",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            styletype: 1,
            vipShow: 1,
            setInfo:
              {
                showMod:
                  [
                    {
                      icon: masterDomain + "/include/attachment.php?f=/static/images/admin/nav/waimai.png",
                      title: "美食外卖",
                      subTitle: "撒大大的萨达",
                      link: businessUrl + "/servicemeal.html?mod=waimai",
                      linkInfo:
                        {
                          linkText: "美食外卖",
                          selfSetTel: 0,
                          type: 1,
                          name: "",
                        },
                      iconMask: "#ff7d1a",
                    },
                    {
                      id: 1724120747069,
                      icon: masterDomain + "/include/attachment.php?f=/static/images/admin/nav/car.png",
                      title: "二手汽贸",
                      subTitle: "轻松发布汽车信息",
                      link: businessUrl + "/servicemeal.html?mod=car",
                      linkInfo:
                        {
                          linkText: "汽车门户",
                          selfSetTel: 0,
                          type: 1,
                          name: "",
                        },
                      iconMask: "#ff837b",
                    },
                    {
                      id: 1724130367754,
                      icon: masterDomain + "/include/attachment.php?f=/static/images/admin/nav/education.png",
                      title: "教育培训",
                      subTitle: "",
                      link: businessUrl + "/servicemeal.html?mod=education",
                      linkInfo:
                        {
                          linkText: "教育培训",
                          selfSetTel: 0,
                          type: 1,
                          name: "",
                        },
                      iconMask: "#7fcafe",
                    },
                  ],
                title:
                  {
                    text: "开通商家会员",
                    type: "text",
                    image: "",
                    style: { color: "#ffffff" },
                  },
                stitle:
                  {
                    textArr: [{ value: "享对应商家全部经营权益" }],
                    style: { color: "#FFEEDD" },
                  },
                bgType: "image",
                more: { show: false, text: "", style: { color: "#F35136" } },
                style:
                  {
                    bgMask: "#FFF2F0",
                    bgColor: "",
                    bgImage: masterDomain + "/static/images/admin/siteConfigPage/defaultImg/vip_default_bg.png?v=1",
                    iconSize: 78,
                    borderRadius: 24,
                    marginTop: 20,
                    marginLeft: 20,
                    paddingLeft: 26,
                  },
              },
          },
      },
      {
        id: 32,
        sid: "dataCount_1724120961077",
        typename: "dataCount",
        text: "数据组",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            numSet:
              {
                id: 4,
                numShow:
                  [
                    {
                      id: 6,
                      text: "今日客流",
                      num: "1.3w",
                      showText: "今日客流",
                    },
                    {
                      id: 7,
                      text: "今日订单",
                      num: "568",
                      showText: "今日订单",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 5,
                      text: "累计收益",
                      num: "99888.08",
                      showText: "累计收益",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 3,
                      text: "今日收益",
                      num: "5450.05",
                      showText: "今日收益",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 4,
                      text: "本月收益",
                      num: "8950.43",
                      showText: "本月收益",
                      link:businessUrl + '/checkout.html'
                    },
                    {
                      id: 8,
                      text: "今日成交额",
                      num: "15008.8",
                      showText: "今日成交额",
                      link:businessUrl + '/checkout.html'
                    },
                  ],
                style:
                  {
                    numColor: "#000000",
                    textColor: "#777777",
                    bgColor: "#ffffff",
                    bordeColor: "",
                    borderSize: "",
                    borderRadiusTop: 20,
                    borderRadiusBottom: 20,
                    paddingLeft: 0,
                    marginLeft: 20,
                    marginTop: 18,
                  },
                txtDefine: false,
              },
            splitLine: 0,
            title:
              { show: true, text: "今日数据", style: { color: "#000000" } },
            more:
              {
                text: "查看更多",
                arr: true,
                show: true,
                link: "",
                linkInfo: { linkText: "", type: "" },
                style: { color: "#a1a7b3" },
              },
          },
      },
      {
        id: 37,
        sid: "listNav_1724121059597",
        typename: "listNav",
        text: "列表导航",
        noVipShow: 1,
        openVipMod: "",
        content:
          {
            sid: 1,
            iconShow: true,
            splitLine: false,
            qiandao:
              {
                show: false,
                icon: masterDomain + "/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png",
                style: { color: "#FFAA21", background: "#FFF8ED" },
              },
            style:
              {
                borderRadius: 24,
                marginTop: 22,
                marginLeft: 20,
                lineHeight: 88,
                color: "#212121",
              },
            tipStyle: { color: "#a1a7b3" },
            list:
              [
                {
                  id: 1724121068558,
                  text: "商家服务",
                  tip: { show: true, text: "多行业经营 增值服务" },
                  "link": memberDomain + "/enter_contrast.html",
                  "linkInfo": {
                      "linkText": "商家套餐与服务",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_0_17255038009",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/snav1.png",
                },
                {
                  id: 1724120530366,
                  text: "安全中心",
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/snav2.png",
                  "link": memberDomain + "/security.html",
                  "linkInfo": {
                      "linkText": "安全中心",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_1_172550380037",
                      "homePage": "",
                      "needId": false
                  },
                  tip: { show: false, text: "" },
                },
                {
                  id: 1724120530367,
                  text: "商家教程",
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/snav3.png",
                  "link": memberDomain + "/servicemeal.html",
                  "linkInfo": {
                      "linkText": "我的商家套餐",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_0_172550380010",
                      "homePage": "",
                      "needId": false
                  },
                  tip: { show: true, text: "商家手册快速了解" },
                },
                {
                  id: 1724120530365,
                  text: "帮助中心",
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/snav4.png",
                  "link": "tel:" + hotLine,
                  "linkInfo": {
                      "linkText": "官方客服",
                      "selfSetTel": 0,
                      "type": 4,
                      "name": "",
                      "id": "other_1_172550380039",
                      "homePage": "",
                      "needId": false
                  },
                  tip: { show: false, text: "" },
                },
                {
                  id: 1724121069796,
                  text: "合作加盟",
                  tip: { show: false, text: "" },
                  "link": memberDomain + "/fenxiao.html",
                  "linkInfo": {
                      "linkText": "分销",
                      "selfSetTel": 0,
                      "type": 1,
                      "name": "",
                      "id": "other_1_172550380035",
                      "homePage": "",
                      "needId": false
                  },
                  icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/snav5.png",
                },
              ],
          },
      },
    ],
  pageSet:
    {
      showType: 1,
      title: { text: "", posi: "center", style: { color: "#000000" } },
      rBtns: { showType: 0, btns: [], style: { color: "" } },
      bgType: "color",
      style:
        {
          background: "#ffffff",
          start: 24,
          borderRadius: 24,
          marginTop: 20,
          marginLeft: 20,
          "bgColor1": "#F5F7FA",
          bgColor2: "",
          bgImgColor:"#ec493e"
        },
        h5FixedTop:1
    },
  dataAjax: { job: [], data: [6, 7, 5, 3, 4, 8], fuwu: [] },
  cover: "/siteConfig/atlas/large/2024/08/22/17242955013376.jpg",
}
,
]; //所有模板














// 组件数据列表
var busiOptions = [
  { id: 30, text: "会员信息", icon: "", more: 0, typename: "busiInfo" },
  { id: 31, text: "订单管理", icon: "mod_09", more: 1, typename: "order" },
  { id: 32, text: "数据组", icon: "", more: 1, typename: "dataCount" },
  { id: 33, text: "商家会员", icon: "", more: 0, typename: "busiVip" },
  { id: 35, text: "普通按钮组", icon: "mod_27", more: 1, typename: "storeMan" },
  { id: 34, text: "重点按钮组", icon: "", more: 1, typename: "ibtns" },
  {
    id: 35,
    text: "门店服务",
    icon: "mod_10",
    more: 0,
    typename: "storeMan",
    type: "store",
  },
  { id: 36, text: "招聘管理", icon: "", more: 0, typename: "jobMan" },
  { id: 37, text: "列表导航", icon: "", more: 1, typename: "listNav" },
  { id: 6, text: "瓷片广告位", icon: "", more: 1, typename: "adv" },
  { id: 7, text: "分隔标题", icon: "", more: 1, typename: "title" },
  { id: 20, text: "消息通知", icon: "mod_ring", more: 1, typename: "msg" },
  { id: 21, text: "关注公众号", icon: "", more: 0, typename: "wechat" },
];

// 会员信息默认设置
var busiInfoDefault = {
  themeType: "dark", //dark => 深色模式  light => 反白模式
  bgType: "image", //image => 背景图   color => 纯色背景
  showHeader: 1,
  style: {
    bgID: "", //背景图
    bgColor: "#FFFFFF", //背景色
    bgImage: defaultPath + "busi_bg01.png", //背景图
    bgHeight: 600, //高度
    marginLeft: 20, //左右间距
  },
  // 头像链接
  link: masterDomain+ "/business/detail.html",
  linkInfo: {
    type: "1",
    needId:true,
    linkText: "商家主页",
  },
  // 左上   个人端
  business: {
    icon: masterDomain + "/static/images/admin/siteMemberPage/icon01.png",
    link: memberDomain + "/?currentPageOpen=1&appFullScreen=1&appIndex=1",
    text: "个人版",
    linkInfo: {
      linkText: "切换个人版",
      type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
    },
  },

  // 右上侧按钮
  rtBtns: {
    btns: [],
    txtStyle: 0, // 0 => 无字  1 => 文本（小）  2 => 文本（大）
  }, //可能有多个

  // 右侧信息
  rightInfo: {
    btnStyle: 3,
    btn: {
      style: {
        textColor: "#ffffff", //文字颜色
        btnBgColor: "#ff6a4d", //按钮背景色
        bordeColor: "", //边框颜色
        borderSize: "", //边框尺寸
      },
      text: "我的主页", //按钮文字
      icon: masterDomain + "/static/images/admin/siteConfigPage/hom_icon.png",
      link: masterDomain+ "/business/detail.html",
      linkInfo: {
        needId:true,
        linkText: "商家主页",
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
      },
    },
  },
};

// 会员信息 右侧信息选项
rightInfoDefault = [
  {
    id: 1,
    text: "默认",
    btnDefault: {
      style: {
        textColor: "#97989C", //文字颜色
        text_opacity: 100, //文字透明度
        iconColor: "", //图标颜色
        icon_opacity: 100, //文字透明度 => 箭头
      },
      text: "", //按钮文字
      link: "",
      linkInfo: {
        linkText: "",
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
      },
    },
  },
  {
    id: 2,
    text: "商家评分",
    btnDefault: {
      style: {
        textColor: "#000000", //评分文字颜色
        text_opacity: 60, //文字透明度
        iconColor: "", //图标颜色
      },
      icon: masterDomain + "/static/images/admin/siteConfigPage/score_icon.png", //评分图标
      link: masterDomain+ "/business//allComment.html",
      linkInfo: {
        needId:true,
        linkText: "评价管理",
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
      },
    },
  },
  {
    id: 3,
    text: "按钮1",
    btnDefault: {
      style: {
        textColor: "#ffffff", //文字颜色
        btnBgColor: "#ff6a4d", //按钮背景色
        bordeColor: "", //边框颜色
        borderSize: "", //边框尺寸
      },
      text: "我的主页", //按钮文字
      icon: masterDomain + "/static/images/admin/siteConfigPage/hom_icon.png",
      link: masterDomain+ "/business/detail.html",
      linkInfo: {
        needId:true,
        linkText: "商家主页",
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
      },
    },
  },
  {
    id: 4,
    text: "按钮2",
    btnDefault: {
      txtStyle: 0, // 0 => 无字  1 => 文本（小）  2 => 文本（大）
      style: {
        textColor: "#192233", //文字颜色
      },
      text: "主页",
      icon: "",
      link: masterDomain+ "/business/detail.html",
      linkInfo: {
        needId:true,
        linkText: "商家主页",
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
      },
    },
  },
];

// 会员信息 顶部右侧按钮 下拉菜单默认配置
var dropMenu = {
  styletype: 1, // 1 => 样式一    2 => 样式二
  linkArr: [
    {
      text: "",
      icon: "",
      link: "",
      linkInfo: {
        //链接相关信息
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
        linkText: "", //显示的文字
      },
    },
    {
      text: "",
      icon: "",
      link: "",
      linkInfo: {
        //链接相关信息
        type: 1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
        linkText: "", //显示的文字
      },
    },
  ],
};

// 普通按钮的默认设置
var btnsDefault = {
  cardStyle: true, //显示卡片样式
  title: {
    show: true, //是否显示标题
    text: "", //标题
    style: {
      color: "#333333",
    },
  },
  more: {
    //显示更多
    text: "查看更多",
    arr: 1, //1箭头显示 .0 是箭头不显示
    show: false, //是否显示
    link: "",
    linkInfo: {
      linkText: "",
      type: 0,
    },
    style: {
      color: "#a1a7b3",
      initColor: "#a1a7b3",
    },
  },
  btnRadius: false, //是否有圆角
  layout: 2, // 布局是2/1行
  column: 5, //布局 单行4/5个
  btnsArr: [
    {
      id: 1,
      text: "", //文本
      link: "", //链接
      icon: "", //图标
      lab: {
        show: false, //是否显示标签
        text: "", //标签
        style: {
          //样式
          bgColor: "#ff0000",
          color: "#ffffff",
        },
      },
      linkInfo: {
        type: "",
        linkText: "",
      },
    },
  ], //添加的按钮
  // "showLabs":[], //选中的显示标签的按钮
  // "labsData":[], //显示标签的内容
  slide: 1, //滑动  0 => 平滑  1 => 分页
  style: {
    color: "#333333", //文本颜色
    fontSize: 24, //字体大小 常规  加大
    cardBg: "#ffffff", //卡片背景色
    dotColor: "#FB3527", //分页指示点
    btnRadius: 24, //按钮圆角
    cardRadius: 24, //卡片圆角
    btnSize: 80, //按钮大小
    marginTop: 22,
    marginLeft: 30,
  },
  activeInd: 0, //当前显示的索引
};

let btns_arr = [];
for (let i = 1; i <= 4; i++) {
  btns_arr.push({
    id: i,
    title: "", //按钮标题
    icon: "",
    link: "",
    linkInfo: {
      type: "1",
      text: "",
    },
  });
}

// 重点按钮默认设置
var ibtnsDefault = {
  styletype: 1, // 样式一和二
  title: {
    show: true, //是否显示标题
    text: "", //标题
    style: {
      color: "#333333",
    },
  },
  more: {
    //显示更多
    text: "查看更多",
    arr: 1, //1箭头显示 .0 是箭头不显示
    show: false, //是否显示
    link: "",
    linkInfo: {
      linkText: "",
      type: 0,
    },
    style: {
      color: "#a1a7b3",
      initColor: "#a1a7b3",
    },
  },

  btns_imp: [
    {
      id: 1,
      title: "", //按钮标题
      subTitle: "", //描述
      icon: "",
      link: "",
      btnBg: "",
      linkInfo: {
        type: "1",
        text: "",
      },
    },
    {
      id: 2,
      title: "", //按钮标题
      subTitle: "", //描述
      icon: "",
      link: "",
      btnBg: "",
      linkInfo: {
        type: "1",
        text: "",
      },
    },
  ], //重点按钮
  btns: btns_arr, //普通按钮按钮
  style: {
    textColor: "#333333",
    subColor: "#999999",
    sub_opacity: 100, //副标题颜色
    bgColor: "#ffffff",
    btnSize: 76, //图标大小
    borderRadius: 24, //圆角值
    marginTop: 20, //上边距
    marginLeft: 20, //左右边距
    paddingLeft: 26, //内边距
  },
};

var jobNumOptions = [
  {
    id: 1,
    text: "面试日程",
    link: masterDomain + "/supplier/job/interviewManage.html?appFullScreen",
    num: 3,
    lab: { show: true, text: "" },
  },
  {
    id: 2,
    text: "待处理投递",
    link: masterDomain + "/supplier/job/resumeManage.html?appFullScreen",
    num: 3,
    lab: { show: true, text: "新投递" },
  },
  {
    id: 3,
    text: "下载的简历",
    link: masterDomain + "/supplier/job/resumeManage.html?type=2&appFullScreen",
    num: 3,
    lab: { show: true, text: "" },
  },
  {
    id: 4,
    text: "职位管理",
    link: masterDomain + "/supplier/job/postManage.html?appFullScreen",
    num: 3,
    lab: { show: true, text: "" },
  },
  {
    id: 5,
    text: "收藏的简历",
    link: masterDomain + "/supplier/job/resumeManage.html?type=1&appFullScreen",
    num: 3,
    lab: { show: true, text: "" },
  },
  {
    id: 6,
    text: "浏览的简历",
    link: masterDomain + "/supplier/job/history.html?appFullScreen",
    num: 3,
    lab: { show: true, text: "" },
  },
];

var jobManDefault = {
  title: { text: "我的招聘", style: { color: "#000000" }, show: true },
  more: {
    text: "查看更多",
    arr: false,
    show: true,
    link: "",
    linkInfo: { linkText: "", type: 0 },
    style: { color: "#a1a7b3", initColor: "#a1a7b3" },
  },
  numShow: [
    {
      id: 1,
      text: "面试日程",
      link: masterDomain + "/supplier/job/interviewManage.html?appFullScreen",
      num: 3,
      lab: { show: true, text: "" },
      showText: "面试日程",
    },
    {
      id: 2,
      text: "待处理投递",
      link: masterDomain + "/supplier/job/resumeManage.html?appFullScreen",
      num: 3,
      lab: { show: true, text: "新投递" },
      showText: "未读简历",
    },
    {
      id: 3,
      text: "下载的简历",
      link:
        masterDomain + "/supplier/job/resumeManage.html?type=2&appFullScreen",
      num: 3,
      lab: { show: true, text: "" },
      showText: "简历管理",
    },
    {
      id: 4,
      text: "职位管理",
      link: masterDomain + "/supplier/job/postManage.html?appFullScreen",
      num: 3,
      lab: { show: true, text: "" },
      showText: "职位管理",
    },
  ],
  btns: [
    {
      id: 1,
      text: "公司信息",
      icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon1.png",
      link: masterDomain + "/supplier/job/company_info.html?appFullScreen",
      linkInfo: { linkText: "商家配置", type: 1, name: "" },
    },
    {
      id: 1724119260335,
      text: "招聘主页",
      link: job_channel + "/company?appFullScreen",
      linkInfo: { type: "1", linkText: "招聘主页" ,homePage:'job',miniPath_code:'job',mini:"/pages/packages/job/company/company"},
      icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon2.png",
    },
    {
      id: 1724119261333,
      text: "人才库",
      link: job_channel + "/talent?appFullScreen",
      linkInfo: { type: 1, linkText: "人才库", "mini": "/pages/packages/job/talent/talent" },
      icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon3.png",
    },
    {
      id: 1724119262645,
      text: "快招专区",
      link: job_channel + "/general",
      linkInfo: { type: 1, linkText: "普工招聘", "mini": "/pages/packages/job/general/general" },
      icon: masterDomain + "/static/images/admin/diyModels/busiCenterDiy/job_icon4.png",
    },
  ],
  style: {
    numColor: "#45474C",
    numTextColor: "#192233",
    numText_opacity: 100,
    btnTextColor: "#192233",
    btnText_opacity: 100,
    labBgColor: "#FF524D",
    labBg_opacity: 100,
    labColor: "#ffffff",
    btnSize: 72,
    borderRadiusTop: 24,
    borderRadiusBottom: 24,
    marginTop: 20,
    marginLeft: 20,
    paddingLeft: 20,
  },
};

// 消息通知默认设置
var msgDefault = {
  title: {
    text: "",
    image: "",
    type: "text", // text => 文字   image => 图片
    style: {
      color: "#FE6A19",
    },
  },
  msgType: 1, // 1 => 消息通知  2 => 手动添加
  listShow: 10, //显示数据 最多20
  listArr: [
    {
      link: "", //链接
      text: "", //内容太
      linkInfo: {
        lineText: "",
        type: 1,
      },
    },
  ], //添加的公告
  splitLine: 0, // 0 => 无  1 =>上分隔线   2 => 下分割线
  style: {
    textColor: "#192233", //内容颜色
    bgColor: "#ffffff", //背景色
    opacity: 100, //背景透明度
    borderRadiusTop: 20, //圆角值
    borderRadiusBottom: 20, //圆角值
    borderColor: "", //边框颜色
    borderSize: "", //边框大小
    marginTop: 22, //上间距
    marginLeft: 30, //左右间距
    height: 80, //高度
    splitLine: "",
    paddingLeft: 0, //内边距
  },
};

// 商家会员
var busiVipDefault = {
  styletype: 2, // 1 => 基础样式   2 => 自定义样式
  vipShow: 0, //开通后是否显示
  setInfo: {
    noVip: {
      imgPath:
        masterDomain +
        "/static/images/admin/siteConfigPage/defaultImg/vipDetault_1.png",
      link: memberDomain + "/enter_contrast.html",
      linkInfo: {
        type: 1,
        text: "商家套餐与服务",
        linkText: "商家套餐与服务",
        type: 1,
        homePage: "",
        needId: false
      },
      style: {
        height: 160,
      },
    },
    isVip: {
      imgPath: "",
      link: "",
      linkInfo: {
        type: 1,
        text: "",
      },
      style: {
        height: 160,
      },
    },
    style: {
      borderRadius: 24,
      marginTop: 20, //上间距
      marginLeft: 20, //左右间距
    },
  },
};

var vipConfig = {
  1: {
    showMod: [
      {
        icon: "",
        title: "",
        subTitle: "",
        link: "",
        linkInfo: {
          type: 1,
          text: "",
        },
      },
    ], //选择显示的模块
    title: {
      text: "开通商家会员",
      type: "text", //标题类型 text =>文字   image => 图片
      image: "", //图片url
      style: {
        color: "#ffffff",
      },
    },

    // 副标题
    stitle: {
      textArr: [{ value: "享对应商家全部经营权益" }], //副标题  可上下滚动
      style: {
        color: "#FFEEDD",
      },
    },
    bgType: "image", // color => 纯色   image => 纯色
    // 更多按钮
    more: {
      show: false, //是否显示查看更多
      text: "查看全部商家服务",
      style: {
        color: "#F35136",
      },
    },
    style: {
      bgMask: "#FFF2F0", //查看更多的渐变遮罩
      bgColor: "", //纯色背景
      bgImage:
        masterDomain +
        "/static/images/admin/siteConfigPage/defaultImg/vip_default_bg.png?v=1", //背景图片
      iconSize: 78, //图标尺寸
      borderRadius: 24,
      marginTop: 20, //上间距
      marginLeft: 20, //左右间距
      paddingLeft: 26,
    },
  },
  2: {
    noVip: {
      imgPath:
        masterDomain + "/static/images/admin/siteConfigPage/defaultImg/vipDetault_1.png",
      link: "",
      linkInfo: {
        type: 1,
        text: "",
      },
      style: {
        height: 160,
      },
    },
    isVip: {
      imgPath:
        masterDomain + "/static/images/admin//defaultImg/vipDetault_1.png",
      link: "",
      linkInfo: {
        type: 1,
        text: "",
      },
      style: {
        height: 160,
      },
    },
    style: {
      borderRadius: 0,
      marginTop: 0, //上间距
      marginLeft: 0, //左右间距
    },
  },
};

// 标题
var titleDefault = {
  sid: 1, //验证多个中的索引  重置复用组件需要
  layout: 0, //0 居左  1,居中
  inList: false, //是否在列表表内
  title: {
    text: "",
    type: 0, // 0默认 1划线 2 图标
    icon: "",
    style: {
      fontSize: 34,
      color: "#070F21",
      borderColor: "#FA3725",
    },
  },
  style: {
    marginLeft: 30,
    height: 110,
    marginTop: 10,
  },
  more: {
    text: "查看更多",
    arr: 1, //1箭头显示 .0 是箭头不显示
    show: true, //是否显示
    link: "",
    linkInfo: {
      linkText: "",
      type: "",
    },
    style: {
      color: "#a1a7b3",
      initColor: "#a1a7b3",
    },
  },
};

// 数组 数字
var numToText = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

// 所有数据
var allNumOptions = [
  { id: 1, text: "余额" },
  { id: 2, text: "积分" },

  { id: 3, text: "今日收益" },
  { id: 4, text: "本月收益" },
  { id: 11, text: "上月收益" },
  { id: 12, text: "昨日收益" },
  { id: 5, text: "累计收益" },

  { id: 6, text: "今日客流" },
  { id: 13, text: "昨日客流" },
  { id: 14, text: "本月客流" },
  { id: 15, text: "累计客流" },

  { id: 7, text: "今日订单" },
  { id: 16, text: "累计订单" },
  { id: 20, text: "昨日订单" },
  { id: 21, text: "本月订单" },

  { id: 8, text: "今日成交额" },
  { id: 17, text: "累计成交额" },
  { id: 18, text: "昨日成交额" },
  { id: 19, text: "本月成交额" },
  // {id:9, text:'今日退款'},
];

// 数据组 默认选项配置
var numberOption = [
  { id: 1, text: "余额", num: "28935.63" ,link:memberDomain + '/pocket.html'},
  { id: 2, text: cfg_pointName, num: "0" ,link:memberDomain + '/pocket.html?dtype=1'},
  { id: 3, text: "今日收益", num: "450.05" , link:businessUrl + '/checkout.html'},
  { id: 4, text: "本月收益", num: "8950.43" , link:businessUrl + '/checkout.html'},
  { id: 5, text: "累计收益", num: "99888.08" , link:businessUrl + '/checkout.html'},
  { id: 6, text: "今日客流", num: "1.3w" },
  { id: 7, text: "今日订单", num: "568", link:businessUrl + '/checkout.html' },
  { id: 8, text: "今日成交额", num: "15008.8" , link:businessUrl + '/checkout.html'},
  // {id:9, text:'今日退款',num:'0'},
];

// secNum => 昨日或者本月数据
var numberOption2 = [
  { id: 3, text: "收益", num: "9888.08", secNum: 0, link:businessUrl + '/checkout.html' },
  { id: 6, text: "客流", num: "425", secNum: 0 },
  { id: 7, text: "订单量", num: "2058", secNum: 0 , link:businessUrl + '/checkout.html'},
  { id: 8, text: "成交额", num: "12584.75", secNum: 0, link:businessUrl + '/checkout.html' },
];
var numberOption3 = {
  singleChose: [
    { id: 1, text: "账户余额", num: "28935.63" ,link:memberDomain + '/pocket.html?dtype=1'},
    { id: 3, text: "今日收益", num: "450.05" , link:businessUrl + '/checkout.html'},
    { id: 4, text: "本月收益", num: "8950.43" , link:businessUrl + '/checkout.html'},
    { id: 5, text: "累计收益", num: "19888.08" , link:businessUrl + '/checkout.html'},
    { id: 6, text: "今日客流", num: "1.3w" },
    { id: 7, text: "今日订单", num: "568" , link:businessUrl + '/checkout.html'},
    { id: 8, text: "今日成交额", num: "15008.8" , link:businessUrl + '/checkout.html'},
  ],
  moreChose: [
    { id: 3, text: "今日收益", num: "450.05" , link:businessUrl + '/checkout.html'},
    { id: 4, text: "本月收益", num: "8950.43" , link:businessUrl + '/checkout.html'},
    { id: 11, text: "上月收益", num: "9854.25" , link:businessUrl + '/checkout.html'},
    { id: 5, text: "累计收益", num: "99888.08" , link:businessUrl + '/checkout.html'},
    { id: 6, text: "今日客流", num: "1.3w" },
    { id: 7, text: "今日订单", num: "568" , link:businessUrl + '/checkout.html'},
    { id: 8, text: "今日成交额", num: "15008.8" , link:businessUrl + '/checkout.html'},
    // { id: 9, text: "今日退款", num: "0" , link:businessUrl + '/checkout.html'},
  ],
};

var numberSetArr = [
  {
    id: 1, //风格1
    numShow: [
      { id: 1, text: "余额", num: "8450.05", showText: "余额" , link: memberDomain + '/pocket'},
      { id: 2, text: cfg_pointName, num: "0", showText: cfg_pointName , link: memberDomain + '/pocket?dtype=1'},
      { id: 3, text: "今日收益", num: "450.05", showText: "今日收益", link:businessUrl + '/checkout.html'},
    ], //要显示的数据
    style: {
      numColor: "#FF3419", //数字颜色
      textColor: "#45474C", //数据类型 文字颜色
      bgColor: "", //背景色
      bordeColor: "",
      borderSize: "",
      borderRadiusTop: 0, //上圆角
      borderRadiusBottom: 0, //下圆角
      paddingLeft: 0, //内边距
      marginLeft: 0, //外边距
      marginTop: 0,
    },
    txtDefine: false, //文本自定义
  },
  {
    id: 2, //风格2
    numShow: [
      {
        id: 7,
        text: "订单量",
        num: "568",
        secNum: 0,
        showText: "今日订单(笔)",
        link: businessUrl + "/checkout.html",
      },
      {
        id: 8,
        text: "成交额",
        num: "12584.75",
        secNum: 0,
        showText: "今日成交额",
        link:businessUrl + '/checkout.html'
      },
      { id: 6, text: "客流", num: "425", secNum: 0, showText: "今日客流(人)" , link:businessUrl + '/checkout.html'},
    ], //要显示的数据
    secData: 1, // 二级菜单 显示的数据 1 => 昨日   2 => 本月
    style: {
      numColor: "#192233", //数字颜色
      textColor: "#777777", //数据类型 文字颜色
      secDataColor: "#7f7f7f", //数据类型 文字颜色
      bgColor: "#ffffff", //背景色
      bordeColor: "",
      borderSize: "",
      borderRadiusTop: 20, //上圆角
      borderRadiusBottom: 20, //下圆角
      paddingLeft: 0, //内边距
      marginLeft: 20, //外边距
      marginTop: 20,
    },
  },
  {
    id: 3, //风格3
    titleNum: {
      numShow: {
        id: 1,
        text: "账户余额",
        num: "8450.05",
        showText: "账户余额",
        link: memberDomain + '/pocket'
      }, //一级显示的数据  单选
      btn: {
        btnText: "提现", //按钮文字
        link: "", //按钮链接
        linkInfo: {
          linkText: "",
          type: "",
        },
      },
      style: {
        //一级数据的样式
        numColor: "#0080FF", //数字颜色
        btnColor: "#0080FF", //按钮颜色 边框和文字
        textColor: "#000000", //数据类型 文字颜色
      },
    },
    numShow: [
      { id: 3, text: "今日收益", num: "450.05", showText: "今日收益" , link:businessUrl + '/checkout.html'},
      { id: 4, text: "本月收益", num: "8950.43", showText: "本月收益" , link:businessUrl + '/checkout.html'},
      { id: 11, text: "上月收益", num: "9854.25", showText: "上月收益" , link:businessUrl + '/checkout.html'},
    ], //二级要显示的数据
    style: {
      numColor: "#000000", //数字颜色
      textColor: "#777777", //数据类型 文字颜色
      bgColor: "#ffffff", //背景色
      bordeColor: "",
      borderSize: "",
      borderRadiusTop: 20, //上圆角
      borderRadiusBottom: 20, //下圆角
      paddingLeft: 20, //内边距
      marginLeft: 20, //外边距
      marginTop: 20,
    },
    txtDefine: false, //文本自定义
  },
  {
    id: 4, //风格4
    numShow: [
      { id: 1, text: "余额", num: "8450.05", showText: "余额", link: memberDomain + '/pocket' },
      { id: 2, text: cfg_pointName, num: "0", showText: cfg_pointName, link: memberDomain + '/pocket?dtype=1' },
      { id: 3, text: "今日收益", num: "450.05", showText: "今日收益" , link:businessUrl + '/checkout.html'},
      { id: 4, text: "本月收益", num: "8950.43", showText: "本月收益", link:businessUrl + '/checkout.html' },
      { id: 5, text: "累计收益", num: "99888.08", showText: "累计收益" , link:businessUrl + '/checkout.html'},
      { id: 6, text: "今日客流", num: "1.3w", showText: "今日客流" },
    ], //二级要显示的数据
    style: {
      numColor: "#000000", //数字颜色
      textColor: "#777777", //数据类型 文字颜色
      bgColor: "#ffffff", //背景色
      bordeColor: "",
      borderSize: "",
      borderRadiusTop: 20, //上圆角
      borderRadiusBottom: 20, //下圆角
      paddingLeft: 32, //内边距
      marginLeft: 20, //外边距
      marginTop: 20,
    },
    txtDefine: false, //文本自定义
  },
];
var dataCountDefault = {
  numSet: {
    //数字的相关设置
    id: 1, //风格1
    numShow: [
      { id: 1, text: "余额", num: "8450.05", showText: "余额" , link: memberDomain + '/pocket'},
      { id: 2, text: cfg_pointName, num: "50", showText: cfg_pointName , link: memberDomain + '/pocket?dtype=1'},
      { id: 6, text: "今日客流", num: "20", showText: "今日客流" },
    ], //要显示的数据
    style: {
      numColor: "#FF3419", //数字颜色
      textColor: "#45474C", //数据类型 文字颜色
      bgColor: "", //背景色
      bordeColor: "",
      borderSize: "",
      borderRadiusTop: 24, //上圆角
      borderRadiusBottom: 24, //下圆角
      paddingLeft: 30, //内边距
      marginLeft: 30, //外边距
      marginTop: 20, //上间距
    },
    txtDefine: false, //文本自定义
  },
  splitLine: 0, // 是否显示分割线
  title: {
    show: false, //是否显示标题
    text: "数据概况", //标题
    style: {
      color: "#000000",
    },
  },
  more: {
    //显示更多  只有显示标题的时候 才能显示
    text: "查看更多",
    arr: 0, //1箭头显示 .0 是箭头不显示
    show: false, //是否显示
    link: "",
    linkInfo: {
      linkText: "",
      type: "",
    },
    style: {
      color: "#a1a7b3",
    },
  },
};

// 门店服务相关数据
var storeManDefault = {
  isStore: true, //是否是门店管理
  column: 4, //单行排列几个按钮 4或5
  title: {
    show: true, //是否显示标题
    text: "", //标题
    style: {
      color: "#333333",
    },
  },
  btns: [
    {
      id: 1,
      text: "", //文本
      link: "", //链接
      icon: "", //图标
      lab: {
        //只有id是排队、点餐、订座、买单才有
        show: false, //是否显示标签
        text: "", //标签
        // style:{ //样式
        //     bgColor:"#ff0000",
        //     color:"#ffffff",
        // }
      },
      linkInfo: {
        type: "",
        linkText: "",
      },
    },
  ],
  serviceShow: 0, //未开服务是否显示
  style: {
    color: "#333333", //文本颜色
    fontSize: 24, //字体大小 常规  加大
    cardBg: "#ffffff", //背景色
    btnSize: 80, //按钮大小
    marginTop: 20,
    marginLeft: 20,
    paddingLeft: 32,
    borderRadiusTop: 24,
    borderRadiusBottom: 24,
    labBgColor: "#FF524D",
    labColor: "#ffffff",
  },
  more: {
    //显示更多
    text: "查看更多",
    arr: 1, //1箭头显示 .0 是箭头不显示
    show: false, //是否显示
    link: "",
    linkInfo: {
      linkText: "",
      type: 0,
    },
    style: {
      color: "#a1a7b3",
      initColor: "#a1a7b3",
    },
  },
};

var storeOption = [
  {
    id: "maidan",
    text: "买单",
    lab: { show: true, text: "新收款" },
    icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/maidan.png`,
  },
  {
    id: "paidui",
    text: "排队",
    lab: { show: false, text: "" },
    icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/paidui.png`,
  },
  {
    id: "diancan",
    text: "点餐",
    lab: { show: true, text: "待确认" },
    icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/diancan.png`,
  },
  {
    id: "dingzuo",
    text: "订座",
    lab: { show: true, text: "待确认" },
    icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/dingzuo.png`,
  },
];

var pageSetDefault = {
  showType: 1, // 1 => 会员信息   2 => 指定内容
  // 头部
  title: {
    text: "商家中心", //只有showType 是2时即 显示指定内容时 才会用到
    posi: "left", // left => 居左  center  =>  居中
    style: {
      color: "#000000", // 标题颜色
    },
  },
  rBtns: {
    showType: 0, //  0 默认  1 => 不显示   2 => 自定义
    btns: [
      {
        "id":(new Date()).valueOf(),
        "text": "",
        "icon": "",
        "link": "",  
        "linkInfo":{ //链接相关信息
            "type":1, // 1 => 普通链接   2 => 扫码   3 => 下拉选项弹窗  4 => 拨打电话
            "linkText":"", //显示的文字
        }
      }
    ], //自定义按钮
    style: {
      color: "", // 按钮颜色
    },
  }, //右侧按钮
  bgType: "color", // image 表示渐变  color 表示纯色
  h5FixedTop: 1, //是否固定在头部
  style: {
    background: "#ffffff", // 头部背景
    start: 0, //渐变起始位置、
    borderRadius: 24, //圆角值
    marginTop: 20, //上间距
    marginLeft: 20, //左右间距
    bgColor1: "#F7F8FA", //纯色使用 或者 渐变起始色值
    bgColor2: "", //渐变结束色值
    bgImgColor: "", //需要获取
  },
};

// 列表导航
var listNavDefault = {
  sid: 1, //验证多个中的索引  重置复用组件需要
  iconShow: true, //是否显示图标
  splitLine: false, //分隔线
  qiandao: {
    show: false, //不显示
    icon:
      masterDomain +
      "/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png",
    style: {
      color: "#FFAA21",
      background: "#FFF8ED",
    },
  }, //签到
  style: {
    borderRadius: 24,
    marginTop: 22,
    marginLeft: 30,
    lineHeight: 88,
    color: "#212121",
  },
  tipStyle: {
    color: "#a1a7b3",
  },
  list: [
    {
      id: new Date().valueOf(),
      text: "",
      icon: "",
      link: "",
      linkInfo: {
        linkText: "",
        type: 1,
      },
      tip: {
        show: false, //是否线上说明文字
        text: "",
      },
    },
    {
      id: new Date().valueOf() + 1,
      text: "",
      icon: "",
      link: "",
      linkInfo: {
        linkText: "",
        type: 1,
      },
      tip: {
        show: false, //是否线上说明文字
        text: "",
      },
    },
    {
      id: new Date().valueOf() + 2,
      text: "",
      icon: "",
      link: "",
      linkInfo: {
        linkText: "",
        type: 1,
      },
      tip: {
        show: false, //是否线上说明文字
        text: "",
      },
    },
  ],
};

var advDefault = {
  sid: 1, //验证多个中的索引  重置复用组件需要
  column: 1, //列数 1 - 3
  list: [
    {
      image: "",
      link: "",
      linkInfo: {
        linkText: "",
        type: 1,
      },
    },
  ],
  style: {
    marginTop: 22,
    marginLeft: 30,
    borderRadius: 24,
    height: 140,
    splitMargin: 20, //广告间距
  },
};

// 订单基础设置
var orderDefault = {
  title: {
    show: true, //是否显示标题
    text: "订单管理", //标题
    style: {
      color: "#333333",
    },
  },
  more: {
    //显示更多
    text: "查看更多",
    arr: 1, //1箭头显示 .0 是箭头不显示
    show: false, //是否显示
    link: "",
    linkInfo: {
      linkText: "",
      type: 1,
    },
    style: {
      color: "#a1a7b3",
    },
  },
  styletype: 1, //1 => 常规样式  2 => 数字样式  3 => 角标样式
  orderInfo: {},
  style: {
    textColor: "#333333",
    labColor: "#FF3419",
    iconSize: 68,
    borderRadiusTop: 24,
    borderRadiusBottom: 24,
    marginTop: 20,
    marginLeft: 20,
    paddingLeft: 20,
  },
};

var orderConfig = {
  homemaking: {
    title: "家政订单",
    param:
      "/include/ajax.php?service=homemaking&action=orderList&store=1&page=1&pageSize=1",
    options: [
      // {id:2,text:'待付款',state:'state0', count:0, link:businessUrl + '/order-homemaking.html?state=0'},
      {
        id: 3,
        text: "待确认",
        state: "state1",
        count: 8,
        link: businessUrl + "/order-homemaking.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 4,
        text: "待服务",
        state: "state20",
        count: 23,
        link: businessUrl + "/order-homemaking.html?state=20",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 5,
        text: "待验收",
        state: "state5",
        count: 6,
        link: businessUrl + "/order-homemaking.html?state=5",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 6,
        text: "退款售后",
        state: "state8",
        count: 3,
        link: businessUrl + "/order-homemaking.html?state=8",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_07.png`,
      },
      {
        id: 7,
        text: "服务完成",
        state: "state6",
        count: 0,
        link: businessUrl + "/order-homemaking.html?state=6",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 8,
        text: "已结单",
        state: "state11",
        count: 0,
        link: businessUrl + "/order-homemaking.html?state=11",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 9,
        text: "退款成功",
        state: "state9",
        count: 0,
        link: businessUrl + "/order-homemaking.html?state=9",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 1,
        text: "全部订单",
        state: "totalCount",
        count: 288,
        link: businessUrl + "/order-homemaking.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
    ],
  },
  travel: {
    title: "旅游订单",
    param:
      "/include/ajax.php?service=travel&action=orderList&store=1&page=1&pageSize=1",
    options: [
      {
        id: 2,
        text: "待付款",
        state: "state0",
        count: 6,
        link: businessUrl + "/order-travel.html?state=0",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 3,
        text: "待使用",
        state: "state1",
        count: 23,
        link: businessUrl + "/order-travel.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_02.png`,
      },
      {
        id: 4,
        text: "退款售后",
        state: "state8",
        count: 3,
        link: businessUrl + "/order-travel.html?state=8",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_07.png`,
      },
      {
        id: 5,
        text: "交易完成",
        state: "state3",
        count: 54,
        link: businessUrl + "/order-travel.html?state=3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_06.png`,
      },
      {
        id: 6,
        text: "交易关闭",
        state: "state9",
        count: 0,
        link: businessUrl + "/order-travel.html?state=9",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_03.png`,
      },
      {
        id: 1,
        text: "全部订单",
        state: "totalCount",
        count: 288,
        link: businessUrl + "/order-travel.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_08.png`,
      },
    ],
  },
  shop: {
    title: "商城订单",
    param:
      "/include/ajax.php?service=shop&action=orderList&store=1&page=1&pageSize=1",
    options: [
      {
        id: 2,
        text: "待付款",
        state: "unpaid",
        count: 6,
        link: businessUrl + "/order-shop.html?state=0",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 3,
        text: "待使用",
        state: "unused",
        count: 23,
        link: businessUrl + "/order-shop.html?state=6,3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_02.png`,
      },
      {
        id: 4,
        text: "待发货",
        state: "ongoing",
        count: 5,
        link: businessUrl + "/order-shop.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_03.png`,
      },
      {
        id: 5,
        text: "配送中",
        state: "recei2",
        count: 0,
        link: businessUrl + "/order-shop.html?state=6,2",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_04.png`,
      },
      {
        id: 6,
        text: "退款售后",
        state: "refunded",
        count: 3,
        link: businessUrl + "/refundlist_shop.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_05.png`,
      },
      {
        id: 1,
        text: "全部订单",
        state: "totalCount",
        count: 288,
        link: businessUrl + "/order-shop.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_08.png`,
      },
    ],
  },
  paimai: {
    title: "拍卖订单",
    param:
      "/include/ajax.php?service=paimai&action=orderList&store=1&page=1&pageSize=1",
    options: [
      {
        id: 2,
        text: "待补款",
        state: "state7",
        count: 2,
        link: businessUrl + "/order-paimai.html?state=7",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 4,
        text: "待发货",
        state: "state6",
        count: 5,
        link: businessUrl + "/order-paimai.html?state=6",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_03.png`,
      },
      {
        id: 5,
        text: "待收货",
        state: "state3",
        count: 0,
        link: businessUrl + "/order-paimai.html?state=3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_04.png`,
      },
      {
        id: 6,
        text: "交易完成",
        state: "state4",
        count: 54,
        link: businessUrl + "/order-paimai.html?state=4",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_05.png`,
      },
      {
        id: 7,
        text: "已流拍",
        state: "state5",
        count: 3,
        link: businessUrl + "/order-paimai.html?state=5",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_06.png`,
      },
      {
        id: 1,
        text: "全部订单",
        state: "",
        count: 288,
        link: businessUrl + "/order-paimai.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_08.png`,
      },
    ],
  },
  tuan: {
    title: "团购订单",
    param:
      "/include/ajax.php?service=tuan&action=orderList&store=1&page=1&pageSize=1",
    options: [
      {
        id: 2,
        text: "待发货",
        state: "ongoing",
        count: 5,
        link: businessUrl + "/order-tuan.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 3,
        text: "已发货",
        state: "recei",
        count: 0,
        link: businessUrl + "/order-tuan.html?state=6",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_02.png`,
      },
      {
        id: 4,
        text: "交易完成",
        state: "success",
        count: 54,
        link: businessUrl + "/order-tuan.html?state=3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_06.png`,
      },
      {
        id: 5,
        text: "退款售后",
        state: "refunded",
        count: 3,
        link: businessUrl + "/order-tuan.html?state=4",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_05png`,
      },
      {
        id: 6,
        text: "退款成功",
        state: "closed",
        count: 0,
        link: businessUrl + "/order-tuan.html?state=7",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_07.png`,
      },
      {
        id: 1,
        text: "全部订单",
        state: "totalCount",
        count: 288,
        link: businessUrl + "/order-tuan.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_08.png`,
      },
    ],
  },
};

// 订单默认选择
var oDefaultConfig = {
  shop: {
    ajax: "/include/ajax.php?service=shop&action=orderList&store=1&page=1&pageSize=1",
    code: "shop",
    showData: [
      {
        id: 2,
        text: "待付款",
        state: "unpaid",
        count: 6,
        link: businessUrl + "/order-shop.html?state=0",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 4,
        text: "待发货",
        state: "ongoing",
        count: 5,
        link: businessUrl + "/order-shop.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_03.png`,
      },
      {
        id: 5,
        text: "配送中",
        state: "recei2",
        count: 0,
        link: businessUrl + "/order-shop.html?state=6,2",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_04.png`,
      },
      {
        id: 6,
        text: "退款售后",
        state: "refunded",
        count: 3,
        link: businessUrl + "/refundlist_shop.html",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_05.png`,
      },
    ],
    title: "商城订单",
  },
  paimai: {
    ajax: "/include/ajax.php?service=paimai&action=orderList&store=1&page=1&pageSize=1",
    code: "shop",
    showData: [
      {
        id: 2,
        text: "待补款",
        state: "state7",
        count: 2,
        link: businessUrl + "/order-paimai.html?state=7",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 4,
        text: "待发货",
        state: "state6",
        count: 5,
        link: businessUrl + "/order-paimai.html?state=6",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_03.png`,
      },
      {
        id: 5,
        text: "待收货",
        state: "state3",
        count: 0,
        link: businessUrl + "/order-paimai.html?state=3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_04.png`,
      },
      {
        id: 7,
        text: "已流拍",
        state: "state5",
        count: 3,
        link: businessUrl + "/order-paimai.html?state=5",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_06.png`,
      },
    ],
    title: "拍卖订单",
  },
  travel: {
    ajax: "/include/ajax.php?service=paimai&action=orderList&store=1&page=1&pageSize=1",
    code: "travel",
    showData: [
      {
        id: 2,
        text: "待付款",
        state: "state0",
        count: 6,
        link: businessUrl + "/order-travel.html?state=0",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 3,
        text: "待使用",
        state: "state1",
        count: 23,
        link: businessUrl + "/order-travel.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_02.png`,
      },
      {
        id: 4,
        text: "退款售后",
        state: "state8",
        count: 3,
        link: businessUrl + "/order-travel.html?state=8",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_07.png`,
      },
      {
        id: 5,
        text: "交易完成",
        state: "state3",
        count: 54,
        link: businessUrl + "/order-travel.html?state=3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_06.png`,
      },
    ],
    title: "旅游订单",
  },
  tuan: {
    ajax: "/include/ajax.php?service=tuan&action=orderList&store=1&page=1&pageSize=1",
    code: "tuan",
    showData: [
      {
        id: 2,
        text: "待发货",
        state: "ongoing",
        count: 5,
        link: businessUrl + "/order-tuan.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 3,
        text: "已发货",
        state: "recei",
        count: 0,
        link: businessUrl + "/order-tuan.html?state=6",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_02.png`,
      },
      {
        id: 4,
        text: "交易完成",
        state: "success",
        count: 54,
        link: businessUrl + "/order-tuan.html?state=3",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_06.png`,
      },
      {
        id: 5,
        text: "退款售后",
        state: "refunded",
        count: 3,
        link: businessUrl + "/order-tuan.html?state=4",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_07.png`,
      },
    ],
    title: "团购订单",
  },
  homemaking: {
    ajax: "/include/ajax.php?service=homemaking&action=orderList&store=1&page=1&pageSize=1",
    code: "homemaking",
    showData: [
      {
        id: 3,
        text: "待确认",
        state: "state1",
        count: 8,
        link: businessUrl + "/order-homemaking.html?state=1",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 4,
        text: "待服务",
        state: "state20",
        count: 23,
        link: businessUrl + "/order-homemaking.html?state=20",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 5,
        text: "待验收",
        state: "state5",
        count: 6,
        link: businessUrl + "/order-homemaking.html?state=5",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_01.png`,
      },
      {
        id: 6,
        text: "退款售后",
        state: "state8",
        count: 3,
        link: businessUrl + "/order-homemaking.html?state=8",
        icon: `${masterDomain}/static/images/admin/siteMemberPage/defaultImg/order_07.png`,
      },
    ],
    title: "家政订单",
  },
};
