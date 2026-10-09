// linear-gradient(90deg, #33364D 0%, #3A3D57 100%)

// 平台默认模板
defaultModel = {
    // 会员组件默认数据
    memberComp: {
        "theme": 1,
        "themeType": "dark",
        "bgType": "image",
        "style": {
            "bg_color": "#ffffff",
            "initBg_color": "#ffffff",
            "bg_image": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/bg_01.png"
        },
        "business": {
            "icon": masterDomain + "/static/images/admin/siteMemberPage/icon01.png",
            "link": businessUrl,
            "text": "商家版"
        },
        "branch": {
            "icon": masterDomain + "/static/images/admin/siteMemberPage/icon01.png",
            "link": memberDomain + "/workPlatform.html",
            "text": "工作台"
        },
        "setBtns": {
            "btnType": 2,
            "btns": [{
                "icon": masterDomain + "/static/images/admin/siteMemberPage/icon02.png",
                "link": memberDomain + "/setting.html",
                "text": "",
                "edit": 0
            }]
        },
        "qiandaoBtn": {
            "icon": masterDomain + "/static/images/admin/siteMemberPage/icon03.png",
            "link": memberDomain + "/qiandao.html",
            "text": "签到",
            "style": {
                "color": "#192233",
                "init_color": "#192233",
                "opciaty": "100",
                "background": "#ffffff",
                "init_background": "#ffffff"
            }
        },
        "vipCard": {
            "theme": 1,
            "title": "会员",
            "titleStyle": {
                "color": "#ffffff",
                "initColor": "#ffffff"
            },
            "subtitle": [{
                "type": 1,
                "text": "会员有效期"
            }],
            "subStyle": {
                "color": "#EDF2FA",
                "initColor": "#EDF2FA"
            },
            "icon": masterDomain + "/static/images/admin/siteMemberPage/vip_icon01.png",
            "style": {
                "bgType": "color",
                "background": "linear-gradient(90deg, #33364D 0%, #3A3D57 100%)",
                "backimg": "",
                "initBackground": "linear-gradient(90deg, #33364D 0%, #3A3D57 100%)"
            },
            "btnText": "立即开通",
            "btnLink":memberDomain + '/upgrade.html',
            "btnStyle": {
                "styleType": "radius",
                "style": {
                    "color": "#ffffff",
                    "initColor": "#ffffff",
                    "background": "#FE3535",
                    "initBackground": "#FE3535",
                    "borderRadius": "13"
                }
            }
        },
        "vipBtnsGroup": [],
        "numberCount": {
            "showItems": [1, 2, 3, 4],
            "numberStyle": {
                "color": "#FF3419",
                "init_color": "#FF3419"
            },
            "titleStyle": {
                "color": "#45474D",
                "init_color": "#45474D"
            },
            "style": {
                "background": "#ffffff",
                "init_background": "#ffffff",
                "opacity": "70",
                "borderColor": "#ffffff",
                "init_borderColor": "#ffffff",
                "borderSize": "2"
            },
            "splitLine": false
        },
        "financeCount": {
            "showItems": [1, 2, 3],
            "numberStyle": {
                "color": "#F0DEBD",
                "init_color": "#F0DEBD"
            },
            "titleStyle": {
                "color": "#ffffff",
                "init_color": "#ffffff"
            },
            "style": {
                "background": "#262738",
                "init_background": "#262738"
            }
        },
        "cardStyle": {
            "borderRadius": 24,
            "marginLeft": 30,
            "marginTop": 20
        }
    },

    // 其他组件
    compArrs:[{
        "id": 2,
        "typename": "order",
        "sid":1,
        "content": {
            "popid": "",
            "title": {
                "text": "我的订单",
                "show": true,
                "style": {
                    "color": "#070F21",
                    "initColor": "#070F21"
                }
            },
            "more": {
                "text": "查看更多",
                "arr": false,
                "showType": 0,
                "link": memberDomain + "/order.html",
                "style": {
                    "color": "#AFB4BE",
                    "initColor": "#AFB4BE"
                }
            },
            "btnStyle": {
                "color": "#45474C",
                "initColor": "#45474C"
            },
            "tipNumStyle": {
                "background": "#FF3419",
                "initBackground": "#FF3419"
            },
            "showItems": [1, 2, 3, 4, 5],
            "orderOption": [{id:1,text:'待付款',icon:defaultPath + 'order_01.png?v=1',link:memberDomain + '/order.html?state=1',btnText:'待付款',code:'daifukuan'},
            {id:2,text:'待使用',icon:defaultPath + 'order_02.png?v=1',link:memberDomain + '/order.html?state=2',btnText:'待使用',code:'daixiaofei'},
            {id:3,text:'待发货',icon:defaultPath + 'order_03.png?v=1',link:memberDomain + '/order.html?state=3',btnText:'待发货',code:'daifahuo'},
            {id:4,text:'待收货',icon:defaultPath + 'order_04.png?v=1',link:memberDomain + '/order.html?state=4',btnText:'待收货',code:'daishouhuo'},
            {id:5,text:'待评价',icon:defaultPath + 'order_05.png?v=1',link:memberDomain + '/order.html?state=5',btnText:'待评价',code:'daipingjia'},
            {id:6,text:'待分享',icon:defaultPath + 'order_06.png?v=1',link:memberDomain + '/order-shop.html?state=6,4',btnText:'待分享',code:'daifenxiang'},
            {id:7,text:'退款售后',icon:defaultPath + 'order_07.png?v=1',link:memberDomain + '/order.html?state=7',btnText:'退款售后',code:'tuikuanshouhou'},
            {id:8,text:'全部',icon:defaultPath + 'order_08.png?v=1',link:memberDomain + '/order.html',btnText:'全部',code:'all'},],
            "showNumItems": [1, 2, 3],
            "style": {
                "borderRadius": 24,
                "marginTop": 22,
                "marginLeft": 30
            }
        }
    }, {
        "id": 7,
        "sid":1,
        "typename": "adv",
        "content": {
            "column": 2,
            "list": [{
                "image": masterDomain +"/static/images/admin/siteMemberPage/defaultImg/invite.png",
                "link": masterDomain + "/mobile.html"
            }, {
                "image": masterDomain +"/static/images/admin/siteMemberPage/defaultImg/upgrade.png",
                "link": memberDomain + "/upgrade.html"
            }],
            "style": {
                "marginTop": 22,
                "marginLeft": 30,
                "borderRadius": 24,
                "height": 120
            }
        }
    }, {
        "id": 4,
        "sid":1,
        "typename": "icons",
        "content": {
            "qiandao": {
                "show": false,
                "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png",
                "style": {
                    "color": "#FFAA21",
                    "background": "#FFF8ED"
                }
            },
            "title": {
                "text": "常用功能",
                "show": true,
                "style": {
                    "color": "#070F21"
                }
            },
            "btns": {
                "list": [{
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_01.png",
                    "text": "我的发布",
                    "link": memberDomain + "/manage"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_02.png",
                    "text": "购物卡",
                    "link": memberDomain + "/consume.html"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_03.png",
                    "text": "合伙人",
                    "link": memberDomain + "/fenxiao.html"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_04.png",
                    "text": "打赏收益",
                    "link": memberDomain + "/reward.html"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_05.png",
                    "text": "待兑券码",
                    "link": memberDomain + "/quan.html"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_06.png",
                    "link": memberDomain + "/address.html",
                    "text": "收货地址"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_07.png",
                    "link": memberDomain + "/security.html",
                    "text": "安全中心"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_08.png",
                    "link": "tel:0512-67581578",
                    "text": "官方客服"
                }, {
                    "icon": masterDomain + "/static/images/admin/siteMemberPage/defaultImg/icons_09.png",
                    "link": masterDomain + "/mobile.html",
                    "text": "下载App"
                }],
                "style": {
                    "color": "#45474C"
                }
            },
            "more": {
                "text": "查看更多",
                "arr": 1,
                "show": false,
                "link": "",
                "style": {
                    "color": "#AFB4BE",
                    "initColor": "#AFB4BE"
                }
            },
            "style": {
                "borderRadius": 24,
                "marginTop": 22,
                "marginLeft": 30,
                // "bg_color": "#ffffff",
                // "initBg_color": "#ffffff",
                // "bg_image": ""
            },
            column:5,
        }
    }],

    // 页面设置
    pageSet:{
        "showType": 0,
        "layout": 0,
        "title": "",
        "infoData":[],
        "orderData":[],
        "style": {
            "background": "#fff",
            "init_background": "#fff",
            "color": "#070F21",
            "init_color": "#070F21",
            "borderRadius": 24,
            "marginTop": 22,
            "marginLeft": 30
        },
        "btns": {
            "showType": 0,
            "themeType": "dark",
            "list": [{
                "icon": masterDomain + "/static/images/admin/siteMemberPage/icon02.png",
                "link": memberDomain + "/setting.html",
                "text": "",
                "edit": 0
            }],
            "style": {
                "color": "",
                "init_color": ""
            }
        }
    },

    selfDefine:0,
}

