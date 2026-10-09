
new Vue({
    el:'#page',
    data:{
        refreshTime:'', //刷新时间
        // 基础信息
        baseInfo_loading:false,
        all_loading:false,
        basicInfo:{
            company:'',
            post:'',
            income:'',
            resume:''
        },

        // 占比
        ratio:{
            post:{
                data:'',
                title:'职位'
            },
            resume:{
                data:'',
                title:'人才简历'
            },
            pg:{
                data:'',
                title:'普工职位'
            },
            income:{
                data:'',
                title:'收益'
            },
        },
        currShow:'post', //当前显示的统计图
        ratioLoading:false, //ratio加载中
        myChart:'',

        // 待处理
        todo_loading:false,
        todoList:'',
        // 当前正在编辑的
        currCheck:'',
        // 招聘会
        fairs_loading:false,
        fairsList:[],

        // 资讯
        news_loading:false,
        newsList:[],

        // 今日汇总
        data_loading:false,
        dataForm:{
            type:1,
            start:'',
            end:'',
        },
        timeArea:'', //时间选择器
        allCount:{
            company:'',
            other:''
        },

        // 筛选条件 选项
        optArr:[{ text:'今日', type:1, before:'较昨日',title:'今日'}, { text:'周', type:2, before:'较前七日',title:'近七日' }, { text:'月', type:3, before:'较上月' ,title:'月度'}, { text:'年', type:4,  before:'较上一年',title:'年度'}, { text:'自定义', type:'', before:'',title:'阶段'}, ],
        colorArr:['#336FFF','#B6CAFC','#4CCDFC','#B1E8FC','#CED1D4'],
        showPop:false,
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
        
    },
    mounted(){
        const that = this;
        if(!showpop){ //showpop表示仅显示弹窗
            let currTime = parseInt(new Date().valueOf() / 1000)
            that.refreshTime = huoniao.transTimes(currTime,1)
            that.getBasicInfo(); //获取基础信息
            that.getPostRatio('post'); //获取职位占比
            that.getTodoData();
            that.getFairsList();
            that.getNewsList();
            that.getTodayCount()
        }else{
            // 获取本地存储数据
            let currCheckLocal = localStorage.getItem('jobOverView_check')
            if(currCheckLocal){
                that.currCheck = currCheckLocal;
                that.showPop = true;
            }else{
                that.reloadData();
            }
        }
        $("body").delegate('.add-page','click',function(e){
            let url = $(this).attr('href');
            url = url ? url : $(this).attr('data-url')
            let id = $(this).attr('data-id')
            let title = $(this).attr('data-title')
            try {
                e.preventDefault();
                parent.addPage(id, 'job', title, "job/"+url);
            } catch(e) {}
        })

        $('body').delegate('.allDataShow .dataGridBox li','click',function(){
            let url = $(this).attr('data-url');
            let id = $(this).attr('data-id');
            let title = $(this).attr('data-title');
            let code = $(this).attr('data-type') ? $(this).attr('data-type') : url.split('/')[0]
            parent.addPage(id, code, title, url);
        });

        $("#scrollBox").bind('mousewheel', function(event, delta, deltaX, deltaY){
            this.scrollLeft -= (delta * 30);
            event.preventDefault()
        })
    },
    methods:{
        // 获取基础数据
        getBasicInfo(){
            const that = this
            that.baseInfo_loading = true;
            huoniao.operaJson("jobOverview.php?dopost=basic", '', function(data){
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
            huoniao.operaJson("jobOverview.php?dopost=ratio", 'type=' + type, function(data){
                let noSolveData = data;
                let totalCount = 0
                if( type == 'income'){
                    let count_all = 0;
                    let incomeArr = []
                    for(let item in data){
                        count_all = count_all + data[item]
                    }
                    for(let item in data){
                        let typename = '';
                        let count = data[item]
                        switch(item){
                            case 'package':
                                typename = '招聘套餐';
                                break;
                            case 'download':
                                typename = '下载简历';
                                break;
                            case 'contact':
                                typename = '普工付费联系';
                                break;
                            case 'addvalue':
                                typename = '增值包';
                                break;
                            case 'refresh_post':
                                typename = '刷新职位';
                                break;
                            case 'top_post':
                                typename = '置顶职位';
                                break;
                            case 'up':
                                typename = '上架职位';
                                break;
                            case 'refresh_resume':
                                typename = '刷新简历';
                                break;
                            case 'top_resume':
                                typename = '置顶简历';
                                break;
                            
                        }

                        incomeArr.push({
                            typename:typename,
                            count:count,
                            ratio: parseFloat((count / count_all).toFixed(4)) * 100
                        })
                        noSolveData = incomeArr
                    }
                }
                noSolveData.sort(function(a, b){return b.count-a.count}); 
                if(Array.isArray(noSolveData) ){
                    
                    if(noSolveData.length > 5){
                        let arr_4 = noSolveData.slice(0,4)
                        let arr_other = noSolveData.slice(4,noSolveData.length)
                        let count = 0;
                        let ratio = 0;
                        for(let i = 0; i < arr_other.length; i++){
                            count = count + arr_other[i]['count']
                            ratio = ratio + arr_other[i]['ratio']
                        }
                        arr_4.push({
                            typename:'其他',
                            count:count,
                            ratio:ratio
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

        // 初始化饼状图
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
                case 'post':
                    title = '全站职位数(个)';
                    totalCount = parseInt(totalCount)
                    break;
                case 'resume':
                    title = '简历总数(份)';
                    totalCount = parseInt(totalCount)
                    break;
                case 'pg':
                    title = '职位总数(个)';
                    totalCount = parseInt(totalCount)
                    break;
                case 'income':
                    title = '累计总收益('+short+')'
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

        // 获取待处理数据
        getTodoData(){
            const that = this;
            huoniao.operaJson("jobOverview.php?dopost=todo", '', function(data){
                // that.basicInfo = data;
                let obj = {}
                for(let item in data){
                    let typename = '';
                    let check = 0;
                    let key = item == 'pg' ? 'pg' : item
                    let id = '',hrefid = '',href = '';
                    let url = '',text='';
                    if(item != 'qz'){
                        obj[key] = {
                            typename:'',
                            val:0,
                            check:0, // 0 => 需要审核  1 => 不需要审核
                            id:'',
                            quick:0, //是否一键审核
                            url:'', //一键审核的接口
                            text:'',
                        };
                    }
                    switch(item){
                        case 'company':
                            typename = '企业入驻审核';
                            check = newCheck;
                            id = 'newCheck';
                            url = 'jobCompany.php?dopost=updateState&manage=1';
                            text = '企业';
                            href='job/jobCompany.php?notice=1';
                            break;
                        case 'sensitive':
                            typename = '企业信息修改';
                            check = changeCheck;
                            id = 'changeCheck';
                            text = '企业';
                            url = '';
                            href='job/jobCompany.php?mingan=1&notice=1';
                            hrefid = 'jobCompanyphp'
                            break;
                        case 'post':
                            typename = '职位审核';
                            check = agentCheck;
                            id = 'agentCheck';
                            text = '职位';
                            url = 'jobPost.php?dopost=updateState&manage=1';
                            href='job/jobPost.php?notice=1';
                            hrefid = 'jobPostphp'
                            break;
                        case 'resume':
                            typename = '简历审核';
                            check = fabuResumeCheck;
                            id = 'fabuResumeCheck';
                            text = '简历';
                            url = 'jobResume.php?dopost=updateState&manage=1';
                            href='job/jobResume.php?notice=1';
                            hrefid = 'jobResumephp'

                            break;
                        case 'fairs':
                            typename = '招聘会报名';
                            check = jobFairJoinState;
                            id = 'jobFairJoinState';
                            text = '企业报名';
                            url = 'jobFairsJoin.php?dopost=updateState&manage=1';
                            href='job/jobFairsJoin.php?notice=1';
                            hrefid = 'jobFairsJoinphp'


                            break;
                        case 'pg':
                            typename = '普工专区信息'
                            check = fabuCheck;
                            id = 'fabuCheck';
                            text = '普工信息';
                            url = 'jobSentence.php?dopost=updateState&manage=1';
                            // href = 'job/jobSentence.php?notice=1&type=1'
                            hrefid = 'jobSentencephp'
                            obj[key][item] = data[item]
                            
                            break;
                    }

                    if(item != 'qz'){
                        
                        obj[key]['typename'] = typename;
                        obj[key]['val'] += data[item]
                        obj[key]['check'] = check;
                        obj[key]['id'] = id;
                        obj[key]['url'] = url;
                        obj[key]['key'] = key;
                        obj[key]['href'] = href;
                        obj[key]['hrefid'] = hrefid;
                    }
                }
                if(data['qz']){
                    obj['pg']['val'] += data['qz']
                    obj['pg']['qz'] = data['qz']
                }
                that.todoList = obj
            });
        },

        // 获取招聘会列表
        getFairsList(){
            const that = this;
            huoniao.operaJson("jobOverview.php?dopost=fair", '', function(data){
                if(Array.isArray(data)){
                    that.fairsList = data;
                }
            });
        },

        // 获取资讯
        getNewsList(){
            const that = this;
            huoniao.operaJson("jobOverview.php?dopost=news", '', function(data){
                that.newsList = data;
            });
        },

        // 获取今日统计
        getTodayCount(){
            const that = this;
            that.data_loading = true;
            let param = ''
            if(!that.dataForm.type && that.dataForm.start && that.dataForm.end){
                param = 'start=' + that.dataForm.start + '&end=' + that.dataForm.end
            }else{
                param = 'type=' + that.dataForm.type
            }
            huoniao.operaJson("jobOverview.php?dopost=count", param, function(data){
                that.data_loading = false;
                let count_company = {},count_other = {}
                let list_company = [],list_other = []
                count_other['new'] = {};
                count_other['new']['amount'] = count_other['new']['amount'] || 0;
                count_other['new']['count'] = count_other['new']['count'] || 0;
                count_other['old'] = {};
                count_other['old']['amount'] = count_other['new']['amount'] || 0;
                count_other['old']['count'] = count_other['new']['count'] || 0;

                count_company['new'] = {};
                count_company['new']['amount'] = count_company['new']['amount'] || 0;
                count_company['new']['count'] = count_company['new']['count'] || 0;

                count_company['old'] = {}
                count_company['old']['amount'] = count_company['old']['amount'] || 0
                count_company['old']['count'] = count_company['old']['count'] || 0
                for(let item in data){
                    let typename = '';
                    
                    switch(item){
                        case 'package':
                            typename = '招聘套餐';
                            break;
                        case 'download':
                            typename = '下载简历';
                            break;
                        case 'contact':
                            typename = '普工付费联系';
                            break;
                        case 'addvalue':
                            typename = '增值包';
                            break;
                        case 'refresh_post':
                            typename = '刷新职位';
                            break;
                        case 'top_post':
                            typename = '置顶职位';
                            break;
                        case 'up':
                            typename = '上架职位';
                            break;
                        case 'refresh_resume':
                            typename = '刷新简历';
                            break;
                        case 'top_resume':
                            typename = '置顶简历';
                            break;
                        
                    }
                    let obj = {
                        typename:typename,
                        new:{
                            amount:data[item]['new'][0],
                            count:data[item]['new'][1]
                        },
                    }
                    if(data[item]['old']){
                        obj['old'] = {
                            amount:data[item]['old'][0],
                            count:data[item]['old'][1]
                        }
                    }
                    if(['contact','top_resume','refresh_resume'].includes(item)){
                        // 其他
                        count_other['new']['amount'] = data[item]['new'][0] + count_other['new']['amount']
                        count_other['new']['count'] = data[item]['new'][1] + count_other['new']['count']
                        if(data[item]['old']){
                            count_other['old']['amount'] = data[item]['old'][0] + count_other['old']['amount']
                            count_other['old']['count'] = data[item]['old'][1] + count_other['old']['count']
                        }
                        list_other.push(obj)

                    }else{
                        
                        count_company['new']['amount'] = data[item]['new'][0] + count_company['new']['amount']
                        count_company['new']['count'] = data[item]['new'][1] + count_company['new']['count']
                        
                        if(data[item]['old']){
                            
                            count_company['old']['amount'] = data[item]['old'][0] + count_company['old']['amount']
                            count_company['old']['count'] = data[item]['old'][1] + count_company['old']['count']
                        }
                        list_company.push(obj)
                        // 企业订单
                    }
                    that.allCount['company'] = count_company
                    that.allCount['other'] = count_other
                    that.allCount['list_company'] = list_company
                    that.allCount['list_other'] = list_other
                }
            });
        },

        // 显示比较文字
        showBefore(param){
            const that = this;
            param = param ? param : 'before'
            let type = that.dataForm.type;
            let showType = that.optArr.find(item => {
                return item.type == type;
            })
            return showType[param]
        },

        // 验证是否自定义
        checkDefine(){
            const that = this;
            that.dataForm.type = '';
            that.dataForm.start = that.timeArea[0].replaceAll('/','-')
            that.dataForm.end = that.timeArea[1].replaceAll('/','-')
            that.getTodayCount()
        },

        // 重新显示数据
        changeShow(item){
            const that = this;
            that.dataForm.type = item.type;
            that.getTodayCount()
        },

        // 计算
        checkNum(item){
            const that = this;
            let off = item.new.amount - item.old.amount;
            let val = 0
            if(off){
                if(item.old.amount){
                    val = off / item.old.amount * 100
                }else{
                    let old = (item.new.amount + item.old.amount) / 2;
                    val = off / old * 100
                }
                val = parseFloat(val.toFixed(0));
            }

            return val;
        },

        // 刷新数据
        reloadData(){
            const that = this;
            that.all_loading = true;
            let currTime = parseInt(new Date().valueOf() / 1000)
            that.refreshTime = huoniao.transTimes(currTime,1)
            that.getBasicInfo(); //获取基础信息
            that.getPostRatio('post'); //获取职位占比
            that.getTodoData();
            that.getFairsList();
            that.getNewsList();
            that.getTodayCount()
        },

        // 编辑  是否审核  一键处理
        editCheck(item){
            const that = this;
            that.currCheck = JSON.parse(JSON.stringify(item));
            that.showPop = true;
            // localStorage.setItem('jobOverView_check',that.currCheck)
            
            that.$nextTick(() => {
                // let pop = $.dialog({
                //     id: "checkChange",
                //     fixed: false,
                //     title: false,
                //     content: $(".popConBox").html(),
                //     width: 550,
                // });
                // console.log(lhgdialog)
            })
        },

        // 打开链接
        addPage(item){
            let title = item.typename;
            let id = item.hrefid
            let url = item.href;
            let code = url.split('/')[0]
            if(!url) return false;
            parent.addPage(id, code, title, url);
        },

        // 更新审核状态
        upCheckState(){
            const that = this;
            that.showPop = true
            let param = that.currCheck.id + '=' + that.currCheck.check + '&type=switch&token=' + token
            huoniao.operaJson("jobConfig.php?action=job", param, function(data){
                if(data.state == 100){
                    that.showPop = false;
                    that.$message({
                        message: '修改成功！',
                        type: 'success'
                    });
                    window[that.currCheck.id] = that.currCheck.check
                    that.todoList[that.currCheck.key].check = that.currCheck.check;
                }
            });
            if(that.currCheck.val && that.currCheck.quick){ //需要一键处理
                let typeStr = that.currCheck['key'] == 'pg' ? '&type=0':''
                huoniao.operaJson(that.currCheck.url, 'state=1' + typeStr, function(data){
                    if(data.state == 100){
                        that.todoList[that.currCheck.key].val = 0;
                        if(typeStr){
                            that.currCheck['pg'] = 0
                        }
                    }else{
                        that.$message({
                            message: '数据处理失败！',
                            type: 'error'
                        });
                    }
                });

                if(that.currCheck['qz']){
                    huoniao.operaJson(that.currCheck.url, 'state=1&type=1', function(data){
                        if(data.state == 100){
                            if(typeStr){
                                that.currCheck['qz'] = 1
                            }
                            that.todoList[that.currCheck.key].val = 0;
                        }else{
                            that.$message({
                                message: '数据处理失败！',
                                type: 'error'
                            });
                        }
                    });
                }
                
            }
        },


        toLink(item){
            const that = this;
            window.open(item.url)
        },
    }
})
