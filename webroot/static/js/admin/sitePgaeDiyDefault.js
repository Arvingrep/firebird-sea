// 链接数据列表
var linkListBox = [
	{
		"listName":"个人中心",
		"list":[{
			"link":memberDomain + "/upgrade.html",
			"linkText":"VIP中心"
		},{
			"link":masterDomain + "/user",
			"linkText":"个人中心"
		},{
			"link":memberDomain + "/profile.html",
			"linkText":"个人资料"
		},{
			"link":memberDomain + "/setting.html",
			"linkText":"系统设置"
		},{
			"link":memberDomain + "/qiandao",
			"linkText":"签到"
		},{
			"link":masterDomain + "/integral",
			"linkText":"积分商城"
		},{
			"link":memberDomain + "/pocket.html?dtype=0",
			"linkText":"账户余额"
		},{
			"link":memberDomain + "/pocket.html?dtype=1",
			"linkText":"我的积分"
		},{
			"link":memberDomain + "/myquan",
			"linkText":"我的优惠券"
		},{
			"link":memberDomain + "/consume",
			"linkText":"购物卡余额"
		},{
			"link":memberDomain + "/deposit.html?paytype=deposit",
			"linkText":"余额充值"
		},{
			"link":memberDomain + "/recharge.html",
			"linkText":"购物卡充值"
		},{
			"link":memberDomain + "/collect.html",
			"linkText":"我的收藏"
		},{
			"link":memberDomain + "/manage.html",
            "mini":"/pages/packages/mcenter/fabu/fabu",
			"linkText":"我的发布"
		},{
			"link":memberDomain + "/history.html",
			"linkText":"历史浏览"
		},{
			"link":masterDomain + "/user/29/fans",
			"linkText":"我的粉丝"
		},{
			"link":masterDomain + "/user/29/follow",
			"linkText":"我的关注"
		},{
			"link":memberDomain + "/im/commt_list.html#zan",
			"linkText":"我的获赞"
		},{
			"link":memberDomain + "/message.html",
			"linkText":"我的消息"
		},{
			"link":memberDomain + "/fabuJoin_touch_popup_3.4.html",
			"linkText":"快捷发布"
		},{
			"link":memberDomain,
			"linkText":"我的"
		},{
			"link":masterDomain + "/shop/cart.html",
			"linkText":"购物车"
		},{
			"link":memberDomain + "/orderlist.html?state=1",
             "mini":"/pages/member/order/index?state=1",
			"linkText":"待付款"
		},{
			"link":memberDomain + "/orderlist.html?state=2",
            "mini":"/pages/member/order/index?state=2",
			"linkText":"待使用"
		},{
			"link":memberDomain + "/orderlist.html?state=3",
             "mini":"/pages/member/order/index?state=3",
			"linkText":"待发货"
		},{
			"link":memberDomain + "/orderlist.html?state=4",
             "mini":"/pages/member/order/index?state=4",
			"linkText":"待收货"
		},{
			"link":memberDomain + "/orderlist.html?state=5",
             "mini":"/pages/member/order/index?state=5",
			"linkText":"待评价"
		},{
			"link":memberDomain + "/orderlist.html?state=6",
             "mini":"/pages/member/order/index?state=6",
			"linkText":"待分享"
		},{
			"link":memberDomain + "/orderlist.html?state=7",
             "mini":"/pages/member/order/index?state=7",
			"linkText":"退款售后"
		},{
			"link":memberDomain + "/orderlist.html",
             "mini":"/pages/member/order/index",
			"linkText":"个人订单(全部)"
		},{
			"link":memberDomain + "/order.html",
            "mini":"/pages/packages/mcenter/order/order",
			"linkText":"订单列表(汇总)"
		},{
			"link":memberDomain + "/address.html",
			"linkText":"收货地址管理"
		},{
			"link":memberDomain + "/quan.html",
			"linkText":"待兑券码"
		},{
			"link":memberDomain + "/invite.html",
			"linkText":"邀新有礼"
		},{
			"link":memberDomain + "/fenxiao.html",
			"linkText":"分销"
		},{
			"link":memberDomain + "/reward.html",
			"linkText":"打赏收益"
		},{
			"link":memberDomain + "/security.html",
			"linkText":"安全中心"
		},{
			"link":masterDomain + "/mobile.html",
			"linkText":"下载APP"
		},{
			"link":"tel:" + hotLine,
			"linkText":"官方客服"
		}]
	},
	{
		"listName":"商家/权限",
		"list":[{
			"link":businessUrl + "/?currentPageOpen=1",
			"linkText":"切换商家版"
		},{
			"link":memberDomain + "/workPlatform.html",
			"linkText":"员工工作台"
		},{
			"link":memberDomain + "/enter_contrast.html",
			"linkText":"入驻商家"
		},{
			"link":memberDomain + "/security-shCertify.html",
			"linkText":"商家认证"
		},{
			"link":masterDomain + "/sz/business/detail.html",
			"linkText":"商家主页"
		}]
	}
];


// 组件数据列表
var moduleOptions = [
    { id: 1, text: '搜索栏', icon: '', more: 0, typename: 'search' },
    { id: 2, text: '顶部菜单', icon: '', more: 0, typename: 'topMenu' },
    { id: 3, text: '顶部图标组', icon: '', more: 0, typename: 'topBtns' },
    { id: 4, text: '轮播图', icon: '', more: 0, typename: 'swiper' },
    { id: 5, text: '导航按钮组', icon: '', more: 0, typename: 'sNav' },
    { id: 27, text: '普通按钮组', icon: '', more: 1, typename: 'btns' },
    { id: 6, text: '瓷片广告位', icon: '', more: 1, typename: 'adv' },
    { id: 7, text: '分隔标题', icon: '', more: 1, typename: 'title' },
    { id: 8, text: '展播链接', icon: '', more: 1, typename: 'advLinks' },
    { id: 9, text: '商品组', icon: '', more: 1, typename: 'pros' },
    { id: 10, text: '商户组', icon: '', more: 1, typename: 'busis' },
    { id: 28, text: '数据列表', icon: '', more: 1, typename: 'list' },
    { id: 11, text: '切换标题', icon: '', more: 1, typename: 'label' },
    { id: 12, text: '热区', icon: '', more: 1, typename: 'hotzone' },
    { id: 13, text: '新人礼', icon: '', more: 1, typename: 'newgift' },
    { id: 14, text: '优惠券', icon: '', more: 1, typename: 'quan' },
    { id: 15, text: '邀新', icon: '', more: 0, typename: 'invite' },
    { id: 16, text: '秒杀', icon: '', more: 1, typename: 'miaosha' },
    { id: 17, text: '拼团', icon: '', more: 1, typename: 'pintuan' },
    { id: 18, text: '砍价', icon: '', more: 1, typename: 'kanjia' },
    { id: 19, text: '抢购', icon: '', more: 1, typename: 'qianggou' },
    { id: 20, text: '消息通知', icon: '', more: 1, typename: 'msg' },
    { id: 21, text: '关注公众号', icon: '', more: 0, typename: 'wechat' },
    { id: 22, text: '悬浮按钮', icon: '', more: 0, typename: 'hoverBtns' },
    { id: 23, text: '返回顶部', icon: '', more: 0, typename: 'totop' },
    { id: 24, text: '便民导航', icon: '', more: 0, typename: 'nav' },
    { id: 25, text: '平台数据', icon: '', more: 0, typename: 'data' },
    { id: 26, text: '下单提醒', icon: '', more: 0, typename: 'ordertip' },
    { id: 29, text: '弹窗', icon: '', more: 0, typename: 'pop' },
];


// 搜索栏相关配置
var searchColConfig = {
    // 搜索栏可添加的组件
    searchMods:[{ id:1, typename:'logo', text:'logo' },{ id:5, typename:'city', text:'选择城市' },{ id:2, typename:'img', text:'商品搜图' },{ id:3, typename:'hotkey', text:'搜索热词' },{ id:4, typename:'btn', text:'搜索按钮' },],
    // 背景样式类型
    bgStyle:[ {id:1,text:'渐变'},{id:2,text:'弧线'},{id:3,text:'圆角'},{id:0,text:'无'}, ]
};

// 搜索栏默认设置
var searchColDefault = {
    "showMods":[4], //搜索栏显示的组件
    "bgMask":4, //背景遮罩  2 => 弧线  3 => 圆角  4 => 无 => 表示圆角值是0
    "layout":1,  //布局  1 => 1行  2 => 2行
    "bgType":'color', //color => 纯色背景   image => 背景图片
    "style":{
        "bgColor":'#FF5736', // => 背景色
        "bgImage":'', // =>背景图
        "bgHeight":88, //背景高度
        "borderRadius":40, //圆角
        "marginLeft":30,//左右间距
    },

    //选中该组件 才会显示
    "logo":{
        "position":"left",  // left => 居左     right => 居右
        "path":"", //logo的上传地址
        "color":"", //logo颜色
    },
    // 城市
    "city":{
        "styletype":2,  // 风格1/2
        "iconColor":"", //图标的颜色
        "textColor":"#ffffff", //文本颜色
    },

    // 搜图
    "searchImg":{
        "path":masterDomain + '/static/images/admin/siteConfigPage/camera.png',
        "iconColor":"",
    },

    // 搜索按钮
    "searchBtn":{
        "styletype":2, //样式1/2
        "style":{
            "background":"#FB3628",
            "color":"#333333"
        }
    },

    // 搜索热词
    "hotKeysConfig":{
        "show":0, // 0 => 不显示   1 => 显示
        "style":{
            "color":"#ADAFBA",
            "background":"#ffffff",
            "opacity":100, //背景色透明度
        }
    }, 

    // 右上区域
    "rtBtns":{
        "txtStyle": 0, // 0 => 无字  1 => 文本（小）  2 => 文本（大）
        "iconColor":"", //图标的颜色
        "textColor":"#ffffff", //文本颜色
        "btns": [
        //     {
        //     "id":1,
        //     "text": "",
        //     "icon": "",
        //     "link": "",  
        //     "linkInfo":{ //链接相关信息
        //         "type":1, // 1 => 普通链接   2 => 扫码   3 => 下拉选项弹窗  4 => 拨打电话
        //         // "selfSetTel":0, //是否是电话
        //         "linkText":"", //显示的文字
        //     },

        //     //下拉选项相关设置
        //     // "dropMenu":{
        //     //     "styletype":1,  // 1 => 样式一    2 => 样式二
        //     //     "linkArr":[{
        //     //         "text": "",
        //     //         "icon": "",
        //     //         "link": "",  
        //     //         "linkInfo":{ //链接相关信息
        //     //             "type":1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
        //     //             // "selfSetTel":0, //是否是电话
        //     //             "linkText":"", //显示的文字
        //     //         }, 
        //     //     }]
        //     // },  
        // }
    ],
    },

    // 搜索框相关设置
    "searchCon":{
        "keysArr":[], //搜索关键词
        "height":0, // 0 => 常规   1 => 加高
        "style":{
            "borderRadius":36, //圆角值
            "height":64, // 64 => 常规 / 加高
            "background":"#FFFFFF", //背景色
            "opacity":100, //背景透明度
            "iconColor":"", //图标颜色
            "color":"#ADAFBA",  //文本颜色
        }
    },
}

// 数组 数字
var numToText = ['一','二','三','四','五','六','七','八','九'];

// 顶部右侧按钮 下拉菜单默认配置
var dropMenu  = {
    styletype:1,  // 1 => 样式一    2 => 样式二
    linkArr:[{
        text: "",
        icon: "",
        link: "",  
        linkInfo:{ //链接相关信息
            type:1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
            // "selfSetTel":0, //是否是电话
            linkText:"", //显示的文字
        }, 
    },{
        text: "",
        icon: "",
        link: "",  
        linkInfo:{ //链接相关信息
            type:1, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
            // "selfSetTel":0, //是否是电话
            linkText:"", //显示的文字
        }, 
    }]
}

// 轮播图的默认数据
var swiperFormDeFault =  {
    "styletype":1, //风格1-4 
    "showText":false, //是否显示文本
    "litpics":[
        {
            id:1,
            path:"", //图片路径
            link:"", //链接
            text:"", //标题
            linkInfo:{
                type:"",
                linkText:"",
            }
        },
        {
            id:2,
            path:"", //图片路径
            link:"", //链接
            text:"", //标题
            linkInfo:{
                type:"",
                linkText:"",
            }
        },
        {
            id:3,
            path:"", //图片路径
            link:"", //链接
            text:"", //标题
            linkInfo:{
                type:"",
                linkText:"",
            }
        },
    ],
    "shadowShow":0, //是否显示边框投影 0 => 不显示   1 => 显示
    "style":{
        "maskColor":"#000000", // 遮罩颜色
        "color":"#ffffff", // 标题颜色
        "dotColor":"#ffffff", //当前指示点的颜色
        "borderRadius":24,  //圆角值
        "height":260,  //高度
        "marginTop":0,  //上间距
        "marginLeft":30  //左右间距
    }
};


// 导航按钮的默认数据
var sNavDefault = {
    "cardStyle":false, //显示卡片样式
    "btnRadius":false, //按钮圆角
    "layout":2, // 布局是2/1行
    "column":5, //布局 单行4/5个
    "showLabs":[], //显示标签的按钮
    "labsData":[], //显示标签的内容
    "slide":1, //滑动  0 => 平滑  1 => 分页
    "style":{
        "color":"#333333", //文本颜色
        "fontSize": 24, //字体大小 常规  加大
        "cardBg":'#ffffff', //卡片背景色
        "dotColor":"#FB3527", //分页指示点
        "btnRadius":50, //按钮圆角
        "cardRadius":24, //卡片圆角
        "btnSize":88, //按钮大小
        "marginTop":0, 
        "marginLeft":30,
    },
    activeInd:0, //当前选中索引
};

// 普通按钮的默认设置
var btnsDefault = {
    "cardStyle":true, //显示卡片样式
    "title":{
        "show":true, //是否显示标题
        "text":"", //标题
        "style":{
            "color":"#333333"
        }
    }, 
    "more":{  //显示更多
        "text":"查看更多",
        "arr":1, //1箭头显示 .0 是箭头不显示
        "show":false, //是否显示
        "link":"",
        "linkInfo":{
            "linkText":"",
            "selfSetTel":0
        },
        "style":{
            "color":"#a1a7b3",
            "initColor":"#a1a7b3",
        }
    },
    "btnRadius":false, //是否有圆角
    "layout":2, // 布局是2/1行
    "column":5, //布局 单行4/5个
    "btnsArr":[{
        "id":1,
        "text":"",  //文本
        "link":"", //链接
        "icon":"",//图标
        "lab":{
            "show":false, //是否显示标签
            "text":"", //标签
            "style":{ //样式
                "bgColor":"#ff0000",
                "color":"#ffffff",
            }
        },
        "linkInfo":{
            "type":"",
            "linkText":"",
        } 
    }], //添加的按钮
    // "showLabs":[], //选中的显示标签的按钮
    // "labsData":[], //显示标签的内容
    "slide":1, //滑动  0 => 平滑  1 => 分页
    "style":{
        "color":"#333333", //文本颜色
        "fontSize": 24, //字体大小 常规  加大
        "cardBg":'#ffffff', //卡片背景色
        "dotColor":"#FB3527", //分页指示点
        "btnRadius":24, //按钮圆角
        "cardRadius":24, //卡片圆角
        "btnSize":80, //按钮大小
        "marginTop":22, 
        "marginLeft":30,
    },
    "activeInd":0, //当前显示的索引
};         

// 顶部图标按钮
var topBtnsDeFault = {
    "column":4, // 一行3/4/5个
    "style":{
        "color":"",
        "fontSize":24,
        "height":140, //高度
        "marginTop":0, //上间距
        "marginLeft":30, //左右间距
        "iconHeight":64, //图标高度
    },
    "btnsArr":[{
        "id":1,
        "text":"",
        "link":"",
        "lab":{
            "show":false, //是否显示标签
            "text":"", //标签
            "style":{ //样式
                "bgColor":"#ff0000",
                "color":"#ffffff",
            }
        },
        "linkInfo":{
            "type":"",
            "linkText":"",
        } 
    },
    {
        "id":2,
        "text":"",
        "link":"",
        "lab":{
            "show":false, //是否显示标签
            "text":"", //标签
            "style":{ //样式
                "bgColor":"#ff0000",
                "color":"#ffffff",
            }
        },
        "linkInfo":{
            "type":"",
            "linkText":"",
        } 
    },
    {
        "id":3,
        "text":"",
        "link":"",
        "lab":{
            "show":false, //是否显示标签
            "text":"", //标签
            "style":{ //样式
                "bgColor":"#ff0000",
                "color":"#ffffff",
            }
        },
        "linkInfo":{
            "type":"",
            "linkText":"",
        } 
    },{
        "id":4,
        "text":"",
        "link":"",
        "lab":{
            "show":false, //是否显示标签
            "text":"", //标签
            "style":{ //样式
                "bgColor":"#ff0000",
                "color":"#ffffff",
            }
        },
        "linkInfo":{
            "type":"",
            "linkText":"",
        } 
    }], //添加的按钮
}


