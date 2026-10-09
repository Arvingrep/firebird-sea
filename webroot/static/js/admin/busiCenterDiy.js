// config = defaultMod
var default_time = '1725503800'
var page = new Vue({
    el:'#page',
    data:{
        // preveiw:false, //预览时的遮罩
        saveType:'', // 1 => 预览
        platformChosePop:false,
         // 高级设置
         advanceSetPop:false,
         advancsFormData:{
             plats:[],
             platform:[], //id集合
         },
        terminalList:[{ id:'h5', name:'H5' },{ id:'android', name:'安卓端' },{ id:'ios', name:'苹果端' },{ id:'harmony', name:'鸿蒙端' },{ id:'wxmini', name:'微信小程序' },{ id:'dymini', name:'抖音小程序' }], //终端
        currChosePlatform:{}, //当前选择的终端
        noSetPlatform:false, //当前分站未设置过模板 不能设置终端
        moduleOptions:busiOptions, //组件
        showTooltip:false, // slide的文字提示
        showFirstTooltip:false, //首次设置的黑色提示
        preveiwSet:'',
        preveiw:false, //预览
        previewMask:false, // 预览遮罩 表示生成中
        showLine:false, //显示辅助线
        pageEditShow:true, // 编辑的蓝色框显示  
        currPlatform:platform, //当前编辑的终端
        currChosePlatform:platform, //要去编辑的终端
        fullscreenLoading:false, //加载中
        showPop:false, //显示关闭提示  小黑框
        showResetPop:false, //重置弹窗
        bottomNavs:[], //底部按钮
        showVipSet:true, // 已开通/未开通商家会员切换 
        vipAllSet:true, //商家会员全部设置

        // 会员信息
        busiInfoFormData:JSON.parse(JSON.stringify(busiInfoDefault)),
        busiInfoDefault:JSON.parse(JSON.stringify(busiInfoDefault)),
        rightInfoDefault:JSON.parse(JSON.stringify(rightInfoDefault)), // 右侧按钮选项
        showMemberCardPop:false, //显示背景图选择弹窗  暂定 可能需要删除
        defaultPath:defaultPath,
        memberBg:'', //上传的背景图片
        rightInfoSet:{}, // 右侧按钮设置

        // 数据组
        dataCountFormData:JSON.parse(JSON.stringify(dataCountDefault)), 
        dataCountDefault:JSON.parse(JSON.stringify(dataCountDefault)),  //数据组 默认设置
        dataCountHasSet:{},
        
        numToText:numToText, //数字转对应文字
        dataOptions:{  //显示数据的选项
            '1':numberOption,
            '2':numberOption2,
            '3':numberOption3,
            '4':numberOption,
        },

        // 订单
        orderDefault:JSON.parse(JSON.stringify(orderDefault)),
        orderFormData:JSON.parse(JSON.stringify(orderDefault)),
        orderConfig:orderConfig, //订单相关配置

        // 右上区域快捷操作
        addDropMenu:false, //添加下拉选项按钮
        addScan:false, //添加扫码
        hasScanBtn:false, // 已经添加过扫码按钮  修改为下拉菜单中是否添加过扫码按钮
        keywords:'' , //搜索链接关键字
        linkSetForm:{
            linkText:'', //链接标题
            link:'',  //链接
            slefSet:0, //是否是自定义
            linkType:0, // 0 => 是链接    1 => 是电话
            selfLink:'', //自定义链接
            selfTel:'',
            id:'', //新增 便于查找
        },
        linkInd:0,// 当前选中分类
        scrollH:0,

        currEditLinkStr:'', //当前编辑的链接 字符串连接 => obj.link
        linkSetPop:false, //链接弹窗
        searchList: linkListBox,  //常用链接
        // 普通按钮
        btnsFormData:JSON.parse(JSON.stringify(btnsDefault)),
        btnsDefault:btnsDefault, //普通按钮默认设置

        // 列表导航
        listNavDefault:JSON.parse(JSON.stringify(listNavDefault)),
        listNavFormData:JSON.parse(JSON.stringify(listNavDefault)),

         // 消息通知
        msgFormData:JSON.parse(JSON.stringify(msgDefault)),
        msgDefault:msgDefault, //消息通知默认设置
        
        // 排序
        // 通知类型
        msgType:[ { type:1, text:'消息通知', service:'siteConfig',action:'notice' ,},
                  { type:2, text:'手动添加', }, ], //通知类型

        advFormData:JSON.parse(JSON.stringify(advDefault)),
        advDefault:JSON.parse(JSON.stringify(advDefault)),

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

        // 选择非会员开通指定会员显示组件
        openModArr:[], //能开通会员的模块
        editModObj:{}, //正在编辑非会员开通模块 显示组件
        maskPart:'', //鼠标上移显示遮罩的id
        maskInd:'',//鼠标上移显示遮罩的索引
        editModPart:'', //当前设置会员的组件id
        editModInd:'', //当前设置会员的组件索引
        choseMod:'', //当前选择的模块 

        // 门店服务 
        storeManFormData:JSON.parse(JSON.stringify(storeManDefault)),
        storeManDefault:JSON.parse(JSON.stringify(storeManDefault)),
        storeOption:storeOption, //门店服务选项

        // 标题相关
        titleFormData:JSON.parse(JSON.stringify(titleDefault)),
        titleDefault:titleDefault,

        // 重点按钮组
        ibtnsFormData:JSON.parse(JSON.stringify(ibtnsDefault)),
        ibtnsDefault:JSON.parse(JSON.stringify(ibtnsDefault)),


        //招聘管理
        jobManFormData:JSON.parse(JSON.stringify(jobManDefault)),
        jobManDefault:JSON.parse(JSON.stringify(jobManDefault)),
        jobNumOptions:jobNumOptions, //数字默认选项


        // 商家会员
        busiVipFormData:JSON.parse(JSON.stringify(busiVipDefault)),
        busiVipDefault:JSON.parse(JSON.stringify(busiVipDefault)),
        vipSetStore:{}, //商家会员上次保存的内容

        // 页面设置
        pageSetDefault:JSON.parse(JSON.stringify(pageSetDefault)),
        pageSetFormData:config && config.pageSet || JSON.parse(JSON.stringify(pageSetDefault)),

        showTooltip:false, //删除提示小黑框是否显示
        numArr:numToText, //数字对应中文

        allTypeList:{}, //分类 => 消息通知
        offsetLeft:0,
        showMarginSet:true,
        showTypeOpt1:['默认', '划线加重' ,'图标'], //分隔标题预设

        // vipContainerArr:[], //会员添加的内容
        // noVipContainerArr:[], //非会员页面添加的内容
        showContainerArr:config && config.compsArr && JSON.parse(JSON.stringify(config.compsArr)) || [],  //当前添加的内容  
        config:config || {},
        noVIPInd:config && config.compsArr ? config.noVIPInd : '', //如果为空 则和会员的位置一致  否则插入到指定位置
        isVIPInd:'',
        currEditPart:'showSet', //当前正在编辑的部分 对应 moduleOptions中的id  pageSet => 页面设置   showSet => 非会员显隐设置
        currEditInd:0, //当前编辑的索引
        
        currDelPart:'', //要删除的组件id
        currDelInd:'', //要删除的组件索引

        showResetPop:false, //重置弹窗
        

        btnDefault:'/static/images/admin/siteMemberPage/default_icon1.png',
        btnDefault2:'/static/images/admin/siteMemberPage/default_icon2.png',
        // 弹窗
        listChosePop:false, //列表数据选中弹窗
        showDropMenuPop:false, //下拉选项弹窗

        // 排序
        allSortObj:{}, //排序存放


        dropMenu:'',
        systemMsgList:[], //系统通知
        openVip:false, //开通商家会员
        currMod:'', //当前选择的模块
        imgColor:'', //图片主色，
        // 模块导航弹窗
        modNavPop:false,
        dataChosePop:false, //显示数据来源选择弹窗
        quanlistPop:false,
        citySetPop:false,
        msgListPop:false,
        changeCityPop:false,
        // advanceSetPop:false,
        changeModulePop:false,
        modelPreviewPop:false,
        titleSetPop:false,
        dyLogoSetPop:false,

        isInit:true, //是否正在初始化
        dataCountInfo:{
            // 招聘数据统计
            job:[], //有未读的需要有提示

            // 财务统计
            data:[],
        }, //统计 需要想后端请求的数据

        numberText:['一','二','三','四','五','六','七','八','九'],
        modelChosePop:false, //选择模板弹窗
        showModelType:1, //模板弹窗显示类型  1 => 我的模板  0 => 官方模板
        modelsArr:allModels, //官方模板列表
        platsArr:['h5','app','dymini','wxmini'], //我的模板
        sitePageData:JSON.parse(sitePageData),
        moreIndex:false, //删除按钮层级
        noEdit:false, //表示不用修改
        showTipMask:false, // 表示有遮罩 不能编辑
        noScroll:false, //表示链接选择框点击左侧 不需要监听滚动
    },
    created(){
        const that = this
        var localUrl = window.location.href;
        var location = localUrl.replace(masterDomain+'/','');
        var homeUrl = masterDomain+'/'+location.split('/')[0];
        $(".backHome").attr('href',homeUrl);
        if(that.noVIPInd !== ''){
            that.isVIPInd = that.showContainerArr.findIndex(item => {
                return item.id == 33
            } )
        }
        if(that.showContainerArr && that.showContainerArr.length && that.showContainerArr[0].id == 30 && !that.showContainerArr[0].content.linkInfo ){
            that.$set(that.showContainerArr[0].content,'link','')
            that.$set(that.showContainerArr[0].content,'linkInfo',{type:1,linkText:''})
        }

        if(that.config && that.config.compsArr && that.config.compsArr.length && that.config.compsArr[0].id == 30 && !that.config.compsArr[0].content.linkInfo ){
            that.$set(that.config.compsArr[0].content,'link','')
            that.$set(that.config.compsArr[0].content,'linkInfo',{type:1,linkText:''})
        }


        if(changePage && changePage == '1'){ //从其他设置切换过来的 需要提示
            let newBusiPlatform = localStorage.getItem('newBusiPlatform',that.currChosed_cp)
            newBusiPlatform = typeof(newBusiPlatform) == 'string' ? JSON.parse(newBusiPlatform) : newBusiPlatform;
            if(newBusiPlatform && newBusiPlatform.id){
                // newBusiPlatform = JSON.parse(newBusiPlatform)
                let platform = newBusiPlatform.name
                let str = platform;
                that.$message({
                    iconClass:'smIcon',
                    customClass:'successSkip',
                    dangerouslyUseHTMLString: true,
                    message: '<span>已切换至'+(str)+'商家中心设置</span>',
                })
                setTimeout(() => {
                    let url = window.location.href;
                    let param = url.split('?')[1];
                    let paramArr = param.split('&')
                    let changeInd = paramArr.findIndex(str => {
                        return str.indexOf('change=') > -1
                    })
                    paramArr.splice(changeInd,1)
                    url = url.split('?')[0] + (paramArr.length ? '?' : '') + paramArr.join('&')
                    history.replaceState({}, '', url);
                    localStorage.removeItem('newBusiPlatform')
                }, 3000);
            }
        }

       that.defaultDataSet()

        
    },
    mounted(){
        const that = this;
        that.initModLink()
        that.resetPlatform()
        that.initDataList()
        that.initAllSort()
      
        $('body').delegate('.el-icon-close','click',function(){
            that.showVipSet = true
        })
        
        that.checkLinkBoxHeight()
    },
    computed:{

       

        // 显示名称
        checkName(){
            const that = this;
            return function(item,ind){
                let text = item.text;
                if(!text){
                    let obj = that.moduleOptions.find(obj => {
                        return obj.id == item.id
                    })
                    text = obj && obj.text || ''
                }
                let arr = that.showContainerArr;
                let count = 0
                arr = arr.filter((obj,index) => {
                    if(obj.id == item.id && ind >= index){
                        count = count + 1;
                    }
                    return obj.id == item.id
                })
                let showInd = arr.length > 1 ? (count || 1) : ''
                text = text + showInd || ''
                return text ;
            }
        },

        // 获取名称
        getModTitle(){
            const that = this;
            return function(code){
                let mod = that.openModArr.find(item => {
                    return item.code == code
                })
                return mod && mod.title || ''
            }
        },

        // 模块分组
        checkOpen(){
            return function(arr,type){
                let showArr = arr.filter(item => {
                    return item.openType == type
                })
                return showArr
            }
        },
    },
    watch:{
        'busiVipFormData.setInfo.showMod':function(val){
            const that = this;
            if(val && val.length == 3){
                that.getImageColor(val[0].icon,'busiVipFormData.setInfo.showMod.0.iconMask')
            }
        },

        'busiInfoFormData.style.bgColor':function(val){
            const that = this;
            that.setHeaderImgColor(1); //设置头部颜色
        },

        pageSetFormData:{
            handler:function(){
                if(!optAction){
                    this.pageChange()
                }
            },
            deep:true
        },

        noVIPInd:{
            handler:function(){
                if(!optAction){
                    this.pageChange()
                }
            },
            deep:true
        },

        showContainerArr:{
            handler:function(){
                if(!optAction){
                    this.pageChange()
                }
            },
            deep:true
        },
    },
    methods:{
         // 相关默认数据处理
         defaultDataSet(){
            const that = this;

             // 给链接加上id
            for(let i = 0; i < moduleLink.length; i++){
                let arr = moduleLink[i].list;
                let time = default_time;
                moduleLink[i].id = 'group_'+ (time + i)
                moduleLink[i].list = arr.map((item,ind) => {
                    return {
                        ...item,
                        id:'link_'+ moduleLink[i].code +'_'+ (time + ind)
                    }
                })
            }
            for(let i = 0; i < linkListBox.length; i++){
                let time = default_time;
                let arr = linkListBox[i].list;
                linkListBox[i].id = time + i
                linkListBox[i].list = arr.map((item,ind) => {
                    return {
                        ...item,
                        id:'other_'+ i +'_'+ (time + ind)
                    }
                })
            }
        },
        // 初始化相关数据
        initDataList(hasload){
            const that = this;
            that.isInit = true; //正在初始化

            // 初始化时 将状态调整为会员状态
            that.showVipSet = true;
            

            if(!that.showContainerArr.length){ //没有数据时 默认首先添加会员信息
                that.addModule({ id:30, text: '会员信息', icon: '', more: 0, typename: 'busiInfo' })
            }else{
                that.busiInfoFormData = that.showContainerArr[0].content
            }

            that.getBottomBtns(); //获取底部按钮
           
            if(!hasload){ //只有首次需要加载
                that.getSystemMsg(); //获取系统通知
                that.getOpenMod()
                that.getAllModules()
            }
            // 新增的 因此需要判断
            if(!that.pageSetFormData.hasOwnProperty('h5FixedTop')){
                that.$set(that.pageSetFormData,'h5FixedTop',1)
            }else{
                that.$set(that.pageSetFormData,'h5FixedTop',that.pageSetFormData.h5FixedTop ? 1 : 0)
            }

            if(!that.busiInfoFormData.hasOwnProperty('showHeader')){
                that.$set(that.busiInfoFormData,'showHeader',1)
            }else{
                that.$set(that.busiInfoFormData,'showHeader',that.busiInfoFormData.showHeader ? 1 : 0)

            }
            that.$nextTick(() => {
                that.isInit = false
                that.setHeaderImgColor(hasload || ''); //设置头部颜色
            })
        },

        // 数字转千分位
        formatNumber(str){
            if(!isNaN(str)){
                str = Number(str);
            }
            
            let str2 = str.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')

            return str2
        },

        initModLink(){
            const that = this
            let arr = []
            for(let i = 0; i < moduleLink.length; i++){
                if(moduleLink[i].code && installModuleArr.includes(moduleLink[i].code)){
                    arr.push(moduleLink[i])
                }
            }
            linkListBox = linkListBox.concat(arr)
            that.searchList = linkListBox
            
        },

        // 获取我的模板
        getAllMyModels(){
            const that = this;

        },

        // 链接滚动
        linkBoxScroll(e){
            const that = this
            let el = e.currentTarget;
            if(this.noScroll) return false;
            let scrollTop = $(el).scrollTop()
            for(let i = 0; i < $('.group').length; i++){
                let stop = scrollTop - 50 ;
                let item =  $('.group').eq(i)
                let top = item.position().top
                if(top < 50 && top + item.height() > 50){
                    that.linkInd = i
                    break;
                }
            }
        },

        

        /**
         * 去编辑组件
         * @param {object} obj 编辑的内容
         * @param {number} ind 编辑内容的索引
         * */ 
        toEditPart(obj,ind,id,direct){
            const that = this;
            that.pageEditShow = true
            that.showPop = false;
            that.vipAllSet = false; //点击组件只显示对应的
            that.noEdit = true;
            setTimeout(() => {
                that.noEdit = false;
            }, 1000);
            if(that.showVipSet || obj.id == 33){  //可以编辑
                that.currEditPart = obj.id;
                that.currEditInd = ind;
                that[obj.typename + 'FormData'] = obj.content;
                if(obj.id == 32){
                    that.dataCountHasSet = {}; //清空
                }
            }else{
                // 处于非会员状态 不能编辑其他  
                // that.currEditPart = 'showSet';
                if(that.showTipMask) return false
                that.showTipMask = true
                that.$message({
                    message: '请在已开通商家中设置组件样式>',
                    type: 'warning',
                    customClass:'errorMsg changeVipSet',
                    showClose:true,
                    // duration:0,
                    onClose:function(){
                        that.showTipMask = false;
                    }
                  });
            }

            if(obj.id == 6){
                that.checkLeft(obj.content.column - 1, $(".cipianBox .column_chose"))
            }
                console.log(obj,ind)
        },

        /**
         * 添加组件
         * @param {object} obj 追加的对象 
         * */ 
        addModule(obj){
            const that = this;
            // that.pageChange();//页面已修改; //表示已操作页面  退出时 需要确认
            let currId = obj.id;
            let currtypename = obj.typename
            // 门店服务和按钮组共用一个组件 但是 门店服务只能添加一个  门店服务是35  有特殊字段 type是store
            let index = that.showContainerArr.findIndex(item => {
                return (item.id == currId  && !obj.type) || (currId == item.id && currId == 35 && obj.type == 'store'  && item.content.isStore)
            }); // 当前组件是否已经添加过

            let isStore = obj.id == 35 && obj.type == 'store' ? true : false
            if(that.currEditPart == 35 && isStore != that.storeManFormData.isStore){
                that.currEditPart = '';
                
            }

            if(obj.id == 33){
                // 表示添加商家会员
                that.showVipSet = false;
                that.vipAllSet = true;
            }else{
                that.showVipSet = true;
                that.vipAllSet = false;
            }

            let addObj = {}; //要追加的数据
            if(index > -1 && !obj.more ){ //该组件只能添加一次  表示去编辑此项
                if(currId == 35 && isStore != that.storeManFormData.isStore){
                    setTimeout(() => {
                        that.currEditPart = currId
                    }, 100);
                }else{
                    that.currEditPart = currId
    
                }
                that.currEditInd = index; //当前正在编辑这个
                that[currtypename + 'FormData'] = that.showContainerArr[index].content
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

            
            addObj = {
                id:obj.id,
                sid:currtypename + '_' + (new Date()).valueOf(),
                typename:currtypename,
                text:obj.text, //标题
                noVipShow:1, //非会员是否显示 
                openVipMod:'', //开通模块之后显示
                content:JSON.parse(that.catchJsonErr(that[currtypename + 'Default']))
            };
            if(obj.typename == 'storeMan' && !obj.type){
                let len = addObj.content.column ;
                let btnsArr = []
                for(let i = 0; i < len; i++){
                    btnsArr.push({
                        "id":(new Date()).valueOf() + i,
                        "text":"",
                        "link":"",
                        "lab":{
                            "show":false, //是否显示标签
                            "text":"", //标签
                        },
                        "linkInfo":{
                            "type":"",
                            "linkText":"",
                        } 
                    })
                }
                addObj.content.btns = btnsArr
                if(obj.type == 'store'){
                    addObj.content.isStore = true
                }else{
                    addObj.content.isStore = false
                }
            }

            if(obj.typename == 'storeMan' && isStore){
                addObj.content.btns = []
                for(let i = 0; i < that.storeOption.length; i++){
                    let item =  that.storeOption[i]
                    addObj.content.btns.push({
                        ...item,
                        "link":`${businessUrl}/business-${item.id}-order.html`,
                        "linkInfo":{
                            "type":1,
                            "linkText":item.text,
                        }
                    })
                }
            }

            if(obj.id == 35 && isStore != that.storeManFormData.isStore){
                setTimeout(() => {
                    that.currEditPart = obj.id
                }, 100);
            }else{
                that.currEditPart = obj.id

            }
            that.showContainerArr.push(addObj)
            that.currEditInd = that.showContainerArr.length - 1
            that[currtypename + 'FormData'] = that.showContainerArr[that.currEditInd].content;
            // 获取系统嘻嘻
            if(obj.id == 20 && that.systemMsgList.length == 0){
                that.getSystemMsg()
            }
            

            setTimeout(() => {
                that.$nextTick(() => {
                    let wh = $(window).height()
                    let scrollTop = $('.midConBox').scrollTop()
                    let offTop = $('.currEditPart') && $('.currEditPart').length && $('.currEditPart').position().top || 0;
                    if(offTop > wh && (offTop - scrollTop) > wh){
                        $('.midConBox').scrollTop((offTop - scrollTop) - wh / 2)
                    }else if(offTop <= wh){
                        $('.midConBox').scrollTop((offTop - scrollTop) - wh / 2)
                    }
                })
            }, 300);
        },

        /**
         * 删除组件
         * @param {*} ind   删除组件的索引
         * @param {*} id  删除组件的id
         */
        delModBox(ind,id){
            const that = this;
            optAction = true; //表示已操作页面  退出时 需要确认
            let delObj = JSON.parse(JSON.stringify(that.showContainerArr[ind]));
            if(id == 33 && that.showVipSet){ //在已开通页面删除商家会员组件 =>  在已开通页面隐藏组件
                that.showContainerArr[ind]
                that.$set(that.showContainerArr[ind].content,'vipShow',false)
                that.showPop = false;
                that.showTitle = false;
                return false;
            }else if(id == 33){
                ind = that.showContainerArr.findIndex(item => {
                    return item.id == id
                })
                delObj = JSON.parse(JSON.stringify(that.showContainerArr[ind]));
                that.noVIPInd = ''; //删除需要清空

            }
            if(that.currEditPart == delObj.id && that.currEditInd == ind){
                // 表示删除的是正在编辑的组件，那编辑下一个
                let lastObj = that.showContainerArr[(ind - 1) > 0 ? (ind - 1) : 0]
                if(ind == 0){
                    lastObj = that.showContainerArr[1]
                }
                that.currEditPart = lastObj && lastObj.id ? lastObj.id : 0;
                that.currEditInd = ((ind - 1) > 0 ? (ind - 1) : 0);
            }else if(ind < that.currEditInd ){
                // 表示删除的在编辑组件的上面
                that.currEditInd = that.currEditInd - 1
            }

            that.showPop = false;
            that.showTitle = false;
            that.showContainerArr.splice(ind,1)
            
        },

        /**
         * 是否选中
         * @param {object} obj 对比的对象
         * @param {Array} btns 对比的数组  
         * */ 
        // checkValIn(obj,btns){
        //     let id = obj.id;
        //     let ind = btns.findIndex(item => {
        //         return item.id == id
        //     })

        //     return ind > -1
        // },

        //高级设置 直接发布并同步
        directSave(){
            const that = this;
            that.fullscreenLoading = true; 
            that.confirmAdvance(1)
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

        // 复制组件
        copyPart(){
            const that = this;
            let el = event.currentTarget
            
            if($(el).hasClass('disabled')) {
                // that.$message.error('此组件只能复制一次' )
                that.$message({
                    message: that.currEditPart && !['pageSet','showSet'].includes(that.currEditPart) ? '此组件只能添加一次':'请选择需要复制的组件',
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
            // that.pageChange();//页面已修改
        },

        /**
         * 对比
         * 通过对比原有数组中的sid和id查找对应组件 在来修改其中的显示/隐藏
         * **/ 
        compareComps(){
            const that = this;
            for(let i = 0; i < that.config.compsArr.length; i++){
                let sid = that.config.compsArr[i].sid; // 通过对比原有数组中的sid
                let id = that.config.compsArr[i].id;
                let noVipShow = that.config.compsArr[i].noVipShow; 
                let obj = that.showContainerArr.find(item => {
                    return item.sid == sid && id == item.id
                })
                if(!obj) continue;
                that.$set(obj,'noVipShow',noVipShow)
            }
        },

        // 重置
        resetItem(typename,type){  //type表示重置类型 1 表示重置上一次  0表示重置成初始数据
            const that = this;

            // that.pageChange();//页面已修改
            if(typename == 'showSet'){
                // 重置组件的显示与隐藏
                if(type == 0){
                    for(let i = 0; i < that.showContainerArr.length; i++){
                        that.$set(that.showContainerArr[i],'noVipShow',1)
                        that.$set(that.showContainerArr[i],'openVipMod','')
                    }
                }else{
                    that.compareComps();
                }
                that.showResetPop = false;
                return false;
            }else if(typename == 'pageSet'){
                let resetObj = null
                if(type == 0){
                    // 恢复默认
                    resetObj = JSON.parse(JSON.stringify(that.pageSetDefault))
                }else{
                    // 恢复上次
                    resetObj = JSON.parse(JSON.stringify(that.config.pageSet))
                }

                that.$set(that.pageSetFormData,'style',resetObj.style)
                that.$set(that.pageSetFormData.rBtns,'style',resetObj.rBtns.style)
                that.$set(that.pageSetFormData.title,'style',resetObj.title.style)
                that.$set(that.pageSetFormData.title,'posi',resetObj.title.posi)
                that.showResetPop = false;
                return false;
            }



            if(type == 1){
                lastObj = config.compsArr.find(item => {
                    return item.sid == that.showContainerArr[that.currEditInd].sid
                })
                that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(lastObj.content))
                that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content
            }else{
                let obj = JSON.parse(JSON.stringify(that[typename + 'FormData']))
                let default_obj = that[typename + 'Default'];
                if(typename == 'busiInfo'){
                    that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(default_obj))
                }else if(typename == 'dataCount'){
                    let numId = that.showContainerArr[that.currEditInd].content.numSet.id;
                    let newNumSet = numberSetArr.find(item => {return item.id == numId})
                    that.showContainerArr[that.currEditInd].content.numSet =  JSON.parse(JSON.stringify(newNumSet))
                    that.showContainerArr[that.currEditInd].content.numSet.numShow = obj.numSet.numShow
                    if(numId == 3){
                        that.showContainerArr[that.currEditInd].content.numSet.titleNum.numShow = obj.numSet.titleNum.numShow
                    }
                }else if(typename == 'busiVip'){
                    let styletype = that.showContainerArr[that.currEditInd].content.styletype;
                    default_obj = JSON.parse(JSON.stringify(that[typename + 'Default']))
                    if(that.showContainerArr[that.currEditInd].content.setInfo.style){
                        that.showContainerArr[that.currEditInd].content.setInfo.style = vipConfig[styletype].style;
                    }
                    if(styletype == 1){
                        that.showContainerArr[that.currEditInd].content.setInfo.title.style = vipConfig[styletype].title.style
                        that.showContainerArr[that.currEditInd].content.setInfo.stitle.style = vipConfig[styletype].stitle.style
                        that.showContainerArr[that.currEditInd].content.setInfo.more.style = vipConfig[styletype].more.style
                    }else{
                        that.showContainerArr[that.currEditInd].content.setInfo.noVip.style = vipConfig[styletype].noVip.style
                        that.showContainerArr[that.currEditInd].content.setInfo.isVip.style = vipConfig[styletype].isVip.style

                    }
                }else if(typename == 'order'){
                    let orderInfo = obj.orderInfo;
                    that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(default_obj))
                    that.showContainerArr[that.currEditInd].content.orderInfo = orderInfo
                }else{
                    that.showContainerArr[that.currEditInd].content = JSON.parse(JSON.stringify(default_obj))
                    if(that.showContainerArr[that.currEditInd].content.btns){
                        that.showContainerArr[that.currEditInd].content.btns = JSON.parse(JSON.stringify(obj.btns))
                    }
                    
                    if(that.showContainerArr[that.currEditInd].content.btns_imp){
                        that.showContainerArr[that.currEditInd].content.btns_imp = JSON.parse(JSON.stringify(obj.btns_imp))
                    }

                    if(obj.title){
                        that.showContainerArr[that.currEditInd].content.title = JSON.parse(JSON.stringify(obj.title))
                        that.showContainerArr[that.currEditInd].content.title.style = JSON.parse(JSON.stringify(default_obj.title.style))
                    }
                }
                if(obj.hasOwnProperty('isStore')){
                    that.showContainerArr[that.currEditInd].content.isStore = obj.isStore
                }
                if(obj.style){
                    that.showContainerArr[that.currEditInd].content.style = JSON.parse(JSON.stringify(default_obj.style))
                }
                
                if(obj.more){
                    that.showContainerArr[that.currEditInd].content.more.link = obj.more.link
                    that.showContainerArr[that.currEditInd].content.more.linkInfo = JSON.parse(JSON.stringify(obj.more.linkInfo))
                }
            }
            that[typename + 'FormData'] = that.showContainerArr[that.currEditInd].content
            that.showResetPop = false;
        },
        // 显示蓝色编辑框？
        changeBorde(e){
            const that = this;
            let target = e.target;
            if($(target).closest('.truePage').length > 0){
                that.pageEditShow = true;
            }else{
                that.currEditPart = 'showSet'
                that.pageEditShow = false
            }
        },

        // 验证是否购买过终端
        checkTerminal(terminal){
            const that = this;
            let obj = that.terminalList.find(item => {
                return item.id == terminal
            })
            return (obj && obj.buy)
        },

         // 获取底部按钮数据
        getBottomBtns(){
            const that = this;
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
                let currlocation = window.location.href.replace('busiCenterDiy.php','siteFooterBtn.php')
                currlocation = currlocation.split('?')[0]
                window.open(currlocation)
            }).catch(() => {
                console.log('关闭弹窗');
            });
        },

        // 验证上次保存的模板是否添加过该组件
        checkHasIn(typename,id){
            const that = this;
            if(id != that.currEditPart) return false;
            let findObj;
           
            let currEditObj = that.showContainerArr[that.currEditInd];
            if(that.config.compsArr && currEditObj){
                let checkId = that.currEditPart
                findObj = that.config.compsArr.find(item => {
                    return item.id == checkId && currEditObj.sid == item.sid
                })

            }
            return findObj ? 1 : 0
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

        // 消息通知组件 获取通告/通知/广告   
        getInfoMation(obj,ind){  
            //obj表示需要加载的内容 ind表示obj在当前模板数据中的索引  如果obj 和ind都没有 则表示 是在加载弹窗
        
        },

        // 文字处理
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

        // 改变圆角时  选中按钮圆角
        checkRadius(val,formData){
            const that = this;
            that.$set(formData,'btnRadius',(val > 0 ? true : false))
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

        // 深色模式切换
        changeThemeStyle(style){
            const that = this;
            that.busiInfoFormData.themeType = style;
            // 切换样式
            // if(style == 'light'){
            //     that.dark.number = that.busiInfoFormData.numberCount.numberStyle.color;
            //     that.dark.title =   that.busiInfoFormData.numberCount.titleStyle.color;
            //     that.dark.arr_color =   that.busiInfoFormData.qiandaoBtn.style.arr_color;
            //     that.busiInfoFormData.numberCount.numberStyle.color = '#FFFFFF'
            //     that.busiInfoFormData.numberCount.titleStyle.color = '#FFFFFF'
            //     that.busiInfoFormData.qiandaoBtn.style.arr_color = '#FFFFFF'
            // }else{
            //     that.busiInfoFormData.numberCount.numberStyle.color = that.dark.number
            //     that.busiInfoFormData.numberCount.titleStyle.color = that.dark.title
            //     that.busiInfoFormData.qiandaoBtn.style.arr_color = that.dark.arr_color
            // }
        },

         // 快捷添加按钮  搜索右上角
        quickOption(val,type){
            const that = this;
            if(val ){  //添加按钮
                that.addNewBtn(type)
            }else{ //删除按钮
                const btns = that.busiInfoFormData.rtBtns.btns;
                let btnType = type == 'scan' ? '2' : '3'; //2是扫一扫  3是下拉菜单
                let btnInd = btns.findIndex(item => {
                    return item.linkInfo.type == btnType;
                })
                that.delBtn(btnInd);
            }
        },

        //新增右上按钮
        addNewBtn(type){
            const that = this;
            let btnArr = [];
            let btns =  that.busiInfoFormData.rtBtns.btns ? that.busiInfoFormData.rtBtns.btns : [];
            if(btns.length >= 3) return false; // 最多添加3个
            


            if(type == 'scan'){
                btnArr = [{
                    "id": 'scan' + (new Date()).valueOf(),
                    "text": "扫码",
                    "icon": masterDomain + '/static/images/admin/siteConfigPage/scanDefault.png',
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
                    "icon": masterDomain + '/static/images/admin/siteConfigPage/dropDefault.png',
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
            that.busiInfoFormData.rtBtns.btns = btns.concat(btnArr)
            that.$set(that.busiInfoFormData.rtBtns,'btns',btns.concat(btnArr))
        },

        // 删除右上按钮
        delBtn(ind){
            const that = this;
            if(that.busiInfoFormData.rtBtns.btns[ind].linkInfo.type == 2){
                that.addScan = false;
            }else if(that.busiInfoFormData.rtBtns.btns[ind].linkInfo.type == 3){
                that.addDropMenu = false
            }
            that.busiInfoFormData.rtBtns.btns.splice(ind,1)
        },

        changeRtBtns(key){
            const that = this;
            that.pageSetFormData.rBtns.showType = key;
            if(that.pageSetFormData.rBtns.btns.length == 0){
                that.addNewTopBtns('pageSetFormData.rBtns')
            }
        },

        // 链接筛选
        skipLink(ind){
            const that = this;
            that.linkInd = ind
            that.noScroll = true
            that.$nextTick(() => {
                let top = $('.listGroup .group').eq(ind).position().top
                let scrollObj = $('.linkSetBox .defaultSetBox')
                let scrollTop = scrollObj.scrollTop();
                scrollObj.scrollTop(scrollTop + top - 50)
                $('.listGroup .group').eq(ind).addClass('posiMask')
                setTimeout(() => {
                    $('.listGroup .group').eq(ind).removeClass('posiMask')
                    that.noScroll = false
                }, 1000);
            })
        },

        // 确认修改链接
        sureChangeLink(){
            const that = this;
            let str = that.currEditLinkStr
            let jsonArr = str.split('.');
            var obj = that;

            if(that.openVip && that.currMod){
                let nobj = that;
                let lastObjStr = str.replace('.link','')
                let lastStrArr = lastObjStr.split('.');
                for(let i = 0; i < lastStrArr.length; i++){
                    nobj = nobj[lastStrArr[i]]
                }
                let oldIcon = nobj['icon'];
                let oldtitle =  nobj['title'];
                let oldNote =  nobj['subTitle'];
                that.$set(nobj,'code',that.currMod.code)
                that.$set(nobj,'icon',that.currMod.icon || oldIcon)
                that.$set(nobj,'title',that.currMod.title || oldtitle)
                that.$set(nobj,'subTitle',that.currMod.note || oldNote)
                that.$set(nobj,'iconMask',''); //icon遮罩
                that.getImageColor(that.currMod.icon || oldIcon,lastObjStr + '.iconMask')
            }
            for(let i = 0; i < jsonArr.length; i++){
                if(i == (jsonArr.length -1)){
                    // slefSet  1 ==> 自定义链接    2 ==> 扫一扫   0 => 普通链接
                    this.$set(obj, jsonArr[i], (that.linkSetForm.slefSet ? (!that.linkSetForm.linkType ? that.linkSetForm.selfLink : ( that.linkSetForm.selfTel)) : that.linkSetForm.link)); //是否是自定义
                    let linkInfo = {
                        linkText: that.linkSetForm.slefSet === 1 ? '' :( that.linkSetForm.slefSet !== 2 ? that.linkSetForm.linkText : '扫一扫'),
                        selfSetTel:that.linkSetForm.linkType,  //为了兼容 
                        type:that.linkSetForm.slefSet == 2 ?  2 : (that.linkSetForm.linkType ? 4 : 1),  //新参数  1 => 普通链接  2 =>  扫一扫    3 => 下拉菜单  4 => 电话
                        name:that.linkSetForm.slefSet === 0 && that.linkSetForm.name  || '', //是否为模块链接
                        id:that.linkSetForm.id,
                        homePage:that.linkSetForm.homePage || '',
                        needId:that.linkSetForm.needId
                    }
                    if(that.linkSetForm.mini){
                        that.$set(linkInfo,'mini',that.linkSetForm.mini)
                    }
                    if(that.linkSetForm.miniPath_code){
                        that.$set(linkInfo,'miniPath_code',that.linkSetForm.miniPath_code)
                    }
                    this.$set(obj,jsonArr[i] + 'Info',linkInfo)
                    if(that.linkSetForm.slefSet == 2){  //扫一扫
                        that.addScan = true;
                    }
                }else{
                    obj = obj[jsonArr[i]]
                }
       
            }
            that.closeSetPop()
        },

        // 关闭链接设置弹窗
        closeSetPop(){
            const that = this;
            that.linkSetPop = false;
            that.openVip = false;
            that.currMod = '';
        },

        // 改变链接弹窗显示
        changeLink(str,type){
            const that = this;
            if(!type) {  //普通链接  电话 扫一扫 
                that.currEditLinkStr =  str;
                that.linkSetPop = true;

                // 获取当前要改的链接
                let strArr = str.split('.');
                let obj = this;
                let linkInfo = '';
                let currLink = ''
                for(let i = 0; i < strArr.length; i++){
                    if(strArr[i] == 'link'){
                        linkInfo = obj['linkInfo']
                        currLink = obj['link']
                    }else{
                        obj = obj[strArr[i]]
                    }
                }
                that.linkSetForm.selfLink = '';
                that.linkSetForm.slefSet = 0
                if(linkInfo && linkInfo.type){

                    if(linkInfo.type == 2){ //扫码
                        that.linkSetForm.slefSet = 2
                    }else if(linkInfo.type == 4){ //电话
                        that.linkSetForm.slefSet = 1
                        that.linkSetForm.selfLink  = currLink
                        that.linkSetForm.linkType = 1
                    }else if(linkInfo.type == 1){ //普通链接
                        that.linkSetForm.slefSet = linkInfo.linkText ? 0 : 1; //linkText有值表示常规链接  没有表示自定义链接
                        if(!linkInfo.linkText){
                            that.linkSetForm.linkType = 0
                            that.linkSetForm.selfLink  = currLink
                        }

                        if(linkInfo.id){
                            that.linkSetForm.id = linkInfo.id
                            that.getChoseLink(linkInfo.id)
                        }
                    }
                }
                that.$nextTick(() => {
                    if(that.linkInd){
                        $('.left_tab .subTitle .li').eq(that.linkInd).click();
                    }
                })
            }else{ //下拉菜单
                that.linkSetForm.slefSet = 0;   //优选常用链接
                that.showDropMenuPop = true;  //显示链接弹窗
                let dropInd = that.busiInfoFormData.rtBtns.btns.findIndex(item => {
                    return item.dropMenu && item.linkInfo.type == 3
                }); //找出下拉菜单
                let scanInd = that.busiInfoFormData.rtBtns.btns.findIndex(item => {
                    return item.dropMenu && item.linkInfo.type == 3
                }); //找出扫一扫
                that.dropMenu = JSON.parse(JSON.stringify(that.busiInfoFormData.rtBtns.btns[dropInd].dropMenu))
                
                // if(scanInd > -1){
                //     console.log(that.dropMenu)
                // }
            }
        },

        // 获取选择的链接
        getChoseLink(id){
            const that = this;
            let arr = that.searchList;
            outer:for(let i = 0; i < arr.length; i++){
                let list = arr[i].list
                for(let m = 0; m < list.length; m++){
                    if(list[m].id == id) {
                        console.log(id)
                        that.$nextTick(() => {
                            $('.left_tab .subTitle .li').eq(i).click();
                            $('.listGroup .group').eq(i).find('li').eq(m).addClass('on_chose')
                        })
                        break outer;
                    }
                }
            }
        },

        // 设置链接弹窗高度
        checkLinkBoxHeight(){
            let vh = $(window).height();
            let scroll = vh * 80 / 100 - 160 - 132
            this.scrollH =  scroll
        },


        // 选择开通会员的模块
        showOpenVip(str){
            const that = this
            that.currEditLinkStr =  str;
            that.linkSetPop = true;
            that.openVip = true
        },

         // 搜索链接
        toSearch(e){
            const that = this;
            let searchResult = [];
            for(let i = 0; i < linkListBox.length; i++){
                let group = linkListBox[i];
                let search_r = [];
                if(group.listName.includes(that.keywords) ){
                    searchResult.push(group)
                    continue;
                }
                for(let m = 0; m < group.list.length; m++){
                    let link  = group.list[m];
                    if(link.linkText.indexOf(that.keywords) > -1 || link.link.indexOf(that.keywords) > -1 ){
                        search_r.push(link)
                    }
                }
                if(search_r.length){
                    searchResult.push({
                        listName:group.listName,
                        list:search_r,
                        id:group.id
                    })
                }
            }
            that.searchList = searchResult;
        },

        // 选中链接
        choseLink(link){
            const that = this;
            let el = event.currentTarget;
            $('.defaultSetBox li').removeClass('on_chose')
            $(el).addClass('on_chose');
            
            that.linkSetForm.linkType = link.link.includes('tel') ? 4 : 0 
            that.linkSetForm.selfSetTel = 0
            that.linkSetForm.link = link.link
            that.linkSetForm.id = link.id
            that.linkSetForm.linkText = link.linkText;
            that.linkSetForm.homePage = link.homePage || '';
            that.linkSetForm.needId = link.needId ? true : false;
            if(link.mini){
                that.$set(that.linkSetForm,'mini',link.mini)
            }else{
                that.$delete(that.linkSetForm,'mini')
            }
            if(link.miniPath_code){
                that.$set(that.linkSetForm,'miniPath_code',link.miniPath_code)
            }else{
                that.$delete(that.linkSetForm,'miniPath_code')

            }

            if(link.name){ //模块链接
                that.$set(that.linkSetForm, 'name', link.name)
            }else{ //非模块链接
                that.$set(that.linkSetForm, 'name', '')
            }

            // 开通会员
            that.currMod = link.isOpenVip && link.isOpenVip == 1 ? link : '';
            
        },

           // 色彩选择器颜色改变
        activeChangeColor(color,changeStr){
            const that = this;
            if(color){
                color = that.colorHex(color);
            }else{
                color = ''
            }

            that.changeObj(changeStr,color)
        },

        // 主要是设置清空/确定
        pickerChangeColor(color,changeStr){
            const that = this;
            if(!color){ //清空之后 color是null  需要 手动赋值
                color = ''
            }
            that.changeObj(changeStr,color)
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
        },

         // 重置颜色
        resetColor(changeStr,val,changeTo){ 
            
            // 部分取色器清空也是触发该方法和重置是一个效果    val是空状态时 表示清空  changeTo表示要改变的颜色 
            const that = this;
            changeTo = changeTo != undefined ? changeTo : that.checkChangeTo(changeStr)
            if(!val){ //由于取色器是监听change方法 只要值改变都会触发 但实际只有清空按钮应该触发
                let strArr_c = changeStr.split('.');
                let strArr = changeStr.split('.');
                let defaultStr = strArr[0].replace('FormData','Default');
                strArr.splice(0,1,defaultStr);
                let obj = that;
                let obj_c = that;
                
                for(let i = 0; i < strArr_c.length; i++){
                    if(i == (strArr_c.length -1)){
                        if(changeTo != undefined){
                            that.$set(obj, strArr[i], changeTo); 
                        }else{
                            let dcolor = obj_c && obj_c[strArr[i]] ? obj_c[strArr[i]] : ''
                            that.$set(obj, strArr[i], dcolor);
                        }
                    }else{
                        obj = obj[strArr_c[i]];
                        if(strArr_c[i] == 'modCon' && strArr_c[0] == 'listFormData'){
                            let service = that.listFormData.showObj.service
                            obj_c = that[service + 'FormData']
                            
                        }else{
                            if(obj_c && obj_c[strArr[i]] != undefined){
                                obj_c = obj_c[strArr[i]];
                            }
                        }
                    }
                }
            }
            console.log(that.pageSetFormData.style.bgColor2)
        },

        /**
         * 获取重置颜色  部分风格不一致的重置颜色也不同 需要重新获取
         * @param {*} changeStr  要改变的颜色
         * @param {number} skip 是否直接跳转到修改颜色  1 => 跳转 
         * */ 

        checkChangeTo(changeStr){
            const that = this;
            let changeTo = '';
            if(changeStr.indexOf('busiInfoFormData.rightInfo') > -1){
                let btnStyle = that.busiInfoFormData.rightInfo.btnStyle;
                let rdefault = rightInfoDefault.find(item => {
                    return item.id == btnStyle;
                })
                changeTo = that.getObjVal(changeStr.replace('busiInfoFormData.rightInfo.btn.',''),rdefault.btnDefault)
            }else if(changeStr.indexOf('dataCountFormData.numSet') > -1){
                let numSet_id = that.dataCountFormData.numSet.id;
                let default_obj = numberSetArr.find(item => {
                    return item.id == numSet_id
                })
                changeTo = that.getObjVal(changeStr.replace('dataCountFormData.numSet.',''),default_obj)
            }else if(changeStr.indexOf('busiVipFormData.setInfo') > -1){
                let styletype = that.busiVipFormData.styletype;
                let styleObj = vipConfig[styletype]
                changeTo = that.getObjVal(changeStr.replace('busiVipFormData.setInfo.',''),styleObj) 
            }else{
                let strArr = changeStr.split('.')
                let defaultStr = strArr[0].replace('FormData','Default') + changeStr.replace(strArr[0],'')
                let arr_default  = defaultStr.split('.')
                let obj = that;
                changeTo = that.getObjVal(defaultStr,obj)
            }
            return changeTo;
        },


        /**
         * 获取 指定的值
         * @param {string} str 字符串 获取指定值的路径
         * @param {object} obj  obj是获取指定值的对象  obj的层级深度 必须大于等于str.split('.')的长度
         * */  
        getObjVal(str,obj){
            const that = this;
            let nobj = obj;
            let arr = str.split('.');
            for(let i= 0; i < arr.length; i++ ){
                nobj = nobj[arr[i]]
            }

            return nobj
        },


        // 色值转换
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

        // 背景色和透明度转换
        checkBgColor(bgColor,opc){
            const that = this;
            opc = opc || opc === '0' ? opc : 100;
            let opacity = (opc / 100).toFixed(2);
            const alphaHexMap = { '1.00':'FF', '0.99':'FC', '0.98':'FA', '0.97':'F7', '0.96':'F5', '0.95':'F2', '0.94':'F0', '0.93':'ED', '0.92':'EB', '0.91':'E8', '0.90':'E6', '0.89':'E3', '0.88':'E0', '0.87':'DE', '0.86':'DB', '0.85':'D9', '0.84':'D6', '0.83':'D4', '0.82':'D1', '0.81':'CF', '0.80':'CC', '0.79':'C9', '0.78':'C7', '0.77':'C4', '0.76':'C2', '0.75':'BF', '0.74':'BD', '0.73':'BA', '0.72':'B8', '0.71':'B5', '0.70':'B3', '0.69':'B0', '0.68':'AD', '0.67':'AB', '0.66':'A8', '0.65':'A6', '0.64':'A3', '0.63':'A1', '0.62':'9E', '0.61':'9C', '0.60':'99', '0.59':'96', '0.58':'94', '0.57':'91', '0.56':'8F', '0.55':'8C', '0.54':'8A', '0.53':'87', '0.52':'85', '0.51':'82', '0.50':'80', '0.49':'7D', '0.48':'7A', '0.47':'78', '0.46':'75', '0.45':'73', '0.44':'70', '0.43':'6E', '0.42':'6B', '0.41':'69', '0.40':'66', '0.39':'63', '0.38':'61', '0.37':'5E', '0.36':'5C', '0.35':'59', '0.34':'57', '0.33':'54', '0.32':'52', '0.31':'4F', '0.30':'4D', '0.29':'4A', '0.28':'47', '0.27':'45', '0.26':'42', '0.25':'40', '0.24':'3D', '0.23':'3B', '0.22':'38', '0.21':'36', '0.20':'33', '0.19':'30', '0.18':'2E', '0.17':'2B', '0.16':'29', '0.15':'26', '0.14':'24', '0.13':'21', '0.12':'1F', '0.11':'1C', '0.10':'1A', '0.09':'17', '0.08':'14', '0.07':'12', '0.06':'0F', '0.05':'0D', '0.04':'0A', '0.03':'08', '0.02':'05', '0.01':'03', '0.00':'00', }
            
            let color =  bgColor + alphaHexMap[opacity]; //转换之后的色值
            return color
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

        // 验证是否是模板中的组件  如果是模板中的组件 重置时 应该有重置模板组件样式
        checkModelHasIn(){
            const that = this;
            // 当前使用的模板
            let currUseModel = that.modelsArr.find(item => {
                return item.directory == that.model_directory
            })
            return currUseModel
        },


           // 验证当前组件是否在使用的模板中
        checkCompInModel(){
            const that = this;
            // let id = modCon.id;
            // let sid = modCon.sid;
            let id = that.currEditPart;
            let currUseModel = that.checkModelHasIn();
            let comp = ''
            if(currUseModel && id > 1 && that.showContainerArr[that.currEditInd] &&  id == that.showContainerArr[that.currEditInd].id ){ //表示在compsArr中的 其他是固定组件 无需判断
                let sid = that.showContainerArr[that.currEditInd] && that.showContainerArr[that.currEditInd].sid ? that.showContainerArr[that.currEditInd].sid : ''
                let compsArr = currUseModel.compsArr;
                comp = compsArr.find(item => {
                    return item.id == id && (sid && sid == item.sid)
                })
            }
            return comp 
        },


        // 修改右侧会员信息显示
        changeRightShow(item){
            const that = this;
            if(item.id == that.busiInfoFormData.rightInfo.btnStyle) return false; 
            that.$set(that.rightInfoSet,that.busiInfoFormData.rightInfo.btnStyle,JSON.parse(JSON.stringify(that.busiInfoFormData.rightInfo)))
            if(that.rightInfoSet[item.id]){
                that.busiInfoFormData.rightInfo.btnStyle = item.id
                that.busiInfoFormData.rightInfo.btn = JSON.parse(JSON.stringify(that.rightInfoSet[item.id].btn))
            }else{
                that.busiInfoFormData.rightInfo.btnStyle = item.id
                that.busiInfoFormData.rightInfo.btn = item.btnDefault
            }
        },

        // 取消保存修改的模块
        getOriginModule(){
            const that = this;
            that.allModules = JSON.parse(JSON.stringify(that.originModules))
            that.modNavPop = false;
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
                if(type == 2){
                    that.hasScanBtn = true;
                }
                that.dropMenu.linkArr.push({
                    text: type == 2 ? "扫码" : "电话",
                    icon: "",
                    link: "",  
                    linkInfo:{ //链接相关信息
                        type:type, // 1 => 普通链接   2 => 扫码   4 => 拨打电话
                        linkText:type == 2 ? '扫码' : '', //显示的文字
                    }, 
                })
            }else{
                if(that.dropMenu.linkArr[type].linkInfo.type == 2){ //删除扫码按钮
                    that.hasScanBtn = false;
                }
                that.dropMenu.linkArr.splice(type,1); //删除链接
            }
        },

        // 确认下拉菜单内容
        sureDropSet(){
            const that = this;
            let dropInd = that.busiInfoFormData.rtBtns.btns.findIndex(item => {
                return item.dropMenu && item.linkInfo.type == 3
            }); //找出下拉菜单
            that.busiInfoFormData.rtBtns.btns[dropInd].dropMenu = JSON.parse(JSON.stringify(that.dropMenu));  //给下拉菜单
            that.showDropMenuPop = false;  //隐藏弹窗
            that.userChangeData = true
        },


        // 切换风格
        choseBtnLen(item){
            const that = this;
            if(that.dataCountFormData.numSet.id == item) return false; // 没改变风格 不需要设置
            let setInfo = {
                numSet:JSON.parse(JSON.stringify(that.dataCountFormData.numSet)),
                title:that.dataCountFormData.title.show,
                more:that.dataCountFormData.more.show,
                splitLine:that.dataCountFormData.splitLine
            }
            that.$set(that.dataCountHasSet,that.dataCountFormData.numSet.id,JSON.parse(JSON.stringify(setInfo)))
            // 判断是否设置过标题
            if(that.dataCountHasSet[item]){
                that.$set(that.dataCountFormData,'numSet',JSON.parse(JSON.stringify(that.dataCountHasSet[item].numSet)))
                that.$set(that.dataCountFormData.title,'show',that.dataCountHasSet[item].title)
                that.$set(that.dataCountFormData.more,'show',that.dataCountHasSet[item].more)
                that.$set(that.dataCountFormData,'splitLine',that.dataCountHasSet[item].splitLine)
            }else{
                that.dataCountFormData.numSet.id = item;
                let titleObj = JSON.parse(JSON.stringify(that.dataCountFormData.title))
                let numberSetArr_n =  JSON.parse(JSON.stringify(numberSetArr))
                let chose_num = numberSetArr_n.find(obj => {
                    return obj.id == item
                })
                titleObj.show = false;
                if(JSON.stringify(titleObj) == JSON.stringify(that.dataCountDefault.title)){
                    if(item == 1){
                        that.dataCountFormData.title.show = false;
                        that.dataCountFormData.more.show = false;
                    }else{
                        that.dataCountFormData.title.show = true;
                    }
    
                    that.dataCountFormData.splitLine =  item == 3 ? 1 : 0;
                }
                that.dataCountFormData.numSet = JSON.parse(JSON.stringify(chose_num))
            }



        },

        // 验证json数组中 是否包含
        checkValIn(listObj,id){
            const that = this;
            let ind = listObj.findIndex(item => {
                return item.id == id
            })

            return ind > -1
        },

        // 选择显示的数据选项
        pullIn(item,obj,num = 4){
            const that = this;
            let numShow = obj.numShow
            let arr = numShow.map(item => {
                return item.id
            })
            item['showText'] = item.text; //显示的文字
            if(arr.includes(item.id)){
                let ind = arr.indexOf(item.id);
                numShow.splice(ind,1)
            }else{
                // 暂定最多选4个
                if(arr.length >= num){
                    that.$message({
                        message:'可显示项已达上限',
                        type: 'warning',
                        customClass:'errorMsg',
                        showClose:true,
                      });
                }else{
                    numShow.push(item)
                }
            }
            that.$set(obj,'numShow',JSON.parse(JSON.stringify(numShow)))
        },

        // 修改显示的数据
        changeTitleNum(item,obj){
            const that = this;
            item['showText'] = item.text; //显示的文字
            that.$set(obj,'numShow',JSON.parse(JSON.stringify(item)))
        },

        // 选择瓷片广告的类型
        choseAdvType(ind){
            const that = this;
            that.advFormData.column = ind ;
            let parObj = $(event.currentTarget).closest('.column_chose')
            that.checkLeft(ind - 1, parObj)
            that.advFormData.list = that.advFormData.list.filter(item => {
                return item.image || item.link
            })
            if(that.advFormData.list.length < ind){
                let dataArr = []
                for(let i = 0; i <  (ind - that.advFormData.list.length); i++){
                    dataArr.push({
                        image:'',
                        link:'',
                    })
                }
                that.advFormData.list = that.advFormData.list.concat(dataArr)
            
            }
            
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


        // 上传文件
        fileInpChange(paramStr){
            const that = this;
            let file = event.target['files'][0]            
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    let tempPath = this.result;
                    that.changeObj(paramStr,tempPath)
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    that.uploadImg(formData,paramStr)
                    
                }
            } 

        },

        /**
         * 逐个上传图片
         * @param {object} data 上传图片所需的formdata格式的数据
         * @param {string} paramStr  上传成功之后 要修改的对应的值
         * */ 
         uploadImg(data,paramStr){
            const that = this;
            $.ajax({
                accepts:{},
                url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                data: data,
                type: "POST",
                processData: false, // 使数据不做处理
                contentType: false,
                dataType: "json",
                success: function (data) {
                    if(data.state == 'SUCCESS'){
                        let imgPath = data.turl
                        that.changeObj(paramStr,imgPath)
                        // 图标
                        if(paramStr.includes('busiVipFormData.setInfo.showMod')){
                            let nstr = paramStr.replace('.icon','.iconMask');
                            that.getImageColor(imgPath,nstr)
                        }
                    }else{
                        alert('图片上传失败，请稍后重试');
                        that.changeObj(paramStr,'')
                    }
                },
                xhr:function(){
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.onprogress = function(e) {
                            if (e.lengthComputable) {
                                var percent = Math.floor( e.loaded / e.total * 100);
                                console.log(percent);
                                if(percent == 100){
                                    // $(".barColor").hide();
                                }else{
                                   console.log(percent)
                                }
                            }
                        };
                    }
                    return xhr;
                },
                error: function () { }
            });
        },

        //  jsonStr => 'busiInfoFormData.business.icon'
        /**
         * 修改对应的值
         * @param {string} jsonStr  要修改的值的字符串连接
         * @param {*} val 要修改的值
         * @example changeObj('busiInfoFormData.business.icon','/static/images/admin/add.png)
        */
        changeObj(jsonStr,val){
            const that = this;
            let arr = jsonStr.split('.');
            let obj = this;
            for(let i = 0; i < arr.length; i++){
                if(i == (arr.length -1)){
                    this.$set(obj, arr[i], val); 
                }else{
                    obj = obj[arr[i]]
                }
            }

            if(jsonStr.indexOf('title.image') > -1){
                let nStr = jsonStr.replace('title.image','title.type')
                that.changeObj(nStr,'image')
            }else if(jsonStr.indexOf('style.bgImage') > -1){
                let nStr = jsonStr.replace('style.bgImage','bgType')
                that.changeObj(nStr,'image')
            }
            // if(!that.noEdit){ //表示不用修改
            //     console.log(11111)
            //     that.pageChange(); //页面已修改
            // }
        },

        /**
         * 门店服务 快捷选择
         * @param {Boolean} val 是否勾选
         * @param {object} item 当前勾选的选项    
         */

        changeStoreBtns(val,item){
            const that = this;
            if(val){
                that.storeManFormData.btns.push({
                    ...item,
                    "link":`${masterDomain}/business/${item.id}-1.html`,
                    "linkInfo":{
                        "type":1,
                        "linkText":item.text,
                        "homePage":item.id
                    } 
                })
            }else{
                let ind = that.storeManFormData.btns.findIndex(obj => {
                    return obj.id == item.id 
                })
                if(ind > -1){
                    that.storeManFormData.btns.splice(ind,1)
                }
            }
            // that.pageChange(); //页面已修改
        },


        /**
         * 添加按钮
         * @param {string} objStr // 要添加的按钮对象名
         * @param {string} type // 添加的类型 
         * */ 
        addNewTopBtns(objStr,type = 'btns'){
            const that = this;
            // that.pageChange(); //页面已修改
            if(objStr == 'busiVipFormData'){
                that[objStr].setInfo.showMod.push({
                    id: (new Date()).valueOf(),
                    icon:'',
                    title:'',
                    subTitle:'',
                    link:'',
                    linkInfo:{
                        type:1,
                        text:'',
                    }
                })
                return false;
            }else if(objStr == 'pageSetFormData.rBtns'){
                that.pageSetFormData.rBtns.btns.push({
                    "id":(new Date()).valueOf(),
                    "icon":'',
                    "text":"",
                    "link":"",
                    "linkInfo":{
                        "type":"",
                        "linkText":"",
                    } 
                })
                return false;
            }
            if(type == 'btns'){
                let obj = {
                    "id":(new Date()).valueOf(),
                    "text":"",
                    "link":"",
                    "linkInfo":{
                        "type":"",
                        "linkText":"",
                    } 
                }
                that[objStr].btns.push(obj)
            }else if(type == 'list'){
                that[objStr].listArr.push({
                    "id":(new Date()).valueOf(),
                    "text":"",
                    "link":"",
                    "linkInfo":{
                        "type":"",
                        "linkText":"",
                    } 
                })
            }else if(type == 'list1'){
                that[objStr].list.push({
                    "id":(new Date()).valueOf(),
                    "text":"",
                    "tip":{
                        show:false,
                        text:'',
                    },
                    "link":"",
                    "linkInfo":{
                        "type":"",
                        "linkText":"",
                    } 
                })
            }
        },

        /**
         * 删除按钮
         * @param {string} objStr  要删除的按钮对象名
         * @param {Number} ind 删除的索引 
         * */ 
        delTopBtns(objStr,ind){
            const that = this;
            if(objStr == 'busiVipFormData'){
                that.busiVipFormData.setInfo.showMod.splice(ind,1)
            }else if(objStr == 'pageSetFormData.rBtns'){
                that.pageSetFormData.rBtns.btns.splice(ind,1)
            }else{
                that[objStr].btns.splice(ind,1);
            }
            // that.pageChange(); //页面已修改
        },

        /**
         * 新增广告
         * */ 
        addMoreBtn(){
            const that = this;
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
            // that.pageChange(); //页面已修改
        },

        // 获取系统通知
        getSystemMsg(){
            const that = this;
            // $.ajax({
            //     url: '/include/ajax.php?service=member&action=message&page=1&pageSize=20',
            //     type: "GET",
            //     dataType: "json",
            //     success: function (data) {
            //         if(data.state == 100){
            //             that.systemMsgList = data.info.list;
            //         }
            //     },
            //     error: function () { }
            // });
            that.systemMsgList = [{ title:'您有一条系统消息' },{ title:'店铺审核通知' },{ title:'您的帐户积分有新的变动' }]
        },

        /**
         * 商家会员切换风格
         * @param {Number} styletype 风格  1是基础样式  2 是自定义样式 
        */
        changeStyle(styletype){
            const that = this;
            if(styletype == that.busiVipFormData.styletype) return false;
            that.$set(that.vipSetStore,that.busiVipFormData.styletype,that.busiVipFormData.setInfo)
            if(that.vipSetStore[styletype]){
                that.busiVipFormData.setInfo = JSON.parse(JSON.stringify(that.vipSetStore[styletype]))
            }else{

                let def_obj = JSON.parse(JSON.stringify(vipConfig[styletype]))
                if(styletype == 1){ //自定义样式
                    let modArr = that.openModArr.slice(0,3)
                    let showMod = modArr.map(item => {
                        return {
                            code:item.code,
                            icon:item.icon,
                            link:item.link,
                            subTitle:item.note,
                            title:item.title,
                            linkInfo:{
                                type:1,
                                linkText:item.title,
                            }
                        }
                    })
                    def_obj['showMod'] = showMod
                }
                that.busiVipFormData.setInfo = def_obj;
                if(styletype == 1 && def_obj.showMod && def_obj.showMod.length == 3){
                    that.getImageColor(def_obj.showMod[0].icon,'busiVipFormData.setInfo.showMod.0.iconMask')
                }
            }
            that.busiVipFormData.styletype = styletype;
            // that.pageChange(); //页面已修改
        },

        // 获取所有模块数据
        getAllModules(){ 
            const that = this;
            let ind = linkListBox.findIndex(item => {
                return item.listName == '导航链接'
            })
            if(ind > -1){
                linkListBox.splice(ind,1)
            }
            $.ajax({
                url: 'sitePageDiy.php?dopost=siteModuleList',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    let linkArr = [];
                    let formData = data.map((item,ind) => {
                        let obj = {
                            link:item.link,
                            linkText:item.subject,
                            ...item,  //此处作用是位添加时标注模块  可以让小程序 点开原生页面
                        }
                        obj.id = 'module_' + item.id
                        linkArr.push(obj)
                        return {
                            ...item,
                            weight:ind,
                        }
                    })
                    let time = default_time
                    linkListBox.push({
                        list:linkArr,
                        id:'mgroup_' + time,
                        listName:'导航链接'
                    })

                    console.log(moduleLink)
                
                },
                error: function () { }
            });
        },

        /**
         * 获取可开通商家的模块
         * */ 
        getOpenMod(){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service=business&action=config',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        let openModArr = [];
                        let jobMod = false;
                        for(let item in data.info.store){
                            let obj = data.info.store[item];
                            openModArr.push({
                                ...obj,
                                link:item == 'job' ? (masterDomain + '/supplier/job/jobmeal.html'):(businessUrl + '/servicemeal.html?mod=' + item),
                                linkText:obj.title,
                                isOpenVip:1,
                                code:item,
                                openType:1,
                                id:item+ '_vip'
                            })
                            if(item == 'job'){
                                jobMod = true
                            }
                        }
                        if(!jobMod && installModuleArr.includes('job')){
                            openModArr.push({
                                icon:masterDomain + '/static/images/admin/nav/job.png',
                                note:'线上沟通，邀请面试\n随时随地招人才',
                                title:'在线招聘',
                                link:masterDomain + '/supplier/job/jobmeal.html',
                                linkText:'在线招聘',
                                isOpenVip:1,
                                code:'job',
                                openType:1,
                                id:'job_vip'
                            })
                        }
                        for(let item in data.info.privilege){
                            let obj = data.info.privilege[item];
                            openModArr.push({
                                ...obj,
                                link:businessUrl + '/servicemeal.html?mod=' + item,
                                linkText:obj.title,
                                isOpenVip:1,
                                code:item,
                                openType:2,
                                id:item+ '_vip'
                            })
                        }

                        linkListBox.unshift({
                            list:openModArr,
                            listName:'开通商家会员'
                        })

                        that.openModArr = openModArr
                    }
                
                },
                error: function () { }
            });
        },

        /**
         * 获取图片主色
         * @param {string} imgUrl 图片地址
         * @param {string} jsonStr 要修改的颜色值 
         * */ 
        getImageColor(imgUrl,jsonStr){
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
                that.imgColor = resImageObj.hex;
                that.changeObj(jsonStr,resImageObj.hex)
            }
            img.src = imgUrl;
            img.crossOrigin = "anonymous"
        },

        // 追加滚动副标题
        addStitle(){
            const that = this;
            that['busiVipFormData'].setInfo.stitle.textArr.push({
                value:''
            })
            // that.pageChange(); //页面已修改
        },
        
        /**
         * 切换订单
         * @param {string} code 表示订单模块code 
         * */ 
        changeOrderInfo(code){
            const that = this;
            if(code == 'paimai'){
                that.orderFormData.styletype = 3
            }
            that.orderFormData.orderInfo = {
                code:code,
                title:that.orderConfig[code].title,
                ajax:that.orderConfig[code].param, //请求接口
                showData:[],
            }
            for(let i = 0; i < oDefaultConfig[code].showData.length; i++){
                let item = oDefaultConfig[code].showData[i]
                that.changeOrderShow(true,item)
            }

            // that.pageChange(); //页面已修改
        },

        /**
         * 选择订单显示的选项
         * @param {boolean} val 表示当前是否被选中
         * @param {object} item 选中的数据对象  
         * */ 
        changeOrderShow(val,item){
            const that = this;
            if(val){ //选中
                let obj = {
                    id:item.id,
                    text:item.text,
                    link:item.link,
                    param:item.state, //获取数据的key
                    icon:item.icon,
                    numShow:item.count,
                    style:{
                        color:'#333333',
                    },
                    linkInfo:{
                        type:1,
                        linkText:item.text
                    }
                }
                that.orderFormData.orderInfo.showData.push(obj)
            }else{ //取消选中
                let ind = that.orderFormData.orderInfo.showData.findIndex(obj => {
                    return obj.id == item.id
                })
                that.orderFormData.orderInfo.showData.splice(ind,1)
            }

            // that.pageChange(); //页面已修改
        },

        /**
         * 标注当前正在设置显示/隐藏的组件
         * @param {object} item 表示组件内容
         * @param {number} ind 表示组件索引
         * @param {number} [show=1]  1表示鼠标上移 和 0离开  
        */
        showMask(item,ind,show = 1){
            const that = this;
            if(!show){
                that.maskInd = ''
                that.maskPart = ''
            }else{
               

                if(that.showVipSet){ //已开通
                    that.maskInd = ind
                    that.maskPart = item.id

                }else{
                    
                    that.maskPart = item.id
                    let arr = JSON.parse(JSON.stringify(that.getOrder(that.showContainerArr)))
                    let ind_r = arr.findIndex(obj => {
                        return obj.sid == item.sid
                    })
                    that.maskInd = ind_r
                }
                
            }

            
        },


        /**
         * 显示选择模块弹窗
         * */ 
        showDataPop(item,ind){
            const that = this;
            that.dataChosePop = true;
            that.editModPart = item.id;
            that.editModInd = ind;
            that.choseMod = {
                code:item.openVipMod
            }
            that.pageChange(); //页面已修改
        },

        // 确认选择
        confirmChose(){
            const that = this;
            if(that.showContainerArr[that.editModInd].id == that.editModPart){
                that.$set(that.showContainerArr[that.editModInd],'openVipMod',that.choseMod.code)
            }else{
                console.log('数据错误')
            }
            that.dataChosePop = false;
            that.pageChange(); //页面已修改
        },


        scrollTop(){
            const that = this;
            $('.midConBox').scrollTop(0); //去设置页面配置
        },


        // 初始化所有排序数据
        initAllSort(){
            const that = this;
            $('.sortBox').each(function(){
                let sortEl = $(this)[0];
                let sortKey = $(this).attr('data-sort') ? $(this).attr('data-sort') : '';
                let dragEl = $(this).attr('data-drag') ? $(this).attr('data-drag') : '';
                let filterEl = $(this).attr('data-filter') ? $(this).attr('data-filter') : '';
                if(!that.allSortObj[sortKey]){
                    that.allSortObj[sortKey] = Sortable.create(sortEl,{
                        animation: 150,
                        forceFallback:(sortKey == 'showContainerArr' ? true : false),
                        scroll:false,
                        dragClass:'draggleBox',
                        draggable:dragEl,
                        filter:filterEl,
                        preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                        onEnd: function(evt){
                            let arr = this.toArray()
                            let arrNew = arr.map(item => {
                                let num = item
                                if(item.includes('_')){
                                    num = item.split('_')[0]
                                }
                                return num
                            })

                            // 查找拖拽之后的索引
                            let currInd = arrNew.findIndex(item => {
                                return item == that.currEditInd
                            })
                            that.currEditInd = currInd;

                            if(sortKey == 'showContainerArr' && !that.showVipSet){ //非会员拖拽
                                let ind = arr.findIndex(item => {
                                    if(item.indexOf('_33') > -1){
                                        that.isVIPInd = item.split('_')[0]
                                    }
                                    return item.indexOf('_33') > -1
                                })
                                that.noVIPInd = ind
                            }else{

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
                                    that.changeObj(sortKey,newArr)
                                })
                            }
                   
                        }
                    })
                }

                
                
            })
        },

        // 重新获取数据 => 切换会员/非会员的显示
        getOrder(){
            const that = this;
            let arr = that.showContainerArr;
            if(that.noVIPInd != '' && !that.showVipSet){
                arr = JSON.parse(JSON.stringify(that.showContainerArr));
                let vipComInd = arr.findIndex(item => {
                    return item.id == 33
                })
                let vipComp = that.showContainerArr[vipComInd]
                arr.splice(vipComInd,1)
                arr.splice(that.noVIPInd,0,vipComp)
            }else{
                // let vipComInd = arr.findIndex(item => {
                //     return item.id == 33
                // })
                // console.log(vipComInd,)
            }
            return arr
        },

        // 确定选择
        sureChoseMemberBg(){
            const that = this;
            let pic = ''
            if(that.busiInfoFormData.style.bgID === ''){ //手动上传的背景图
                pic = that.memberBg
            }else{
                pic = defaultPath_center + 'bg_' + (that.busiInfoFormData.style.bgID > 9 ? that.busiInfoFormData.style.bgID : ('0' + that.busiInfoFormData.style.bgID)) + '.png'
            }

            that.busiInfoFormData.style.bgImage = pic; //赋值
            that.busiInfoFormData.bgType = 'image'; //赋值
            that.showMemberCardPop = false; //隐藏弹窗
            that.setHeaderImgColor(1); //设置头部颜色
            // that.pageChange(); //页面已修改
        },

        // 验证是否超过最大/最小值
        checkMax(min,max,paramStr){ 
            const that = this;
            let el = event.currentTarget;
            let val = $(el).val();
            if(val && Number(val) > max){
                val = max
            }
            if(val && Number(val) < min){
                val = min
            }

            let newVal = Number(val ? val : 0)
            that.changeObj(paramStr,newVal)
        },

        /**
         * 改变全局的指定值
         * @param {string} param 指定参数
         * @param {*} val 改变的值 
         */
        allCompsChange(param,val){
            const that = this;
            if(!that.isInit){
                
                for(let i = 0; i < that.showContainerArr.length; i++){
                    let currObj = that.showContainerArr[i]
                    let styleObj = currObj.content.style
                    if(currObj.id == 32){
                        styleObj = currObj.content.numSet.style
                    }else if(currObj.id == 33){
                        styleObj = currObj.content.setInfo.style
                    }

                    if(styleObj.hasOwnProperty(param)){
                        that.$set(styleObj,param,val)
                    }else if(param == 'borderRadius'){
                        that.$set(styleObj,'borderRadiusTop',val)
                        that.$set(styleObj,'borderRadiusBottom',val)
                    }
                }
                
                // that.pageChange(); //页面已修改
            }
        },

          // 没设置过默认模板 提示
          showMessageTip(){
            const that = this
              // 初次进入页面设置时的提示  此处需要作判断   
            that.$alert('<p>完成后可在此切换，单独设置终端，<br/> 未单独设置的都将使用系统默认</p>', '请先设置系统默认模板', {
                dangerouslyUseHTMLString: true,
                customClass:'confirmFirst', 
                confirmButtonText:'好的',
                callback:function(){
                    console.log('请先完成默认模板的设置')
                }
            });
        },
        // 确认是否能设置终端
        showChangePop(){
            const that = this;
            // 是否禁止设置终端
            if(that.noSetPlatform){
                that.$alert('<p>首次设置个人中心自定义模板，将应用于所有终端</br> 提交发布后可在此切换，单独设置各终端</p>','提示', {
                    dangerouslyUseHTMLString: true,
                    customClass:'confirmFirst smConfirm', 
                    confirmButtonText:'好的',
                    callback:function(){
                        console.log('请先完成默认模板的设置')
                    }
                });
            }else{
                that.platformChosePop = true
            }

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
                that.$set(plat,'buy',1)

                if(platform == plat.id){
                  that.$set(that,'currPlatform',plat)
                  that.$set(that,'currChosePlatform',plat)
                }
            }
        },

         // 切换终端
         chosePlatform(item){
            const that = this;
            that.currChosePlatform = item;
        },

        // 确定切换终端
        sureChangePlatform(){
            const that = this
            let str =  'platform=' + that.currChosePlatform.id + '&change=1';
            // 关闭弹窗
            if(that.currChosePlatform.id == that.currPlatform.id){
                that.platformChosePop = false;
                return false;
            }

            localStorage.setItem('newBusiPlatform',JSON.stringify(that.currChosePlatform))
            let url =  '?' + str
            window.location.href = url
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
            let plats = that.terminalList.filter(obj => {
                return that.advancsFormData.platform.includes(obj.id)
            })

            that.advanceSetPop = false;
            that.$set(that.advancsFormData,'plats',plats )
        },
        HexToInt (hexChar ) {
            var hex = "" + hexChar;
            hex = hex.toUpperCase()
            switch (hex) {
                case "0": return 0;
                case "1": return 1;
                case "2": return 2;
                case "3": return 3;
                case "4": return 4;
                case "5": return 5;
                case "6": return 6;
                case "7": return 7;
                case "8": return 8;
                case "9": return 9;
                case "A": return 10;
                case "B": return 11;
                case "C": return 12;
                case "D": return 13;
                case "E": return 14;
                case "F": return 15;
            }
        },
        HexToRGB(color){
            const that = this;
            color = color.replace('#','')
            red = (that.HexToInt(color[1]) + that.HexToInt(color[0]) * 16.000) / 255;
            green = (that.HexToInt(color[3]) + that.HexToInt(color[2]) * 16.000) / 255;
            blue = (that.HexToInt(color[5]) + that.HexToInt(color[4]) * 16.000) / 255;
            var finalColor = {
                r:red,
                g:green,
                b:blue,
                a:1
            };
            return finalColor;
        }, 

        // 计算颜色矩阵
        checkSvgColor(color){
            let rgbColor = this.HexToRGB(color)
            let val = `0 0 0 0 ${rgbColor.r}
                       0 0 0 0 ${rgbColor.g}
                       0 0 0 0 ${rgbColor.b}
                       0 0 0 1 0`
            return val
        },


        // 统计设置非会员隐藏的数目
        countVip(){
            const that = this;
            let ind = that.showContainerArr.findIndex(item => {
                return item.noVipShow == 0
            })
            return ind > -1
        },

         // 点击确定
         confirmAdvance(direct){
            const that = this;
            let platform = that.advancsFormData.plats.map(item => {
                return item.id
            })
            that.advanceSetPop = false;
            that.$set(that.advancsFormData,'hasSet',1)
            that.$set(that.advancsFormData,'platform',platform)
            if(direct == 1){
                let a = $(".advanceSetPop .coverShow img")[0]
                const file = that.dataURLtoFile($(a).attr('src'),"image/jpeg")
                that.uploadPriview(file); //将生成的图片上传
            }

            optAction = false; //表示已操作页面  退出时 需要确认
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
                width:374,
                logging:false,
                height:760,
                ignoreElements:(element)=>{
                    if(element.id ==='pageTop' || element.id ==='pageTop1')
                    return true;
                },
            }).then(canvas => {
                var a = that.canvasToImage(canvas); 
                $('.midContainer').removeClass('html2Img');
                $("body").append(a)
                $('.midConBox').removeClass('html2Img')
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
            $(".canvasImg").remove()
            var image = new Image();
            image.setAttribute("crossOrigin", 'anonymous')
            image.setAttribute("class", 'canvasImg')
            var imageBase64 = canvas.toDataURL("image/png", 1);
            image.src = imageBase64;
            return image;
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
                        that.submitData(data.url)
                    }else{
                        that.submitData('')
                    }
                },
                error: function (res) {
                   console.log(res)
                }
            });
        },

        // 保存数据
        saveAllData(type){
            const that = this;
            that.saveType = type ? type : ''; //保存类型
            that.checkCount()
            if(that.saveType){  //预览 显示二维码
                that.preveiw = true;
                that.previewMask = true
            }
            // 处理相关数据 获取前台页面需要请求的数据
            that.fullscreenLoading = true; 
            $('.midConBox').addClass('html2Img')
            that.$nextTick(() => {
                that.saveImg()
            })
           
            event.stopPropagation()
        },


        // 获取组件中 需要在前台请求接口的数据
        checkCount(){
            const that = this;
            let arr = that.showContainerArr;
            let job = [],data = [],fuwu = []
            for(let i = 0; i < arr.length; i++){
                if(arr[i].id == 36 || arr[i].typename == 'jobMan'){ // 招聘
                    let numShow = arr[i].content.numShow;
                    let num = numShow.map(item => {
                        return item.id
                    })
                    job = job.concat(num)
                }else if(arr[i].id == 32 || arr[i].typename == 'dataCount'){  //数据组
                   
                    let numShow = arr[i].content.numSet.numShow;
                    
                    let otherArr = []
                    let num = numShow.map(item => {
                        if(arr[i].content.numSet.id == 2){
                            // 需要统计昨天/本月
                            otherArr.push(that.checkId(item.id,arr[i].content.numSet.secData))
                        }
                        return item.id
                    })

                    if(arr[i].content.numSet.id == 3){
                        data.push(arr[i].content.numSet.titleNum.numShow.id)
                    }
                    data = data.concat(num)
                    data = data.concat(otherArr)
                    data = [...new Set(data)]

                    
                    console.log(num)
                }
                // else if(arr[i].id == 35 && arr[i].content.isStore){
                //     let btns = arr[i].content.btns;
                //     let fuwu = btns.filter(item => {
                //         return ['paidui','maidan','dingzuo','diancan'].includes(item.id)
                //     })
                // }
            }
            that.dataCountInfo = {
                job:job,
                data:data,
                fuwu:fuwu
            }
        },

        // 获取昨日/本月id
        checkId(id,type){
            let lid = 0;
            
            if([3,4,5,11,12].includes(id)){
                lid = type == 1 ? 12 : 4
            }
            if([6,13,14,15].includes(id)){
                lid = type == 1 ? 13 : 14
            }
            if([7,16,20,21].includes(id)){
                lid = type == 1 ? 20 : 21
            }
            if([8,19,17,18].includes(id)){
                lid = type == 1 ? 18 : 19
            }
            return  lid 
        },

        // 使用模板
        userModel(item,ind){
            const that = this
            that.getSystemModel(item)
            optAction = true; //表示已操作页面  退出时 需要确认
        },


        // 获取头部背景色 实际只在h5端使用
        setHeaderImgColor(reset){
            const that = this;
            let color = ''
            if(!that.pageSetFormData.style.bgImgColor || reset){
                that.busiInfoFormData = that.showContainerArr[0].content
                if(that.busiInfoFormData.bgType == 'color'){
                    color = that.busiInfoFormData.style.bgColor
                    that.$set(that.pageSetFormData.style,'bgImgColor',color)
                }else{ //获取图片主色
                    // console.log(that.busiInfoFormData.style.bgImage)
                    that.getImageColor(that.busiInfoFormData.style.bgImage,'pageSetFormData.style.bgImgColor')
                }
            }
        },

        // 获取系统默认模板   plat => 终端
        getSystemModel(plat){
            const that = this;
            $.ajax({
                url: '?dopost=getData&platform=' + plat,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100) {
                        that.currChoseModel = data.info;
                        // 选择使用模板 需要重置相关数据
                        that.initModel(data.info,1)
                        that.modelChosePop = false
                        that.currEditPart = 'showSet';
                        if(!that.hasSetModel){
                            that.hasSetModel = JSON.parse(JSON.stringify(data.info))
                            that.$nextTick(() => {
                                that.initDataList(1);
                                
                            })
                        }else{
                            that.$nextTick(() => {
                                that.setHeaderImgColor(1); //设置头部颜色
                            })
                        }
                    }
                },
                error:function(){},
            })
        },
        // 
        initModel(data,type){
            const that = this;
            that.noVIPInd = data.noVIPInd;
            that.showContainerArr = JSON.parse(JSON.stringify(data.compsArr))
            that.pageSetFormData  = JSON.parse(JSON.stringify(data.pageSet))
        },
        // 切换官方模板
        choseModel(item,ind){
            const that = this;
            that.initModel(item,1)
            that.showholeModelStylePop = false;
            that.modelChosePop = false;
            that.currEditPart = 'showSet';
            if(!that.hasSetModel){
                that.hasSetModel = JSON.parse(JSON.stringify(item))
                that.$nextTick(() => {
                    that.initDataList(1)
                })
            }else{
                that.$nextTick(() => {
                    that.setHeaderImgColor(1); //设置头部颜色
                })
            }
        },

        // 页面修改
        pageChange(){
            optAction = true; //表示已操作页面  退出时 需要确认
        },

         // 请求小程序码
         getMiniQr(){
            const that = this;
            if(!that.currPlatform.id || that.currPlatform.id == 'wxmini'){
                let miniPath = '/pages/packages/company/index/index?preview=1'
                $.ajax({
                    url: '/include/ajax.php?service=siteConfig&action=createWxMiniProgramScene&url='+ masterDomain +'&wxpage=' + encodeURIComponent(miniPath),
                    type: "GET",
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

        submitData(imgpath){
            const that = this;
            let str = that.saveType ? '&type=1' : '';
            let formData = {
                noVIPInd:that.noVIPInd,  //非会员的商家会员组件所在的索引
                compsArr:that.showContainerArr,  //顺序排列
                pageSet:that.pageSetFormData, //页面设置
                dataAjax:that.dataCountInfo, //邀请求的数据
                cover: imgpath
            }
            let data = {
                config: JSON.stringify(formData),
                platform:that.currPlatform.id ? that.currPlatform.id : ''
            }
            if (that.saveType) {
                data = {
                    browse: JSON.stringify(formData),
                    platform:that.currPlatform.id ? that.currPlatform.id : ''
                }
                that.preveiw = true;
            }else{

                optAction = false; //表示已操作页面  退出时 需要确认
            }

            if(that.advancsFormData.hasSet == 1){
                data['terminal'] = that.advancsFormData.platform.join(',')
            }
            $.ajax({
                url: 'busiCenterDiy.php?dopost=save' + str,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.fullscreenLoading = false; 
                    that.previewMask = false;
                    if (data.state == 100) {
                        optAction = false;
                        if (that.saveType) {
                            that.preveiwSet = data.info + '?preview=1&appIndex=1';
                            // $(".previewBox p").removeClass('blue').html('已同步至最新');
                            that.getMiniQr()
                        } else {
                            // that.$message({
                            //     message: '页面设置成功',
                            //     type: 'success'
                            // })
                            that.$message({
                                iconClass:'sIcon',
                                customClass:'successSave',
                                dangerouslyUseHTMLString: true,
                                message: '<span>保存成功</span>'
                            })
                        }
                    } else {
                        if (type) {
                            that.preveiwSet = '';
                            $(".previewBox p").removeClass('blue').html('预览失败');
                        }else{
                            that.$message({
                                message:'保存失败',
                                type: 'error',
                                customClass:'errorSave'
                            })
                        }
                    }
                },
                error: function () {
                    that.fullscreenLoading = false; 
                    that.$message({
                        message:'保存失败',
                        type: 'error'
                    })
                 }
            });
        }


    }
})