var pickr1,pickr2,pickr3;
var page = new Vue({
    el:'#page',
    data:{
        bottomNavs:[], //底部按钮
        showPop:false, //删除弹窗
        showResetPop:false, //重置弹窗
        preveiwSet:'',
        preveiw:false, //预览
        hasSetModel: !config  ? '' : JSON.parse(config), //设置的模板
        showLine:true, //是否显示辅助线
        showTitle:false, //是否显示标题
        defaultModel:defaultModel,
        currEditPart:1, //当前正在编辑的部分  1 => 会员头部   2 => 订单  
        currEditInd:0, //当前编辑的index  指在showContainerArr中
        defaultPath:defaultPath, //默认图片存储地址
        defaultIcon1:masterDomain + '/static/images/admin/siteMemberPage/default_icon1.png',
        defaultIcon2:masterDomain + '/static/images/admin/siteMemberPage/default_icon2.png',
        showMemberCardPop:false, //用户背景图弹窗选择 默认false 隐藏
        memberCardBgChosed:1, //用户背景图当前选中的样式
        showContentSet:true, //内容设置展开/收起
        showVipSet:true, //会员设置展开/收起
        showNumberSet:true, //数字设置展开/收起
        financeInfoSet:true, //财务设置
        showMarginSet:true, //间距设置展开/收起
        btnsGroupSet:true, //按钮组
        // 上传的背景图 => 用做保存
        memberBg:'', //会员头部背景图
        qiandaoSet:false, //是否设置过签到， 没有设置过签到才会显示
        // 深色模式记录样式
        dark:{
            number:'#ff3419',  //数字标题颜色
            title:'#45474d',  //文字颜色
        },
        numberOption:[
            {id:1,text:cfg_pointName,num:'8526',code:'point',link:memberDomain + '/pocket.html?dtype=1'},
            {id:2,text:'余额',num:'347.5',code:'money',link:memberDomain + '/pocket.html?dtype=0'},
            {id:3,text:'优惠券',num:'36',code:'quan',link:memberDomain + '/quan.html'},
            {id:4,text:'收藏',num:'999+',code:'collect',link:memberDomain + '/collection.html'},
            {id:5,text:'足迹',num:'999+',code:'footPrint',link:memberDomain + '/history.html'},
            {id:6,text:'粉丝',num:'2.3w',code:'fans',link:masterDomain + 'user/29/fans.html'},
            {id:7,text:'发布',num:'29',code:'fabu',link:masterDomain + '/manage.html'},
            {id:8,text:'关注',num:'2.3w',code:'follow',link:masterDomain + 'user/29/follow.html'},
        ], //数字选项
        financeOption:[
            {id:1,text:cfg_pointName,num:'8526',code:'point',link:memberDomain + '/pocket.html?dtype=1'},
            {id:2,text:'余额',num:'347.5',code:'money',link:memberDomain + '/pocket.html?dtype=0'},
            {id:3,text:'优惠券',num:'36',code:'quan',link:memberDomain + '/quan.html'},
            {id:4,text:cfg_bonusName,num:'595.00',code:'bonus',link:memberDomain + '/consume.html'},
        ], //财务选项
        orderOption:[
            {id:1,text:'待付款',icon:defaultPath + 'order_01.png?v=1',link:memberDomain + '/order.html?state=1',btnText:'待付款',code:'daifukuan'},
            {id:2,text:'待使用',icon:defaultPath + 'order_02.png?v=1',link:memberDomain + '/order.html?state=2',btnText:'待使用',code:'daixiaofei'},
            {id:3,text:'待发货',icon:defaultPath + 'order_03.png?v=1',link:memberDomain + '/order.html?state=3',btnText:'待发货',code:'daifahuo'},
            {id:4,text:'待收货',icon:defaultPath + 'order_04.png?v=1',link:memberDomain + '/order.html?state=4',btnText:'待收货',code:'daishouhuo'},
            {id:5,text:'待评价',icon:defaultPath + 'order_05.png?v=1',link:memberDomain + '/order.html?state=5',btnText:'待评价',code:'daipingjia'},
            {id:6,text:'待分享',icon:defaultPath + 'order_06.png?v=1',link:memberDomain + '/order-shop.html?state=6,4',btnText:'待分享',code:'daifenxiang'},
            {id:7,text:'退款售后',icon:defaultPath + 'order_07.png?v=1',link:memberDomain + '/order.html?state=7',btnText:'退款售后',code:'tuikuanshouhou'},
            {id:8,text:'全部',icon:defaultPath + 'order_08.png?v=1',link:memberDomain + '/order.html',btnText:'全部',code:'all'},
        ], //订单选项
       

        moduleOptions:[{
            id:1,
            text:'会员信息',
            icon:'',
            more:0, //是否可以多个
            typename:'member'
        },{
            id:2,
            text:'订单管理',
            icon:'',
            more:0, //是否可以多个
            typename:'order'
        },{
            id:3,
            text:'财务卡片',
            icon:'',
            more:0, //是否可以多个,
            typename:'finance'
        },{
            id:4,
            text:'图标组',
            icon:'',
            more:1, //是否可以多个
            typename:'icons'
        },{
            id:5,
            text:'列表导航',
            icon:'',
            more:1, //是否可以多个
            typename:'list'
        },{
            id:6,
            text:'关注公众号',
            icon:'',
            more:0, //是否可以多个
            typename:'wechat'
        },{
            id:7,
            text:'瓷片广告位',
            icon:'',
            more:1, //是否可以多个
            typename:'adv'
        },{
            id:8,
            text:'分隔标题',
            icon:'',
            more:1, //是否可以多个
            typename:'title'
        }], //组件


        // 会员卡片预设样式
        vipCardDefaultOptions:[
            {
                id:1,
                // title: "", //会员卡片 标题
                titleStyle:{
                    color:'#ffffff',
                    initColor:'#fff',
                },
                subStyle:{
                    color:'#EDF2FA',
                    initColor:'#EDF2FA',
                },
                style:{
                    bgType:'color',
                    background: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                    backimg:'',
                    initBackground: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                },
                icon:masterDomain + '/static/images/admin/siteMemberPage/vip_icon01.png',  //标题前的图标
                btnStyle:{
                    styleType:'radius', //radius => 圆角   arrow => 箭头
                    style:{
                        arrColor:'#ff0000', //箭头样式的文字颜色
                        color:'#ffffff',
                        initColor:'#ffffff',
                        background:'#FE3535',
                        initBackground:'#FE3535',
                        borderRadius:'26',
                        
                    }
                }
            },
            {
                id:2,
                // title: "会员", //会员卡片 标题
                titleStyle:{
                    color:'#62340F',
                    initColor:'#62340F',
                },
                subStyle:{
                    color:'#774217',
                    initColor:'#774217',
                },
                icon:masterDomain + '/static/images/admin/siteMemberPage/vip_icon01.png',  //标题前的图标
                style:{
                    bgType:'image',
                    background: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                    backimg: masterDomain + '/static/images/admin/siteMemberPage/defaultImg/vip2_bg.png',
                    initBackground: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                },
                btnStyle:{
                    styleType:'radius', //raduis => 圆角   arrow => 箭头
                    style:{
                        arrColor:'#ff0000', //箭头样式的文字颜色
                        color:'#FFE9C0',
                        initColor:'#FFE9C0',
                        background:'#302E2F',
                        initBackground:'#302E2F',
                        borderRadius:30,
                        
                    }
                },
            },
            {
                id:3,
                // title: "会员", //会员卡片 标题
                titleStyle:{
                    color:'#ffffff',
                    initColor:'#ffffff',
                },
                subStyle:{
                    color:'#EDF2FA',
                    initColor:'#EDF2FA',
                },
                icon:masterDomain + '/static/images/admin/siteMemberPage/vip_icon01.png',  //标题前的图标
                style:{
                    bgType:'image',
                    background: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                    backimg: masterDomain + '/static/images/admin/siteMemberPage/defaultImg/vip3_bg.png',
                    initBackground: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                },
                btnStyle:{
                    styleType:'radius', //raduis => 圆角   arrow => 箭头
                    style:{
                        arrColor:'#ff0000', //箭头样式的文字颜色
                        color:'#070F21',
                        initColor:'#070F21',
                        background:'#E7C2A4',
                        initBackground:'#E7C2A4',
                        borderRadius:30,
                        
                    },
                    
                },
                
            },

        ],

        // 会员卡片设置的样式
        vipCardSetOption:[], 

        currFocus:'business', //当前聚焦 business => 商家版    branch => 分店管理
        // 样式 => 右侧表单
        memberCompDefault:{
            theme:1, //选择的样式
            themeType:'dark', //dark => 深色模式  light => 反白模式
            bgType:'image', //image => 背景图   color => 纯色背景
            style:{
                'bg_color':'#ffffff', //背景色
                'initBg_color':'#ffffff', //背景色
                'bg_image':defaultPath + 'bg_01.png', //背景图
            },
            // 组件内容
                // 左上   商家 /分店管理
            business:{
                icon:masterDomain + '/static/images/admin/siteMemberPage/icon01.png',
                link:businessUrl,
                text:'商家版',
            },
            branch:{
                icon:masterDomain + '/static/images/admin/siteMemberPage/icon01.png',
                link:branchUrl,
                text:'工作台',
            },

             // 右上  设置按钮 => 最多3个
            setBtns:{
                btnType:2, //文本大2   小1 
                btns:[{
                    icon:masterDomain + '/static/images/admin/siteMemberPage/icon02.png',
                    link:'',
                    text:'',
                    edit:0,
                }]
            },

            // 右侧内容
            qiandaoBtn:{
                icon:masterDomain + '/static/images/admin/siteMemberPage/icon03.png',
                link:memberDomain + '/qiandao.html',
                text:'签到',
                style:{
                    color:'#192233',
                    init_color:'#192233', //初始色值
                    opciaty:'100',
                    background:'#ffffff',
                    init_background:'#ffffff'
                }
            },

            
            // 会员卡片
            vipCard:{
                theme:1,
                title:'',
                titleStyle:{
                    // arrColor:'#f00', //箭头样式的文字颜色
                    color:'#ffffff', //标题颜色
                    initColor:'#ffffff'
                },
                subtitle:[{
                    type:1, //会员信息类型  1表示会员有效期  2表示文字
                    text:'会员有效期'
                }],
                subStyle:{
                    color:'#EDF2FA',  //副标题颜色
                    initColor:'#EDF2FA'
                },
                icon:masterDomain + '/static/images/admin/siteMemberPage/vip_icon01.png',  //标题前的图标
                style:{
                    bgType:'color',  //image => 背景图   color => 纯色背景
                    background: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',  //背景色
                    backimg:'', //背景图
                    initBackground: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                },
                btnText:'立即开通',
                btnStyle:{
                    styleType:'radius', //raduis => 圆角   arrow => 箭头
                    style:{
                        arrColor:'#ff0000', //按钮箭头颜色
                        color:'#ffffff', //按钮文字颜色
                        initColor:'#ffffff',
                        background:'#FE3535', //按钮背景
                        initBackground:'#FE3535',
                        borderRadius:'13', //圆角
                        
                    }
                },
                
            },

            vipBtnsGroup:[], //vip卡片按钮组

            // 数字区域
            numberCount:{
                showItems:[1,2,3,4],//展示的选项
                numberStyle:{  //数字样式
                    color:'#FF3419',
                    init_color:'#FF3419',
                },
                titleStyle:{ //标题样式
                    color:'#45474D',
                    init_color:'#45474D',
                },
                style:{  //组件样式
                    'background':'#ffffff',
                    'init_background':'#ffffff', //初始背景色
                    'opacity':'70',
                    'borderColor':'#ffffff',
                    'init_borderColor':'#ffffff',
                    'borderSize':'2',
                },
                splitLine:false, //分隔线
            },

            // 财务信息
            financeCount:{
                showItems:[1,2,3],//展示的选项
                numberStyle:{  //数字样式
                    color:'#F0DEBD',
                    init_color:'#F0DEBD',
                },
                titleStyle:{ //标题样式
                    color:'#ffffff',
                    init_color:'#ffffff',
                },
                style:{  //背景样式
                    'background':'#262738',
                    'init_background':'#262738', //初始背景色
                },
            },

            cardStyle:{
                'borderRadius':24,  //间距设置 => 圆角
                'marginLeft':30,
                'marginTop':20,
                
            }
        },
        memberCompFormData:{
            theme:1, //选择的样式
            themeType:'dark', //dark => 深色模式  light => 反白模式
            bgType:'image', //image => 背景图   color => 纯色背景
            style:{
                'bg_color':'#ffffff', //背景色
                'initBg_color':'#ffffff', //背景色
                'bg_image':defaultPath + 'bg_01.png', //背景图
            },
            // 组件内容
                // 左上   商家 /分店管理
            business:{
                icon:masterDomain + '/static/images/admin/siteMemberPage/icon01.png',
                link:businessUrl,
                text:'商家版',
            },
            branch:{
                icon:masterDomain + '/static/images/admin/siteMemberPage/icon01.png',
                link:branchUrl,
                text:'工作台',
            },

             // 右上  设置按钮 => 最多3个
            setBtns:{
                btnType:2, //文本大2   小1 
                btns:[{
                    icon:masterDomain + '/static/images/admin/siteMemberPage/icon02.png',
                    link:'',
                    text:'',
                    edit:0,
                }]
            },

            // 右侧内容
            qiandaoBtn:{
                icon:masterDomain + '/static/images/admin/siteMemberPage/icon03.png',
                link:memberDomain + '/qiandao.html',
                text:'签到',
                style:{
                    color:'#192233',
                    init_color:'#192233', //初始色值
                    opciaty:'100',
                    background:'#ffffff',
                    init_background:'#ffffff'
                }
            },

            
            // 会员卡片
            vipCard:{
                theme:1,
                title:'',
                titleStyle:{
                    // arrColor:'#f00', //箭头样式的文字颜色
                    color:'#ffffff', //标题颜色
                    initColor:'#ffffff'
                },
                subtitle:[{
                    type:1, //会员信息类型  1表示会员有效期  2表示文字
                    text:'会员有效期'
                }],
                subStyle:{
                    color:'#EDF2FA',  //副标题颜色
                    initColor:'#EDF2FA'
                },
                icon:masterDomain + '/static/images/admin/siteMemberPage/vip_icon01.png',  //标题前的图标
                style:{
                    bgType:'color',  //image => 背景图   color => 纯色背景
                    background: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',  //背景色
                    backimg:'', //背景图
                    initBackground: 'linear-gradient(90deg, #33364D 0%, #3A3D57 100%)',
                },
                btnText:'立即开通',
                btnStyle:{
                    styleType:'radius', //raduis => 圆角   arrow => 箭头
                    style:{
                        arrColor:'#ff0000', //按钮箭头颜色
                        color:'#ffffff', //按钮文字颜色
                        initColor:'#ffffff',
                        background:'#FE3535', //按钮背景
                        initBackground:'#FE3535',
                        borderRadius:'13', //圆角
                        
                    }
                },
                
            },

            vipBtnsGroup:[], //vip卡片按钮组

            // 数字区域
            numberCount:{
                showItems:[1,2,3,4],//展示的选项
                numberStyle:{  //数字样式
                    color:'#FF3419',
                    init_color:'#FF3419',
                },
                titleStyle:{ //标题样式
                    color:'#45474D',
                    init_color:'#45474D',
                },
                style:{  //组件样式
                    'background':'#ffffff',
                    'init_background':'#ffffff', //初始背景色
                    'opacity':'70',
                    'borderColor':'#ffffff',
                    'init_borderColor':'#ffffff',
                    'borderSize':'2',
                },
                splitLine:false, //分隔线
            },

            // 财务信息
            financeCount:{
                showItems:[1,2,3],//展示的选项
                numberStyle:{  //数字样式
                    color:'#F0DEBD',
                    init_color:'#F0DEBD',
                },
                titleStyle:{ //标题样式
                    color:'#ffffff',
                    init_color:'#ffffff',
                },
                style:{  //背景样式
                    'background':'#262738',
                    'init_background':'#262738', //初始背景色
                },
            },

            cardStyle:{
                'borderRadius':24,  //间距设置 => 圆角
                'marginLeft':30,
                'marginTop':20,
                
            }
        },
        offsetLeft:2, //会员样式tab定位

        showTypeOpt:['文字', '按钮' ,'不显示'],
        showTypeOpt1:['默认', '划线加重' ,'图标'],
        showTypeOpt2:['默认', '不显示' ,'自定义'],
        // 订单设置 => 右侧表单
        orderFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            popid:'', //被挤出去的按钮
            title:{
                text:'我的订单',
                show:false,  // 1是显示 0是不显示   
                style:{
                    color:'#070F21',
                    initColor:'#070F21',
                }
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                showType:0, //0 => 文字  1 = > 按钮  2是不显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
            btnStyle:{
                color:'#45474C',
                initColor:'#45474C'
            }, //角标颜色

            tipNumStyle:{
                background:'#FF3419',
                initBackground:'#FF3419',
            }, //角标颜色

            showItems:[1,2,3,4,5],  //选择显示的按钮
            showNumItems:[1,2,3], //显示角标的按钮
            orderOption:[
                {id:1,text:'待付款',icon:defaultPath + 'order_01.png?v=1',link:memberDomain + '/order.html?state=1',btnText:'待付款',code:'daifukuan'},
                {id:2,text:'待使用',icon:defaultPath + 'order_02.png?v=1',link:memberDomain + '/order.html?state=2',btnText:'待使用',code:'daixiaofei'},
                {id:3,text:'待发货',icon:defaultPath + 'order_03.png?v=1',link:memberDomain + '/order.html?state=3',btnText:'待发货',code:'daifahuo'},
                {id:4,text:'待收货',icon:defaultPath + 'order_04.png?v=1',link:memberDomain + '/order.html?state=4',btnText:'待收货',code:'daishouhuo'},
                {id:5,text:'待评价',icon:defaultPath + 'order_05.png?v=1',link:memberDomain + '/order.html?state=5',btnText:'待评价',code:'daipingjia'},
                {id:6,text:'待分享',icon:defaultPath + 'order_06.png?v=1',link:memberDomain + '/order-shop.html?state=6,4',btnText:'待分享',code:'daifenxiang'},
                {id:7,text:'退款售后',icon:defaultPath + 'order_07.png?v=1',link:memberDomain + '/order.html?state=7',btnText:'退款售后',code:'tuikuanshouhou'},
                {id:8,text:'全部',icon:defaultPath + 'order_08.png?v=1',link:memberDomain + '/order.html',btnText:'全部',code:'all'},
            ], //订单选项, //选择的按钮
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
            }
        },

        // 默认样式
        orderDefault:{
            sid:1, //验证多个中的索引
            popid:'', //被挤出去的按钮
            title:{
                text:'我的订单',
                show:false,  // 1是显示 0是不显示   
                style:{
                    color:'#070F21',
                    initColor:'#070F21',
                }
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                showType:0, //0 => 文字  1 = > 按钮  2是不显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
            btnStyle:{
                color:'#45474C',
                initColor:'#45474C'
            }, //角标颜色

            tipNumStyle:{
                background:'#FF3419',
                initBackground:'#FF3419',
            }, //角标颜色

            showItems:[1,2,3,4,5],  //选择显示的按钮
            orderOption:[
                {id:1,text:'待付款',icon:defaultPath + 'order_01.png?v=1',link:memberDomain + '/order.html?state=1',btnText:'待付款',code:'daifukuan'},
                {id:2,text:'待使用',icon:defaultPath + 'order_02.png?v=1',link:memberDomain + '/order.html?state=2',btnText:'待使用',code:'daixiaofei'},
                {id:3,text:'待发货',icon:defaultPath + 'order_03.png?v=1',link:memberDomain + '/order.html?state=3',btnText:'待发货',code:'daifahuo'},
                {id:4,text:'待收货',icon:defaultPath + 'order_04.png?v=1',link:memberDomain + '/order.html?state=4',btnText:'待收货',code:'daishouhuo'},
                {id:5,text:'待评价',icon:defaultPath + 'order_05.png?v=1',link:memberDomain + '/order.html?state=5',btnText:'待评价',code:'daipingjia'},
                {id:6,text:'待分享',icon:defaultPath + 'order_06.png?v=1',link:memberDomain + '/order-shop.html?state=6,4',btnText:'待分享',code:'daifenxiang'},
                {id:7,text:'退款售后',icon:defaultPath + 'order_07.png?v=1',link:memberDomain + '/order.html?state=7',btnText:'退款售后',code:'tuikuanshouhou'},
                {id:8,text:'全部',icon:defaultPath + 'order_08.png?v=1',link:memberDomain + '/order.html',btnText:'全部',code:'all'},
            ], //订单选项, //根据showItem决定
            showNumItems:[1,2,3], //显示角标的按钮
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30, 
            }
        },

        // 财务表单
        financeFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            showItems:[1,2,3,4],
            bgType:'color', //color / image
            title:{
                text:'我的钱包',
                show:false,  // 1是显示 0是不显示   
                style:{
                    color:'#070F21',
                    initColor:'#070F21',
                }
            },
            numberStyle:{
                color:'#070F21',
                initColor:'#070F21',
            },
            textStyle:{
                color:'#626874',
                initColor:'#626874',
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                show:true, //是否显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
                bg_color:'#ffffff',
                initBg_color:'#ffffff',
                bg_image:'',
            }
        },
        // 默认样式 => 财务卡片
        financeDefault:{
            sid:1, //验证多个中的索引  重置复用组件需要
            bgType:'color', //color / image
            title:{
                text:'我的钱包',
                show:false,  // 1是显示 0是不显示   
                style:{
                    color:'#070F21',
                    initColor:'#070F21',
                }
            },
            numberStyle:{
                color:'#070F21',
                initColor:'#070F21',
            },
            textStyle:{
                color:'#626874',
                initColor:'#626874',
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                show:true, //是否显示
                link:memberDomain + '/pocket.html', //默认链接
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
            showItems:[1,2,3,4],
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
                bg_color:'#ffffff',
                initBg_color:'#fff',
                bg_image:'',
            }
        },


        // 图标组表单
        iconsFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            qiandao:{
                show:false, //不显示
                icon:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png',
                style:{
                    color:'#FFAA21',
                    background:'#FFF8ED',
                }
            }, //签到
            title:{
                text:'', //标题文字
                show:false,
                style:{
                    color:'#070F21'
                }
            },
            btns:{
                list:[{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                }], //按钮组
                style:{
                    color:'#45474C'
                }
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                show:true, //是否显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
                // bg_color:'#ffffff',
                // initBg_color:'#ffffff',
                // bg_image:'',
            },
            column:5, //单行几个

        },

        // 图标组默认
        iconsDefault:{
            sid:1, //验证多个中的索引  重置复用组件需要
            qiandao:{
                show:false, //不显示
                icon:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png',
                style:{
                    color:'#FFAA21',
                    background:'#FFF8ED',
                }
            }, //签到
            title:{
                text:'', //标题文字
                show:false,
                style:{
                    color:'#070F21'
                }
            },
            btns:{
                list:[{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                },{
                    icon:'',
                    text:'',
                    link:'',
                }], //按钮组
                style:{
                    color:'#45474C'
                },

                
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                show:true, //是否显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
            },
            column:5, //单行几个

        },

        // 列表导航表单
        listFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            iconShow:true, //是否显示图标
            splitLine:false, //分隔线
            qiandao:{
                show:false, //不显示
                icon:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png',
                style:{
                    color:'#FFAA21',
                    background:'#FFF8ED',
                }
            }, //签到
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
                lineHeight:88,
                color:'#212121'
            },
            tipStyle:{
                color:'#AFB4BE',
            },
            list:[{
                text:'',
                icon:'',
                link:'',
                tip:{
                    show:1, //是否线上说明文字
                    text:'',
                }
            }]
        },
        // 列表导航默认
        listDefault:{
            sid:1, //验证多个中的索引  重置复用组件需要
            iconShow:true, //是否显示图标
            splitLine:false, //分隔线
            qiandao:{
                show:false, //不显示
                icon:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png',
                style:{
                    color:'#FFAA21',
                    background:'#FFF8ED',
                }
            }, //签到
            style:{
                borderRadius:24,
                marginTop:22,
                marginLeft:30,
                lineHeight:88,
                color:'#212121'
            },
            tipStyle:{
                color:'#AFB4BE',
            },
            list:[{
                text:'',
                icon:'',
                link:'',
                tip:{
                    show:false, //是否线上说明文字
                    text:'',
                }
            },{
                text:'',
                icon:'',
                link:'',
                tip:{
                    show:false, //是否线上说明文字
                    text:'',
                }
            },{
                text:'',
                icon:'',
                link:'',
                tip:{
                    show:false, //是否线上说明文字
                    text:'',
                }
            }]
        },

        // 公众号表单
        wechatFormData:{
            // sid:1, //验证多个中的索引  重置复用组件需要
            // custom:0, //是否自定义  0 => 否    1 => 是
            // iconShow:1,  //是否显示图标  0 => 否    1 => 是
            // icon:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png',
            // title:'点击关注公众号有礼',
            // titleStyle:{
            //     color:'#070F21'
            // },
            // subtitle:'随时掌握订单动态、优惠活动',
            // subtitleStyle:{
            //     color:'#AFB4BE'
            // },
            // btnStyle:{
            //     color:'#0ECF4E'
            // },
            // style:{
            //     marginLeft:15,
            //     marginTop:11,
            //     borderRadius:12,
            //     height:60,
            // },
            // image:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png', //显示的图片
        },
        // 公众号表单
        wechatDefault:{
            sid:1, //验证多个中的索引  重置复用组件需要
            custom:0, //是否自定义  0 => 否    1 => 是
            iconShow:1,  //是否显示图标  0 => 否    1 => 是
            icon:masterDomain + '/static/images/admin/siteMemberPage/defaultImg/wx_icon01.png',
            title:'点击关注公众号有礼',
            titleStyle:{
                color:'#070F21',
            },
            subtitle:'随时掌握订单动态、优惠活动',
            subtitleStyle:{
                color:'#AFB4BE'
            },
            btnStyle:{
                color:'#0ECF4E'
            },
            style:{
                marginLeft:30,
                marginTop:22,
                borderRadius:24,
                height:120,
            },
            image:'', //显示的图片
        },

        advFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            column:1, //列数 1 - 3
            list:[{
                image:'',
                link:''
            }],
            style:{
                marginTop:22,
                marginLeft:30,
                borderRadius:22,
                height:140,
            }
        },
        advDefault:{
            sid:1, //验证多个中的索引  重置复用组件需要
            column:1, //列数 1 - 3
            list:[{
                image:'',
                link:''
            }],
            style:{
                marginTop:22,
                marginLeft:30,
                borderRadius:24,
                height:140,
            }
        },

        titleFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            layout:0, //0 居左  1,居中
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
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                show:true, //是否显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
        },
        titleDefault:{
            sid:1, //验证多个中的索引  重置复用组件需要
            layout:0, //0 居左  1,居中
            title:{
                text:'',
                type:0, // 0默认 1划线 2 图标
                // icon:masterDomain + '/static/images/admin/siteMemberPage/vip_icon01.png',
                icon: '',
                style:{
                    fontSize:34,
                    color:'#070F21',
                    borderColor:'#FA3725',
                }
            },
            style:{
                marginLeft:30,
                height:110,
            },
            more:{
                text:'查看更多',
                arr:1, //1箭头显示 .0 是箭头不显示
                show:true, //是否显示
                link:'',
                style:{
                    color:'#AFB4BE',
                    initColor:'#AFB4BE',
                }
            },
        },

    
        pageFormData:{
            showType:0, //0 => 会员信息    1 => 固定标题
            layout:0, //0 => 居左  1 => 居中
            title:'个人中心',
            infoData:[], //需要请求接口的数据
            orderData:[], //订单需要请求接口的数据
            style:{
                background:'#fff',
                init_background:'#fff',
                color:'#070F21',
                init_color:'#070F21',
                borderRadius:24,
                marginTop:22,
                marginLeft:30,

            },
            btns:{
                showType:0, // 0 => 默认  1 => 不显示  2 => 自定义
                // themeType:'dark', //是否反白
                list:[{
                    icon:'',
                    link:'',
                }],
                style:{
                    color:'',
                    init_color:'',
                }

            }
        }, //页面整体相关设置
        pageDefault:{
            showType:0, //0 => 会员信息    1 => 固定标题
            layout:0, //0 => 居左  1 => 居中
            title:'个人中心',
            infoData:[], //需要请求接口的数据
            orderData:[], //订单需要请求接口的数据
            style:{
                background:'#fff',
                init_background:'#fff',
                color:'#070F21',
                init_color:'#070F21',
                borderRadius:24,
                marginTop:22,
                marginLeft:30,

            },
            btns:{
                showType:0, // 0 => 默认  1 => 不显示  2 => 自定义
                // themeType:'dark', //是否反白
                list:[{
                    icon:'',
                    link:'',
                }],
                style:{
                    color:'',
                    init_color:'',
                }

            }
        }, //页面整体相关设置

        // 中间内容显示  除了 会员头部 其余内容
        showContainerArr:[],
        submitData:{}, //自定义要提交的数据
        // selfDefine: config ? JSON.parse(config).selfDefine : 0,
        selfDefine:1, //直接进入自定义
        showTooltip:true,
        fadeOut:false, //隐藏
        config:config ? JSON.parse(config) : {}, //已经配置的
    },
    mounted(){
        var localUrl = window.location.href;
        var location = localUrl.replace(masterDomain+'/','');
        var homeUrl = masterDomain+'/'+location.split('/')[0];
        $(".backHome").attr('href',homeUrl);

        
        const that = this;
        let saveData = {}
        if(that.hasSetModel){
            saveData = JSON.parse(JSON.stringify(that.hasSetModel))
        }else{
            saveData = JSON.parse(JSON.stringify(defaultModel))
        }
        // 初始化模板
        that.initModel(saveData); 

        that.initDragSort(); //初始化拖拽组件

        that.initAllData(); //初始化数据

        that.getBottomBtns()
        $(document).click(function(e){
            if($(e.target).closest('.el-slider').length == 0){
                that.showTooltip = false;
                setTimeout(() => {
                    that.showTooltip = true;
                }, 400);
            }
            
        })
    
        // 显示删除按钮在上
        $('.otherSort ').hover(function(){
            $(".midContainer .midConBox").addClass('moreIndex')
        },function(){
            $(".midContainer .midConBox").removeClass('moreIndex')
        })
    
    },

    watch:{
        


        currFocus:function(val){
            this.$refs.carousel.setActiveItem(val)
            optAction = true
        },

        

      
        currEditPart:function(val,old){
            const that = this;
            $('.memberInfoStyle').scrollTop(0)
            if(val){
                that.showTitle = false
            }
        },

        // 订单标题
        'orderFormData.title.show':function(val){
            const that = this;
            if(!val){
                that.orderFormData.more.showType = (that.orderFormData.more.showType == 0 ? 2 : that.orderFormData.more.showType)
            }
        },

        'orderFormData.more.showType':function(val){
            const that = this;
            if(val === 1){
                if(that.orderFormData.showItems.length == 5 ){
                    that.orderFormData.popid = that.orderFormData.showItems[that.orderFormData.showItems.length - 1]
                    that.orderFormData.showItems.pop()
                }
                that.orderFormData.showItems.push(8)

            }else{
                if(that.orderFormData.showItems.indexOf(8) > -1){
                    that.orderFormData.showItems.splice(that.orderFormData.showItems.indexOf(8),1)
                    if(that.orderFormData.popid){
                        that.orderFormData.showItems.push(that.orderFormData.popid)
                        that.orderFormData.popid = ''
                    }
                }
            }
        },


        // 订单样式改变，则数组中对应的样式也改变
        orderFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'order'){
                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }
            },
            deep:true
        },
        // 财务改变，则数组中对应的样式也改变
        financeFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'finance'){

                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }
            },
            deep:true
        },
        //图标改变，则数组中对应的样式也改变
        iconsFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'icons'){
                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }
                // that.$nextTick(() => {
                    // console.log($('.rightCon.show .modstyleBox .column_chose')[0]);
                    // that.checkLeft((that.iconsFormData.column ?  (that.iconsFormData.column- 2) : 2),$('.rightCon.show .modstyleBox .column_chose'))
                // })
            },
            deep:true
        },
        // 列表导航改变，则数组中对应的样式也改变
        listFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'list'){

                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }
            },
            deep:true
        },
        // 列表导航改变，则数组中对应的样式也改变
        wechatFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'wechat'){

                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }
            },
            deep:true
        },
        // 列表导航改变，则数组中对应的样式也改变
        advFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'adv'){

                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }

                that.$nextTick(() => {
                    that.checkLeft(that.advFormData.column - 1,$('.advBox .column_chose'))
                })
            },
            deep:true
        },
        titleFormData:{
            handler:function(val){
                const that = this;
                optAction = true
                if(that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].typename == 'title'){
                    
                    that.showContainerArr[that.currEditInd]['content'] = JSON.parse(JSON.stringify(val))
                }
            },
            deep:true
        },

        // 'pageFormData.style.marginLeft':function(val){
        //     const that = this;
        //     that.changeOverAll('marginLeft',val)
        // },
        // 'pageFormData.style.marginTop':function(val){
        //     const that = this;
        //     that.changeOverAll('marginTop',val)
        // },
        // 'pageFormData.style.borderRadius':function(val){
        //     const that = this;
        //     that.changeOverAll('borderRadius',val)
        // },

        'orderFormData.showItems':function(val){
            const that = this;
        },

        currEditPart(val){
            const that = this;
            that.$nextTick(() => {
                if(val == 7 ){
                    that.checkLeft(that.advFormData.column - 1,$('.advBox .column_chose')) 
                }else if(val === 1){
                    let id = that.memberCompFormData.theme
                    let ind = that.vipCardDefaultOptions.findIndex(item => {
                        return item.id == id
                    })
                    that.checkLeft(ind,$('.vipCardSetBox .column_chose'))
                }
            })

        },
        'memberCompFormData.numberCount.style.background':function(val){
            const that = this;
            if(!val){
                that.memberCompFormData.numberCount.style.opacity = ''
            }
        }
    },
    methods:{
       

        // 初始化数据
        initModel(data){
            const that = this;
            console.log(data);
            let compArrs = JSON.parse(JSON.stringify(data['compArrs']))
            that.memberCompFormData = JSON.parse(JSON.stringify(data['memberComp']))
            that.memberCompDefault = JSON.parse(JSON.stringify(data['memberComp']))
            that.showContainerArr = compArrs
            that.pageFormData = JSON.parse(JSON.stringify(data['pageSet']))
            that.pageDefault= JSON.parse(JSON.stringify(data['pageSet']))
            that.$nextTick(() => {
                // 色彩选择
                if(!pickr2){

                    pickr2 = Pickr.create({
                        el: '#colorPicker2',
                        showAlways: true,
                        default: that.memberCompFormData.vipCard.style.background,
                        comparison: false,
                        components: {
                            hue: true,
                            interaction: {
                                input: true,
                                reset:'重置',
                                upload:'上传图片',
                                upload_name:'vipCardBg',
                            }
                        },
                        onChange(hsva) {
                            // 隐藏颜色弹窗
                            const hex = hsva.toHEX();
                            const rgb = hsva.toRGBA();
                            const color = '#' + hex[0] + hex[1] + hex[2];
                            const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
                            that.memberCompFormData.vipCard.style.background = color;
                            that.memberCompFormData.vipCard.style.bgType = 'color';
                        },
                    });
                }

                if(!pickr1){

                    pickr1 = Pickr.create({
                        el: '#colorPicker1',
                        showAlways: true,
                        default: that.memberCompFormData.style.bg_color,
                        comparison: false,
                        components: {
                            hue: true,
                            interaction: {
                                input: true,
                                reset:'重置',
                            }
                        },
                        onChange(hsva) {
                            // 隐藏颜色弹窗
                            const hex = hsva.toHEX();
                            const rgb = hsva.toRGBA();
                            const color = '#' + hex[0] + hex[1] + hex[2];
                            const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
                            that.memberCompFormData.style.bg_color = color;
                            that.memberCompFormData.bgType = 'color'
    
                        },
                    });
                }

                if(!pickr3){
                    pickr3 = Pickr.create({
                        el: '#colorPicker3',
                        showAlways: true,
                        default: that.financeFormData.style.bg_color,
                        comparison: false,
                        components: {
                            hue: true,
                            interaction: {
                                input: true,
                                reset:'重置',
                                upload:'上传图片',
                                upload_name:'financeBg',
                            }
                        },
                        onChange(hsva) {
                            // 隐藏颜色弹窗
                            const hex = hsva.toHEX();
                            const rgb = hsva.toRGBA();
                            const color = '#' + hex[0] + hex[1] + hex[2];
                            const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
                            that.financeFormData.style.bg_color = color;
                            that.financeFormData.bgType = 'color'
    
                        },
                    });
                }


                // 显示颜色选择器
                $('body').delegate('.pcr-button','click',function(e){
                    var  t = $(this)
                    let type = t.closest('.color_picker').attr('data-type')
                    
                    t.next(".pcr-app.visible").find('.pcr-result').val(color?color:'#316BFF')
                    t.next(".pcr-app.visible").addClass('show');
                    if(type == 2){
                        var color = that.memberCompFormData.vipCard.style.background;
                        pickr2.setColor('#33364D');
                        pickr2.show()

                    }else if(type == 3){
                        var color = that.financeFormData.style.bg_color;
                        pickr3.setColor(color?color:'#316BFF');
                        pickr3.show()
                    }else{
                        var color = that.memberCompFormData.style.bg_color;
                        pickr1.setColor(color?color:'#316BFF');
                        pickr1.show()
                    }
                })

                // 隐藏颜色选择器
                $(document).on('click',function(el){
                    if($(el.target).closest('.pickr').length == 0){
                    $(".pcr-app.visible").removeClass('show');
                    }
                });


                // 上传图片
                $('body').on('change','.fileUp',function(e){
                    var key = $(this).attr('data-type')
                    that.uploadImg(key,e)
                })

                // 色彩选择切重置按钮
                $('body').delegate('.pcr-reset','click',function(){
                    var type = $(this).closest('.color_picker').attr('data-type');
                    if(type === '1'){
                        // 待补充
                        that.memberCompFormData.bgType = 'image'
                        that.memberCompFormData.style.bg_image = defaultPath + 'bg_01.png'; //背景图
                    }else if(type == 2){
                        let id = that.memberCompFormData.vipCard.theme
                        let vipCardDefault = that.vipCardDefaultOptions.find(item => {
                            return item.id === id
                        })

                        if(vipCardDefault.style.bgType == 'image'){
                            that.memberCompFormData.vipCard.style.backimg = vipCardDefault.style.backimg
                        }else{
                            that.memberCompFormData.vipCard.style.background = vipCardDefault.style.background
                        }
                        that.memberCompFormData.vipCard.style.bgType = vipCardDefault.style.bgType;
                    }else if(type == 3){
                        that.financeFormData.style.bg_color = that.financeDefault.style.bg_color;
                        that.financeFormData.bgType = 'color'
                    }
                })

              
            })

            // for(let i = 0; i < compArrs.length; i++){
            //     if(compArrs[i].id == 4 || compArrs[i].id == 5){
                   
            //         if(compArrs[i].content.qiandao.show){
            //             that.qiandaoSet = true;
            //             break;
            //         }
            //     }
            // }
        },
        // 修改全局变量
        changeOverAll(name,val){
            const that = this;
            for(let i = 0; i < that.showContainerArr.length; i++){
                let item = that.showContainerArr[i];
                if(item['content'].style[name] != undefined && item['content'].style[name] != 'undefined'){
                    that.showContainerArr[i]['content'].style[name] = val
                }
            }
            that.memberCompFormData.cardStyle[name] = val
        },


        // 初始化相关数据
        initAllData(){
            const that = this;
            that.pageFormData.btns.list = JSON.parse(JSON.stringify(that.memberCompFormData.setBtns.btns));
            that.pageFormData.btns.themeType = that.memberCompFormData.themeType;

        },

        // 更改状态
        changeBtnType(type){
            const that = this;
            if(that.memberCompFormData.setBtns.btnType && that.memberCompFormData.setBtns.btnType == type){
                that.memberCompFormData.setBtns.btnType = ''
            }else{

                that.memberCompFormData.setBtns.btnType = type;
            }
        
        },

        // 更改图标组单行个数
        choseColumn(num,ind){
            const that = this;
            that.$set(that.iconsFormData,'column',num)
            // console.log(that.iconsFormData['column']);
           
            that.checkLeft(ind,$(event.currentTarget).closest('.column_chose '))
        },

        // 新增按钮
        addMoreBtn(type){
            const that = this;
            if(!type){

                let btnsArr = that.memberCompFormData.setBtns.btns
                if(btnsArr.length >= 3) return false; //最多只能添加3个
                let tip = ''
           
                if(tip){
                    return false;
                }
                that.memberCompFormData.setBtns.btns.push({
                    icon:'',
                    link:'',
                    text:'',
                    edit:0,
                })
            }else if(type == 'vipBtnsGroup'){
                let btnsArr = that.memberCompFormData.vipBtnsGroup
                if(btnsArr.length >= 5) return false; //最多只能添加3个
                let tip = ''
           
                if(tip){
                    return false;
                }
                that.memberCompFormData.vipBtnsGroup.push({
                    icon:'',
                    link:'',
                    text:'',
                })
            }else if(type == 'icons'){
                that.iconsFormData.btns.list.push({
                    icon:'',
                    link:'',
                    text:'',
                })
            }else if(type == 'list'){
                that.listFormData.list.push({
                    icon:'',
                    link:'',
                    text:'',
                    tip:{
                        show:false,
                        text:'', //提示文字
                    }
                })
            }else if(type == 'adv'){
                that.advFormData.list.push({
                    image:'',
                    link:'',
                })
            }else if(type == 'pageBtns'){
                that.pageFormData.btns.list.push({
                    icon:'',
                    link:'',
                })
            }
        },


        // 上传图片
        uploadImg(key,event){
            const that = this;
            const el = $(event.currentTarget),upbtn = el.closest('.upbtn');
            if(el.val()){
                var data = [];
                data['mod'] = 'siteConfig';
                data['type'] = 'atlas';
                data['filetype'] = 'image';
                var btn = el.closest('.upbtn');
                btn.addClass('loading')
                $.ajaxFileUpload({
                    url: '/include/upload.inc.php',
                    fileElementId: key + '_filedata',
                    dataType: "json",
                    data: data,
                    success: function (m, l) {
                        btn.removeClass('loading')
                        that.onUploadSuccess(m,key)
                        $("#" +key + '_filedata' ).val('')
                        if (m.state == "SUCCESS") {
                            upbtn.addClass('hasup')
                        }
                    },
                    error: function () {
                        btn.removeClass('loading')
                    }
                });
                el.val('')
            }
        },
         // 上传图片成功之后的回调
        onUploadSuccess(m,key){
            const that = this;
            let ind;
            if (m.state == "SUCCESS") {
                if(key.indexOf('_') > -1){
                    ind = key.split('_')[1];
                    key = key.split('_')[0];
                }

                console.log(key,ind);

                switch (key){
                    case 'business':  //商家版
                        that.memberCompFormData.business.icon = m.turl
                        break;
                    case 'branch': //分店管理
                        that.memberCompFormData.branch.icon = m.turl
                        break;
                    case 'rbtn': //右上侧按钮
                        that.memberCompFormData.setBtns.btns[ind].icon = m.turl
                        break;
                    case 'btns': //按钮组
                        that.memberCompFormData.vipBtnsGroup[ind].icon = m.turl
                        break;
                    case 'vipIcon': //右侧按钮
                        that.memberCompFormData.vipCard.icon = m.turl;
                        break;
                    case 'vipCardBg': //会员卡片
                        that.memberCompFormData.vipCard.style.backimg = m.turl;
                        that.memberCompFormData.vipCard.style.bgType = 'image';
                        break;
                    case 'memberBg': //会员组件背景图
                        that.memberCardBgChosed = ''
                        that.memberBg = m.turl;
                        break;
                    case 'qiandao': //右侧按钮图标

                        if(ind !== ''){
                            that[ind].qiandao.icon = m.turl
                        }else {
                            that.memberCompFormData.qiandaoBtn.icon = m.turl
                        }

                        break;
                    case 'financeBg': //右侧按钮图标
                        that.financeFormData.style.bg_image = m.turl
                        that.financeFormData.bgType = 'image'
                        break;
                    case 'iconsBtn': //右侧按钮图标
                        that.iconsFormData.btns.list[ind].icon = m.turl
                        break;
                    case 'list': //右侧按钮图标
                        that.listFormData.list[ind].icon = m.turl
                        break;
                    case 'wechatFormData': //右侧按钮图标
                        that.wechatFormData[ind]= m.turl
                        break;
                    case 'adv': //右侧按钮图标
                        that.advFormData.list[ind]['image']= m.turl
                        break;
                    case 'titleFormData': //右侧按钮图标
                        that.titleFormData.title.icon = m.turl
                        break;
                    case 'page': //右侧按钮图标
                        that.pageFormData.btns.list[ind].icon = m.turl
                        break;
                    case 'order': //右侧按钮图标
                        // that.orderFormData.orderOption[ind].icon = m.turl//
                        const id = that.orderFormData.showItems[ind];
                        let index = that.orderFormData.orderOption.findIndex(item => {
                            return id == item.id;
                        })
                        that.orderFormData.orderOption[index].icon = m.turl
                        break;
                }
            }
        },


        // 背景色和透明度转换
        checkBgColor(bgColor,opc){
            const that = this;
            opc = opc || opc === '0' ? opc : 100;
            let opacity = (opc / 100).toFixed(2);
            const alphaHexMap = { '1.00':'FF', '0.99':'FC', '0.98':'FA', '0.97':'F7', '0.96':'F5', '0.95':'F2', '0.94':'F0', '0.93':'ED', '0.92':'EB', '0.91':'E8', '0.90':'E6', '0.89':'E3', '0.88':'E0', '0.87':'DE', '0.86':'DB', '0.85':'D9', '0.84':'D6', '0.83':'D4', '0.82':'D1', '0.81':'CF', '0.80':'CC', '0.79':'C9', '0.78':'C7', '0.77':'C4', '0.76':'C2', '0.75':'BF', '0.74':'BD', '0.73':'BA', '0.72':'B8', '0.71':'B5', '0.70':'B3', '0.69':'B0', '0.68':'AD', '0.67':'AB', '0.66':'A8', '0.65':'A6', '0.64':'A3', '0.63':'A1', '0.62':'9E', '0.61':'9C', '0.60':'99', '0.59':'96', '0.58':'94', '0.57':'91', '0.56':'8F', '0.55':'8C', '0.54':'8A', '0.53':'87', '0.52':'85', '0.51':'82', '0.50':'80', '0.49':'7D', '0.48':'7A', '0.47':'78', '0.46':'75', '0.45':'73', '0.44':'70', '0.43':'6E', '0.42':'6B', '0.41':'69', '0.40':'66', '0.39':'63', '0.38':'61', '0.37':'5E', '0.36':'5C', '0.35':'59', '0.34':'57', '0.33':'54', '0.32':'52', '0.31':'4F', '0.30':'4D', '0.29':'4A', '0.28':'47', '0.27':'45', '0.26':'42', '0.25':'40', '0.24':'3D', '0.23':'3B', '0.22':'38', '0.21':'36', '0.20':'33', '0.19':'30', '0.18':'2E', '0.17':'2B', '0.16':'29', '0.15':'26', '0.14':'24', '0.13':'21', '0.12':'1F', '0.11':'1C', '0.10':'1A', '0.09':'17', '0.08':'14', '0.07':'12', '0.06':'0F', '0.05':'0D', '0.04':'0A', '0.03':'08', '0.02':'05', '0.01':'03', '0.00':'00', }
            
            let color =  bgColor + alphaHexMap[opacity]; //转换之后的色值
            return color
        },

        // 重置颜色
        resetColor(type,name){
            const that = this;
            if(name == 'qiandaoBtn'){
                that.memberCompFormData.qiandaoBtn.style[type] = that.memberCompFormData.qiandaoBtn.style['init_' + type];
            }else if(name == 'numberCount'){
                that.memberCompFormData.numberCount.style[type] = that.memberCompFormData.numberCount.style['init_' + type];
            }else if(name == 'titleStyle'){
                that.memberCompFormData.numberCount.titleStyle[type] = that.memberCompFormData.numberCount['titleStyle']['init_' + type];
            }else if(name == 'numberStyle'){
                that.memberCompFormData.numberCount.numberStyle[type] = that.memberCompFormData.numberCount['numberStyle']['init_' + type];

           
            }else if(name == 'finance_number'){
                that.memberCompFormData.financeCount.numberStyle[type] = that.memberCompFormData.financeCount['numberStyle']['init_' + type];

            }else if(name == 'finance_title'){
                that.memberCompFormData.financeCount.titleStyle[type] = that.memberCompFormData.financeCount['titleStyle']['init_' + type];

            }else if(name == 'finance_bg'){
                that.memberCompFormData.financeCount.style[type] = that.memberCompFormData.financeCount.style['init_' + type];

            }else if(name == 'orderFormData'){
                if(type != 'tipNumStyle' && type != 'btnStyle'){
                    that.orderFormData[type].style.color = that.orderFormData[type].style.initColor;
                }else{
                    that.orderFormData[type][type != 'btnStyle' ? 'background' : 'color'] = that.orderFormData[type][type != 'btnStyle' ? 'initBackground' : 'initColor']
                }

            }else if(name == 'financeData'){
                if(type != 'numberStyle' && type != 'textStyle'){
                    that.orderFormData[type].style.color = that.orderFormData[type].style.initColor;
                }else{
                    that.orderFormData[type].color = that.orderFormData[type].initColor
                }

            }else if(name == 'iconsFormData'){
                // that.iconsFormData[type].style.color = that.iconsDefault[type].style.color;
                if(type != 'qiandao_bg'){
                    that.iconsFormData[type].style.color = that.iconsDefault[type].style.color;
                }else{
                    that.iconsFormData[type].style.background = that.iconsDefault[type].style.background;

                }
            }else if(name == 'wechatFormData'){
                that.wechatFormData[type].color = that.wechatDefault[type].color;
            }else if(name == 'titleFormData'){
                if(type == 'border'){
                    that.titleFormData.title.style.borderColor =  that.titleDefault.title.style.borderColor;
                }else {
                    that.titleFormData[type].style.color = that.titleDefault[type].style.color;
                }
            }else if(name == 'pageFormData'){
                if(type == 'btnsColor'){
                    that.pageFormData.btns.style.color = that.pageFormData.btns.style.init_color
                }else{
                    that.pageFormData.style[type] = that.pageFormData.style['init_' + type]
                }
            }else if(name == 'listFormData'){
                if(type == 'title'){
                    that.listFormData.style.color = that.listDefault.style.color
                }else if(type == 'tipStyle'){
                    that.listFormData.tipStyle.color = that.listDefault.tipStyle.color
                }
            }
        },

        // 处理样式
        getStyle(box,type,content){  //box ，type => 区分样式  content => 样式数据
            const that = this;
            let styleStrArr = [];
            if(box == 'memberInfoBox'){
                // 背景色
                if(content.bgType != 'image'){
                    styleStrArr.push('background:' +content.style.bg_color)
                }else{
                    styleStrArr.push('background-image:url(' +content.style.bg_image+')')
                }
            }else
            // 数字区域
            if(box == 'numberCountBox'){ //边距 ，背景色 ，边框
                // 边距
                styleStrArr.push('margin:' + (content.cardStyle.marginTop/2) + 'px ' + (content.cardStyle.marginLeft/2) + 'px 0') 

                // 背景色
                styleStrArr.push('background:' +(content.numberCount.style.background ?  that.checkBgColor(content.numberCount.style.background,content.numberCount.style.opacity) : 'transparent')) 

                // 边框
                styleStrArr.push('border-style:solid');
                styleStrArr.push('border-color:' + (content.numberCount.style.borderColor ? content.numberCount.style.borderColor  : 'transparent' ))
                styleStrArr.push('border-width:' + (content.numberCount.style.borderSize/2) + 'px')
                // 圆角
                styleStrArr.push('border-radius:' + (content.cardStyle.borderRadius/2) + 'px')
            }else if(box == 'numberStyle'){
                styleStrArr.push('color:' + content.numberCount.numberStyle.color)
            }else if(box == 'titleStyle'){
                styleStrArr.push('color:' + content.numberCount.titleStyle.color);

                // 会员卡片
            }else if(box == 'vipCardBox'){
                if(content.vipCard.theme === 3){
                    if(type == 'inner'){
                        // 背景色
                        if(content.vipCard.style.bgType != 'image'){
                            styleStrArr.push('background:' + (content.vipCard.style.background ? content.vipCard.style.background : content.vipCard.style.initBackground))
                        }else{
                            styleStrArr.push('background-image:url(' +content.vipCard.style.backimg+')')
                        }
                        // 圆角
                        styleStrArr.push('border-radius:' + (content.cardStyle.borderRadius/2) + 'px')
                    }else{
                        // styleStrArr.push('margin:' + content.cardStyle.marginTop + 'px ' + content.cardStyle.marginLeft + 'px 0')
                        styleStrArr.push('border-radius:' + (content.cardStyle.borderRadius/2) + 'px')
                        styleStrArr.push('background:' + content.financeCount.style.background)
                    }
                }else{

                    // 边距
                    // styleStrArr.push('margin:' + content.cardStyle.marginTop + 'px ' + content.cardStyle.marginLeft + 'px 0') 
                    // 背景色
                    if(content.vipCard.style.bgType != 'image'){
                        styleStrArr.push('background:' + (content.vipCard.style.background ? content.vipCard.style.background : content.vipCard.style.initBackground))
                    }else{
                        styleStrArr.push('background-image:url(' +content.vipCard.style.backimg+')')
                    }
                    // 圆角
                    styleStrArr.push('border-radius:' + (content.cardStyle.borderRadius/2) + 'px')
                }

                if(type == 'margin'){
                    styleStrArr = ['margin:' + (content.cardStyle.marginTop / 2) + 'px ' + (content.cardStyle.marginLeft / 2) + 'px 0']
                }
                if(type == 'radius'){
                    styleStrArr = ['border-radius:' + (content.cardStyle.borderRadius/2) + 'px']
                }

            }else if(box == 'finance_number'){
                styleStrArr.push('color:' +content.financeCount.numberStyle.color)
            }else if(box == 'financeInfo'){
                styleStrArr.push('color:' +content.financeCount.titleStyle.color)
                styleStrArr.push('width:'+(100 / (content.financeCount.showItems.length > 1 ? content.financeCount.showItems.length : 2) )+'%;')
            }else if(box == 'vipCardBtn'){
                if(content.vipCard.btnStyle.styleType == 'radius'){
                    // 背景色
                    styleStrArr.push('background:' +content.vipCard.btnStyle.style.background)
                    styleStrArr.push('color:' +content.vipCard.btnStyle.style.color)
                    // 圆角
                    styleStrArr.push('border-radius:' + (content.vipCard.btnStyle.style.borderRadius /2)+ 'px');
                }else{
                    styleStrArr.push('color:' +content.vipCard.btnStyle.style.background)
                }
            }else if(box === 'vipCardBtnArr'){ //箭头样式
                if(content.vipCard.btnStyle.styleType == 'radius'){

                    styleStrArr.push('filter: drop-shadow(18px 0 0 '+content.vipCard.btnStyle.style.color+') ')
                }else{
                    styleStrArr.push('filter: drop-shadow(18px 0 0 '+content.vipCard.btnStyle.style.background+') ')

                }
            }else if(box == 'orderInfoBox' || box == 'financeInfoBox' || box == 'iconsInfoBox'){
                if(type == 'tipNum'){
                    styleStrArr.push('background:'+  content.tipNumStyle.background )
                }else if(type == 'btnStyle'){
                    styleStrArr.push('color:'+  content.btnStyle.color )
                }else if(!type){
                    styleStrArr.push('margin: '+ (content.style.marginTop/2) +'px '+ (content.style.marginLeft/2) +'px 0 '); //边距
                    styleStrArr.push('border-radius:'+  (content.style.borderRadius / 2) +'px')
                    if(box == 'financeInfoBox'){
                        if(content.bgType == 'color'){
                            styleStrArr.push('background-color:'+  content.style.bg_color )
                            
                        }else{
                            
                            styleStrArr.push('background:url('+  content.style.bg_image +') no-repeat center/cover')
                        }

                    }
                }else{
                    styleStrArr.push('color:'+  content[type].style.color)
                }
            }else if(box === 'listInfoBox'){
                if(!type){
                    styleStrArr.push('margin: '+ (content.style.marginTop/2) +'px '+ (content.style.marginLeft/2) +'px 0 '); //边距
                    styleStrArr.push('border-radius:'+  (content.style.borderRadius/2) +'px')
                }
            }else if(box == 'wechatInfo'){
                if(!type){
                    styleStrArr.push('margin: '+ (content.style.marginTop/2) +'px '+ (content.style.marginLeft/2) +'px 0 '); //边距
                    styleStrArr.push('border-radius:'+  (content.style.borderRadius / 2) +'px');
                    if(content.custom){
                        styleStrArr.push('height:'+  (content.style.height /2) +'px');
                    }
                }else{
                    styleStrArr.push('color:'+ content[type].color )
                }
            }else if(box === 'advInfo'){
                if(!type){
                    styleStrArr.push('margin: '+ (content.style.marginTop / 2) +'px '+ (content.style.marginLeft / 2) +'px 0 '); //边距
                    styleStrArr.push('border-radius:'+  (content.style.borderRadius / 2) +'px')
                    styleStrArr.push('overflow:hidden')
                }else if(type == 'height'){
                    // styleStrArr.push('border-radius:'+  (content.style.borderRadius / 2) +'px')
                    styleStrArr.push('height:'+  (content.style.height/2) +'px')
                }else if(type == 'grid'){
                    styleStrArr.push('grid-template-columns: repeat('+content.column+',1fr)')

                }
            }else if(box == 'titleInfo'){
                if(!type){
                    styleStrArr.push('margin: 0 '+ (content.style.marginLeft /2 ) +'px'); //边距
                    styleStrArr.push('height:'+ (content.style.height /2 ) +'px '); //边距
                }
            }else if(box == 'pageTop'){
                styleStrArr.push('margin:0 '+ (content.style.marginLeft / 2) +'px '); //边距
            }else if(box == 'pageBtn'){
                if(content.btns.style.color && content.btns.style.color != 'transparent' && content.btns.showType === 0){
                    styleStrArr.push('transform: translateX(-100%); filter: drop-shadow(22px 0 0 '+ content.btns.style.color +')');
                }
                // console.log(content.btns.style.color,styleStrArr);
            }
            
            return styleStrArr.join(';')
        },


        // 验证是否选过vip过期时间
        checkHasChose(){
            const that = this;
            let hasChose = false;
            let arr = that.memberCompFormData.vipCard.subtitle;
            for(let i = 0 ; i < arr.length; i++){
                if(arr[i].type === 1){
                    // console.log(arr[i].type);
                    hasChose = true;
                    break
                }
            }
            return hasChose
        },

        // 追加副标题 => 滚动标题
        addSubtitle(type){
            const that = this;
            if(type === 1){

                that.memberCompFormData.vipCard.subtitle.unshift({
                    type:type,
                    text:type === 1 ? '会员有效期' : '',
                })
            }else{

                that.memberCompFormData.vipCard.subtitle.push({
                    type:type,
                    text:type === 1 ? '会员有效期' : '',
                })
            }
        },

        addVipSub(){
            const that = this;
            if(that.checkHasChose()){
                that.addSubtitle(2)
            }
        },

        // 删除副标题
        delVipObj(ind){
            const that = this;
            that.memberCompFormData.vipCard.subtitle.splice(ind,1)
        },

        // hex转rgb
        hex2Rgb(hex)  {
            const str = hex.substring(1);
            let arr;
            if (str.length === 3) arr = str.split('').map(d => parseInt(d.repeat(2), 16));
            else arr = [parseInt(str.slice(0, 2), 16), parseInt(str.slice(2, 4), 16), parseInt(str.slice(4, 6), 16)];
            return `rgb(${arr.join(', ')})`;
        },

        // 改变vip风格样式
        changeVipStyle(id){
            const that = this;
            
            let setInd = -1 , //将要选中的样式是否选中过 
                ind = -1 ,//将要选中的样式的索引
                currSetInd = -1   //是否选中过当前的样式;
            ind = that.vipCardDefaultOptions.findIndex(item => {
                return item.id == id
            })
            currSetInd = that.vipCardSetOption.findIndex(item => {  //查看是否存过
                return item.theme == that.memberCompFormData.vipCard['theme']
            })
            let parObj = $(event.currentTarget).closest('.column_chose')
                that.checkLeft(ind,parObj); //为了选中样式

            if(that.vipCardSetOption.length){
                setInd = that.vipCardSetOption.findIndex(item => {
                    return item.theme == id
                })
            }
            if(setInd > -1){
                if(currSetInd > -1){
                    that.vipCardSetOption.splice(currSetInd,1,JSON.parse(JSON.stringify(that.memberCompFormData.vipCard)))
                }else{
                    that.vipCardSetOption.push(JSON.parse(JSON.stringify(that.memberCompFormData.vipCard))) 
                }  
                that.memberCompFormData.vipCard = that.vipCardSetOption[setInd];
                
            }else{
                if(currSetInd > -1){
                    that.vipCardSetOption.splice(currSetInd,1,JSON.parse(JSON.stringify(that.memberCompFormData.vipCard)))
                }else{
                    that.vipCardSetOption.push(JSON.parse(JSON.stringify(that.memberCompFormData.vipCard))) 
                }     
                
                that.memberCompFormData.vipCard['theme'] = that.vipCardDefaultOptions[ind].id ;
                for(let item in that.vipCardDefaultOptions[ind]){
                    if(item != 'id' && item != 'btnGroups'){
                        that.memberCompFormData.vipCard[item] = JSON.parse(JSON.stringify(that.vipCardDefaultOptions[ind][item]))
                    }
                }
                
            }



            // ind = that.vipCardDefaultOptions.findIndex(item => {
            //     return item.id == id
            // })
            // that.memberCompFormData.vipCard['theme'] = that.vipCardDefaultOptions[ind].id ;
            // for(let item in that.vipCardDefaultOptions[ind]){
            //     if(item != 'id' && item != 'btnGroups'){
            //         that.memberCompFormData.vipCard[item] = JSON.parse(JSON.stringify(that.vipCardDefaultOptions[ind][item]))
            //     }
            // }


        },

        checkLeft(ind,parObj){
            const that = this;
            if(parObj && parObj.length){
                let left = parObj.find('span').eq(ind).position().left
                that.offsetLeft = left + 2
                // console.log(parObj.find('span').eq(ind)[0]);
            }
        },

        // 初始化排序
        initDragSort(){
            const  that = this;
            var el = $('.sortBox')
            let sortable = Sortable.create(el[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.item',
                // handle:'.left_icon',
                filter:'.inpbox input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    that.memberCompFormData.setBtns.btns = []; //解决视图回弹
                    let arr = this.toArray()
                    let arrNew = arr.map(item => {
                        return JSON.parse(item)
                    })
                    let arr1 = arrNew.map(item => {
                        return item.text
                    })
                    that.$nextTick(() => {
                        that.memberCompFormData.setBtns.btns = arrNew;
                    })
                }
            })

            var el1 = $('.sortBox1')
            let sortable1 = Sortable.create(el1[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.item',
                // handle:'.left_icon',
                filter:'.inpbox input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    // TODO
                    that.memberCompFormData.vipBtnsGroup = []; //解决视图回弹
                    let arr = this.toArray()
                    let arrNew = arr.map(item => {
                        return JSON.parse(item)
                    })
                    console.log(arr);
                    that.$nextTick(() => {
                        that.memberCompFormData.vipBtnsGroup = arrNew;
                    })
                }
            })
            let sortable2 = Sortable.create($('.otherSort.otherBox')[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.partBox',
                onEnd: function(evt){
                    // // TODO
                    // console.log(that.currEditPart,that.currEditInd);
                    // console.log(evt);
                    that.showContainerArr = []; //解决视图回弹
                    let arr = this.toArray()
                    let arrNew = arr.map(item => {
                        return JSON.parse(item)
                    })
                    that.$nextTick(() => {
                        that.showContainerArr = arrNew;
                        if(that.currEditPart !== 1){
                            that.$nextTick(() => {
                                let ind = that.currEditInd;
                                if(evt.newIndex < evt.oldIndex){
                                    if(evt.newIndex <= ind && evt.oldIndex  > ind){
                                        ind = ind + 1
                                    }else if(evt.oldIndex == ind){
                                        ind = evt.newIndex
                                    }
                                }else{
                                    if(evt.newIndex >= ind && evt.oldIndex < ind){
                                        ind = ind - 1
                                        ind = ind > -1 ? ind : 0;
                                    }else if(evt.oldIndex == ind){
                                        ind = evt.newIndex
                                    }
                                }
                                that.currEditInd = ind
                            })
                            
                            
                        }
                    })
                }
            })
            let orderSort = Sortable.create($('.orderSort')[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.item',
                // handle:'.left_icon',
                filter:'.inpbox input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    // TODO
                    that.orderFormData.showItems = []; //解决视图回弹
                    let arr = this.toArray();
                    arr = arr.map(item => {
                        return Number(item)
                    })
                    that.$nextTick(() => {
                        that.orderFormData.showItems = arr;
                    })
                }
            })
            let  btnsSort = Sortable.create($('.btnsSort')[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.item',
                // handle:'.left_icon',
                filter:'.inpbox input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    // TODO
                    that.iconsFormData.btns.list = []; //解决视图回弹
                    let arr = this.toArray()
                    let arrNew = arr.map(item => {
                        return JSON.parse(item)
                    })
                    console.log(arr);
                    that.$nextTick(() => {
                        that.iconsFormData.btns.list = arrNew;
                    })
                }
            })
            let  listSort = Sortable.create($('.listSort')[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.item',
                // handle:'.left_icon',
                filter:'.inpbox input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    // TODO
                    that.listFormData.list = []; //解决视图回弹
                    let arr = this.toArray()
                    let arrNew = arr.map(item => {
                        return JSON.parse(item)
                    })
                    console.log(arr);
                    that.$nextTick(() => {
                        that.listFormData.list = arrNew;
                    })
                }
            })
            let  advSort = Sortable.create($('.cipianSort')[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.item',
                // handle:'.left_icon',
                filter:'.inpbox input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    // TODO
                    that.advFormData.list = []; //解决视图回弹
                    let arr = this.toArray()
                    let arrNew = arr.map(item => {
                        return JSON.parse(item)
                    })
                    console.log(arr);
                    that.$nextTick(() => {
                        that.advFormData.list = arrNew;
                    })
                }
            })
        },

        // 删除按钮
        delBtns(btnType,ind){
            const that = this;
            if(btnType == 'setBtns'){  //右上的设置按钮
                that.memberCompFormData.setBtns.btns.splice(ind,1)
            }else if(btnType == 'vipBtnsGroup'){  //vipcard按钮组
                that.memberCompFormData.vipBtnsGroup.splice(ind,1)
            }else if(btnType == 'orderFormData'){
                that.orderFormData.showItems.splice(that.orderFormData.showItems.indexOf(ind),1)
            }
        },

        // 确定选择背景
        sureChoseMemberBg(){
            const that = this;
            let pic = ''
            if(that.memberCardBgChosed === ''){ //手动上传的背景图
                pic = that.memberBg
            }else{
                pic = that.defaultPath + 'bg_' + (that.memberCardBgChosed > 9 ? that.memberCardBgChosed : ('0' + that.memberCardBgChosed)) + '.png'
            }

            that.memberCompFormData.style.bg_image = pic; //赋值
            that.memberCompFormData.bgType = 'image'; //赋值
            that.showMemberCardPop = false; //隐藏弹窗
        },

        // 验证是否是颜色色值
        changeColor(style,btn){
            const that = this;

            // 步骤1  验证输入的 是否合法
            let el = event.currentTarget;
            $(el).val($(el).val().replace(/[^0-9a-fA-F]/g,""));
            $(el).val($(el).val().toUpperCase());
            let color = $(el).val()
            switch(color.length){
                case 1:
                color = color + '00000';
                break;
                case 2:
                color = color + '0000';
                break;
                case 3:
                color = color + '000';
                break;
                case 4:
                color = color + '00';
                break;
                case 5:
                color = color + '0';
                break;
                
            }
            $(el).val(color);



            // 步骤2  赋值

            switch(btn){
                case 'qiandaoBtn':
                    that.memberCompFormData.qiandaoBtn.style[style] = '#' + color;
                    break;
                case 'numberStyle':
                    that.memberCompFormData.numberCount.numberStyle[style] = '#' + color;
                    break;
                case 'titleStyle':
                    that.memberCompFormData.numberCount.titleStyle[style] = '#' + color;
                    break;
                case 'numberCount':
                    that.memberCompFormData.numberCount.style[style] = '#' + color;
                    break;
                case 'viptitleStyle':
                    that.memberCompFormData.vipCard.titleStyle[style] = '#' + color;
                    break;
                case 'vipsubStyle':
                    that.memberCompFormData.vipCard.subStyle[style] = '#' + color;
                    break;
                case 'vipbtnStyle':
                    that.memberCompFormData.vipCard.btnStyle.style[style] = '#' + color;
                    break;
                case 'finance_title':
                    that.memberCompFormData.financeCount.titleStyle[style] = '#' + color;
                    break;
                case 'finance_bg':
                    that.memberCompFormData.financeCount.style[style] = '#' + color;
                    break;
                case 'orderFormData':
                    if(style !== 'tipNumStyle' && style !== 'btnStyle'){
                        that.orderFormData[style].style.color = '#' + color;
                    }else if(style == 'btnStyle'){
                        that.orderFormData[style].color = '#' + color;
                    }else{
                        that.orderFormData[style].background = '#' + color;
                    }
                    break;
                case 'financeFormData':
                    if(style !== 'numberStyle' && style !== 'textStyle'){
                        that.orderFormData[style].style.color = '#' + color;
                    }else{
                        that.orderFormData[style].color = '#' + color;
                    }
                    break;
                case 'iconsFormData':
                    if(style != 'qiandao_bg'){

                        that.iconsFormData[style].style.color = '#' + color;
                    }else{
                        that.iconsFormData[style].style.background = '#' + color;

                    }
                    break;
                case 'wechatFormData':
                    that.wechatFormData[style].color = '#' + color;
                    break;
                case 'titleFormData':
                    if(style == 'border'){
                        that.titleFormData.title.style.borderColor =  '#' + color;
                    }else {
                        that.titleFormData[style].style.color = '#' + color;
                    }
                    break;
                case 'pageFormData':
                    if(style == 'btnsColor'){
                        that.pageFormData.btns.style.color = '#' + color;
                    }else{

                        that.pageFormData.style[style] = '#' + color;
                    }
                    break;

            }
        },


        // 获取对应的key和文字
        checkArr(arr,type){
            const that = this;
            let objArr = [];
            switch(type){
                case 'numberCount':
                    objArr = that.numberOption;
                    break;
                case 'financeCount':
                    objArr = that.financeOption;
                    break;
                case 'orderFormData':
                    objArr = that.orderFormData.orderOption;
                    break;

            }

        
            let realChose = [];


            if(type == 'orderFormData'){
                for(let i = 0; i < arr.length; i++ ){
                    let obj = objArr.find(item => {
                        return item.id == arr[i]
                    });
                    realChose.push(obj)
                }
            }else{
                realChose = objArr.filter(item => {
                    return arr.indexOf(item.id) > -1;
                })
            }

            return realChose
        },

        // 验证是否超过最大
        checkMax(max,name,name2){
            const that = this;
            let el = event.currentTarget;
            let val = $(el).val();
            // if(val % 4 <= 2){
            //     val = val - val % 4
            // }else{
            //     val = val - (4 - val % 4)
            // }
            if(val > max){
                if(!name2){
                    that.memberCompFormData.cardStyle[name] = Number(max)
                }else{
                    that[name2].style[name] = Number(max)
                }
            }else{
                if(!name2){
                    that.memberCompFormData.cardStyle[name] = Number(val)
                }else{
                    that[name2].style[name] = Number(val)
                }
            }

        },

        checkAdvHeighr(){
            const that = this
            let el = event.currentTarget;
            let val = $(el).val();
            if(val % 4 <= 2){
                val = val - val % 4
            }else{
                val = val - (4 - val % 4)
            }

            if(val >  300){
                val = 300
            }else if(val < 100){
                val = 100
            }
            that.advFormData.style.height = val
        },
        checktitHeighr(){
            const that = this
            let el = event.currentTarget;
            let val = $(el).val();
            if(val % 2 ){
                val = val - 1
            }

            if(val >  180){
                val = 180
            }else if(val < 80){
                val = 80
            }
            that.titleFormData.style.height = val
        },
        

        // 选择查看更多的显示方式
        choseShowType(ind){
            const that = this;
            if(!that.orderFormData.title.show && ind == 0) return false;
            that.orderFormData.more.showType = ind;
        },


        // 左侧追加内容
        addModule(obj){
            const that = this;
            let el = event.currentTarget;
            // $('.icon_item').removeClass('on_chose')
            // $(el).addClass('on_chose');

            that.showTitle = false;
            that.currEditPart = obj.id;
            let index = that.showContainerArr.findIndex(item => {
                return item.id == obj.id
            })
            if(index > -1 && !obj.more ){
                that.currEditInd = index; //当前正在编辑这个
                that[obj.typename + 'FormData'] = JSON.parse(JSON.stringify(that.showContainerArr[index].content))
                return false;
            }
            if(obj.id === 1) return false;
            let sameArr = that.showContainerArr.filter(item => {
                return item.id == obj.id
            })
            that.showContainerArr.push({
                id:obj.id,
                sid:sameArr.length + 1,
                typename:obj.typename,
                content:that[obj.typename + 'Default']
            })
            that.currEditInd = that.showContainerArr.length - 1;
            that[obj.typename + 'FormData'] = JSON.parse(JSON.stringify(that[obj.typename + 'Default']))
            if(obj.typename == 'icons'){
                that.$nextTick(() => {
                    console.log('====');
                    that.checkLeft(2, $(".iconsContainer .column_chose"))
                })
            }

            that.$nextTick(() => {
                $('.midConBox').scrollTop($('.midConBox .pageCon ').height())
            })
        },

        // 删除组件
        delModBox(ind){
            const that = this;
            let delObj = JSON.parse(JSON.stringify(that.showContainerArr[ind]))
            if(that.currEditPart == delObj.id && that.currEditInd == ind){
                that.currEditPart = 0
            }
            that.showContainerArr.splice(ind,1)
            that.showPop = false;
            that.showTitle = false;
        },

        // 点击中间内容 编辑组件样式
        editCurrPart(item,ind){
            const that = this;
            that.currEditPart = item.id;
            that.currEditInd = ind;
            that.showTitle = false;
            let typename = item.typename
            that[typename + 'FormData'] = JSON.parse(JSON.stringify(item.content))
            if(typename == 'icons'){
                that.$nextTick(() => {
                    if(!item.content.column){
                        let obj = JSON.parse(JSON.stringify(item.content))
                        obj['column'] = 5;
                        that[typename + 'FormData'] = JSON.parse(JSON.stringify(obj))
                    }
                    that.checkLeft((item.content.column ? item.content.column : 5 ) - 3, $(".iconsContainer .column_chose"))
                })
            }else if(typename == 'adv'){
                that.$nextTick(() => {
                    if(!item.content.column){
                        let obj = JSON.parse(JSON.stringify(item.content))
                        obj['column'] = 5;
                        that[typename + 'FormData'] = JSON.parse(JSON.stringify(obj))
                    }
                    that.checkLeft((item.content.column ? item.content.column : 1 ) - 1, $(".cipianBox  .column_chose"))
                })
            }
        },

        // 设置签到组件
        setQiandao(val){
            const that = this;
            that.qiandaoSet = val;
            let compArrs = JSON.parse(JSON.stringify(that.showContainerArr))
            for(let i = 0; i < compArrs.length; i++){
                if(compArrs[i].id == 4 || compArrs[i].id == 5){
                    if(compArrs[i].content.qiandao.show && i != that.currEditInd){
                        compArrs[i].content.qiandao.show = false;
                        that.showContainerArr[i].content.qiandao.show = false;
                        break;
                    }
                }
            }
        },

        // 选择瓷片广告的类型
        choseAdvType(ind){
            const that = this;
            that.advFormData.column = ind ;
            let parObj = $(event.currentTarget).closest('.column_chose')
            that.checkLeft(ind - 1, parObj)
            if(that.advFormData.list.length < ind){
                let dataArr = []
                for(let i = 0; i <  (ind - that.advFormData.list.length); i++){
                    dataArr.push({
                        image:'',
                        link:'',
                    })
                }
                that.advFormData.list = that.advFormData.list.concat(dataArr)
              
            }else{
                let dataArr = that.advFormData.list.filter(item => {
                    return item.image || item.link
                })
                let dataArr2 =  []
                if(dataArr.length < ind){
                    for(let i = 0; i <  (ind - dataArr.length); i++){
                        dataArr2.push({
                            image:'',
                            link:'',
                        })
                    }
                }
                that.advFormData.list = dataArr.concat(dataArr2);
            }
        },

        // 显示全局设置
        showPageSet(){
            const that = this;
            let el = event.currentTarget;
            if($(event.target).hasClass('customCon') || $(event.target).hasClass('midContainer')){
                if(that.currEditPart){
                    that.showTitle = false;
                }
                that.currEditPart = 0;
                
            }
        },


        // 复制组件
        copyPart(){
            const that = this;
            let el = event.currentTarget
            if($(el).hasClass('disabled')) {
                // that.$message.error('此组件只能复制一次' )
                that.$message({
                    message: '此组件只能复制一次',
                    type: 'warning',
                    customClass:'errorMsg',
                    duration:0,
                    showClose:true,
                  });
                return ;
            }
            let obj = that.showContainerArr[that.currEditInd]
            let objCopy = JSON.parse(JSON.stringify(obj))
            if(obj.content && obj.content.qiandao && obj.content.qiandao.show){
                objCopy.content.qiandao.show = false
            }
            that.showContainerArr.splice(that.currEditInd,0,JSON.parse(JSON.stringify(objCopy)))
        },

        // 统计前台页面需要请求的数据
        count_infoData(){
            const that = this;
            let infoData = [];
            let orderData = []
            if(that.memberCompFormData.numberCount.showItems.length > 0){
                let dataItems = that.memberCompFormData.numberCount.showItems;
                let dataArr = that.numberOption.filter(item => {
                    return dataItems.indexOf(item.id) > -1;
                })
                let codeArr = dataArr.map(item => {
                    return item.code
                })
                infoData = infoData.concat(codeArr)
            }else if(that.memberCompFormData.financeCount.showItems.length > 0){
                let dataItems = that.memberCompFormData.financeCount.showItems;
                let dataArr = that.financeOption.filter(item => {
                    return dataItems.indexOf(item.id) > -1;
                })
                let codeArr = dataArr.map(item => {
                    return item.code
                })
                infoData = infoData.concat(codeArr)
            }


            for(let i = 0; i < that.showContainerArr.length; i++){
                let obj =  that.showContainerArr[i];
                if([2,3,4,5].indexOf(obj.id) > -1){
                    let con = obj.content;
                    let dataItems,dataArr,codeArr
                    switch (obj.id){
                        case 2:
                            dataItems = con.showNumItems;
                            if(dataItems && dataItems.length){

                                dataArr = that.orderOption.filter(item => {
                                    return dataItems.indexOf(item.id) > -1;
                                })
                                codeArr = dataArr.map(item => {
                                    return item.code
                                })
                                orderData = orderData.concat(codeArr)
                            }
                            break;
                        case 3:
                            dataItems = con.showItems;
                            dataArr = that.financeOption.filter(item => {
                                return dataItems.indexOf(item.id) > -1;
                            })
                            codeArr = dataArr.map(item => {
                                return item.code
                            })
                            infoData = infoData.concat(codeArr)
                            break;
                        case 4:
                        case 5:
                            if(con.qiandao.show){
                                infoData.push('qiandao')
                            }
                            break;
                    }
                }
            }
            infoData = Array.from(new Set(infoData));
            orderData = Array.from(new Set(orderData));
            that.pageFormData.infoData = infoData
            that.pageFormData.orderData = orderData
        },

         // 验证是否输入
         checkAllFormData(){
            const that = this;
            let stop = false;

            // 验证会员头部必填信息
            console.log(that.memberCompFormData);
            // for(let item in that.memberCompFormData){
        
            // }
        },

        // 保存数据
        saveAllData(type){ //type 是表示预览
            const that = this;

            // 统计前台页面需要请求的数据
            that.count_infoData() ;
            that.checkAllFormData()
            that.submitData = {
                memberComp:that.memberCompFormData,
                pageSet:that.pageFormData,
                compArrs:that.showContainerArr,
                selfDefine:that.selfDefine
            }
            console.log(that.showContainerArr);
            let str = type ? '&type=1' : ''
          
            let data = {
                config:JSON.stringify(that.submitData)
            }

            if(!that.selfDefine){
                data = {
                    config:JSON.stringify(defaultModel)
                }
            }

            if(type){
                data = {
                    browse:JSON.stringify(that.submitData)
                }
                that.preveiw = true;
                $(".previewBox p").addClass('blue').html('<s></s>同步中');
                setTimeout(function(){
                    $(".previewBox p").removeClass('blue').html('已同步至最新');
                },400)
            
                $(document).one('click',function(){
                    that.preveiw = false;
                })
            }
            $.ajax({
                url: 'userCenterDiy.php?dopost=save'+str,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        if(type){
                            that.preveiwSet = data.info + '?preview=1&appIndex=1';
                            $(".previewBox p").removeClass('blue').html('已同步至最新');
                        }else{
                            that.$message({
                                message:'页面设置成功',
                                type: 'success'
                            })
                        }
                    }else{
                        if(type){
                            that.preveiwSet = '';
                            $(".previewBox p").removeClass('blue').html('预览失败');
                        }
                    }
                },
                error: function(){}
              });
              event.stopPropagation()
        },

        activeChangeColor(color,type,name){
            const that = this;
            color = that.colorHex(color);

            if(name == 'qiandaoBtn'){
                that.memberCompFormData.qiandaoBtn.style[type] = color;
            }else if(name == 'numberCount'){
                that.memberCompFormData.numberCount.style[type]  = color;
            }else if(name == 'titleStyle'){
                that.memberCompFormData.numberCount.titleStyle[type]  = color;
            }else if(name == 'numberStyle'){
                that.memberCompFormData.numberCount.numberStyle[type]  = color;
            }else if(name == 'viptitleStyle'){
                that.memberCompFormData.vipCard.titleStyle[style] =  color;
           
            }else if(name == 'vipsubStyle'){
                that.memberCompFormData.vipCard.subStyle[style] =  color;
           
            }else if(name == 'vipbtnStyle'){
                that.memberCompFormData.vipCard.btnStyle.style[style] =  color;
           
            }else if(name == 'finance_number'){
                that.memberCompFormData.financeCount.numberStyle[type] = color;

            }else if(name == 'finance_title'){
                that.memberCompFormData.financeCount.titleStyle[type]  = color;

            }else if(name == 'finance_bg'){
                that.memberCompFormData.financeCount.style[type]  = color;

            }else if(name == 'orderFormData'){
                if(type != 'tipNumStyle' && type != 'btnStyle'){
                    that.orderFormData[type].style.color = color;
                }else{
                    that.orderFormData[type][type != 'btnStyle' ? 'background' : 'color'] = color;
                }

            }else if(name == 'financeData'){
                if(type != 'numberStyle' && type != 'textStyle'){
                    that.orderFormData[type].style.color = color;
                }else{
                    that.orderFormData[type].color = color;
                }

            }else if(name == 'iconsFormData'){
                // that.iconsFormData[type].style.color = that.iconsDefault[type].style.color;
                if(type != 'qiandao_bg'){
                    that.iconsFormData[type].style.color = color;
                }else{
                    that.iconsFormData[type].style.background = color;

                }
            }else if(name == 'wechatFormData'){
                that.wechatFormData[type].color = color;
            }else if(name == 'titleFormData'){
                if(type == 'border'){
                    that.titleFormData.title.style.borderColor =  color;
                }else {
                    that.titleFormData[type].style.color = color;
                }
            }else if(name == 'pageFormData'){
                if(type == 'btnsColor'){
                    that.pageFormData.btns.style.color = color;
                }else{
                    that.pageFormData.style[type] = color;
                }
            }else if(name == 'listFormData'){
                if(type == 'title'){
                    that.listFormData.style.color = color
                }else if(type == 'tipStyle'){
                    that.listFormData.tipStyle.color = color
                }
            }
        },

        colorHex: function (string) {
            if (/^(rgb|RGB)/.test(string)) {
                var aColor = string.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
                var strHex = "#";
                for (var i = 0; i < aColor.length; i++) {
                    var hex = Number(aColor[i]).toString(16);
                    // 修正：不足两位，补0
                    if (hex.length == 1) {
                        hex = "0" + hex
                    } else {
                        if (hex == "0") {
                            hex += hex;
                        }
                    }
                    strHex += hex;
                }
                
                if (strHex.length != 7) {
                    strHex = string;
                }
                return strHex;
            } else if (reg.test(string)) {
                var aNum = string.replace(/#/, "").split("");
                if (aNum.length === 6) {
                    return string;
                } else if (aNum.length === 3) {
                    var numHex = "#";
                    for (var i = 0; i < aNum.length; i += 1) {
                        numHex += (aNum[i] + aNum[i]);
                    }
                    return numHex;
                }
            } else {
                return string;
            }
        },

        openError:function(){
            this.$message.error('如需修改请先切换至自定义选项');
        },

        // 重置
        resetItem(typename,type){
            const that = this;
            let arr = ['list','icons','adv','title'];
            
            if(!arr.includes(typename)){
                if(typename != 'memberComp' && typename != 'page'){
                    let currEditObj = that.config.compArrs.find(item => {
                        return item.id == that.currEditPart
                    })
                    that[typename + 'FormData'] = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']))
                }else{
                    if(typename == 'page'){
                        that[typename + 'FormData'] = JSON.parse(JSON.stringify(type ? that.config.pageSet :  that[typename + 'Default']))
                    }else{

                        that[typename + 'FormData'] = JSON.parse(JSON.stringify(type ? that.config.memberComp :  that[typename + 'Default']))
                    }
                }
            }else{
                let currEditObj = that.config.compArrs.find(item => {
                    return item.id == that.currEditPart && that.showContainerArr[that.currEditInd].sid == item.sid
                })
                let noEdit;
                switch(typename){
                    case "adv":
                    case 'list' :
                        noEdit = JSON.parse(JSON.stringify(that[typename + 'FormData'].list))
                        that[typename + 'FormData'] = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']));
                        that[typename + 'FormData'].list = noEdit;
                        break;
                    case 'icons' :
                        noEdit = JSON.parse(JSON.stringify(that.iconsFormData.btns.list))
                        that.iconsFormData = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']));
                        that.iconsFormData.btns.list = noEdit;
                        break;
                    case 'title' :
                        noEdit = that.titleFormData.title.text
                        that.titleFormData = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']));
                        that.titleFormData.title.text = noEdit;
                        break;
                }


            }
            that.$nextTick(() => {
                that.showResetPop = false;
            })
        },


        // 验证是否添加过该组件
        checkHasIn(typename,id){
            const that = this;
            if(!id || id != that.currEditPart) return false;
            let currEditObj = that.showContainerArr[that.currEditInd];
            let findObj;
            if(that.config.compArrs){
                findObj = that.config.compArrs.find(item => {
                    return item.sid == that.currEditPart && currEditObj.sid == item.sid
                })
            }
            return findObj && findObj.id ? 0 : 1
        },


        // 反白和深色切换
        changeThemeStyle(style){
            const that = this;
            that.memberCompFormData.themeType = style;
            if(style == 'light'){
                that.dark.number = that.memberCompFormData.numberCount.numberStyle.color;
                that.dark.title =   that.memberCompFormData.numberCount.titleStyle.color;
                that.memberCompFormData.numberCount.numberStyle.color = '#ffffff'
                that.memberCompFormData.numberCount.titleStyle.color = '#ffffff'
            }else{
                that.memberCompFormData.numberCount.numberStyle.color = that.dark.number
                that.memberCompFormData.numberCount.titleStyle.color = that.dark.title
            }
        },


        // 获取底部按钮数据
        getBottomBtns(){
            const that = this;
            // /include/ajax.php?service=siteConfig&action=touchHomePageFooter&version=2.0&module=siteConfig
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=touchHomePageFooter&version=2.0&module=siteConfig',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                      that.bottomNavs = data.info;
                    }
                },
                error: function () { }
            });
        },


        // 显示确认页面
        showConfirmModel(){
            const that = this;
            let currlocation = window.location.href.replace('userCenterDiy.php','')
            this.$confirm('确定编辑底部按钮?', '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                window.open(currlocation + 'siteFooterBtn.php')
            }).catch(() => {
                console.log('关闭弹窗');
            });
        }

    },


})