// 展播组件的默认设置
var advLinksDefault = {
    "styletype":2,  //样式1/2
    "bgType":"color", //color => 背景色  image => 背景图
    "showDesc":false, //显示补充描述
    "showBtn":false, //显示按钮
    "title":{  //只有样式2显示
        "type":1, // 1 => 文字   2 => 图片
        "text":'', //标题
        "img":'', //标题是图片
        "style":{
            "color":"#333333", //文字样式
        }
    },
    "more":{  //显示更多 只有样式2显示
        "text":"查看更多",
        "arr":1, //1箭头显示 .0 是箭头不显示
        "show":true, //是否显示
        "link":"",
        "linkInfo":{
            "linkText":"",
            "selfSetTel":0
        },
        "style":{
            "color":"#7C50FD",
            "initColor":"#7C50FD",
        }
    },
    "linksArr":[{
        "id":1,
        "link":'', //链接
        "img":'',  //图片
        "text":'', //文字
        "desc":'', //描述
        "btnText":'', //按钮文字
        "linkInfo":{
            "type":'', //链接类型
            "linkText":'', //链接名称
        },
    }],
    "imgPosi":3, //图片位置  1 => 左  2 => 右  3 => 右下
    "style":{
        "btnColor":'#8E5CFF',  //按钮颜色
        "btnBgColor":'#EDE8FF', //按钮背景
        "textColor":'#1F2021', //文字颜色
        "descColor":'#797A80', //描述颜色
        "borderRadius":24,  //圆角值
        "marginTop":22,  //上间距
        "marginLeft":30, //左右间距
        "bg_image":'',  //背景图
        "bg_color":'#E7D6FF' //背景色
    }
};


// 消息通知默认设置
var msgDefault = {
    labShow:false, //是否有标签  还得看标签内容是否为空
    styletype:1, // 样式1/2/3/4
    title:{
        text:'',
        image:'',
        type:'text',  // text => 文字   image => 图片
        style:{
            color:'#FE6A19', 
        }
    },
    msgType:1, // 1 => 平台公共  2 => 商城公告  3 => 资讯  4 => 手动添加
    order:1 , // 1 => 最新   2 => 最热
    articleType:0, // 资讯分类
    articleTypeArr:[], //资讯分类  全
    listArr:[{
        lab:'', //标签
        link:'', //链接
        text:'', //内容太
        linkInfo:{
            lineText:'',
            type:1,
        }
    }], //添加的公告

    dlistArr:[], // 直接获取的通知
    listShow:10, //显示数据 最多20
    style:{
        textColor:'#192233', //内容颜色
        bgColor:'#ffffff',//背景色 
        labColor:'#EF453D', //标签颜色
        labBgColor:'#FFE5D4', //标签背景
        labBgOpacity:100, //透明度
        labBorderColor:'#ffffff', //标签边框
        labBorderOpacity:100, //透明度
        opacity:100, //背景透明度
        borderRadius:16, //圆角值
        fontSize:24, //高度
        marginTop:22, //上间距
        marginLeft:30 , //左右间距
        height:80, //高度
    }
};


// 消息通知的几种默认
var msgStyleArr = [{
    id:1, //样式1
    labShow:false,
    title:{
        text:'',
        img:'',
        bgType:'color',  // color => 文字   image => 图片
        style:{
            color:'#FE4D38', 
        } 
    },
    style:{
        textColor:'#192233', //内容颜色
        bgColor:'#ffffff',//背景色 
        labColor:'#EF453D', //标签颜色
        labBgColor:'#FFE5D4', //标签背景
        labBgOpacity:100, //透明度
        labBorderColor:'#ffffff', //标签边框
        labBorderOpacity:100, //透明度
        opacity:100, //背景透明度
        borderRadius:16, //圆角值
        fontSize:24, //高度
        marginTop:0, //上间距
        marginLeft:30 , //左右间距
    }
},{
    id:2, //样式2
    labShow:true,
    title:{
        text:'',
        img:'',
        bgType:'color',  // color => 文字   image => 图片
        style:{
            color:'#1F2021', 
           
        } 
    },
    style:{
        textColor:'#49494D', //内容颜色
        bgColor:'#ffffff',//背景色 
        labColor:'#EF453D', //标签颜色
        labBgColor:'#FFF0EB', //标签背景
        labBgOpacity:100, //透明度
        labBorderColor:'', //标签边框
        labBorderOpacity:100, //透明度
        opacity:100, //背景透明度
        borderRadius:16, //圆角值
        fontSize:24, //高度
        marginTop:0, //上间距
        marginLeft:30 , //左右间距
    }
},{
    id:3, //样式2
    labShow:false,
    title:{
        text:'',
        img:'',
        bgType:'color',  // color => 文字   image => 图片
        style:{
            color:'#1F2021', 
            
        } 
    },
    style:{
        textColor:'#A2571B', //内容颜色
        bgColor:'#F5F5F7',//背景色 
        labColor:'#FFFFFF', //标签颜色
        labBgColor:'#FF5147', //标签背景
        labBgOpacity:100, //透明度
        labBorderColor:'', //标签边框
        labBorderOpacity:100, //透明度
        opacity:100, //背景透明度
        borderRadius:16, //圆角值
        fontSize:24, //高度
        marginTop:0, //上间距
        marginLeft:30 , //左右间距
    }
},{
    id:4, //样式2
    labShow:false,
    title:{
        text:'',
        img:'',
        bgType:'color',  // color => 文字   image => 图片
        style:{
            color:'#1F2021', 
            
        }
    },
    style:{
        textColor:'#A2571B', //内容颜色
        bgColor:'#FFFFFF',//背景色 
        labColor:'#FFFFFF', //标签颜色
        labBgColor:'#FF5147', //标签背景
        labBgOpacity:100, //透明度
        labBorderColor:'', //标签边框
        labBorderOpacity:100, //透明度
        opacity:100, //背景透明度
        borderRadius:16, //圆角值
        fontSize:24, //高度
        marginTop:0, //上间距
        marginLeft:30 , //左右间距
    }
}];


// 弹窗默认设置
var popDefault = {
    userType:0,  // 0 => 全部用户   3 => vip用户  1 => 个人用户  2 => 企业用户
    loginState:0, // 0 => 不需要登录   1 => 需要登录
    showType:0 ,  // 0 =>按次数  totalCount是显示的次数    1 => 按天数   day是每天弹几次 
    totalCount: 10, 
    day:2 , //是每天弹2次 

    link:'', //弹窗链接
    linkInfo:{
        lineText:'',
        type:1
    }, //弹窗链接
    close_btn:'right', // right => 右上   bottom => 下方 
    image:'', //弹窗的图片
    style:{
        width:560, //弹窗宽度
        borderRadius:50, //圆角
    }
}


// 悬浮按钮设置
var hoverBtn = {
    id:1,
    btnTop:{
        btnShow:false, //返回顶部按钮 是否显示悬浮按钮
        indexToTop:true, //返回顶部按钮  底部按钮 点击返回顶部
        styletype:1,  //1,2,3,4  5 =>
    },
    scrollHide:true, //页面滑动 隐藏按钮
    btnType:1, //按钮类型   1 => 普通   2 => 置顶
    position:4, // 1 => 左上  2 => 右上   3 => 左下  4 => 右下;  返回顶部 只有3、4选项
    link:'',
    linkInfo:{
        lineText:'',
        type:1
    },
    icon:'',
    style:{
        btnSize:140, //按钮尺寸
        borderRadius:0, //按钮圆角
        hSize:24,  //水平间距 left,right
        vSize:50,  //垂直距离  top,bottom 
    }
}
hoverBtnsDefault = {
    btnsArr:[hoverBtn],
}


// 页面设置默认值
var pageSetDefault = {
    search:{
        showLeftMods:[], // logo 选中并显示在左侧才会在showLeftModes中有
        logo:{ //logo显示时才会出现
            path:'',
            color:'', //logo的颜色 
        } , //logo的路径  不同步
        rightBtns:{  //右侧显示的按钮
            rbtns:[], // 添加的右侧按钮
            logo:{
                show:true,
                path:'', //新设置的logo
                color:'', //新设置的logo颜色
            }
        },
        searchBtn:true, //是否显示搜索按钮
        searcIcon:true, //是否显示搜图图标
        style:{
            bgColor:'#ffffff', // => 背景色
            borderColor:'', // => 边框色
            iconColor:'', //图标颜色
            textColor:'#999999',  // 文字颜色
            searchIcon:'',//搜图图标颜色
            cityColor:'#333333', // 城市文本色
        }
    },
    style:{
        headBg:'#FF5736', //头部背景
        bgColor:'#f5f5f7', //页面背景
        marginTop:22, //改变全局的marginTop
        marginLeft:30, //改变全局的左右间距
    }

}

// 商城 商品需要配置的数据
var shopFormData = {
    imgScale:1, // 1 => 适应图片  2 => 1:1  3 => 4:3   4 => 3:2
    style:{
        fontSize:30,  //标题字号  26 => 常规  28 => 加大
        color:'#333333', //字体颜色
        pcolor:'#ff0000' , //价格字体颜色
    },
    // 排序选项
    orderby:[{
        value:'',
        text:'默认'
    },{
        value:1,
        text:'销量'
    },{
        value:3,
        text:'价格'
    }],
    // 返佣
    fanyong:{
        show:false, //是否显示
        color:'#ffffff',
    },
    // 会员价
    huiyuan:{
        show:false, //是否显示
    },
    // 划线价
    huaxian:{
        show:false, //是否显示
        color:'#666666',
    },
    // 活动状态
    hdState:{
        show:false, //是否显示
    },
    // 销量
    sale:{
        show:false, //是否显示
        color:'#ffffff',
    },
    // 可用券
    quan:{
        show:false, //是否显示
        color:'#ffffff',
    },
    // 副标题
    stitle:{
        show:false, //是否显示
        color:'#ffffff',
    },

    cartIcon:{
        cartStyle:1, // 1、2、3 => 默认图标     4 =>自定义
        path:'',  //自定义上传路径
        style:{
            size:20, //图标大小  只有自定义才生效
            color:'',
            bgColor:'',
        },
    },
    advList:{
        show:false, //是否显示
        list:[], //列表数据
    }, //广告列表

}



// 招聘需要配置的数据
var jobFormData = {
    togrey:false, //看过置灰  点击过 标题设置灰色
    style:{
        fontSize:30,
        color:'#333333', //字体颜色
        scolor:'#ff0000', //薪资颜色
    }, 

    jingyan:{  //经验
        show:false,
        color:'#ffffff', //文字颜色
        bgColor:'#f5f5f5' , //背景色
    },
    xueli:{  //学历
        show:false,
        color:'#ffffff', //文字颜色
        bgColor:'#f5f5f5' , //背景色
    },
    fuli:{  //福利
        show:false,
        color:'#ffffff', //文字颜色
        bgColor:'#f5f5f5' , //背景色
    },
    cname:{  //公司名
        show:false,
        color:'#ffffff'
    },
    cinfo:{  //公司信息
        show:false,
        color:'#ffffff'
    },
    area:{  //就职区域
        show:false,
        color:'#ffffff'
    },

    // 普工  部分同上
    posttype:{  //全职兼职
        show:false,
        color:'#ffffff', //文字颜色
        bgColor:'#f5f5f5' , //背景色
    },
    phone:{  //联系人
        show:false,
        showText:'', //按钮文字
        color:'#ffffff', //文字颜色
        bgColor:'#f5f5f5' , //背景色
    },
    carea:{  //公司地区
        show:false,
        color:'#ffffff', //文字颜色
    },

    sex:{  //性别
        show:false,
        color:'#ffffff', //文字颜色
    },

    age:{  //年龄
        show:false,
        color:'#ffffff', //文字颜色
    },

    tel:{ // 电话
        styletype:1, //样式 1/2
        showText:'', //显示文字
        iconColor:'', //图标颜色
        color:'#ffffff', //文字颜色
    },

};

// 分类信息 需要配置的数据
var infoFormData = {
    orderby:[{
        value:'',
        text:'默认排序'
    },{
        value:'rec=1',
        text:'推荐排序'
    },{
        value:1,
        text:'最新发布' 
    },{
        value:2,
        text:'最多浏览'
    }],
    imgScale:3, // 1 => 适应图片  2 => 1:1  3 => 4:3   4 => 3:2
    style:{
        fontSize:30,  //标题字号  26 => 常规  28 => 加大
        color:'#333333', //字体颜色
    },

    // 发布者
    auth:{
        show:false,  //是否显示
        color:'#333333'  //文字颜色
    },

    // 发布时间
    pubDate:{
        show:false, 
        color:'#666666', 
    },

    // 标签
    label:{
        show:false,
        color:'#666666' , //文字颜色
        bgColor:'#f5f5f5', //背景色
    },

    // 坐标定位
    location:{
        show:false, 
        color:'#888888'
    },

    // 坐标定位
    locatin:{
        show:false, 
        color:'#888888', //文字颜色
        iconColor:'', //图标颜色
    },

    // 浏览量
    click:{
        show:false,
        color:'#888888', //文字颜色
        iconColor:'', //图标颜色  空则是默认颜色
    },

    // 收藏
    collect:{
        styletype:1, //  1 => 图标  2 => 图标+文字
        color:'#333333',
        showText:'', //显示文字
        has_color:'#FFBA00', //已收藏
        iconColor:'', //图标颜色
        has_iconColor:'', //已收藏图标颜色  无
    },

    // 电话
    tel:{
        styletype:1, //样式 1/2
        showText:'', //显示文字
        iconColor:'', //图标颜色
        color:'#ffffff', //文字颜色
    },

    // 推广红包
    hb:{
        show:false,
        showText:'', //显示文字
        color:'#ffffff', //文字颜色
        bgColor:'', //背景颜色
        opacity:100, //透明度   100 => 不透明  0 => 全透明
    },

    // 分享
    share:{
        show:false,
        showText:'', //显示文字
        iconColor:'', //图标颜色
        color:'#ffffff', //文字颜色
    },

    // 信息流广告   只有列表布局才显示  => info,article,tieba
    flowAdv:{
        show:false,
        android:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        h5:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        wxmini:'',  //微信小程序
        dymini:'', //抖音小程序
    },
    

    // 列表广告  只显示在 双列布局或者瀑布流布局   显示在列表第一个  有滚动效果
    advList:{
        show:false, //列表广告
        list:[],
    },

};


// 贴吧 需要配置的数据
var tiebaFormData = {
    imgScale:3, // 1 => 适应图片  2 => 1:1  3 => 4:3   4 => 3:2
    style:{
        fontSize:30,  //标题字号  26 => 常规  28 => 加大
        color:'#333333', //字体颜色
        authColor:'#333333' , //发布人文字颜色
    },

    conType:{ //帖子分类
        show:false,
        color:'#333333'
    },

    ip:{ //ip地址
        show:false,
        color:'#333333'
    },

    click:{ //点击量
        show:false,
        color:'#333333'
    },

    comment:{ //评论
        show:false,
        color:'#333333',
        iconColor:'', //默认图标色
    },

    zan:{ //赞
        show:false,
        color:'#333333',
        iconColor:'', //默认图标色
        has_color:'#ff0000' , //已赞颜色
    },

    pubDate:{ //发布时间
        posi:'top', //发布时间的位置   top => 头部   bottom => 底部
        color:'#333333',
        iconColor:'', //图标色
    },

    // 信息流广告   只有列表布局才显示  => info,article,tieba
    flowAdv:{
        show:false,
        android:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        h5:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        wxmini:'',  //微信小程序
        dymini:'', //抖音小程序
    },
    

    // 列表广告  只显示在 双列布局或者瀑布流布局   显示在列表第一个  有滚动效果
    advList:{
        show:false, //列表广告
        list:[],
    },
};


// 顺风车
var sfcarFormData = {
    style:{
        fontSize:30,  //标题字号  26 => 常规  28 => 加大
        color:'#333333', //字体颜色
        startDate:'#666666' , //出发日期
        startTime:'#666666' , //出发时间
        color_type1:'#ffffff', //顺风车/乘客  文字
        bgColor_type1:'#4285FF', //顺风车/乘客  背景色
        color_type2:'#ffffff', //货车/货物：文字
        bgColor_type2:'#00c884', //货车/货物  背景色
    },

    pubDate:{  //发布时间
        show:false,
        color:'#333333',
    },

    remark:{  //备注
        show:false,
        color:'#333333',
        titColor:'#333333' , //标题色
    },

    seat:{  //座位人数
        show:false,
        color:'#333333',
        bgColor:'#333333' , //背景色
    },

    label:{ //信息标签
        show:false,
        color:'#333333',
        bgColor:'#333333' , //背景色
    },
    // 电话
    tel:{
        styletype:1, //样式 1/2
        showText:'', //显示文字
        iconColor:'', //图标颜色
        color:'#ffffff', //文字颜色
    },

    // 信息流广告   只有列表布局才显示  => info,article,tieba
    flowAdv:{
        show:false,
        android:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        h5:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        wxmini:'',  //微信小程序
        dymini:'', //抖音小程序
    },
};
// 资讯
var articleFormData = {
    imgScale:3,
    style:{
        fontSize:30,
        color:'#333333', //字体颜色
        sourceColor:'#9c9c9c', //媒体文字颜色
    },

    pubDate:{  //发布时间
        show:false,
        color:'#333333',
    },

    read:{  //浏览量
        show:false,
        color:'#333333',
    },
    readIcon:{  //浏览量
        show:false,
        color:'#333333',
    },

    // 排序选项
    orderby:[{
        value:'',
        text:'默认排序'
    },{
        value:1,
        text:'最新发布'
    },{
        value:2,
        text:'最多浏览'
    }],

    // 信息流广告   只有列表布局才显示  => info,article,tieba
    flowAdv:{
        show:false,
        android:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        h5:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        wxmini:'',  //微信小程序
        dymini:'', //抖音小程序
    },
};


