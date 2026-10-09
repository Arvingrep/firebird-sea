if(certificateState!=1){
    history.go(-1);
}
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:6,
		hoverid:'',
		loading:false,
        keywords:'', //搜索关键字
        totalCount:0,
        page:1,
        tabsArr:[{
            id:0,
            text:'全部',
            count:0,
            value:'',
        },{
            id:1,
            text:'待面试',
            count:0,
            value:'1',
        },{
            id:2,
            text:'沟通offer',
            count:0,
            value:'3',
        },{
            id:3,
            text:'待入职',
            count:0,
            value:'4',
        },],
        currTab:0,
        isload:false, //是否加载中
        tableData:[],

        stateArr_1:[{
            labText:'已录取，待入职',
            label:'待入职',
            value:'4'
        },{
            labText:'沟通offer',
            label:'沟通offer',
            value:'3'
        },{
            labText:'已面试，不合适',
            label:'不合适',
            value:'5'
        },{
            labText:'待面试',
            label:'待面试',
            value:'1'
        },{
            labText:'面试取消',
            label:'已取消',
            value:'6'
        }],
        
        stateArr:[{
            label:'待入职',
            value:0
        },{
            label:'已入职',
            value:1
        },{
            label:'取消入职',
            value:2
        },],

        // 当前标注弹窗的相关设置
        markinfo:{
            markSelect:'',
            markText:'',
            showmarkText:false, //是否显示标注输入框
            markState:0,
            joinDate:'',
            interviewDate:'', //面试时间
        },

        postFor:'', //面试职位
        postArr:[],//面试中的职位

        editRemark:{
            edit:false, //是否正在编辑
            remark:'',  //标注的内容
            type:'0',    //标注的类型 0简历标注  1是面试标注
            onChose:0, // 默认选中
        },

        optShow:false, //操作框显示
        cancelInterview:0, //取消面试的
        cancelFilter:false,//过滤已取消面试的

        pickerOptions: {
            disabledDate: (time) => {
                let nowData = new Date();
                nowData = new Date(nowData.setDate(nowData.getDate() - 1));
                return time < nowData
            },
            selectableRange:'6:00:00-20:00:00'
        },
        interviewPickerOptions:{
            disabledDate: (time) => {
                let nowData = new Date()
                let maxTime= +new Date() + 2592000000*2
                nowData = new Date(nowData.setDate(nowData.getDate() - 1));
                return nowData >= time||time >= maxTime
            },
            selectableRange:'6:00:00-20:00:00'
        },
        editid:0, //当前操作的id，点击操作按钮

        rz_num:0, //已入职
        rz_num_1:0, //待入职

       
	},
	mounted() {
        var tt = this;
        if(tt.getUrlPrarm('postid')){
            tt.postFor = Number(tt.getUrlPrarm('postid'))
        }
        if(tt.getUrlPrarm('state')){
            tt.currTab = tt.getUrlPrarm('state')
        }
        tt.$nextTick(() => {
            tt.checkLeft();
        })

        // 加载招聘中的职位
        tt.getStorePost()

        // 加载数据
        tt.getInterviewList();
    },
    computed:{
       


        // 时间转换
        timeTrans(){
            return function(timestr,n){
                var date = mapPop.transTimes(timestr,n);
                return date;
            }
        },

        // 对比时间 是之前还是之后
        checkDateVal(){
            return function(timeStr){
                timeStr = Number(timeStr)
                var curr = parseInt(new Date().valueOf()/1000);
                return timeStr <= curr;
            }
        },

         // 薪资转换
        salaryChange(){
            return function(item){
                if(!item ) return false;
                var minS = item.min_salary, 
                    maxS = item.max_salary;
                var text = minS + ' - ' + maxS
                if(item.min_salary > 1000 || item.max_salary > 1000 ){
                    minS = item.min_salary;
                    maxS = item.max_salary;
                    text =  minS + ' - ' + maxS 
                }
                return text;
            }
        },

        // remarkType
        checkRemark_type(){
            return function(scope){
                var tt = this;
                var remark_name = '';
                var type = scope.row.state; //当前状态

                for(var i=0; i< tt.stateArr_1.length; i++){
                    if(tt.stateArr_1[i].value == type){
                        remark_name = tt.stateArr_1[i].label;
                        break;
                    }
                }

                // 如果状态时待面试，但是面试时间已过
                var timeStr = Number(timeStr)
                var curr = parseInt(new Date().valueOf()/1000);
                if(type == 2 && timeStr <= curr){
                    remark_name = '添加标记'
                }



                return remark_name;
            }
        },

        // // 跳转url
        // goLink(row, column, cell, event){
        //     console.log(row)
        //     console.log(column)
        //     console.log(cell)
        // }
    },
    watch:{
        currTab:function(val){
            var tt = this;
            tt.checkLeft(val)
            tt.page = 1;
            tt.tableData = [];
            tt.getInterviewList();
        },
        // 补款已取消
        cancelFilter:function(val){
            var tt = this;
            tt.page = 1;
            tt.getInterviewList();
        },
        // 操作状态
        ['markinfo.markState']:function(val){
            var tt = this;
            tt.markinfo.showmarkText=tt.markinfo.markText?true:false;
        },

        // 职位改变
        postFor:function(){
            var tt = this;
            tt.page = 1;
            tt.getInterviewList()
        },
    },
    methods:{
          // 搜索
          toSearch(){
            const that = this;
            tt.page = 1;
            tt.tableData = [];
            tt.getInterviewList();
        },
        operate(date){
            if(date){
                this.markinfo.interviewDate = date * 1000;
            };
            $(event.currentTarget).closest('.el-table__row').addClass('active').siblings().removeClass('active');
        },
        checkLeft(val){
            var tt = this;
            var currTab = val ? val : tt.currTab;
            var el = $(".tabBox li[data-id='"+currTab+"']");
            var left = 0;
            if(el.length){
                left = el.position().left + el.innerWidth()/2  - $(".tabBox s").width()/2;
            }
            $(".tabBox s").css({
                'transform':'translateX('+left+'px)'
            })
        },

        // 获取面试的职位
        getStorePost:function(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=postList&page=1&state=1&off=0&pageSize=10000&com=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        tt.postArr = data.info.list;
					}
				},
				error: function () { 

				}
			});
        },

        changePage(page){
            var tt = this;
            tt.page = page;
            tt.getInterviewList()
        },

        // 表格全选
        selectAll(){
            var tt = this;
            tt.$refs.table.toggleAllSelection()
        },

        // 对所选数据进行操作
        optSelection(){
            var tt = this;
            // console.log(tt.$refs.table.selection)
        },

        // 下架

        // 获取面试日程
        getInterviewList(){
            var tt = this;
            tt.isload = true;


            var paramStr = ''
            var state = '';

            // 状态
            for(var i = 0; i < tt.tabsArr.length; i++){
                if(tt.currTab == tt.tabsArr[i].id){
                    state = tt.tabsArr[i].value;
                }
            }
            paramStr = paramStr + '&state=' + state;

            if(tt.cancelFilter){
                paramStr = paramStr + '&cancel=1'
            }
            if(tt.postFor){
                paramStr = paramStr + '&pid='+tt.postFor
            }

            $.ajax({
				url: '/include/ajax.php?service=job&action=interviewList&page='+tt.page+'&pageSize=5&keyword='+tt.keywords + paramStr,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.isload = false;
                    tt.tableData = [];
					if(data.state == 100){
                        tt.tableData = data.info.list;
                        tt.totalCount = data.info.pageInfo.totalCount;
                        for(var i = 0; i < tt.tabsArr.length; i++){
                            tt.tabsArr[i].count =  data.info.pageInfo['state' + tt.tabsArr[i].value]
                        }
                        tt.cancelInterview = data.info.pageInfo.state2; //已取消面试的 
                        tt.rz_num = data.info.pageInfo.state4_0; //已入职
                        tt.rz_num_1 = data.info.pageInfo.state4_1; //待入职
                        if(tt.page == 1){
                            tt.checkLeft();
                        }
					}
				},
				error: function () { 
                    tt.isload = false;
				}
			});
        },

        // 隐藏弹窗
        hidePopover(id){
            this.$refs[id].doClose();
        },
        removeActive(){
            $('.el-table__row.active').removeClass('active')
        },
        changeData(scope){
            // 点击按钮之后 将值改变
            var tt = this;
            tt.markinfo.joinDate = scope.row.rz_date ? scope.row.rz_date * 1000 : new Date().valueOf(); 
            tt.markinfo.markState = scope.row.state; 
            tt.markinfo.markText = scope.row.remark.remark_invitation;
            
        },

        changeEdit(scope){
            var tt = this;
            tt.editid = scope.row.id;
        },

        // 更新面试相关
        updateInterView(scope,type){  //scope编辑的行，type更新的类型
            var tt = this;
            var paramStr = '';
            var index = scope.$index;
            // if(state){
            //     paramStr = paramStr + '&state=' + state;
            //     if(state == '5'){ 
            //         paramStr = paramStr + '&refuse_msg=' +  tt.markinfo.markSelect
            //     }
            // }
            if(type == 'date'){
                paramStr = '&action=updateInterView&date=' + parseInt((tt.markinfo.interviewDate).valueOf()/1000)
            }else if(type == 'state'){
                paramStr = '&action=updateInterView&state=' + tt.markinfo.markState+ (tt.markinfo.markState==6?'&refuse_author=company':'');
                if(tt.markinfo.markState == 5){
                    paramStr = paramStr + '&refuse_msg=' + tt.markinfo.markText;
                }else if(tt.markinfo.markState == 4){
                    paramStr = paramStr + '&rz_date=' + parseInt((tt.markinfo.joinDate).valueOf()/1000);  
                }
                
                if(tt.markinfo.markText){
                    paramStr = paramStr + '&remark=' + tt.markinfo.markText;
                }
            }else if(type == 'rz_date'){
                paramStr = '&action=updateBoarding&rz_date=' + parseInt((tt.markinfo.interviewDate).valueOf()/1000); 
                if(tt.markinfo.markText){
                    paramStr = paramStr + '&remark=' + tt.markinfo.markText;
                }
            }else if(type == 'rz_state'){
                paramStr = '&action=updateBoarding&rz_state=' + scope.row.rz_state ;
            }
            $.ajax({
				url: '/include/ajax.php?service=job&id='+scope.row.id + paramStr,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        mapPop.successTipText = '修改成功';
                        mapPop.successTip = true;
                        if(type == 'date'){
                            paramStr = '&date=' + parseInt((tt.markinfo.interviewDate).valueOf()/1000)
                            tt.tableData[index][type] = parseInt((tt.markinfo.interviewDate).valueOf()/1000)
                        }else if(type == 'rz_date'){
                            paramStr = '&rz_date=' + parseInt((tt.markinfo.joinDate).valueOf()/1000);
                            tt.tableData[index][type] = parseInt((tt.markinfo.joinDate).valueOf()/1000);
                        }else if(type == 'state'){
                            paramStr = '&state=' + tt.markinfo.markState;
                            tt.tableData[index][type] = tt.markinfo.markState;
                            if(tt.markinfo.markState == 5){
                                paramStr = '&refuse_msg=' + tt.markinfo.markSelect;
                                tt.tableData[index]['refuse_msg'] = tt.markinfo.markSelect;
                                // tt.tableData[index].remark.remark_resume_time = parseInt(new Date().valueOf() /1000)
                            }
                            if(tt.markinfo.markText){
                                tt.tableData[index]['remark']['remark_invitation'] = tt.markinfo.markText;
                                paramStr = '&remark=' + tt.markinfo.markText;
                                tt.tableData[index].remark.remark_invitation_time = parseInt(new Date().valueOf() /1000)
                               
                            }
                        }
                        
                    }else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
                    }
				},
				error: function () { 
                    tt.isload = false;
				}
			});
        },


        // 点击标注按钮或者删除按钮 ,opt是操作1表示删除，type是区分面试还是简历标注
        editReamrk(scope,type,opt){
            var tt  = this;
            tt.currOnEditRow = scope;
            if(opt == 1){ //删除
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

        // 时间转换
        checkDate(dateStr){
            var curr = parseInt((new Date()).valueOf()/1000); //当前时间戳
            var dayArr = ['周日','周一','周二','周三','周四','周五','周六']
                var dateParam = new Date(dateStr * 1000)
                var timeStr = ''
                var isToday = false;
                var year   = dateParam.getFullYear();  //取得4位数的年份
                var month  = dateParam.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
                var date   = dateParam.getDate();      //返回日期月份中的天数（1到31）
                var day   = dateParam.getDay();      //返回日期月份中的天数（1到31）
                // var hour   = now.getHours();     //返回日期中的小时数（0到23）
                // var minute = now.getMinutes(); //返回日期中的分钟数（0到59）
                if(dateStr > curr || new Date(dateStr * 1000).toDateString() == new Date().toDateString()){
                    isToday = true;
                }
    
                if(new Date(dateStr * 1000).toDateString() == new Date().toDateString()){
                    timeStr = '今天'
                }else{
                    timeStr = month +'月'+ date +'日' + '('+dayArr[day]+')'
                }
                return [isToday,timeStr]
        },


         // 获取参数
        getUrlPrarm(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        }

    
    }
})