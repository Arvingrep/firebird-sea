
sitePageData = sitePageData ? JSON.parse(sitePageData) : sitePageData; //处理一下sitePageData
let addModule_time = false; //当前正在新增模块

let initAllData = true; //是否正在初始化数据

var pickr1,pickr2,pickr3,pickrArr = {};
// var swiperImg; //轮播图
// var swiperImgObj = {}; // 多个轮播图
var swiperNav; // 导航按钮

var noChangeLabel = false; // 是否更新labelformData
var page = new Vue({
    el:'#page',
    data:{
        saveType:'', // 保存类型
        delListType:1, // 删除列表类型  1 => 连标题一起删  2 => 只删列表
        unlimitedLoad:false, //是否设置过无限加载
        historyHasChange:[], //修改的历史记录
        showLine:true, //是否显示辅助线
        currEditPart:0, //当前正在编辑的部分  1 => 搜索栏   2 => 订单  对应 moduleOptions中的id
        currEditInd:0, //当前编辑的索引
        currDelPart:0, //正要删除的id
        currDelInd:0, //正要删除的索引
        offsetLeft:0,
        showTypeOpt1:['默认', '划线加重' ,'图标'], //分隔标题预设
        showMarginSet:true,
        allChangeSteps:[], //所有修改的步骤

        //more => 是否可以多个
        moduleOptions:moduleOptions, //组件数据

        
        // 搜索栏相关配置
        searchColConfig:searchColConfig,

        // 搜索栏数据
        searchColFormData:JSON.parse(JSON.stringify(searchColDefault)),
        searchColDefault:searchColDefault, //默认设置
        showTooltip:false, //提示小黑框
        // 右上区域快捷操作
        addDropMenu:false, //添加下拉选项按钮
        addScan:true, //添加扫码
        searchKeysNum:0, //搜索推荐词的个数
        searchPlace:0, //搜索占位
        hasScanBtn:false, // 已经添加过扫码按钮  修改为下拉菜单中是否添加过扫码按钮
        dropMenu:dropMenu,  //下拉选项相关设置
        showDropMenuPop:false, //下拉选项弹窗
        linkSetPop:false, //链接选择弹窗
        keywords:'' , //搜索链接关键字
        searchList: linkListBox,  //常用链接
        numArr:numToText, //数字对应中文

        // 轮播图相关数据
        "swiperFormData": JSON.parse(JSON.stringify(swiperFormDeFault)),
        swiperDefault:swiperFormDeFault, //默认轮播图设置
        // 轮播图当前显示的指示点 索引
        // swiperDotCurr:0, //当前索引
        swiperImgObj:{},
        // 导航按钮
        "sNavFormData": JSON.parse(JSON.stringify(sNavDefault)),
        sNavDefault:sNavDefault, //默认导航数据数据
        // 所有模块
        originModules:[], //原始导航数据
        allModules:[], //所有模块数据 为避免修改 实际页面需获取数据与此对比出标签的数据
        // moduleGroup:[], //按个数分组
        // showModuleLabs:[],  //有标签的导航 
        // 模块导航弹窗
        modNavPop:false,
        defaultPath:defaultPath, // 默认地址


        // 普通按钮
        "btnsFormData":JSON.parse(JSON.stringify(btnsDefault)),
        btnsDefault:btnsDefault, //普通按钮默认设置

        // 顶部按钮
        "topBtnsFormData": JSON.parse(JSON.stringify(topBtnsDeFault)),
        "topBtnsDefault":topBtnsDeFault,  //顶部按钮默认数据

        btnSizeInd:0, //当前选中常规
        fontSizeArr:[{ size:24, text:'常规' },{ size:26, text:'加大' },{ size:28, text:'特大' }], //字体
        fontSizeArr1:[{ size:26, text:'常规' },{ size:28, text:'加大' },{ size:30, text:'特大' }], //字体

        // 展播
        "advLinksFormData":JSON.parse(JSON.stringify(advLinksDefault)),
        advLinksDefault:advLinksDefault, //默认设置

        // 消息通知
        msgFormData:JSON.parse(JSON.stringify(msgDefault)),
        msgDefault:msgDefault, //消息通知默认设置

        // 消息通知样式
        msgStyle:msgStyleArr,

        // 通知类型
        msgType:[ { type:1, text:'平台公告', service:'siteConfig',action:'notice' ,},
                  { type:2, text:'商城公告',service:'shop',action:'news' ,typeid:''}, 
                  { type:3, text:'资讯', service:'article',action:'alist',typeid:'',mold:0}, 
                  { type:4, text:'手动添加', }, ], //通知类型

        // 资讯分类
        // articleType:[],

        // 排序
        msgOrderList:[{ id:1, text:'最新' },{ id:2, text:'最热' }],
        // 资讯弹窗
        msgListPop:false,
        msgPopData:{
            msgType:1,
            pageSize:10,
            orderby:1,
            dlist:[],
            typeid:'',
            typeidArr:[],
        },
      

        // 页面设置
        pageSetFormData:JSON.parse(JSON.stringify(pageSetDefault)), 
        pageSetDefault:pageSetDefault,
        currRightIcon:0, //当前头部选择的右侧按钮
        // 标签
        labelFormData: JSON.parse(JSON.stringify(labelDefault)),
        labelDefault:labelDefault,
        listShowData:['',''], //展示的数据
        labelChose:0, //当前选中的索引
        slabelChose:'', //child当前选中的索引
        // 数据来源的相关数值
        dataArr:moduleArrList,

        dataChosePop:false, //显示数据来源选择弹窗
        sourceTip:false, //数据来源的提示 ，只有设置过数据的情况下才显示
        editSource:false, //处于更改状态
        addDirect:false, //直接追加
        listChosePop:false, //列表数据选中弹窗
        listChange:0, //是否是更改
        listPopData:{  //列表数据 相关配送
            showChoseList:false, //显示已选列表 
            pageSize:10, // 数据单页显示的数目
            currPage:1,
            totalCount:0, //数据条数
            showListArr:[], //数据列表的数组  
            chosedList:[], //手动添加的数据 ， 最多不超过50
            popType:1, // 1 => 动态数据  2 => 手动选择
            service:'', // 模块
            paramObj:{
                typeArr:[], // 类别数组
                typeid:'', //类别  
                orderby:'',
                keywords:'', // 搜索关键字
            },
            orderArr:[],
            showObj:{

            }
        },
        currChosed_pid:0, //弹窗使用 当前选择的父级索引
        currChosed_cid:0, //弹窗使用 当前选择的子级索引
        currChose_labCon:{} ,// 当前选中的标签内容
        currChose_labArr:[], //二级选中的内容
        // 数据列表
        listFormData:{},
        listDefault:JSON.parse(JSON.stringify(listDefault)),

        imgScaleArr:[{ id:1, text:'适应图片', },{ id:2, text:'1:1', },{ id:3, text:'4:3' },{ id:4, text:'3:2' }],

        // 商城默认设置
        shopFormData:JSON.parse(JSON.stringify(shopFormData)),
        infoFormData:JSON.parse(JSON.stringify(infoFormData)),
        jobFormData:JSON.parse(JSON.stringify(jobFormData)),
        houseFormData:JSON.parse(JSON.stringify(houseFormData)),
        sfcarFormData:JSON.parse(JSON.stringify(sfcarFormData)),
        tiebaFormData:JSON.parse(JSON.stringify(tiebaFormData)),
        businessFormData:JSON.parse(JSON.stringify(businessFormData)),
        articleFormData:JSON.parse(JSON.stringify(articleFormData)),

        showPop:false, //显示关闭提示  小黑框
       
        // 优惠券相关
        quanFormData:JSON.parse(JSON.stringify(quanDefault)), // 优惠券的表单
        quanDefault:quanDefault, //优惠券默认数据
    
        // 组合   营销
        groupEditId:'', //当前编辑的id
        // 抢购
        qianggouFormData:JSON.parse(JSON.stringify(qianggouDefault)),
        qianggouDefault:JSON.parse(JSON.stringify(qianggouDefault)),
        kanjiaDefault:JSON.parse(JSON.stringify(kanjiaDefault)),
        kanjiaFormData:JSON.parse(JSON.stringify(kanjiaDefault)),
        miaoshaFormData:JSON.parse(JSON.stringify(miaoshaDefault)),
        miaoshaDefault:JSON.parse(JSON.stringify(miaoshaDefault)),
        pintuanFormData:JSON.parse(JSON.stringify(pintuanDefault)),
        pintuanDefault:JSON.parse(JSON.stringify(pintuanDefault)),
        // carouselHeight:84, // 走马灯高度  主要是为商城营销组件
        countDownArr:{}, //倒计时

        // 商品组
        currProOn:1, //当前正在编辑的 ，样式一才有
        prosFormData:JSON.parse(JSON.stringify(prosDefault)),
        prosDefault:prosDefault, //默认
        currHoverOn:'',
        currProEdit:0, //当前正在编辑的  样式五才有  索引
        currBusiEdit:0, //当前正在编辑的  样式三才有  索引
        confirTipShow:[false,false], // 显示确认弹窗 删除
        addPartPop:false,   // 显示确认弹窗 新增
        hoverOn:'', //选择数据来源时 选择的类目
        selectPop:false, //显示数据来源

        // 风格设置过的内容
        prosHasSet:[],  //切换存储
        busisHasSet:[], //商户组存储过的

        // 商家组
        busisFormData:JSON.parse(JSON.stringify(busisDefault)),
        busisDefault:busisDefault,
        allTypeList:{}, //分类


        
    
        bottomNavs:[], //底部按钮
        advFormData:{
            sid:1, //验证多个中的索引  重置复用组件需要
            column:1, //列数 1 - 3
            list:[{
                image:'',
                link:'',
                linkInfo:{
                    linkText:'',
                    selfSetTel:0
                },
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
                link:'',
                linkInfo:{
                    linkText:'',
                    selfSetTel:0
                },
            }],
            style:{
                marginTop:22,
                marginLeft:30,
                borderRadius:24,
                height:140,
            }
        },

        // 标题相关
        titleFormData:JSON.parse(JSON.stringify(titleDefault)),
        titleDefault:titleDefault,

        showResetPop:false, //重置弹窗
        // 公众号表单
        wechatFormData:{},
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
                color:'#a1a7b3'
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
    

        // 中间内容显示  除了 会员头部 其余内容
        showContainerArr:[],
        submitData:{}, //自定义要提交的数据
        // selfDefine: config ? JSON.parse(config).selfDefine : 0,
        selfDefine:1, //直接进入自定义
        // showTooltip:true,
        fadeOut:false, //隐藏
        // config:newSetData, //已经配置的
        config:config , //已经配置的

        linkSetForm:{
            linkText:'', //链接标题
            link:'',  //链接
            slefSet:0, //是否是自定义
            linkType:0, // 0 => 是链接    1 => 是电话
            selfLink:'', //自定义链接
            selfTel:''
        },
        
        // 排序对象
        allSortObj:{},
        defaultIcon1:masterDomain + '/static/images/admin/siteMemberPage/default_icon1.png',
        defaultIcon2:masterDomain + '/static/images/admin/siteMemberPage/default_icon2.png',


        // 优惠券弹窗
        quanlistPop:false, //优惠券弹窗是否显示
        changeQuanInfo:'', //是否是修改优惠券
        quanPopData:{
            module:'shop',
            gettype:'',
            page:1,
            keyword:'', //关键词
            totalCount:0,
            quanList:[],
            chosedList:[], //选择的优惠券
            interface:{
                service:'shop',
                action:'quanList',
                gettype:'', //商城
                pageSize:10,
                getype:'', //外卖
            }

        },

        fullscreenLoading:false, //加载中
        randomNum:new Date().valueOf(), // 随机数
        preveiw:false,
        preveiwSet:'', //预览


        heightCount:false, //是否正在计算高度

        // 各块数据加载完成
        loadEnd:{
            listFormData:false, //切换标签 => 列表
            qianggouFormData:false,
            pintuanFormData:false,
            kanjiaFormData:false,
            miaoshaFormData:false,
            prosFormData:false,
            busisFormData:false
        },

        userChangeData:false,  //用户修改信息
        titleChangeForList:false, // 用于识别是否在改变数据列表的标题

        sitePageData:sitePageData,
        
        // 分站
        citySetPop:false, //城市分站模板切换弹窗
        cityCustomList:sitePageData && sitePageData.cityCustom && Array.isArray(sitePageData.cityCustom) ? sitePageData.cityCustom : [], //单独设置过的城市分站
        cityidChosed:[], //选择同步的城市分站

        changeCityPop:false, //切换分站/平台弹窗
        terminalList:[{ id:'h5', name:'H5' },{ id:'app', name:'App' },{ id:'wxmini', name:'微信小程序' },{ id:'dymini', name:'抖音小程序' }],
        currCityid:cityid, //当前所处城市分站， //为空则为默认模板
        currChosedCity:cityid, //要切换的城市id
        currPlatform:platform, //当前编辑的终端
        currChosePlatform:platform, //要去编辑的终端
        curr_cp:{}, //当前的cityheplatform
        currChosed_cp:{}, //存放要选择的city和platform  是个对象
        linkToType:'defaultModule', // 要切换的类型
        orginalCityList:[], //原始的城市分站
        siteCityList:[], //所有的城市分站
        hotCity:[], //热门城市
        cityKey:'',// 搜索关键字

        
        // 高级设置弹窗
        advanceSetPop:false,
        advancsFormData:{  //同步的相关数据
            hasSet:0,
            citys:[], //选择同步的分站信息
            plats:[], //选择同步的终端信息信息
            ids:[], //同步的分站
            platform:[],
            cover:1
        },
        cityMayChose:[], //可能想选的
        changeCityPover:false, //城市选择弹出层
        cityKeyAdv:'',
        citySearchFocus:false,
        noMatchCity:false, //城市分站没有匹配
        // 更换模板
        changeModulePop:false,
        cityDiyOrginal:[],
        cityDiyList:[],
        cityDiyMayChose:[],
        cityDiyHot:[],
        currCityDiyChose:{} ,//当前选择的模板分站
        modelPlatform:'', //模板终端
        currChoseModel:'', //当前选择的模板

        cityplatform:0,
        noSetPlatform:false, //当前分站未设置过模板 不能设置终端
        showPlatformSet:false, //是否显示终端设置

        showFirstTooltip:false,


    },
    created(){
        const that = this;
        if(!that.sitePageData.default){
            that.showFirstTooltip = true;
            // setTimeout(() => {
            //     that.showFirstTooltip = false
            // }, 3000);
        }
        if(changePage && changePage == '1'){ //从其他设置切换过来的 需要提示
            let newCityPlatform = localStorage.getItem('newCityPlatform',that.currChosed_cp)
            
            if(newCityPlatform){
                newCityPlatform = JSON.parse(newCityPlatform)
                let platform = newCityPlatform['platform'] ? newCityPlatform['platform'].name : '';
                let cityname = newCityPlatform['city'] ? newCityPlatform['city'].name : '';
                let str = cityname + (cityname && platform ? '-' : '') + platform;
                that.$message({
                    iconClass:'smIcon',
                    customClass:'successSkip',
                    dangerouslyUseHTMLString: true,
                    message: '<span>已切换至'+(str)+'首页设置</span>',
                })
                setTimeout(() => {
                    let url = window.location.href;
                    let param = url.split('?')[1];
                    let paramArr = param.split('&')
                    // paramArr.splice(paramArr.indexOf('change=1'),1)
                    let changeInd = paramArr.findIndex(str => {
                        return str.indexOf('change=') > -1
                    })
                    paramArr.splice(changeInd,1)
                    url = url.split('?')[0] + (paramArr.length ? '?' : '') + paramArr.join('&')
                    history.pushState({}, '', url);
                    localStorage.removeItem('newCityPlatform')
                }, 3000);
            }
        }

        if(cityid){ //直接分站过来 需要验证是否设置过模板
            that.getSiteCityInfo(cityid,function(d){
                let arr = ['h5','app','wxmin','dymini']
                let noSet = true
                for(let i = 0; i < arr.length; i ++){
                    if(d[arr[i]] && d[arr[i]] == 1 ){
                        noSet = false
                        break;
                    }
                }

                if(noSet){
                    that.noSetPlatform = true; //禁止切换平台
                    that.showFirstTooltip = true
                    let url = window.location.href;
                    let param = url.split('?')[1];
                    let paramArr = param.split('&')
                    let ind = paramArr.findIndex(item =>{
                        return item.indexOf('platform=') > -1
                    })
                    if(ind > -1){
                        paramArr.splice(ind,1)
                    }
                    url = url.split('?')[0] + (paramArr.length ? '?' : '') + paramArr.join('&')
                    history.pushState({}, '', url);

                    platform = '';
                    that.$delete(that.curr_cp,'platform')
                    setTimeout(() => {
                        that.showFirstTooltip = false
                    }, 3000);
                }


            })
        }
    },
    mounted(){
        const that = this;
        if(that.currChosedCity){
            that.linkToType = 'cityModule'
        }

        that.initData(); //初始话数据
        that.$nextTick(() => {
            that.delHandleMouseEnter(); //走马灯禁止鼠标上移事件
            that.resetPlatform();  //设置用户是否购买过该终端
            that.getSiteCityList('siteConfig'); //获取城市分站  此处为测试实际应在显示弹窗的时候调用
        })

        // 页面滚动  删除提示隐藏
        $('.midConBox').scroll(function(){
            that.showPop = false;
        })
       
    },

   

    watch:{
        // // 
        // cityDiyList:{
        //     handler:function(val){
        //         console.log(val)
        //     },
        //     deep:true
        // },
        
        // -----
        'searchColFormData.searchCon.keysArr':function(nval){
            const that = this;
            let keyNum = 0,place = 0
            for(let i = 0; i < nval.length; i++){
                if(nval[i].type){
                    keyNum++
                }else{
                    place ++; 
                }
            }
            that.searchKeysNum = keyNum;
            that.searchPlace = place;
        },

     

        "topBtnsFormData.column":function(val){
            const that = this;
            console.log(val)
            let btnsArr = that.topBtnsFormData.btnsArr;
            if(val > btnsArr.length){
            
                let num =  val- btnsArr.length;
                let btnArr = []
                for(let i = 0 ; i < num; i++){
                    btnArr.push({
                        "id": (new Date()).valueOf(),
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
                    })
                }
                that.topBtnsFormData.btnsArr = that.topBtnsFormData.btnsArr.concat(btnArr)
            }else{
                that.topBtnsFormData.btnsArr.length = val
            }
        },

        'msgFormData.msgType':function(val){
            const that = this;
             if(val == 3 && that.allTypeList['article'] && that.allTypeList['article'].length == 0){
                that.getTypeList('article'); //获取资讯
             }
        },

        'msgFormData.styletype':function(val){
            const that = this;
            if(val == 3){
                that.msgFormData.title.style.color = '#ffffff'
            }
        },
        
        


        'listPopData.currPage':function(val){
            console.log(val)
        },


        // 监听标签变化
        'labelFormData':{
            handler:function(val){
                const that = this;

                if(!noChangeLabel){
                    if(that.showContainerArr[that.currEditInd].typename == 'label'){
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(that.labelFormData))
                    }
                }else{
                    that.$nextTick(() => {
                        if(that.showContainerArr[that.currEditInd].typename == 'label'){
                            that.labelFormData = that.showContainerArr[that.currEditInd].content;
                        }
                        noChangeLabel = false;
                    })
                }
            },
            deep:true
        },

        'listFormData':{
            handler:function(val){
                // console.log(11111111)
            },
            deep:true
        },

        // 监听搜索栏变化时
        'searchColFormData.rtBtns.btns':{
            handler:function(val){
                const that = this
                let rBtns = that.searchColFormData.rtBtns.btns;
                let topRbtns = that.pageSetFormData.search.rightBtns.rbtns;
                topRbtns = Array.isArray(topRbtns) && topRbtns ? topRbtns : [];  //兼容 值变false
                let currBtns = []
                for(let i = 0; i < rBtns.length; i++){
                    let obj = topRbtns.find(item => {
                        return item.id == rBtns[i].id
                    })
                    rBtns[i]['iconColor'] = ''; // 图标颜色
                    rBtns[i]['newIcon'] = obj && obj.newIcon ? obj.newIcon : ''; //新增一个属性 => 存放新图标
                    currBtns.push({
                        show:true,
                        ...rBtns[i]
                    })
                }
                that.pageSetFormData.search.rightBtns.rbtns = currBtns;
            },
            deep:true,
        },

        // 监听当前编辑的组件  当将要显示页面设置时  需要
        'currEditPart':function(val){
            const that = this;
            that.showResetPop = false;

            if(val == 0){  // => 表示设置页面
                let rBtns = that.searchColFormData.rtBtns.btns;
                let topRbtns = that.pageSetFormData.search.rightBtns.rbtns;
                topRbtns = Array.isArray(topRbtns) && topRbtns ? topRbtns : [];  //兼容 值变false
                let currBtns = []
                for(let i = 0; i < rBtns.length; i++){
                    let obj = topRbtns.find(item => {
                        return item.id == rBtns[i].id
                    })
                    rBtns[i]['iconColor'] = ''; // 图标颜色
                    rBtns[i]['newIcon'] = obj && obj.newIcon ? obj.newIcon : ''; //新增一个属性 => 存放新图标
                    currBtns.push({
                        show:true,
                        ...rBtns[i]
                    })
                }
                that.pageSetFormData.search.rightBtns.rbtns = currBtns;
            }
            else if(val == 11){
                that.$nextTick(() => {
                    that.getLabStitle()
                })
            }else if(val == 10){ //商家组
                that.getTypeList('business');
            }

            that.$nextTick(() =>{
                that.tableSortInit()
            })

     
        },

        'qianggouFormData':{
            handler:function(){
                const that = this
                that.$nextTick(() => {
                    that.checkShopMarketHeight()
                })
            },
            immediate:true,
            deep:true
        },
        'pintuanFormData':{
            handler:function(){
                const that = this
                that.$nextTick(() => {
                    that.checkShopMarketHeight()
                })
            },
            immediate:true,
            deep:true
        },
        'miaoshaFormData':{
            handler:function(){
                const that = this
                that.$nextTick(() => {
                    that.checkShopMarketHeight()
                })
            },
            immediate:true,
            deep:true
        },
        'kanjiaFormData':{
            handler:function(){
                const that = this;
                that.$nextTick(() => {
                    that.checkShopMarketHeight()
                })
            },
            immediate:true,
            deep:true
        },

        quanlistPop:function(val){
            const that = this;
            if(that.quanFormData.quanList.length > 0 && val){
                that.quanPopData.chosedList = JSON.parse(JSON.stringify(that.quanFormData.quanList))
            }
            if(that.quanPopData.quanList.length == 0 && val){
                that.toQuanList()
            }
        },

        // 监听用户是否更改
        userChangeData:function(val){
            // console.log(1111)
            if(val){
                optAction = true;
            }
        },


        // // 监听列表查看更多的改变
        // 'listFormData.more':{
        //     handler:function(val){
        //         const that = this
        //         if(!val.show) return false;
        //         // 正在改变查看更多选项
        //         console.log($(".currEditPart .btn_more"))
        //         that.$nextTick(() => {
        //             if($(".currEditPart .btn_more").length){
        //                 let offsetTop = $(".currEditPart .btn_more").offset().top;
        //                 console.log(offsetTop)

        //             }
        //         })
        //     },
        //     deep:true
        // }

    },
    // 组件
    components:{
        'list-module':list_module,
    },
    methods:{

         // 初始化相关数据
         initData:function(reset){  //reset表示重新渲染
            const that = this;
            that.reSetProsDefault(); // 重置商品组的相关数据   因为不同风格配置不同 但是用的是同一个变量  需要手动修改一下
            // 修改左上角的url
            var localUrl = window.location.href;
            var location = localUrl.replace(masterDomain+'/','');
            var homeUrl = masterDomain+'/'+location.split('/')[0];
            $(".backHome").attr('href',homeUrl);

            // 赋值 
            if(that.config && that.config['pageSetFormData'] && that.config['searchColFormData']){
                that.pageSetFormData = JSON.parse(JSON.stringify(that.config['pageSetFormData']));
                that.searchColFormData =  JSON.parse(JSON.stringify(that.config['searchColFormData']));
                that.showContainerArr = that.config['compArrs'] ? JSON.parse(JSON.stringify(that.config['compArrs'])) : []; //此处需要处理/加载对应接口中的相关数据
            }else{
                that.pageSetFormData = JSON.parse(JSON.stringify(that.pageSetDefault));
                that.searchColFormData =  JSON.parse(JSON.stringify(that['searchColDefault']));
                that.showContainerArr = []; //此处需要处理/加载对应接口中的相关数据
            }
            that.$nextTick(() => {
                initAllData = false; //表示初始化完成
            })
   
            that.checkSearchRbtns()
            
            if(!reset){
                that.currEditPart = 1; //当前编辑搜索框

                // 所有色彩选择器 初始化
                that.initAllColorPickr();
    
    
                // 一些公共点击事件
                that.initClick(); 

                 // 显示删除按钮在上
                $('.allShowCon ').hover(function(){
                    $(".midContainer .midConBox").addClass('moreIndex')
                },function(){
                    $(".midContainer .midConBox").removeClass('moreIndex')
                })
            }
            

            // 此处需要加载完模板数据之后  执行
            that.$nextTick(() => {
                // 初始化排序
                that.initAllSort();

                that.tableSortInit(); //表格排序初始化
                that.showContainerArr.forEach((obj,ind) => {
                    switch(obj.id){
                        // 轮播图
                        case 4:
                            // 初始化swiper
                            that.initSwiper(obj)
                            break;

                        // 导航
                        case 5:
                            that.getAllModules();
                            break;
                        // 商家组
                        case 10:
                        // 商品组
                        case 9:
                            that.$set(that.loadEnd,obj.typename + 'FormData',false)
                            let dataArr = obj.content.dataObj.modArr;
                            for(let i = 0; i < dataArr.length; i++){
                                let ajaxParam = JSON.parse(JSON.stringify(dataArr[i].interface))
                                ajaxParam['pageSize'] = 12; //由于需要多次切换显示数据的条数  这里设置到最大 切换时 只要设置显隐 避免多次加载数据
                                that.directGetList(ajaxParam,dataArr[i].addType,function(d,dinfo){
                                    that.$set(that.loadEnd,obj.typename + 'FormData',true);//只表示加载 结束
                                    let idsArr = d.map(item => {
                                        return item.id
                                    })
                                    dataArr[i].listArr = d;
                                    dataArr[i].listIdArr = idsArr;
                                    dataArr[i]['totalCount'] = dinfo.pageInfo.totalCount; //表示总数据
                                    that.$set(that.showContainerArr[ind].content.dataObj.modArr,i,dataArr[i])
                                },function(){
                                    that.$set(that.loadEnd,obj.typename + 'FormData',true); //只表示加载 结束
                                })
                            }


                            break;
                        // 切换标题   
                        case 11:
                        // case 28:
                            that.loadEnd['listFormData'] = false;
                            that.showContainerArr[ind].content.labelChose = 0
                            that.showContainerArr[ind].content.slabelChose = 0
                            // 此处还需要加载数据
                            if(ind == (that.showContainerArr.length - 1)){

                                that.checkUnlimitedLoad(); //验证是否设置过无限加载
                            }
                            let labsArr  =  obj.content.labsArr
                            for(let i = 0; i < labsArr.length; i++){
                                let dtype = labsArr[i].type; //1 => 普通数据  2 => 有二级数据  3 = > 链接
                                if(dtype == 3) continue; //链接不需要加载
                                let more= dtype == 2 ? true : false;
                                
                                if(!more){
                                    let dObj = labsArr[i].dataFormData.dataObj;
                                        if(dObj.styletype != 4 && dObj.modCon.imgScale == 1){
                                            that.$set(obj.content.labsArr[i].dataFormData.dataObj.modCon,'imgScale',2)
                                        }
                                    that.directGetList(labsArr[i].dataFormData.dataObj.interface,labsArr[i].dataFormData.addType,function(d){
                                        that.loadEnd['listFormData'] = true
                                        let idsArr = d.map(item => {
                                            return item.id
                                        })
                                        labsArr[i].dataFormData.listArr = d;
                                        labsArr[i].dataFormData.listIdArr = idsArr;
                                        that.$set(that.showContainerArr[ind].content.labsArr,i,labsArr[i])
                                    },function(){
                                        that.loadEnd['listFormData'] = true
                                    })
                                }else{
                                    let children =  obj.content.labsArr[i].children
                                    for(let m = 0; m < children.length; m++){
                                        let dObj = labsArr[i].children[m].dataFormData.dataObj;
                                        if(dObj.styletype != 4 && dObj.modCon.imgScale == 1){
                                            that.$set(obj.content.labsArr[i].children[m].dataFormData.dataObj.modCon,'imgScale',2)
                                            // console.log(obj.content.labsArr[i].children[m].dataFormData.dataObj)
                                        }
                                        that.directGetList(labsArr[i].children[m].dataFormData.dataObj.interface,labsArr[i].children[m].dataFormData.addType,function(d){
                                            let idsArr = d.map(item => {
                                                return item.id
                                            })
                                            labsArr[i].children[m].dataFormData.listArr = d;
                                            labsArr[i].children[m].dataFormData.listIdArr = idsArr;
                                            that.$set(that.showContainerArr[ind].content.labsArr[i].children,m,labsArr[i].children[m])
                                            that.loadEnd['listFormData'] = true
                                        },function(){
                                            that.loadEnd['listFormData'] = true
                                        })
                                    }
                                }

                                
                            }
                            
                            break;
                        
                        // 限时抢购
                        case 19:
                            // 获取限时抢购场次
                            that.$set(that.loadEnd,obj.typename + 'FormData',false)
                            that.getConfigtime(ind); 
                           
                            that.countHalfPart()
                            break;
                        // 砍价 拼团  
                        case 16:
                        case 17:
                        case 18:
                            that.checkShopMarketHeight(ind);
                            that.$set(that.loadEnd,obj.typename + 'FormData',false)
                            that.getShopTrends(ind)
                            let ajaxParam = JSON.parse(JSON.stringify(obj.content.dataObj.interface))
                            ajaxParam['pageSize'] = 12;//由于需要多次切换显示数据的条数  这里设置到最大 切换时 只要设置显隐 避免多次加载数据
                            that.directGetList(ajaxParam,obj.content.addType,function(d){
                                let idsArr = d.map(item => {
                                    return item.id
                                })
                                that.$set(that.showContainerArr[ind].content,'listArr',d)
                                that.$set(that.showContainerArr[ind].content,'listIdArr',idsArr)

                                that.$set(that.loadEnd,obj.typename + 'FormData',true)
                                setTimeout(() => {
                                    that.checkShopMarketHeight(ind)
                                }, 1000);
                            },function(){
                                that.$set(that.loadEnd,obj.typename + 'FormData',true)
                            });

                            // 获取副标题数据
                            if(obj.content.stitle.styletype == 1){  //动态加载的数据
                                let param = {
                                    service:'shop',
                                    action:'kanSuccessList', 
                                }
                                if(obj.typename == 'kanjia'){
                                    param['action'] = 'kanSuccessList'
                                }else if(obj.typename == 'pintuan'){

                                }else if(obj.typename == 'miaosha'){

                                }
                            }
                            // that.getStitle(param,obj.typename,ind)
                            that.countHalfPart()
                            break;
                        // 消息通知
                        case 20:
                            if(obj.content.msgType == 3){
                                that.getTypeList('article')
                            }
                            that.getInfoMation(obj,ind); //获取通告  实际应以是否调用
                    }
                })
                

                that.getBottomBtns(); //获取底部按钮数据
            })

            
           


        },

        // 没设置过默认模板 提示
        showMessageTip(){
            const that = this
              // 初次进入页面设置时的提示  此处需要作判断   
            that.$alert('<p>完成后可在此切换，单独设置指定分站、终端，<br/> 未单独设置的都将使用系统默认</p>', '请先设置系统默认模板', {
                dangerouslyUseHTMLString: true,
                customClass:'confirmFirst', 
                confirmButtonText:'好的',
                callback:function(){
                    console.log('请先完成默认模板的设置')
                }
            });
        },

        // 初始化时 查看是否购买终端
        resetPlatform(){
            const that = this;
            for(let i = 0; i < that.terminalList.length; i++){
                let plat = that.terminalList[i];
                if(sitePageData && sitePageData[plat.id] != undefined){
                    that.$set(plat,'buy',1)
                    // that.$set(platform,'set',sitePageData[platform.id]); //当前分站是否设置过
                }else{
                    that.$set(plat,'buy',0)
                }

                if(platform == plat.id){
                  that.$set(that.curr_cp,'platform',plat)
                  that.$set(that.currChosed_cp,'platform',plat)
                }
            }
        },

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
                return dateFormatter;
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
            
            // 使用Intl.DateTimeFormat来格式化日期
            const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
            });
            
            // 获取格式化后的时间字符串
            const formatted = dateTimeFormat.format(date);
            
            // 将格式化后的字符串分割为数组
            const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

            // 返回一个对象，包含年月日时分秒
            return {year, month, day, hour, minute, second};
        },

        // 加载数据 
        getStitle(param,typename,ind){
            const that = this;
            $.ajax({
                url: '/include/ajax.php',
                type: "GET",
                data:param,
                dataType: "json",
                success: function (data) {
                    if(!isNaN(ind)){
                        that.showContainerArr[ind].content.stitle['list'] = data.info;
                    }else {
                        that[typename + 'FormData'].stitle['list'] = data.info
                    }
                },
                error: function () { }
            });

        },
        

        //  初始化一些点击事件
        initClick(){
            const that = this;

             // 显示颜色选择器
            $('body').delegate('.pcr-button','click',function(e){
                
                var  t = $(this)
                let type = t.closest('.color_picker').attr('data-type')
                
                t.next(".pcr-app.visible").find('.pcr-result').val(color?color:'#316BFF')
                t.next(".pcr-app.visible").addClass('show');
                if(type == 2){
                    var color = that.advLinksFormData.style.bg_color;
                    pickr2.setColor('#33364D');
                    pickr2.show()
                }else if(type == 3){
                    var color =  that.quanFormData.style.bgColor;
                    pickr3.setColor(color?color:'#316BFF');
                    pickr3.show()
                }else if(type == 1){
                    var color = that.searchColFormData.style.bgColor;
                    pickr1.setColor(color?color:'#316BFF');
                    pickr1.show()
                }else if(['qianggou','kanjia','pintuan','miaosha','busis','pros'].includes(type)){ //营销  此处待补充 
                    if(type !== 'pros' && type != 'busis'){   //四个营销组件
                        var color = that[type + 'FormData'].style.bgColor;
                        pickrArr[type].setColor(color?color:'#316BFF');
                        pickrArr[type].show()
                    }else if(type == 'busis' || type == 'pros'){ //商品组/商家组
                        var currInd = (type == 'pros' ? that.currProEdit : that.currBusiEdit)
                        let color =  that[type + 'FormData'].dataObj.modArr[currInd].style.bgColor;
                        let idName = that[type + 'FormData'].dataObj.modArr[currInd].styletype == 5 ? type + '5' : type
                        pickrArr[idName].setColor(color?color:'#316BFF');
                        pickrArr[idName].show()
                    }
                }

                
            })


            // 颜色选择器 重置按钮
            $('body').delegate('.pcr-reset','click',function(){
                let type = $(this).closest('.color_picker').attr('data-type');
                if(['qianggou','kanjia','pintuan','miaosha','busis','pros'].includes(type)){
                    if(type !== 'pros' && type != 'busis'){   //四个营销组件
                        var color = that[type + 'Default'].style.bgColor;
                        pickrArr[type].setColor(color?color:'#316BFF');
                    }else if(type == 'busis' || type == 'pros'){ //商品组/商家组
                        var currInd = (type == 'pros' ? that.currProEdit : that.currBusiEdit)
                        let color =  that[type + 'Default'].dataObj.modArr[currInd].style.bgColor;
                        let idName = that[type + 'FormData'].dataObj.modArr[currInd].styletype == 5 ? type + '5' : type
                        pickrArr[idName].setColor(color?color:'#316BFF');
                        pickrArr[idName].show()
                    }
                }else if(type == 2){
                    pickr2.setColor(that.advLinksDefault.style.bg_color);
                }else if(type == 3){
                    pickr3.setColor(that.quanDefault.style.bgColor);
                }else if(type == 1){
                    pickr1.setColor(that.searchColDefault.style.bgColor);
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


            // 点击提示
            $('body').delegate('.addTitleTip','click',function(){
                let type = that.labelFormData.labelShow ? 11 : 7;
                that.currEditPart = type
            })

            // 解决 拖动滑块后提示小黑框不隐藏
            $(document).click(function(e){
                if($(e.target).closest('.el-slider').length == 0){
                    that.showTooltip = false;
                    setTimeout(() => {
                        that.showTooltip = true;
                    }, 400);
                }
                
            })
        },

        // 初始化各种颜色选择器
        initAllColorPickr(){
            const that = this;
            // 'pros',, 'busis'
            let arr = ['qianggou', 'pintuan', 'kanjia', 'miaosha',  'pros5', 'busis5']
            for(let i = 0; i < arr.length; i++){
                that.initColorPicker(arr[i])
            }

               // 初始化模板
            if(!pickr1){

                pickr1 = Pickr.create({
                    el: '#colorPicker1',
                    showAlways: true,
                    default: that.searchColFormData.style.bgColor,
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
                        const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
                        that.searchColFormData.style.bgColor = color
                        that.searchColFormData.bgType = 'color';
                        that.userChangeData = true;

                        // 头部背景色改变 则 顶部背景色也改变
                        that.pageSetFormData.style.headBg = color;
                    },
                });
            }
            if(!pickr2){

                pickr2 = Pickr.create({
                    el: '#colorPicker2',
                    showAlways: true,
                    default: that.advLinksFormData.style.bg_color,
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
                        const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
                        that.advLinksFormData.style.bg_color = color
                        that.advLinksFormData.bgType = 'color'
                        that.userChangeData = true
                    },
                });
            }
            if(!pickr3){

                pickr3 = Pickr.create({
                    el: '#colorPicker3',
                    showAlways: true,
                    default: that.quanFormData.style.bgColor,
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
                        const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
                        that.quanFormData.style.bgColor = color
                        that.quanFormData.bgType = 'color'
                        that.userChangeData = true
                    },
                });
            }
        },


        // 改变内容时，新增一个记录
        changeHistory(paramStr,newVal,oldVal){
            const that = this;
            // let parentStr = paramStr.split('.')[0];
            // let currObj = that.showContainerArr[that.currEditInd]
            that.historyHasChange.push({
                editInd:that.currEditInd,
                changeStr:paramStr,
                newVal:newVal,
                oldVal:oldVal,
            })
        },

        // 返回上一步
        backLastStep(){
            const that = this;
            let changeObj = that.historyHasChange.pop();
            let str = changeObj.changeStr;
            let oldVal = changeObj.oldVal
            let jsonArr = str.split('.');
            var obj = that;
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length - 1)){
                    this.$set(obj, jsonArr[i], oldVal); //是否是自定义
                    
                }else{
                    obj = obj[jsonArr[i]]
                }
            }
        },

        // 去编辑组件
        toEditPart(obj,ind,id,direct){
            const that = this;
            that.showPop = false

            that.titleChangeForList = false;
            
            let typeid = obj.id;
            if(!id){

                // 当obj.id == 'topBtns' 并且有swiper siwper的风格是4 触发点击按钮
                if(that.checkSwiperTop() && obj.id == 3 && direct != 1){
                    
                    let swiperObjInd = that.showContainerArr.findIndex(item => {
                        return item.id == 4
                    })
                    that.toEditPart(that.showContainerArr[swiperObjInd],swiperObjInd)
                    return false
                }

                
                that.currEditPart = obj.id;
                that.currEditInd = ind;
                that[obj.typename + 'FormData'] = obj.content;
                if(obj.id == 11){
                    that.labelFormData = obj.content;
                    that.listFormData.currInd = 0;
                    that.listFormData.currCInd = ''; 
                    if(!obj.content.labelShow){  //仅数据列表
                        that.listFormData = obj.content.labsArr[0].dataFormData; //编辑数据列表
                    }else{  //切换标签
                        that.listFormData.currCInd = 0; 
                        if(obj.content.labsArr[0].type == 2){  //有二级标题
                            that.listFormData = obj.content.labsArr[0].children[0].dataFormData;
                        }else{
                            that.listFormData = obj.content.labsArr[0].dataFormData;
                        }
                    }
                }else if([16,17,18,19].includes(obj.id)){
                    if(obj.content.bgType == 'color' && pickrArr[obj.typename]){
                        pickrArr[obj.typename].setColor(obj.content.style.bgColor)
                    }
                }else if(obj.id == 10 || obj.id == 9){ //商户组
                    if(obj.content.dataObj.modArr[obj.id == 9 ? that.currProEdit : that.currBusiEdit].listArr.length == 0){
                        that.getDataList(obj.typename + 'FormData',function(d,dinfo){
                            let idsArr = d.map(item => {
                                return item.id
                            })
                            that[obj.typename + 'FormData'].dataObj.modArr[obj.id == 9 ? that.currProEdit : that.currBusiEdit].listArr = d;
                            that[obj.typename + 'FormData'].dataObj.modArr[obj.id == 9 ? that.currProEdit : that.currBusiEdit].listIdArr = idsArr;
                            that[obj.typename + 'FormData'].dataObj.modArr[obj.id == 9 ? that.currProEdit : that.currBusiEdit].totalCount = dinfo.pageInfo.totalCount;
                        })
                    }



                }
            }else{
                // 标题项是链接 不能选中
                if(id == 28 && that.labelFormData.labsArr[that.labelFormData.labelChose].type == 3) return false;
                that.currEditPart = id;
                that.currEditInd = ind;
                that.labelFormData = obj.content;
                // 之前用的labelChose不能用作多个组件  需要修改
                let currLabelChose = that.labelFormData.labelChose ? that.labelFormData.labelChose : 0; //当前选中的一级  
                let currSlabelChose = that.labelFormData.slabelChose ? that.labelFormData.slabelChose : 0; //当前选中的二级级  
                if(id == 7){  //修改普通标题
                    that.titleFormData = that.labelFormData.titleMore;
                    that.titleChangeForList = true;
                }
                
                if(!that.labelFormData.labelShow){  //仅数据列表
                    that.listFormData = that.labelFormData.labsArr[0].dataFormData; //编辑数据列表
                    
                }else{  //切换标签
                    if(that.labelFormData.labsArr[currLabelChose].type == 2){  //有二级标题
                        that.listFormData = that.labelFormData.labsArr[currLabelChose].children[currSlabelChose].dataFormData;
                        // that.slabelChose = that.slabelChose ? that.slabelChose : 0
                        that.$set(that.labelFormData,'slabelChose',(that.labelFormData.slabelChose ? that.labelFormData.slabelChose : 0 ))
                        if($('.rightCon.show .slabBox ul li.on_chose').length){
                            let sleft = $('.rightCon.show .slabBox ul li.on_chose').position().left
                            $('.rightCon.show .slabBox ul').scrollLeft(sleft)
                        }
                    }else{
                        that.listFormData = that.labelFormData.labsArr[currLabelChose].dataFormData;
                    }
                    if($('.rightCon.show .labBox  ul li.on_chose').length){

                        let left = $('.rightCon.show .labBox  ul li.on_chose').position().left
                        $('.rightCon.show .labBox ul').scrollLeft(left)
                    }
                }
                that.listFormData.currInd = currLabelChose;
                that.listFormData.currCInd = that.labelFormData.labsArr[currLabelChose].type == 2 ?  currSlabelChose : ''; 
                if(id == 11 || id == 28){
                    that.checkSourceTip(id)
                }
            }

            // if(that.showPop){
            //     console.log(that.showPop)
            //     //隐藏弹出层 => 删除提示
            //     // that.$set(that,'showPop',false)
            //     that.showPop = false
            //     that.$nextTick(() => {
            //         console.log(that.showPop)
            //     })

            // }
            event.stopPropagation()
        },

        // 检验是否需要提示
        /**
         * 实际提示只在已经设置过数据源 并且关闭过label设置的情况下
        */
        checkSourceTip(id){
            const that = this;
            if(id == 11){
                let flag = false;
                let labList = that.labelFormData.labsArr;
                for(let i = 0; i < labList.length; i++){
                    if(labList[i].dataFormData && labList[i].dataFormData.showObj && labList[i].dataFormData.showObj.service){
                        flag = true;
                        break
                    }
                }
                that.sourceTip = flag;
            }else{
                that.sourceTip = that.listFormData.showObj.service ? true : false;
            }
        },

        checkCurrChose(){
            const that = this;
            let hasSet = false
            hasSet = that.labelFormData.labsArr[that.currChosed_pid].dataFormData.showObj.service ? true : false;
            return hasSet
        },

        // 检验是否包含无限加载的组件
        checkUnlimitedLoad(){
            const that = this;
            let listComp = that.showContainerArr[that.showContainerArr.length - 1];
            if(listComp && listComp.id != 11) {
                that.unlimitedLoad = false; //已设置过无限加载
                return false
            };
            let flag = false;
            if(listComp &&  listComp.content && listComp.content.labsArr){
                let listObjArr = listComp.content.labsArr;
                

                for(let i = 0; i < listObjArr.length; i++){
                    let listObj = listObjArr[i];
                    if(flag) break;  //已经设置过无限加载
                    if(listObj.type != 1){ //二级标题 
                        for(let s = 0; s < listObj.children.length; s++){
                            let childObj = listObj.children[s];
                            if(childObj.dataFormData.dataObj.load == 1 ){
                                flag = true;
                                break;
                            }
                        }
                    }else if( listObj.dataFormData.dataObj.load == 1 ){
                        flag = true; //已设置过无限加载
                        break;
                    }
                
                }
            }
            that.unlimitedLoad = flag; //已设置过无限加载

        },

        changeLoad(val){ //当前要设置的值
            const that = this;
            that.listFormData.more.show = val === 1 ? false : that.listFormData.more.show; //切换无限加载时， 需要将列表中的查看更多隐藏
            if(that.unlimitedLoad && val === 1 && that.currEditInd != (that.showContainerArr.length - 1) ){ //已经设置过无限加载
                // 此处可能会有提示
                that.$message({
                    message: '页面底部无空位，无法设置无限加载',
                    type: 'error'
                })
            }else{
                if(that.currEditInd != (that.showContainerArr.length - 1)){ //无限加载不在最后一个，将其移动至最后
                    let ind = that.currEditInd;
                    that.currEditInd = that.showContainerArr.length - 1
                    let obj = that.showContainerArr[ind];
                    // that.labelFormData = JSON.parse(JSON.stringify(obj))
                    // that.showContainerArr.splice(ind,1,obj)
                    let compArr = JSON.parse(JSON.stringify(that.showContainerArr))
                    compArr.splice(ind,1)
                    compArr.push(obj)
                    that.showContainerArr = compArr;
                    noChangeLabel = true

                }

                // 改变
                that.$nextTick(() => {
                    that.listFormData.dataObj.load = val;
                    that.unlimitedLoad = val === 1 ? true : false;
                })

                

            }
            that.changeListLoad(); //同意设置同级别其他
        },

        // 删除右上按钮
        delBtn(ind){
            const that = this;
            if(that.searchColFormData.rtBtns.btns[ind].linkInfo.type == 2){
                that.addScan = false;
            }else if(that.searchColFormData.rtBtns.btns[ind].linkInfo.type == 3){
                that.addDropMenu = false
            }
            that.searchColFormData.rtBtns.btns.splice(ind,1)
            that.userChangeData = true
        },


        //新增右上按钮
        addNewBtn(type){
            const that = this;
            let btnArr = [];
            let btns =  that.searchColFormData.rtBtns.btns ? that.searchColFormData.rtBtns.btns : [];
            if(btns.length >= 3) return false; // 最多添加3个
            


            if(type == 'scan'){
                btnArr = [{
                    "id": 'scan' + (new Date()).valueOf(),
                    "text": "",
                    "icon": "",
                    "link": "",  
                    "linkInfo":{ //链接相关信息
                        "type":2, // 1 => 普通链接   2 => 扫码   3 => 下拉选项弹窗  4 => 拨打电话
                        "linkText":"扫码", //显示的文字
                    }
                }]
                scan = 1;
            }else if(type == 'dropMenu'){
                btnArr = [{
                    "id": 'drop' + (new Date()).valueOf(),
                    "text": "",
                    "icon": "",
                    "link": "",  
                    "dropMenu":JSON.parse(JSON.stringify(dropMenu)),
                    "linkInfo":{ //链接相关信息
                        "type":3, // 1 => 普通链接   2 => 扫码   3 => 下拉选项弹窗  4 => 拨打电话
                        "linkText":"", //显示的文字
                    }
                }]
            }

            if(btnArr.length == 0){
                btnArr.push({
                    "id":(new Date()).valueOf(),
                    "text": "",
                    "icon": "",
                    "link": "",  
                    "linkInfo":{ //链接相关信息
                        "type":1, // 1 => 普通链接   2 => 扫码   3 => 下拉选项弹窗  4 => 拨打电话
                        "linkText":"", //显示的文字
                    }
                })
            }
            that.searchColFormData.rtBtns.btns = btns.concat(btnArr)
            that.userChangeData = true
        },


        // 追加搜索推荐词词
        addSearchKey(type) {
            const that = this;
            if(!Array.isArray(that.searchColFormData.searchCon.keysArr)){
                that.searchColFormData.searchCon.keysArr = []
            }
            if (type === 0) {
                that.searchColFormData.searchCon.keysArr.unshift({
                    type:0,
                    key:'请输入关键词',
                })
            } else {
                that.searchColFormData.searchCon.keysArr.push({
                    type:1,
                    key:'',
                    link:'',  //有则跳转链接  无则 关键词搜索
                })
            
            }
            that.userChangeData = true
        },

        // 点击搜索框文本中的添加按钮
        trggleAddKey(){
            const that = this;
            let keysArr = that.searchColFormData.searchCon.keysArr;
            let hasPlace = 0; //  是否添加过占位
            let count = 0
            for(let i = 0; i < keysArr.length; i++){
                if(keysArr[i].type == 0){
                    hasPlace = 1
                    // break;
                }else{
                    count++;

                }
            }
            if(hasPlace){
                that.addSearchKey(1); //只能添加关键词
            }else if(count == 5){
                that.addSearchKey(0)
            }

        },


        // 色彩选择器颜色改变
        activeChangeColor(color,changeStr){
            const that = this;
            if(color){
                color = that.colorHex(color);
            }
            let str = changeStr
            let jsonArr = str.split('.');
            var obj = that;

            let oldVal = '';
            let newVal = color
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length -1)){
                    oldVal = jsonArr[i]
                    this.$set(obj, jsonArr[i], color); //是否是自定义
                }else{
                    obj = obj[jsonArr[i]]
                }
            }
            that.changeHistory(changeStr,newVal,oldVal);
            that.userChangeData = true
        },

        // 主要是设置清空/确定
        pickerChangeColor(color,changeStr){
            const that = this;
            if(!color){ //清空之后 color是null  需要 手动赋值
                color = ''
            }
            if(changeStr == 'pageSetFormData.style.bgColor' && !color){
                color = that.pageSetDefault.style.bgColor
            }

            let str = changeStr
            let jsonArr = str.split('.');
            var obj = that;

            let oldVal = '';
            let newVal = color
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length -1)){
                    oldVal = jsonArr[i]
                    this.$set(obj, jsonArr[i], color); //是否是自定义
                }else{
                    obj = obj[jsonArr[i]]
                }
            }
            that.userChangeData = true
        },


        // 验证是否是颜色色值
        changeColor(changeStr){
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
                // color = color + '000';
                let colorArr = color.split('');
                let newColor = []
                for(let i = 0; i < colorArr.length; i++){
                    newColor.push(colorArr[i] + color[i])
                }
                color = newColor.join('')
                break;
                case 4:
                color = color + '00';
                break;
                case 5:
                color = color + '0';
                break;
                
            }
            $(el).val(color);
            
            

            let str = changeStr
            // console.log(str)
            let jsonArr = str.split('.');
            var obj = that;
            let oldVal = '';
            let newVal = '#' + color
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length - 1)){
                    oldVal = jsonArr[i];
                    if(color){

                        this.$set(obj, jsonArr[i], '#' + color); //是否是自定义
                    }else{
                        this.$set(obj, jsonArr[i], '')
                    }
                    
                }else{
                    obj = obj[jsonArr[i]]
                }
            }
            that.changeHistory(changeStr,newVal,oldVal);
            that.userChangeData = true
        },

        // 重置颜色
        resetColor(changeStr,val,changeTo){ // 部分取色器清空也是触发该方法和重置是一个效果    val是空状态时 表示清空  changeTo表示要改变的颜色   
            const that = this;
            that.userChangeData = true
            if(!val){ //由于取色器是监听change方法 只要值改变都会触发 但实际只有清空按钮应该触发

                let strArr_c = changeStr.split('.');
                let strArr = changeStr.split('.');
                let defaultStr = strArr[0].replace('FormData','Default');
                strArr.splice(0,1,defaultStr);
                let obj = that;
                let obj_c = that
                for(let i = 0; i < strArr_c.length; i++){
                    if(i == (strArr_c.length -1)){
                        if(changeTo){
                            that.$set(obj, strArr[i], changeTo); 
                        }else{

                            that.$set(obj, strArr[i], obj_c[strArr[i]]);
                        }
                    }else{
                        obj = obj[strArr_c[i]];
                        obj_c = obj_c[strArr[i]];
                    }
                }
            }

        },


        // 删除搜索推荐词
        delSearchKey(ind){
            const that = this;
            that.searchColFormData.searchCon.keysArr.splice(ind,1)
            that.userChangeData = true
        },


        // 新增右上下拉选项按钮
        addDropLink(type,opt){ // opt => 操作类型   del => type 即为删除的按钮ind    add => type即为添加按钮类型
            const that = this;
            if(opt != 'del'){
                if(that.addScan){
                    that.$message({
                        message:'已经添加过扫一扫按钮了',
                        type: 'warning'
                    })
                }
                that.hasScanBtn = true;
                that.dropMenu.linkArr.push({
                    text: "",
                    icon: "",
                    link: "",  
                    linkInfo:{ //链接相关信息
                        type:type, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
                        // "selfSetTel":0, //是否是电话
                        linkText:type == 2 ? '扫码' : '', //显示的文字
                    }, 
                })

            }else{
                if(that.dropMenu.linkArr[type].linkInfo.type == 2){ //删除扫码按钮
                    that.hasScanBtn = false;
                }
                that.dropMenu.linkArr.splice(type,1); //删除链接
            }
            that.userChangeData = true
        },

        // 确认下拉菜单内容
        sureDropSet(){
            const that = this;
            let dropInd = that.searchColFormData.rtBtns.btns.findIndex(item => {
                return item.dropMenu && item.linkInfo.type == 3
            }); //找出下拉菜单
            that.searchColFormData.rtBtns.btns[dropInd].dropMenu = JSON.parse(JSON.stringify(that.dropMenu));  //给下拉菜单
            that.showDropMenuPop = false;  //隐藏弹窗
            that.userChangeData = true
        },

        // 左右移动
        checkLeft(ind,parObj){
            const that = this;
            if(parObj && parObj.length){
                let left = parObj.find('span').eq(ind).position().left
                that.offsetLeft = left + 2
                // console.log(parObj.find('span').eq(ind)[0]);
            }
        },

        // 新增轮播图
        addNewObj(obj){
            const that = this;
            that.swiperFormData.litpics.push({
                id:(new Date()).valueOf(),
                path:"", //图片路径
                link:"", //链接
                text:"", //标题
                linkInfo:{
                    type:"",
                    linkText:"",
                }
            })
            that.$nextTick(() => {
                setTimeout(() => {
                    that.initSwiper()
                }, 300);
            })

            that.userChangeData = true
            
        },

        // 删除轮播图
        delObj(ind){
            const that = this;
            that.swiperFormData.litpics.splice(ind,1);
            that.$nextTick(() => {
               setTimeout(() => {
                that.initSwiper()
               }, 300);
            })
            that.userChangeData = true
        },

        // 初始化轮播图
        initSwiper(item){
            const that = this;
            // console.log(that.currEditInd)
            item = item ? item : that.showContainerArr[that.currEditInd];
            let sid =  item.sid ;
            let data = item.content
            let val = data.styletype;
            let swiperImg = '';
            let swiperImgObj = JSON.parse(that.catchJsonErr(that.swiperImgObj)); //先赋值
            if(swiperImgObj[sid] && swiperImgObj[sid]['swiper'] != 'undefined'){   //有这个轮播图
                swiperImg = swiperImgObj[sid]['swiper']
            }else{  //没添加过 第一次添加
               
                let newObj = {
                    swiper:'',
                    swiperDotCurr:1,
                }

                that.$set(that.swiperImgObj,sid,newObj); //  因为需要动态监听swiperDotCurr    此处不可以直接赋值 否则无法监听
            }

            // || (data.litpics.length <= 1 && swiperImg)
            if(swiperImg && swiperImg.$el ){  //如果已存在，则1先销毁
                that.swiperImgObj[sid]['swiper'].destroy()
            }
            if(val == 4 ){  //风格1/4
                that.swiperImgObj[sid]['swiper'] = new Swiper(".swiperImgBox"+sid+" .swiper-container", {
                    // autoHeight:true,
                    // loop: true,
                    // autoplay:true,
                    navigation: {
                        nextEl: ".el-carousel__arrow--right",
                        prevEl: ".el-carousel__arrow--left",
                      },
                    observer:true,
                    observeParents:true,
                    on: {
                        slideChangeTransitionStart: function(){
                            if(that.swiperImgObj[sid]){
                                that.$delete(that.swiperImgObj[sid],'swiperDotCurr')
                                that.$set(that.swiperImgObj[sid],'swiperDotCurr',this.realIndex + 1); //重新赋值 
                            }
                        },
                    },
                });
            }else{ //风格2、3
                that.swiperImgObj[sid]['swiper'] = new Swiper(".swiperImgBox"+sid+" .swiper-container", {
                    // autoHeight:true,
                    slidesPerView: val == 1 ? 1.032 : 1.1,
                    centeredSlides: true,
                    navigation: {
                        nextEl: ".el-carousel__arrow--right",
                        prevEl: ".el-carousel__arrow--left",
                      },
                    // loopedSlides: 'auto',
                    // loop: true,
                    // autoplay:true,
                    observer:true,
                    observeParents:true,
                    on: {
                        slideChangeTransitionStart: function(){
                            if(that.swiperImgObj[sid]){
                                that.$delete(that.swiperImgObj[sid],'swiperDotCurr')
                                that.$set(that.swiperImgObj[sid],'swiperDotCurr',this.realIndex + 1); //重新赋值
                            }
                        },
                    },
                });
            }
        },

        catchJsonErr(rowData){
            var cache = [];
			var obj = JSON.stringify(rowData, function(key, value) {
			    if (typeof value === 'object' && value !== null) {
			        if (cache.indexOf(value) !== -1) {
			            return;
			        }
			        cache.push(value);
			    }
			    return value;
			});
			cache = null;
            return obj
        },



        // 获取所有模块数据
        getAllModules(){ 
            const that = this;
            let ind = linkListBox.findIndex(item => {
                return item.listName == '导航链接'
            })
            linkListBox.splice(ind,1)
            $.ajax({
                url: 'sitePageDiy.php?dopost=siteModuleList',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    let linkArr = []
                    let formData = data.map((item,ind) => {
                        linkArr.push({
                            link:item.link,
                            linkText:item.subject
                        })
                        return {
                            ...item,
                            weight:ind,
                        }
                    })
                    linkListBox.push({
                        list:linkArr,
                        listName:'导航链接'
                    })
                    that.allModules = formData.map(item => {

                        let nObj = {
                            ...item,
                            "lab":{
                                "show":false, //是否显示标签
                                "text":"", //标签
                                "style":{ //样式
                                    "bgColor":"#ff0000",
                                    "color":"#ffffff",
                                }
                            },
                        }
                        return nObj
                    })
                    that.originModules = formData; //原始导航数据  防止添加自定义之后不保存
                    that.checkHasModule(data)
                },
                error: function () { }
            });
        },

        // 分组
        arrToGroup(arr,num){ // arr => 要分组的数组   num  => 每一组的个数
            const that = this;
            let result = []; // =>分组结果
            if(!arr || !arr.length) return false;
            for(let i = 0 ; i < arr.length ; i += num){
                result.push(arr.slice(i,i+num))
            }
            return result; 
        },



        // 全选
        choseAllPlat(val,ind){  // val => 更新后的值   ind => 当前更改的值的索引
            const that = this;
            if(val){  //全选
                that.allModules[ind].bd = 1
                that.allModules[ind].wx = 1
                that.allModules[ind].dy = 1
                that.allModules[ind].h5 = 1
                that.allModules[ind].qm = 1
                that.allModules[ind].app = 0
            }else{ //取消
                that.allModules[ind].bd = 0
                that.allModules[ind].wx = 0
                that.allModules[ind].dy = 0
                that.allModules[ind].h5 = 0
                that.allModules[ind].qm = 0
                that.allModules[ind].app = 1
            }

        },

        // 添加自定义导航
        addNav(){
            const that = this;
            that.allModules.push({
                h5 : 1,
                id : 0,
                app : 0,
                bd : 0,
                dy : 0,
                qm : 0,
                wx : 0,
                icon : "",
                iconurl : "",
                link : "",
                name : "",
                subject : "",
                title : "",
                del:0,
                weight:that.allModules.length
            })
            that.$nextTick(() => {
                $(".modNavPopBox .nav_tableBox").scrollTop($(".modNavPopBox .nav_tableBox .nav_tbody").outerHeight())
            })
        },

        // 删除模块
        removeNav(ind){
            const that = this;
            if(that.allModules[ind]['id']){
                that.allModules[ind]['del'] = 1;
            }else{
                that.allModules.splice(ind,1)
            }
            that.$set(that.allModules,that.allModules)
        },

        // 取消保存
        getOriginModule(){
            const that = this;
            that.allModules = JSON.parse(JSON.stringify(that.originModules))
            that.modNavPop = false;
        },

        // 保存数据 => 导航数据
        saveNewModules(){
            const that = this;
            let newAllModule  = that.allModules.map((item,ind) => {
                item['weight'] = ind
                return item
            })
            let dataStr = 'data=' + JSON.stringify(newAllModule);
            $.ajax({
                url: 'sitePageDiy.php?dopost=siteModuleUpdate',
                type: "POST",
                data:dataStr, //传的数据
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.modNavPop = false;
                        // that.$message({
                        //     message:data.info,
                        //     type: 'success'
                        // })
                        that.getAllModules()
                    }
                },
                error: function () { }
            });
        },


        // 将加标签的导航按钮存入    ==> 此处为修改
        changeModuleShow(val,item,ind){  // val => 是否选中   item => 当前所选的模块  ind => item在所有模块的索引
            const that = this;

            // 空数组提交数据之后变为布尔类型  此处是为兼容
            if(!Array.isArray(that.sNavFormData.labsData) || !that.sNavFormData.labsData){
                that.sNavFormData.labsData = []
            }
            if(val){
                that.sNavFormData.labsData.push({
                    ...item,
                    "lab":{
                        // "show":false, //是否显示标签
                        "text":"", //标签
                        "style":{ //样式
                            "bgColor":"#ff0000",
                            "color":"#ffffff",
                        }
                    },
                })
            }else{
                let labInd = that.sNavFormData.labsData.findIndex(obj => {
                    return obj.id == item.id
                })
                that.sNavFormData.labsData.splice(labInd,1)
            }
            that.userChangeData = true
        },

        checkModuleShow(item,labData){
            const that = this;
            let hasLab = false;
            if(that.currEditPart == 5 && labData && Array.isArray(labData)){
                let ind = labData.findIndex(obj => {
                    return obj.id == item.id 
                })
                hasLab = ind > -1;
            }

            return hasLab

        },

        // 判断是否加过标签
        getLab(item,modCon){
            const that = this;
            let labObj = false;
            let labInd = -1;
            if(modCon && modCon.labsData && Array.isArray(modCon.labsData)){

                labInd = modCon.labsData.findIndex(obj => {
                   return obj.id == item.id
               })
               if(labInd > -1){
                   labObj = modCon.labsData[labInd]
               }
            }


            return labObj
        },


        // 添加新的按钮
        addNewTopBtns(obj){
            const that = this;
           if(obj == 'advLinksFormData'){
                that[obj].linksArr.push({
                    id:(new Date()).valueOf(),
                    link: '', //链接
                    img: '', //图片
                    text: '', //文字
                    desc: '', //描述
                    btnText: '', //按钮文字
                    linkInfo: {
                        type: '', //链接类型
                        linkText: '', //链接名称
                    },
                })
            }else  if(obj == 'topBtnsFormData' || obj == 'btnsFormData'){
                that[obj].btnsArr.push({
                        "id":(new Date()).valueOf(),
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
                })
            }else if(obj == 'msgFormData'){
                if(!that[obj].listArr || !Array.isArray(that[obj].listArr)){
                    that[obj].listArr = []
                }
                that[obj].listArr.push({
                    "id":(new Date()).valueOf(),
                    link:'', //链接
                    text:'', //内容
                    lab:'', //标签
                    linkInfo:{
                        text:'',
                        type:1, //链接  4 => 电话
                    }
                })
            }else if(obj == 'labelFormData'){
                that[obj].labsArr.push({
                    "id":(new Date()).valueOf(),
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
                    dataFormData: JSON.parse(JSON.stringify(listDefault)),  //数据设置
                    
                    children:[
                        {
                            "id":(new Date()).valueOf(),
                            title:'', //二级标题
                            dataFormData:JSON.parse(JSON.stringify(listDefault))
                        },
                    ]
                })
            }else if(obj == 'quanFormData'){
                that[obj].quanList.push({
                    id:(new Date()).valueOf(),
                    desc:'', //券描述
                    label:false, //是否有标签
                    labelText:'', //标签文字
                    link:'', //链接
                    linkInfo:{
                        text:'',
                        type:1
                    }
                })
            }

            that.userChangeData = true
        },


        // 删除按钮
        delTopBtns(obj,ind){
            const that = this;
            if(obj == 'advLinksFormData'){
                that[obj].linksArr.splice(ind,1); //删除按钮
            }else if(obj == 'topBtnsFormData' || obj == 'btnsFormData'){
                that[obj].btnsArr.splice(ind,1); //删除按钮
            }else if(obj == 'msgFormData'){
                that[obj].listArr.splice(ind,1); //删除按钮
            }else if(obj == 'labelFormData'){
                that[obj].labsArr.splice(ind,1); //删除按钮
            }else if(obj == 'quanFormData'){
                that[obj].quanList.splice(ind,1); //删除按钮
            }
            that.userChangeData = true
        },

        
        // 追加标签内容的二级标题
        addNewLab(pid,cid){
            const that = this;
            // that.labelFormData.labsArr[pid].children.push(
            //     {
            //         id:(new Date()).valueOf(),
            //         title:'', //二级标题
            //         dataFormData:listDefault 
            //     },
            // )
            that.showlabConPop(pid,that.labelFormData.labsArr[pid].children.length - 1,1)
            that.userChangeData = true
        },

        // 删除图片标题
        delTitlePath(ind,objStr){
            const that = this;
            let oldVal = 'image';
            let newVal = ''
            if(objStr){
                // that.quanFormData.title.image = ''
                // that.quanFormData.title.type = 'text'
                let jsonArr = objStr.split('.');
                var obj = that;
                for(let i = 0; i < jsonArr.length; i++){
                    if(i == (jsonArr.length -1)){
                        oldVal = jsonArr[i]
                        this.$set(obj, jsonArr[i], ''); //是否是自定义
                        if( jsonArr[i] == 'image'){
                            this.$set(obj, 'type', 'text'); //是否是自定义
                        }
                    }else{
                        obj = obj[jsonArr[i]]
                    }
                }

            }else{

                that.labelFormData.labsArr[ind].title.path = ''
                that.labelFormData.labsArr[ind].title.type = 'text'
            }

            that.userChangeData = true
        },


        // 删除标签的二级标题
        delLab(pid,cid){
            const that = this;
            that.labelFormData.labsArr[pid].children.splice(cid,1); //删除二级
            if(that.labelFormData.labsArr[pid].children.length > 0){
                that.labelFormData.slabelChose = (cid - 1 >= 0) ? (cid - 1) : 0;
                that.listFormData =   that.labelFormData.labsArr[pid].children[that.labelFormData.slabelChose].dataFormData;
            }else{
                that.labelFormData.slabelChose = 0;
                that.labelFormData.labsArr[pid].type = 1
                that.listFormData = that.labelFormData.labsArr[pid].dataFormData
            }
            that.userChangeData = true
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
            that.userChangeData = true
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
                // console.log(m,ind,key)
                $(".pcr-app.visible").removeClass('show'); //隐藏颜色选择
                switch (key){
                    case 'searchBg':
                        that.searchColFormData.style.bgImage = m.turl;
                        that.searchColFormData.bgType = 'image'
                        break;
                    case 'logo':
                        that.searchColFormData.logo.path = m.turl; //logo
                        break;
                    case 'rtBtns':
                        that.searchColFormData.rtBtns.btns[ind].icon = m.turl; //右上按钮
                        break;
                    case 'searchImg':
                        that.searchColFormData.searchImg.path = m.turl; //搜图图标
                        break;
                    case 'swiperImg':
                        that.swiperFormData.litpics[ind].path = m.turl; //轮播图
                        that.$nextTick(() => {
                            that.swiperUpdate()
                        })
                        break;
                    case 'btnsIcon':
                        // that.btnsFormData.btnsArr[ind].icon = m.turl; //普通按钮组
                        that.$set(that.btnsFormData.btnsArr[ind],'icon',m.turl)
                        break;
                    case 'titleFormData':
                        that.titleFormData.title.icon = m.turl; //分隔标题
                        break;
                    case 'wechatFormData': //右侧按钮图标
                        that.wechatFormData[ind]= m.turl
                        break;
                    case 'topIcon':
                        that.$set(that.topBtnsFormData.btnsArr[ind],'icon',m.turl);
                        break;
                    case 'advIcon':
                        that.advLinksFormData.linksArr[ind].img = m.turl; //展播广告图标按钮
                        break;
                    case 'nav':
                        that.allModules[ind].icon = m.url; //展播广告图标按钮
                        that.allModules[ind].iconurl = m.turl; //展播广告图标按钮
                        break;
                    case 'adv': //瓷片广告
                        that.advFormData.list[ind]['image']= m.turl
                        break;
                    case 'advLinksBg':
                        that.advLinksFormData.style.bg_image = m.turl; //展播广告图标按钮
                        that.advLinksFormData.bgType ='image'; //展播广告图标按钮
                        break;
                    case 'advLinksTitle':
                        that.advLinksFormData.title.type = 2;
                        that.advLinksFormData.title.img = m.turl; //展播广告图标按钮
                       
                        break;
                    case 'msgTitle':
                        that.msgFormData.title.type = 'image';
                        that.msgFormData.title.image = m.turl; //展播广告图标按钮
                       
                        break;
                    case 'lab':
                        // that.advLinksFormData.title.type = 2;
                        // that.advLinksFormData.title.img = m.turl; //展播广告图标按钮
                        that.labelFormData.labsArr[ind].title.type = 'image'
                        that.labelFormData.labsArr[ind].title.path = m.turl
                        break;
                    case 'listadv':
                        that.listFormData.dataObj.modCon.advList.list[ind].path = m.turl;
                        break;
                    case 'cartIcon': //加购图标
                        that.listFormData.dataObj.modCon.cartIcon.path = m.turl
                        break;

                    case 'quanTitle': //优惠券标题
                        that.quanFormData.title.type = 'image'
                        that.quanFormData.title.image = m.turl;
                        break;

                    case 'quanBg': //优惠券背景
                        that.quanFormData.bgType = 'image'
                        that.quanFormData.style.bgImage = m.turl;
                        that.getImageColor(m.turl)
                        break;
                    case 'qianggou': //抢购背景
                    case 'kanjia': //砍价背景
                    case 'miaosha': //秒杀背景
                    case 'pintuan': //拼团背景
                        if(!ind){  // 背景图
                            that[key + 'FormData'].bgType = 'image'
                            that[key + 'FormData'].style.bgImage = m.turl;
                        }else if(ind == 'title'){ //标题图片
                            that[key + 'FormData'][ind].type = 'image'
                            that[key + 'FormData'][ind].image =  m.turl;
                        }
                        break;
                    case 'busis':
                    case 'busis5':
                    case 'pros': //商品组
                    case 'pros5': //商品组
                        // key = key == 'pros5' ? 'pros' : key

                        key = key.indexOf('5') > -1 ? key.replace('5','') : key;
                        let currEdit = key == 'busis' ? that.currBusiEdit : that.currProEdit
                        if(!ind){
                            if(key == 'pros' || key == 'busis'){
                                that[key + 'FormData'].dataObj.modArr[currEdit].bgType = 'image';
                                that[key + 'FormData'].dataObj.modArr[currEdit].style.bgImage = m.turl;

                            }else{

                                that[key + 'FormData'].dataObj.bgType = 'image';
                                that[key + 'FormData'].dataObj.style.bgImage = m.turl;
                            }
                        }else{
                            that[key + 'FormData'].dataObj.modArr[currEdit].title.type = 'image';
                            that[key + 'FormData'].dataObj.modArr[currEdit].title.image = m.turl;
                            // if(that[key + 'FormData'].styletype == 1){
                            //     that[key + 'FormData'].dataObj.modArr[currEdit].title = 'image';
                            //     that[key + 'FormData'].dataObj.modArr[currEdit].title.image = m.turl;
                            // }else{
                            //     that[key + 'FormData'].dataObj.title.type = 'image';
                            //     that[key + 'FormData'].dataObj.title.image = m.turl;
                            // }
                        }
                        

                    break;

                    case 'dropMenu':
                        that['dropMenu'].linkArr[ind].icon = m.turl
                        break;
                    case 'pageSetFormData':
                        if(ind == 'logo' || ind == 'logo1'){
                            that.pageSetFormData.search.logo.path = m.turl;
                            that.pageSetFormData.search.rightBtns.logo.path = m.turl;
                        }else{
                            that.pageSetFormData.search.rightBtns.rbtns[ind].newIcon = m.turl;
                        }
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


        // hex转rgb
        hex2Rgb(hex)  {
            const str = hex.substring(1);
            let arr;
            if (str.length === 3) arr = str.split('').map(d => parseInt(d.repeat(2), 16));
            else arr = [parseInt(str.slice(0, 2), 16), parseInt(str.slice(2, 4), 16), parseInt(str.slice(4, 6), 16)];
            return `rgb(${arr.join(', ')})`;
        },


        // 计算样式
        getObjStyle(data,box,ind){  
            const that = this;
            let styleStrArr = [];
            // 头部背景色
            if(box == 'searchBg'){
                if(data.bgType == 'image'){
                    styleStrArr.push('background-image:url('+ data.style.bgImage +')')
                }else{
                    styleStrArr.push('background-color:' + data.style.bgColor)
                }
                styleStrArr.push('height:' + (data.style.bgHeight / 2) +  'px')
                if(data.bgMask == 3 || data.bgMask == 0){
                    styleStrArr.push('border-radius:0 0 ' + (data.style.borderRadius / 2) +  'px ' + (data.style.borderRadius / 2) +  'px')
                }
                
            }else if(box == 'searchBtn'){
                if(data.searchBtn.styletype == 1){ //样式1
                    styleStrArr.push('background:' + data.searchBtn.style.background)
                    styleStrArr.push('color:' + data.searchBtn.style.color)
                }else{
                    styleStrArr.push('color:' + data.searchBtn.style.background)
                }
                styleStrArr.push('height:' +( data.searchCon.style.height / 2 - 6) + 'px')
                styleStrArr.push('border-radius:' +( data.searchCon.style.height / 4 - 3) + 'px')
                // :style="'height:'+((searchColFormData.searchCon.style.height / 2) - 3)+'px;'"
            }else if(box == 'swiperImg'){
                if(data.styletype != 4){
                    if(data.styletype == 1){
                        // styleStrArr.push('margin:0 ' + 30 / 2 + 'px');
                    }else{
                        styleStrArr.push('margin:0 ' + 8 / 2 + 'px');
                    }
                    styleStrArr.push('height:' + (data.style.height / 2) + 'px');
                }else{
                    styleStrArr.push('height:' + (data.style.height / 2 + 40 ) + 'px');

                }
                // styleStrArr.push('border-radius:' + data.style.borderRadius/2 + 'px');
                styleStrArr.push('padding:' + (data.styletype == 2 ? (data.style.height > 200 ? 10 : 7) : 0) + 'px 0');
                //此处的type => 当前索引
            }else if(box == 'advLinks'){
                if(data.styletype == 1){
                    styleStrArr.push('border-radius:' + data.style.borderRadius/2 + 'px');
                    styleStrArr.push('background: linear-gradient(0deg, '+that.checkBgColor(data.style.bg_color ,'0')+' 5px, '+ data.style.bg_color + ' 100%) #fff');
                }else{
                    styleStrArr.push('border-radius:' + (data.style.borderRadius - 4)/2 + 'px');
                }
            }else if(box == 'advLinksCon'){  //展播
                if(data.styletype == 2){
                    styleStrArr.push('border-radius:' + data.style.borderRadius/2 + 'px');
                    styleStrArr.push('height:' + data.style.height / 2 + 'px');
                    if(data.bgType == 'image'){
                        styleStrArr.push('background-image:url('+ data.style.bg_image +') ');
                    }else{
                        styleStrArr.push('background-color:'+ data.style.bg_color +';');
                    }
                    styleStrArr.push('margin-right: '+data.style.marginLeft / 2+'px;margin-top:'+ data.style.marginTop /2  +'px');
                }
                styleStrArr.push('margin-left: '+data.style.marginLeft / 2+'px;margin-top:'+ data.style.marginTop /2 +'px');
            }else if(box == 'msglab'){ //消息通知 的标签
                styleStrArr.push('border-color:' + that.checkBgColor(data.style.labBorderColor,data.style.labBorderOpacity));
                styleStrArr.push('background-color:' + that.checkBgColor(data.style.labBgColor,data.style.labBgOpacity));
                styleStrArr.push('color:' + data.style.labColor);

            }else if(box == 'labStyle'){
                styleStrArr.push('color:' + that.checkBgColor(data.style.chose_stitle,data.style.chose_sOpacity));
                if(data.styletype == 1){
                    styleStrArr.push('background-color:' + that.checkBgColor(data.style.chose_title,data.style.chose_sOpacity));
                }
            }else if(box == 'labStyle1'){
                styleStrArr.push('color:' + that.checkBgColor(data.style.stitle,data.style.sOpacity));
            }else if(box == 'labSub'){
                styleStrArr.push('background-color:' + that.checkBgColor(data.style.sub_bgColor,data.style.chose_sub_bgOpacity));
            }else if(box == 'labSub1'){
                styleStrArr.push('background-color:' + that.checkBgColor(data.style.chose_sub_bgColor,data.style.chose_sub_bgOpacity));
            }else if(box == 'labMargin'){
                if(data.cardStyle){
                    
                    styleStrArr.push('background-color:' + data.style.cardBgColor);
                }else{
                    styleStrArr.push('background-color:' + data.style.bgColor);

                }
                styleStrArr.push('padding:0 0px ' + data.style.marginBottom / 2 + 'px');
                styleStrArr.push('margin-top:' + data.style.marginTop / 2 + 'px');
                // styleStrArr.push('padding-bottom:' + data.style.marginBottom / 2 + 'px');

            }else if(box == 'listMargin'){
                styleStrArr.push('padding:'+(data.style.marginTop / 2)+'px  0px 0px');
                if(data.cardStyle){
                    styleStrArr.push('padding:'+(data.style.marginTop / 2)+'px  0px');
                    styleStrArr.push('background-color:' +( data.style.cardBgColor ? data.style.cardBgColor :'transparent'));
                }else{
                    styleStrArr.push('background-color:' + data.style.bgColor);

                }

                // 列表样式时 圆角加在这里
                styleStrArr.push('border-radius:' + (data.style.borderRadius / 2) + 'px');
                styleStrArr.push('overflow:hidden');
                if(!data.cardStyle){
                }
            }else if(box == 'quanBox'){  //优惠券div盒子
                if(data.style.borderColor){
                    styleStrArr.push('border:solid 1px '+ data.style.borderColor )
                }

                if(data.bgType == 'image'){
                    styleStrArr.push('background-image:url('+ data.style.bgImage +')')
                }else{
                    styleStrArr.push('background-color:' + data.style.bgColor)
                }

                styleStrArr.push('border-radius:' +( data.style.borderRadius/2 )+ 'px')
                styleStrArr.push('margin:'+ (data.style.marginTop / 2) +'px ' + (data.style.marginLeft / 2) + 'px 0')
            }else if(box == 'quanMore'){
                const that = this;
                styleStrArr.push('color:'+ data.more.style.color)
                styleStrArr.push('background:'+ data.more.style.btnBg)
            }else if(box == 'quanBg'){
                let color = data.bgType == 'image' ? data.style.maskColor : data.style.bgColor
                let bgStart = that.checkBgColor(color,'0');
                styleStrArr.push(' background: linear-gradient(90deg, '+ bgStart +' 0%, '+ color +' 100%)')
            }else if(box == 'yxBoxBg'){
                // let color = data.bgType == 'image' ? 'url('+ data.style.bgImage +')' : data.style.bgColor
                // if(that.changeHeight(ind)){ //改变高度
                //   styleStrArr.push('min-height:'+(that.changeHeight(ind))+'px;')
                // }
                
                // styleStrArr.push(' background-'+  data.bgType  +':' + color); //背景
                if(data.bgStyle == 3){

                    styleStrArr.push(' border-radius:' + (data.style.borderRadius / 2) + 'px ') ; //圆角
                }else{

                    styleStrArr.push(' border-radius:' + (data.style.borderRadius / 2) + 'px') ; //圆角
                }
                
                if(data.styletype == 1){
                    if(that.checkHalfInd(ind) == 'leftHalf'){
                        // styleStrArr.push('margin: ' + data.style.marginTop/2 + 'px 0 0 ' + data.style.marginLeft/2 + 'px' )
                        styleStrArr.push('margin: 0 0 0 ' + data.style.marginLeft/2 + 'px' )
                    }else{
                        styleStrArr.push('margin: 0 ' + data.style.marginLeft/2 + 'px 0 0' )
                    }
                }else{
                    styleStrArr.push('margin: ' + data.style.marginTop/2 + 'px ' + data.style.marginLeft/2 + 'px 0' )
                }
            }else if(box == 'yx_header_bg'){ //背景
                let color = data.bgType == 'image' ? 'url('+ data.style.bgImage +')' : data.style.bgColor;
                styleStrArr.push(' background-'+  data.bgType  +':' + color); //背景
                styleStrArr.push(' border-radius:' + (data.style.borderRadius / 2) + 'px ' + (data.style.borderRadius / 2) + 'px 0 0') ; //圆角
            }else if(box == 'yxprice'){
                
                if((data.content.dataObj.price.styletype == 1 )  ){
                    
                    styleStrArr.push('color:'+ data.content.dataObj.price.style.color +';')
                }else if(data.content.dataObj.price.styletype == 3){
                    styleStrArr.push('color:#333;')
                }else {
                    
                    if((data.id == 18 || data.id == 17) && data.content.dataObj.price.styletype == 2 ){
                        styleStrArr.push('color:'+ data.content.dataObj.price.style.color +';')
                    }else{
                        styleStrArr.push('color:#fff;')
                    }
                }

                if(data.content.singleShow == 1 && data.content.dataObj.price.styletype == 1){
                    styleStrArr.push('font-size:15px')
                }

            }else if(box == 'yxpriceBtn'){
                if(data.content.dataObj.price.styletype > 1){
                    if((data.id == 17 || data.id == 18) && data.content.dataObj.price.styletype == 2){
                        styleStrArr.push('background-color:' +that.checkBgColor(data.content.dataObj.price.style.color,5))
                    }else if(data.content.dataObj.price.styletype != 1 && data.content.dataObj.price.styletype != 3){
                        styleStrArr.push('background-color:' + data.content.dataObj.price.style.color)
                    }
                }
            }else if(box == 'pros_wrapper' || box == 'busis_wrapper'){
                let currOn = 0
                styleStrArr.push('border-radius:' + (data.content.style.borderRadius /2) + 'px')
                styleStrArr.push('margin:'+ (data.content.style.marginTop /2) + 'px  0px 0')
                // if(data.styletype != 1){
                //     styleStrArr.push(data.content.dataObj.modArr[currOn].bgType == 'color'?'background:'+data.content.dataObj.modArr[currOn].style.bgColor+';':'background-image:url('+data.content.dataObj.modArr[currOn].style.bgImage+');')
                // }
            }else if(box == 'proImg'){
                ind = ind ? ind : 0
                let mod = data.content.dataObj.modArr[ind];
                if(data.content.styletype == 5){
                    let ww = 150,hh = 150
                    if(mod.imgScale == 3){
                        ww = 168,hh = 126
                    }
                    styleStrArr.push('width:'+(ww / 2)+'px;')
                    styleStrArr.push('height:'+(hh / 2)+'px;')
                }else if(data.content.styletype != 1){

                    if(mod.imgScale == 2){
                        styleStrArr.push('aspect-ratio: 1 / 1;')
                    }else if(mod.imgScale == 3){
                        styleStrArr.push('aspect-ratio: 4 / 3;')
                    }else if(mod.imgScale == 4){
                        styleStrArr.push('aspect-ratio: 3 / 2;')
                    }
                    if(data.content.styletype != 4){
                        styleStrArr.push('height:auto;')
                    }else{
                        styleStrArr.push('width:auto;')

                    }
                }
            }
            // else if(box == 'pros_wrapper'){
            //     styleStrArr.push('border-radius:' + (data.style.borderRadius /2) + 'px')
            //     styleStrArr.push('margin:'+ (data.content.dataObj.modArr[currOn].style.marginTop /2) + 'px ' + (data.content.style.marginLeft /2) + 'px 0')
            //     if(data.styletype != 1){
            //         styleStrArr.push(data.content.dataObj.modArr[currOn].bgType == 'color'?'background:'+data.content.dataObj.modArr[currOn].style.bgColor+';':'background-image:url('+data.content.dataObj.modArr[currOn].style.bgImage+');')
            //     }
            // }
            return styleStrArr.join(';')

        },

        // 计算走马灯的高度

        // <!-- modCon.content.styletype == 2 ? (mod.singleShow == 2 ?  '170px': '140px') : (mod.singleShow == 2 ?  '160px': '132px') -->
        countHeight(modCon,mod,modInd){
            const that = this;
            // let height = 158;
            // let add_h = 0
            // if(mod.interface.service == 'shop'){
            //     add_h = mod.proObj.saveShow ? 14 : 0
            //     if(modCon.content.styletype == 2){
            //         if(mod.singleShow == 3){
            //             height = 140 + add_h
            //         }
            //     }else{
            //         height = 160
            //         if(mod.singleShow == 3){
            //             height = 132 + add_h
            //         }
            //     }
            // }else if(mod.singleShow == 3){
            //     height = 150
            // }else if(mod.singleShow == 2){
            //     height = 178
            // }
            let ulHeight = $(".partBox[data-id='"+modInd+"']").find('.gridUl').outerHeight()
            let height = ulHeight ;
            return height + 'px'
        },

        // 获取图片主色
        getImageColor(imgUrl){
            const that = this;
            if(!imgUrl) return false;
            var img = new Image()
            var canvas = document.getElementById('canvas')
            var ctx = canvas.getContext('2d')
            img.onload = function() {
                canvas.width = img.width;		// 注意：没有单位
	            canvas.height = img.height;	// 注意：没有单位
                ctx.drawImage(img, 0, 0,img.width, img.height)
                img.style.display = 'none';
                var imgData = (ctx.getImageData(img.width - 100, 0,  100, img.height));
                let resImageObj = getMainColor(imgData.data);
                that.quanFormData.style.maskColor = resImageObj.hex;

            }
            img.src = imgUrl;
            img.crossOrigin = "anonymous"
        },

        // 轮播图高度改变
        swiperChange(val){
            const that = this;
            that.userChangeData = true
            that.$nextTick(() => {
                setTimeout(() => {
                    that.initSwiper()
                }, 300);
            })
        },
        // 轮播图更新
        swiperUpdate(){
            const that = this;
            let sid = that.showContainerArr[that.currEditInd].sid;
            let typename = that.showContainerArr[that.currEditInd].typename;
            that.userChangeData = true
            if(sid && typename == 'swiper' ){
                // that.$nextTick(() => {
                //     if(that.swiperImgObj[sid] && that.swiperImgObj[sid]['swiper']){
                //         that.swiperImgObj[sid]['swiper'].update()
                //     }else{
                //         that.initSwiper()
                //     }
                // })
            }
        },

        // 轮播图跳转
        slideChange(ind,sid){
            const that = this;
            that.$nextTick(() => {
                // console.log(that.swiperImgObj[sid]['swiper'])
                that.swiperImgObj[sid]['swiper'].slideTo(ind - 1);
                // that.$set(that.swiperImgObj[sid],'swiperDotCurr',ind)
            })
        },

        // 轮播图前后切换
        slideTo(sid,type){
            const that = this
            if(type == 'next'){
                that.swiperImgObj[sid]['swiper'].slideNext();
            }else{
                that.swiperImgObj[sid]['swiper'].slidePrev();
            }
        },


        // 更换组件风格时，部分样式需要重置
        styleChange(mod,val){  //mod => 表示组件名
            const that = this;

            switch(mod){
                case 'swiper':
                    let marginLeft = 0;
                    let marginTop = that.swiperFormData.style.marginTop;
                    if(val == 1){
                        marginLeft = 30
                    }else if(val == 2){
                        marginLeft = 8
                    }else if(val == 3){
                        marginLeft = 6
                    }else{
                        marginLeft = 0; 
                        marginTop = 0; 
                    }
                    that.swiperFormData.style.marginLeft = marginLeft; //重置marginLeft
                    that.swiperFormData.style.marginTop = marginTop; //重置marginTop
                break;


                case 'sNav':
                    that.sNavFormData.style.marginTop = that.sNavFormData.cardStyle ? 22 : 0; //卡片样式默认上间距
                    break;

                case 'search':
                    that.searchColFormData.style.bgHeight = val == 1 ? 300 : 400
            }
            that.userChangeData = true
        },


        // 是否有样式四的swiper  样式四swiper需要定在头部  如果有  则需要改变搜索框和顶部按钮的样式
        checkSwiperTop(){
            const that = this;
            let arr = that.showContainerArr;
            let topSwiper = false;  //是否有样式四的swiper
            for(let i = 0; i < arr.length; i++){
                if(arr[i].typename == 'swiper' && arr[i].content.styletype == 4){
                    topSwiper = true;
                    break;
                }
            }
            return topSwiper;
        },

        // 设置顶部按钮的样式
        topSetStyle(modCon){
            const that = this;
            let style = '';
            if(that.checkSwiperTop()){
                if(modCon  ){  //顶部
                    if(modCon.id == 2 || modCon.id == 3){
                        let searchH = $(".allShowCon  .searchConBox").outerHeight();
                        style = 'top:'+ searchH +'px; position:absolute; left:0; right:0; z-index:10;'
                    }
                }else {  //非顶部
                    let swiperObj = that.showContainerArr.find(item => {
                        return item.id == 4
                    })
                    let searchH = $(".allShowCon  .searchConBox").outerHeight();
                    let topBtnH = $(".topComp .topBtnsConBox").closest('.modConBox').height();
                    that.swiperFormData.style.height = (that.swiperFormData.style.height / 2 + 40) > (searchH + topBtnH)  ? that.swiperFormData.style.height : (((searchH - 40) + topBtnH) * 2 )
                    style='border-radius: '+(swiperObj.content.style.borderRadius / 2)+'px '+(swiperObj.content.style.borderRadius / 2)+'px  0 0; position:relative; z-index:1; background:'+ that.pageSetFormData.style.bgColor+';'
                }
            }
            return style
        },

        // 选择顶部按钮布局方式
        choseBtnLen(item){
            const that = this;
            that.topBtnsFormData.column = (item + 1)
            let fontArr = that.topBtnsFormData.column > 3 ? that.fontSizeArr : that.fontSizeArr1;
            let fontObj = fontArr[that.btnSizeInd];
            that.topBtnsFormData.style.fontSize = fontObj.size;
            if(that.topBtnsFormData.column <= 3){
                that.topBtnsFormData.style.marginLeft = 40  
            }else{
                that.topBtnsFormData.style.marginLeft = 30  
            }
            if(that.topBtnsFormData.column == 2){
                that.topBtnsFormData.style.fontSize = 30
            }else if(that.topBtnsFormData.column == 3){
                that.topBtnsFormData.style.fontSize = 28
            }else{
                that.topBtnsFormData.style.fontSize = 24
            }
            that.userChangeData = true
        },


        // 验证标签是否有二级内容
        checkChildLen(){
            const that = this;
            if(!that.labelFormData.labsArr) return [];
            let children = that.labelFormData.labsArr.filter(item => {
                return item.type == 2;
            })
            return children
        },
        

        // 获取label组件当前默认选中项的索引
        getLabChosed(){
            const that = this;
            let arr = that.labelFormData.labsArr;
            for(let i = 0; i < arr.length; i++){
                if(arr.default){
                    that.$set(that.labelFormData,'labelChose',i)
                    break;
                }
            }

        },


        // 显示label标签内容设置弹窗
        showlabConPop(pid,cid,add){  //pid表示已经 cid表示二级  add表示从最后一个直接追加
            const that = this;
            // if(that.listChosePop){  //新增 表示直接在弹窗中切换数据来源
            //     that.dataChosePop = true;
            //     return false;
            // }
            // if(that.currEditPart  != 28) return false;
            that.dataChosePop = true;
            that.currChosed_pid = pid;
            that.currChosed_cid = (cid >= 0 && typeof(cid) == 'number') ? cid : '';
            let more =  that.labelFormData.labsArr[that.currChosed_pid].type == 2; //是否是二级标题  二级标题可多选
            that.currChose_labArr = []; 
            if(more){
                that.currChose_labCon = JSON.parse(JSON.stringify(that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData.showObj));
                that.listFormData = JSON.parse(JSON.stringify(that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData)); //赋值列表数据
            }else{
                that.currChose_labCon = JSON.parse(JSON.stringify(that.labelFormData.labsArr[that.currChosed_pid].dataFormData.showObj));
                that.listFormData =  JSON.parse(JSON.stringify(that.labelFormData.labsArr[that.currChosed_pid].dataFormData));  //赋值列表数据
            }
            if(add){ 
                that.addDirect = true; 
            }
            if(that.currChose_labCon.service && !add){ //已经选过
                that.editSource = true; //处于编辑状态
                
            }else{
                that.editSource = false;  //第一次选择
            }
            that.userChangeData = true
        },

        // 选择标签内容
        choseShowObj(item,obj){
            const that = this;

            // if(that.listChosePop){

            //     that.currChose_labCon = item
            //     return false;
            // }



            let more =  that.labelFormData.labsArr[that.currChosed_pid].type == 2; //是否是二级标题  二级标题可多选
            that.userChangeData = true
            if(more ){
                if(!Array.isArray(that.currChose_labArr)){
                    that.currChose_labArr = [];
                }
                if(!that.editSource){
                    if(item){
                        let ind = that.currChose_labArr.findIndex(lab => {
                            return lab.id == item.id
                        })
                        if(ind > -1){
                            that.currChose_labArr.splice(ind,1)
                            that.currChose_labCon = {}
                        }else{
                            that.currChose_labArr.push(item)
                            that.currChose_labCon = item; //当前选中的对象
                        }
                    }else{ //全选
                        // that.currChose_labArr = new Set(that.currChose_labArr.concat(obj.list));
                        let currChosed = that.currChose_labArr
                        if(that.checkHasChoseAll(obj.list)){
                            that.currChose_labCon = {}
                            let idsArr = obj.list.map(item => {
                                return item.id
                            })
                            if(obj.name == '商城'){
                                let arr = obj.list.map(item => {
                                    return item.id <= 4
                                })
                                idsArr = arr.map(item => {
                                    return item.id
                                })
                            }
                            that.currChose_labArr = currChosed.filter(item => {
                                return !idsArr.includes(item.id)
                            })
                        }else{
                            let newArr = currChosed.concat(obj.list)
                            if(obj.name == '商城'){
                                let newlist = obj.list.filter(item => {
                                    return item.id <= 4
                                })
                                newArr = currChosed.concat(newlist)
                            }
                            that.currChose_labArr =  [...new Set(newArr)]
                        }
                        
                    }
                }else{
                    that.currChose_labArr = [item];
                    that.currChose_labCon = item; //当前选中的对象
                }
                
            }else{
                that.currChose_labCon = item; //当前选中的对象
            }
            
        },

        // 验证是否全选
        checkHasChoseAll(list){
            const that = this;
            // let allChoseArr = that.currChose_labArr.map(obj => {
            //     return obj.id
            // })

            let listId = list.map(obj => {
                return obj.id
            })
            if(list[0].service == 'shop'){
                let newList = list.filter(obj => {
                    return obj.id < 4
                })
                listId = newList.map(obj => {
                    return obj.id
                })
            }
            let listChoseObj = that.currChose_labArr.filter(obj => {
                return listId.includes(obj.id)
            })

            return listChoseObj && listId.length == listChoseObj.length
        },

        // 切换二级标题时，验证是否加载过数据
        checkHasLoad(){
            const that = this;
            that.$nextTick(() => {
                let currLabelChose = that.labelFormData.labelChose ?  that.labelFormData.labelChose : 0;
                let currSlabelChose = that.labelFormData.slabelChose ?  that.labelFormData.slabelChose : 0;
                that.listFormData = that.labelFormData.labsArr[currLabelChose].children[currSlabelChose].dataFormData;
                that.listFormData.currCInd = currSlabelChose;
                that.listFormData.currInd = currLabelChose;
                if(that.listFormData.listArr && that.listFormData.listArr.length == 0){
                    that.getDataList('',function(data){
                        if(data){
                            let idsArr = data.map(item =>{
                                return item.id
                            })
                            that.labelFormData.labsArr[currLabelChose].children[currSlabelChose].dataFormData.listArr = data;
                            that.labelFormData.labsArr[currLabelChose].children[currSlabelChose].dataFormData.listIdArr = idsArr;
                        }
                    })
                }
            })
        },

        // 确认选择
        confirmLabCon(){
            const that = this;
         
            // if(that.listChosePop){ // 弹窗里的数据来源修改
            //     that.dataChosePop = false;
            //     that.listPopData.showObj = JSON.parse(JSON.stringify(that.currChose_labCon));
            //     that.listPopData.orderArr = JSON.parse(JSON.stringify(window[that.currChose_labCon.service + 'FormData'].orderby));
            //     that.loadListPopData()
            //     return false;
            // }
            that.labelFormData.labsArr[that.currChosed_pid].dataFormData.currInd = that.currChosed_pid;
            that.labelFormData.labsArr[that.currChosed_pid].dataFormData.currCInd = that.currChosed_cid;
            // 添加数据源 需要切换至对应的列表
            that.labelFormData.labelChose = that.currChosed_pid
            that.labelFormData.slabelChose = that.currChosed_cid
            
            that.userChangeData = true; //发生改变
            let more =  that.labelFormData.labsArr[that.currChosed_pid].type == 2; //是否是二级标题  二级标题可多选
            let service = that.currChose_labCon['service'];
            let styletype = ['business','shop'].includes(service) ? 4 : 3;
            let cardStyle = ['business','shop','job','sfcar'].includes(service) ? true : false;
            if(more){ 
                if(!that.currChose_labArr || !Array.isArray(that.currChose_labArr) || that.currChose_labArr.length == 0){
                    // 表示没有改变之前选择的
                    that.dataChosePop = false;
                    return false
                }
                that.currChose_labCon = that.currChose_labArr[0];
                let arr = [];
                for(let i = 0; i <  that.currChose_labArr.length; i++){
                    // let currList = JSON.parse(JSON.stringify(that.listFormData))
                    let currList = JSON.parse(JSON.stringify(listDefault))
                    if(that.currEditInd != that.showContainerArr.length - 1){ //不是最后一个
                        currList.dataObj.totalCount = 4
                    }else{
                        currList.dataObj.totalCount = 10
                    }
                    let newObj = {};
                    for(let item in that.currChose_labArr[i] ){
                        if(['id','text'].includes(item)){
                            continue;
                        }
                        newObj[item] = that.currChose_labArr[i][item]
                    }
                    service = that.currChose_labArr[i].service;
                    styletype = ['business','shop'].includes(service) ? 4 : 3;
                    cardStyle = ['business','shop','job','sfcar'].includes(service) ? true : false; 
                    currList.showObj =   that.currChose_labArr[i];
                    currList.dataObj.modCon = JSON.parse(JSON.stringify(that[service + 'FormData']))
                    currList.dataObj.interface = that.extendObj(currList.dataObj.interface,newObj)
                    currList.dataObj['styletype'] = styletype;
                    currList.dataObj['cardStyle'] = cardStyle;
                    if(cardStyle){
                        currList.dataObj.style.cardBgColor = that.pageSetFormData.style.bgColor
                        currList.dataObj.style.splitMargin = 20
                        currList.more.style.btnHeight = 70
                    }else{
                        currList.more.style.btnHeight = ['shop','business'].includes(service) ? 70 : 88;
                        currList.dataObj.style.bgColor =  ['shop','business'].includes(service) ? '#ffffff' : that.pageSetFormData.style.bgColor;
                        currList.dataObj.style.splitMargin = 40
                    }
                    if(service == 'tieba'){
                        currList.dataObj.style.bgColor = that.pageSetFormData.style.bgColor
                        currList.dataObj.style.cardBgColor = that.pageSetFormData.style.bgColor
                    }
                    let txt_show = that.currChose_labArr[i].text;
                    switch(that.currChose_labArr[i].id){
                        case 1:
                            txt_show = '本地团购' 
                            break;
                        case 2:
                            txt_show = '好货推荐' 
                            break;
                        case 3:
                            txt_show = '到店优惠' 
                            break;
                        case 4:
                            txt_show = '同城配送' 
                            break;
                    }
                    arr.push(
                        {
                            id: new Date().valueOf() + '_' + i,
                            title:txt_show, //二级标题
                            dataFormData:JSON.parse(JSON.stringify(currList))
                        },
                    )
                }
                if(!that.editSource){  //添加状态
                    let children = that.labelFormData.labsArr[that.currChosed_pid].children;
                    if(!that.addDirect){  //非直接添加
                        children[that.currChosed_cid] = arr.shift();
                        let noData = []; // 没有添加数据来源 的
                        for(let i = 0; i < children.length; i++){
                            if(!children[i].dataFormData || !children[i].dataFormData.showObj || !children[i].dataFormData.showObj.service){
                                noData.push(i)
                            }
                        }
                        for(let i = 0; i < noData.length; i++){
                            let obj = arr.shift();
                            if(obj){
                                children[noData[i]] = obj
                            }
                        }
                    }else{
                        that.currChosed_cid = that.currChosed_cid + 1;
                        that.labelFormData.slabelChose = that.currChosed_cid
                    }
                    if(arr.length){
                        children =[...children,...arr]
                    }

                    that.$set(that.labelFormData.labsArr[that.currChosed_pid],'children',children) 
                    that.listFormData = that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData
                    // that.labelFormData.labsArr[that.currChosed_pid].children.splice(that.currChosed_cid,1); //清除
                    // let num = that.labelFormData.labsArr[that.currChosed_pid].children.length - that.currChosed_cid;
                    // that.labelFormData.labsArr[that.currChosed_pid].children.splice(that.currChosed_cid,num,...arr)



                }else{ //编辑状态
                    that.labelFormData.labsArr[that.currChosed_pid].children.splice(that.currChosed_cid,1,...arr)
                }
                service = that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData.showObj.service //查看当前的
                styletype = ['business','shop'].includes(service) ? 4 : 3;
                that.listFormData = that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData; //重新赋值
                that.listFormData.currInd = that.currChosed_pid;  //重新赋值选中的
                that.listFormData.currCInd = that.currChosed_cid;
            }else{
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.listArr = []; //清空列表数据  否则渲染会出错
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.listIdArr = []; 
              
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.showObj = JSON.parse(JSON.stringify(that.currChose_labCon))
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.modCon = JSON.parse(JSON.stringify(that[service + 'FormData']))
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj['styletype'] = styletype
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj['cardStyle'] = cardStyle
                if(that.currEditInd != that.showContainerArr.length - 1){ //不是最后一个
                     that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.totalCount = 4
                }else{
                     that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.totalCount = 10
                }
                if(cardStyle){
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.style.cardBgColor = that.pageSetFormData.style.bgColor
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.style.splitMargin = 20
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.more.style.btnHeight = 70
                }else{
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.style.bgColor = that.pageSetFormData.style.bgColor;
                    if(['business','shop'].includes(service)){
                        that.labelFormData.labsArr[that.currChosed_pid].dataFormData.more.style.btnHeight = 70
                    }else{
                        that.labelFormData.labsArr[that.currChosed_pid].dataFormData.more.style.btnHeight = 88
                    }
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.style.splitMargin = 40
                }
                if(service == 'tieba'){
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.dataObj.style.bgColor = that.pageSetFormData.style.bgColor
                }
                that.labelFormData.labsArr[that.currChosed_pid].dataFormData.showObj.service = service;
                that.listFormData =  that.labelFormData.labsArr[that.currChosed_pid].dataFormData
            }

            let newObj = {}
            for(let item in that.currChose_labCon ){
                if(['id','text'].includes(item)){
                    continue;
                }
                newObj[item] = that.currChose_labCon[item]
            }
            if(that.listFormData.currInd == that.currChosed_pid){
                // that.slabelChose = that.currChosed_cid;
                that.$set(that.labelFormData,'slabelChose',that.currChosed_cid)
                that.listFormData.currCInd = that.currChosed_cid
                that.listFormData['showObj'] = more ? that.labelFormData.labsArr[that.listFormData.currInd].children[that.listFormData.currCInd].dataFormData.showObj : that.labelFormData.labsArr[that.listFormData.currInd].dataFormData['showObj']
                that.listFormData['dataObj'] = more ? that.labelFormData.labsArr[that.listFormData.currInd].children[that.listFormData.currCInd].dataFormData['dataObj'] : that.labelFormData.labsArr[that.listFormData.currInd].dataFormData['dataObj']
                that.listFormData.dataObj.interface = newObj;
            }

           
            if(typeof(that.listFormData.currCInd) !== 'number'){
                that.labelFormData.labsArr[that.listFormData.currInd].dataFormData['showObj'] = JSON.parse(JSON.stringify(that.currChose_labCon))
                that.labelFormData.labsArr[that.listFormData.currInd].dataFormData.dataObj.interface = that.extendObj(that.labelFormData.labsArr[that.listFormData.currInd].dataFormData.dataObj.interface,newObj)
            }else{
                that.labelFormData.labsArr[that.listFormData.currInd].children[that.listFormData.currCInd].dataFormData['showObj'] = JSON.parse(JSON.stringify(that.currChose_labCon))
                that.labelFormData.labsArr[that.listFormData.currInd].children[that.listFormData.currCInd].dataFormData.dataObj.interface =  that.extendObj(that.labelFormData.labsArr[that.listFormData.currInd].children[that.listFormData.currCInd].dataFormData.dataObj.interface,newObj)
            }
            that.getDataList('',function(data){
                let idsArr = data.map(item => {
                    return item.id
                })
                if(more){
                    that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData.listArr = data;
                    that.labelFormData.labsArr[that.currChosed_pid].children[that.currChosed_cid].dataFormData.listIdArr = idsArr;
                    if(that.listFormData.currInd == that.currChosed_pid){
                        that.listFormData['dataObj'] = that.labelFormData.labsArr[that.listFormData.currInd].children[that.listFormData.currCInd].dataFormData.dataObj
                    }
                }else{
                    
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.listArr = data;
                    that.labelFormData.labsArr[that.currChosed_pid].dataFormData.listIdArr = idsArr;
                    if(that.listFormData.currInd == that.currChosed_pid){
                        that.listFormData['dataObj'] = that.labelFormData.labsArr[that.listFormData.currInd].dataFormData['dataObj']
                    }
                }

            });
            that.dataChosePop = false;
        },


        // 只加载弹窗里的 数据
        // loadListPopData(){
        //     const that = this;
        //     that.listPopData.currPage = 1;
        //     that.listPopData.service = that.currChose_labCon.service;
        //     that.listPopData.showChoseList = [];
        //     that.listPopData.showListArr = [];
        //     that.listPopData.totalCount = [];
        //     let dataArr = []
        //     for(let item in that.currChose_labCon){
        //         if(item != 'text' && item != 'id'){
        //             dataArr.push(item + '=' + that.currChose_labCon[item] )
        //         }
        //     }
            
        //     $.ajax({
        //         url: '/include/ajax.php?page='+ that.listPopData.currPage ,
        //         data: dataArr.join('&'),
        //         type: "POST",
        //         dataType: "json",
        //         success: function (data) {
                    
        //             if(data.state == 100){
        //                 that.listPopData.showListArr = data.info.list
        //                 that.listPopData.totalCount = data.info.pageInfo.totalCount
        //                 console.log(that.listPopData.showChoseList)
        //                 that.listShowData =  data.info.list; // 如果不是手动添加数据  则直接显示该数据
        //                 that.$forceUpdate()
        //             }

        //         },
        //         error: function(){
                    
        //         }
        //     });
        // },

        // 确认选择
        confirmTabCon(){
            const that = this;
            if(that.listPopData.popType == 1){// 如果是动态数据 排序获更改分类  展示的数据
                that.listPopData.chosedList = JSON.parse(JSON.stringify(that.listPopData.showList)); 
            }
            let currEditObj = that.moduleOptions.find(item => {
                return item.id == that.currEditPart;
            })
            if(that.currEditPart == 11 || that.currEditPart == 28){
                // 切换标题/数据列表
                that.listChosePop = false; //隐藏弹窗
                that.listFormData.listArr = JSON.parse(JSON.stringify(that.listPopData.chosedList)); //将选择的数据赋值
                that.listFormData.listIdArr = that.listPopData.chosedList.map(item => {
                    return item.id
                })
            }else if(that.currEditPart == 9 || that.currEditPart == 10){
                // 商品组/商家组
                let ind = that.currEditPart == 9 ? that.currProEdit : that.currBusiEdit;
                that[currEditObj.typename + 'FormData'].dataObj.modArr[ind].listArr = JSON.parse(JSON.stringify(that.listPopData.chosedList)); //将选择的数据赋值
                that[currEditObj.typename + 'FormData'].dataObj.modArr[ind].listIdArr = that.listPopData.chosedList.map(item => {
                    return item.id
                })

            }else{ //其他数据赋值
                that[currEditObj.typename + 'FormData'].listArr = JSON.parse(JSON.stringify(that.listPopData.chosedList)); //将选择的数据赋值
                 that[currEditObj.typename + 'FormData'].listIdArr = that.listPopData.chosedList.map(item => {
                    return item.id
                })
            }
            that.listChosePop = false; //隐藏弹窗
            that.userChangeData = true; //发生改变
        },

        // 双列和瀑布流切换是否可行
        setFlow(){
            const that = this;

            let lastObj = that.showContainerArr[that.showContainerArr.length - 1]
            if(lastObj.id != 11 || (that.currEditInd != that.showContainerArr.length - 1)){
                that.$message({
                    message:'当前布局不可设置',
                    type: 'error'
                })
            }else{
                that.listFormData.dataObj.styletype = 4
            }
            if(that.listFormData.dataObj.styletype == 4 && that.listFormData.more.show){
                that.listFormData.more.show = false;
            }
        },


        // 合并对象
        extendObj(d1,d2){
            const that = this;
            for(let item in d2){
                d1[item] = d2[item]
            }
            return d1
        },

        checkChoseArrIn(){
            const that = this;
            let idArr = []
            if(Array.isArray(that.currChose_labArr) && that.currChose_labArr.length){
                idArr = that.currChose_labArr.map(item => {
                    return item.id
                })
            }else{
                idArr = that.currChose_labCon.id ? [that.currChose_labCon.id] : []
            }
            return idArr
        },


        // 获取模块分类
        getModuleType(mod){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service='+ mod +'&action=type',
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that[mod + '_type'] = data.info;
                    }
                },
                error: function(){}
            });
        },

        // 页码变更
        pageChage(val){
            const that = this;
            that.listPopData.currPage = val;
            that.getDataList()
        },

        // 商城获取抢购场次
        getConfigtime(ind){  // ind => 表示直接数据加载 索引
            const that = this;
            that.$set(that.loadEnd,'qianggouFormData',false)
            $.ajax({
                url: '/include/ajax.php?service=shop&action=getConfigtime&gettype=1',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        var list = data.info, now = data.info.now, nowTime = data.info.nowTime;
                        let hasGetTime = false
                        if(list.length > 0){
                            
                            for(let i = 0; i < list.length; i++){
                                if(list[i].now >= list[i].ktimestr && list[i].now <= list[i].etimestr){//已开抢
                                    that.qianggouFormData.dataObj.interface['changci'] = list[i].changci;
                                    
                                    hasGetTime = true; //表示获取到场次
                                    that.$nextTick(()=>{
                                        that.$set(that.loadEnd,'qianggouFormData',true)
                                        that.getDataList('qianggouFormData',function(dlist,dinfo){
                                            that.$set(that.loadEnd,'qianggouFormData',true)
                                            that.qianggouFormData.listArr = dlist
                                            let idsArr = dlist.map(item => {
                                                return item.id
                                            })
                                            that.qianggouFormData['listIdArr'] = idsArr
                                            that.qianggouFormData.cutDownTime = list[i]
                                            that.qianggouFormData.listShow = dlist
    
                                            if(ind != undefined){
                                                that.showContainerArr[ind].content.listArr = dlist
                                                that.showContainerArr[ind].content.listIdArr = idsArr
                                                that.showContainerArr[ind].content.listArrShow = dlist
                                                that.showContainerArr[ind].content.totalCount = dinfo.pageInfo.totalCount
                                                that.showContainerArr[ind].content.cutDownTime = list[i]
                                            }
                                            
                                            that.curDownText(list[i],ind)
                                            that.$nextTick(() => {
                                                that.checkShopMarketHeight();
                                            })
                                        }); //获取数据
                                    })
                                    break;
                                }
                            }

                            if(!hasGetTime){ //表示没有获取到对应信息
                                that.showContainerArr[ind].content.cutDownTimeToText = list[0].title
                            }
            
            
                        }
                    }
                    that.$nextTick(() => {
                            that.checkShopMarketHeight(ind)
                    })
                },
                error: function () { }
            });
        },

        // 倒计时
        curDownText(obj,ind){
            const that = this;
            // console.log(obj)
            var time = obj.etimestr - obj.now;
            if(ind == undefined){
                ind = that.currEditInd
            }
            // 清除已经存在的定时器
            if( that.countDownArr[that.showContainerArr[ind].sid]  || time == 0){
                clearInterval(that.countDownArr[that.showContainerArr[ind].sid])
            }
            var hour = parseInt(time/ 60 / 60 % 24);
            var minute = parseInt(time/ 60 % 60);
            var seconds = parseInt(time% 60);
            that.showContainerArr[ind].content.cutDownTimeToText = [hour < 10 ? '0' + hour : hour,minute < 10 ? '0' + minute : minute,seconds < 10 ? '0' + seconds : seconds];

            // 倒计时 时间戳
            that.countDownArr[that.showContainerArr[ind].sid] = setInterval(function () {
                if(time <= 0) {
                    clearInterval(that.countDownArr[that.showContainerArr[ind].sid]);
                    // 此处需要重新请求一次限时抢购的数据
                    that.getConfigtime()
                }
                var hour = parseInt(time/ 60 / 60 % 24);
                var minute = parseInt(time/ 60 % 60);
                var seconds = parseInt(time% 60);
                that.showContainerArr[ind].content.cutDownTimeToText = [hour < 10 ? '0' + hour : hour,minute < 10 ? '0' + minute : minute,seconds < 10 ? '0' + seconds : seconds];
                time--;
            }, 1000);


        },

        // 重新倒计时
        reCutDown(newIndex){
            const that = this;
            for(let i = 0; i < that.showContainerArr.length; i++){
                let objCon = that.showContainerArr[i];
                if(objCon.typename != 'qianggou' ||  !objCon.content.cutDownTime) continue;
                that.curDownText(objCon.content.cutDownTime,i)
            }
        },

        // 获取数据列表
        getDataList(formDta,callback){
            const that = this;
            let defaultForm = '';
            that.$set(that.loadEnd,formDta,false); //加载中
            if(that.currEditPart == 11 || that.currEditPart == 28){
                defaultForm = 'listFormData'
            }else{
                let obj = that.moduleOptions.find(item => {
                    return item.id == that.currEditPart
                })
                if(obj){

                    defaultForm = obj.typename + 'FormData'
                }
            }
            formDta = formDta ? formDta : defaultForm
            let dataArr = []
            let paramArr = Object.keys(that.listPopData.paramObj); //筛选
            let newObjArr = []
            let interfaceStr;  //原来的参数
            if(formDta == 'prosFormData' || formDta == 'busisFormData'){
                let ind = formDta == 'busisFormData' ? that.currBusiEdit : that.currProEdit
                interfaceStr = that[formDta].styletype == 1 ? that[formDta].dataObj.modArr[ind].interface : that[formDta].dataObj.modArr[ind].interface;
                interfaceStr['pageSize'] = that.listChosePop ? that.listPopData.pageSize : 12;
                // interfaceStr['pageSize'] = that.listChosePop ? that.listPopData.pageSize : that[formDta].dataObj.modArr[ind].listCount;
            }else if(formDta == 'lableFormData'){

            }else{
                interfaceStr = that[formDta].dataObj.interface//原来的参数
                interfaceStr['pageSize'] = that.listPopData.pageSize
            }
            for(let item in interfaceStr){
                let val = interfaceStr[item]
                if(paramArr.includes(item) > -1 && (that.listPopData.paramObj[item] || (that.listPopData.paramObj[item]  == '' && item == 'orderby' && that.listPopData.paramObj['service'] == interfaceStr['service']  ))){
                    newObjArr.push({
                        [item]:that.listPopData.paramObj[item]
                    })
                    val = that.listPopData.paramObj[item]
                }

                dataArr.push(item + '=' + val)
            }

            


            // 手动添加数据 == 关键字搜索
            if(that.listChosePop && that.listPopData.paramObj['keywords'] && that.listPopData.popType != 1){
                dataArr.push('keywords=' + that.listPopData.paramObj['keywords'])
                dataArr.push('keyword=' + that.listPopData.paramObj['keywords'])
            }
            // +'&pageSize=' + that.listPopData.pageSize
            $.ajax({
                url: '/include/ajax.php?page='+ that.listPopData.currPage ,
                data: dataArr.join('&'),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    
                    if(data.state == 100){
                        that.listPopData.showListArr = data.info.list
                        that.listPopData.totalCount = data.info.pageInfo.totalCount
                        that.listShowData =  data.info.list; // 如果不是手动添加数据  则直接显示该数据
                        that.$set(that.loadEnd,formDta,true); //加载中
                        if(callback){ //回调
                            callback(data.info.list,data.info)




                            
                        }
                    }

                    that.$nextTick(() => {
                        that.$set(that.loadEnd,formDta,true); //加载中
                    })
                },
                error: function(){
                    that.$nextTick(() => {
                        that.$set(that.loadEnd,formDta,true); //加载中
                    })
                }
            });
        },

        // 直接获取数据
        directGetList(interfaceStr,addType,callback,failBack){
           const that = this;
            $.ajax({
                url: '/include/ajax.php?page=1',
                data: interfaceStr,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        if(callback){ //回调
                            callback(data.info.list,data.info)
                        }
                    }else{
                        if(failBack){
                            failBack(data)
                        }
                    }
                },
                error: function(){}
            });
        },

        // 相关参数改变  重新获取数据
        reGetData(formData){
            const that = this;
            that.getDataList(formData,function(list,dinfo){
                if(list && list.length){
                    let idsArr = list.map(item => {
                        return item.id
                    })
                    if(formData == 'prosFormData' || formData == 'busisFormData'){
                        let ind = formData == 'prosFormData' ? that.currProEdit : that.currBusiEdit
                        that[formData].dataObj.modArr[ind].listArr = list
                        that[formData].dataObj.modArr[ind].listIdArr = idsArr
                        that[formData].dataObj.modArr[ind].totalCount = dinfo.pageInfo.totalCount
                    }else{
                        that[formData].listArr = list;
                        that[formData].listIdArr = idsArr;
                        that[formData].listIdArr.totalCount = dinfo.pageInfo.totalCount
                    }
                }
            })
        },

        // 分类改变 触发 重载数据
        typeChange(param,value){ // param => 要改变的    value => 改变之后的值
            const that = this;
            if(param == 'msgFormData'){
                if( that.msgFormData.articleTypeArr &&  that.msgFormData.articleTypeArr.length){
                    that.msgFormData.articleType = that.msgFormData.articleTypeArr[that.msgFormData.articleTypeArr.length - 1]
                }else{
                    that.msgFormData.articleType = ''
                }
                that.showContainerArr[that.currEditInd].content.articleType = that.msgFormData.articleTypeArr[that.msgFormData.articleTypeArr.length - 1]
                that.getInfoMation(that.showContainerArr[that.currEditInd],that.currEditInd);  //获取资讯

                // that.$refs.msgType.getCheckedNodes()
                return false;
            }else if(param == 'msgPopData'){ //弹窗获取消息
                if(that.msgPopData.typeidArr && that.msgPopData.typeidArr.length){
                    that.msgPopData.typeid =  that.msgPopData.typeidArr[that.msgPopData.typeidArr.length - 1]
                }else{
                    that.msgPopData.typeid = ''
                }
                that.getInfoMation();  //获取资讯
                return false
            }else if(param == 'prosFormData' || param == 'busisFormData'){
                let ind = param == 'prosFormData' ? that.currProEdit : that.currBusiEdit
                that[param].dataObj.modArr[ind].interface.typeid = value[value.length - 1]
            }
            that.userChangeData = true; //发生改变
            that.reGetData(param)
        },



        // 手动选择展示的数据  === > 显示弹窗
        showChosePop(type,formDta){  // type => 显示的是哪种类型的数据
            const that = this;
            let formData = formDta ? formDta : 'listFormData'
            that.userChangeData = true; //发生改变
            that.listChosePop = true;
            that.listPopData.popType = type; 
            that.listPopData.pageSize = 10, // 数据单页显示的数目
            that.listPopData.currPage = 1,
            that.listPopData.totalCount = 0, //数据条数
            that.listPopData.showListArr = []; //数据列表的数组 
            if(formData == 'listFormData'){
                console.log(that.listFormData)
                that.listPopData.showObj = JSON.parse(JSON.stringify(that.listFormData.showObj)); //数据列表的数组 
                that.listPopData.orderArr = that.listFormData.dataObj.modCon.orderby ? JSON.parse(JSON.stringify(that.listFormData.dataObj.modCon.orderby)) : []; //数据列表的数组 
                that.listPopData.chosedList = that.listFormData.dataObj.listArr;
            }
            if(formData != 'prosFormData' &&  formData != 'busisFormData'  ){
                that.listPopData.paramObj.orderby = that[formData].dataObj.interface.orderby
                that.listPopData.chosedList = JSON.parse(JSON.stringify(that[formData].listArr))
                that.listPopData.service = that[formData].dataObj.interface.service
                that.listPopData.typeid = that[formData].dataObj.interface.typeid
                that.listPopData.typeArr = that[formData].dataObj.interface.typeArr
            }else{
                let currInd = formData != 'busisFormData' ? that.currProEdit : that.currBusiEdit
                that.listPopData.paramObj.orderby = that[formData].dataObj.modArr[currInd].interface.orderby
                that.listPopData.chosedList = JSON.parse(JSON.stringify(that[formData].dataObj.modArr[currInd].listArr))
                that.listPopData.service =  that[formData].dataObj.modArr[currInd].interface.service
                that.listPopData.typeid = that[formData].dataObj.modArr[currInd].interface.typeid
                that.listPopData.typeArr = that[formData].dataObj.modArr[currInd].interface.typeArr
            }
            if(formDta == 'qianggouFormData'){
                that.getConfigtime()
            }else{
                that.getDataList(formDta)
            }
        },

        // 验证数据是否选中
        checkChosed(id,arr){
            const that = this;
            let index = arr.findIndex(item => {
                return item.id == id
            });

            return index > -1; 
        },

        // 选择数据
        choseListData(d){  // d => 当前选择的数据
            const that = this;
            let id = d.id;
            if(!that.listChange){

                let limit = that.countLimit(that.currEditPart)
                let ind = that.listPopData.chosedList.findIndex(item =>{
                    return item.id == id;
                })
    
                if(ind > -1){
                    that.listPopData.chosedList.splice(ind,1)
                }else{
                    if(that.listPopData.chosedList.length >= limit){ //不能再选更多了
                        that.$message({
                            message: '最多只能选择' + limit + '条数据',
                            type: 'warning'
                        });
                        return false
                    }
                    that.listPopData.chosedList.push(d)
                }
                that.userChangeData = true; //发生改变
            }else{
                let ind = that.listPopData.chosedList.findIndex(item =>{
                    return item.id == that.listChange;
                })
                that.listPopData.chosedList.splice(ind,1,d)
                that.listChange = d.id;

            }
        },

        // 计算最多选择的数目
        countLimit(id){
            const that = this;
            let limit = 10; //限制最多选择50条数据
            let obj = that.showContainerArr[that.currEditInd]
            if([16,17,18,19].includes(id) && obj.styletype == 1){
                limit = 12
            }else if(id == 11 || id == 28){
                limit = 50
                if(that.currEditInd < that.showContainerArr.length - 1){
                    limit = 16
                }
            }

            return limit;
        },

        // 验证输入是否符合限制
        checkLimit(val,limit){
            const that = this;
            if(val > limit){
                that.listFormData.dataObj.totalCount = limit
            }
        },

        // 全选数值
        choseAllList(){
            const that = this;
            let showIds = that.listPopData.showListArr.map(item => {
                return item.id
            });
            let choseIds = that.listPopData.chosedList.map(item => {
                return item.id
            }); //已选中id

            let notObjArr = that.listPopData.showListArr.filter(item => {
                return !choseIds.includes(item.id) 
            });  //未选中
            

            if(notObjArr.length == 0){ //已全选， 需要将当前页所有数据删除
                let arr = that.listPopData.chosedList.filter(item => {
                    return !showIds.includes(item.id)
                })
                that.listPopData.chosedList = arr
            }else{
                that.listPopData.chosedList = that.listPopData.chosedList.concat(notObjArr)
            }
            that.userChangeData = true; //发生改变

        },
        // 手动筛选数据  关键字搜索
        toSearchList(){
            const that = this;
            that.listPopData.pageSize = 10, // 数据单页显示的数目
            that.listPopData.currPage = 1,
            that.listPopData.totalCount = 0, //数据条数
            that.listPopData.showListArr = []; //数据列表的数组 
            this.getDataList()
        },

        // 验证是否全选
        checkAllChose(){
            const that = this;
            let hasAllChose = false;
            let showIds = that.listPopData.showListArr.map(item => {
                return item.id
            });
            let hasInObjArr = that.listPopData.chosedList.filter(item => {
                return showIds.includes(item.id) 
            });
            if(hasInObjArr.length == showIds.length){ // 已全选
                hasAllChose = true
            }
            // that.listPopData.hasAllChosed = hasAllChose;
            return hasAllChose;
        },

        // 排序改变
        changeOrder(val,formData){
            const that = this;
            that.listPopData.paramObj.orderby = val;
            // that.listPopData.pageSize = 10, // 数据单页显示的数目
            that.listPopData.currPage = 1,
            that.listPopData.totalCount = 0, //数据条数
            that.listPopData.showListArr = []; //数据列表的数组 
            formData = formData ? formData : ''
            this.getDataList('',function(data,dinfo){
                if(formData == 'listFormData'){
                    that.$set(that[formData],'listArr',data)
                }else if(formData == 'busisFormData' || formData == 'prosFormData'){
                    let ind = that.currProEdit
                    if(formData == 'busisFormData'){
                        ind = that.currBusiEdit
                    }
                    that.$set(that[formData].dataObj.modArr[ind],'listArr',data)
                    that.$set(that[formData].dataObj.modArr[ind],'totalCount',dinfo.pageInfo.totalCount)
                }
            })
        },


        // 多选框值的变化
        checkBoxChange(value,nval,str){
            const that = this;
            that.listFormData.dataObj.modCon.cartIcon.cartStyle = nval
        },


        changeEditlabel(modInd,pid,sid){ //修改正在编辑的label值
            const that = this;
            // isNaN(modInd)
            if(modInd && !isNaN(modInd) || modInd != ''){
                that.toEditPart(that.showContainerArr[modInd],modInd)
            }
            if(that.labelFormData.labelChose == pid && sid == undefined) return false;
            // console.log('类型：' +that.labelFormData.labsArr[pid].type)
            if(that.labelFormData.labsArr[pid].type == 3){ //表示当前要编辑的是个链接  不是列表
                // 当前暂定不能点击切换
                return false;
            }

            that.$set(that.labelFormData,'labelChose',pid)
            if(that.labelFormData.labsArr[pid].type == 2){
                if(sid == undefined){
                    sid = 0
                }else{
                    that.labelFormData.slabelChose = 0
                }
            }
            if(typeof(sid) == 'number' && that.labelFormData.labsArr[pid].type == 2){
                that.$set(that.labelFormData,'slabelChose',sid) 
                that.listFormData = that.labelFormData.labsArr[pid].children[sid].dataFormData
                that.listFormData.currCInd = sid;
                that.checkHasLoad()
            }else{
                that.listFormData = that.labelFormData.labsArr[pid].dataFormData
                that.listFormData.currCInd = '';
            }
            that.listFormData.currInd = pid;
            that.userChangeData = true; //发生改变
        },


       

        // 新增按钮
        addMoreBtn(type){
            const that = this;
            if(type == 'adv'){
                if(!that.advFormData.list){
                    that.advFormData.list = []
                }
                that.advFormData.list.push({
                    image:'',
                    link:'',
                    linkInfo:{
                        linkText:'',
                        selfSetTel:0
                    },
                })
            }else if(type == 'pageBtns'){
                if(!that.pageSetFormData.btns.list){
                    that.pageSetFormData.btns.list = []
                }
                that.pageSetFormData.btns.list.push({
                    icon:'',
                    link:'',
                    linkInfo:{
                        linkText:'',
                        selfSetTel:0
                    },
                })
            }else if(type == 'listadv'){
                if(!that.listFormData.dataObj.modCon.advList.list){
                    that.listFormData.dataObj.modCon.advList.list = []
                }
                that.listFormData.dataObj.modCon.advList.list.push({
                    id:(new Date()).valueOf(),
                    path:'',
                    link:'',
                    linkInfo:{
                        linkText:'',
                        selfSetTel:0
                    },
                })
            }
            that.userChangeData = true; //发生改变
        },

        

          // 验证是否超过最大/最小值
        checkMax(min,max,paramStr){ // check表示验证大小 check为false表示不验证
            const that = this;
            let el = event.currentTarget;
            let val = $(el).val();
            if(val && Number(val) > max){
                val = max
            }
            if(val && Number(val) < min){
                val = min
            }
            let str = paramStr
            let jsonArr = str.split('.');
            var obj = that;

            let newVal = Number(val ? val : 0)
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length -1)){
                    oldVal = jsonArr[i]
                    this.$set(obj, jsonArr[i], Number(newVal)); //是否是自定义
                }else{
                    obj = obj[jsonArr[i]]
                }
            }

        },

        // 排序 单独设置
        sortObj:function(obj){
            const that = this;
            that.$nextTick(() => {
                let sortEl = $(obj)[0];
                let sortKey = $(obj).attr('data-sort') ? $(obj).attr('data-sort') : '';
                let dragEl = $(obj).attr('data-drag') ? $(obj).attr('data-drag') : '';
                let filterEl = $(obj).attr('data-filter') ? $(obj).attr('data-filter') : '';
                if(that.allSortObj[sortKey]) return false;
                that.allSortObj[sortKey] = Sortable.create(sortEl,{
                    animate: 150,
                    ghostClass:'placeholder',
                    draggable:dragEl,
                    filter:filterEl,
                    preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                    onEnd: function(evt){
                        let arr = this.toArray()
                        let arrNew = arr.map(item => {
                            return JSON.parse(item)
                        })

                        let jsonArr = sortKey.split('.');
                        let newThat = that;
                        for(let i = 0; i < jsonArr.length; i++){
                            newThat = newThat[jsonArr[i]]   ; //原始数组
                        }
                        let newArr = [];
                        for(let m = 0; m < arrNew.length; m++){
                            newArr.push(newThat[arrNew[m]])
                        }
                       
                        that.$nextTick(() => {
                            that.changeModuleOrder(sortEl,newArr,evt.newIndex)
                            if(sortKey == 'showContainerArr'){
                                that.countHalfPart()
                            }
                        })

                        that.userChangeData = true; //发生改变
                    }
                })
            })
        },

        // 遍历二级标题 并排序
        getLabStitle(){
            const that = this;
            that.$nextTick(() => {
                
                $(".linksConBox .item .sortUl").each(function(){
                    const el = $(this)[0]
                    that.sortObj(el)
                })
            })
        },

        // 赋值 arrNew
        changeModuleOrder(obj,arrNew,newIndex){  //newIndex  新的索引
            const that = this;
            let newThat = that;
            let sortKey = $(obj).attr('data-sort') ? $(obj).attr('data-sort') : '';

            let oldVal = '';
            let newVal = arrNew
            let jsonArr = sortKey.split('.');
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length - 1)){
                    oldVal = jsonArr[i]
                    this.$set(newThat, jsonArr[i],  JSON.parse(JSON.stringify(newVal))); //是否是自定义
                    console.log(newVal)
                }else{
                    newThat = newThat[jsonArr[i]]
                }
            }
           
            that.changeHistory(sortKey,newVal,oldVal);
            setTimeout(() => {
                that.checkShopMarketHeight(newIndex); //重新计算1/2组件高度
                // 重新倒计时
                that.reCutDown(newIndex)
            }, 500);
        },


        // 验证列表是否有数据
        checkListHasData(modCon,checkDefault){ //modCon => checkDefault => 是否需要验证默认
            const that = this;
            let labelCon = modCon.content;
            let currLabelChose = labelCon.labelChose ? labelCon.labelChose  : 0
            let currSlabelChose = labelCon.slabelChose ? labelCon.slabelChose : 0;
            let currShowLab = labelCon.labsArr[currLabelChose];
            
            let currData = currShowLab && currShowLab.dataFormData && currShowLab.dataFormData.showObj && currShowLab.dataFormData.showObj.service ? currShowLab.dataFormData.showObj.service : ''
           
            if(currShowLab && currShowLab.type == 2){ //是否有二级
                currShowLab = labelCon.labsArr[currLabelChose].children[currSlabelChose];
                currData  = currShowLab && currShowLab.dataFormData && currShowLab.dataFormData.showObj  && currShowLab.dataFormData.showObj.service ? currShowLab.dataFormData.showObj.service : '';
            }
            
            return currData;
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
            }else 
            
            // 此处是大首页自定义
            if(btnType == 'listadv'){  //自定义广告
                that.listFormData.advList.splice(ind,1)
            }else if(btnType == 'label'){ //切换标签
                that.labelFormData.labsArr.splice(ind,1)
                if(that.labelFormData.labelChose >=1){

                    that.labelFormData.labelChose = that.labelFormData.labelChose - 1
                }else{
                    that.labelFormData.labelChose = 0
                }
                that.labelFormData.slabelChose = 0
            }
            that.userChangeData = true; //发生改变
        },

        
        // 添加新组建
        addModule(obj){
            const that = this;
            let index = that.showContainerArr.findIndex(item => {
                return item.id == obj.id
            }); // 当前组件是否已经添加过

            let addObj = {}; //要追加的数据
            if(index > -1 && !obj.more){ //该组件只能添加一次  表示去编辑此项
                that.currEditPart = obj.id;
                that.currEditInd = index; //当前正在编辑这个
                that[obj.typename + 'FormData'] = that.showContainerArr[index].content
                that.$nextTick(() => {
                    let wh = $(window).height()
                    let scrollTop = $('.midConBox').scrollTop()
                    let offTop = $('.currEditPart').position().top;
                    if(offTop > wh && (offTop - scrollTop) > wh){
                        $('.midConBox').scrollTop((offTop - scrollTop) - wh / 2)
                    }else if(offTop <= wh){
                        $('.midConBox').scrollTop((offTop - scrollTop) - wh / 2)
                    }
                })
                return false;
            }

            if(obj.id === 1){
                that.currEditPart = 1
                return false
            }; //搜索框 固定在顶部 不能添加

            // 验证是否设置过无限加载
            that.checkUnlimitedLoad();
            let unlimitedLoad_before = that.unlimitedLoad

            if(obj.typename == 'list'){ //只有列表
                let newLabFormData = JSON.parse(JSON.stringify(labelDefault));
                newLabFormData.labsArr.splice(-1)
                newLabFormData.labelShow = false;
                that.labelDefault = newLabFormData;
                // that.labelChose = 0 ; //重置当前选中tab 
                that.$set(that.labelFormData,'labelChose',0)


                addObj = {
                    id:11,
                    sid: obj.typename + '_' + (new Date()).valueOf(),
                    typename:'label',
                    content:newLabFormData
                }
               
                that.labelFormData = JSON.parse(JSON.stringify(newLabFormData))
                that[obj.typename + 'FormData'] = that.labelFormData.labsArr[0].dataFormData;

            }else{
                if(obj.typename == 'label'){ //切换标签
                    let newLabFormData = JSON.parse(JSON.stringify(labelDefault));
                    that.labelDefault = newLabFormData;
                }
                addObj = {
                    id:obj.id,
                    sid:obj.typename + '_' + (new Date()).valueOf(),
                    typename:obj.typename,
                    content:JSON.parse(that.catchJsonErr(that[obj.typename + 'Default']))
                };
                
                if(obj.typename == 'sNav' &&( !that.allModules || !that.allModules.length)){
                    that.getAllModules()
                }else if(obj.typename == 'btns'){
                    let len = addObj.content.column * addObj.content.layout;
                    let btnsArr = []
                    for(let i = 0; i < len; i++){
                        btnsArr.push({
                            "id":(new Date()).valueOf() + i,
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
                        })
                    }
                    addObj.content.btnsArr = btnsArr
                }
                
            }

            // 顶部组件添加  位置固定
            if ([2, 3, 4, 5].indexOf(obj.id) > -1) {
                that.currEditPart = obj.id; 
                let obj2 = that.showContainerArr.findIndex(item => {
                    return item.id == 2
                })
                let obj3 = that.showContainerArr.findIndex(item => {
                    return item.id == 3
                })
                let obj4 = that.showContainerArr.findIndex(item => {
                    return item.id == 4
                })
                if (obj.id == 2) {
                    that.showContainerArr.unshift(addObj)
                    that.currEditInd = 0;
                }

                if (obj.id == 3) {
                    if (obj2 > -1) {
                        if (obj2 + 1 >= that.showContainerArr.length) {
                            that.showContainerArr.push(addObj);
                            that.currEditInd = that.showContainerArr.length - 1;
                        } else {
                            that.showContainerArr.splice(obj2 + 1, 0, addObj)
                            that.currEditInd = addInd + 1
                        }
                    } else {
                        that.showContainerArr.unshift(addObj)
                        that.currEditInd = 0;
                    }

                    // 将搜索栏背景高度改为400
                    that.$nextTick(() => {

                        let searchConH = $(".allShowCon .searchConBox").outerHeight()
                        let topBtnH = $(".topComp .topBtnsConBox").outerHeight()
                        that.searchColFormData.style.bgHeight = (searchConH + topBtnH) * 2 - 40 ; //40是目前的头部
                    })

                }

                if (obj.id == 4) {
                    if (obj2 > -1 || obj3 > -1) {
                        let addInd = obj3 > -1 ? obj3 : obj2;
                        if (addInd + 1 >= that.showContainerArr.length) {
                            that.showContainerArr.push(addObj);
                            that.currEditInd = that.showContainerArr.length - 1;
                        } else {
                            that.showContainerArr.splice(addInd + 1, 0, addObj)
                            that.currEditInd = addInd + 1
                        }

                    } else {
                        that.showContainerArr.unshift(addObj)
                        that.currEditInd = 0;
                    }
                }

                if (obj.id == 5) {
                    if (obj2 > -1 || obj3 > -1 || obj4 > -1) {
                        let addInd = obj4 > -1 ? obj4 : (obj3 > -1 ? obj3 : obj2);
                        if (addInd + 1 >= that.showContainerArr.length) {
                            that.showContainerArr.push(addObj);
                            that.currEditInd = that.showContainerArr.length - 1;
                        } else {
                            that.showContainerArr.splice(addInd + 1, 0, addObj)
                            that.currEditInd = addInd + 1
                        }

                    } else {
                        that.showContainerArr.unshift(addObj)
                        that.currEditInd = 0;
                    }
                }

            }else{
                if(![2, 3, 4].includes(obj.id)){ //可以加在当前组件的后边
                    if(obj.id && that.currEditInd < (that.showContainerArr.length - 1) && (that.currEditPart && that.currEditPart != 1)){ //不是最后一个 直接追加
                        if(that.showContainerArr.length){

                            that.showContainerArr.splice(that.currEditInd + 1,0,addObj)
                            that.currEditInd = that.currEditInd + 1; //当前正在编辑这个
                        }else{
                            that.currEditInd = that.showContainerArr.length 
                            that.showContainerArr.push(addObj)
                        }
                    }else{ //如果是最后一个 则需要判断 是否设置过无限加载
                        // 如果已设置无限加载 则在最后一个组件前面追加  否则 在最后一个组件后面追加
                        if(that.unlimitedLoad){  //已设置过无限加载
                            that.showContainerArr.splice(that.showContainerArr.length - 1,0,addObj)
                            that.currEditInd = that.showContainerArr.length - 2;
                        }else{ //未设置过无限加载
                            that.showContainerArr.push(addObj)
                            that.currEditInd = that.showContainerArr.length - 1;
                        }
                    }
                    that.currEditPart = obj.id;
                }
            }

            // 与showContainerArr相关联
            if (obj.typename !== 'list') {
                // 表示当前新增的是半组件     前一项是半组件
                let lastObj = that.showContainerArr[that.currEditInd - 1]
                let currObj = that.showContainerArr[that.currEditInd]
                if ([16, 17, 18, 19].includes(currObj.id) && currObj.content.styletype === 1 && lastObj && that.checkHalfInd(that.currEditInd) == 'rightHalf' && [16, 17, 18, 19].includes(lastObj.id) && lastObj.content.styletype === 1) {
                    addModule_time = true
                    that.showContainerArr[that.currEditInd].content.style.marginTop = lastObj.content.style.marginTop
                    that.showContainerArr[that.currEditInd].content.style.marginLeft = lastObj.content.style.marginLeft
                }
                that[obj.typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;

            } else {
                that['labelFormData'] = that.showContainerArr[that.currEditInd].content;
                that.listFormData = that.labelFormData.labsArr[0].dataFormData;
            }

            // 新增的是限时抢购
            if (obj.id == 19) {
                that.getConfigtime(that.currEditInd);
            } else if ([16, 18, 17].includes(obj.id)) {

                that.getDataList(obj.typename + 'FormData', function (dlist,dinfo) {
                    if (dlist) {
                        let idsArr = dlist.map(item => {
                            return item.id
                        })
                        that[obj.typename + 'FormData'].listArr = dlist;
                        that[obj.typename + 'FormData'].listIdArr = idsArr;
                        that[obj.typename + 'FormData'].totalCount = dinfo.pageInfo.totalCount;
                    }
                })
            }

            that.checkUnlimitedLoad(); //验证是否设置过无限加载
            let unlimitedLoad_after = that.unlimitedLoad
            if (obj.typename == 'adv') {
                that.$nextTick(() => {
                    that.checkLeft(0, $(".iconsContainer .column_chose"))
                })
            } else if (obj.typename == 'pros' || obj.typename == 'busis') {

                that.getDataList(obj.typename + 'FormData', function (list,dinfo) {
                    let idsArr = list.map(item => {
                        return item.id
                    })
                    that[obj.typename + 'FormData'].dataObj.modArr[0]['listArr'] = list
                    that[obj.typename + 'FormData'].dataObj.modArr[0]['listIdArr'] = idsArr
                    that[obj.typename + 'FormData'].dataObj.modArr[0]['totalCount'] =  dinfo.pageInfo.totalCount;
                })
            } else if (obj.typename == 'swiper') {
                that.$nextTick(() => {
                    that.initSwiper(addObj); //新增组件需要
                })
            } else if (obj.typename == 'msg') {
                that.getInfoMation(that.showContainerArr[that.currEditInd], that.currEditInd)
            }
            that.countHalfPart()
            that.$nextTick(() => {

                if(that.currEditInd == (that.showContainerArr.length - 1)){ //追加在页面底部  直接滚动到页面底部
                    $('.midConBox').scrollTop($('.midConBox .pageCon ').height())
                }else{
                    let lastObjEl = $('.containerArrBox .modConBox').eq(that.currEditInd)
                    let lastSecObjEl = $('.containerArrBox .modConBox').eq(that.currEditInd - 1)
                    if(lastObjEl.offset().top < 0){

                        $('.midConBox').scrollTop(lastObjEl.position().top - (lastSecObjEl.length ? lastSecObjEl.height() : 0) - 20); //20表示在原有基础上上滑20px
                    }
                }
            })

            that.userChangeData = true; //发生改变

        },

        // 计算1/2组件索引的个数  主要计算 组合1/2组件  
        countHalfPart(){
            const that = this;
            let arr = that.showContainerArr;
            for(let i = 0; i < arr.length; i++){
                if([16,17,18,19].includes(arr[i].id) && arr[i].content.styletype == 1){
                    if(arr[i-1] && [16,17,18,19].includes(arr[i-1].id) && arr[i-1].yxIndex && arr[i - 1].content.styletype == 1 ){
                        that.$set(arr[i],'yxIndex', (arr[i-1].yxIndex + 1))
                    }else{
                        that.$set(arr[i],'yxIndex', 1)
                    }

                }

                // 顺带统计一下是否设置过瀑布流
                if(arr[i].id == 11){
                    that.checkFlow(arr[i].content,i)
                }
            }
        },

        // 统计瀑布流
        checkFlow(obj,ind){
            const that = this;
            for(let i = 0; i < obj.labsArr.length; i++){
                if(obj.type == 1 && obj.dataFormData.showObj && ['shop','business'].includes(obj.dataFormData.showObj.service) && obj.dataFormData.styletype == 4){
                    if(i != (obj.labsArr.length - 1)){
                        that.$set(obj.dataFormData.dataObj,'styletype',2);
                        that.$set(obj.dataFormData.dataObj.modCon,'imgScale',2)
                    }
                }
            }
        },
        

        // 删除组件
        delModBox(ind,id){
            const that = this;
            let delObj = JSON.parse(JSON.stringify(that.showContainerArr[ind]))
            if(that.currEditPart == delObj.id && that.currEditInd == ind){
                // that.currEditPart = 0
                let lastObj = that.showContainerArr[(ind - 1) > 0 ? (ind - 1) : 0]
                if(ind == 0){
                    lastObj = that.showContainerArr[1]
                }
                that.currEditPart = lastObj && lastObj.id ? lastObj.id : 0;
                that.currEditInd = ((ind - 1) > 0 ? (ind - 1) : 0);
            }else if(that.currDelInd < that.currEditInd){
                that.currEditInd = that.currEditInd - 1
            }

            that.showPop = false;
            that.showTitle = false;
            if(id == 11){  //删除切换标签 有数据的情况下
                that.currEditInd = that.currDelInd
                let hasData = that.checkListHasData(delObj)
                if(hasData){
                    let labChose = that.showContainerArr[ind].content.labelChose
                    let slabChose = that.showContainerArr[ind].content.slabelChose
                    let defaultData = that.showContainerArr[ind].content.labsArr[labChose]
                    if(defaultData.type == 2){ //表示有二级标题 取第一个
                        defaultData['dataFormData'] = defaultData.children[slabChose]['dataFormData']
                        defaultData.children[0]['dataFormData'] = JSON.parse(JSON.stringify(listDefault))
                    }
                    if(defaultData['dataFormData'].showObj && defaultData['dataFormData'].showObj.service && defaultData['dataFormData'].showObj.action){ //有数据 保留当前显示的
                        
                        that.$set(that.labelFormData,'labelChose',0)
                        defaultData.type = 1;
                        defaultData['default'] = 1;
                        that.$set(that.labelFormData,'labelShow',false)
                        that.$set(that.labelFormData,'labsArr',[defaultData]);
    
                        // // 未被选中的时候
                        that.$nextTick(() => {
                            that.checkUnlimitedLoad()
                        })
                    }else{ //没数据  全部清空
                        that.randomNum = new Date().valueOf()
                        that.showContainerArr.splice(ind,1)
                        that.countHalfPart()

                    }
                    
                    that.userChangeData = true; //发生改变
                    return false;
                }
            }else if(id == 28){  //删除列表时
                
                that.delShowList(ind); //删除当前显示的列表
                return false;
            }else if(id == 7){
                that.showContainerArr[ind].content.titleMore.show = false
                return false;
            }else if(id == 19){ //删除限时抢购时 需要清除定时器
                clearInterval(that.countDownArr[that.showContainerArr[ind].sid])

            }
            that.randomNum = new Date().valueOf()
            that.showContainerArr.splice(ind,1)
            that.countHalfPart()
            that.userChangeData = true; //发生改变
        },


        // 检验当前要删除的列表是否是默认列表
        checkLabelDefault(ind){
           
            const that = this;
            let defaultLab  = false;
            let modCon = that.showContainerArr[ind];
            let currLabelChose = modCon.content.labelChose ?  modCon.content.labelChose : 0
            let currSlabelChose = modCon.content.slabelChose ?  modCon.content.slabelChose : 0
            let currLab = modCon.content.labsArr[currLabelChose];
            if(currLab.type != 2 && currLab.default == 1){
                defaultLab = true
            }
            return defaultLab
        },

        delShowList: function (ind) {
            const that = this;
            let modCon = that.showContainerArr[ind];
            let currLabelChose = modCon.content.labelChose ?  modCon.content.labelChose : 0
            let currSlabelChose = modCon.content.slabelChose ?  modCon.content.slabelChose : 0
            let currLab = modCon.content.labsArr[currLabelChose];
            if(!modCon.content.labelShow){  //无标签的列表组件 直接删除组件
                that.showContainerArr.splice(ind,1)
                let lastObj = that.showContainerArr[ind - 1 > 0 ? (ind - 1) : 1]
                that.currEditPart = lastObj.id
                that.currEditInd  = (ind - 1 > 0 ? (ind - 1) : 1)
                return false;
            } 

            if (currLab.type == 2) {
                if (that.delListType === 1) { //连标题一块删
                    if(modCon.content.labsArr[currLabelChose].children.length == 1){ //二级标题删除只剩下一个 再删的话将标签改为常规
                        modCon.content.labsArr[currLabelChose].children[currSlabelChose].dataFormData = JSON.parse(JSON.stringify(listDefault));
                        modCon.content.labsArr[currLabelChose].type = 1;
                        modCon.content.labsArr[currLabelChose].dataFormData = JSON.parse(JSON.stringify(listDefault));

                        that.listFormData.currInd = currLabelChose; 

                    }else{//还有多个二级
                        modCon.content.labsArr[currLabelChose].children.splice(currSlabelChose, 1);
                        if (!modCon.content.labsArr[currLabelChose].children[currSlabelChose]) {
                            // that.slabelChose = modCon.content.labsArr[currLabelChose].children.length ? (modCon.content.labsArr[currLabelChose].children.length - 1) : 0
                            // 此处赋值是因为 之前的索引的值已被删除
                            currSlabelChose = modCon.content.labsArr[currLabelChose].children.length <= currSlabelChose ? currSlabelChose - 1 : currSlabelChose
                        }
                        that.labelFormData = modCon.content;
                        that.$set(that.labelFormData,'slabelChose',currSlabelChose)
                        that.listFormData = modCon.content.labsArr[currLabelChose].children[currSlabelChose].dataFormData;
                        that.listFormData.currInd = currLabelChose;
                        that.listFormData.currCInd = currSlabelChose; 
                    }
                  
                } else { //只删列表
                    modCon.content.labsArr[currLabelChose].children[currSlabelChose].dataFormData = JSON.parse(JSON.stringify(listDefault));
                    that.listFormData = modCon.content.labsArr[currLabelChose].children[currSlabelChose].dataFormData
                }
            } else {
                 if (that.delListType === 1) { //连标题一块删
                    if (modCon.content.labsArr[currLabelChose].default) { //默认标题  有数据删除数据  没有数据 提示不能删除
                        if(modCon.content.labsArr[currLabelChose].dataFormData.listArr && modCon.content.labsArr[currLabelChose].dataFormData.listArr.length){
                            modCon.content.labsArr[currLabelChose].dataFormData = JSON.parse(JSON.stringify(listDefault))
                            that.listFormData = modCon.content.labsArr[currLabelChose].dataFormData
                        }else{

                            that.$message({
                                message: '当前是默认选中项，不能删除',
                                type: 'error'
                            })
                        }
                    } else {
                        modCon.content.labsArr.splice(currLabelChose, 1);
                        if (!modCon.content.labsArr[currLabelChose]) {
                           // 此处赋值是因为 之前的索引的值已被删除
                            currLabelChose = modCon.content.labsArr.length <= currLabelChose ? currLabelChose - 1 : currLabelChose;
                            
                        }
                        that.labelFormData = modCon.content;
                        that.listFormData = modCon.content.labsArr[currLabelChose].dataFormData;
                        that.$set(that.labelFormData,'labelChose',modCon.content.labsArr.length - 1)
                        

                    }
                } else { //只删列表
                    modCon.content.labsArr[currLabelChose].dataFormData = JSON.parse(JSON.stringify(listDefault))
                    that.listFormData = modCon.content.labsArr[currLabelChose].dataFormData
                }
            }

            noChangeLabel = true
            that.$set(that.showContainerArr[ind], 'content', modCon.content)
            that.labelFormData = that.showContainerArr[ind].content;
            that.labelFormData = modCon.content;
            that.delListType = 1
            that.checkUnlimitedLoad()
            that.userChangeData = true; //发生改变
        },

        // 编辑
        changeToLab(id){
            const that = this;
            that.currEditPart = id;
            if(id == 7){
                that.titleFormData = that.labelFormData.titleMore;
                that.titleChangeForList = true; //编辑的是数据列表中的标题
                that.labelFormData.labelShow = false
            }else{
                that.labelFormData.labelShow = true; //增加切换标签
                if(that.labelFormData.labsArr.length == 1){
                    that.addNewTopBtns('labelFormData')
                }
            }
        },


        // 验证是否可以设置查看更多
        checkMoreAvailable(val,data){
            const that = this;
            if(val && (data.addType === 1 && data.dataObj.load == 1 || data.dataObj.styletype == 4)){ // => 无限加载 或者瀑布流
                that.listFormData.more.show = false;
                let txt = ''
                if(that.labelFormData.labelShow){
                    txt = '请在组件标题中，设置查看更多>'
                    // txt = '无限加载方式无法设置查看更多'
                } else if(that.labelFormData.titleMore.show){
                    txt = '请在组件标题中，设置查看更多>'
                }else{
                    txt = '请添加组件标题后，设置查看更多>'
                }
                that.$message({
                    message: txt,
                    type: 'error',
                    customClass:'addTitleTip',
                    onClose:function(){
                        const that = this;
                    },
                })
            }
        },

        // 初始化排序
        initAllSort:function(){
            const that = this;
            $('.sortBox').each(function(){
                let sortEl = $(this)[0];
                let sortKey = $(this).attr('data-sort') ? $(this).attr('data-sort') : '';
                let dragEl = $(this).attr('data-drag') ? $(this).attr('data-drag') : '';
                let filterEl = $(this).attr('data-filter') ? $(this).attr('data-filter') : '';
                if(!that.allSortObj[sortKey]){
                    that.allSortObj[sortKey] = Sortable.create(sortEl,{
                        animate: 150,
                        ghostClass:'placeholder',
                        draggable:dragEl,
                        filter:filterEl,
                        preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                        onEnd: function(evt){
                            let arr = this.toArray()
                            let arrNew = arr.map(item => {
                                return JSON.parse(item)
                            })
    
                            let jsonArr = sortKey.split('.');
                            let newThat = that;
                            for(let i = 0; i < jsonArr.length; i++){
                                newThat = newThat[jsonArr[i]]   ; //原始数组
                            }
                            let newArr = [];
                            for(let m = 0; m < arrNew.length; m++){
                                newArr.push(newThat[arrNew[m]])
                            }
                            
                            that.$nextTick(() => {
                                that.changeModuleOrder(sortEl,newArr,evt.newIndex)
                                if(sortKey == 'showContainerArr'){
                                    that.$nextTick(() => {
                                        that.countHalfPart()
                                    })
                                }
                            })

                            that.userChangeData = true; //发生改变
                        }
                    })
                }
                
                
            })
        },


        // 获取当前1/2组件排序  看看是排在右侧还是左侧
        checkHalfInd(ind){
            const that = this;
            let halfCls = '';
			if(that.showContainerArr[ind] && [16,17,18,19].includes(that.showContainerArr[ind].id)){
                if(that.showContainerArr[ind].yxIndex && that.showContainerArr[ind].content.styletype == 1){
                    halfCls = that.showContainerArr[ind].yxIndex % 2 == 1 ? 'leftHalf' : 'rightHalf';
                }
            }
            return halfCls
        },


        // 初始化 颜色选择器 
        initColorPicker:function(typename){
            const that = this;
            let idName = typename == 'pros5' ? 'pros' : typename; //商品组样式五
            idName = idName == 'busis5' ? 'busis' : idName;  //商家组样式三
            let currInd = idName == 'pros' ? that.currProEdit : that.currBusiEdit
            let pickObj ={
                typename:idName,
                obj:{}
            }
            let defaultBg; //默认背景色
            if(idName == 'pros' || idName == 'busis'){
                defaultBg = that[idName + 'FormData'].dataObj.modArr[currInd].style.bgColor
            }else{
                defaultBg = that[idName + 'FormData'].style.bgColor
            }
            pickObj.obj = Pickr.create({
                el: '#'+typename+'_colorPicker',
                showAlways: true,
                default: defaultBg,
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
                    const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
                    if(idName == 'pros' ||idName == 'busis' ){
                        currInd = idName == 'pros' ? that.currProEdit : that.currBusiEdit
                        that[idName + 'FormData'].dataObj.modArr[currInd].style.bgColor = color;
                        that[idName + 'FormData'].dataObj.modArr[currInd].bgType = 'color';
                    }else{
                        that[idName + 'FormData'].style.bgColor = color;
                        that[idName + 'FormData'].bgType = 'color';
                    }

                    that.userChangeData = true; //发生改变
                },
            });

            pickrArr[typename] = pickObj.obj;

           
        },


        // 改变显示的条数
        changeListCount(formData,type){
            const that = this;
            let singleShow = that[formData].singleShow;
            let max = that[formData].styletype === 1 ? 10 : 12;
            that[formData].listCount = that[formData].listCount % singleShow ? (parseInt(that[formData].listCount / singleShow) + 1) * singleShow :  that[formData].listCount
            if(type){
                singleShow = type === 1 ? -singleShow : singleShow;
                that[formData].listCount = that[formData].listCount * 1 + singleShow
            }

            if(that[formData].listCount > max){
                that[formData].listCount = max
            }else if(that[formData].listCount < 1){
                that[formData].listCount = Math.abs(that[formData].singleShow);
            }

            that.userChangeData = true; //发生改变
        },

        // 限制输入框只能输入数字
        handleZeorNumberInput(item, key, max) {
            setTimeout(() => {
                item[key] = item[key] + '';
                item[key] = item[key].replace(/[^\d]/g, ''); //清除非 数字
                if (item[key].substr(0,1) == '0')  item[key] = '0';
                if(max && Number(item[key]) > max){
                    item[key] = max
                }
            })
        },

        // 计算
        setListCountVal(item,key,type){
            const that = this;
            let el = event.currentTarget
            if($(el).hasClass("disabled")) return false;
            let singleShow = item['singleShow'] ? item['singleShow'] : (that.currProOn == 1 ? 2 : 1);
            if(item.slide == 2 || (that.currEditPart == 9 && that.prosFormData.style == 4)){
                singleShow = 1
            }
            let listCount = item[key] % singleShow ? (parseInt(item[key] / singleShow) + 1) * singleShow :  item[key];
            let max = 12;
            setTimeout(() => {
                if(type){
                    singleShow = type === 1 ? -singleShow : singleShow;
                    item[key] = listCount * 1 + singleShow
                }
                if(item[key] > max){
                    item[key] = max
                }else if(item[key] < 1){
                    item[key] = Math.abs(singleShow);
                }
            })

        },

        // 改变走马灯的高度
        getCarouselHeight(modCon,modInd){
            const that = this;
            let maxH = 0;
            $('.modConBox[data-kid="'+modCon.id+'"][data-ind="'+modInd+'"] .swiperInner').each(function(){
                let el = $(this)
                maxH = el.height() > maxH ? el.height() : maxH;
                // console.log(maxH)
            })
            let height = maxH ? (maxH + 'px') : 'auto'
            return height;
        },

        // 1/2组件 间距改变时 需要一起改变 同层的
        changeMargin(value,margin){
            const that = this;
            if(addModule_time) {
                setTimeout(() => {
                    addModule_time = false;
                }, 500);  
                return false; //当前正在添加新模块 不需要改变
            }
            let cls = that.checkHalfInd(that.currEditInd);//判断当前编辑的是在左侧还是右侧
            let ind = that.currEditInd;
            if(cls == 'leftHalf'){  
                ind = that.currEditInd + 1;
            }else if(cls == 'rightHalf'){
                ind = that.currEditInd - 1;
            }

            // 此处判断   不是当前项 => 当前项是半组件    前一项/后一项 是半组件    
            if( ind != that.currEditInd && ind > -1 && that.showContainerArr[ind] && [16,17,18,19].includes(that.showContainerArr[ind].id) && that.showContainerArr[ind].content.styletype == 1){
                that.showContainerArr[ind].content.style[margin] = value
            }


        },

        // 自定义副标题  新增
        addStitle(type){
            const that = this;
            if(type == 'pros' || type == 'busis'){
                let ind = type == 'busis' ? that.currBusiEdit : that.currProEdit;
                that[type + 'FormData'].dataObj.modArr[ind].stitle.textArr.push({
                    value:''
                });
            }else{
                that[type + 'FormData'].stitle.textArr.push({
                    value:''
                })
            }
            that.userChangeData = true; //发生改变
        },



        // 全组件 单行显示2个 或者半组件单行显示1个 背景风格固定
        changeBgStyle(obj,singleShow){
            const that = this;
            // 背景样式
            if(that[obj].styletype == 1 && singleShow == 1){  
                that[obj].bgStyle = 2
            }
            if(that[obj].styletype == 2 && singleShow == 2){
                that[obj].bgStyle = 3
            }

            // 单行显示4条数据  默认不显示标题
            if(singleShow == 4){
                that[obj].dataObj.price.style.titleLine = 0
            }

            // 单行显示1条数据的全组件 背景会自动切换成1  价格会自动切换成4
            if(that[obj].styletype == 2 && singleShow == 1){
                that[obj].bgStyle = 1;
                if(that[obj].dataObj.price.styletype < 3){
                    that[obj].dataObj.price.styletype = 4
                }
            }
            // 单行显示3、4条数据的全组件 
            if(that[obj].styletype == 2 && singleShow >= 3){
                that[obj].bgStyle = 1;
                if(that[obj].dataObj.price.styletype == 4){
                    that[obj].dataObj.price.styletype = 3
                }
            }




            if(that[obj].styletype == 1 && that[obj].dataObj.price.styletype > 2){
                that[obj].dataObj.price.styletype = 1
            }

            // 标题行数  当单行显示2条以内时 商品标题不能隐藏
            if(that[obj].styletype == 2 && singleShow <= 2 && that[obj].dataObj.price.style.titleLine == 0 ){
                that[obj].dataObj.price.style.titleLine = 2; 
            }
            

            // 重新计算一下高度
            that.$nextTick(() => {
                setTimeout(() => {
                    that.checkShopMarketHeight()
                }, 300);
            })
            that.userChangeData = true; //发生改变

        },

        // 商城营销组件 获取动态数据
			getShopTrends(ind){
				const that = this;
				let modCon = that.showContainerArr[ind]; //组件内容
				let id = modCon.id; //组件id
				let dataPrarm = '';
				
				if(modCon.content.stitle.styletype == 1){
					switch (id){
						case 16:
							dataPrarm = 'service=shop&action=buyList&huodong=2';
							break;
							
						case 17:
							dataPrarm = 'service=shop&action=pinSuccessList';
							break;

						case 18:
							dataPrarm = 'service=shop&action=kanSuccessList';
							break;
					}
                    if(!dataPrarm) return false;
                    $.ajax({
                        url: '/include/ajax.php?' + dataPrarm,
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            if(data.state == 100){
                                that.showContainerArr[ind].content.stitle.textArr  = data.info;
                            }
                        },
                        error: function () { }
                    });
				}
			},


        // 修改商品组的风格
        changeProDefault(id){  //需要同步设置的数据 (接口、listArr)
            const that = this;
            
            let beforeId = that.prosFormData.styletype;
            let beforeObj = JSON.parse(JSON.stringify(that.prosFormData.dataObj));
           
            // 由于只有风格1和5是多个  所以需要切换到数组  第一个值
            that.currProEdit = 0;
           
            // 获取当前选中的初始默认值
            let currStyle = styleOptionsArr.find(item => {
                return item.id == id
            })
            // 之前设置的风格是否设置过 如果设置过 需要清空 
            let beforeSetInd = that.prosHasSet.findIndex(item => {
                return item.id == that.prosFormData.styletype
            })

            if(beforeSetInd > -1){
                that.prosHasSet.splice(beforeSetInd,1)
            }
            that.prosHasSet.push({
                id:that.prosFormData.styletype,
                options:JSON.parse(JSON.stringify(that.prosFormData.dataObj))
            })

            
            // setInd =>当前要设置的风格 是否设置过   setInd>-1 => 设置过
            let setInd = that.prosHasSet.findIndex(item => {
                return item.id == id
            })
            
            if(setInd > -1){
                that.prosFormData.dataObj = that.prosHasSet[setInd].options 
            }else{
                that.prosFormData.dataObj = currStyle.options
            }
           
            that.prosFormData.styletype = id ;
            if(that.prosFormData.dataObj.modArr[0]['listArr'] && that.prosFormData.dataObj.modArr[0]['listArr'].length == 0){
                that.getDataList('prosFormData',function(list,dinfo){
                    that.prosFormData.dataObj.modArr[0]['listArr'] = list
                    let idsArr = list.map(item => {
                        return item.id
                    })
                    that.prosFormData.dataObj.modArr[0]['listIdArr'] = idsArr
                    that.prosFormData.dataObj.modArr[0]['totalCount'] = dinfo.pageInfo.totalCount
                })
            }
            if(id == 3){ //样式3 默认显示销量
                that.prosFormData.dataObj.modArr[0].proObj.saleShow = true
            }else if(id == 4){
                that.prosFormData.dataObj.modArr[0].proObj.saleShow = false
                that.prosFormData.dataObj.modArr[0].proObj.stockShow = true
                that.prosFormData.dataObj.modArr[0].proObj.saveShow = true

            }
            
            //特殊设置

            let formData = that.prosFormData.dataObj.modArr
            for(let i = 0; i < formData.length; i ++){
                if(id == 5){  
                    formData[i]['listCount'] = formData[i]['listCount'] >= 5 || formData[i]['listCount'] <= 1 ? 2 : formData[i]['listCount']
                }else if(id == 4){
                    formData[i].slide = 2
                }else if(id == 3){
                    formData[i].slide = 1
                }
            }
            that.$set(that.prosFormData.dataObj,'modArr',JSON.parse(JSON.stringify(formData)))

            that.$nextTick(() => {
                if($("#pros5_colorPicker").length){
                    // 重新初始化一下色彩选择
                    that.initColorPicker('pros5')
                }
            })

            that.userChangeData = true; //发生改变
        },

        // 修改商家组的风格
        changeBusieDefault(id){
            const that = this;

            // 未改风格之前的样式（只为存储修改过的样式）
            let beforeId = that.busisFormData.styletype;
            let beforeObj = JSON.parse(JSON.stringify(that.busisFormData.dataObj));

             // 保存当前的样式
             let beforeObjInd = that.busisHasSet.find(item => {
                return item.id == beforeId
            })

            if(beforeObjInd > -1){
                that.busisHasSet.splice(beforeObjInd,1)
            }
            that.busisHasSet.push({
                id:beforeId,
                options:JSON.parse(JSON.stringify(beforeObj))
            })


            that.currBusiEdit = 0;

            // 将要设置的风格的相关配置
            let currStyle = {
                modArr:[JSON.parse(JSON.stringify(busiStyleDefault))]
            }
            if(id == 5){
                let busModDefault = JSON.parse(JSON.stringify(style2ModOptionsDefault))
             
                currStyle = {
                    modArr:[
                        busModDefault,
                        JSON.parse(JSON.stringify(busiStyleDefault))
                    ]
                }
            }

             // setInd =>当前要设置的风格 是否设置过   setInd>-1 => 设置过
            let setInd = that.busisHasSet.findIndex(item => {
                return item.id == id
            })
            
            if(setInd > -1){
                that.busisFormData.dataObj = that.busisHasSet[setInd].options 
            }else{
                that.busisFormData.dataObj = currStyle
            }

            if(that.busisFormData.dataObj.modArr[0]['listArr'] && that.busisFormData.dataObj.modArr[0]['listArr'].length == 0){
                that.getDataList('busisFormData',function(list,dinfo){
                    let idsArr = list.map(item => {
                        return item.id
                    })
                    that.busisFormData.dataObj.modArr[0]['listArr'] = list
                    that.busisFormData.dataObj.modArr[0]['listIdArr'] = idsArr
                    that.busisFormData.dataObj.modArr[0]['totalCount'] = dinfo.pageInfo.totalCount
                })
            }
            that.busisFormData.styletype = id

            //特殊设置

            let formData = that.busisFormData.dataObj.modArr
            for(let i = 0; i < formData.length; i ++){
                if(id == 5){  
                    formData[i]['listCount'] = formData[i]['listCount'] >= 5 || formData[i]['listCount'] <= 1 ? 2 : formData[i]['listCount']
                }else if(id == 4){
                    formData[i].slide = 2
                }else if(id == 3){
                    formData[i].slide = 1
                }
            }
            that.$set(that.busisFormData.dataObj,'modArr',JSON.parse(JSON.stringify(formData)))
            that.userChangeData = true; //发生改变
        },

        // 商品组 更加当前的风格 获取相对的数据
        checkStyleData(){
            const that = this;
            let data ;
            if(that.prosFormData.styletype == 1){
                data = that.prosFormData.dataObj.modArr[that.currProEdit]
            }else{
                data = that.prosFormData.dataObj.modArr[that.currProEdit]
            }
            // console.log(data)
            return data
        },

        // 更改区域显示数据
        dataShow(){
            const that = this;
             if(that.prosFormData.dataObj.modArr[that.currProEdit].listArr.length == 0){
                that.getDataList('prosFormData',function(list,dinfo){
                    let idsArr = list.map(item => {
                        return item.id
                    })
                    that.prosFormData.dataObj.modArr[that.currProEdit].listArr = list
                    that.prosFormData.dataObj.modArr[that.currProEdit].listIdArr = idsArr
                    that.prosFormData.dataObj.modArr[that.currProEdit].totalCount = dinfo.pageInfo.totalCount
                })
                that.userChangeData = true; //发生改变
             }
        },


        // 重置一下商品组的默认设置
        reSetProsDefault(){
            const that = this;
            for(let i = 0; i < styleOptionsArr.length; i++){
                switch(styleOptionsArr[i].id){
                    case 1:
                        break;
                    case 2 :
                        break;

                    case 3:
                        styleOptionsArr[i].options['slide'] = 1;
                        break;

                    case 4:
                        styleOptionsArr[i].options['slide'] = 2;
                        break;

                }
            }
        },


        // 展开数据选择的弹窗
        showProConPop(){
            const that = this;
            that.dataChosePop = true
        },

        // 过滤相关数据  列表只显示商城前4个  其他选择 则全部显示
        filterObj(d){
            const that = this;
            // console.log(that.dataArr)
            if(d.name != '商城'){
                return d.list
            }else {
                let list = d.list.filter(item => {
                    return item.id <= 4
                });
                return list
            }
        },

        // 确定选择商品组的来源
        confirmProsCon(){
            const that = this;
            // 商品组
            if(that.currEditPart == 9){
                for(let item in that.currChose_labCon){
                    if(item !== 'id' ){
                        if(that.prosFormData.styletype != 1){

                            that.prosFormData.dataObj.interface[item] =  that.currChose_labCon[item]
                        }else{
                            that.prosFormData.dataObj.modArr[that.currProEdit].interface[item] =  that.currChose_labCon[item]

                        }
                    }
                }
            }

            that.getDataList('prosFormData',function(data,dinfo){
                that.currChose_labCon = {};
                that.dataChosePop = false;
                let idsArr = data.map(item => {
                    return item.id
                })
                that.prosFormData.dataObj.modArr[that.currProEdit].listArr = data;
                that.prosFormData.dataObj.modArr[that.currProEdit].listIdArr = idsArr;
                that.prosFormData.dataObj.modArr[that.currProEdit].totalCount = dinfo.pageInfo.totalCount;
                // if(that.prosFormData.styletype == 1){
                //     that.prosFormData.dataObj.modArr[that.currProEdit].listArr = data;
                // }else{
                //     that.prosFormData.dataObj.modArr[that.currProEdit].listArr = data;
                // }

            })
            that.userChangeData = true; //发生改变
        },


        // 手动选中的商品  删除已选中的商品
        delChosedPro(id,param){
            const that = this;
            let listArr = [] 
            param = param ? param : 'listFormData'
            if(param == 'prosFormData' || param == 'busisFormData'){ //商品组/商家组
                let ind = param == 'prosFormData' ? that.currProEdit : that.currBusiEdit; //当前编辑的列表
                listArr = that[param].dataObj.modArr[ind].listArr.filter(item => {
                    return item.id != id
                })
                let idsArr = listArr.map(item => {
                    return item.id
                })
                that[param].dataObj.modArr[ind].listArr = listArr;
                that[param].dataObj.modArr[ind].listIdArr = idsArr;
            }else if(['miaoshaFormData','pintuanFormData','kanjiaFormData','qianggouFormData'].includes(param)){  
                listArr = that[param].listArr.filter(item => {
                    return item.id != id
                })
                let idsArr = listArr.map(item => {
                    return item.id
                }) 
                that[param].listArr = listArr;
                that[param].listIdArr = idsArr;
            }else if(param == 'listFormData'){
                listArr = that[param].listArr.filter(item => {
                    return item.id != id
                })
                let idsArr = listArr.map(item => {
                    return item.id
                }) 
                that[param].listArr = listArr;
                that[param].listIdArr = idsArr;
            }
            that.userChangeData = true; //发生改变
        },


        // 更换 选中商品 只能选一个？
        changeChosePro(id,param){
            const that = this;
            that.listChange = id;
            that.showChosePop(2,param); //展开选择弹框
            that.userChangeData = true; //发生改变
        },



        // 获取商品组的高度 swiper
        getProsCalselHieght(modCon){
            const that = this;

        },


        // listTable 数据列表排序
        tableSortInit(item){
            const that = this;
            if(item == 1) return false; //当选择手动加载数据时 需要初始化一下排序
            that.$nextTick(() => {
                setTimeout(() => {
                    $('.rightCon.show .listSortTb').each(function(){
                        let sortEl = $(this)[0];
                        let sortKey = $(this).attr('data-sort') ? $(this).attr('data-sort') : '';
                        let dragEl = $(this).attr('data-drag') ? $(this).attr('data-drag') : '';
                        let filterEl = $(this).attr('data-filter') ? $(this).attr('data-filter') : '';
                        if(!that.allSortObj[sortKey]){
                            that.allSortObj[sortKey] = Sortable.create(sortEl,{
                                animate: 150,
                                ghostClass:'placeholder',
                                draggable:dragEl,
                                filter:filterEl,
                                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                                onEnd: function(evt){
                                    let arr = this.toArray()
                                    let arrNew = arr.map(item => {
                                        return JSON.parse(item)
                                    })
            
                                    let jsonArr = sortKey.split('.');
                                    let newThat = that;
                                    for(let i = 0; i < jsonArr.length; i++){
                                        newThat = newThat[jsonArr[i]]   ; //原始数组
                                    }
                                    let newArr = [];
                                    for(let m = 0; m < arrNew.length; m++){
                                        newArr.push(newThat[arrNew[m]])
                                    }
                                    that.$nextTick(() => {
                                        that.changeModuleOrder(sortEl,newArr)
                                    })
                                    that.userChangeData = true; //发生改变
                                }
                            })
                        }
                    })
                }, 500);

            })
        },


        // 商品/商家组 添加新模块
        addNewPart(formData,type){
            const that = this;
            let listCount = 2;
            let modArr  = that[formData].dataObj.modArr;
            for(let i = 0; i < modArr.length; i++){
                if(modArr[i].listCount > listCount && modArr[i].listCount <= 4 && modArr[i].listCount >= 2){
                    listCount = modArr[i].listCount
                }
            }


            let param = JSON.parse(JSON.stringify(style2ModOptionsDefault))
            if(type == 'busis'){
                param = JSON.parse(JSON.stringify(busiStyleDefault))
                that.getTypeList('business'); //需要获取商城分离
            }
            param.listCount = listCount
            that[formData].dataObj.modArr.push(param);
            that.addPartPop  = false;
            that.$nextTick(() => {
                that.confirTipShow[that[formData].dataObj.modArr.length - 1] = false
            })

            that.userChangeData = true; //发生改变
        },

      
        // 删除
        delPart(ind,type){
            const that = this;
            if(type == 'busis'){  //删除商家组

                that.busisFormData.dataObj.modArr.splice(ind,1)
                that.confirTipShow.splice(ind,1)
                that.currBusiEdit = that.busisFormData.dataObj.modArr.length - 1
            }else{  //删除商品组

                that.prosFormData.dataObj.modArr.splice(ind,1)
                that.confirTipShow.splice(ind,1)
                that.currProEdit = that.prosFormData.dataObj.modArr.length - 1
            }
            that.userChangeData = true; //发生改变
        },



        // 商品/商家切换数据显示  只有样式5才会出现  因此需要将listCount和singleShow统一
        choseListShow(mod,obj){ // mod表示当前的模块 ，obj是接口数据  
            const that = this;
            let formData =  that.currEditPart == 9 ? 'prosFormData' : 'busisFormData'
            let currInd = that.currEditPart == 9 ? that.currProEdit : that.currBusiEdit;
            let pageSize = that[formData].dataObj.modArr[currInd].interface.pageSize
            let orderby = that[formData].dataObj.modArr[currInd].interface.orderby
            let currObj = JSON.parse(JSON.stringify(that[formData].dataObj.modArr[currInd]));
            that[formData].dataObj.modArr[currInd].interface = {}
            let param = {}
            for(item in obj){
                if(item == 'id') continue;
                param[item] = obj[item]
            }
            param['pageSize'] = pageSize;
            param['orderby'] = orderby;
            
            if(mod == 'business'){
                param['action'] = 'blist'
                param['service'] = 'business'
                param['text'] = '大商家'
                that.$delete(that[formData].dataObj.modArr[currInd],'proObj')
                that.$set(that[formData].dataObj.modArr[currInd],'busisObj',JSON.parse(JSON.stringify(busiStyleDefault.busisObj)))
                that.getTypeList('business')
            }else {
                that.$delete(that[formData].dataObj.modArr[currInd],'busisObj')
                that.$set(that[formData].dataObj.modArr[currInd],'proObj',JSON.parse(JSON.stringify(style2ModOptionsDefault.proObj)))
            }
            that[formData].dataObj.modArr[currInd].interface = param
            that.getDataList(formData,function(list,dinfo){
                let idsArr = list.map(item => {
                    return item.id
                })
                that[formData].dataObj.modArr[currInd].listArr = list;
                that[formData].dataObj.modArr[currInd].listIdArr = idsArr;
                that[formData].dataObj.modArr[currInd].totalCount = dinfo.pageInfo.totalCount;
            })

            that.userChangeData = true; //发生改变

        },


        // 切换数据时 如果没有 需要加载 选择区域
        checkHasList(ind){
            const that = this;

            let typename = 'pros'
            if(that.currEditPart == 9){
                that.currProEdit = ind;
            } else{
                that.currBusiEdit = ind;
                typename = 'busis'
            }
          
            if(that[typename + 'FormData'].dataObj.modArr[ind].bgType == 'color'){ //背景是color时 才需要重置颜色
                pickrArr[typename + '5'].setColor(that[typename + 'FormData'].dataObj.modArr[ind].style.bgColor);
            }

            // 加载数据是商家  添加分类
            if(that[typename + 'FormData'].dataObj.modArr[ind].interface && that[typename + 'FormData'].dataObj.modArr[ind].interface.service == 'business'){
                that.getTypeList('business');
            }
            that.$nextTick(() => {
                if(that[typename + 'FormData'].dataObj.modArr[ind] && that[typename + 'FormData'].dataObj.modArr[ind].listArr && that[typename + 'FormData'].dataObj.modArr[ind].listArr.length == 0){
                    that.getDataList(typename + 'FormData',function(list,dinfo){
                        let idsArr = list.map(item => {
                            return item.id
                        })
                        that[typename + 'FormData'].dataObj.modArr[ind].listArr = list;
                        that[typename + 'FormData'].dataObj.modArr[ind].listIdArr = idsArr;
                        that[typename + 'FormData'].dataObj.modArr[ind].totalCount = dinfo.pageInfo.totalCount;
                    })
                }
            })

            that.userChangeData = true; //发生改变

        },


        // 获取当前数据源的分类
        getTypeList(mod){
            const that = this;
            if(that.allTypeList[mod] && that.allTypeList[mod].length) return false; //已经加载过
            $.ajax({
                url: '/include/ajax.php?service='+mod+'&action=type&son=1',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.allTypeList[mod] = data.info;
                        if(mod == 'article'){
                            let list = data.info;
                            that.allTypeList[mod].unshift({
                                id:'',
                                lower:'',
                                title:'不限'
                            })
                            that.changeTypeList(that.allTypeList[mod])
                        }else if(mod == 'business'){
                            let list = data.info;
                            that.allTypeList[mod].unshift({
                                id:'',
                                lower:'',
                                title:'全部'
                            })
                            that.changeTypeList(that.allTypeList[mod])
                        }
                    }
                },
                error: function () { }
            });
        },

        // 改造分类
        changeTypeList(list){
            const that = this;
            let arr = JSON.parse(JSON.stringify(list))
            for (let i = 0; i < list.length; i++) {
                if (arr[i].lower && arr[i].lower.length) {
                    let parent_list = JSON.parse(JSON.stringify(arr[i])); //不限
                    if (arr[i].lower) {
                        parent_list['title'] = ''
                        parent_list['lower'] = '';
                        arr[i].lower.unshift(parent_list)
                        // console.log(arr[i].lower)
                        that.$set(list,i,arr[i])
                        that.changeTypeList(list[i].lower)
                    }
                }
            }
        },


        // 消息通知组件 获取通告/通知/广告   
        getInfoMation(obj,ind){  //obj表示需要加载的内容 ind表示obj在当前模板数据中的索引  如果obj 和ind都没有 则表示 是在加载弹窗
            const that = this;
            let paramArr = []

            let listShow,orderby,paramObj;
            let objCon ;
            if(!that.msgListPop){  //普通的加载

                objCon = obj ? obj.content : '';
                let msgtype = objCon ? objCon.msgType : that.msgFormData.msgType
                let msgCon = that.msgType.find(item => {
                    return item.type == msgtype
                })
                let chosedCon = that.msgType.find(item => {
                    return item.type == objCon.msgType
                })
    
    
    
    
                listShow = objCon ? objCon.listShow : that.msgFormData.listShow;
                orderby =  objCon ? objCon.order : that.msgFormData.order;
                let paramObj = objCon ? chosedCon : msgCon;
                if(paramObj.service == 'article'){
                    paramObj.typeid = objCon.articleType
                }
                for(let item in paramObj){
                    if(item != 'id' && item != 'text'){
                        paramArr.push(item+'=' + paramObj[item])
                    }
                }
            }else{ //弹窗消息加载
                let chosedCon = that.msgType.find(item => {
                    return item.type == that.msgPopData.msgType
                })
                listShow = that.msgPopData.pageSize;
                orderby =  that.msgPopData.orderby;
                let paramObj = chosedCon;
                if(paramObj.service == 'article'){
                    paramObj.typeid = that.msgPopData.typeid
                }
                for(let item in paramObj){
                    if(item != 'id' && item != 'text'){
                        paramArr.push(item+'=' + paramObj[item])
                    }
                }
            }
            

            let url = '/include/ajax.php?page=1&pageSize='+listShow
            url = url + '&orderby=' + orderby
            $.ajax({
                url: url,
                data:paramArr.join('&'),
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        if(!that.msgListPop){
                            if(objCon){
                                that.showContainerArr[ind].content.dlistArr = data.info.list;
                            }else{
                                that.msgFormData.dlistArr = data.info.list;
                            }
                        }else{
                            that.$set(that.msgPopData,'dlistArr',data.info.list)
                        }
                    }
                },
                error: function () { }
            });
        },

        



        // 消息通知  通告类型 切换   当切换成资讯时 需要显示资讯分类
        announceChange(val){
            const that = this;
            
            if(val == 3){  //选择了资讯需要显示他的分类
                that.getTypeList('article')
            }else if(val == 1 || val == 2){ //平台资讯
                that.msgFormData.order = 1; //平台公告只有最新 没有最热
            }
            if(!that.msgListPop){
                if(val != 4){
                    that.getInfoMation(that.showContainerArr[that.currEditInd],that.currEditInd);  //获取资讯
                }
                that.userChangeData = true; //发生改变
            }else {
                if(val != 4){
                    that.getInfoMation(); //直接获取
                }
            }
        },



        // 此方法只做测试
        test(ind){
            const that = this;
            // console.log(ind)
        },



    

        // 更改状态
        changeBtnType(type){
            const that = this;
            if(that.memberCompFormData.setBtns.btnType && that.memberCompFormData.setBtns.btnType == type){
                that.memberCompFormData.setBtns.btnType = ''
            }else{

                that.memberCompFormData.setBtns.btnType = type;
            }
            that.userChangeData = true; //发生改变
        },

        // 更改图标组单行个数
        choseColumn(num,ind){
            const that = this;
            that.$set(that.iconsFormData,'column',num)
            // console.log(that.iconsFormData['column']);
           
            that.checkLeft(ind,$(event.currentTarget).closest('.column_chose '))

            that.userChangeData = true; //发生改变
        },

        
        

        // 处理样式
        getStyle(box,type,content){  //box ，type => 区分样式  content => 样式数据
            const that = this;
            let styleStrArr = [];
            if(box == 'wechatInfo'){
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
                }else if(type == 'height'){
                    styleStrArr.push('border-radius:'+  (content.style.borderRadius / 2) +'px')
                    styleStrArr.push('overflow:hidden')
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
        

        // 重新计算1/2组件的高度  高度变化时 需要同步修改同行的1/2直接高度 
        checkShopMarketHeight(index){
            const that = this;
            let selfEl = $(".currEditPart.halfPartBox");
            selfEl = !isNaN(index) ? $(".containerArrBox .modConBox").eq(index) : selfEl
            
            if(!selfEl || !selfEl.length || !selfEl.hasClass('halfPartBox')) return false; //当前并不是改变组件高度
            let otherEl = null;
            if(selfEl.hasClass('leftHalf')){  //需要获取右侧高度
                otherEl = selfEl.next('.halfPartBox')
            }else{
                otherEl = selfEl.prev('.halfPartBox')
            }

            if(otherEl && otherEl.length){ //有两个组件
                selfEl.find(".halfCon").css({
                    'min-height':'auto'
                })
                otherEl.find(".halfCon").css({
                    'min-height':'auto'
                })

                let selfH  = selfEl.find('.halfCon').height()
                let otherH  = otherEl.find('.halfCon').height()
                let maxh = Math.max(selfH,otherH)
                selfEl.find(".halfCon").css({
                    'min-height':maxh + 'px'
                })
                otherEl.find(".halfCon").css({
                    'min-height':maxh + 'px'
                })
            }else{
                selfEl.find(".halfCon").css({
                    'min-height':'auto'
                })
            }

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
                }else if(ind !== 1){
                    dataArr = dataArr.slice(0,ind)
                }
                that.advFormData.list = dataArr.concat(dataArr2);
            }
            that.userChangeData = true; //发生改变
        },

        // 显示全局设置
        showPageSet(){
            const that = this;
            let el = event.currentTarget;
            // if($(event.target).hasClass('customCon') || $(event.target).hasClass('midContainer')){
            //     if(that.currEditPart){
            //         that.showTitle = false;
            //     }
            //     that.currEditPart = 0;
                
            // }
        },


        // 复制组件
        copyPart(){
            const that = this;
            let el = event.currentTarget
            if($(el).hasClass('disabled')) {
                // that.$message.error('此组件只能复制一次' )
                that.$message({
                    message: '此组件只能添加一次',
                    type: 'warning',
                    customClass:'errorMsg',
                    showClose:true,
                  });
                return ;
            }
            let obj = that.showContainerArr[that.currEditInd]
            let objCopy = JSON.parse(JSON.stringify(obj))
            objCopy.sid = objCopy.typename + '_' +(new Date()).valueOf()
            that.showContainerArr.splice(that.currEditInd,0,JSON.parse(JSON.stringify(objCopy)))
            that.userChangeData = true; //发生改变
        },


         // 验证是否输入
         checkAllFormData(){
            const that = this;
            let stop = false;

            // 验证会员头部必填信息
            // console.log(that.memberCompFormData);
            // for(let item in that.memberCompFormData){
        
            // }
        },


        // 保存图片
        saveImg(forImg,callback){
            const that = this;
            html2canvas(document.querySelector("#toCanvas"),{
                // foreignObjectRendering:true, //如果浏览器支持，是否使用ForeignObject渲染
                useCORS:true,
                'backgroundColor': 'transparent',
                'dpi': window.devicePixelRatio * 2,
                'scale': 2,
                allowTaint:true,
                width:375,
                logging:false,
                height:812,
                ignoreElements:(element)=>{
                    if(element.id==='pageTop')
                    return true;
                },
            }).then(canvas => {
                var a = that.canvasToImage(canvas); 
                $('.midConBox').removeClass('html2Img');
                if(!forImg){
                    const file = that.dataURLtoFile($(a).attr('src'),"image/jpeg")
                    that.uploadPriview(file); //将生成的图片上传
                }
                if(callback){
                    callback(a)
                }
            });
        },

        // canvas转base64
        canvasToImage(canvas) {
            var image = new Image();
            image.setAttribute("crossOrigin", 'anonymous')
            var imageBase64 = canvas.toDataURL("image/png", 1);
            image.src = imageBase64;
            return image;
        },
        // 上传预览图
        uploadPriview(d){
            const that = this;
            let formData = new FormData();
            let fileOfBlob = new window.File([d], new Date() + ".jpg", {type: d.type}); // 命名图片名
            formData.append("Filedata", fileOfBlob);    
            $.ajax({
                url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                dataType: "json",
                data: formData,
                type:'POST',
                processData: false, // 使数据不做处理
                contentType: false, // 不要设置Content-Type请求
                success: function (data) {
                    if(data.url){
                        that.submitDataTo(data.url)
                    }else{
                        that.submitDataTo('')
                    }
                },
                error: function (res) {
                   console.log(res)
                }
            });
        },


        // 保存数据
        saveAllData(type){ //type = 1 是表示预览
            const that = this;
            if(!that.sitePageData.default && that.cityCustomList && that.cityCustomList.length > 0 && !that.citySetPop){
                that.citySetPop = true;
                return false;
            }
            that.citySetPop = false; //关闭弹窗

            that.fullscreenLoading = true; 
            that.saveType = type ? type : '';
            $('.midConBox').addClass('html2Img')
            setTimeout(() => {
                that.$nextTick(() => {
                    that.saveImg(); //保存生成图片
                });
            }, 300); 
        },


        // 提交数据
        submitDataTo(imgPath){
            const that = this;
            that.submitData = {
                searchColFormData:that.searchColFormData,
                pageSetFormData:that.pageSetFormData,
                compArrs:that.listSolve(), //数据列表
                cover: imgPath, //封面
            }
            let str = that.saveType ? '&type=1' : '';
            var formdata = new FormData();

            if(that.saveType){
                formdata.append('browse',JSON.stringify(that.submitData));
                formdata.append('platform',platform);
                formdata.append('cityid',cityid);
                that.preveiw = true;
                // $(".previewBox p").addClass('blue').html('<s></s>同步中');
                // setTimeout(function(){
                //     $(".previewBox p").removeClass('blue').html('已同步至最新');
                // },400)
            
                $(document).one('click',function(){
                    that.preveiw = false;
                })
            }else{
                formdata.append('config',JSON.stringify(that.submitData));
                formdata.append('cover',imgPath);
                formdata.append('platform',platform);
                formdata.append('cityid',cityid);
                if(that.advancsFormData.hasSet == 1){
                    formdata.append('ids',that.advancsFormData.ids.join(','));
                    formdata.append('terminal',that.advancsFormData.platform.join(','));
                }

                if(!that.sitePageData.default){
                    formdata.append('ids',that.cityidChosed.join(','));
                    formdata.append('default',1);
                }
            }


            $.ajax({
                url: 'sitePageDiy.php?dopost=save'+str,
                data: formdata,
                processData: false, // 使数据不做处理
                contentType: false, // 不要设置Content-Type请求
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.fullscreenLoading = false; 
                    if(data.state == 100){
                        optAction = false;
                        if(that.saveType){
                            that.preveiwSet = masterDomain + '?preview=1&appIndex=1&platform=' + platform;
                            // $(".previewBox p").removeClass('blue').html('已同步至最新');
                            that.getMiniQr();
                        }else{
                            that.noSetPlatform = false;
                            that.$message({
                                iconClass:'sIcon',
                                customClass:'successSave',
                                dangerouslyUseHTMLString: true,
                                message: '<span>保存成功</span>'
                            })
                        }
                    }else{
                        that.$message({
                            message:'保存失败',
                            type: 'error',
                            customClass:'errorSave'
                        })
                        if(that.saveType){
                            that.preveiwSet = '';
                            $(".previewBox p").removeClass('blue').html('预览失败');
                        }
                    }
                },
                error: function(){
                    that.fullscreenLoading = false; 
                    that.$message({
                        message:'保存失败',
                        type: 'error'
                    })
                }
              });
              event.stopPropagation()
        },

        

        /*
        * 处理相关数据
        * 列表数据 手动选择的数据 需要提取id
        
        */ 

        listSolve(){
            const that = this;
            let allShowArr = JSON.parse(JSON.stringify(that.showContainerArr));
            for(let i = 0; i < allShowArr.length; i++){
                if(![9,10,11,16,20,17,18,19,28].includes(allShowArr[i].id)) continue;  //跳过

                if([16,17,18,19].includes(allShowArr[i].id)){ //抢购 拼团 砍价  秒杀 
                    allShowArr[i].content.listArr = []; //数据处理需清空 
                    allShowArr[i].content.listArrShow = []; 
                }else if(allShowArr[i].id == 20){  //消息通知
                    allShowArr[i].content.dlistArr = [];
                    if(allShowArr[i].content.msgType != 4){ //不是手动添加 需要删除list
                        allShowArr[i].content.listArr = [];
                    }
                }else if([9,10].includes(allShowArr[i].id)){ //商户 /商品
                    for(let m = 0; m < allShowArr[i].content.dataObj.modArr.length; m++){
                        allShowArr[i].content.dataObj.modArr[m].listArr = []
                        allShowArr[i].content.dataObj.modArr[m].listArrShow = []
                    }
                }else if(allShowArr[i].id ==  11){
                    for(let m = 0; m < allShowArr[i].content.labsArr.length; m++ ){
                        allShowArr[i].content.labsArr[m].dataFormData.listArr = []
                        allShowArr[i].content.labsArr[m].dataFormData.listArrShow = [];
                        for(let n = 0; n < allShowArr[i].content.labsArr[m].children.length; n++){
                            let pObj = allShowArr[i].content.labsArr[m]
                            if(pObj.children[n] && pObj.children[n].dataFormData){
                                allShowArr[i].content.labsArr[m].children[n].dataFormData.listArr = []
                                allShowArr[i].content.labsArr[m].children[n].dataFormData.listArrShow = []
                            }
                        } 
                    }
                }
            }
            return allShowArr;
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
        resetItem(typename,type){  //type表示重置类型 1 表示重置上一次  0表示重置成初始数据
            const that = this;
            let arr = ['topBtns','btns','advLinks','label','adv','title','swiper','list','qianggou','miaosha','pintuan','kanjia','pros','quan'];
            that.userChangeData = true; //发生改变
            if(!arr.includes(typename)){
                if(typename != 'search' && typename != 'pageSet'){
                    let currEditObj;
                    if(!Array.isArray(that.config) && that.config.compArrs){

                        let currEditObj = that.config.compArrs.find(item => {
                            return item.id == that.currEditPart && that.showContainerArr[that.currEditInd].sid == item.sid
                        })
                    }
                    that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']))
                    that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content
                 
                }else{
                    if(typename == 'pageSet'){
                        that[typename + 'FormData'] = JSON.parse(JSON.stringify(type ? that.config.pageSet :  that[typename + 'Default']))
                    }else{
                        that.addDropMenu = false;
                        that.addScan = false;
                        that[typename + 'ColFormData'] = JSON.parse(JSON.stringify(type ? that.config.searchColFormData :  that[typename + 'ColDefault']))
                    }
                }
            }else{
                let currEditObj;
                if(!Array.isArray(that.config) && that.config.compArrs){

                    let currEditObj = that.config.compArrs.find(item => {
                        return item.id == that.currEditPart && that.showContainerArr[that.currEditInd].sid == item.sid
                    })
                }

                if(!currEditObj){
                    currEditObj = {}
                }

                let noEdit;  //不编辑的选项
                switch(typename){
                    case "topBtns":  //顶部按钮组
                    case "btns": //普通按钮组
                        noEdit = JSON.parse(JSON.stringify(that[typename + 'FormData'].btnsArr))
                        
                        for(let i = 0; i< noEdit.length; i++){
                            noEdit[i].lab.style = {
                                "bgColor":"#ff0000",
                                "color":"#ffffff",
                            }
                        }
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']));
                        that.showContainerArr[that.currEditInd].content.btnsArr = noEdit;
                        that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        break;

                    case "label": //切换标签
                        noEdit = JSON.parse(JSON.stringify(that[typename + 'FormData'].labsArr))
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']));
                        that.showContainerArr[that.currEditInd].content.labsArr = noEdit;
                        that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        break;
                    case "list":  //数据列表实际是label中的某一个属性  因此需要获取 label的值
                            let currEditRealObj ;
                            if(!Array.isArray(that.config) && that.config.compArrs && Array.isArray(that.config.compArrs)){
                                currEditRealObj = that.config.compArrs.find(item => {  //如果currEditRealObj没有值 表示 新增的 
                                    return item.id == 11 && that.showContainerArr[that.currEditInd].sid == item.sid
                                })
                            }
                            if(currEditRealObj){
                                let labelChose = currEditRealObj.content.labelChose ? currEditRealObj.content.labelChose : 0
                                let currEditListObj = currEditRealObj.content.labsArr[labelChose]
                                let currEditObj = currEditListObj.dataFormData;
                                if(currEditListObj.type == 2){ //有二级菜单
                                    let slabelChose = currEditRealObj.content.slabelChose ? currEditRealObj.content.slabelChose : 0
                                     currEditObj = currEditListObj.children[slabelChose].dataFormData; //要编辑的
                                }
                            }
                            if(type){
                                if(!currEditRealObj) return false; //有问题
                                that.$set(that.listFormData,'more',JSON.parse(JSON.stringify(currEditObj.more)))
                                that.$set(that.listFormData.dataObj,'style',JSON.parse(JSON.stringify(currEditObj.dataObj.style)))
                            }else{
                                that.$set(that.listFormData,'more',JSON.parse(JSON.stringify(listDefault.more)))
                                that.$set(that.listFormData.dataObj,'style',JSON.parse(JSON.stringify(listDefault.dataObj.style)))
                                that.listFormData.dataObj.style.splitMargin = that.listFormData.dataObj.styletype == 3 && !that.listFormData.dataObj.cardStyle ? 40 : 20;
                                let service = that.listFormData.dataObj.interface.service;
                                if(service){
                                    let formData = JSON.parse(JSON.stringify(window[service +'FormData']))
                                    that.$set(that.listFormData.dataObj.modCon,'style',formData.style)
                                    if(['job','business','shop','sfcar'].includes(service)){

                                        that.$set(that.listFormData.dataObj,'cardStyle',true)
                                        that.$set(that.listFormData.dataObj.style,'cardBgColor',service == 'job' ? '#f5f5f5' : '#ffffff')
                                    }

                                    if(that.listFormData.dataObj.cardStyle){
                                        that.$set(that.listFormData.dataObj.style,'cardBgColor',that.pageSetFormData.style.bgColor)
                                        that.$set(that.listFormData.more.style,'btnHeight',70)
                                    }else{
                                        that.$set(that.listFormData.dataObj.style,'bgColor', that.pageSetFormData.style.bgColor)
                                        if(['shop','business']){
                                            that.$set(that.listFormData.more.style,'btnHeight',70)
                                        }else{
                                            that.$set(that.listFormData.more.style,'btnHeight',88)
                                        }
                                    }

                                    if(service == 'tieba'){
                                        that.$set(that.listFormData.dataObj.style,'bgColor',that.pageSetFormData.style.bgColor)
                                        that.$set(that.listFormData.dataObj.style,'cardBgColor',that.pageSetFormData.style.bgColor)
                                    }
                                }
                            }
                        break;
                    case "adv": //广告位
                        noEdit = JSON.parse(JSON.stringify(that[typename + 'FormData'].list))
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type && currEditObj ? currEditObj.content :  that[typename + 'Default']));
                        that.showContainerArr[that.currEditInd].content.btnsArr = noEdit;
                        that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        break;
                    case 'advLinks' :  //展播链接
                        noEdit = JSON.parse(JSON.stringify(that.advLinksFormData.linksArr))
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type && currEditObj ? currEditObj.content :  that[typename + 'Default']));
                        that.showContainerArr[that.currEditInd].content.linksArr = noEdit;
                        that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        break;
                    case 'swiper' :  //顶部轮播图
                        noEdit = JSON.parse(JSON.stringify(that.swiperFormData.litpics))
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type ? currEditObj.content :  that[typename + 'Default']));
                        that.showContainerArr[that.currEditInd].content.litpics = noEdit;
                        that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        break;
                    case 'title' : //分隔标题
                        if(!that.titleChangeForList){ //普通的分隔标题
                            noEdit = that.titleFormData.title.text
                            that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type && currEditObj ? currEditObj.content :  that[typename + 'Default']));
                            that.showContainerArr[that.currEditInd].content.title.text = noEdit;
                            that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        }else{  //数据列表中的标题
                            let currEditRealObj;
                            if(!Array.isArray(that.config) && that.config.compArrs && Array.isArray(that.config.compArrs)){
                                currEditRealObj = that.config.compArrs.find(item => {
                                    return item.id == 11 && that.showContainerArr[that.currEditInd].sid == item.sid
                                })
                            }
                            
                            let titleCon = JSON.parse(JSON.stringify(type && currEditRealObj ? currEditRealObj.titleMore : that[typename + 'Default']))
                            that.showContainerArr[that.currEditInd].content.titleMore = titleCon;
                            // that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content.titleMore;
                            for(let item in titleCon){
                                that.$set(that[typename + 'FormData'],item,titleCon[item])
                            }
                        }
                        break;
                    case 'qianggou':
                    case 'miaosha':
                    case 'pintuan':
                    case 'kanjia':
                        let styletype =  that.showContainerArr[that.currEditInd].content.styletype;
                        let singleShow =  that.showContainerArr[that.currEditInd].content.singleShow;
                        noEdit =  JSON.parse(JSON.stringify(that.showContainerArr[that.currEditInd].content.listArr));
                        that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(type && currEditObj? currEditObj.content :  that[typename + 'Default']));
                        that.showContainerArr[that.currEditInd].content.listArr = noEdit;
                        that.showContainerArr[that.currEditInd].content.styletype = styletype;
                        that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
                        // 以上是全组件样式
                        if(styletype == 1){  //半组件
                            that.showContainerArr[that.currEditInd].content.singleShow = 2
                            that.showContainerArr[that.currEditInd].content.bgStyle = 1
                            that.showContainerArr[that.currEditInd].content.dataObj.price.styletype = 2
                            that.showContainerArr[that.currEditInd].content.style.bgImage = masterDomain + '/static/images/admin/siteConfigPage/fullCon_bg.png'
                        }
                        break;

                    case 'busis':
                    case 'pros':
                        let prosDefault_style = JSON.parse(JSON.stringify(type && currEditObj ? currEditObj.content : prosDefault))
                        let currObj = that.showContainerArr[that.currEditInd].content;
                        currObj.style = prosDefault_style.style;
                        currObj.bgType = prosDefault_style.bgType;
                        let modArr = currObj.dataObj.modArr;
                        for(let i = 0; i < modArr.length; i++){
                            if(typename == 'pros' && currObj.interaction){ //商品组 样式一
                                let originObj = JSON.parse(JSON.stringify(style1ModOptionsDefault))
                                modArr[i].style = originObj.style
                                modArr[i].stitle.style = originObj.stitle.style
                                modArr[i].title.style = originObj.title.style
                            }else{ //其他样式  区分用 是含有proObj还是busisObj 
                                let originObj = JSON.parse(JSON.stringify(busiStyleDefault))
                                if(Object.hasOwn(modArr[i],'proObj')){ //商品
                                    originObj = JSON.parse(JSON.stringify(style2ModOptionsDefault))
                                    modArr[i]['proObj'] = originObj['proObj'];
                                }else{
                                    modArr[i]['busisObj'] = originObj['busisObj'];
                                }
                                modArr[i].style = originObj.style;
                                modArr[i].bgType = originObj.bgType;
                                modArr[i].more.style = originObj.more.style;
                                modArr[i].title.style = originObj.title.style;
                                modArr[i].stitle.style = originObj.stitle.style;
                            }
                        }
                        that.$set(that.showContainerArr[that.currEditInd],'content',currObj)
                        break;
                    case 'quan':
                        let quanStyle =JSON.parse(JSON.stringify(type && currEditObj ? currEditObj.content :quanDefault))
                        if(that.showContainerArr[that.currEditInd].typename == 'quan'){
                            let quanObj = that.showContainerArr[that.currEditInd].content;
                            quanObj['style'] = quanStyle.style
                            quanObj['quanstyle'] = quanStyle.quanstyle
                            quanObj.more['style'] = quanStyle.more.style
                            quanObj.title['style'] = quanStyle.title.style
                            quanObj.stitle['style'] = quanStyle.stitle.style
                            quanObj.bgType = quanStyle.bgType;
                            that.$set(that.showContainerArr[that.currEditInd],'content',quanObj)
                        }
                        break;

                }


            }
            that.$nextTick(() => {
                that.showResetPop = false;
            })
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
            let currlocation = window.location.href.replace('sitePageDiy.php','')
            this.$confirm('确定跳转编辑底部按钮?', '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let currlocation = window.location.href.replace('sitePageDiy.php','siteFooterBtn.php')
                currlocation = currlocation.split('?')[0]
                window.open(currlocation)
            }).catch(() => {
                console.log('关闭弹窗');
            });
        },





        // 切换官方模板
        choseModel(item,ind){
            const that = this;
            that.initModel(item,1)
            that.showholeModelStylePop = false;
            that.currEditPart = 0;
            if(!that.hasSetModel){
                that.hasSetModel = JSON.parse(JSON.stringify(item))
                that.$nextTick(() => {
                    that.initData()
                })
            }
        },


        // 改变链接弹窗显示
        changeLink(str,type){
            const that = this;
            if(!type) {  //普通链接  电话 扫一扫 
                that.currEditLinkStr =  str;
                that.linkSetPop = true
            }else{ //下拉菜单
                that.linkSetForm.slefSet = 0;   //优选常用链接
                that.showDropMenuPop = true;  //显示链接弹窗
                let dropInd = that.searchColFormData.rtBtns.btns.findIndex(item => {
                    return item.dropMenu && item.linkInfo.type == 3
                }); //找出下拉菜单
                let scanInd = that.searchColFormData.rtBtns.btns.findIndex(item => {
                    return item.dropMenu && item.linkInfo.type == 3
                }); //找出扫一扫
                that.dropMenu = JSON.parse(JSON.stringify(that.searchColFormData.rtBtns.btns[dropInd].dropMenu))
                // if(scanInd > -1){
                //     console.log(that.dropMenu)
                // }
            }

        },

        // 搜索链接
        toSearch(e){
            const that = this;
            let searchResult = [];
            for(let i = 0; i < linkListBox.length; i++){
                let group = linkListBox[i];
                let search_r = [];
                for(let m = 0; m < group.list.length; m++){
                    let link  = group.list[m];
                    if(link.linkText.indexOf(that.keywords) > -1 || link.link.indexOf(that.keywords) > -1 ){
                        search_r.push(link)
                    }
                }
                if(search_r.length){
                    searchResult.push({
                        listName:group.listName,
                        list:search_r
                    })
                }
            }
            that.searchList = searchResult;
            that.userChangeData = true; //发生改变
        },

        // 选中链接
        choseLink(link){
            const that = this;
            let el = event.currentTarget;
            $('.defaultSetBox li').removeClass('on_chose')
            $(el).addClass('on_chose');
            that.linkSetForm.linkType = 0
            that.linkSetForm.selfSetTel = 0
            that.linkSetForm.link = link.link
            that.linkSetForm.linkText = link.linkText;
            
        },

        

        // 确认修改
        sureChangeLink(){
            const that = this;
            let str = that.currEditLinkStr
            let jsonArr = str.split('.');
            var obj = that;
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length -1)){
                    // slefSet  1 ==> 自定义链接    2 ==> 扫一扫   0 => 普通链接
                    this.$set(obj, jsonArr[i], (that.linkSetForm.slefSet ? (!that.linkSetForm.linkType ? that.linkSetForm.selfLink : ('tel:' + that.linkSetForm.selfTel)) : that.linkSetForm.link)); //是否是自定义
                    let linkInfo = {
                        linkText: that.linkSetForm.slefSet === 1 ? '' :( that.linkSetForm.slefSet !== 2 ? that.linkSetForm.linkText : '扫一扫'),
                        selfSetTel:that.linkSetForm.linkType,  //为了兼容 
                        type:that.linkSetForm.slefSet == 2 ?  2 : (that.linkSetForm.linkType ? 4 : 1),  //新参数  1 => 普通链接  2 =>  扫一扫    3 => 下拉菜单  4 => 电话
                    }
                    this.$set(obj,jsonArr[i] + 'Info',linkInfo)
                    // console.log(obj[jsonArr[i]])
                    if(that.linkSetForm.slefSet == 2){  //扫一扫
                        that.addScan = true;
                    }
                }else{
                    obj = obj[jsonArr[i]]
                }
       
            }
            that.userChangeData = true; //发生改变
            that.closeSetPop()
        },

        closeSetPop(){
            const that = this;
            that.linkSetPop = false;
        },

        solveShowtext(linkInfo,link){
            const that = this;
            let showtext = link
            if(linkInfo && linkInfo.linkText){
                showtext = linkInfo.linkText
            }else if(linkInfo && linkInfo.selfSetTel){
                showtext = '拨打电话 ' + link.replace('tel:','')
            }
            return showtext
        },


        // 验证是否添加过该组件

        checkHasIn(typename,id){
            const that = this;
            if(!id || id != that.currEditPart) return false;
            let currEditObj = that.showContainerArr[that.currEditInd];
            let findObj;
            if(that.config.compArrs && currEditObj){
                let checkId = that.currEditPart
                if(id == 7 && that.titleChangeForList || id == 28){  //验证列表
                    checkId = 11
                }
                findObj = that.config.compArrs.find(item => {
                    return item.id == checkId && currEditObj.sid == item.sid
                })

            }
            return findObj && findObj.id ? 0 : 1
        },


        // 顶部左侧显示
        changeLeftMods(val,type){
            const that = this;
            if(!Array.isArray(that.pageSetFormData.search.showLeftMods)){
                that.pageSetFormData.search.showLeftMods = []
            }
            if(val){
                that.pageSetFormData.search.showLeftMods.push(type)
            }else{
                that.pageSetFormData.search.showLeftMods.splice(that.pageSetFormData.search.showLeftMods.indexOf(type),1)
            }
            // console.log(type,that.pageSetFormData.search.showLeftMods)
            that.userChangeData = true; //发生改变
        },

        changeAllSlide(value,props){
            const that = this;
            if(initAllData) return false; //正在初始化数据  不需要更新其他
            for(let i = 0; i < that.showContainerArr.length; i++){
                let obj = that.showContainerArr[i]
                if((obj.typename != 'swiper' && obj.typename != 'label') || props != 'marginTop'){
                    if(obj.content.style && obj.content.style[props] != undefined){
                        if(obj.typename == 'label'){
                            that.$set(obj.content.labsArr[0].dataFormData.dataObj.style,props,value)
                        }else{
                            that.$set(obj.content.style,props,value)

                        }
                    }
                }else if(obj.typename == 'label'){
                    let labelData = obj.content;
                    // 没有切换标题
                    if(labelData.labsArr.length == 1 ){
                        // obj.content.labsArr[0].dataFormData.dataObj.style[props] = value
                        that.$set(obj.content.labsArr[0].dataFormData.dataObj.style,props,value)
                    }else{
                        // obj.content.style[props] = value
                        that.$set(obj.content.style,props,value)
                    }
                }
            }
            that.userChangeData = true; //发生改变
        },

        // 改变模块
        changeQuanModule(val){
            const that = this;
            let interfaceObj = that.quanPopData.interface;
            if(val == 'shop'){
                interfaceObj = {
                    service:'shop',
                    action:'quanList',
                    gettype:interfaceObj.gettype,
                    pageSize:10,
                }
            }else{
                interfaceObj = {
                    service:'waimai',
                    action:'receiveQuanList',
                    getype:interfaceObj.getype,
                    pageSize:10
                }
            }
            that.quanPopData.page = 1
            that.$set(that.quanPopData,'interface',interfaceObj)
            that.toQuanList()
            that.userChangeData = true; //发生改变
        },

        changeQuanType(val){
            const that = this;
            that.quanPopData.page = 1
            that.toQuanList()
        },

        // 显示优惠券弹窗
        showQuanPop(){
            const that = this;
            that.quanlistPop = true;
            if(!that.quanPopData.quanList || !that.quanPopData.quanList.length){
                that.toQuanList()
            }
        },

        // 搜索/获取优惠券
        toQuanList(){
            const that = this;
            let interfaceObj = that.quanPopData.interface;
            interfaceObj['page'] =  that.quanPopData.page
            interfaceObj['sKeyword'] =  that.quanPopData.keyword
            if(interfaceObj['page'] == 1){
                that.quanPopData.quanList = []; // 清空
                that.quanPopData.totalCount = 0
            }
            $.ajax({
                url: '/include/ajax.php',
                type: "GET",
                data:interfaceObj,
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.quanPopData.quanList = data.info.list;
                        that.quanPopData.totalCount = data.info.pageInfo.totalCount
                    }
                },
                error: function () { }
            });
        },

        // 页码改变 重新获取数据
        quanPageChange(val){
            const that = this;
            that.quanPopData.page = val;
            that.toQuanList()
        },
        choseQuan(item){
            const that = this;
            if(!that.changeQuanInfo){

                let quanList = that.quanPopData.chosedList;
                let ind = quanList.findIndex(obj => {
                    return obj.id == item.id
                })
                if(ind > -1){
                    that.quanPopData.chosedList.splice(ind, 1)
                }else{
                    that.quanPopData.chosedList.push({
                        service:that.quanPopData.module, 
                        id:item.id,
                        desc:'', //券描述
                        label:false, //是否有标签
                        labelText:'', //标签文字
                        link:that.quanPopData.module == 'shop' ? shopQuan : waimaiQuan,
                        quanInfo:item
                    })
                }
            }else{
                let id = that.changeQuanInfo.quanInfo.id
                let quanList = that.quanPopData.chosedList;
                let ind = quanList.findIndex(obj => {
                    return obj.id == id
                })
                
                that.changeQuanInfo.quanInfo = {
                    service:that.quanPopData.module, 
                    id:item.id,
                    desc:that.changeQuanInfo.quanInfo.desc, //券描述
                    label:false, //是否有标签
                    labelText:'', //标签文字
                    quanInfo:item,
                    link:that.quanPopData.module == 'shop' ? shopQuan : waimaiQuan,
                };
                that.quanPopData.chosedList.splice(ind, 1,that.changeQuanInfo.quanInfo)
            }
        },
                    
        // 确定选择优惠券
        confirmQuanCon(){
            const that = this;
            that.quanlistPop = false;
            if(!that.changeQuanInfo){

                that.quanFormData.quanList = JSON.parse(JSON.stringify(that.quanPopData.chosedList))
                that.userChangeData = true; //发生改变
            }else{
                that.quanFormData.quanList.splice(that.changeQuanInfo.ind,1,that.changeQuanInfo.quanInfo)
            }
            that.changeQuanInfo = '';
        },

        // 验证优惠券是否被选中
        checkQuanChosed(id,arr){
            const that = this;
            let index = arr.findIndex(item => {
                return item.id == id && item.service == that.quanPopData.module
            });

            return index > -1; 
        },

        // 转文件流
        dataURLtoFile(dataURI, type) {
            let binary = atob(dataURI.split(",")[1]);
            let array = [];
            for (let i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            return new Blob([new Uint8Array(array)], { type: type });
        },

        // 验证是否可以无限加载,如果可以无限加载，排序时需要过滤
        checkOrderCan(modCon,modInd){
            const that = this;
            if(modInd != that.showContainerArr.length - 1 || modCon.id != 11 ) return false;
            return that.unlimitedLoad;
        },


        // 修改手动选择的数据
        listChangePopShow(){
            const that = this;
            const el = event.currentTarget;
        },

        // 快捷添加按钮  搜索右上角
        quickOption(val,type){
            const that = this;
            if(val){  //添加按钮
                that.addNewBtn(type)
            }else{ //删除按钮
                const btns = that.searchColFormData.rtBtns.btns;
                let btnType = type == 'scan' ? '2' : '3'; //2是扫一扫  3是下拉菜单
                let btnInd = btns.findIndex(item => {
                    return item.linkInfo.type == btnType;
                })
                that.delBtn(btnInd);
               
            }
            that.userChangeData = true; //发生改变
        },

        // 验证是否追加过下拉菜单或者扫一扫
        checkSearchRbtns(){
            const that = this;
            const btns = that.searchColFormData.rtBtns.btns;
            let drop = false; scan = false;
            for(let i = 0; i < btns.length; i++){
                if(btns[i].linkInfo && btns[i].linkInfo.type == 3){
                    drop = true;
                   let dropMenuArr = btns[i].dropMenu.linkArr;
                    //    检验下拉菜单中是否有扫一扫
                    for(let m = 0; m < dropMenuArr.length; m++){
                        if(dropMenuArr[m].linkInfo.type == 2){
                            that.hasScanBtn = true;
                            break;
                        }
                    }
                }else if(btns[i].linkInfo && btns[i].linkInfo.type == 2){
                    scan = true
                }
            }
            that.addDropMenu = drop
            that.addScan = scan
        },

        // 1/2组件和全组件切换时 需要重新计算左右
        reCountHalfPart(formData,styletype){
            const that = this;
            if(styletype == 1){ //半组件切换时 需要改变部分样式
                let singleShow = that[formData].singleShow;
                if(singleShow > 2){
                    that.$set(that[formData],'singleShow',2)
                }else if(singleShow == 1){
                    that[formData].bgStyle = 2
                }
            }else{ //半组件切全组件时 如果单行只显示一条 则固定样式
                let singleShow = that[formData].singleShow;
                if(singleShow == 1){
                    that.$set(that[formData],'bgStyle',1)
                    if(that[formData].dataObj.price.styletype < 3){
                        that[formData].dataObj.price.styletype = 4; //价格样式自动切换成样式4
                    }
                }else if(singleShow == 2){ //如果单行显示2条数据  背景样式应该是圆角 切不能切换
                    that[formData].bgStyle = 3
                }
            }


            let arr = that.showContainerArr;
            if(styletype == 1){ //切换半组件 需要将价格样式修改
                if(that[formData].dataObj.price.styletype > 2){
                    that[formData].dataObj.price.styletype = 1
                }
            }

            for(let i = 0; i < arr[i].length; i++){
                if([16,17,18,19].includes(arr[i].id)){
                    that.$delete(arr[i],'yxIndex')
                }
            }
            that.countHalfPart();

            if(styletype == 1 && that[formData].bgStyle == 3){
                that[formData].bgStyle = 2; 
            }

            // 重新计算一下高度
            that.$nextTick(() => {
                setTimeout(() => {
                    that.checkShopMarketHeight()
                }, 300);
            })
        },


        // 删除副标题/自定义内容
        delInpObj(changeStr,ind){  //changeStr => 要改变的 ind =>删除的索引
            const that = this;

            let str = changeStr
            let jsonArr = str.split('.');
            var obj = that;

            for(let i = 0; i < jsonArr.length; i++){
                obj = obj[jsonArr[i]]
            }
            obj.splice(ind,1)
            that.userChangeData = true; //用户操作改变
        },

        // 显示查看更多时，默认勾选显示标题  如果取消显示标题 则 查看更多也取消
        showMoreBtn(val,changeStr,type){
            const that = this;
            let setVal;
            
            if((val && type == 'more' || (!val && type == 'title')) && changeStr){
                let str = changeStr
                let jsonArr = str.split('.');
                var obj = that;
                for(let i = 0; i < jsonArr.length; i++){
                    if(i == (jsonArr.length -1)){
                        that.$set(obj, jsonArr[i], val); //是否是自定义
                    }else{
                        obj = obj[jsonArr[i]]
                    }
                }
            }
        },


        // 搜索栏内容组成部分改变
        searchConChange(val,type) {  //当多选框调用时即type是未定义时  val表示搜索栏显示部分 =>数组    type有值时 表示搜索热词显隐切换     
            const that = this;
            if(!type){

                if (val.includes(3) && !that.searchColFormData.hotKeysConfig.show) { //包含搜索热词 则显示热词
                    that.searchColFormData.hotKeysConfig.show = true
                }
    
                if (!val.includes(3) && that.searchColFormData.hotKeysConfig.show) { //不包含热词  则不显示热词
                    that.searchColFormData.hotKeysConfig.show = false
                }
            }else{
                if(val && !that.searchColFormData.showMods.includes(3)){
                    that.searchColFormData.showMods.push(3)
                }
                if(!val && that.searchColFormData.showMods.includes(3)){
                    let ind = that.searchColFormData.showMods.indexOf(3)
                    that.searchColFormData.showMods.splice(ind,1)
                }
            }
        },

        // 取消走马灯上移停止自动播放
        delHandleMouseEnter(ind) {
            if(!this.$refs.carousel) return false;
            for(let i = 0; i < this.$refs.carousel.length; i++){

                this.$refs.carousel[i].handleMouseEnter = () => { };
            }
        },



        // 列表设置查看更多  需显示查看更多按钮】
        setListMore(val){
            const that = this;
            that.$nextTick(() => {
                // console.log(val  || that.listFormData.more.show)
                if(val  || that.listFormData.more.show){
                    let el = $(".currEditPart .btn_more")
                    if(el.length){
                        let offsetTop = el.offset().top;
                        let scrollTop = $('.midConBox').scrollTop();
                        let height = $('.midConBox').height();
                        if(scrollTop + height < offsetTop){  //不在可视窗口范围内 需要滚动
                            $('.midConBox').scrollTop(offsetTop)
                        }
                    }
                }
            })
        },


        // 展示弹窗
        showSelectType(modCon){
            const that = this;
            let ind = that.currEditPart == 9 ? that.currProEdit : that.currBusiEdit;
            if(modCon.dataObj.modArr[ind].interface.service == 'shop' || modCon.styletype == 5){
                that.selectPop = !that.selectPop
            }
        },


        // 切换列表  卡片样式和列表样式相互切换时 修改部分样式
        listCardChange(){
            const that = this;
            // 瀑布流和双列的列表样式 默认背景是白色
            let color = that.listFormData.dataObj.style.bgColor; //默认背景样式
            let cardColor = that.listFormData.dataObj.style.cardBgColor; //默认背景样式
            that.$nextTick(() => {
                if([2,4].includes(that.listFormData.dataObj.styletype) && !that.listFormData.dataObj.cardStyle && ['business','shop'].includes(that.listFormData.dataObj.interface.service)){
                    color = '#ffffff'
                }

                if(!['business','shop'].includes(that.listFormData.dataObj.interface.service)){
                    if(that.listFormData.dataObj.cardStyle){
                        color = '#f5f5f5'
                    }else{
                        color = '#ffffff'
                    }
                }
                if(that.listFormData.dataObj.cardStyle){
                    that.$set(that.listFormData.dataObj.style,'splitMargin',20)
                }else{
                    that.$set(that.listFormData.dataObj.style,'splitMargin',40);
                    if(that.listFormData.dataObj.style.marginLeft == 0){
                        that.$set(that.listFormData.dataObj.style,'marginLeft',28);
                    }
                }
                that.$set(that.listFormData.dataObj.style,'bgColor',color)
                that.$set(that.listFormData.dataObj.style,'cardBgColor',cardColor)
            })


        },

        // 按钮内部滚动
        btnsScroll(e){
            // console.log(e)
            let el = e.currentTarget;
            let w = $(el).outerWidth(); //显示宽度
            let sl = $(el).scrollLeft(); //卷起的距离
            let pad = $(el).attr('data-padding'); //设置的左右间距
            pad = pad ? Number(pad) : 0
            let realWdith = $(el).find('.flexSwiper').length * $(el).find('.flexSwiper').width() + pad;  //内容实际宽度
            let realScrllLeft = realWdith - w; //最大可以卷起的距离
            let left = (sl / realScrllLeft) * 9
            $(el).closest('.navBtnsCon').find('.currPageIn').css({
                left:left + 'px'
            })
        },

        // 按住鼠标
        onMouseDown(e){
            // console.log('开始按住鼠标')
            // console.log(e)
        },
        // 松开鼠标
        onMouseUp(e){
            // console.log('松开鼠标')
            // console.log(e)
        },
        
        onMouseMove(e){
            // console.log('移动鼠标')
            // console.log(e)
        },

        onClick(e){
            let el = e.currentTarget;
            let obj = $(el).closest('.navBtnsCon').find('.swiper-item')
            let ow = obj.outerWidth(); //显示宽度
            let pad = obj.attr('data-padding'); //设置的左右间距
            pad = pad ? Number(pad) : 0
            let realWdith = obj.find('.flexSwiper').length * obj.find('.flexSwiper').width() + pad;  //内容实际宽度
            let offleft = (e.x - $(el).offset().left - 4)
            obj.scrollLeft(offleft / 9 * (realWdith - ow))

            offleft = offleft > 9 ? 9 : (offleft < 0 ? 0 : offleft)
            $(el).find('.currPageIn').css({
                left:offleft + 'px'
            })
        },


        // 切换样式
        changeLabelDefault(item){
            const that = this;
            let tcolor = '#EC3628'; //标题
            let stcolor = '#ffffff'; //副标题
            let tcolor_1 = '#222222'; //标题
            let stcolor_1 = '#666666'; //副标题
            let block = '#F22A18'; //色块
            let opacity = 100; //未选中标题
            let sOpacity = 100 //未选中副标题
            if(item == 1){
                tcolor = '#EC3628'
                stcolor = '#ffffff'
                tcolor_1 = '#222222'; //标题
                stcolor_1 = '#666666'; //副标题
                block = '#F22A18'; //色块
            }else if(item == 2){
                block = ''; //色块
                tcolor = '#000000'
                tcolor_1 = '#999999'; //标题
            }else if(item == 3 || item == 4){
                block = ''; //色块
                tcolor = '#000000'
                tcolor_1 = '#999999'; //标题
            }else if(item == 5){
                block = ''; //色块
                tcolor = '#1F2021'
                tcolor_1 = '#1F2021'; //标题
                stcolor = '#4D4D4D'
                stcolor_1 = '#4D4D4D'
                opacity = 40
                sOpacity = 40
            }
            that.$set(that.labelFormData.style,'chose_title',tcolor)
            that.$set(that.labelFormData.style,'title',tcolor_1)
            that.$set(that.labelFormData.style,'chose_stitle',stcolor)
            that.$set(that.labelFormData.style,'stitle',stcolor_1)
            that.$set(that.labelFormData.style,'chose_block',block)
            that.$set(that.labelFormData.style,'opacity',opacity)
            that.$set(that.labelFormData.style,'sOpacity',sOpacity)
        },


        /***
         * 城市分站/平台
         * **/ 

        // 选择城市分站进行同步
        changeChosedCity(val,obj){ //val => 是否选中  obj => 当前选中的对象
            const that = this;
            if(val){
                that.cityidChosed.push(obj.cid)
            }else{
                let ind = that.cityidChosed.indexOf(obj.cid)
                that.cityidChosed.splice(ind,1)

            }
        },

        // 全选
        choseCitySetAll(){
            const that = this;
            that.cityidChosed = that.cityCustomList.map(item => {
                return item.cid
            })
        },


        // 获取城市分站列表
        getSiteCityList:function(mod){
            const that = this;
            mod = mod ? mod : 'siteConfig'
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=siteCity&module=' + mod,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.orginalCityList = data.info
                        that.solveCityList(data.info)
                    }
                },
                error: function () { }
            });
        },

        // 处理城市分站的数据
        solveCityList(cityList){
            const that = this;
            let cityArr = []; //处理之后的分站
            let hotCity = [];  //热门
            let cityMayChose = []; //可能会选


            let cityDiyList = [],cityDiyHot = [],cityDiyMayChose = []; //可能会选

            for(let i = 0; i < cityList.length; i++){
                let city = cityList[i];
                let py = city['pinyin'].substr(0,1)
                if(cityArr[py]){
                    cityArr[py].push(city)
                }else{
                    cityArr[py] = [city]
                }

                if(city.hot == '1'){  //热门
                    hotCity.push(city)
                    cityMayChose.push(city)
                }

                if((city.default || city.cityid == cityid) && city.hot != '1'){ 
                    cityMayChose.push(city)
                }

              
                if(city.cityid == cityid){
                    that.$set(that.curr_cp,'city',city)
                    that.$set(that.currChosed_cp,'city',city)
                }


               
                if(sitePageData && sitePageData.cityDiy && Array.isArray(sitePageData.cityDiy) && cityDiyList.length < sitePageData.cityDiy.length ){
                    let ind = sitePageData.cityDiy.findIndex(item => {
                        return item.cid == city.cityid
                    });
                    if(ind > -1){
                        let newObj = {...city}
                        newObj['platform'] = sitePageData.cityDiy[ind].platform
                        that.cityDiyOrginal.push(newObj); //所有设置过模板的分站
                        
                        if(cityDiyList[py]){
                            cityDiyList[py].push(newObj)
                        }else{
                            cityDiyList[py] = [newObj]
                        }
                        
                        if(city.hot == '1'){ //热门
                            cityDiyHot.push(newObj)
                            cityDiyMayChose.push(newObj)
                        }

                        if((city.default || city.cityid == cityid) && city.hot != '1'){ 
                            cityDiyMayChose.push(newObj)
                        }
                    }

                }

            }
            that.siteCityList = cityArr; //处理过的城市分站
            that.hotCity = hotCity; //热门城市
            that.cityMayChose = cityMayChose; //可能会选

            // 设置过模板的
            
            that.cityDiyList = cityDiyList; //处理过的城市分站
            that.cityDiyHot = cityDiyHot; //热门城市
            that.cityDiyMayChose = cityDiyMayChose; //可能会选
        },


        // 匹配搜索
        querySearch(querySearch,callback){
            const that = this;
            let cityList = that.orginalCityList;
            let retults = cityList.filter((city) => {
                return city.name.indexOf(querySearch) > -1 || city.pinyin.indexOf(querySearch) > -1
            })
            if(!retults || retults.length == 0){
                that.noMatchCity = true;
                retults = [{default:'暂无相关分站'}]
            }else{
                that.noMatchCity = false;
            }
            callback(retults) 
        },


        // 选中
        handleSelect(city){
            const that = this;
            that.currChosedCity = city.cityid;
            that.$set(that.currChosed_cp,'city',city)
        },

        // 滚动到对应拼音
        cityScrollTo(item){
            const that = this;
            $(event.currentTarget).addClass('on_chose').siblings().removeClass('on_chose')
            // console.log($(".siteCityList li[data-py='"+(item)+"']").position().top)
            let scrollTop = $(".siteCityList ul").scrollTop();
            let offsetTop = $(".siteCityList li[data-py='"+(item)+"']").position().top
            $(".siteCityList ul").scrollTop(scrollTop + offsetTop - 30)
            
        },

        // 设置其他模板
        toSetOtherModule(){
            const that = this;
            let param = [];
            if(that.currChosedCity == that.currCityid && that.currChosePlatform == that.currPlatform){
                that.changeCityPop = false; that.currChosed_cp = {};
                that.linkToType = that.currCityid ? 'cityModule': 'defaultModule'; 
                that.currChosedCity = that.currCityid
                that.currChosePlatform = that.currPlatform
                return false;
            }
            if(that.currChosedCity){
                param.push('cityid=' + that.currChosedCity)
            }
            if(that.currChosePlatform){
                param.push('platform=' + that.currChosePlatform)
            }

            if(param.length){
                localStorage.setItem('newCityPlatform',JSON.stringify(that.currChosed_cp))
                param.push('change=1')
                let urlStr = location.href.replace(masterDomain,'')
                let adminStr = urlStr.split('/')[1];
                let url = '?' + param.join('&')
                window.location.href = url
            }
        },

        // 选择要切换的城市和终端
        choseCityPlatform(obj,type){
            const that = this;
            if(type == 'city'){
                that.currChosedCity = obj.cityid
                that.$set(that.currChosed_cp,'city',obj);
                that.getSiteCityInfo(obj.cityid,function(d){
                    let arr = ['h5','app','wxmin','dymini']
                    let noSet = true
                    for(let i = 0; i < arr.length; i ++){
                        if(d[arr[i]] && d[arr[i]] == 1 ){
                            noSet = false
                            break;
                        }
                    }
                    if(noSet){
                        that.showPlatformSet = false; //隐藏
                    }else{
                        that.showPlatformSet = true; //显示
                    }
                })

            }else{
                that.currChosePlatform = obj.id
                that.$set(that.currChosed_cp,'platform',obj)
            }

        },

        // 输入匹配
        cityKeyChange(val){
            const that = this;
            if(val){
                that.changeCityPover = false;
            }else{
                that.changeCityPover = true;
                that.currCityDiyChose = {}; //值为空 表示没选
            }
        },

        // 选择推荐城市
        choseCityKeyAdv(city){
            const that = this;
            let cityid = city.cityid;
            let ind = that.advancsFormData['citys'].findIndex(item => {
                return item.cityid == cityid
            })
            if(ind > -1){
                that.advancsFormData['citys'].splice(ind,1)
            }else{
                that.advancsFormData['citys'].push(city)
            }
            // that.advancsFormData['ids'] = that.advancsFormData['citys'].map(item => {
            //     return item.cityid
            // })
        },

        //删除已选城市
        removeChoseCity(ind){
            const that = this;
            that.advancsFormData['citys'].splice(ind,1)
            // that.advancsFormData['ids'] = that.advancsFormData['citys'].map(item => {
            //     return item.cityid
            // })
        },


        // 获取当前城市是否创建过模板
        getSiteCityInfo(city,callback){
            const that = this;

            $.ajax({
                url: 'sitePageDiy.php?dopost=getPlatformByCityid&cityid=' + city,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){

                        if(callback){
                            callback(data.info)
                        }
                    }
                },
                error: function () { }
            });
        },

        // 确认是否能设置终端
        showChangePop(){
            const that = this;
            // 是否禁止设置终端
            if(that.noSetPlatform){
                that.$alert('<p>首次设置分站自定义模板，将应用于所有终端<br/>提交发布后可单独设置指定终端</p>','提示', {
                    dangerouslyUseHTMLString: true,
                    customClass:'confirmFirst smConfirm', 
                    confirmButtonText:'好的',
                    callback:function(){
                        console.log('请先完成默认模板的设置')
                    }
                });
            }else{
                that.changeCityPop = true
            }
        },

        // 高级设置 弹窗显示
        advanceSetPopShow(){
            const that = this;
            that.advanceSetPop = true;
            $('.midConBox').addClass('html2Img')
            setTimeout(() => {
                that.saveImg(1,function(img){
                    if(img){
                        $(".advanceSetPop .coverShow").html(img)
                    }
                })
            }, 500);
        },

        // 高级设置  取消/关闭弹窗
        closeAdvancePop(){
            const that = this;
            let citys = that.orginalCityList.filter(obj => {
                return that.advancsFormData.ids.includes(obj.cityid)
            })
            let plats = that.terminalList.filter(obj => {
                return that.advancsFormData.platform.includes(obj.id)
            })

            that.advanceSetPop = false;
            that.$set(that.advancsFormData,'citys',citys )
            that.$set(that.advancsFormData,'plats',plats )
        },

        // 验证是否已选
        checkHasChoseCity(id){
            const that = this;
            let hasChose = false
            let city = that.advancsFormData.citys.find(obj => {
                return obj.cityid == id
            })
            if(city){
                hasChose = true
            }
            return hasChose
        },

        // 点击确定
        confirmAdvance(direct){
            const that = this;
            if((!that.advancsFormData.plats || !that.advancsFormData.plats.length || !that.advancsFormData.citys || !that.advancsFormData.citys.length) &&  that.advancsFormData.hasSet != 1) return false;
            let ids = that.advancsFormData.citys.map(item => {
                return item.cityid
            })
            let platform = that.advancsFormData.plats.map(item => {
                return item.id
            })
            that.advanceSetPop = false;
            that.$set(that.advancsFormData,'hasSet',1)
            that.$set(that.advancsFormData,'ids',ids)
            that.$set(that.advancsFormData,'platform',platform)
            if(direct == 1){
                let a = $(".advanceSetPop .coverShow img")[0]
                const file = that.dataURLtoFile($(a).attr('src'),"image/jpeg")
                that.uploadPriview(file); //将生成的图片上传
            }
        },

        // 高级设置 选中同步的终端
        chosePlatformAdv(platform){
            const that = this;
            let platformArr = that.advancsFormData['plats'];
            let ind = platformArr.findIndex(item => {
                return item.id == platform.id
            })
            if(ind > -1){
                platformArr.splice(ind,1)
            }else{
                platformArr.push(platform)
            }

            that.$set(that.advancsFormData,'plats',platformArr)
        },


        //高级设置 直接发布并同步
        directSave(){
            const that = this;
            that.fullscreenLoading = true; 
            that.confirmAdvance(1)
        },
        
        // 展示模板选择
        showModelChangePop(){
            const that = this;
            that.changeModulePop = true;
            let plat = platform ? platform : 'h5'
            that.currChosePlatform = that.currChosePlatform ? that.currChosePlatform : plat
            // that.getCovers(that.currChosePlatform,'');
            // currCityDiyChose

            that.showModelCover(that.currChosePlatform,'')
        },

        // 展示模板封面
        showModelCover(plat){
            const that = this;
            let pic = ''
            if(!that.currCityDiyChose || !that.currCityDiyChose.cityid){
                pic =  sitePageData[plat+'_cover']
            }else{
                let obj = that.currCityDiyChose.platform.find(item => {
                    return item.name == plat
                })
                    if(obj && obj.config &&  obj.config.cover){

                        pic =  obj.config.cover 
                    }
            }

            if(pic){
                
                $(".advanceSetPop .modImg").html('<img src="'+ (cfg_attachment + pic) +'">')
            }else{
                
                $(".advanceSetPop .modImg").find('img').remove()
            }

        },


        // 获取模板封面
        getCovers(plat,city){
            const that = this;
            $.ajax({
                url: 'sitePageDiy.php?dopost=getCover&platform='+(plat)+'&cityid=' + city,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        // console.log(data)
                        $(".advanceSetPop .modImg").html('<img src="'+ data.info.cover_pic +'">')
                    }
                },
                error: function () { }
            });
        },

     
         // 匹配搜索
         querySearchModel(querySearch,callback){
            const that = this;
            let cityList = Object.values(that.cityDiyList).flat(1);
         
            let retults = cityList.filter((city) => {
                return city.name.indexOf(querySearch) > -1 || city.pinyin.indexOf(querySearch) > -1
            })
            if(!retults || retults.length == 0){
                that.noMatchCity = true;
                retults = [{default:'暂无相关分站'}]
            }else{
                that.noMatchCity = false;
            }
           
            callback(retults) 
        },

        // 选择终端
        choseCityModelPlatform(terminal){
            const that = this;
            if(that.cityplatform){ //分站模板需要获取

                if(that.currCityDiyChose && that.currCityDiyChose.platform && !that.checkHasModel(terminal.id) || !that.currCityDiyChose.city){
                    that.modelPlatform = terminal.id ;
                    that.filterCityList(terminal.id); //过滤可选数据
                    that.showModelCover(terminal.id) //展示封面
                    let plat = terminal.id;
                    if(that.currCityDiyChose.cityid){
                        let cPlatform = that.currCityDiyChose.platform
                        let currModel = cPlatform.find(obj => {
                            return obj.name == plat
                        })
                        that.currChoseModel = currModel.config
                    }else{
                        that.currChoseModel = '';
                    }
                }
            }else{
                that.modelPlatform = terminal.id ;
                that.showModelCover(terminal.id) //展示封面
                that.getSystemModel(terminal.id) //获取配置
            }
        },

        // 根据终端切换数据
        filterCityList(plat){
            const that = this;
            let cityList = that.cityDiyOrginal; //原始匹配的所有设置过模板的数据
            let cityDiyList = [],cityDiyHot = [], cityDiyMayChose = [];
            for(let i = 0; i < cityList.length; i++){
                let city = cityList[i];
                let py = city['pinyin'].substr(0,1)
                if(!that.checkHasModel(plat,city)){  //与当前终端匹配
                    if(cityDiyList[py]){
                        cityDiyList[py].push(city)
                    }else{
                        cityDiyList[py] = [city]
                    }
                    if(city.hot == '1'){ //热门
                        cityDiyHot.push(city)
                        cityDiyMayChose.push(city)
                    }
        
                    if((city.default || city.cityid == cityid) && city.hot != '1'){ 
                        cityDiyMayChose.push(city)
                    }
                }
            }          
            that.cityDiyList = cityDiyList;
            that.cityDiyHot = cityDiyHot;
            that.cityDiyMayChose = cityDiyMayChose;
        },

        // 选择设置过模板的城市
        choseDiyCity(city){
            const that = this;
            that.currCityDiyChose = JSON.parse(JSON.stringify(city));
            if(that.modelPlatform){
                let cPlatform = that.currCityDiyChose.platform
                let currModel = cPlatform.find(obj => {
                    return obj.name == that.modelPlatform
                })
                that.currChoseModel = currModel.config
            }
        },

        // 验证该终端是否有模板
        checkHasModel(plat,city){
            const that = this;
            let ind = -1;
            let cityInfo = city ? city : that.currCityDiyChose;
            if(cityInfo && cityInfo.platform){
                ind = cityInfo.platform.findIndex(obj => {
                    return obj.name == plat
                })
            }

            return (ind == -1)
        },

        // 使用模板
        userModel(){
            const that = this;
            if(!that.currChoseModel) return false;
            // 选择使用模板 需要重置相关数据
            that.$set(that,'config',JSON.parse(JSON.stringify(that.currChoseModel)))
            // console.log(that.currChoseModel)
            that.$set(that,'searchColFormData',JSON.parse(JSON.stringify(that.currChoseModel.searchColFormData)))
            that.$set(that,'pageSetFormData',JSON.parse(JSON.stringify(that.currChoseModel.pageSetFormData)))
            that.$set(that,'showContainerArr',JSON.parse(JSON.stringify(that.currChoseModel.compArrs)))
            that.$nextTick(() => {
                that.initData(1)
                that.changeModulePop = false; //隐藏弹窗
            })
        },


        // 获取系统默认模板   plat => 终端
        getSystemModel(plat){
            const that = this;
            $.ajax({
                url: 'sitePageDiy.php?dopost=getData&platform=' + plat,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100) {
                        that.currChoseModel = data.info;
                    }
                },
                error:function(){},
            })
        },


        // 改变圆角时  选中按钮圆角
        checkRadius(val,formData){
            const that = this;
            that.$set(formData,'btnRadius',(val > 0 ? true : false))
        },

        // 新增 渐变背景发生变化  当变成白色时 需要强制转换成背景色
        checkBorderColor(val,formData){
            const that = this;
            if(that[formData].bgStyle != 2) return false;
            let ncolor = val
            let color = that[formData].style.bgColor;
            if(typeof(val) != 'string'){
                ncolor = $(val.currentTarget).val()
            }
            ncolor = that.colorHex(ncolor);
            ncolor = ncolor.replace('#','')
            ncolor = ncolor.toLowerCase()
            if(ncolor.indexOf)
            if((ncolor == 'ffffff') && ncolor.length == 6 ){
                ncolor = color.replace('#','');
            }
            if(ncolor.length == 6){
                that.$nextTick(() => {
                    that.$set(that[formData].style,'bgMask','#' + ncolor)
                })
            }
        },


        // 直接在标签页设置页 改变当前编辑的标签
        toEditOtherChild(ind){
            const that = this;
            let currData = JSON.parse(JSON.stringify(that.labelFormData.labsArr[ind].dataFormData));
            that.getLabStitle(); 
            that.currChosed_cid = (that.currChosed_pid == ind ? 0 : '') ; 
            that.$set(that.labelFormData.labsArr[ind].children[0],'dataFormData',currData)
            if(that.labelFormData.labsArr[ind].children.length == 1){
                that.labelFormData.labsArr[ind].children.push({
                    "id":(new Date()).valueOf(),
                    title:'', //二级标题
                    dataFormData:JSON.parse(JSON.stringify(listDefault))
                })
            }
            that.$nextTick(() => {
                that.changeEditlabel('',ind,0); 
            })
        },

        // 显示消息弹窗
        showMsgPop(){
            const that = this;
            that.msgListPop = true;
            that.msgPopData['typeid'] = that.msgFormData.articleType
            that.msgPopData['typeidArr'] = that.msgFormData.articleTypeArr
            // that.msgPopData['dlistArr'] = JSON.parse(JSON.stringify(that.msgFormData.dlistArr))
            that.$set(that.msgPopData,'dlistArr',JSON.parse(JSON.stringify(that.msgFormData.dlistArr)))
            that.msgPopData['orderby'] = that.msgFormData.order
            that.msgPopData['pageSize'] = that.msgFormData.listShow
            that.msgPopData['msgType'] = that.msgFormData.msgType
        },

        // 消息排序改变
        changeMsgOrder(val,formData){
            const that = this;
            if(formData == 'msgPopData'){
                that.msgPopData.orderby = val;
                that.getInfoMation()
            }else{
                let msgCon = that.showContainerArr[that.currEditInd]
                that.getInfoMation(msgCon,that.currEditInd)
            }
        },

        // 确认选中筛选的消息
        confirmMsgCon(){
            const that = this;
            let msgform = that.msgFormData;
            that.msgFormData.articleType = that.msgPopData.typeid;
            that.msgFormData.articleTypeArr = that.msgPopData.typeidArr;
            that.msgFormData.dlistArr = JSON.parse(JSON.stringify(that.msgPopData.dlistArr));
            that.msgFormData.msgType = that.msgPopData.msgType;
            that.msgFormData.order = that.msgPopData.orderby;
            that.msgListPop = false
        },

        // 商品组 背景样式/图片比例改变 同组的几个组件统一改变的
        prosBgStyleChange(val,formData,param){
            // prosFormData.dataObj.modArr[currProEdit]
            param = param ? param : 'bgStyle'
            const that = this;
             let modArr = that[formData].dataObj.modArr;
             for(let i = 0; i < modArr.length; i++){
                modArr[i][param] = val
             }
             that.$set(that[formData].dataObj,'modArr',modArr)
        },

        // 验证是否设置过轮播图置顶  如设置过 则隐藏搜索框背景
        checkSwiperTop(){
            let swiperTop = false;
            const that = this;
            if(that.showContainerArr && that.showContainerArr.length){

                let swiperCon = that.showContainerArr.find(obj => {
                    return obj.id == 4
                });
                if(swiperCon && swiperCon.content.styletype == 4){
                    swiperTop = true
                }
            }

            return swiperTop;
        },


        // 页面滚动到顶部
        scrollTop(){
            const that = this
            $('.midConBox').scrollTop(0); //去设置页面配置
            if(that.searchColFormData.bgType == 'color'){

                that.pageSetFormData.style['headBg'] = that.searchColFormData.style.bgColor;
            }
        },


        // 验证是否开通模块
        checkHasModule(allMod){
            const that = this;
            let allModCode = allMod.map(obj => {
                return obj.name
            })
            let allDataArr = JSON.parse(JSON.stringify(that.dataArr))
            for(item in allDataArr){
                if(item == 'other'){
                    let list = allDataArr[item].list;
                    let arr = [];
                    for(let i = 0; i < list.length; i++){
                        if(allModCode.includes(list[i].service) || list[i].service == 'business'){
                            arr.push(list[i])
                        }
                    }
                    if(arr.length){
                        that.$set(that.dataArr[item],'list',arr)
                    }else{
                        that.$delete(that.dataArr,item)
                    }
                }else if(!allModCode.includes(item)){
                    that.$delete(that.dataArr,item)
                }
            }
            // console.log(that.dataArr)
        },


        // 显示列表广告
        showListAdv(val){
            const that = this;
            that.listFormData.dataObj.modCon.advList.show = val ? true : false;
            // 列表广告如果没有 需要添加一个
            if(!that.listFormData.dataObj.modCon.advList.list || that.listFormData.dataObj.modCon.advList.list.length == 0){
                that.listFormData.dataObj.modCon.advList.list = []
                that.listFormData.dataObj.modCon.advList.list.push({
                    id:(new Date()).valueOf(),
                    path:'',
                    link:'',
                    linkInfo:{
                        linkText:'',
                        selfSetTel:0
                    },
                })
            }

            
        },



        // 同一级别列表加载数目 加载方式 同意修改
        changeListLoad(){
            const that = this;
            that.$nextTick(() => {
                let labelChose = that.labelFormData.labelChose
                let changeLab = that.labelFormData.labsArr[labelChose]

                let load = that.listFormData.dataObj.load; //是否无限加载
                let pageSize = that.listFormData.dataObj.pageSize; //无限加载时  单页加载条数
                let totalCount = that.listFormData.dataObj.totalCount //固定加载 加载的数据条数
                if(changeLab.type == 2){
                    let children = changeLab.children;
                    for(let i = 0; i < children.length; i ++){
                        if(children[i].dataFormData.addType == 1){
                            that.$set(children[i].dataFormData.dataObj,'load',load)
                            that.$set(children[i].dataFormData.dataObj,'pageSize',pageSize)
                            that.$set(children[i].dataFormData.dataObj,'totalCount',totalCount)
                        }
                    }
                }
            })
        },


        // 请求小程序码
        getMiniQr(){
            const that = this;
            if(!that.currPlatform || that.currPlatform == 'wxmini'){
                let miniPath = '/pages/diy/index?preview=1'
                $.ajax({
                    url: '/include/ajax.php?service=siteConfig&action=createWxMiniProgramScene&url='+ masterDomain +'&wxpage=' + encodeURIComponent(miniPath),
                    type: "GET",
                    // data:param,
                    dataType: "json",
                    success: function (data) {
                        if(data.state == 100){
                            $(".previewBox .miniQrBox .qrBox img").attr('src',data.info)
                        }
                    },
                    error: function () { }
                });
            }
        },


        // 重新选择优惠券
        changeQuChose(ind){
            const that = this;
            let changeQuan = that.quanFormData.quanList[ind]; //要编辑的优惠券
            that.changeQuanInfo = {
                ind:ind,
                quanInfo:changeQuan
            };
            that.quanPopData.module = changeQuan.service;
            that.quanlistPop = true;
            that.changeQuanModule(changeQuan.service)

        }

    },

    

})