// 大商家
var businessFormData = {
    imgScale:1, // 1 => 适应图片  2 => 1:1  3 => 4:3   4 => 3:2
     // 排序选项
     orderby:[{
        value:'',
        text:'默认'
    },{
        value:4,
        text:'最新入驻'
    },{
        value:1,
        text:'人气'
    },{
        value:2,
        text:'好评'
    },{
        value:3,
        text:'距离'
    }],
    style:{
        fontSize:30,  //标题字号  26 => 常规  28 => 加大
        color:'#333333', //字体颜色
    },

    score:{ //商家评分
        show:false,
        color:'#333333', //字体颜色
    },

    industry:{ //经营分类
        show:false,
        color:'#333333', 
    },

    opentime:{ //营业时间
        show:false,
        color:'#333333',
    },

    label:{ //商家标签
        show:false,
        color:'#333333',
        bgColor:'#f5f5f5'
    },

    equip:{ //店内设施
        show:false,
        color:'#333333',
        bgColor:'#f5f5f5'
    },

    address:{ //商家地址
        show:false,
        color:'#333333',
        iconColor:'',
    },

    fanyong:{   // 下单返佣
        show:false,
        color:'#333333',
        labelColor:'#f5f5f5',
    },
    advList:{
        show:false,
        list:[]
    },
}


// 房产
var houseFormData = {
    imgScale:3, // 1 => 适应图片  2 => 1:1  3 => 4:3   4 => 3:2
    style:{
        fontSize:30,  //标题字号  26 => 常规  28 => 加大
        color:'#333333', //字体颜色
        pcolor:'#ff0000', //价格颜色
    },

    areaSize:{  //面积
        show:false,
        color:'#333333'
    },

    room:{  //几室
        show:false,
        color:'#333333'
    },

    unitPrice:{ //单价  二手房才有
        show:false,
        color:'#333333'
    },

    buildType:{  //建筑类型
        show:false,
        color:'#333333'
    },

    posi:{ //位置
        show:false, // 只有小区才显示这个
        showType:1, //1 => 区域  2 => 详细地址  空则不显示
        color:'#333333',
        iconColor:'', //图标颜色
    },

    buildProp:{// 建筑属性
        show:false,
        color:'#333333'
    },

    buildDate:{// 建筑时间
        show:false,
        color:'#333333'
    },

    houseInfo:{ // 房源情况
        show:false,
        color:'#333333'
    },

     // 信息流广告   只有列表布局才显示  => info,article,tieba
     flowAdv:{
        show:false,
        android:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        h5:{
            app_id:'',  //媒体ID
            placement_id: '', //广告位id
        },
        wxmini:'',  //微信小程序
        dymini:'', //抖音小程序
    },
}

// 标题
var titleDefault = {
    sid:1, //验证多个中的索引  重置复用组件需要
    layout:0, //0 居左  1,居中
    inList:false, //是否在列表表内
    title:{
        text:'',
        type:0, // 0默认 1划线 2 图标
        icon:'',
        style:{
            fontSize:34,
            color:'#070F21',
            borderColor:'#FA3725',
        }
    },
    style:{
        marginLeft:30,
        height:110,
        marginTop:10
    },
    more:{
        text:'查看更多',
        arr:1, //1箭头显示 .0 是箭头不显示
        show:true, //是否显示
        link:'',
        linkInfo:{
            linkText:'',
            selfSetTel:0
        },
        style:{
            color:'#a1a7b3',
            initColor:'#a1a7b3',
        }
    },
}


// 列表数据默认
var listDefault = {
    currInd:0, //当前选中的标签索引
    currCInd:'', //当前选中的标签的子集的索引  是数字则表示开启二级标题   不是数字则未开启
    addType:1,  // 1 => 动态数据   2 => 手动添加
    failure:0, // 失效内容是否显示   0 => 隐藏   1 => 显示
    showObj:{  //显示的内容  常规选项
            action:'', 
            service:'',
            id:'',
            text:'',
        },  
     // 查看更多  没有标签 需要强制勾选标题 才能显示查看更多    只有固定加载才显示
     more:{
        show:true,
        // styletype:1, //风格1/2  1 => 下面按钮  2 => 标题左侧  只有固定加载数据条数
        "text": "查看更多",
        "arr": true,
        "link": '',
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            "color": "#a1a7b3", //文字颜色
            btnBg:'#ffffff', //按钮有背景  固定条数显示
            btnBorder:'', //按钮边框   固定条数显示
            btnHeight:70, //按钮高度   固定条数显示
        }
    },
    // 数据相关
    dataObj:{
        service:'',  //模块
        interface:{   //数据接口相关 需要选择之后显示 
            type:'',
            orderby:'',
            action:'',
            service:'', 
            typeArr:[],
        },
        load:2,  // 1 => 无限加载  2 => 固定加载 
        pageSize:10,  //无限加载 单页加载条数
        totalCount:4, //固定加载条数
        styletype:2,  // 风格 1/2/3/4  大图 、双列、列表、瀑布流

        // 数据内容
        cardStyle:false, //是否显示卡片样式
        style:{
            cardBgColor:'#ffffff', //卡片颜色
            bgColor:'#f5f5f5',  //整块背景色
            listBgColor:'#ffffff',  //列表内容背景色 
            lineColor:'#f5f5f7', //分割线  列表才有
            // marginBottom:0, //下间距
            marginTop:0,  //上间距
            marginLeft:24, //左右间距
            padding:28, //内边距
            splitMargin:20, //中间间隔
            borderRadius:16, //圆角
            fontSize:30
        },
        
        // 不同模块内容展示
        modCon:{
            imgScale:1, // 1 => 适应图片  2 => 1:1  3 => 4:3   4 => 3:2
            style:{
                fontSize:26,  //标题字号  26 => 常规  28 => 加大
                color:'#333333', //字体颜色
                pcolor:'#ff0000' , //价格字体颜色
            },
            orderby:[{
                value:'',
                text:'默认'
            },{
                value:1,
                text:'销量'
            },{
                value:3,
                text:'价格'
            }],
            // 返佣
            fanyong:{
                show:false, //是否显示
                color:'#ffffff',
            },
            // 会员价
            vipPrice:{
                show:false, //是否显示
            },
            // 划线价
            huaxian:{
                show:false, //是否显示
                color:'#666666',
            },
            // 活动状态
            hdState:{
                show:false, //是否显示
            },
            // 销量
            sale:{
                show:false, //是否显示
                color:'#ffffff',
            },
            // 可用券
            quan:{
                show:false, //是否显示
                color:'#ffffff',
            },
            // 副标题
            stitle:{
                show:false, //是否显示
                color:'#ffffff',
            },

            cartIcon:{
                cartStyle:1, // 1、2、3 => 默认图标     4 =>自定义
                path:'',  //自定义上传路径
                style:{
                    size:20, //图标大小  只有自定义才生效
                    color:'',
                    bgColor:'',
                },
            },
            advList:{
                show:false, //是否显示
                list:[], //列表数据
            }, //广告列表
        }
    },

    

    listArr:[], //显示的数据  手动添加会有  最大长度50
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
}

// 切换标题
var labelDefault = {
    labelChose:0, //当前显示
    slabelChose:0,  //当前显示
    labelShow:true, //是否显示标签  标签只有1个
    styletype:1, //风格 1/2/3/4/5
    position:'center', //居中，居左
    // 标题 非标签情况下 会显示
    titleMore:{
        show:false,
        ...titleDefault
    },
    labsArr:[  //最多8个
        {
            id:1,
            default:1, //默认选中
            type:1,  // 1 => 常规  2 => 有二级选项  3 =>链接
            subtitle:'', //副标题
            title:{
                type:'text', // image => 图片  text => 文字
                path:'',  //图片路径
                text:'', //标题内容,
            },
            link:'' , //选中链接   链接选项
            linkInfo:{
                type:'', //链接类型
                linkText:'', //文字
            },
            // showObj:{  //显示的内容  常规选项
            //     text:'', 
            //     code:'',
            //     id:'',
            // },  
            // 数据列表
            dataFormData:JSON.parse(JSON.stringify(listDefault)),
            children:[
                {
                    id:1,
                    title:'', //二级标题
                    showObj:{  //显示的内容  
                        text:'', 
                        code:'',
                        id:'',
                    },  
                    dataFormData:JSON.parse(JSON.stringify(listDefault)),
                },
            ]
        },
        {
            id:2,
            default:0, //默认选中
            type:1,  // 1 => 常规  2 => 有二级选项  3 =>链接
            subtitle:'', //副标题
            title:{
                type:'text', // image => 图片  text => 文字
                path:'',  //图片路径
                text:'', //标题内容,
            },
            link:'' , //选中链接   链接选项
            linkInfo:{
                type:'', //链接类型
                linkText:'', //文字
            },
            showObj:{  //显示的内容  常规选项
                id:0, action:'',service:'', pagetype:0, text:'' 
            },  
            dataFormData:JSON.parse(JSON.stringify(listDefault)),
            children:[
                {
                    id:2,
                    title:'', //二级标题
                    showObj:{  //显示的内容  
                        id:0, action:'',service:'', pagetype:0, text:'',
                    }, 
                    dataFormData:JSON.parse(JSON.stringify(listDefault)), 
                },
            ]
        },
    ],
    // 风格
    style:{
        bgColor:'', //背景色
        chose_title:'#EC3628', // 选中标题
        chose_stitle:'#FFFFFF', //选中副标题
        chose_block:'#F22A18', //选中色块
        title:'#222222', //标题颜色
        opacity:100, //未选中标题透明度
        chose_opacity:100, //选中副标题
        sOpacity:100, //未选中副标题透明度
        chose_sOpacity:100, //选中副标题
        stitle:'#666666',
        marginLeft:30, //左右间距
        marginTop:40,  //上间距
        marginBottom:30,//下间距
        splitMargin:50, //中间间隔 新增
        borderRadius:0, //圆角 新增

        // 二级标题样式
        chose_sub_title:'#F33521', //二级标题文字
        chose_sub_bgColor:'#FFEEED',  //二级标题背景色
        chose_sub_bgOpacity:100,  //选中背景透明度
        sub_title:'#333333', //二级标题文字
        sub_bgColor:'#ffffff',  //二级标题背景色\
        sub_bgOpacity:100,//默认背景透明度
    },

    // 查看更多  显示在标签左侧
    more:{
        show:false,
        styletype:1, //风格1/2  1 => 下面按钮  2 => 标题左侧
        "text": "查看更多",
        "arr": true,
        "link": '',
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            "color": "#a1a7b3", //文字颜色
            btnBg:'#ffffff', //按钮有背景  固定条数显示
            btnBorder:'', //按钮边框   固定条数显示
            btnHeight:20, //按钮高度   固定条数显示
        }
    },
    // 标题
    title:{
        show:false,
        text:'',
        style:{
            color:'#333333'
        }
    },

    
}


// 模块数据列表
// 
var moduleArrList = {
    shop:{
        
        name:'商城',
        list:[{ id:5, action:'slist',service:'shop', text:'全部商品'  ,orderby:''},{ id:2, pagetype:2, service:'shop',action:'slist', text:'电商商品' ,orderby:''},{ id:1, action:'slist',service:'shop', pagetype:1, text:'团购商品' ,orderby:''},{ id:3, action:'slist', text:'到店核销', moduletype:3, service:'shop',orderby:'',},{ id:4, action:'slist', text:'配送商品', moduletype:4 , service:'shop',orderby:''},{ id:6, action:'slist', text:'快递商品', moduletype:4 , service:'shop',orderby:''},{ id:7, action:'proHuodongList',huodongtype:1, text:'抢购商品', service:'shop',orderby:'' },{ id:8, action:'proHuodongList', huodongtype:4,huodongstate:1, text:'拼团商品', service:'shop',orderby:'' },{ id:9, action:'bargainingList', text:'砍价商品' , service:'shop',orderby:''},{ id:10, action:'proHuodongList',huodongtype: 2, text:'秒杀商品', service:'shop',orderby:'' }]
    },
    house:{
        name:'房产',
        list:[{ id:11, action:'saleList', text:'二手房', service:'house' ,orderby:'' },{ id:12, action:'zuList', text:'租房' , service:'house' ,orderby:''},{ id:13, action:'loupanList', text:'新盘', service:'house'  ,orderby:''},{ id:14, action:'spList', text:'商铺' , service:'house' ,orderby:''},{ id:15, action:'cwList', text:'车位', service:'house' ,orderby:'' },{ id:16, action:'cfList', text:'厂房仓库' , service:'house' ,orderby:''},{ id:17, action:'xzlList', text:'写字楼' , service:'house' ,orderby:''},{ id:26, action:'communityList', text:'小区' , service:'house' ,orderby:''}],
    },
    job:{
        name:'招聘',
        list:[{ id:18, action:'postList', text:'职位', service:'job' ,orderby:'' },{ id:19, action:'pgList', text:'快速招聘' , service:'job' ,orderby:''},{ id:20, action:'qzList', text:'快速求职', service:'job'  ,orderby:''}]
    },
    // { id:22, action:'blist', text:circleName ,service:'circle' },
    other:{
        name:'更多',
        list:[{ id:27, action:'alist', text:articleName ,service:'article' ,orderby:'' },{ id:21, action:'ilist_v2', text:infoName ,service:'info' ,orderby:'' },{ id:23, action:'tlist', text:tiebaName ,service:'tieba' ,orderby:'' },{ id:24, action:'getsfcarlist', service:'sfcar', text:sfcarName ,orderby:'' },{ id:25, action:'blist', text:'大商家',service:'business',orderby:''}]
    },
}


// 优惠券默认数据
var quanDefault = {
    bgType:'image', //背景类型   image => 图片背景   color => 纯色背景色
    style:{
        borderColor:'#ffffff', //边框
        bgColor:'#ffffff', //背景色
        imgColor:'', //背景图是图片时的图片主色调
        bgImage:masterDomain +'/static/images/admin/siteConfigPage/quan_bg.png',
        marginLeft:24, //左右间距
        marginTop:20, //上间距
        borderRadius:24, //圆角值
        maskColor:'#FFC7C8', //遮罩颜色   取的是图片的主色  ，只有在bgType是图片时 并且有3张以上优惠券时 才有用
    },

    // 组件标题
    title:{
        text:'速抢惊喜神券', 
        type:'text', //text => 文字   image => 图片
        image:'',  //图片标题的url
        style:{
            color:'#ED2C09',
        }
    },
    // 组件副标题
    stitle:{
        text:'', 
        style:{ 
            color:'#B8520F',
        }
    },

    // 优惠券样式
    quanstyle:{
        bgColor:'#ffffff', //券背景
        borderColor:'#FFCBC5', //边框
        discount:'#FA2C19', //抵扣金额的颜色、
        threshold:'#ff0000', //使用门槛
        desc:'#CE8342', //描述的颜色
        labColor:'#CE8342', //标签文本颜色
        labBgColor:'#FFEACD', //标签背景色
        btnBgColor:'#F22A18', //按钮背景色  此按钮是当优惠券只有一张时显示 其他情况不显示
        
    },
    quanList:[
    //     {
    //     id:1,
    //     desc:'', //券描述
    //     label:false, //是否有标签
    //     labelText:'', //标签文字
    //     link:'', //链接 
    // }
],

    // 查看更多
    more:{
        show:false, //是否显示
        "text": "更多好券",  
        "arr": true, //是否显示箭头
        "link": '', //链接
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            "color": "#ffffff", //文字颜色
            btnBg:'#F22A18', //按钮背景 
            // btnBorder:'#ffffff', //按钮边框 
            arrColor:'#ffffff', //按钮箭头颜色
        }
    },
}


// 抢购
var qianggouDefault = {
    styletype:2, // 1/2组件   全组件
    bgType:'image',  //color => 纯色背景   image => 图片背景
    bgStyle:3, // 1 => 渐变  2 => 边框  3 => 圆角      全组件才显示3    圆角表示内容内容加背景色 撑满 以圆角区分内容   边框表示 背景增加padding值  内容加背景色  

    cutDownTime:'', //倒计时时间
    cutDownTimeToText:[],

    style:{
        marginLeft:24, // 足有边距
        marginTop:20, //上边距
        borderRadius:24,

        // bgColor:'#FF2E56', //背景色
        // bgMask:'#FF4F5E', // 渐变遮罩设置的颜色
        bgImage:masterDomain + '/static/images/admin/siteConfigPage/fullCon_bg.png', //背景图
        bgMask:'#ffffff', // 渐变遮罩设置的颜色
        bgColor:'#FFEAE9', //背景色

        cutDown:'#FFFFFF', //倒计时颜色
        cutDownBg:'#FF2C33', //倒计时背景
        split:'#9B4640', //间隔符号颜色


    },
    // 标题
    title:{
        type:'text',  //标题类型   text => 文字  image => 图片
        image:"",
        text:'限时抢购',
        style:{  //样式
            color:'#000000', //标题颜色

        }
    },

     // 副标题
    stitle:{
        styletype:0, // 显示的样式   0 => 不显示  1 => 动态   2 => 自定义
        textArr:[{
            value:''
        }], //自定义时 添加的数据
        list:[], //动态数据
        style:{
            color:'#666666'
        }
    },
    
    // 查看更多  只有全组件才显示
    more:{
        show:true,
        styletype:1, //风格1/2  1 => 下面按钮  2 => 标题左侧
        "text": "查看更多",
        "arr": true, //是否显示箭头
        "link": '',
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            "color": "#E19991", //文字颜色
            "arrColor":'#E19991',
            btnBg:'#ffffff', //按钮背景 
        }
    },

    // 商品显示
    addType:1, // 1 => 自动加载  2 => 手动
    singleShow:2, //单行显示条数   1-4，  如果是1/2组件 则只有1-2
    listCount:8,// 显示数据的条数   需要 如果是1/2组件 最多10  全组件最多12

    dataObj:{
        // 接口
        interface:{   //数据接口相关 需要选择之后显示 
            type:'',
            orderby:'',
            action:'proHuodongList',
            service:'shop', 
            huodongtype:1,
            changci:'',
        },
        // 价格
        price:{
            styletype:1,  //1 => 普通  2 =>背景   3 =>按钮    4=> 大按钮   1/2组件只显示 1 和 2   对应样式
            sprice:false, //划线价  显示/隐藏
            style:{
                color:'#333333',
                scolor:'#666666',  //划线价颜色
                titleLine:2, //当全组件单行显示多个时  标题显示的行数  0表示不显示
                tcolor:'#333333', //标题颜色
            }
        },

        stockInfo:{
            stockShow:true, //显示库存
            saleShow:false, //显示销量
            color:'#666666', //颜色
        }

    } ,
    listIdArr:[], //存储id
    listArr:[], //显示的数据
    listArrShow:[], // 手动添加会有  最大长度50

}

