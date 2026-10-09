new Vue({
    el:'#page',
    data:{
        all_loading:false, //刷新时的loading
        refreshTime:'', //刷新时间
         // 基础信息
        baseInfo_loading:false,
        basicInfo:{
            store:'',
            member:'',
            order:'',
            income:''
        }, //基础信息
        colorArr:['#336FFF','#B6CAFC','#4CCDFC','#B1E8FC','#CED1D4'],
        ratioLoading:false, //正在加载
        currShow:'product', //当前显示
         // 占比
        ratio:{ product:{ data:'', title:'商品' }, store:{ data:'', title:'商家' }, order:{ data:'', title:'订单' }, income:{ data:'', title:'交易额' }, },

        // 配送情况
        peisong:{},
        psName:['待配送','配送中','异常','已完成'],
        psId:['64','63','12','66'],
        // 今日汇总
        dataForm:{
            type:1,
            start:'',
            end:'',
        },
        deskShow:1,
         // 筛选条件 选项
        optArr:[{ text:'今日', type:1, before:'较昨日',title:'今日'}, { text:'周', type:2, before:'较前七日',title:'近七日' }, { text:'月', type:3, before:'较上月' ,title:'月度'}, { text:'年', type:4,  before:'较上一年',title:'年度'}, { text:'自定义', type:'', before:'',title:'阶段'}, ],
        timeArea:'', //时间选择器
        pickerOptions: {
            disabledDate: (time) => {
                let nowData = new Date()
                nowData = new Date(nowData.setDate(nowData.getDate()))
                return time > nowData
            },
            shortcuts: [{
                text: '最近一周',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近一个月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近三个月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近一年',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                    picker.$emit('pick', [start, end]);
                }
            }]
        },
        // 所有统计信息
        allCount:{},
        todayCount:{},
        showOtherPop:false, //显示统计图弹窗

        // 待处理
        todoList:'',
        currCheck:'', //当前正在编辑的
        showPop:false, //显示弹窗
        // 快捷菜单
        menuLess:[{ text:'首页显示设置', id:0, url:'shop/shopConfig.php?show=display', code:'shopConfigphp' },{ text:'广告管理', id:1, url:'siteConfig/advList.php?action=shop', code:'advListphpactionshop' , type:'shop'},{ text:'商城佣金', id:2, url:'', code:'' },{ text:'活动促销管理', id:3, url:'shop/shopHuodongConfig.php', code:'huodongProductListphp', },{ text:'优惠券发放', id:4, url:'shop/shopQuanList.php', code:'shopQuanListphp', },{ text:bonusName, id:5, url:'member/coupon.php', code:'couponphp', type:'finance'},{ text:'分销设置', id:6, url:'member/fenxiaoConfig.php', code:'fenxiaoConfigphp', }],
        plugins:plugins, //已安装
        pluginList:[{ id:22, icon:'/static/images/admin/shop/plugin_1@2x.png', title:'抽奖互动', desc:'自定义中奖率，支持多形式奖品', },{ id:8, icon:'/static/images/admin/shop/plugin_2@2x.png', title:'小程序直播', desc:'直播带货，盈利、用户双增长' },{ id:23, icon:'/static/images/admin/shop/plugin_3@2x.png', title:'商品采集', desc:'商品数据一键采集' }],

        newsList:[], //商城公告
        
        showOver_1:false,
        showOver_2:false,
        showOver_3:false,
        areaChart:'',
        orderKey:'',
        storeKey:'', //搜索关键字

        fenyongPop:false, //分佣设置弹窗显示
        fyFormData:{
            shopFee:shopFee,
            fzshopFee:fzshopFee,
            levelFee:levelFee,
            storeFee:storeFee,
            fenxiaoFee:fenxiaoFee,
        },
        showError:false, //弹窗红色提示
    },
    mounted(){
        const that = this;
        let currTime = parseInt(new Date().valueOf() / 1000)
        that.refreshTime = huoniao.transTimes(currTime,1)
        that.getBasicInfo(); //获取基础信息
        that.getCountData(); //获取今日统计
        that.getTodoData(); //获取待处理数据
        that.getPostRatio('product'); // 获取占比分析
        that.getPeisong(); //获取配送信息
        that.getNewsList();
        window.addEventListener('resize', that.onResize);
    },
    methods:{
        // 获取基础数据
        getBasicInfo(){
            const that = this
            that.baseInfo_loading = true;
            huoniao.operaJson("shopOverview.php?dopost=basic", '', function(data){
                that.baseInfo_loading = false;
                that.all_loading = false;
                that.basicInfo = data;
            });
        },

        // 获取职位占比
        getPostRatio(type){
            const that = this;
            if(that.ratio[type].data){
                that.initRatio();
                return false
            };
            that.ratioLoading = true;
            huoniao.operaJson("shopOverview.php?dopost=ratio", 'type=' + type, function(data){
              
                let noSolveData = data;
                let totalCount = 0
              
                noSolveData.sort(function(a, b){return b.count-a.count}); 
                if(Array.isArray(noSolveData) ){
                    
                    if(noSolveData.length > 5){
                        let arr_4 = noSolveData.slice(0,4)
                        let arr_other = noSolveData.slice(4,noSolveData.length)
                        let count = 0;
                        let ratio = 0;
                        for(let i = 0; i < arr_other.length; i++){
                            count = count + Number(arr_other[i]['count'])
                            ratio = ratio + Number(arr_other[i]['ratio'])
                        }
                        arr_4.push({
                            typename:'其他',
                            count:type == 'income' ? parseFloat(count.toFixed(2)): count,
                            ratio:parseFloat(ratio.toFixed(2))
                        })
                        noSolveData = arr_4
                    }
                    that.ratio[type].data = noSolveData.map(item => {
                        totalCount = totalCount + Number(item.count);
                        return {
                            name:item.typename,
                            value:item.count,
                            ratio:item.ratio
                        }
                    })
                }
                that.$set(that.ratio[type],'totalCount',totalCount)
                that.ratioLoading = false;
                that.$nextTick(() => {
                    that.initRatio();
                })
            });
        },

        // 初始化统计图
        initRatio(){
            const that = this;
            if(!that.myChart){
                var chartDom = document.getElementById('ratio');
                that.myChart = echarts.init(chartDom);
            }
            var option;
            let totalCount = that.ratio[that.currShow].totalCount
            let title = ''
            switch(that.currShow){
                case 'product':
                    title = '全站商品量(件)'
                    totalCount = parseInt(totalCount)
                    break;
                case 'store':
                    title = '商家总数(个)'
                    totalCount = parseInt(totalCount)
                    break;
                case 'order':
                    title = '订单商品总数(件)'
                    totalCount = parseInt(totalCount)
                    break;
                case 'income':
                    title = '交易总额(' + short + ')'
                    totalCount = parseFloat(totalCount.toFixed(2))
                    break;
            }

            let showData = that.ratio[that.currShow].data; //需要显示的数据
            option = {
                color:['#336FFF','#B6CAFC','#4CCDFC','#B1E8FC','#CED1D4'],
                title:{
                    show:true,
                    zlevel: 0,
                    text: '{a|'+ title +'}\n{b|'+totalCount+'}',
                    textStyle:{
                        rich:{
                            a:{lineHeight: 40,fontSize: 15, color: '#525866',fontWeight:'normal',align:'center'},
                            b:{color:'#071A59',fontSize:36,fontFamily:'DINMittelschriftStd',align:'center'}
                        }
                    },
                    top: 'center',
                    left: 'center',
                },
                // legend:{
                //     show:true,
                //     orient:'vertical',
                //     right:'0',
                // },
                series: [
                    {
                        name: 'Access From',
                        type: 'pie',
                        radius: ['85%', '100%'],
                        avoidLabelOverlap: true,
                        left:26,
                        top:'center',
                        width:240,
                        height:240,
                        padAngle: 1,
                        minAngle:4,
                        itemStyle: {
                            borderRadius: 4
                        },
                        label: {
                            show: false,
                            position: 'center',
                            
                        },
                        emphasis: {
                            scale:true,
                            scaleSize:12,
                            label: {
                                show: true,
                                formatter: '{name|{b}}\n{value|{c}}',
                                rich: {
                                    value: {fontSize: 36, color: '#071A59',  fontFamily: 'DINMittelschriftStd'},
                                    name: {fontSize: 15, color: '#525866',lineHeight: 40, }
                                }
                            },
                        },
                        labelLine: {
                            show: false
                        },
                        data:showData, //显示的数据
                    }
                ]
            };

            option && that.myChart.setOption(option);

            setTimeout(() => {
                that.$nextTick(() => {
                    that.eChartHighlight()
                })
            }, 1000);
        },

        // 高亮事件
        eChartHighlight(){
            const that = this;
            that.myChart.on('mouseover',(e) => {
                that.myChart.setOption({
                    title:{
                        show:false,
                    }
                })
            })
            that.myChart.on('mouseout',(e) => {
                that.myChart.setOption({
                    title:{
                        show:true,
                    }
                })
            })
        },


        // 获取配送情况数据
        getPeisong(){
            const that = this;
            huoniao.operaJson("shopOverview.php?dopost=peisong", '', function(data){
               that.peisong = data;
            });
        },


        // 获取汇总数据
        getCountData(){
            const that = this;
            let param = ''
            if(!that.dataForm.type && that.dataForm.start && that.dataForm.end){
                param = 'start=' + that.dataForm.start + '&end=' + that.dataForm.end
            }else{
                param = 'type=' + that.dataForm.type
            }
            huoniao.operaJson("shopOverview.php?dopost=count", param, function(data){
                if(that.dataForm.type == that.deskShow){
                    that.todayCount = data
                }else{
                    that.allCount = data;
                }
                that.$nextTick(() => {
                    that.initAreaChart()
                })
            })
        },
        
         // 显示比较文字
        showBefore(type,param){
            const that = this;
            // console.log(param)
            param = param ? param : 'before'
            // let type = that.dataForm.type;
            let showType = that.optArr.find(item => {
                return item.type == type;
            })
            return showType[param]
        },
        // 计算
        checkNum(num1,num2){
            const that = this;
            let off = num1 - num2;
            let val = 0
            if(off){
                if(num2){
                    val = off / num2 * 100
                }else{
                    let old = (num1 + num2) / 2;
                    val = off / old * 100
                }
                val = parseFloat(val.toFixed(0));
            }

            return val;
        },

        // 验证是否自定义
        checkDefine(){
            const that = this;
            that.dataForm.type = '';
            if(that.timeArea){

                that.dataForm.start = that.timeArea[0].replaceAll('/','-')
                that.dataForm.end = that.timeArea[1].replaceAll('/','-')
                if(!that.showOtherPop){
                    that.showOtherPop = true
                }
                that.getCountData()
            }
        },

        // 重新显示数据
        changeShow(item){
            const that = this;
            that.dataForm.type = item.type;
            if(item.type != 1 && item.type != 2 ){
                that.showOtherPop = true
            }else{
                that.deskShow = item.type
            }
            that.getCountData()
        },



        // 初始化曲线图
        initAreaChart(desk){
            const that = this;
            let type = that.dataForm.type;
            let allCount = !that.showOtherPop ? that.todayCount : that.allCount
            if(desk){
                allCount = that.todayCount
            }
            let curr = new Date();
            let before = new Date(new Date().setDate(new Date().getDate() + 6));
            let startArr = endArr = []
            let yy_before,mm_before,dd_before,
                yy_curr = curr.getFullYear(),
                mm_curr = curr.getMonth() + 1,
                dd_curr = curr.getDate();
            switch(type){
                case 2:
                    before = new Date(new Date().setDate(new Date().getDate() - 6));
                    yy_before = before.getFullYear();
                    mm_before = before.getMonth() + 1;
                    dd_before = before.getDate();
                    break;
                case 3:
                    before = new Date(new Date().setDate(new Date().getDate() - 29))
                    yy_before = before.getFullYear();
                    mm_before = before.getMonth() + 1;
                    dd_before = before.getDate();
                    break;
                case 4:
                    before = new Date(new Date().setDate(new Date().getDate() - 364))
                    yy_before = before.getFullYear();
                    mm_before = before.getMonth() + 1;
                    dd_before = before.getDate();
                    break;
                default:{
                    startArr = that.dataForm.start.split('-')
                    endArr = that.dataForm.end.split('-')
                    yy_before = startArr[0];
                    mm_before = startArr[1];
                    dd_before = startArr[2];
                    yy_curr = endArr[0],
                    mm_curr = endArr[1],
                    dd_curr = endArr[2];
                }
            }
            let startDate = yy_before + '年' + mm_before + '月' + (type == 4 ? '' : (dd_before + '日'))
            let endDate = yy_curr + '年' + mm_curr + '月' + (type == 4 ? '' : (dd_curr + '日'))
            var chartDom = null
            if(!that.showOtherPop || desk){
                chartDom = document.getElementById('areaChart');
            }else{
                chartDom = document.getElementById('platform-charts');
            }
            that.areaChart = echarts.init(chartDom);
            
            let seriesData = allCount.series;
            let amountObj = {
                name:'amount',
                type:'line',
                smooth: true,
                // stack: 'Total',
                connectNulls:true,
                lineStyle: {width: 3, color: '#4CCDFC'},
                symbol: 'circle',
                itemStyle: {
                    color: '#4CCDFC',
                    borderWidth: 3,
                    borderColor: '#fff',
                    borderType: 'solid'
                },
                yAxisIndex:1,
                symbolSize: 10,
				showSymbol: false,
                areaStyle: {
                    opacity: 1,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(63, 221, 252, .06)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(63, 221, 252, 0)'
                        }
                    ])
                },
                clip:false,
                data: []
            },
            
            countObj = {
                name:'count',
                type:'line',
                smooth: true,
                // stack: 'Total',
                clip:false,
                connectNulls:true,
                lineStyle: {width: 3, color: '#3377FF'},
                symbol: 'circle',
                itemStyle: {
                    color: '#3377FF',
                    borderWidth: 3,
                    borderColor: '#fff',
                    borderType: 'solid'
                },
                yAxisIndex:0,
                symbolSize: 10,
				showSymbol: false,
                areaStyle: {
                    opacity: 1,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(51, 119, 255,.06)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(51, 119, 255, 0)'
                        }
                        
                    ])
                },
                data:[]
            }
            for(let i = 0; i < seriesData.length; i++){
                let data = seriesData[i]
                amountObj.data.push(data['amount'])
                countObj.data.push(data['count'])
            }
            option = {
                color: [ '#3377FF','#4CCDFC'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    },
                    formatter : function (params,ticket, callback) {
                        var htmlEle = '',htmlEle_amount = '',htmlEle_count = '';
                        params.forEach(function(val,index){
                            if(val.seriesName != 'amount'){
                                htmlEle_amount = '<span class="amount" style="color:#404A80;"> '+ val.value +'笔</span>'
                            }else{
                                htmlEle_count = '<span class="count" style="color:#8A8C99;">（交易额 '+ val.value + short + '）</span>'
                            }
                            
                        })
                        htmlEle = '<p style="font-size:14px;">'+ htmlEle_amount + htmlEle_count +'</p>'
                        return htmlEle;
                    },
                },
                title:{
                    show: that.showOtherPop ? true : false,
                    text:startDate + '-' + endDate + ' 商城订单趋势',
                    textStyle:{
                        fontWeight:'normal',
                        color:'#5C5E66',
                        fontSize:15,
                        textAlign:'center',
                    },
                    left:'center',
                    top:20
                },
                
                grid: {
                    left: 20,
                    right: 40,
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: true,
                        axisTick: {show:false},
                        axisLine: {show: false},
                        axisLabel: {color: '#4A538E'},
                        data: allCount.xAxis,
                        offset: 12,
                        axisPointer: {
                            type: 'shadow'
                        },

                        
                    }
                ],
                yAxis: [
                    {

                        nameGap:25,
                        type: 'value',
                        splitNumber:5,
                        alignTicks:true,
                        show:true,
                        nameTextStyle:{
                            align:'center'
                        },
                        axisPointer: {
                            show: false
                        },
                        
                        minInterval:1,
                        show: true,
                        position:'left',
                        name: '        订单量（笔）',
                        max:() => {
                            let maxVal_curr = countObj.data.length ? Math.max(...(countObj.data)) : 1;
                            return that.ceilNumber(maxVal_curr)

                        },
                        min:0,
                        splitLine:{
                            lineStyle: {
                                color: "#EAEFF6"
                            }
                        }
                    },
                    {
                        alignTicks:true,
                        type: 'value',
                        show:true,
                        nameGap:25, 
                        splitNumber:5,
                        minInterval:1,
                        axisTick: {
                            show:false,
                        },
                        axisPointer: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            onZeroAxisIndex:1,
                        },
                        axisLabel:{
                            formatter:function(val,ind){
                                return parseFloat(val.toFixed(2))
                            }
                        },
                        position:'right',
                        // minInterval:1,
                        name:'交易额（'+short+'）    ',
                        min:0,
                        max:() => {
                            return that.ceilNumber(Math.max(...(amountObj.data)))
                        },
                        splitLine:{
                            show:false,
                            lineStyle: {
                                color: "#EAEFF6"
                            }
                        }
                    }
                    
                ],
                series: [countObj,amountObj]
            }
            option && that.areaChart.setOption(option);
        },

        // 双坐标。 向上取整十，整百，整千，整万
        ceilNumber(number) {
            let bite = 0
            if (number < 10) {
            return 10
            }
            while (number >= 10) {
            number /= 10
            bite += 1
            }
            return Math.ceil(number) * Math.pow(10, bite)
        },

        // 获取待处理数据
        getTodoData(){
            const that = this;
            huoniao.operaJson("shopOverview.php?dopost=todo", '', function(data){
                // console.log(data)
                let obj = {}
                for(let item in data){
                    let typename = '',check = 0, id = '',url = '',text='';
                    let title = '';
                    let href = '',hrefid = '';
                    let formData = {}; //设置提交的
                    obj[item] = {
                        typename:'',
                        val:data[item],
                        check:0, // 0 => 需要审核  1 => 不需要审核
                        id:'',
                        quick:0, //是否一键审核
                        url:'', //一键审核的接口/设置的接口
                        text:'',
                        title:'',
                    };
                    switch(item){
                        case 'exception':
                            typename = '异常订单';
                            title = '订单管理';
                            formData = {
                                'deliveryValue':deliveryValue == '0' ? '' : deliveryValue,
                                'deliveryType':deliveryType,
                                'incompleteValue':incompleteValue == '0' ? '' : incompleteValue,
                                'incompleteType':incompleteType
                            };
                            url = '';
                            id = 'exception';
                            href = 'shop/shopOrder.php?notice=11'
                            hrefid = 'shopOrderphp'
                            break;
                        case 'huodong':
                            typename = '活动商品审核';
                            url = 'huodongProductList.php?dopost=updateState&manage=1';
                            href = 'shop/huodongProductList.php?notice=1'
                            hrefid = 'huodongProductListphp'
                            title = '活动商品管理';
                            break;
                        case 'kefu':
                            typename = '平台介入订单';
                            title = '订单管理';
                            formData = {
                                'deliveryValue':platformDeliveryValue == '0' ? '' : platformDeliveryValue,
                                'deliveryType':platformDeliveryType,
                            }
                            url = '';
                            href = 'shop/shopKeFuOrder.php?notice=1'
                            hrefid = 'shopKeFuOrderphp'
                            id = 'kefu'
                            break;
                        case 'product':
                            typename = '商品审核';
                            title = '商品管理';
                            url = 'productList.php?dopost=updateState&manage=1';
                            id = 'fabuCheck';
                            check = fabuCheck
                            href = 'shop/productList.php?notice=1'
                            hrefid = 'productListphp'
                            break;
                        case 'store':
                            typename = '商家入驻审核';
                            id = 'joinCheck';
                            check = joinCheck
                            href = 'shop/shopStoreList.php?notice=1'
                            hrefid = 'shopStoreListphp'
                            url ='shopStoreList.php?dopost=updateState&manage=1';
                            title = '商家管理';
                            break;

                        
                    }
                    obj[item]['typename'] = typename;
                    obj[item]['href'] = href;
                    obj[item]['hrefid'] = hrefid;
                    obj[item]['id'] = id;
                    obj[item]['url'] = url;
                    obj[item]['key'] = item;
                    obj[item]['check'] = check;
                    obj[item]['text'] = check;
                    obj[item]['title'] = title;
                    if(Object.keys(formData).length){
                        obj[item]['formData'] = formData
                    }
                }
                that.todoList = obj

            })
        },

        addPage(){
            const that = this;
            let el = event.currentTarget
            let title = $(el).attr('data-title')
            let url = $(el).attr('href') ? $(el).attr('href') : $(el).attr('data-url')
            let id = $(el).attr('data-id')
            let code = $(el).attr('data-type') ? $(el).attr('data-type') : url.split('/')[0]
            parent.addPage(id, code, title, url);
        },

        // 插件跳转
        enterLink(item,event){
            const that = this;
			let id = item.id;
			let title = item.title;
			let link=`/include/plugins/${id}/index.php?adminRoute=${adminRoute}`;
            if(!that.plugins.includes(id)){ //没有安装， 提示安装
                parent.btnGuide('store');
                return false;
            }
        	if(id != 22){
				event.preventDefault()
				parent.addPage("plugins"+id, "plugins", title, link);
        	}else{
				window.open(link)
			}
		},

        installNew(){
			try {
				event.preventDefault();
				parent.addPage("store", "store", "商店", "siteConfig/store.php");
			} catch(e) {}
		},


        // 获取商城公告
        getNewsList(){
            const that = this;
            huoniao.operaJson("shopNotice.php?dopost=getList", '', function(data){
                if(data.state == 100){
                    that.newsList = data.shopNoticeList;
                }
            })
        },

        editCheck(item){
            const that = this;
            that.currCheck = JSON.parse(JSON.stringify(item));
            that.showPop = true
            
        },

        // 更新审核状态
        upCheckState(){
            const that = this;
            that.showPop = true;
            if(!['kefu','exception'].includes(that.currCheck.id)){

                let param = that.currCheck.id + '=' + that.currCheck.check + '&type=switch&token=' + token
                huoniao.operaJson("shopConfig.php?action=shop", param, function(data){
                    if(data.state == 100){
                        that.showPop = false;
                        // huoniao.parentTip("success", "修改成功！");
                        that.$message({
                            message: '修改成功！',
                            type: 'success'
                        });
                        window[that.currCheck.id] = that.currCheck.check
                        that.todoList[that.currCheck.key].check = that.currCheck.check;
                    }
                });
                if(that.currCheck.val && that.currCheck.quick){ //需要一键处理
                    huoniao.operaJson(that.currCheck.url, 'state=1', function(data){
                        if(data.state == 100){
                            that.todoList[that.currCheck.key].val = 0;
                        }else{
                            that.$message({
                                message: '数据处理失败',
                                type: 'error'
                            });;
                        }
                    });
                }
            }else{
                // 有未填写的内容
                if(that.currCheck.id == 'kefu' && !(that.currCheck.formData.deliveryValue.trim()) || (that.currCheck.id == 'exception' && !(that.currCheck.formData.incompleteValue.trim()))) {
                    that.showError = that.currCheck.id
                    return false;
                }
                let paramArr = [];
                for(let item in that.currCheck.formData){
                    paramArr.push(item + '=' + that.currCheck.formData[item])
                }
                let type = that.currCheck.id == 'exception' ? 'exception' : 'delivery'
                let param = paramArr.join('&') + '&type='+type+'&token=' + token
                huoniao.operaJson("shopConfig.php?action=shop", param, function(data){
                    if(data.state == 100){
                        that.showPop = false;
                        that.$message({
                            message: '修改成功！',
                            type: 'success'
                        });
                        window[that.currCheck.id] = that.currCheck.check
                        that.todoList[that.currCheck.key].check = that.currCheck.check;
                        that.todoList[that.currCheck.key].formData = that.currCheck.formData;
                    }
                });
            }
        },

        // 下载统计图
        downloadPic(){
            const that = this;
            var chartsImgUrl = that.areaChart.getDataURL({
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
    
            var a = document.createElement('a');
            document.body.appendChild(a);
            a.style = 'display: none';
            a.href = chartsImgUrl;
            a.download = '订单量与交易额';
            a.click();
            window.URL.revokeObjectURL(chartsImgUrl);
        },

        inputChange(type){
            const that = this;
            let url = 'shop/shopOrder.php?keywords=' + that[type + 'Key']
            let id = 'shopOrderphpinputChange';
            let title = '订单管理';
            if(type == 'store'){
                url = 'shop/shopStoreList.php?keywords=' + that[type + 'Key']
                id = 'shopStoreListphpinputChange';
                title = '店铺管理';
            }
            let code = url.split('/')[0]
            parent.addPage(id, code, title, url);
        },

        showSetPop(){
            const that = this;
            that.fenyongPop = true
        },

        submitData(){
            const that = this;
            let paramArr = []
            for(let item in that.fyFormData){
                if(that.fyFormData == ''){

                    return false;
                }

                paramArr.push(item + '=' + that.fyFormData[item])
            }
            paramArr.push('token=' + token)
            huoniao.operaJson("/admin/member/settlement.php?type=shop", paramArr.join('&'), function(data){
                if(data.state == 100){
                    that.fenyongPop = false;
                    that.$message({
                        message: '修改成功！',
                        type: 'success'
                    });

                }
            });
        },

        onResize(){
            const that = this;
            setTimeout(() => {
                that.areaChart.dispose()
                if(that.showOtherPop){
                    that.initAreaChart(1)
                }
                that.initAreaChart()
            }, 1000);
        },

        // 刷新按钮
        reloadData(){
            const that = this;
            let currTime = parseInt(new Date().valueOf() / 1000)
            that.refreshTime = huoniao.transTimes(currTime,1)
            that.all_loading = true
            that.getBasicInfo(); //获取基础信息
            that.getCountData(); //获取今日统计
            that.getTodoData(); //获取待处理数据
            that.getPostRatio('product'); // 获取占比分析
            that.getPeisong(); //获取配送信息
            that.getNewsList();
        },
    }
})
