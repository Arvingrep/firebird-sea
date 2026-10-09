if(certificateState!=1){
    history.go(-1);
}
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:4,
		hoverid:'',
		loading:false,
        keywords:'', //搜索关键字
        totalCount:0,
        page:1,
        isload:false,
        tabsArr:[{
            id:0,
            text:'投递简历',
        },{
            id:1,
            text:'简历收藏',
        },{
            id:2,
            text:'下载的简历',
        }],
        currPage:0, //当显示的表格
        tabsArrList:[{
            id:'',
            text:'全部',
            count:0,
            value:'',

        },{
            id:1,
            text:'待处理',
            count:0,
            value:0,
        },{
            id:2,
            text:'通过初筛',
            count:0,
            value:1,
        },{
            id:3,
            text:'已下载',
            count:0,
            value:3,
        },{
            id:4,
            text:'不合适',
            count:0,
            value:2,
        },],

        currTab:'', //筛选简历状态
        tableData:[
        ],

        postSelect:'', //筛选投递简历的职位
        postArr:[
            {
                value:'1',
                label:'php开发工程师'
            },{
                value:'2',
                label:'php开发工程师1'
            }
        ], //发布的职位

        // 暂时存储
        markText:'',  //标注文字
        markSelect:'简历与职位匹配度不高', //拒绝原因
        noFit:true, //过滤不合适
        invalid:false, //过滤失效简历
        delbtn_disabled:true, //删除按钮是否可用
        passbtn_disabled:false, //通过按钮是否可用
        page:1, //页码

        // storePost:[], //店铺职位
        shopPopover:true, //显示弹窗
        optbultArr:[], //批量删除

        resumeState:'', //沟通进度
        editRemark:{
            edit:false, //是否正在编辑
            remark:'',  //标注的内容
            type:'0',    //标注的类型 0简历标注  1是面试标注
            onChose:0, // 默认选中
        },
        currOnEditRow:'', //当前正处于编辑状态的行
        communication: [{ value: 2, label: '未接通' }, { value: 3, label: '待回复' }, { value: 4, label: '待拨打', },{ value: 5, label: '不合适' }, { value: 1, label: '已约面' },],
        // { value:0, label:'未处理' },
        selectAllRow:false, //全选
        iniAjaxNumber:2,
        finAjaxNumber:0,
        addTip:false,

        // 高级筛选相关内容
        baseConfig:{}  ,  //基础配置
        filterForm:{
            sex:'', // 性别
            min_age:'', //年龄
            max_age:'',
            education:'', //学历
            edu_profession:'', //所需专业
            start_time:'',  //投递时间1
            end_time:'',//投递时间2  简历投递时间 在两个之间
        },
        min_age:'',
        max_age:'', 
        agePopper:false, // 是否显示年龄选择弹窗
        ageArr:[ { title:'18-20岁', value:'18-20' }, { title:'20-25岁', value:'20-25' }, { title:'25-30岁', value:'25-30' }, { title:'30-35岁', value:'30-35' }, { title:'35-40岁', value:'35-40' }, { title:'45-50岁', value:'45-50' }, { title:'50岁以上', value:'50-' }, ],
        ageText:'',
        age:'',
        postDate:'', //投递时间
        pickerOptions: {
            disabledDate(time) {
                return time.getTime() > Date.now();
            },
            shortcuts: [{
                text: '今天',
                onClick(picker) {
                    picker.$emit('pick', new Date());
                }
            }, {
                text: '昨天',
                onClick(picker) {
                    const date = new Date();
                    date.setTime(date.getTime() - 3600 * 1000 * 24);
                    picker.$emit('pick', date);
                }
            }, {
                text: '一周前',
                onClick(picker) {
                    const date = new Date();
                    date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', date);
                }
            }]
        },
        filterPop:false,

        loadExcel:0, //导出数据的状态  0 表示未导出  1 表示成功导出  2表示导出失败
        isLoadExcel:false, //是否正在导出数据
	},  
	mounted() {
        var tt = this;

        if(tt.getUrlPrarm('type')){
            tt.currPage = tt.getUrlPrarm('type');
            tt.currid = 5;
        }

        
        if(tt.getUrlPrarm('postid')){
            tt.postSelect = Number(tt.getUrlPrarm('postid'))
        }
        if(tt.getUrlPrarm('state')){
            tt.currTab = Number(tt.getUrlPrarm('state'))
        }
        
        tt.$nextTick(() => {
            tt.checkLeft(); 
            if(!tt.getUrlPrarm('type') && !tt.getUrlPrarm('postid')){
                tt.getResumeList()
            }
    
            // 加载招聘中的职位
            tt.getStorePost();
            tt.getBaseConfig();
        })

       
        
    },
    computed:{
        // 薪资转换
        salaryChange(){
            return function(item){
                if(!item ) return false;
                var minS = item.min_salary, 
                    maxS = item.max_salary;
                var text = minS + ' - ' + maxS
                if(item.min_salary > 10000 || item.max_salary > 10000 ){
                    minS = item.min_salary;
                    maxS = item.max_salary;
                    text =  minS + ' - ' + maxS
                }
                return text;
            }
        },

        // 时间转换
        timeTrans(){
            return function(timestr,n){
                // console.log(timestr)
                var date = mapPop.transTimes(timestr,n);
                return date;
            }
        },


        // remarkType
        checkRemark_type(){
            return function(type){
                var tt = this;
                var remark_name = ''
                for(var i=0; i< tt.communication.length; i++){
                    if(tt.communication[i].value == type){
                        remark_name = tt.communication[i].label;
                        break;
                    }
                }
                return remark_name;
            }
        },


        // 数组转字符串
        joinArr(){
            return function(arr,str){
                var tt = this;
                var arrStr = ''
                if(arr){
                    arrStr =  arr.join(str)
                }
                return arrStr;
            }
        }

    },
    watch:{
        currTab:function(val){
            var tt = this;
            tt.checkLeft(val);
            tt.page = 1;
            tt.noFit = false;
            tt.getResumeList();


        },
        tableData:function(val){
            // 判断删除按钮是否可用
            var tt = this;
            tt.delbtn_disabled = true;
            if(tt.currPage === 1){

                tt.delbtn_disabled = false;
                return false;
            }
            for(var i = 0; i < val.length; i++){
                if((tt.currPage == 0 && val[i].state == 2 ) || val[i].resume.del ){
                    tt.delbtn_disabled = false;
                }

                if((tt.currPage == 2 && val[i].remark && val[i].remark.remark_type && val[i].remark.remark_type == 5 && val[i].delivery) || val[i].del ){
                    tt.delbtn_disabled = false;
                }

                // 当已经有可删除的数据时，直接跳出循环
                if(!tt.delbtn_disabled ){
                    break;
                }

            }
        },

        optbultArr:function(val){
            var tt = this;
            tt.passbtn_disabled = false;
            tt.delbtn_disabled = false;
            if(val.length == 0){
                tt.delbtn_disabled = true;
                tt.passbtn_disabled = true;
            }
            if(tt.currPage == 0 || tt.currPage == 2){
                for(var i = 0; i < val.length; i++){
                    if(tt.currPage === 0 ){
                        // console.log(val[i].state)
                        if(val[i].state != 0 ){
                            tt.passbtn_disabled = true; //不可批量通过
                        }
                        if(val[i].state != 2 && !val[i].resume.del){
                            tt.delbtn_disabled = true; //不可批量删除
                        }
                    }else if( val[i].remark && val[i].remark.remark_type != 5 && !val[i].resume.del ){
                        tt.delbtn_disabled = true; //不可批量通过
                    }
                }


            }
            
        },

        // 过滤不合适
        noFit:function(val){
            var tt = this;
            tt.getResumeList()
        },
        //过滤失效简历
        invalid:function(){
            this.getResumeList()
        },
        // 筛选职位
        postSelect(val){
            var tt = this;
            tt.page = 1;
            tt.getResumeList();

        },

        // 沟通进度
        resumeState(val){
            var tt = this;
            if(tt.currPage == 2){
                tt.page = 1;
                tt.getResumeList()
            }
        },
        currPage:function(val){
            var tt = this;
            tt.page = 1;
            tt.postSelect = '';
            tt.tableData = [];
            if(val == 1){
                tt.currid = 5
            }else{
                tt.currid = 4

                if(!tt.currPage){
                    setTimeout(() => {
                        tt.checkLeft(tt.currTab);
                    }, 100);
                }
            }
            tt.getResumeList()
        },
    
    },
    methods:{
        interviewTime(time) {
            var date = new Date(time * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var M = (date.getMonth() + 1) + '/';
            var D = date.getDate() + ' ';
            var h = date.getHours();
            h = (h < 12 ? ('上午' + h) : h == 12 ? '中午12' : '下午' + (h - 12)) + ':';
            var m = date.getMinutes();
            return M + D + h + m
        },
        // tab切换
        tabchange(index){
            this.currPage=index;
            if(location.search){
                history.replaceState(null,null,`${location.pathname}?type=${index}`)
            }else{
                history.replaceState(null,null,`${location.href}?type=${index}`)
            }
        },
        checkLeft(val){
            var tt = this;
            var currTab = val ? val : tt.currTab;
            var el = $(".tabBox li[data-id='"+(!currTab ? '' : currTab )+"']");
            if(el.length){

                var left = el.position().left + el.innerWidth()/2  - $(".tabBox s").width()/2;
                $(".tabBox s").css({
                    'transform':'translateX('+left+'px)'
                })
            }
        },
        // 表格全选
        selectAll(){
            var tt = this;
            tt.$refs.table.toggleAllSelection();
        },

        // 简历举报
        jubaoResume(id){

            var domainUrl = channelDomain.replace(masterDomain, "").indexOf("http") > -1 ? channelDomain : masterDomain;
            var commonid = id;
            commonid = commonid ? 0 : commonid;
            console.log($)

            complain = $.dialog({
                fixed: true,
                title: "简历举报",
                content: 'url:'+domainUrl+'/complain-job-resume-'+id+'.html?commonid=' + commonid,
                width: 500,
                height: 300
            });
        },

        // 多选
        selectionChange(selection){
            var tt = this;
            tt.optbultArr = selection;
        },
          // 确认删除弹窗
        confirmDelPost(){
            var tt = this;
            if($(event.currentTarget).hasClass('disables_btn')) return false;
            if(!tt.optbultArr.length){
                mapPop.showErrTip = true
                mapPop.showErrTipTit = '至少选择一份简历进行操作';
                return false;
            }
            if(mapPop){
                mapPop.confirmPop = true;
                var textStr =  tt.currPage === 1 ? '取消收藏':'删除'
                mapPop.confirmPopInfo = {
                    icon:'error',
                    popClass:'confirmDelPost pop_error',
                    title:'确认'+textStr+'这'+tt.optbultArr.length+'份简历？',
                    tip: textStr + '后不可恢复，请谨慎操作',
                    btngroups:[
                        {
                            tit:'取消',
                            cls:'btn_cancel',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:(tt.currPage === 1 ? '取消收藏':'确认删除'),
                            cls:'btn_sure',
                            fn:function(){
                                if(tt.currPage === 1){
                                    tt.delCollectResume()
                                }else{
                                    tt.delResume()
                                }
                            },
                            type:'primary',
                        },
                    ]
                }
            }

        },


        // 删除简历
        delResume(scope){
            var tt = this;
            var idArr = [];
            if(scope){
                idArr.push(scope.row.id);
            }else{
                tt.optbultArr.forEach(function(val){
                    idArr.push(val.id)
                })
            }
            var action = tt.currPage ? 'delDownResume':'delDelivery';
            $.ajax({
				url: '/include/ajax.php?service=job&action='+action+'&id=' + idArr.join(','),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        mapPop.successTipText = data.info;
                        mapPop.successTip = true;
                        tt.getResumeList()
                    }else{
                        mapPop.showErrTipTit = data.info;
                        mapPop.showErrTip = true; 
                    }
				},
				error: function (data) { 
                    mapPop.showErrTipTit = data.info;
                    mapPop.showErrTip = true;
				}
			});
        },


        // 取消收藏
        delCollectResume(scope){
            var tt = this;
            var idArr = [];
            if(scope){
                idArr.push(scope.row.resume.id);
            }else{
                tt.optbultArr.forEach(function(val){
                    idArr.push(val.resume.id)
                })
            }
            $.ajax({
				url: '/include/ajax.php?service=member&action=collect&temp=resume&type=del&module=job&id=' + idArr.join(','),
				type: "POST",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        mapPop.successTipText = '已取消收藏';
                        mapPop.successTip = true;
                        tt.getResumeList()
                    }else{
                        mapPop.showErrTipTit = data.info;
                        mapPop.showErrTip = true; 
                    }
				},
				error: function (data) { 
                    mapPop.showErrTipTit = data.info;
                    mapPop.showErrTip = true;
				}
			});
        },

        // 获取投递的简历列表
        getResumeList(download){
            var tt = this;
            tt.selectAllRow = false;
            if(download == 1){
                tt.isLoadExcel = true ; //正在导出数据
            }else{
                tt.isload=true;
            }
            var paramStr = ''
            var state = 0
            for(var i = 0; i < tt.tabsArrList.length; i++){
                if(tt.tabsArrList[i].id == tt.currTab){
                    state = tt.tabsArrList[i].value
                    break;
                }
            }
            var param = [];
            param.push('state=' + state)
            if(param && param.length > 0){
                paramStr = '&'+ param.join('&')
            }

            if(tt.invalid){
                paramStr = `${paramStr}&unValid=1`
            }

            if(tt.keywords){
                paramStr = paramStr + '&keyword='+tt.keywords 

            }

            if(tt.postSelect!=' '){
                paramStr = paramStr + '&pid='+tt.postSelect
            }
            
            if(tt.currPage == 0){
                paramStr = paramStr + '&action=deliveryList';
                if(tt.noFit){
                    paramStr = paramStr + '&unSuit=1' 
                }
            }else if(tt.currPage == 1){
                paramStr = paramStr + '&action=collectResumeList'
            }else{
                paramStr = paramStr + '&action=downResumeList'
                paramStr = paramStr + '&progress=' + (tt.resumeState == ' ' ? '' : tt.resumeState);
                if(tt.noFit){
                    paramStr = paramStr + '&unSuit=1' 
                }
            }



            // 高级筛选
            let filterArr = []
            for(let item in tt.filterForm){
                filterArr.push(item + '=' + tt.filterForm[item])
            }
            paramStr = paramStr +'&'+ filterArr.join('&')
            if(download == 1){  //导出Excel
                paramStr = paramStr + '&download=1'
            }
            $.ajax({
				url: '/include/ajax.php?service=job&store=1&pageSize=20&page='+tt.page + paramStr,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(download == 1){ //需要导出excel
                        tt.loadExcel = 1; //导出结束
                        
                        if(data.state == 100){
                            setTimeout(() => {
                                tt.isLoadExcel = false; //导出结束
                            }, 300);
                            window.open(data.info)
                        }else{
                            tt.loadExcel = 2; //导出失败
                        }
                    }else{

                        if(data.state == 100){
                            tt.tableData = data.info.list;
                            tt.totalCount = data.info.pageInfo.totalCount;
                        }else{
                            tt.tableData = [];
                        };
                        tt.finAjaxNumber++;
                        if(tt.iniAjaxNumber<=tt.finAjaxNumber){ //获取列表的ajax是否完成
                            tt.isload = false;
                        };
                    }
				},
				error: function () { 
                    tt.isload = false;
                    if(download == 1){
                        tt.loadExcel = 2;
                        tt.isLoadExcel = false; //导出结束
                    }
				}
			});
        },

        searchKey(){
            var tt = this;
            tt.page = 1;
            tt.getResumeList()
        },

        // 页码改变
        changePage(page){
            var tt = this;
            tt.page = page;
            tt.getResumeList()
        },


        // 更改状态
        changeResumeState(item,state){ //state是要更改的状态,type是区分remark和state
            var tt = this;
            var idArr = [];
            if(item){
                idArr.push(item.row.id);
                var index = item.$index;
            }else{
                tt.optbultArr.forEach(function(val){
                    idArr.push(val.id)
                })
                state = 1;
            }
            // return false;

            // var id = item.row.id;
            var paramStr = '';
            if(state == 2){
                paramStr = '&refuse_msg=' + tt.markSelect;
            }


            


            $.ajax({
				url: '/include/ajax.php?service=job&action=updateDelivery&id='+idArr.join(',')+'&state='+state + paramStr,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        if(item){
                            tt.tableData[index]['state'] = state;
                        }else{
                            tt.getResumeList(); //重新加载当前页
                        }
                        mapPop.successTipText = data.info;
                        mapPop.successTip = true;
                    }else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
                    }
				},
				error: function () { 
					
				}
			});
        },


        // 获取应聘的职位
        getStorePost:function(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=postList&page=1&state=1,3&off=0&pageSize=10000&com=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    tt.finAjaxNumber++;
                    if(tt.iniAjaxNumber<=tt.finAjaxNumber){ //获取列表的ajax是否完成
                        tt.isload = false;
                    };
					if(data.state == 100){
                        tt.postArr = data.info.list;
                        mapPop.postArr =  data.info.list;
					}
				},
				error: function () { 
					tt.isload = false;
				}
			});
        },

        // 隐藏popover
        hidePopover(id){
            console.log(id);
            this.$refs[id].doClose();
        },

        // 显示popover
        showPopover(scope){
            const tt = this;
            tt.markText = scope.row.remark.remark_resume; 
            tt.editRemark.onChose = scope.row.remark.remark_type;
            const el = tt.$refs['mark_'+scope.row.id].$refs['popper'];
            setTimeout(() => {
                $(el).find('.el-textarea textarea').focus();
            }, 500);
        },

        // 拒绝
        refuseResume(scope,type){
            var tt = this;
            if(!tt.markSelect){
                $(".markContainerBox .el-select .el-input").addClass('focus_shan');
                setTimeout(() => {
                    $(".markContainerBox .el-select .el-input").removeClass('focus_shan'); 
                }, 2000);
                return false;
            }
            tt.changeResumeState(scope,2,1)
            tt.$refs[id].doClose();
        },

        // 点击标注按钮或者删除按钮 ,opt是操作1表示删除，type是区分面试还是简历标注
        editReamrk(scope,type,opt){
            var tt  = this;
            tt.currOnEditRow = scope;
            if(opt == 1){ //删除
                console.log(type)
                if(type == 0){
                    tt.editRemark.remark = '';
                    tt.markText = '';
                    tt.changeResumeProgress(scope);
                    tt.editRemark.edit = false;
                }
            }else{
                var remark = type == 0 ? scope.row.remark.remark_resume : scope.row.remark.remark_invitation;
                tt.editRemark = {
                    edit:true, //是否正在编辑
                    remark:remark,  //标注的内容
                    type:type    //标注的类型 0简历标注  1是面试标注
                }
            }
        },

        // 对简历进行标注
        changeResumeProgress(scope,type,state){  //操作的行，类型，状态
            var tt = this;
            var param = '';
            var index = scope.$index;
            var remark = type == 5 ? tt.markSelect : tt.markText;
            if(type == 5 && tt.markSelect == '' && state == 1 && scope.row.delivery){ //设置不合适时需要的条件,只有投递过的
                $(".markContainerBox .el-select .el-input").addClass('focus_shan');
                setTimeout(() => {
                    $(".markContainerBox .el-select .el-input").removeClass('focus_shan'); 
                }, 2000);
                return false;
            }
            if(state == 0){
                type = scope.row.remark.remark_type_last&&scope.row.remark.remark_type_last!=5 ? scope.row.remark.remark_type_last : 0;
            }
            type = type != undefined ?  type + '' : '';
            var update_typeArr = [];  
            update_typeArr.push('remark')
            if(type){
                update_typeArr.push('type')
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateDownResume&remark='+remark+'&id='+scope.row.id+'&remark_type='+type + '&update_type='+ update_typeArr.join(','),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        if(type == 5 && scope.row.delivery){
                            mapPop.successTipText = '已拒绝该求职者的投递';
                            mapPop.successTip = true;
                        }
                        if(type == 5 && state == 0){
                            tt.tableData[index].remark.remark_type = tt.tableData[index].remark.remark_type_last;
                        }else{
                            tt.tableData[index].remark.remark_type = type;
                        }
                        tt.tableData[index].remark.remark_resume = remark;
                        tt.tableData[index].remark.remark_resume_time = parseInt(new Date().valueOf() /1000);
                        tt.getResumeList();
					}else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
                    }
				},
				error: function (data) { 
					mapPop.showErrTip = true;
                    mapPop.showErrTipTit = data.info;
				}
			});
        },

        // 确认修改标注
        changeRemark(scope){
            var tt = this;
            tt.markText = tt.editRemark.remark;
            tt.editRemark.edit = false;
            tt.changeResumeProgress(scope)
        },


        // 批量删除下载简历
        delDownloadResume(scope){
            var tt = this;
            if(scope){
                console.log(scope)
            }else{
                console.log(tt.optbultArr)
            }
        },
        

        // 显示邀请弹窗
        showInvitePop(scope){
            var tt = this;
            if(tt.postArr.length==0){
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo ={
                    icon:'err',
                    title:'请先发布职位招聘职位',
                    tip:'发布职位后，即可下载简历获取联系方式、邀请面试等',
                    popClass:'interviewPop',
                    btngroups:[
                        {
                            tit:'取消',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            cls:'cancel',
                            type:''
                        },
                        {
                            tit:'发布职位',
                            fn:function(){
                                mapPop.confirmPop = false;
                                open(`${masterDomain}/supplier/job/add_post.html`);
                            },
                            cls:'topub',
                            type:'primary'
                        },
                    ]
                }
                return
            };
            mapPop.resetData();
            mapPop.formPop = true;
            mapPop.currResume = scope.row;
            mapPop.currResume['postSelect'] = tt.postSelect; //当前优先筛选的职位
            mapPop.changeResumeAddr = false;
            // 匹配投递的职位
            var td_index = mapPop.postArr.findIndex((item) => item.id == mapPop.currResume.pid);
            if(mapPop.currResume.delivery && td_index > -1){
                mapPop.getAllAddrList('all'); //获取地址列表
                mapPop.resumeForm.postInfo = mapPop.postArr[td_index];
                if(mapPop.resumeForm.postInfo.job_addr_detail){
                    mapPop.resumeForm.job_addr_id = mapPop.postArr[td_index].job_addr;
                }
                return false;
            }

            var sel_index = td_index = mapPop.postArr.findIndex((item) => item.id == mapPop.currResume.postSelect);
            if(mapPop.currResume.postSelect&& td_index > -1){
                mapPop.resumeForm.postInfo = mapPop.postArr[sel_index];
                mapPop.resumeForm.job_addr_id = mapPop.postArr[sel_index].job_addr;

                return false;
            }



            for(var i = 0; i < mapPop.postArr.length; i++){
                var jobArr = mapPop.currResume.resume.job; 
                if(jobArr && jobArr.length){
                    var index = jobArr.findIndex((it)=> it == mapPop.postArr[i].id);
                    if(index > -1){
                        mapPop.resumeForm.postInfo = mapPop.postArr[i]
                        mapPop.resumeForm.job_addr_id = mapPop.postArr[i].job_addr;

                        break;
                    }
                }
            }

            // 地址没有需加载
            if(mapPop.jobAddrList && !mapPop.jobAddrList.length){
                mapPop.getAllAddrList('all'); //获取地址列表
            }
            tt.hidePopover('mark_'+scope.row.id);
        
        },

        // 设置行index
        tableRowClassName({row, rowIndex}){
            row.index = rowIndex;
            return 'rows'
        },
        rowClick(row){
            var tt = this;
            tt.tableData[row.index].read = 1;
            tt.linkTo(row)
        },
        // 跳转链接， 需判断简历是否正常
        linkTo(row){
            var tt = this;
            var resume = row.resume;
            console.log(row.resume);
            var scope = {
                row
            }
            if(resume.del){//不存在
                mapPop.confirmPop = true;
                if(tt.currPage == 2){ //下载的简历，投递过的
                    var htmlDom = '<div class="tdResume_tip"><h4>'+resume.phone+'<span>('+resume.name+')</span></h4><p>如需重新下载或了解更多，您可以联系求职者</p></div>'
                    mapPop.confirmPopInfo ={
                        icon:'',
                        title:'该简历线上版本已失效，可前往邮箱查看历史附件',
                        tip:htmlDom,
                        popClass:'confirmPop_2 tdResumePop',
                        btngroups:[
                            {
                                tit:'取消',
                                fn:function(){
                                    mapPop.confirmPop = false;
                                },
                                cls:'cancelReadResume',
                                type:''
                            },
                            
                        ]
                    }
                    return false;
                }

                var text =  tt.currPage == 1 ? '您可选择取消收藏该简历' : '您可选择删除此份投递简历';
                mapPop.confirmPopInfo = {
                    icon:'error',
                    title:'该简历已失效',
                    tip:'<p style="color:#999;">'+text+'</p>',
                    popClass:'readResumePop',
                    btngroups:[
                        {
                            tit:'取消',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:'',
                        },
                        {
                            tit:tt.currPage == 1?'取消收藏':'删除简历',
                            fn:function(){
                                if(tt.currPage  == 1){
                                    tt.delCollectResume(scope); //取消删除
                                }else{
                                    tt.delResume(scope); //删除这份简历
                                }
                            },
                            type:'primary',
                        },
                        
                    ]
                }

                return false;
            } 




            console.log(resume.private,this.currPage);
            if(resume.private &&this.currPage==2){  //设置了隐私
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo = {
                    icon:'',
                    title:'该简历不在公开人才库内，是否需要查阅？',
                    tip:'可询问求职者为您开放查阅权限',
                    popClass:'readResumePop',
                    btngroups:[
                        {
                            tit:'取消',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:'询问查阅',
                            fn:function(){
                                mapPop.chatWithUser(resume.userid);
                                mapPop.confirmPop = false;
                            },
                            type:'primary',
                        },
                        
                    ]
                }
            }else {
                window.open(row.resume.url)
            }
        },


        // 联系别人
        chatWith(row){
            mapPop.chatWithUser(row.resume.userid)
        },

        // 下载简历
        downloadResume(item,ind){
            var tt = this;
            
            var flag = mapPop.checkDownloadResume(item); //验证是否下载
            if(!flag) return false;
            if(item.resume.private ){  //设置了隐私
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo = {
                    icon:'',
                    title:'该简历不在公开人才库内，是否需要查阅？',
                    tip:'可询问求职者为您开放查阅权限',
                    popClass:'readResumePop',
                    btngroups:[
                        {
                            tit:'取消',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:'询问查阅',
                            fn:function(){
                                mapPop.chatWithUser(item.resume.userid);
                                mapPop.confirmPop = false;
                            },
                            type:'primary',
                        },
                        
                    ]
                }

                return false; 
            }

            // 判断是否已开通套餐
            if(!mapPop.businessInfo.combo_id && !mapPop.businessInfo.package_resume && !mapPop.businessInfo.can_resume_down){ //没有开通过套餐 并且没有下载次数
                mapPop.buyMeadlPop = true;
                return false;
            }

            // 显示下载简历弹窗
            mapPop.downResumePop = true;
            mapPop.downResumeDetail = item;
            if(mapPop.businessInfo.combo_resume == -1){  //不限制下载次数
                mapPop.businessInfo.can_resume_down = 999999
                mapPop.businessInfo.combo_resume = 999999
                
            }
            if(mapPop.businessInfo.can_resume_down == 0){
                var  can_resume_down = mapPop.businessInfo.can_resume_down;
                var  combo_resume = mapPop.businessInfo.combo_resume;
                mapPop.showErrTip = true;
                mapPop.showErrTipTit = '今日下载次数已用完('+can_resume_down+'/'+combo_resume+')';
            }

            console.log(item)
            // var paramArr = [];
            // paramArr.push("type=3"); //下载简历
            // paramArr.push("rid=" + item.id); //下载简历
            // tt.showPayPop(paramArr)

        },

        // 调起支付弹窗
        showPayPop(paramArr,ind){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        var info= data.info;
                        orderurl = info.orderurl;
                        if(typeof (info) != 'object'){
                            mapPop.successTip = true;
                            mapPop.successTipText = '刷新成功！';
                            return false;

                        }
                        
                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        }, 1000)
                        
                        var datainfo = [];
                        for (var k in info) {
                            datainfo.push(k + '=' + info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();
                        if (usermoney * 1 < info.order_amount * 1) {
                            $("#moneyinfo").text('余额不足，');
                        }else{
                            $("#moneyinfo").text('剩余');

                        }

                        if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                            $("#bonusinfo").text('额度不足，可用');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < info.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum  = info.ordernum;
                        order_amount = info.order_amount;
                        $("#ordertype").val('');
                        $("#service").val('job');
                        service = 'job';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});



        },

        // 批量存至本地
        saveResumeToLocal(){
            var tt = this;
            const idArr = tt.optbultArr.map(item => {
                return item.rid
            });
            tt.saveResume(idArr,1)
        },
        // 批量发送至邮箱
        sendResumeToEmail(){
            var tt = this;
            const idArr = tt.optbultArr.map(item => {
                return item.rid
            });
            tt.saveResume(idArr,2)
        },
        // 下载简历
        saveResume(id,type){  //type是1 表示本地下载 
            const tt = this;
            const idStr = Array.isArray(id) ? id.join(',') : id;
            if(type==1){
                top.location.href=`/include/ajax.php?service=job&action=secResumes&rid=${idStr}&operation=saveLocal`;
            }else if(type==2){
                $.ajax({
                    url: '/include/ajax.php?service=job&action=secResumes&operation=sendEmail&rid=' + idStr,
                    type: "POST",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data.state == 100){
                            mapPop.successTipText = '已发送至邮箱';
                            mapPop.successTip = true;
                            console.log(10)
                        }else{
                            mapPop.showErrTipTit = data.info;
                            mapPop.showErrTip = true; 
                        }
                    },
                    error: function (data) { 
                        mapPop.showErrTipTit = data.info;
                        mapPop.showErrTip = true;
                    }
                });
            }else{
                $.ajax({
                    url: '/include/ajax.php?service=job&action=downloadResume&postEmail=1&id=' + idStr,
                    type: "POST",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data.state == 100){
                            mapPop.successTipText = '已发送至邮箱';
                            mapPop.successTip = true;
                        }else{
                            mapPop.showErrTipTit = data.info;
                            mapPop.showErrTip = true; 
                        }
                    },
                    error: function (data) { 
                        mapPop.showErrTipTit = data.info;
                        mapPop.showErrTip = true;
                    }
                });
            }
        },

        // 获取参数
        getUrlPrarm(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },

        // 获取相关配置
		getBaseConfig(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=getItem&name=jobTag,jobNature,education,experience,welfare',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						tt.baseConfig = data.info;
					}
				},
				error: function () { 

				}
			});
		},

        changeItem(item,label){
            var tt = this;
            var min = '',max = '';

            if(item == ''){
                tt[label] = '';
            }else if(item == 'self'){ //自定义的值
                min = tt['min_' + label];
                max = tt['max_' + label];
            }else{
                tt[label] = item.value;
                var itemVal = item.value;
                var itemValArr = itemVal.split('-');  //年龄和月薪
                if(itemValArr.length > 0){
                    min = itemValArr[0];
                    max = itemValArr[1];
                }else{
                    min = itemValArr[0];
                }
            }
            tt.filterForm['min_' + label] = min; 
            tt.filterForm['max_' + label] = max; 
            if(tt.filterForm.min_age || tt.filterForm.max_age){

                tt.ageText  = tt.filterForm.min_age + (tt.filterForm.max_age ? ('-' + tt.filterForm.max_age) + '岁': '岁以下');  //input显示的值
            }else{
                tt.ageText = '不限'
            }
            // 隐藏所有弹窗
            this.$refs.agePopper.doClose();

        },

        // 重置高级选项
        resetFilter(){
            const that = this;
            for(let item in that.filterForm){
                that.$set(that.filterForm,item,'');
            }
            that.min_age = '';
            that.max_age = '';
            that.ageText = '';

        },

        // 确认选择
        confirmFilter(){
            const that = this;
            that.filterPop = false;
            that.page = 1; //重新加载数据
            that.getResumeList()
        },

        toGetExcel(){
            const that = this;
            that.getResumeList(1)
        },
    }

})