// 拼团
var pintuanDefault = {
    styletype:2, // 1/2组件   全组件
    bgType:'image',  //color => 纯色背景   image => 图片背景
    bgStyle:1, // 1 => 渐变  2 => 边框  3 => 圆角      全组件才显示3    圆角表示内容内容加背景色 撑满 以圆角区分内容   边框表示 背景增加padding值  内容加背景色  
    style:{
        bgImage:masterDomain + '/static/images/admin/siteConfigPage/fullCon_bg.png', //背景图
        // bgColor:'#FF2E56', //背景色
        // bgMask:'#FFEAE9', // 渐变遮罩设置的颜色
        bgMask:'#ffffff', // 渐变遮罩设置的颜色
        bgColor:'#FFEAE9', //背景色
        

        marginLeft:24, // 足有边距
        marginTop:20, //上边距
        borderRadius:24,
    },

    // 标题
    title:{
        type:'text',  //标题类型   text => 文字  image => 图片
        image:"",
        text:'多人拼团',
        style:{  //样式
            color:'#000000', //标题颜色
        }
    },

     // 副标题
    stitle:{
        styletype:1, // 显示的样式   0 => 不显示  1 => 动态   2 => 自定义
        textArr:[{
            value:''
        }], //自定义时 添加的数据
        list:[], //动态数据
        style:{
            color:'#CE8342'
        }
    },

    //几人团
    tuan:{
        show:true, //显示隐藏   如果按钮自带 则默认显示i
        style:{
            textColor:'#ffffff',
            bgColor:'#8C8B9F'
        }
    },

    // 查看更多  只有全组件才显示
    more:{
        show:false,
        styletype:1, //风格1/2  1 => 下面按钮  2 => 标题左侧
        "text": "查看更多",
        "arr": true,
        "link": '',
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            "color": "#a1a7b3", //文字颜色
            "arrColor":'#ffffff'
        }
    },

    // 商品显示
    addType:1, // 1 => 自动加载  2 => 手动
    singleShow:4, //单行显示条数   1-4，  如果是1/2组件 则只有1-2
    listCount:8,// 显示数据的条数   需要 如果是1/2组件 最多10  全组件最多12

    dataObj:{
        // 接口
        interface:{   //数据接口相关 需要选择之后显示 
            huodongtype:4,
            huodongstate:1,
            orderby:'',
            action:'proHuodongList',
            service:'shop', 
        },
        // 价格
        price:{
            styletype:3,  //1 => 普通  2 =>背景   3 =>按钮    4=> 大按钮   1/2组件只显示 1 和 2   对应样式
            sprice:true, //划线价  显示/隐藏
            style:{
                color:'#F73C08',
                scolor:'#999999',  //划线价颜色
                titleLine:2, //当全组件单行显示多个时  标题显示的行数  0表示不显示
                tcolor:'#525866', //标题颜色
            }
        },
        // 库存
        stockInfo:{
            stockShow:true, //显示库存
            saleShow:false, //显示销量
            color:'#666666', //颜色
        }

    } ,
    listArr:[], //显示的数据
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
}

// 秒杀
var miaoshaDefault = {
    styletype:2, // 1/2组件   全组件
    bgType:'image',  //color => 纯色背景   image => 图片背景
    bgStyle:1, // 1 => 渐变  2 => 边框  3 => 圆角      全组件才显示3    圆角表示内容内容加背景色 撑满 以圆角区分内容   边框表示 背景增加padding值  内容加背景色  
    style:{
        bgImage:masterDomain + '/static/images/admin/siteConfigPage/fullCon_bg.png', //背景图
        bgMask:'#ffffff', // 渐变遮罩设置的颜色
        bgColor:'#FFEAE9', //背景色
        // bgMask:'#FFEAE9', // 渐变遮罩设置的颜色
        // bgColor:'#FF2E56', //背景色

        marginLeft:24, // 足有边距
        marginTop:20, //上边距
        borderRadius:24,

    },

    // 标题
    title:{
        type:'text',  //标题类型   text => 文字  image => 图片
        image:"",
        text:'限时秒杀',
        style:{  //样式
            color:'#000000', //标题颜色

        }
    },

     // 副标题
    stitle:{
        styletype:1, // 显示的样式   0 => 不显示  1 => 动态   2 => 自定义
        textArr:[{
            value:''
        }], //自定义时 添加的数据
        list:[], //动态数据
        style:{
            color:'#CE8342'
        }
    },

    //销量/库存
    store:{
        show:1, // 1 => 显示销量  2 => 显示库存
        style:{
            textColor:'#333333',
        }
    },

    // 查看更多  只有全组件才显示
    more:{
        show:true,
        styletype:1, //风格1/2  1 => 下面按钮  2 => 标题左侧
        "text": "",
        "arr": true,
        "link": '',
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            btnBg:'#ffffff',
            "color": "#E19991", //文字颜色
            "arrColor":'#E19991'
        }
    },

    // 商品显示
    addType:1, // 1 => 自动加载  2 => 手动
    singleShow:3, //单行显示条数   1-4，  如果是1/2组件 则只有1-2
    listCount:12,// 显示数据的条数   需要 如果是1/2组件 最多10  全组件最多12

    dataObj:{
        // 接口
        interface:{   //数据接口相关 需要选择之后显示 
            huodongtype:2,
            orderby:'',
            action:'proHuodongList',
            service:'shop', 
            huodongstate:'1'
        },
        // 价格
        price:{
            styletype:3,  //1 => 普通  2 =>背景   3 =>按钮    4=> 大按钮   1/2组件只显示 1 和 2   对应样式
            sprice:true, //划线价  显示/隐藏
            style:{
                color:'#F73C08',
                scolor:'#999999',  //划线价颜色
                titleLine:2, //当全组件单行显示多个时  标题显示的行数  0表示不显示
                tcolor:'#525866', //标题颜色
            }
        },

        stockInfo:{
            stockShow:true, //显示库存
            saleShow:false, //显示销量
            color:'#666666', //颜色
        }

    } ,
    listArr:[], //显示的数据
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
}


// 砍价
var kanjiaDefault = {
    styletype:2, // 1/2组件   全组件
    bgType:'image',  //color => 纯色背景   image => 图片背景
    bgStyle:1, // 1 => 渐变  2 => 边框  3 => 圆角      全组件才显示3    圆角表示内容内容加背景色 撑满 以圆角区分内容   边框表示 背景增加padding值  内容加背景色  
    style:{
        bgImage:masterDomain + '/static/images/admin/siteConfigPage/fullCon_bg.png', //背景图
        // bgColor:'#FF2E56', //背景色
        // bgMask:'#FFEAE9', // 渐变遮罩设置的颜色
        bgMask:'#ffffff', // 渐变遮罩设置的颜色
        bgColor:'#FFEAE9', //背景色
        marginLeft:24, // 足有边距
        marginTop:20, //上边距
        borderRadius:20,
    },

    // 标题
    title:{
        type:'text',  //标题类型   text => 文字  image => 图片
        image:"",
        text:'砍价0元拿',
        style:{  //样式
            color:'#000000', //标题颜色
        }
    },

     // 副标题
    stitle:{
        styletype:1, // 显示的样式   0 => 不显示  1 => 动态   2 => 自定义
        textArr:[{
            value:''
        }], //自定义时 添加的数据
        list:[], //动态数据
        style:{
            color:'#CE8342'
        }
    },

    // 查看更多  只有全组件才显示
    more:{
        show:true,
        styletype:1, //风格1/2  1 => 下面按钮  2 => 标题左侧
        "text": "更多",
        "arr": true,
        "link": '',
        linkInfo:{
            text:'',
            type:1
        },
        "style": {
            "color": "#E19991", //文字颜色
            "arrColor":'#E19991'
        }
    },

    // 商品显示
    addType:1, // 1 => 自动加载  2 => 手动
    singleShow:1, //单行显示条数   1-4，  如果是1/2组件 则只有1-2
    listCount:8,// 显示数据的条数   需要 如果是1/2组件 最多10  全组件最多12

    dataObj:{
        // 接口
        interface:{   //数据接口相关 需要选择之后显示 
            type:'',
            orderby:'',
            action:'bargainingList',
            service:'shop', 
        },
        // 价格
        price:{
            styletype:4,  //1 => 普通  2 =>背景   3 =>按钮    4=> 大按钮   1/2组件只显示 1 和 2   对应样式
            sprice:false, //划线价  显示/隐藏
            style:{
                color:'#F32700',
                scolor:'#999999',  //划线价颜色
                titleLine:2, //当全组件单行显示多个时  标题显示的行数  0表示不显示
                tcolor:'#292C33', //标题颜色
               
            }
        },

        stockInfo:{
            stockShow:true, //显示库存
            saleShow:false, //显示销量
            color:'#666666', //颜色
        }

    } ,
    listArr:[], //显示的数据
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
}










//  商品组 样式一的模块设置的默认值
var style1ModOptionsDefault = {
    // singleShow:8, //单行显示的数据
    bgStyle:1,
    addType:1, //数据添加方式   1 => 动态数据   2 => 手动添加
    listArr:[], //选择显示的数据
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
    moreLink:{
        link:'', //链接
        linkInfo:{
            linkText:'',  //链接文字
            type:1, //类型
        }
    }, //查看更多的链接
    listCount:8, //显示数据的总条数
    interface:{
        service:'shop',
        action:'slist',
        text:'全部商品',
        orderby:'', //排序
        type:'', //分类

    },
    // 标题
    title:{
        text:'',
        type:'text', //标题类型 text =>文字   image => 图片
        image:'',   //图片url
        style:{
            color:'#212121'
        }
    },

    // 副标题
    stitle:{
        text:'',
        style:{
            color:'#FF3C29'
        }
    },
    style:{
        price:'#FA2C19', //价格颜色
        bgColor:'#FFF0F3', //背景色
    }
}

// 商品组 样式二模块设置的默认值
var style2ModOptionsDefault = {
    slide:1, // 滑动方式  1 => 分页    2 => 平移滑动   风格5只能是2
    bgType:'color', //背景类型  color => 纯色背景   image => 背景图
    bgStyle:1, // 1 => 渐变   2 => 边框   3 => 圆角
    style:{
        bgColor:'#FCEBE3',
        bgImage:'',
        bgMask:'#ffffff', //背景遮罩颜色
    },
    autoPlay:false, //是否自动播放   仅在分页情况下 显示该选项

    // 查看更多
    more:{
        show:false, //是否显示
        text:'更多', //文字
        arr:true, //箭头是否显示
        style:{
            color:'#999999',  //文字颜色
            arrColor:'#E19991' , //箭头颜色
        }
    },
    singleShow:2, //单行显示的 2-4条
    listCount:8, //显示数据的总条数 倍数
    addType:1, //数据添加方式   1 => 动态数据   2 => 手动添加

    // 动态加载的接口   
    interface:{
        service:'shop',
        action:'slist',
        text:'全部商品',
        orderby:'', //排序
        type:'', //分类
    },

    

    // 手动加载数据时 => 选择的列表    动态数据 => 当前接口的数据
    listArr:[],
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
    imgScale:2, //图片比例
    // 标题
    title:{
        text:'',
        type:'text', //标题类型 text =>文字   image => 图片
        image:'',   //图片url
        style:{
            color:'#333333'
        }
    },
    // 副标题
    stitle:{
        textArr:[
            {value:''},
        ], //副标题  可上下滚动
        style:{
            color:'#333333'
        }
    },

    proObj:{ 
        saveShow:false, //省*元
        spriceShow:true, //是否显示划线价格
        stockShow:false, // 库存
        saleShow:false, //销量
        typeShow:true, //商品分类
        orderShow:true, //排名显示
        style:{
            title:'#333333',  //商品标题名
            price:'#ff0000', //商品价格
            sprice:'#999999',  //划线价格
            save:'#FA2C19', //节省的钱
            sale:'#666666', //销量
            stock:'#666666', //库存
            typeText:'#ffffff', //分类文本
            typeLab:'#A7A7A7', //分类标签
            typeOpc:'100',  //透明度
            orderText:'#ffffff' , //排名文本
            orderLab:'#C14529', //排名标签
            orderOpc:'100', //透明度
        }
    },
}







// 商家组 默认数值
var busiStyleDefault = {
    slide:1, // 滑动方式  1 => 分页    2 => 平移滑动   风格5只能是2
    bgType:'color', //背景类型  color => 纯色背景   image => 背景图
    bgStyle:1, // 1 => 渐变   2 => 边框   3 => 圆角
    style:{
        bgColor:'#FCEBE3',
        bgImage:'',
        bgMask:'#ffffff', //背景遮罩颜色
    },
    autoPlay:false, //是否自动播放   仅在分页情况下 显示该选项

    // 查看更多
    more:{
        show:true, //是否显示
        text:'更多', //文字
        arr:true, //箭头是否显示
        style:{
            color:'#999999',  //文字颜色
            arrColor:'#E19991' , //箭头颜色
        }
    },
    singleShow:2, //单行显示的 2-4条
    listCount:8, //显示数据的总条数 倍数
    addType:1, //数据添加方式   1 => 动态数据   2 => 手动添加

    // 动态加载的接口   
    interface:{
        service:'business',
        action:'blist',
        orderby:'', //排序
        typeid:'', //分类
        typeArr:[], //分类列表
        text:'商家'
    },

    

    // 手动加载数据时 => 选择的列表    动态数据 => 当前接口的数据
    listArr:[],
    listArrShow:[], // 手动添加会有  最大长度50
    listIdArr:[], //存储id
    imgScale:2, //图片比例
    // 标题
    title:{
        text:'',
        type:'text', //标题类型 text =>文字   image => 图片
        image:'',   //图片url
        style:{
            color:'#1F2021'
        }
    },
    // 副标题
    stitle:{
        textArr:[
            {value:''},
        ], //副标题  可上下滚动
        style:{
            color:'#333333'
        }
    },

    busisObj:{
        scoreStyle:2, // 评分样式  1  => 样式一   2 => 样式二
        addr:1, //地址显示   1 => 商家位置   2 => 详细地址
        typeShow:true, //是否显示分类
        typeStyle:1, // 1 => 标签形式    2 => 文字形式
        orderShow:true,
        style:{
            addr:'#666666', //地标颜色
            title:'#1F2021', // 商家名称样式 
            score:'#F37A3A',  //评分
            star:'#F37A3A', //星标
            typeText:'#ffffff', // 文本
            typeLab:'#A7A7A7' , //标签颜色
            typeOpc:100 , //标签颜色透明度
            orderText:'#ffffff',  //文本
            orderLab:'#C14529', //标签
            orderOpc:100 , //标签颜色透明度
            posi:'#666666', //位置颜色
            distance:'#999999', //距离颜色
        }
    }
}


// 商品组  样式一设置的默认值
var styleOptionsArr = [{
    id:1,
    options:{
        interaction:1,  //交互  1 => 点击直接跳转查看更多      2 => 点击商品查看详情、组件标题查看更多
        modArr:[
            JSON.parse(JSON.stringify(style1ModOptionsDefault)),
            JSON.parse(JSON.stringify(style1ModOptionsDefault)),
            JSON.parse(JSON.stringify(style1ModOptionsDefault)),
        ], //模块相关设置
    }
},{
    id:2, //样式2
    options:{
        modArr:[JSON.parse(JSON.stringify(style2ModOptionsDefault))]
    }
},{
    id:3, //样式2
    options:{
        modArr:[JSON.parse(JSON.stringify(style2ModOptionsDefault))]
    }
},{
    id:4, //样式2
    options:{
        modArr:[JSON.parse(JSON.stringify(style2ModOptionsDefault))]
    }
},{
    id:5, //样式2
    options:{
        modArr:[
            JSON.parse(JSON.stringify(style2ModOptionsDefault)),
            JSON.parse(JSON.stringify(busiStyleDefault)),
        ]
    }
}]


// 商品组
var prosDefault = {
    styletype:2, //样式 1 - 5
    dataObj:{
        modArr:[JSON.parse(JSON.stringify(style2ModOptionsDefault))]
    },
    style:{
        borderRadius:24, //圆角
        marginTop:20, //上间距
        marginLeft:24, //左右间距
        split:18, //中间间隔
    }

    

}


// 商家组
var busisDefault = {
    styletype:2, //样式 2,4,5 => 样式一二三
    style:{
        borderRadius:24, //圆角
        marginTop:20, //上间距
        marginLeft:24, //左右间距
        split:18, //中间间隔
    },
    dataObj:{
        modArr:[JSON.parse(JSON.stringify(busiStyleDefault))]
    }
}



// 默认设置的数据
var defaultModule = {
    searchColFormData:JSON.parse(JSON.stringify(searchColDefault)),
    pageSetFormData:JSON.parse(JSON.stringify(pageSetDefault)),
    compArrs:[
        {
        id:3,
        typename:'topBtns',
        content:JSON.parse(JSON.stringify(topBtnsDeFault)),
    },{
        id:4,
        sid:1,
        typename:'swiper',
        content:JSON.parse(JSON.stringify(swiperFormDeFault)),
    },
    {
        id:5,
        sid:1,
        typename:'sNav',
        content:JSON.parse(JSON.stringify(sNavDefault)),
    },
    {
        id:27,
        sid:1,
        typename:'btns',
        content:JSON.parse(JSON.stringify(btnsDefault)),
    },
    {
        id:8,
        sid:1,
        typename:'advLinks',
        content:JSON.parse(JSON.stringify(advLinksDefault)),
    },
    {
        id:20,
        sid:1,
        typename:'msg',
        content:JSON.parse(JSON.stringify(msgDefault)),
    },
    {
        id:11,
        sid:1,
        typename:'label',
        content:JSON.parse(JSON.stringify(labelDefault)),
    },
    {
        id:19,
        sid:1,
        typename:'qianggou',
        content:JSON.parse(JSON.stringify(qianggouDefault)),
    },
    {
        id:9,
        sid:1,
        typename:'pros',
        content:JSON.parse(JSON.stringify(prosDefault)),
    },
    {
        id:10,
        sid:1,
        typename:'busis',
        content:JSON.parse(JSON.stringify(busisDefault)),
    },
    ]
}

var newSetData = {

	"searchColFormData": {
		"showMods": [4],
		"bgMask": 1,
		"layout": 2,
		"bgType": "image",
		"style": {
			"bgColor": "#FF5736",
			"bgImage": "https://uploads.ihuoniao.cn/siteConfig/atlas/large/2023/12/15/17026281008751.png",
			"bgHeight": 176,
			"borderRadius": 20,
			"marginLeft": 30
		},
		"logo": {
			"position": "left",
			"path": "",
			"color": ""
		},
		"city": {
			"styletype": 1,
			"iconColor": "#ffffff",
			"textColor": "#ffffff",
		},
		"searchImg": {
			"path": "http://zt.215000.com/static/images/admin/siteConfigPage/camera.png",
			"iconColor": ""
		},
		"searchBtn": {
			"styletype": 1,
			"style": {
				"background": "#FB3628",
				"color": "#ffffff"
			}
		},
		"hotKeysConfig": {
			"show": 0,
			"style": {
				"color": "#ADAFBA",
				"background": "#ffffff",
				"opacity": 100
			}
		},
		"rtBtns": {
			"txtStyle": 2,
			"iconColor": "",
			"textColor": "#ffffff",
			"btns": [{
				"id": 1702628127971,
				"text": "福利中心",
				"icon": "https://uploads.ihuoniao.cn/siteConfig/atlas/large/2023/12/15/17026282296197.png",
				"link": "",
				"linkInfo": {
					"type": 1,
					"linkText": ""
				},
				"iconColor": "",
				"newIcon": ""
			}]
		},
		"searchCon": {
			"keysArr": [],
			"height": 0,
			"style": {
				"borderRadius": 36,
				"height": 64,
				"background": "#FFFFFF",
				"opacity": 100,
				"iconColor": "",
				"color": "#ADAFBA"
			}
		}
	},
	"pageSetFormData": {
		"search": {
			"showLeftMods": ["logo"],
			"logo": {
				"path": "https://uploads.ihuoniao.cn/siteConfig/atlas/large/2023/11/29/17012305448884.png",
				"color": ""
			},
			"rightBtns": {
				"rbtns": [{
					"show": true,
					"id": 1702628127971,
					"text": "福利中心",
					"icon": "https://uploads.ihuoniao.cn/siteConfig/atlas/large/2023/12/15/17026282296197.png",
					"link": "",
					"linkInfo": {
						"type": 1,
						"linkText": ""
					},
					"iconColor": "",
					"newIcon": ""
				}],
				"logo": {
					"show": true,
					"path": "https://uploads.ihuoniao.cn/siteConfig/atlas/large/2023/11/29/17012305448884.png",
					"color": ""
				}
			},
			"style": {
				"bgColor": "#ffffff",
				"borderColor": "#e6e6e6",
				"iconColor": "#d8d7d7",
				"textColor": "#ffffff",
				"searchIcon": "#ffffff",
				"cityColor": "#000000"
			}
		},
		"style": {
			"headBg": "#FFFFFF",
			"bgColor": "#f5f5f7",
			"marginTop": 20,
			"marginLeft": 30
		}
	},
	"compArrs": [{
		"id": 4,
		"sid": "swiper_1702628281964",
		"typename": "swiper",
		"content": {
			"styletype": 1,
			"showText": false,
			"litpics": [{
				"id": 1,
				"path": "",
				"link": "",
				"text": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				}
			}, {
				"id": 2,
				"path": "",
				"link": "",
				"text": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				}
			}, {
				"id": 3,
				"path": "",
				"link": "",
				"text": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				}
			}],
			"shadowShow": 0,
			"style": {
				"maskColor": "#000000",
				"color": "#ffffff",
				"dotColor": "#ffffff",
				"borderRadius": 24,
				"height": 260,
				"marginTop": 26,
				"marginLeft": 30
			}
		}
	}, {
		"id": 5,
		"sid": "sNav_1702628301981",
		"typename": "sNav",
		"content": {
			"cardStyle": false,
			"btnRadius": true,
			"layout": 2,
			"column": 5,
			"showLabs": [],
			"labsData": [],
			"slide": 1,
			"style": {
				"color": "#333333",
				"fontSize": 24,
				"cardBg": "#ffffff",
				"dotColor": "#FB3527",
				"btnRadius": 50,
				"cardRadius": 24,
				"btnSize": 88,
				"marginTop": 0,
				"marginLeft": 30
			},
			"activeInd": 0
		}
	}, {
		"id": 10,
		"sid": "busis_1702628320963",
		"typename": "busis",
		"content": {
			"styletype": 2,
			"style": {
				"borderRadius": 24,
				"marginTop": 20,
				"marginLeft": 24,
				"split": 18
			},
			"dataObj": {
				"modArr": [{
					"slide": 1,
					"bgType": "color",
					"bgStyle": 1,
					"style": {
						"bgColor": "#FCEBE3",
						"bgImage": "",
						"bgMask": "#ffffff"
					},
					"autoPlay": false,
					"more": {
						"show": true,
						"text": "更多",
						"arr": true,
						"style": {
							"color": "#999999",
							"arrColor": "#E19991"
						}
					},
					"singleShow": 3,
					"listCount": 8,
					"addType": 1,
					"interface": {
						"service": "business",
						"action": "blist",
						"orderby": "",
						"typeid": "",
						"typeArr": [],
						"text": "商家",
						"pageSize": 8
					},
					"listArr": [],
					"listArrShow": [],
					"listIdArr": ["12", "11", "9", "8", "7", "6", "4", "2"],
					"imgScale": 2,
					"title": {
						"text": "热门商家榜",
						"type": "text",
						"image": "",
						"style": {
							"color": "#1F2021"
						}
					},
					"stitle": {
						"textArr": [{
							"value": ""
						}],
						"style": {
							"color": "#333333"
						}
					},
					"busisObj": {
						"scoreStyle": 1,
						"addr": 2,
						"typeShow": true,
						"typeStyle": 1,
						"orderShow": true,
						"style": {
							"addr": "#666666",
							"title": "#1F2021",
							"score": "#F37A3A",
							"star": "#F37A3A",
							"typeText": "#ffffff",
							"typeLab": "#0D0D0D",
							"typeOpc": 100,
							"orderText": "#ffffff",
							"orderLab": "#C14529",
							"orderOpc": 100,
							"posi": "#666666",
							"distance": "#999999"
						}
					}
				}]
			}
		}
	}, {
		"id": 11,
		"sid": "label_1702628878891",
		"typename": "label",
		"content": {
			"labelChose": 0,
			"slabelChose": "",
			"labelShow": true,
			"styletype": 1,
			"position": "center",
			"titleMore": {
				"show": false,
				"sid": 1,
				"layout": 0,
				"inList": false,
				"title": {
					"text": "",
					"type": 0,
					"icon": "",
					"style": {
						"fontSize": 34,
						"color": "#070F21",
						"borderColor": "#FA3725"
					}
				},
				"style": {
					"marginLeft": 30,
					"height": 110
				},
				"more": {
					"text": "查看更多",
					"arr": 1,
					"show": true,
					"link": "",
					"linkInfo": {
						"linkText": "",
						"selfSetTel": 0
					},
					"style": {
						"color": "#a1a7b3",
						"initColor": "#a1a7b3"
					}
				}
			},
			"labsArr": [{
				"id": 1,
				"default": 1,
				"type": 1,
				"subtitle": "限时抢",
				"title": {
					"type": "text",
					"path": "",
					"text": "今日优惠"
				},
				"link": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				},
				"dataFormData": {
					"currInd": 0,
					"currCInd": "",
					"addType": 1,
					"failure": 0,
					"showObj": {
						"id": 2,
						"pagetype": 0,
						"service": "shop",
						"action": "slist",
						"text": "电商商品",
						"orderby": ""
					},
					"more": {
						"show": true,
						"text": "查看更多",
						"arr": false,
						"link": "",
						"linkInfo": {
							"text": "",
							"type": 1
						},
						"style": {
							"color": "#a1a7b3",
							"btnBg": "#ffffff",
							"btnBorder": "",
							"btnHeight": 80
						}
					},
					"dataObj": {
						"service": "",
						"interface": {
							"pagetype": 0,
							"service": "shop",
							"action": "slist",
							"orderby": "",
							"pageSize": 10
						},
						"load": 2,
						"pageSize": 10,
						"totalCount": 10,
						"styletype": 4,
						"cardStyle": true,
						"style": {
							"cardBgColor": "#ffffff",
							"bgColor": "#f5f5f5",
							"listBgColor": "#ffffff",
							"lineColor": "#f5f5f7",
							"marginTop": 20,
							"marginLeft": 24,
							"padding": 28,
							"splitMargin": 20,
							"borderRadius": 16,
							"fontSize": 30
						},
						"modCon": {
							"imgScale": 2,
							"style": {
								"fontSize": 30,
								"color": "#333333",
								"pcolor": "#ff0000"
							},
							"orderby": [{
								"value": "",
								"text": "默认"
							}, {
								"value": 1,
								"text": "销量"
							}, {
								"value": 3,
								"text": "价格"
							}],
							"fanyong": {
								"show": false,
								"color": "#ffffff"
							},
							"huiyuan": {
								"show": false
							},
							"huaxian": {
								"show": false,
								"color": "#666666"
							},
							"hdState": {
								"show": false
							},
							"sale": {
								"show": false,
								"color": "#ffffff"
							},
							"quan": {
								"show": false,
								"color": "#ffffff"
							},
							"stitle": {
								"show": false,
								"color": "#ffffff"
							},
							"cartIcon": {
								"cartStyle": 1,
								"path": "",
								"style": {
									"size": 20,
									"color": "",
									"bgColor": ""
								}
							},
							"advList": {
								"show": false,
								"list": []
							}
						}
					},
					"listArr": [],
					"listArrShow": [],
					"listIdArr": ["1280", "1188", "1072", "1332", "1331", "1330", "1329", "1328", "1327", "1326"]
				},
				"children": [{
					"id": 1,
					"title": "",
					"showObj": {
						"text": "",
						"code": "",
						"id": ""
					},
					"dataFormData": {
						"currInd": 0,
						"currCInd": "",
						"addType": 1,
						"failure": 0,
						"showObj": {
							"action": "",
							"service": "",
							"id": "",
							"text": ""
						},
						"more": {
							"show": true,
							"text": "查看更多",
							"arr": false,
							"link": "",
							"linkInfo": {
								"text": "",
								"type": 1
							},
							"style": {
								"color": "#a1a7b3",
								"btnBg": "#ffffff",
								"btnBorder": "",
								"btnHeight": 80
							}
						},
						"dataObj": {
							"service": "",
							"interface": {
								"type": "",
								"orderby": "",
								"action": "",
								"service": ""
							},
							"load": 2,
							"pageSize": 10,
							"totalCount": 10,
							"styletype": 2,
							"cardStyle": false,
							"style": {
								"cardBgColor": "#ffffff",
								"bgColor": "#f5f5f5",
								"listBgColor": "#ffffff",
								"lineColor": "#f5f5f7",
								"marginTop": 20,
								"marginLeft": 24,
								"padding": 28,
								"splitMargin": 20,
								"borderRadius": 16,
								"fontSize": 30
							},
							"modCon": {
								"imgScale": 1,
								"style": {
									"fontSize": 26,
									"color": "#333333",
									"pcolor": "#ff0000"
								},
								"orderby": [{
									"value": "",
									"text": "默认"
								}, {
									"value": 1,
									"text": "销量"
								}, {
									"value": 3,
									"text": "价格"
								}],
								"fanyong": {
									"show": false,
									"color": "#ffffff"
								},
								"vipPrice": {
									"show": false
								},
								"huaxian": {
									"show": false,
									"color": "#666666"
								},
								"hdState": {
									"show": false
								},
								"sale": {
									"show": false,
									"color": "#ffffff"
								},
								"quan": {
									"show": false,
									"color": "#ffffff"
								},
								"stitle": {
									"show": false,
									"color": "#ffffff"
								},
								"cartIcon": {
									"cartStyle": 1,
									"path": "",
									"style": {
										"size": 20,
										"color": "",
										"bgColor": ""
									}
								},
								"advList": {
									"show": false,
									"list": []
								}
							}
						},
						"listArr": [],
						"listArrShow": [],
						"listIdArr": []
					}
				}]
			}, {
				"id": 2,
				"default": 0,
				"type": 1,
				"subtitle": "吃喝玩乐",
				"title": {
					"type": "text",
					"path": "",
					"text": "附近商家"
				},
				"link": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				},
				"showObj": {
					"id": 0,
					"action": "",
					"service": "",
					"pagetype": 0,
					"text": ""
				},
				"dataFormData": {
					"currInd": 1,
					"currCInd": "",
					"addType": 1,
					"failure": 0,
					"showObj": {
						"id": 25,
						"action": "blist",
						"text": "大商家",
						"service": "business",
						"orderby": ""
					},
					"more": {
						"show": true,
						"text": "查看更多",
						"arr": false,
						"link": "",
						"linkInfo": {
							"text": "",
							"type": 1
						},
						"style": {
							"color": "#a1a7b3",
							"btnBg": "#ffffff",
							"btnBorder": "",
							"btnHeight": 80
						}
					},
					"dataObj": {
						"service": "",
						"interface": {
							"action": "blist",
							"service": "business",
							"orderby": "",
							"pageSize": 10
						},
						"load": 2,
						"pageSize": 10,
						"totalCount": 10,
						"styletype": 4,
						"cardStyle": true,
						"style": {
							"cardBgColor": "#ffffff",
							"bgColor": "#f5f5f5",
							"listBgColor": "#ffffff",
							"lineColor": "#f5f5f7",
							"marginTop": 20,
							"marginLeft": 24,
							"padding": 28,
							"splitMargin": 20,
							"borderRadius": 16,
							"fontSize": 30
						},
						"modCon": {
							"imgScale": 1,
							"orderby": [{
								"value": "",
								"text": "默认"
							}, {
								"value": 4,
								"text": "最新入驻"
							}, {
								"value": 1,
								"text": "人气"
							}, {
								"value": 2,
								"text": "好评"
							}, {
								"value": 3,
								"text": "距离"
							}],
							"style": {
								"fontSize": 30,
								"color": "#333333"
							},
							"score": {
								"show": false,
								"color": "#333333"
							},
							"industry": {
								"show": false,
								"color": "#333333"
							},
							"opentime": {
								"show": false,
								"color": "#333333"
							},
							"label": {
								"show": false,
								"color": "#333333",
								"bgColor": "#f5f5f5"
							},
							"equip": {
								"show": false,
								"color": "#333333",
								"bgColor": "#f5f5f5"
							},
							"address": {
								"show": false,
								"color": "#333333",
								"iconColor": ""
							},
							"fanyong": {
								"show": false,
								"color": "#333333",
								"labelColor": "#f5f5f5"
							},
							"advList": {
								"show": false,
								"list": []
							}
						}
					},
					"listArr": [],
					"listArrShow": [],
					"listIdArr": ["12", "11", "9", "8", "7", "6", "4", "2", "1", "1726"]
				},
				"children": [{
					"id": 2,
					"title": "",
					"showObj": {
						"id": 0,
						"action": "",
						"service": "",
						"pagetype": 0,
						"text": ""
					},
					"dataFormData": {
						"currInd": 0,
						"currCInd": "",
						"addType": 1,
						"failure": 0,
						"showObj": {
							"action": "",
							"service": "",
							"id": "",
							"text": ""
						},
						"more": {
							"show": true,
							"text": "查看更多",
							"arr": false,
							"link": "",
							"linkInfo": {
								"text": "",
								"type": 1
							},
							"style": {
								"color": "#a1a7b3",
								"btnBg": "#ffffff",
								"btnBorder": "",
								"btnHeight": 80
							}
						},
						"dataObj": {
							"service": "",
							"interface": {
								"type": "",
								"orderby": "",
								"action": "",
								"service": ""
							},
							"load": 2,
							"pageSize": 10,
							"totalCount": 10,
							"styletype": 2,
							"cardStyle": false,
							"style": {
								"cardBgColor": "#ffffff",
								"bgColor": "#f5f5f5",
								"listBgColor": "#ffffff",
								"lineColor": "#f5f5f7",
								"marginTop": 20,
								"marginLeft": 24,
								"padding": 28,
								"splitMargin": 20,
								"borderRadius": 16,
								"fontSize": 30
							},
							"modCon": {
								"imgScale": 1,
								"style": {
									"fontSize": 26,
									"color": "#333333",
									"pcolor": "#ff0000"
								},
								"orderby": [{
									"value": "",
									"text": "默认"
								}, {
									"value": 1,
									"text": "销量"
								}, {
									"value": 3,
									"text": "价格"
								}],
								"fanyong": {
									"show": false,
									"color": "#ffffff"
								},
								"vipPrice": {
									"show": false
								},
								"huaxian": {
									"show": false,
									"color": "#666666"
								},
								"hdState": {
									"show": false
								},
								"sale": {
									"show": false,
									"color": "#ffffff"
								},
								"quan": {
									"show": false,
									"color": "#ffffff"
								},
								"stitle": {
									"show": false,
									"color": "#ffffff"
								},
								"cartIcon": {
									"cartStyle": 1,
									"path": "",
									"style": {
										"size": 20,
										"color": "",
										"bgColor": ""
									}
								},
								"advList": {
									"show": false,
									"list": []
								}
							}
						},
						"listArr": [],
						"listArrShow": [],
						"listIdArr": []
					}
				}]
			}, {
				"id": 1702628915403,
				"default": 0,
				"type": 1,
				"subtitle": "供需交流",
				"title": {
					"type": "text",
					"path": "",
					"text": "同城信息"
				},
				"link": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				},
				"dataFormData": {
					"currInd": 2,
					"currCInd": "",
					"addType": 1,
					"failure": 0,
					"showObj": {
						"id": 21,
						"action": "ilist_v2",
						"text": "分类信息",
						"service": "info",
						"orderby": ""
					},
					"more": {
						"show": true,
						"text": "查看更多",
						"arr": false,
						"link": "",
						"linkInfo": {
							"text": "",
							"type": 1
						},
						"style": {
							"color": "#a1a7b3",
							"btnBg": "#ffffff",
							"btnBorder": "",
							"btnHeight": 80
						}
					},
					"dataObj": {
						"service": "",
						"interface": {
							"action": "ilist_v2",
							"service": "info",
							"orderby": "",
							"pageSize": 10
						},
						"load": 2,
						"pageSize": 10,
						"totalCount": 10,
						"styletype": 3,
						"cardStyle": false,
						"style": {
							"cardBgColor": "#ffffff",
							"bgColor": "#ffffff",
							"listBgColor": "#ffffff",
							"lineColor": "#f5f5f7",
							"marginTop": 20,
							"marginLeft": 24,
							"padding": 28,
							"splitMargin": 20,
							"borderRadius": 16,
							"fontSize": 30
						},
						"modCon": {
							"orderby": [{
								"value": "",
								"text": "默认排序"
							}, {
								"value": 1,
								"text": "最新发布"
							}, {
								"value": 2,
								"text": "最多浏览"
							}],
							"imgScale": 1,
							"style": {
								"fontSize": 30,
								"color": "#333333"
							},
							"auth": {
								"show": false,
								"color": "#333333"
							},
							"pubDate": {
								"show": false,
								"color": "#666666"
							},
							"label": {
								"show": false,
								"color": "#666666",
								"bgColor": "#f5f5f5"
							},
							"location": {
								"show": false,
								"color": "#888888"
							},
							"locatin": {
								"show": false,
								"color": "#888888",
								"iconColor": ""
							},
							"click": {
								"show": false,
								"color": "#888888",
								"iconColor": ""
							},
							"collect": {
								"styletype": 1,
								"color": "#333333",
								"showText": "",
								"has_color": "#FFBA00",
								"iconColor": "",
								"has_iconColor": ""
							},
							"tel": {
								"styletype": 1,
								"showText": "",
								"iconColor": "",
								"color": "#ffffff"
							},
							"hb": {
								"show": false,
								"showText": "",
								"color": "#ffffff",
								"bgColor": "",
								"opacity": 100
							},
							"share": {
								"show": false,
								"showText": "",
								"iconColor": "",
								"color": "#ffffff"
							},
							"flowAdv": {
								"show": false,
								"android": {
									"app_id": "",
									"placement_id": ""
								},
								"h5": {
									"app_id": "",
									"placement_id": ""
								},
								"wxmini": "",
								"dymini": ""
							},
							"advList": {
								"show": false,
								"list": []
							}
						}
					},
					"listArr": [],
					"listArrShow": [],
					"listIdArr": []
				},
				"children": [{
					"id": 1702628915403,
					"title": "",
					"dataFormData": {
						"currInd": 0,
						"currCInd": "",
						"addType": 1,
						"failure": 0,
						"showObj": {
							"action": "",
							"service": "",
							"id": "",
							"text": ""
						},
						"more": {
							"show": true,
							"text": "查看更多",
							"arr": false,
							"link": "",
							"linkInfo": {
								"text": "",
								"type": 1
							},
							"style": {
								"color": "#a1a7b3",
								"btnBg": "#ffffff",
								"btnBorder": "",
								"btnHeight": 80
							}
						},
						"dataObj": {
							"service": "",
							"interface": {
								"type": "",
								"orderby": "",
								"action": "",
								"service": ""
							},
							"load": 2,
							"pageSize": 10,
							"totalCount": 10,
							"styletype": 2,
							"cardStyle": false,
							"style": {
								"cardBgColor": "#ffffff",
								"bgColor": "#f5f5f5",
								"listBgColor": "#ffffff",
								"lineColor": "#f5f5f7",
								"marginTop": 20,
								"marginLeft": 24,
								"padding": 28,
								"splitMargin": 20,
								"borderRadius": 16,
								"fontSize": 30
							},
							"modCon": {
								"imgScale": 1,
								"style": {
									"fontSize": 26,
									"color": "#333333",
									"pcolor": "#ff0000"
								},
								"orderby": [{
									"value": "",
									"text": "默认"
								}, {
									"value": 1,
									"text": "销量"
								}, {
									"value": 3,
									"text": "价格"
								}],
								"fanyong": {
									"show": false,
									"color": "#ffffff"
								},
								"vipPrice": {
									"show": false
								},
								"huaxian": {
									"show": false,
									"color": "#666666"
								},
								"hdState": {
									"show": false
								},
								"sale": {
									"show": false,
									"color": "#ffffff"
								},
								"quan": {
									"show": false,
									"color": "#ffffff"
								},
								"stitle": {
									"show": false,
									"color": "#ffffff"
								},
								"cartIcon": {
									"cartStyle": 1,
									"path": "",
									"style": {
										"size": 20,
										"color": "",
										"bgColor": ""
									}
								},
								"advList": {
									"show": false,
									"list": []
								}
							}
						},
						"listArr": [],
						"listArrShow": [],
						"listIdArr": []
					}
				}]
			}, {
				"id": 1702628916625,
				"default": 0,
				"type": 1,
				"subtitle": "换个工作",
				"title": {
					"type": "text",
					"path": "",
					"text": "高薪招聘"
				},
				"link": "",
				"linkInfo": {
					"type": "",
					"linkText": ""
				},
				"dataFormData": {
					"currInd": 3,
					"currCInd": "",
					"addType": 1,
					"failure": 0,
					"showObj": {
						"id": 18,
						"action": "postList",
						"text": "招聘",
						"service": "job",
						"orderby": ""
					},
					"more": {
						"show": true,
						"text": "查看更多",
						"arr": false,
						"link": "",
						"linkInfo": {
							"text": "",
							"type": 1
						},
						"style": {
							"color": "#a1a7b3",
							"btnBg": "#ffffff",
							"btnBorder": "",
							"btnHeight": 80
						}
					},
					"dataObj": {
						"service": "",
						"interface": {
							"action": "postList",
							"service": "job",
							"orderby": "",
							"pageSize": 10
						},
						"load": 2,
						"pageSize": 10,
						"totalCount": 10,
						"styletype": 3,
						"cardStyle": true,
						"style": {
							"cardBgColor": "#ffffff",
							"bgColor": "#f5f5f5",
							"listBgColor": "#ffffff",
							"lineColor": "#f5f5f7",
							"marginTop": 20,
							"marginLeft": 24,
							"padding": 28,
							"splitMargin": 20,
							"borderRadius": 16,
							"fontSize": 30
						},
						"modCon": {
							"togrey": false,
							"style": {
								"fontSize": 30,
								"color": "#333333",
								"scolor": "#ff0000"
							},
							"jingyan": {
								"show": false,
								"color": "#ffffff",
								"bgColor": "#f5f5f5"
							},
							"xueli": {
								"show": false,
								"color": "#ffffff",
								"bgColor": "#f5f5f5"
							},
							"fuli": {
								"show": false,
								"color": "#ffffff",
								"bgColor": "#f5f5f5"
							},
							"cname": {
								"show": false,
								"color": "#ffffff"
							},
							"cinfo": {
								"show": false,
								"color": "#ffffff"
							},
							"area": {
								"show": false,
								"color": "#ffffff"
							},
							"posttype": {
								"show": false,
								"color": "#ffffff",
								"bgColor": "#f5f5f5"
							},
							"phone": {
								"show": false,
								"showText": "",
								"color": "#ffffff",
								"bgColor": "#f5f5f5"
							},
							"carea": {
								"show": false,
								"color": "#ffffff"
							},
							"sex": {
								"show": false,
								"color": "#ffffff"
							},
							"age": {
								"show": false,
								"color": "#ffffff"
							},
							"tel": {
								"styletype": 1,
								"showText": "",
								"iconColor": "",
								"color": "#ffffff"
							}
						}
					},
					"listArr": [],
					"listArrShow": [],
					"listIdArr": [300, 269, 126, 116, 187, 141, 202, 133, 150, 183]
				},
				"children": [{
					"id": 1702628916625,
					"title": "",
					"dataFormData": {
						"currInd": 0,
						"currCInd": "",
						"addType": 1,
						"failure": 0,
						"showObj": {
							"action": "",
							"service": "",
							"id": "",
							"text": ""
						},
						"more": {
							"show": true,
							"text": "查看更多",
							"arr": false,
							"link": "",
							"linkInfo": {
								"text": "",
								"type": 1
							},
							"style": {
								"color": "#a1a7b3",
								"btnBg": "#ffffff",
								"btnBorder": "",
								"btnHeight": 80
							}
						},
						"dataObj": {
							"service": "",
							"interface": {
								"type": "",
								"orderby": "",
								"action": "",
								"service": ""
							},
							"load": 2,
							"pageSize": 10,
							"totalCount": 10,
							"styletype": 2,
							"cardStyle": false,
							"style": {
								"cardBgColor": "#ffffff",
								"bgColor": "#f5f5f5",
								"listBgColor": "#ffffff",
								"lineColor": "#f5f5f7",
								"marginTop": 20,
								"marginLeft": 24,
								"padding": 28,
								"splitMargin": 20,
								"borderRadius": 16,
								"fontSize": 30
							},
							"modCon": {
								"imgScale": 1,
								"style": {
									"fontSize": 26,
									"color": "#333333",
									"pcolor": "#ff0000"
								},
								"orderby": [{
									"value": "",
									"text": "默认"
								}, {
									"value": 1,
									"text": "销量"
								}, {
									"value": 3,
									"text": "价格"
								}],
								"fanyong": {
									"show": false,
									"color": "#ffffff"
								},
								"vipPrice": {
									"show": false
								},
								"huaxian": {
									"show": false,
									"color": "#666666"
								},
								"hdState": {
									"show": false
								},
								"sale": {
									"show": false,
									"color": "#ffffff"
								},
								"quan": {
									"show": false,
									"color": "#ffffff"
								},
								"stitle": {
									"show": false,
									"color": "#ffffff"
								},
								"cartIcon": {
									"cartStyle": 1,
									"path": "",
									"style": {
										"size": 20,
										"color": "",
										"bgColor": ""
									}
								},
								"advList": {
									"show": false,
									"list": []
								}
							}
						},
						"listArr": [],
						"listArrShow": [],
						"listIdArr": []
					}
				}]
			}],
			"style": {
				"bgColor": "",
				"chose_title": "#EC3628",
				"chose_stitle": "#FFFFFF",
				"chose_block": "#F22A18",
				"title": "#222222",
				"opacity": 100,
				"chose_opacity": 100,
				"sOpacity": 100,
				"chose_sOpacity": 100,
				"stitle": "#666666",
				"marginLeft": 30,
				"marginTop": 40,
				"marginBottom": 30,
				"chose_sub_title": "#F33521",
				"chose_sub_bgColor": "#FFEEED",
				"chose_sub_bgOpacity": 100,
				"sub_title": "#333333",
				"sub_bgColor": "#ffffff",
				"sub_bgOpacity": 100
			},
			"more": {
				"show": false,
				"styletype": 1,
				"text": "查看更多",
				"arr": false,
				"link": "",
				"linkInfo": {
					"text": "",
					"type": 1
				},
				"style": {
					"color": "#a1a7b3",
					"btnBg": "#ffffff",
					"btnBorder": "",
					"btnHeight": 20
				}
			},
			"title": {
				"show": false,
				"text": "",
				"style": {
					"color": "#333333"
				}
			}
		}
	}],
	"cover": "/siteConfig/atlas/large/2023/12/15/17026292472586.jpg"
}


/*********组件*********/ 

// 数据列表组件
var list_module = {
    props:['dataobj'],
    data:function(){
        return {
            styleString:''
        }
    },
    watch:{
        dataobj:{
            handler:function(val){
                if(val && val.dataObj.modCon && val.dataObj.modCon.advList && val.dataObj.modCon.advList.show){
                    this.getPicHeight(val)
                    this.$nextTick(() => {
                    })
                }
            },
            deep:true
        }
    },
    mounted(){
    },
    methods:{

        //转换PHP时间戳
        transTimes: function(timestamp, n){
    
            const dateFormatter = this.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
    
            if(n == 1){
                return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
            }else if(n == 2){
                return (year+'-'+month+'-'+day);
            }else if(n == 3){
                return (month+'-'+day);
            }else if(n == 4){
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute );
            }else{
                return 0;
            }
        },
    
        //判断是否为合法时间戳
        isValidTimestamp: function(timestamp) {
            return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
        },
    
        //创建 Intl.DateTimeFormat 对象并设置格式选项
        dateFormatter: function(timestamp){
            
            if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};
    
            const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
            var cfg_timezone = $.cookie('HN_cfg_timezone');
            
            // 使用Intl.DateTimeFormat来格式化日期
            const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: typeof cfg_timezone == 'object' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
            });
            
            // 获取格式化后的时间字符串
            const formatted = dateTimeFormat.format(date);
            
            // 将格式化后的字符串分割为数组
            const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);
    
            // 返回一个对象，包含年月日时分秒
            return {year, month, day, hour, minute, second};
        },

        // 验证时间戳是否是当年
        checkFullYear(time){
            const that = this
            let timeStr = ''
            let currYear = new Date().getFullYear();
            let timeYear = new Date(time * 1000).getFullYear()
            timeYear = that.transTimes(time,(currYear > timeYear ? 2 : 4))
            return timeYear
        },

       

        // 此广告位只有双列和瀑布流才有
        async getPicHeight(data){
            const that = this;
            let styleArr = []
            if(data.dataObj.styletype == 4){ //瀑布流取第一张图片的宽高比
                let advList = data.dataObj.modCon.advList;
                if(advList && advList.list.length){
                    let ratio = advList.list[0].width &&  advList.list[0].height  ? (advList.list[0].width / advList.list[0].height) : '1'
                    styleArr.push('aspect-ratio:' + ratio)
                }
                styleArr.push('height:auto')
            }else{
                let height = await that.getHeight()
                styleArr.push('height:' + height + 'px !important')
            }
            that.$set(that,'styleString',styleArr.join(';'))
            // return styleArr.join(';')
        },

        getHeight(){
            const that = this
            return new Promise(resolve => {
                that.$nextTick(() => {
                    let el = that.$refs.carousel[0].$el
                    let ul = $(el).closest('.list_ul')
                    let uls = ul.next('ul')
                    let li = uls.children('li')
                    let height = $(li).height()
                    resolve(height)
                })
            });
        },

        // 样式转换
        checkStyle(data,box){
            let styleArr = []
            if(box == 'list'){
                if(data.cardStyle){
                    styleArr.push('background-color:' + data.style.listBgColor);
                }
                // styleArr.push('margin-bottom:');
                styleArr.push('border-radius:' +( data.style.borderRadius /2) + 'px; overflow:hidden');
                
                if(data.styletype !== 4 && data.styletype !== 2){ //不是 双列 / 瀑布流
                    if(data.cardStyle){
                        styleArr.push('margin:0 ' + (data.style.marginLeft /2) + 'px '  + (data.style.splitMargin/2) + 'px');
                    }else{
                        styleArr.push('margin:0 ' + (data.style.marginLeft /2) + 'px ');
                        styleArr.push('padding-top:' + (data.style.splitMargin/2/2) + 'px ');
                        styleArr.push('padding-bottom:' + (data.style.splitMargin/2/2) + 'px ');
                    }
                    if(data.style.marginLeft == 0 && data.cardStyle){ //属于列表卡片时 可设置内边距
                        styleArr.push('padding-left:' + (data.style.padding / 2) + 'px');
                        styleArr.push('padding-right:' + (data.style.padding / 2)+ 'px');
                    }else if(data.cardStyle){
                        styleArr.push('padding-left:14px');
                        styleArr.push('padding-right:14px');
                    }

                    if(!data.cardStyle && data.style.lineColor){ //底部边框
                        if(data.interface.service != 'house'){

                            styleArr.push('border-bottom:solid 1px' + data.style.lineColor);
                        }
                        styleArr.push('border-radius:0');
                    }

                }else{ //双列
                    styleArr.push('margin-bottom: '+ (data.style.splitMargin/2) + 'px');
                }
            }else if(box == 'pic'){ //图片显示比例
                if(data.modCon.imgScale === 1){
                    let ww = 375; //$(window).width();
                    let margin = data.style.marginLeft / 2 * 2 + data.style.splitMargin / 2;
                    let pw = (ww - margin) / 2
                    let minH = pw * 3 / 4;
                    let maxH = pw * 4 / 3;
                    styleArr.push('min-height: ' + minH + 'px; max-height:' + maxH + 'px')
                }else if(data.modCon.imgScale == 2){
                    styleArr.push('aspect-ratio: 1 / 1; height:auto')
                }else if(data.modCon.imgScale == 3){
                    styleArr.push('aspect-ratio: 4 / 3; height:auto')
                }else if(data.modCon.imgScale == 4){
                    styleArr.push('aspect-ratio: 3 / 2; height:auto')
                }
            }else if(box == 'btnMore'){
                if(data.dataObj.cardStyle){
                    styleArr.push('border:solid 1px '+(data.more.style.btnBorder ? data.more.style.btnBorder : 'transparent' ))
                    styleArr.push('margin:0 '+(data.dataObj.style.marginLeft / 2)+'px')
                    styleArr.push('border-radius:'+(data.dataObj.style.borderRadius / 2)+'px;')
                }else{
                    // console.log(data.dataObj.style.splitMargin)
                    // styleArr.push('margin-top:' +(-data.dataObj.style.splitMargin/2/2)+ 'px;')

                }
                styleArr.push('color:'+data.more.style.color+';')
                styleArr.push('background-color:'+data.more.style.btnBg)
                styleArr.push('height:'+(data.more.style.btnHeight / 2)+'px')
            }
            return styleArr.join(';');
        }

    },
    template:`
    <div class="rootbox" v-if="dataobj">
        <ul :class="['list_ul', dataobj.showObj.service == 'business' ? 'shop_ul' : '',(dataobj && dataobj.showObj && dataobj.showObj.id ? (dataobj.showObj.service + '_ul') : '')]" v-if="dataobj && !['shop','circle'].includes(dataobj.showObj.service) && (dataobj.dataObj.styletype == 3)">
            <li v-for="item in (dataobj.dataObj.load == 2 ? dataobj.listArr.slice(0,(dataobj.listArr.length > dataobj.dataObj.totalCount ? dataobj.dataObj.totalCount : dataobj.listArr.length)) : dataobj.listArr)" :class="[{'cardShow':dataobj.dataObj.cardStyle},{'moreList':dataobj.more && dataobj.more.show}]" :style="checkStyle(dataobj.dataObj,'list')">
                <!-- 商品 -->
                <template v-if="dataobj.showObj.service == 'shop'">
                    <div class="list_con" v-if="dataobj.showObj.id !== 5 && dataobj.showObj.id !== 6">
                        <div class="picbox"><div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner"><img crossOrigin="anonymous" :data-scale="dataobj.dataObj.modCon.imgScale" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="item.litpic" onerror="this.src='/static/images/404.jpg'" alt=""></div></div>
                        <!-- 团购 -->
                        <div class="txtbox" >
                            <div class="pro_info">
                                <h4 :style="'color:'+dataobj.dataObj.modCon.style.color+';'"><span :class="'hditem hditem_' + item.huodongarr" v-if="item.huodongarr == '4' || item.huodongarr == '1'">{{item.huodongarr == 1 ? '限时抢' : '拼团'}}</span>{{item.title}}</h4>
                                <p v-if="dataobj.showObj && dataobj.showObj.id === 1"><span class="address">{{item.alladdr[item.alladdr.length - 1]}}</span><em></em><span class="distance">1.6km</span></p>
                                <div class="sale_info">
                                    <h5 class="priceText" :style="'color:'+dataobj.dataObj.modCon.style.color+';'"> <span>￥<b>{{parseFloat(item.price)}}</b></span><s v-if="item.mprice > item.price">￥{{parseFloat(item.mprice)}}</s> </h5>
                                    <p class="sales" v-if="item.sales > 0">已售{{item.sales}}</p>
                                </div>
                            </div>
                            <div class="shop_info" v-if="dataobj.dataObj.cardStyle">
                                <h6>{{item.storeTitle}}</h6>
                            </div>
                        </div>
                    </div>

                    <!-- 商家 -->
                    <div :class="['list_con',{'store_con':dataobj.showObj.id == 5 || dataobj.showObj.id == 6}]" v-else>
                        <div class="picbox" >
                            <span class="tag" v-if="false">明星商家</span>
                            <div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner">
                                <img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="item.logo" onerror="this.src='/static/images/404.jpg'" alt="">
                            </div>
                            <span class="distance">1.2km</span>
                        </div>
                        <div class="txtbox" >
                            <h4>{{item.title}}</h4>
                            <p>{{item.address}}</p>
                            <p class="labs" v-if="item.cusShoptag && item.cusShoptag.length > 0"><span class="lab" v-for="lab in item.cusShoptag">{{lab}}</span></p>
                        
                        </div>
                    </div>
                    
                </template>

                <!--  商家列表  -->
                <div :class="['list_con',{'flex_li': !item.banner || item.banner.length == 1 || item.logo}]" v-if="dataobj.showObj.service == 'business'">
                    <div class="flex_l">
                        <h2  :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</h2>
                        <div class="binfo">
                            <div class="bScore"><s></s>{{Number(item.rating) > 0 ? item.rating : '暂无评分'}}</div>
                            <div class="bType">{{item.typename[item.typename.length - 1]}}</div>
                            <div class="bTime"  v-if="item.opentime.trim() && item.opentime.trim().length>4 && (item.banner && item.banner.length > 1)">营业时间：{{item.opentime.trim()}}</div>
                            <!-- <div class="bHui"><em>惠</em><span>买单6折</span></div> -->
                            <div :class="['bFactry',{'block':item.opentime.trim()&& item.opentime.trim().length>4 ||  (!Array.isArray(item.typename) || item.typename.length == 0)}]" v-if="item.tagArr && item.tagArr.length">
                                <span v-for="lab in item.tagArr">{{lab}}</span>
                            </div>
                            <div class="bTime timeBottom" v-if="item.opentime.trim() && item.opentime.trim().length>4 && (!item.banner || item.banner.length <= 1)">营业时间：{{item.opentime.trim()}}</div>
                        </div>
                        <div class="bPhotosBox" v-if="item.banner && item.banner.length > 1">
                            <div class="bPhotos">
                                <div class="pic" :style="checkStyle(dataobj.dataObj,'pic')" v-for="pic in item.banner.slice(0,item.banner.length > 3 ? 3 : item.banner.length)">
                                    <img :src="pic.pic" onerror="this.src='/static/images/404.jpg'">
                                </div>
                            </div>
                            <div class="pic_mask" v-if="item.banner.length > 3">+{{item.banner.length - 3}}</div>
                        </div>
                        <div class="bPosi">
                            <div class="b_addr"><s></s><span>{{item.address ? item.address : '暂无信息'}}</span></div>
                            <div class="b_distance"><s></s><span>571m</span></div>
                        </div>
                    </div>
                    <div class="flex_r" v-if="(!item.banner || item.banner.length <=1) && item.logo">
                        <div class="singlePic" :style="checkStyle(dataobj.dataObj,'pic')"><img :src="item.banner && item.banner.length == 1 ? item.banner[0].pic : item.logo" onerror="this.src='/static/images/404.jpg'" ></div>
                    </div>
                </div>

                <!-- 分类信息 -->
                <div class="list_con" v-else-if="dataobj.showObj.service == 'info'">
                    <div class="fb_info" v-if="item.member">
                        <div class="fb_photo">
                            <img crossOrigin="anonymous" :src="item.member.photo && item.member.photo.indexOf('qlogo.cn') < 0 ? item.member.photo:'/static/images/noPhoto_100.jpg'" alt="">
                            <span class="top" v-if="item.isbid == '1'">置顶</span>
                        </div>
                        <div class="fb_detail">
                            <h4>{{item.member.nickname ? item.member.nickname : '匿名用户'}}</h4>
                            <p>{{item.pubdate1}}</p>
                        </div>
                    </div>
                    <div class="fb_con">
                        <h2 :style="'color:'+ dataobj.dataObj.modCon.style.color +'; font-size:' +dataobj.dataObj.modCon.style.fontSize / 2+ 'px;'">
                            {{item.desc}}
                        </h2>
                        <div class="labs"> <span class="typename">{{ item.typename }}</span><span class="tg" v-if="item.hasSetjili == '1' && (item.rewardCount > 0 || item.readInfo == '1') && !item.litpic && (!item.picArr.length)">推广红包</span><span v-for="lab in item.label" class="lab">{{lab.name}}</span></div>
                        <div class="picsbox" v-if="item.picArr.length || item.litpic">
                            <div  class="hb" >
                                <s></s><span>红包派送中</span>
                            </div>
                            <div :class="['pics', {'morePics':item.picArr && item.picArr.length > 1}]" >
                                <div class="pic"  v-for="pic in item.picArr.slice(0,3)">
                                    <div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner">
                                        <img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="pic.litpic" />
                                    </div>
                                </div>
                                <div class="mask_pic" v-if="item.picArr && item.picArr.length > 3"> + {{(item.picArr.length - 3)}}</div>
                            </div>
                        </div>
                        <div class="fb_opt">
                            <div class="flex_l">
                                <p class="addr"><s v-if="item.dizhi"></s><span>{{item.dizhi}}</span></p>
                                <em v-if="item.dizhi && item.distance"></em>
                                <span class="distance" v-if="item.distance">{{item.distance}}</span>
                            </div>
                            <div class="flex_r">
                                <div class="share"><s></s>分享</div>
                                <div class="phone"><s></s>电话</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 圈子 -->
                <div class="list_con" v-else-if="dataobj.showObj.service == 'circle'">
                    <div class="picbox" :style="checkStyle(dataobj.dataObj,'pic')"><img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="item.litpic" onerror="this.src='/static/images/404.jpg'" alt=""></div>
                    <div class="txtbox" >
                        <h4 :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</h4>
                        <div class="fb_info">
                            <div class="fb_photo"></div>
                            <div class="fb_name"></div>
                        </div>
                    </div>
                </div>

                <!-- 贴吧 -->
                <div class="list_con" v-else-if="dataobj.showObj.service == 'tieba'">
                    <div class="fb_info" >
                        <div class="fb_photo"><img crossOrigin="anonymous"  :src="item.photo && item.photo.indexOf('qlogo.cn') ? item.photo : '/static/images/noPhoto_100.jog'" onerror="this.src='/static/images/noPhoto_100.jpg'"></div>
                        <div class="fb_detail">
                            <h4 :style="'color:'+dataobj.dataObj.modCon.style.authColor+';'">{{item.username ? item.username : '匿名用户'}}</h4>
                            <div class="fb_txt">
                                <p>{{item.typename ? '#' + item.typename[item.typename.length - 1]: ''}}</p>
                                <div class="fb_date">{{item.pubdate1}}</div>
                            </div>
                        </div>
                    </div>
                    <div class="fb_con">
                        <h2 :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+(dataobj.dataObj.modCon.style.fontSize / 2)+'px;'"><span class="hot" v-if="item.top == '1'">{{item.top == '1' ? '置顶':''}}</span><span class="jing" v-if="item.jinghua == '1'">精</span>{{item.title}}</h2>
                        <div class="picsbox">
                            <div :class="['pics', {'morePics':item.imgGroup && item.imgGroup.length > 1}]" >
                                <div class="pic"  v-for="pic in item.imgGroup.slice(0,3)">
                                    <div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner">
                                        <img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="pic" onerror="this.src='/static/images/404.jpg'" alt="" >
                                    </div>
                                </div>
                                <div class="mask_pic" v-if="item.imgGroup && item.imgGroup.length > 3"> + {{(item.imgGroup.length - 3)}}</div>
                            </div>
                        </div>
                    </div>
                    <div class="fb_opt">
                        <div class="flex_l">
                            <span class="read"><s></s>{{item.click ? item.click : '浏览'}}</span>
                        </div>
                        <div class="flex_r">
                            <span class="reply"><s></s>{{item.reply > 0? item.reply : '评论'}}</span>
                            <span class="zan"><s></s>{{item.up ? item.up : '点赞'}}</span>
                        </div>
                    </div>
                </div>


                <!-- 房产 -->
                <div class="list_con" v-else-if="dataobj.showObj.service == 'house'">
                    <div class="leftPic" >
                        <div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner">
                            <img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''"  :src="item.litpic"  onerror="this.src='/static/images/404.jpg'" alt="">
                        </div>
                    </div>
                    <div class="rightText">
                        <!-- 新房 -->
                        <template v-if="dataobj.showObj.action == 'loupanList'">
                            <h2  :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'">{{item.title}}</h2>
                            <p>{{item.addr && Array.isArray(item.addr) ? item.addr.slice(-2).join("·"):item.addr}}/{{item.hx_area.join('-')}}㎡/{{item.hx_room.join('.')}}居室</p>
                            <div class="price" v-if="item.price != '0'" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'">
                                <b>{{parseFloat(item.price)}}</b>{{item.ptype != 1 ? '万/套' : '元/平' }}
                            </div>
                            <div class="price" v-else :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'"><b>待定</b></div>
                            <div class="labs"><span class="lab" v-for="lab in item.buildtype">{{lab}}</span></div>
                            
                        </template>
                        
                        <!-- 二手房 -->
                        <template v-if="dataobj.showObj.action == 'saleList'">
                            <h2 :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'">{{item.title}}</h2>
                            <p>{{item.addr && Array.isArray(item.addr) ? item.addr.slice(-2).join("·"):item.addr}}/{{parseFloat(item.area)}}㎡/{{item.room}}</p>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-if="item.price != '0'">
                                <b>{{parseFloat(item.price)}}</b>万元 <span class="unitprice">{{item.unitprice}}元/平</span>
                            </div>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-else><b>面议</b></div>
                            <div class="labs" v-if="item.protype"><span class="lab" >{{item.protype}}</span></div>
                        </template>

                        <!-- 出租 -->
                        <template v-if="dataobj.showObj.action == 'zuList'">
                            <h2 :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'">[{{item.rentype}}]{{item.title}}</h2>
                            <p>{{item.addr && Array.isArray(item.addr) ? item.addr.slice(-2).join("·"):item.addr}}/{{parseFloat(item.area)}}㎡/{{item.room}}</p>
                            <div class="price" v-if="item.price != '0'" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'">
                                <b>{{parseFloat(item.price)}}</b>元/月
                            </div>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-else><b>面议</b></div>
                        </template>


                        <!-- 商铺 办公-->
                        <template v-if="dataobj.showObj.action == 'spList' || dataobj.showObj.action == 'xzlList'">
                            <h2 :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'" class="wrap">[{{item.type == 1 ? '出售' : item.type  == 2 ? '转让' : '出租'}}]{{item.title}}</h2>
                            <p>{{item.addr && Array.isArray(item.addr) ? item.addr.slice(-2).join("·"):item.addr}}/{{parseFloat(item.area)}}㎡/{{item.room}}</p>
                            <div class="price" v-if="item.price != '0'" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'">
                                <span v-if="item.type !== 1"><b>{{parseFloat(item.price)}}</b>元/月</span>
                                <span v-else><b>{{parseFloat(item.price)}}</b>万</span>
                            </div>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-else><b>面议</b></div>
                        </template>

                        <!-- 车位-->
                        <template v-if="dataobj.showObj.action == 'cwList'">
                            <h2 class="wrap" :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'">[{{item.type == 1 ? '出售' : item.type == 2  ? '转让' : '出租'}}]{{item.title}}</h2>
                            <p>{{item.addr && Array.isArray(item.addr) ? item.addr.slice(-2).join("·"):item.addr}}/{{parseFloat(item.area)}}㎡/{{item.protype}}</p>
                            <div class="price" v-if="item.price != '0'" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'">
                                <span v-if="item.type !== 1"><b>{{parseFloat(item.price)}}</b>元/月</span>
                                <span v-else><b>{{parseFloat(item.price)}}</b>万</span>
                            </div>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-else><b>面议</b></div>
                        </template>

                        <!-- 厂房 -->
                        <template v-if="dataobj.showObj.action == 'cfList'">
                            <h2 class="wrap" :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'">[仓库{{item.type == 1 ? '出售' : item.type  == 2 ? '转让' : '出租'}}]{{item.title}}</h2>
                            <p>{{parseFloat(item.area)}}㎡/{{item.addr ? item.addr.slice(-2).join("·"):item.addr}}</p>
                            <div class="price" v-if="item.price != '0'" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'">
                                <span v-if="item.type !== 1"><b>{{parseFloat(item.price)}}</b>元/月</span>
                                <span v-else><b>{{parseFloat(item.price)}}</b>万</span>
                            </div>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-else><b>面议</b></div>
                        </template>



                        <!-- 小区 -->
                        <template v-if="dataobj.showObj.action == 'communityList'">
                            <h2 :style="'color:'+dataobj.dataObj.modCon.style.color+'; font-size:'+ (dataobj.dataObj.modCon.style.fontSize / 2) +'px;'">{{item.title}}</h2>
                            <p>{{item.protype ? item.protype  : '住宅'}}/{{transTimes(item.opendate,2).split('-')[0]}}年建成</p>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-if="item.price != '0'">
                            均价<b>{{parseFloat(item.price)}}</b>元/平 <span v-if="item.saleCount > 0" class="sz_info">在售{{item.saleCount}}</span><span v-if="item.zuCount > 0" class="sz_info">在租{{item.zuCount}}</span>
                            </div>
                            <div class="price" :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'" v-else><b>待定</b><span v-if="item.saleCount > 0" class="sz_info">在售{{item.saleCount}}</span><span v-if="item.zuCount > 0" class="sz_info">在租{{item.zuCount}}</span></div>
                            <div class="addr"><s></s><span>{{item.addr[item.addr.length - 1]}}</span></div>
                        </template>
                        <div class="line_house" v-if="!dataobj.dataObj.cardStyle" :style="'background:'+ dataobj.dataObj.style.lineColor +'; bottom:'+ (-dataobj.dataObj.style.splitMargin/2/2) + 'px;'"></div>
                    </div>
                </div>

                <!-- 资讯 -->
                <div class="list_con" v-else-if="dataobj.showObj.service == 'article'">
                    <template v-if="item.mold == 0 || (item.mold == 1 && item.group_img.length < 3) || (item.mold == 2 || item.mold == 3)">
                        <!-- 单图左右 -->
                        <div class="flex_list" v-if="item.typeset == 0 && (item.mold != 2 && item.mold != 3)"  >
                            <div class="art_text">
                                <h2 v-html="item.title" :style="'color:'+dataobj.dataObj.modCon.style.color+';'"></h2>
                                <div class="art_info"><span class="mold" v-if="item.mold == '0'">置顶</span><span><em :style="'color:'+dataobj.dataObj.modCon.style.sourceColor+';'">{{item.writer ? item.writer : item.source}}</em>· {{transTimes(item.pubdate,3)}}</span> <span class="read"><s></s><em>{{item.click}}</em></span></div>
                            </div>
                            <div class="imgbox" v-if="item.litpic">
                                <div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner">
                                    <img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="item.litpic" onerror="this.src='/static/images/404.jpg'" alt="">
                                </div>
                            </div>
                        </div>

                        <!-- 大图左右 -->
                        <div class=" bigImg_list" v-else>
                            <h2 v-html="item.title"  :style="'color:'+dataobj.dataObj.modCon.style.color+';'"></h2>
                            <div class="imgbox" v-if="item.litpic">
                                <div class="video_icon"></div>
                                <div  :style="checkStyle(dataobj.dataObj,'pic')" class="picInner">
                                    <img crossOrigin="anonymous" :style="dataobj.dataObj.modCon.imgScale === 1 ? 'position:static' : ''" :src="item.litpic" alt="" onerror="this.src='/static/images/404.jpg'">
                                </div>
                            </div>
                            <div class="art_info"><span class="mold" v-if="item.mold == '0'">置顶</span><span><em :style="'color:'+dataobj.dataObj.modCon.style.sourceColor+';'">{{item.writer ? item.writer : item.source}}</em>· {{transTimes(item.pubdate,3)}}</span> <span class="read"><s></s><em>{{item.click}}</em></span></div>
                        </div>
                    </template>

                    <!-- 多图 --> 
                    <template v-else>
                        <div class="moreImg_list">
                            <h2 v-html="item.title"  :style="'color:'+dataobj.dataObj.modCon.style.color+';'"></h2>
                            <div class="imgCon" v-if="item.group_img && item.group_img.length">
                                <div class="imgbox" v-for="img in (item.group_img.slice(0,(item.group_img.length > 3 ? 3 : item.group_img.length)))"><img crossOrigin="anonymous" :src="img.path" alt="" onerror="this.src='/static/images/404.jpg'"></div>
                            </div>
                            <div class="art_info"><span class="mold" v-if="item.mold == '0'">置顶</span><span><em :style="'color:'+dataobj.dataObj.modCon.style.sourceColor+';'">{{item.writer ? item.writer : item.source}}</em>· {{transTimes(item.pubdate,3)}}</span> <span class="read"><s></s><em>{{item.click}}</em></span></div>
                        </div>
                    </template>
                </div>


                <!-- 顺风车 -->
                <div class="list_con" v-else-if="dataobj.showObj.service == 'sfcar'">
                    <div class="carInfo"><span :class="['cartype', item.usetype == '1' ? 'truck' : 'car']" :style="'color:'+ dataobj.dataObj.modCon.style[(item.usetype == '1' ? 'color_type2' :'color_type1' )]+'; background-color:'+dataobj.dataObj.modCon.style[(item.usetype == '1' ? 'bgColor_type2' :'bgColor_type1')]+';'">{{item.usetypename}}</span><h2 :style="'color:'+dataobj.dataObj.modCon.style.color+';font-size:'+(dataobj.dataObj.modCon.style.fontSize / 2)+'px;'">{{item.startaddr}}<s></s>{{item.endaddr}}</h2> </div>
                    <div class="startDate">
                        <div class="flex_l"><b :class="item.missiontype == 1 ? 'startdayDay' : 'startday'" :style="'color:'+dataobj.dataObj.modCon.style.startDate+';'">{{item.missiontime }}</b> <span class="startWeek" :style="'color:'+dataobj.dataObj.modCon.style.startTime+';'">{{item.missiontime1}}</span></div>
                        <div class="flex_r">{{checkFullYear(item.pubdate)}}</div>
                    </div>
                    <div class="noteText" v-if="item.note"><b>备注：</b>{{item.note}}</div>
                    
                    <div class="infobox">
                        <div class="flex_l"><span class="lab" v-for="tag in item.tag">{{tag}}</span></div>
                        <div class="flex_r"><span>拨打电话</span></div>
                    </div>
                </div>

                

                <!-- 大商家 -->
                <div :class="['list_con store_con']" v-else-if="dataobj.showObj.service == 'business'">
                    <div class="picbox" :style="checkStyle(dataobj.dataObj,'pic')" >
                        <span class="tag" v-if="false">明星商家</span>
                        <div class="picInner" :style="checkStyle(dataobj.dataObj,'pic')">
                            <img crossOrigin="anonymous" :src="item.logo" onerror="this.src='/static/images/404.jpg'" alt="">
                        </div>
                        <span class="distance">1.2km</span>
                    </div>
                    <div class="txtbox" >
                        <h4>{{item.title}}</h4>
                        <p>{{item.address}}</p>
                        <p class="labs" v-if="item.tagArr && item.tagArr.length > 0 && dataobj.dataObj.styletype == 4"><span class="lab" v-for="lab in item.tagArr">{{lab}}</span></p>
                    
                    </div>
                </div>




                <!-- 招聘 -->
                <template  v-else-if="dataobj.showObj.service == 'job'">
                    <!-- 找工作 -->
                    <div :class="['list_con',{'hasDelivery':item.has_delivery }]" v-if="dataobj.showObj.id == 18">
                        <div class="itemBox">
                            <div class="itemCon">
                                <div class="item_head">
                                    <h2 :style="'color:'+dataobj.dataObj.modCon.style.color+';'"><span class="top_label" v-if="item.is_topping">置顶</span><span class="item_tit">{{item.title}}</span><span class="d_mark" v-if="item.has_delivery">已投递</span></h2>
                                    <span class="salary_show" :style="'color:'+dataobj.dataObj.modCon.style.scolor+';'">{{item.show_salary}}<span v-if="(item.dy_salary > 12 && !item.mianyi)"><em class="sm"> · </em>{{item.dy_salary}}<b>薪</b></span></span>
                                </div>
                                <div class="item_label"><span >{{item.experience ? item.experience : '经验不限'}}</span><span>{{item.educational}}</span></div>
                                <div class="company_info" v-if="item.companyDetail">
                                    <div class="company">
                                        <div class="clogo">
                                            <img crossOrigin="anonymous" :src="item.companyDetail.logo" alt="" onerror="this.src='/static/images/404.jpg'"/>
                                        </div>
                                        <h4>{{item.companyDetail.title}}</h4>
                                        <span class="famous_icon" v-if="item.companyDetail.famous">名企</span>
                                    </div>
                                    <div class="cdetail">
                                        <p class="cinfo">
                                            <span>{{item.companyDetail.nature_name}}</span><em>|</em><span>{{item.companyDetail.scale_name}}</span><em>|</em><span>{{item.companyDetail.industry_name}}</span>
                                        </p>
                                        <p class="caddr" v-if="(item.job_addr_detail && item.job_addr_detail.addrName && item.job_addr_detail.addrName.length)">{{item.job_addr_detail.addrName[item.job_addr_detail.addrName.length - 1]}}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 普工求职 -->
                    <div :class="['list_con pgqz']" v-if="dataobj.showObj.id == 20">
                        <div class="f-item">
                            <div class="fi-left">
                                <div class="title" :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</div>
                                <div class="address">期望地点：{{item.addrName  ? item.addrName[item.addrName.length - 1] : item.addrName}}</div>
                                <div class="user">
                                    <img crossOrigin="anonymous" class="photo" :src="item.photo" onerror="this.src='/static/images/noPhoto_100.jpg'" />
                                    <div class="details">
                                        <div class="name">{{item.nickname}}<span v-if="item.sex_name">({{item.sex_name}})</span></div>
                                        <div class="age" v-if="item.age">{{item.age}}岁</div>
                                        <div v-if="item.experience_name">{{item.experience_name}}经验</div>
                                    </div>
                                </div>
                            </div>
                            <div class="fi-right" @click.stop="checkPhone(item,ind)">
                                <img crossOrigin="anonymous" src="/static/images/admin/siteConfigPage/phoneW.png">
                                <span>电话</span>
                            </div>
                        </div>
                    </div>


                    <!-- 普工招人 -->
                    <div :class="['list_con pgzr']" v-if="dataobj.showObj.id == 19">
                        <!-- 标题 -->
                        <div class="di-title">
                            <p :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</p>
                            <span :style="'color:'+dataobj.dataObj.modCon.style.scolor+';'">{{item.min_salary}}-{{item.max_salary}}<span>元</span></span>
                        </div>
                        <!-- 标签 -->
                        <div class="di-label">
                            <div class="left">
                                <div>
                                    <p v-if="Array.isArray(item.welfare_name)" v-html="item.welfare_name.join('<span>/</span>')"></p>
                                </div>
                                <div class="label">
                                    <div v-if="item.nature_name">{{item.nature_name}}</div>
                                    <div v-if="item.education_name">{{item.education_name}}</div>
                                    <div v-if="item.experience||item.experience==0">{{item.experience==0?'经验不限':item.experience+'年'}}</div>
                                </div>
                            </div>
                            <div class="right">
                                <span @click.stop="checkPhone(item,ind)">电话</span>
                            </div>
                        </div>
                        <!-- 用户 -->
                        <div class="di-user">
                            <div v-if="item.nickname">{{item.nickname}}</div>
                            <div v-if="item.address">{{item.address}}</div>
                        </div>
                    </div>
                </template>

            </li>
        </ul>
        
        <!--瀑布流布局-->
        <div :class="['flowbox','flowbox' + dataobj.dataObj.styletype]" v-if="dataobj && ['shop','circle','business'].includes(dataobj.showObj.service)  && [2,4].includes(dataobj.dataObj.styletype) " :style="'margin:0 '+(dataobj.dataObj.style.marginLeft /2)+'px; column-gap:'+(dataobj.dataObj.style.splitMargin / 2 )+'px;'" >
            <ul v-for="ul in 2" :class="['list_ul',(dataobj && dataobj.showObj && dataobj.showObj.id && dataobj.showObj.service !== 'business' ? (dataobj.showObj.service + '_ul') : ''),dataobj.showObj.service == 'business' ? 'shop_ul' : '']">
                <li v-if="dataobj.dataObj.modCon.advList && dataobj.dataObj.modCon.advList.show && dataobj.dataObj.modCon.advList.list && dataobj.dataObj.modCon.advList.list.length  && ul == 1" :style="checkStyle(dataobj.dataObj,'list')">
                
                    <div  :style=" styleString" class="advList list_con">
                        <el-carousel ref="carousel" >
                            <el-carousel-item v-for="(adv,ind) in dataobj.dataObj.modCon.advList.list" :key="'adv'+adv.id">
                                <img crossOrigin="anonymous" :src="adv.path" v-if="adv.path">
                            </el-carousel-item>
                        </el-carousel>
                    </div>
                </li>
                <li :class="{'cardShow':dataobj.dataObj.cardStyle}" v-for="(item,ind) in (dataobj.dataObj.load == 2 ? dataobj.listArr.slice(0,(dataobj.listArr.length > dataobj.dataObj.totalCount ? dataobj.dataObj.totalCount : dataobj.listArr.length)) : dataobj.listArr)"  v-if="ind % 2  == (ul - 1)" :style="checkStyle(dataobj.dataObj,'list')">
                    <!-- 商品 -->
                    <template v-if="dataobj.showObj.service == 'shop'">
                        
                        <div class="list_con" v-if="dataobj.showObj.id !== 5 && dataobj.showObj.id !== 6 && item">
                            <div class="picbox"  ><img :style="checkStyle(dataobj.dataObj,'pic')" crossOrigin="anonymous" :src="item.litpic" onerror="this.src='/static/images/404.jpg'" alt=""></div>
                            <!-- 团购 -->
                            <div class="txtbox" >
                                <div class="pro_info">
                                    <h4 :style="'color:'+dataobj.dataObj.modCon.style.color+';'"><span :class="'hditem hditem_' + item.huodongarr" v-if="item.huodongarr == '4' || item.huodongarr == '1'">{{item.huodongarr == 1 ? '限时抢' : '拼团'}}</span>{{item.title}}</h4>
                                    <p v-if="dataobj.showObj && dataobj.showObj.id === 1"><span class="address" >{{item.alladdr[item.alladdr.length - 1]}}</span><em></em><span class="distance">1.6km</span></p>
                                    <div class="sale_info">
                                        <h5 class="priceText"> <span  :style="'color:'+dataobj.dataObj.modCon.style.pcolor+';'">￥<b>{{parseFloat(item.price)}}</b></span><s v-if="item.mprice > item.price">￥{{parseFloat(item.mprice)}}</s> </h5>
                                        <p class="sales" v-if="item.sales > 0">已售{{item.sales}}</p>
                                    </div>
                                </div>
                                <div class="shop_info" v-if="dataobj.dataObj.cardStyle && [1,3].includes(dataobj.showObj.id)">
                                    <h6>{{item.storeTitle}}</h6>
                                </div>
                            </div>
                        </div>

                        <!-- 商家 -->
                        <div :class="['list_con',{'store_con':dataobj.showObj.id == 5 || dataobj.showObj.id == 6}]" v-else>
                            <div class="picbox" :style="checkStyle(dataobj.dataObj,'pic')" >
                                <span class="tag" v-if="false">明星商家</span>
                                <div class="picInner" :style="checkStyle(dataobj.dataObj,'pic')">
                                    <img crossOrigin="anonymous" :src="item.logo" onerror="this.src='/static/images/404.jpg'" alt="">
                                </div>
                                <span class="distance">1.2km</span>
                            </div>
                            <div class="txtbox" >
                                <h4 :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</h4>
                                <p>{{item.address}}</p>
                                <p class="labs" v-if="item.cusShoptag && item.cusShoptag.length > 0"><span class="lab" v-for="lab in item.cusShoptag">{{lab}}</span></p>
                            
                            </div>
                        </div>
                        
                    </template>

                    
                        <!-- 圈子 -->
                        <div class="list_con" v-else-if="dataobj.showObj.service == 'circle'">
                            <div class="picbox"><img crossOrigin="anonymous" :src="item.litpic" onerror="this.src='/static/images/404.jpg'" alt=""></div>
                            <div class="txtbox" >
                                <h4 :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</h4>
                                <div class="fb_info">
                                    <div class="fb_photo"></div>
                                    <div class="fb_name"></div>
                                </div>
                            </div>
                        </div>

                        
                        <!-- 大商家 -->
                        <div :class="['list_con store_con']" v-else-if="dataobj.showObj.service == 'business'">
                            <div class="picbox">
                                <span class="tag" v-if="false">明星商家</span>
                                <div class="picInner" :style="checkStyle(dataobj.dataObj,'pic')">
                                    <img crossOrigin="anonymous" :src="item.logo" onerror="this.src='/static/images/404.jpg'" alt="">
                                </div>
                                <span class="distance">1.2km</span>
                            </div>
                            <div class="txtbox" >
                                <h4 :style="'color:'+dataobj.dataObj.modCon.style.color+';'">{{item.title}}</h4>
                                <p>{{item.address}}</p>
                                <p class="labs" v-if="item.tagArr && item.tagArr.length > 0 && dataobj.dataObj.styletype == 4"><span class="lab" v-for="lab in item.tagArr">{{lab}}</span></p>
                            
                            </div>
                        </div>

                </li>
            </ul>
        </div>
        <!--无限加载有个遮罩-->
        <div class="dataMask" v-if="dataobj.listArr && dataobj.listArr.length > 0 && dataobj.addType === 1 && dataobj.dataObj.load == 1">
            <p>实际页面将继续加载数据…</p>
        </div>
        <div class="btn_more" v-if="dataobj.listArr && dataobj.listArr.length > 0 && dataobj.more && dataobj.more.show" >
            <span :style="checkStyle(dataobj,'btnMore')">
            {{dataobj.more.text}}
            <s v-if="dataobj.more.arr" >
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="11px" height="20px" viewBox="0 0 22 30"> <path fill-rule="evenodd"  opacity="0.6" :fill="dataobj.more.style.color ? dataobj.more.style.color : 'rgb(161, 164, 179)'" d="M10.977,9.976 C10.977,9.618 10.831,9.260 10.544,8.986 L3.484,0.385 C2.910,-0.161 1.972,-0.161 1.401,0.385 C0.822,0.935 0.822,1.820 1.401,2.368 L7.415,9.976 L1.401,17.583 C0.822,18.130 0.822,19.020 1.401,19.567 C1.972,20.113 2.910,20.113 3.484,19.567 L10.544,10.968 C10.831,10.694 10.977,10.336 10.977,9.976 Z"/> </svg>
            </s>
            </span>
        </div>

    </div>
    `,
}








