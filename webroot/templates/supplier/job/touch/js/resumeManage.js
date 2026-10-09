var ajaxIng = null; //是否正在请求
var pid,cid,did;
var pageVue = new Vue({
    el:'#page',
    data:{
        deliveryFilter:delivery_filter, //是否设置初筛 1开启 0关闭
        delivery_smart:delivery_smart, //智能
        postArr:[], //商家发布过的职位
        postSelect:'', //当前选择的职位
        keywords:'', //搜索关键字
        keySave:'', //保存的搜索关键字
        searchShow:false,
        noFit:true,

        pageList:[{title:'投递的简历',id:0,count:count0},{title:'下载的简历',id:2,count:count2},{title:'收藏的简历',id:1,count:count1}],
        currPage:type, //0是投递简历 ，1是收藏的简历 ， 2是下载的简历
        communication:[ { value:4, label:'待拨打',}, { value:2, label:'未接通' }, { value:3, label:'待回复' }, { value:1, label:'已约面' }, { value:0, label:'未处理' }, { value:5, label:'不合适' }, ],
        communication_s:[  { value:1, label:'已约面' }, { value:2, label:'未接通' }, { value:3, label:'待回复' }, { value:4, label:'待拨打',}, { value:5, label:'不合适' }, ],
        resumeState:'', //沟通进度
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
        currTab:'',
        resumeList:[], //下载的简历列表
        page:1,
        isload:false,   //是否可以继续加载
        loadEnd:false, //加载已结束
        loading:false, //正在加载中

        showSlidePop:false,
        showType:'',  //postSelect 选择职位  ，resumeState  状态筛选   ，setting 设置 , marked 标注信息的弹窗  deliveryDetail 投递详情   resumeHasDel  查看已失效的简历   refuseTd 拒绝投递  markPop 标注弹窗 setEmail 设置邮箱   downloadResume  下载简历   resumeDetail  下载之后的操作
        curroptItem:'', //当前正在操作的项
        currOptIndex:0, //当前编辑的索引
        setting:false, //设置弹窗打开
        setBtns:[
            {id:1,title:'初筛流程',type:1,set:delivery_filter ? 1 : 0,},
            {id:2,title:'清理简历',type:2},
            {id:3,title:'智能处理',type:1,set:delivery_smart? 1 : 0,},
            {id:4,title:'过滤无效简历',type:1,set:1,},
        ], //设置简历
        noClick:false,
        showPageChose:false, //显示简历页面切换
        fixedTop:0,

        refuseArr:['简历与职位匹配度不高','职位已停止招聘'],
        refuseMsg:'', //拒绝理由
        refuseForm:{
            remark:'',
            remark_type:'',
            update_type:'',
            id:'',
        },
        setEmail:'',  //设置接收简历的email
        plOptArr:[], // 批量选择的简历
        pl_manage:false, //批量管理
        companyDetail:{
            email:companyEmail,
            can_resume_down:can_resume_down, //下载次数
            combo_id:combo_id, //套餐id
            config:comp_config ? JSON.parse(comp_config) : '', //配置
            phone:people_phone,
            people:people,
            people_job:people_job,
            address:'',
            all_addr:[] ,
            email_buyResume:email_buyResume, //是否自动发送简历
            package_resume:package_resume, //增值包下载简历次数
        },


        // 邀请面试相关
        invitatePostPop:false,
        invitatePostChose:false, //职位选择
        invitateAddrChose:false, //地址选择
        invitateDateChose:false ,//面试时间选择
        invitateForm:{
            pid:'',   //职位id
            postName:'',
            post:'', //选择的职位
            rid:'',  //简历id
            interview_time:'',  //面试时间
            name:'',   //联系人
            phone:'',  //联系方式
            notice:'',  //其他备注
            place:'', //工作地点
            placeName:'', //地点名
        },

        invitateChosed:{
            post:'', //选择的职位
            addr:'' , //选择的地址
            currentDate:'',
            currentTime:'',
            minDate:new Date(),
        },
        btnLoad:false,
    
        formatterDate: (type, option) => {
            if (type === 'year') {
                option += '年';
            }
            if (type === 'month') {
                option += '月';
            }
            if (type === 'day') {
                option += '日';
            }
            if (type === 'hour') {
                option += '时';
            }
            if (type === 'minute') {
                option += '分';
            }
            return option;

        },


        // 地址相关
        addWorkPosi:false, //显示地址
        showSearch:false, //显示搜索
        searchList:[],
        currInd:0,
        newAddr:{},
        loadEndAddr:false,
        cityid:cityid,//城市分站
        surroundingPois:[],
        lng:'',
        lat:'',
        city:city,
       
        jobAddrList:[], //工作地点

        // 面试时间选择 修改
        // 60天
        dateArr:[],
        hourArr:[],
        minArr:[],
        dateChose:{
            day:'',
            hour:'',
            min:'',
        },
        slideUp:false, //页面向上滑动 
        slideH:0,//下载提示的高度
        isloadAddr:false,//加载中

        delivery_pid:0, //投递的职位
        download_tip:true, //下载次数提示
    },

    mounted(){
        const that = this;
        that.getPostList(); //获取发布的职位
        that.getResumeList(); //获取简历
        that.fixedTop = $(".fixedTop").height()
        that.getNextDate(2); //获取两个月
        that.slideH = $(".downloadTip").height()
        let scrollTop = 0; //
        setTimeout(() => {
            $(window).scroll(function(){
                var scrTop = $(this).scrollTop();
                var bh = $('body').height() - 50;
                var wh = $(window).height();
                if (scrTop + wh >= bh && !that.isload && !that.loadEnd) {
                    that.getResumeList(); //获取简历
                }
                that.$refs.searchInp.blur();
                if(that.currPage == 2 && scrTop >= 0 && scrTop + wh < bh){
                    if(scrollTop < scrTop){
                        that.slideUp = true;
                    }else{
                        that.slideUp = false;
                        if(!that.slideH){
                            that.slideH = $(".downloadTip").height()
                        }
                    }
                    scrollTop = scrTop
                }
    
            })
        },1500)
        that.getAllAddrList('all')
    },
    computed:{
        checkStateName:function(){
            const that = this;
            let pname = '沟通进度';
            if(that.resumeState){
                let choseItem = that.communication.filter(item => {
                    return item.value === that.resumeState
                });
                pname =  choseItem && choseItem.length  ? choseItem[0].label : '沟通进度'
            }

            return pname
        },
        checkPostName:function(){
            const that = this;
            let pname = '筛选职位';
            if(that.postSelect){
                let choseItem = that.postArr.filter(item => {
                    return item.id === that.postSelect
                });
                pname =  choseItem && choseItem.length  ? choseItem[0].title : '筛选职位'
            }

            return pname
        },

        checkTitle:function(){
            const that = this;
            let pagename = '投递的简历'
            for(let i = 0; i < that.pageList.length; i++){
                if(that.pageList[i].id == that.currPage){
                    pagename = that.pageList[i].title;
                    break;
                }
            }
            return pagename;
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

        
    },
    methods:{
        checkMark(){
            const that = this;
            console.log(2);
            that.$refs.toMarkBox.scrollIntoView()
            console.log(3);
        },

        // 重新加载列表
        reloadList(filter){
            const that = this;
            that.page = 1;
            that.loadEnd = false;
            that.isload = false;
            that.loading = true;
            that.getResumeList(filter); //获取简历
        },

        // 获取职位筛选的职位分类
        getPostList(){
            const that = this;

            $.ajax({
				url: '/include/ajax.php?service=job&action=postList&page=1&state=1,3&off=0&pageSize=10000&com=1',
				type: "POST",
				dataType: "json",
				success: function (data) {
					that.isload = false;
					if(data.state == 100){
                        that.postArr = data.info.list;
					}
				},
				error: function () { 
					that.isload = false;
				}
			});
        },

        // 清除关键字
        clearKey(){
            const that = this;
            that.keywords = '';
            setTimeout(() =>{
                that.$refs.searchInp.focus()
            },300)
        },

        // 获取投递的简历列表
        getResumeList(filter){
            const that = this;
            let paramStr = ''
            if(that.isload ) return false;
            that.isload = true;
            let state = 0
            for(let i = 0; i < that.tabsArrList.length; i++){
                if(that.tabsArrList[i].id == that.currTab){
                    state = that.tabsArrList[i].value
                    break;
                }
            }
            let param = [];
            param.push('state=' + state);
            if(param && param.length > 0){
                paramStr = '&'+ param.join('&')
            }

            


            if(that.keywords){
                paramStr = paramStr + '&keyword='+that.keywords 
                that.keySave = that.keywords;
            }

            if(that.postSelect){
                paramStr = paramStr + '&pid='+ that.postSelect
            }
            
            if(that.currPage == 0){
                paramStr = paramStr + '&action=deliveryList';
                if(that.noFit){
                    paramStr = paramStr + '&unSuit=1&unValid=1' 
                }
            }else if(that.currPage == 1){
                paramStr = paramStr + '&action=collectResumeList'
            }else{
                paramStr = paramStr + '&action=downResumeList'
                paramStr = paramStr + '&progress=' + (that.resumeState == ' ' ? '' : that.resumeState);
                if(that.noFit){
                    paramStr = paramStr + '&unSuit=1&unValid=1' 
                }
            }

            $.ajax({
				url: '/include/ajax.php?service=job&store=1&pageSize=20&page='+that.page + paramStr,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    that.isload = false;
                    that.loading = false; 
					if(data.state == 100){
                        if(that.page == 1){
                            that.resumeList = []
                        }
                        that.resumeList = that.resumeList.concat(data.info.list);
                        that.page++;
                        if(that.page > data.info.pageInfo.totalPage){
                            that.isload = true; //加载结束
                            that.loadEnd = true;
                        }

                        for(let i = 0; i < that.tabsArrList.length; i++){
                            if(that.tabsArrList[i].value === ''){
                                that.tabsArrList[i].count = data.info.pageInfo.stateA; 
                            }else{
                                // console.log(that.tabsArrList[i],);
                                that.tabsArrList[i].count = data.info.pageInfo['state' + that.tabsArrList[i].value]
                            }
                        }

                        if(filter){
                            showErrAlert(that.noFit ? '已过滤不合适、失效简历' : '已显示全部简历','success')
                        }
                        
                    }else{
                        that.loadEnd = true
                        that.resumeList = []
                    }
				},
				error: function () { 
                    that.isload = false;
                    that.loading = false; 
				}
			});
        },

        // 关键字搜索
        searchKeyResult(){
            const that = this;
            if(event && event.keyCode == 13){
                that.page = 1;
                that.loadEnd = false;
                that.isload = false;
                that.getResumeList(); //获取简历
            }
        },

         // 工具类方法
        transTimes(timeStr,n){
            update = new Date(timeStr * 1000);//时间戳要乘1000
            year = update.getFullYear();
            month = (update.getMonth() + 1 < 10) ? ('0' + (update.getMonth() + 1)) : (update.getMonth() + 1);
            day = (update.getDate() < 10) ? ('0' + update.getDate()) : (update.getDate());
            hour = (update.getHours() < 10) ? ('0' + update.getHours()) : (update.getHours());
            minute = (update.getMinutes() < 10) ? ('0' + update.getMinutes()) : (update.getMinutes());
            second = (update.getSeconds() < 10) ? ('0' + update.getSeconds()) : (update.getSeconds());
            if (n == 1) {
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
            } else if (n == 2) {
                return (year + '-' + month + '-' + day);
            } else if (n == 3) {
                return (month + '-' + day);
            } else if (n == 4) {
                return (month + '-' + day + ' ' + hour + ':' + minute);
            } else if(n == 5){
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute);
            } else if(n == 6){
                return (year + '/' + month + '/' + day + ' ' + hour + ':' + minute );
            }else {
                return 0;
            }
        },
        // 时间转换
        timeStrToDate(timeStr,type){
            // console.log(timeStr);
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
            month = month > 9 ? month : '0' + month
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
            dates = dates > 9 ? dates : '0' + dates
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
            hour = hour > 9 ? hour : '0' + hour;
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
            minute = minute > 9 ? minute : '0' + minute;
			// var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates ;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}else if(year != now.getFullYear()){
                datestr = year + '/' + datestr
            }
            if(year == now.getFullYear()){
                datestr = datestr + ' ' + hour +  ':' + minute;
            }

			if(type == 1){
				datestr = month + '月' + dates + '日'
			}
			return datestr;
		},

        // 时间转换
        timeStrToDates(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
            var year_str = '<span>'+year+'</span>'
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
            var month_str = '<span>'+month+'</span>'
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
            var dates_sta = '<span>'+dates+'</span>'
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
            minute = minute > 9 ? minute : '0' + minute;
			// var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month_str + '月' + dates_sta + '日' ;
       
            let tomorrow = parseInt(new Date().setHours(0, 0, 0, 0).valueOf() / 1000) + 86400
            tomorrow = new Date(tomorrow * 1000)
            if(!type){

                if(now.toDateString() === date.toDateString() ){
                    datestr = datestr + '<span>(今天)</span>'
                }else if(tomorrow.toDateString()=== date.toDateString()){
                    datestr = datestr + '<span>(明天)</span>'
                }else{
                    datestr = datestr + '<span class="'+(day == 0 || day == 6 ? 'weekend':'')+'">('+ weekDay[day] + ')</span>' ;
                }
            }else{
                if(now.toDateString() === date.toDateString() ){
                    datestr = '今天 ('+ weekDay[day] +')' ;
                }else if(tomorrow.toDateString()=== date.toDateString()){
                    datestr = '明天 ('+ weekDay[day] +')' ;
                }else{
                    datestr = datestr + '('+ weekDay[day] + ')'
                } 
                if(type == 2){
                    datestr = datestr 
                }else{

                    datestr = datestr + '   ' + (hour > 12 ? '下午' + (hour-12) : '上午' + hour) + ':' + minute
                }

            }

			return datestr;
		},

        // 显示设置弹窗
        showSettingSlide(){
            const that = this;
            that.showSlidePop = true;
            that.showType = 'setting'
        },

        // 拨打电话
        callPhone(resume){
            const that = this;
            location.href = 'tel:' + resume.phone
        },

        // 跳转链接
        checkGoLink(item){
            const that = this;
            if(item.resume.del){
                let options = {
                    btnSure: that.currPage === 1 ? '取消收藏' : '删除简历',
                    btnColor: '#256CFA',  //确认文字按钮颜色
                    btnCancelColor: '#000',  //确认文字按钮颜色
                    confirmTip:'您可选择' + (that.currPage === 1 ? '取消收藏' : '删除') + '该简历',
                    title:'该简历已失效',
                    isShow:true,
                    popClass:'jobConfirmModel'
                }
                confirmPop(options,function(){
                    if(that.currPage == 1){
                        // 取消收藏

                    }else{ //删除投递 /删除下载 简历
                        that.delResume(item)
                    }
                })

            }
        },

        delResume(item){  //取消收藏不是这个接口
            const that = this;
            var action = that.currPage ? 'delDownResume':'delDelivery';
            $.ajax({
				url: '/include/ajax.php?service=job&action='+action+'&id=' + item.id,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        showErrAlert(data.info)
                        that.reloadList()
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function (data) { 
                    showErrAlert(data.info)
				}
			});
        },

        // 举报简历
        jubaoResume(item){
            const that = this;
            JubaoConfig['id'] = item.id;
            $('.HN_Jubao').click()
            that.showMoreBtn();
            console.log(JubaoConfig)
        },

        sendResume(type,item){ //发送简历  email=>邮件  phone =>手机
            const that = this;
            that.curroptItem = item
            if(!companyEmail && type != 'phone'){
                that.showSlidePop = true; 
                that.showType = 'setEmail'
            }else{
                that.saveResume(type)
            }
            that.showMoreBtn();
        },
        

        // 设置简历
        setResume(item){
            const that = this;
            let id = item.id;
            console.log(id);
            switch(id)
            {   
                case 1: 
                    that.setFilter();
                    that.setBtns[0].set = that.setBtns[0].set ? 0 : 1;
                    break;
                case 2: 
                    that.clearConfirm();
                    break;
                case 3: 
                    location.href = masterDomain + '/supplier/job/setting.html'
                    break;
                case 4: 
                    that.setBtns[3].set = that.noFit ? 0 : 1;
                    that.noFit = !that.noFit;
                    that.showSlidePop = false; //隐藏弹窗
                    break; 
            }
        },

        // 设置初筛
        setFilter(){
            const that = this;

            let opt = that.deliveryFilter ? 0 : 1;
            $.ajax({
				url: '/include/ajax.php?service=job&action=deliveryFilter&filter=' + opt,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        showErrAlert(opt ? '已开启初筛标记流程' : '已省略初筛标记流程','success')
                        that.showSlidePop = false; //关闭
                        that.deliveryFilter = opt;
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function (data) { 
                    showErrAlert(data.info)
				}
			});
        },

        // 清除失效
        clearConfirm(){
            const that = this;
            let options = {
                btnSure: '确认删除',
                btnColor: '#FF4F38',  //确认文字按钮颜色
                btnCancelColor: '#000',  //确认文字按钮颜色
                confirmTip:'删除后不可恢复，请谨慎操作',
                title:'确认删除全部已回绝/失效简历？',
                isShow:true,
                popClass:'jobConfirmModel'
            }
            confirmPop(options,function(){
                const action = that.currPage ? 'clearDownLoadResume' : 'clearDelivery'
                const param = that.currPage ? '&refuse=1' : '&unSuit=1'
                $.ajax({
                    url: '/include/ajax.php?service=job&del=1&action=' + action + param,
                    type: "POST",
                    dataType: "json",
                    success: function (data) {
                        if(data.state == 100){
                            showErrAlert('已删除')
                            
                        }else{
                            showErrAlert(data.info)
                        }
                    },
                    error: function (data) { 
                        showErrAlert(data.info)
                    }
                });
            })
        },

        // 单个删除
        delConfirm(item){
            const that = this;
            let options = {
                btnSure: '确认删除',
                btnColor: '#FF4F38',  //确认文字按钮颜色
                btnCancelColor: '#000',  //确认文字按钮颜色
                confirmTip:'删除后不可恢复，请谨慎操作',
                title:'确认删除该简历？',
                isShow:true,
                popClass:'jobConfirmModel'
            }
            confirmPop(options,function(){
                that.delResume(item)
            })
        },

        // 页面切换
        resumePageChange(){
            const that = this;
            that.showPageChose = true;
            $(document).one('click',function(){
                that.showPageChose = false
            })
            event.stopPropagation()

        },

        // 点击显示更多按钮
        showMoreBtn(){
            const el = event.currentTarget;
            if($(el).find('.popover').hasClass('show')){
                $(el).find('.popover').removeClass('show')
            }else{
                $(".popover").removeClass('show')
                $(el).find('.popover').addClass('show')
                $(document).one('click',function(){
                    $(el).find('.popover').removeClass('show');
                    event.preventDefault();
                })
            }
            event.stopPropagation();
        },

        // 下载的简历已失效
        showResumePop(item){
            const  that = this;
            if(item.resume.del || item.resume.private){ //已删除
                that.curroptItem = item;
                that.showSlidePop = true;
                that.showType = 'resumeHasDel';
            }
        },

        // 拒绝投递简历
        showRefusePop(item){
            const that = this;
            that.curroptItem = item
            that.showSlidePop = true;
            $(".popover").removeClass('show')
            that.showType = 'markPop'
            that.refuseForm.remark_type = 5
            that.showMoreBtn();
        },

        confirmMark(type,notip){ //notip => 不需要提示
            const that = this;

            let update_typeArr = [];  
            update_typeArr.push('remark')
            if(that.refuseForm.type  != ''){
                update_typeArr.push('type')
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateDownResume&remark='+that.refuseForm.remark+'&id='+that.curroptItem.id+'&remark_type='+that.refuseForm.remark_type + '&update_type='+ update_typeArr.join(','),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        if(!notip){
                            if(that.refuseForm.remark_type == 5 && that.curroptItem.delivery){
                                showErrAlert('已拒绝该求职者的投递');
                            }else if(type){
                                showErrAlert('已取消不合适');
                            }else{
                                showErrAlert('已标注');
                            }
                        }

                        setTimeout(() => {
                            that.reloadList()
                        }, 1500);
                        
					}else{
                        showErrAlert(data.info);
                    }
				},
				error: function (data) { 
					showErrAlert(data.info);
				}
			});
        },

        // 取消不合适
        cancelNofit(item){
            const that = this;
            that.curroptItem = item
            that.refuseForm.remark = '';
            that.refuseForm.remark_type = that.curroptItem.remark.remark_type_last ? that.curroptItem.remark.remark_type_last : 0;
            that.confirmMark(1);
        },

        // 发送至邮箱
        saveResume(type){
            const that = this;
            if(!type || type == 'phone'){
                location.href = '/include/ajax.php?service=job&action=downloadResume&local=1&id='+that.curroptItem.resume.id
                return false;
            }

            that.loading = true;
            let  param = '&postEmail=1&email=' + that.setEmail

            $.ajax({
                url: '/include/ajax.php?service=job&action=downloadResume&id='+that.curroptItem.resume.id + param,
                type: "post",
                dataType: "json",
                success: function (data) {
                    
                    that.loading = false;
                    that.showSlidePop = false; //隐藏弹窗
                    that.emailCheckSuccess = true;
                    showErrAlert('发送成功')
                },
                error: function(){
                    // alert("登录失败！");
                    that.loading = false;
                    that.showSlidePop = false; //隐藏弹窗
                    return false;
                }
            });
        },


        // 设置邮箱
        setCompanyEmail(){
            const that = this;
            const el = event.currentTarget;
            if($(el).hasClass('disabled_btn')) return false;
            if(!that.setEmail){
                showErrAlert('请先输入邮箱')
                return false;
            }
            const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if(!that.setEmail.match(reg)){
                showErrAlert('请输入正确的邮箱')
                return false;
            }
            that.saveResume(1)
        },


        // 取消收藏
        cancelCollect(item){
            const that = this;
            let idArr = that.plOptArr;
            console.log(item);
            if(item && item.aid){
                idArr = [item.aid]
            }

            if(idArr.length == 0){
                showErrAlert('请选择要取消收藏的简历')
                return false;
            }
            let options = {
                btnSure: '取消收藏',
                btnColor: '#256CFA',  //确认文字按钮颜色
                btnCancelColor: '#000',  //确认文字按钮颜色
                confirmTip:'此操作不可撤销',
                title:idArr.length == 1 ? '确认取消收藏该简历？' : '确认取消收藏这'+idArr.length+'条简历？',
                isShow:true,
                popClass:'jobConfirmModel'
            }
            console.log(idArr);
            confirmPop(options,function(){
                $.ajax({
                    url: '/include/ajax.php?service=member&action=collect&temp=resume&type=del&module=job&id=' + idArr.join(','),
                    type: "POST",
                    dataType: "json",
                    success: function (data) {
                        if(data.state == 100){
                            showErrAlert('已取消收藏')
                            that.plOptArr = [];
                            that.reloadList()
                        }else{
                            showErrAlert(data.info)
                        }
                    },
                    error: function (data) { 
                        showErrAlert(data.info)
                    }
                });
            })
        },

        // 选择
        choseItem(item){
            const that = this;
            if(that.pl_manage){
                if(that.plOptArr.indexOf(item.resume.id) > -1){
                    that.plOptArr.splice(that.plOptArr.indexOf(item.resume.id) ,1)
                }else{
                    that.plOptArr.push(item.resume.id)
                }
            }
        },

        // 全选
        choseAll(){
            const that = this;
            if(that.plOptArr.length == that.resumeList.length){
                that.plOptArr = []
            }else{

                that.plOptArr = that.resumeList.map(item =>{
                    return item.resume.id
                })
                console.log(that.plOptArr.length)
            }
        },


        // 显示下载简历的弹窗
        showDownloadPop(item,ind){
            const that = this;
            that.download_tip = true;
            if(item.resume && item.resume.delivery){
                that.download_tip = false;
            }
            that.curroptItem = item;
            that.currOptIndex = ind 
            that.showSlidePop = true;
            that.showType = 'downloadResume'
        },

        // 支付/下载简历 ,有次数则用次数 没有就付钱
        topayDownload(){
            const that =  this;
            let dataParam = [];
            dataParam.push('rid=' + that.curroptItem.resume.id); //简历id
            dataParam.push('type=' + 3); //下载简历
            if(!that.companyDetail.email){
                dataParam.push('onlyBuy=1'); //只购买
            }
            let url = '/include/ajax.php?service=job&action=pay' + '&' + dataParam.join('&')
           
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    let payInfo = data.info;
                    if(data.state != 100){
                        showErrAlert(data.info); //购买失败
                    }else if(typeof(payInfo) == 'object' && payInfo.order_amount > 0){  //支付金额大于0，显示支付弹窗
                        payVue.paySuccessCall = that.downLoadSuccess();

                        service = 'job';
                        $("#amout").text(payInfo.order_amount);

                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        if (totalBalance * 1 < payInfo.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')
                            $('#balance').hide();
                        }

                        if(monBonus * 1 < payInfo.order_amount * 1  &&  bonus * 1 >= payInfo.order_amount * 1){
                            $("#bonusinfo").text('额度不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < payInfo.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                            ordernum = payInfo.ordernum;
                            order_amount = payInfo.order_amount;
                    
                            payCutDown('', payInfo.timeout, sinfo);

                    }else if(payInfo.message == '下载成功' || payInfo.message == '发送成功'){
                        that.curroptItem.resume.name = payInfo.name
                        that.curroptItem.resume.phone = payInfo.phone
                        that.downLoadSuccess();
                    }else{
                        showErrAlert(data.info)
                    }
                },
                error: function () { }
            });
        },

        // 直接下载
        directDownload(){
            var that = this;
            var id = that.curroptItem.resume.id;
            const postEmail = companyEmail ? '&postEmail=1' : ''
            $.ajax({
				url: '/include/ajax.php?service=job&action=downloadResume&id='+ id + postEmail,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        that.downLoadSuccess();
                        
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function (data) { 
                    showErrAlert(data.info)
				}
			});
        },

        // 下载成功之后的回调
        downLoadSuccess(){
            const that = this;
            // that.showSlidePop = false; //隐藏弹窗
            if(that.companyDetail.email && that.companyDetail.email_buyResume){ //设置过邮箱并自动发送的
                showErrAlert('购买成功！简历附件已自动发送邮箱','success')
            }else{
                showErrAlert('购买成功！','success')
            }
            that.resumeList[that.currOptIndex].resume.buy = 1
            that.resumeList[that.currOptIndex].resume.download = 1
            that.curroptItem.resume.buy = 1
            that.curroptItem.resume.download = 1
        },


        // 邀请面试
        showInvitePop(item){
            const that = this;
            if(item){
                that.curroptItem = item;
            }
            that.showSlidePop = true;
            that.showType = 'invitatePop'
            that.invitatePostPop = true;

            let pid = 0;
            if(that.currPage == 0 && that.curroptItem && that.curroptItem.post && that.curroptItem.post.id ){
                pid =  that.curroptItem.post.id
            }else  if(that.currPage == 2 && that.curroptItem.pid){
                pid = that.curroptItem.pid
            }
            let choseItem = that.postArr.filter(item => {
                return item.id === pid
            });

            that.delivery_pid = pid
            if(choseItem && choseItem.length){
                that.invitateForm.pid = choseItem[0].id
                that.invitateForm.post = choseItem[0];
                that.invitateForm.postName = choseItem[0].title;
                that.choseInvitePost(choseItem[0])
            }

            if(!pid){
                that.invitateForm.pid = '';
                that.invitateForm.postName = '';
                that.invitateForm.post = '';
            }
        },

    

        checkNotice(){
            const tt = this;
            tt.invitateForm['notice'] = event.target.innerText;
        },

        // 验证表单是否完成
        checkForm(tip){
            const tt = this;
            let finished = 1;
            tt.invitateForm['rid'] = tt.curroptItem ? tt.curroptItem.resume.id : ''; //当前简历id
            tt.invitateForm['phone'] = tt.companyDetail.phone; //当前联系方式
            tt.invitateForm['name'] = tt.companyDetail.people; //当前联系方式

            const arr = ['pid','rid','interview_time','phone','place']
            for( let item in tt.invitateForm){
                if(tt.invitateForm[item] === '' && arr.indexOf(item) > -1){
                    finished = 0;
                    if(tip){
                        let msg = ''
                        if(item == 'pid'){
                            msg = '请选择职位'
                        }else if(item == 'interview_time'){
                            msg = '请选择面试时间'
                        }
                        else if(item == 'place'){
                            msg = '请选择面试地点'
                        }
                        // else if(item == 'notice'){
                        //     msg = '请填写面试提醒'
                        // }
                        showErrAlert(msg)
                    }
                    break;
                }
            }
            return finished;
        },

        // 选择了已约面，提交面试信息
        sureSubmitInv(){
            const that = this;
            that.confirmMark('',1); //提交备注
            that.sendInvitation();
        },

        // 发送邀请信息
        sendInvitation(){
            const that = this;

            if(!that.checkForm(1)) return false; //验证

            // 如果地址id是0，怎需要新增
            if(that.invitateForm.place == 0){
                that.getAllAddrList('add',function(d){
                    that.sendInvitation()
                })
                return false;
            }
            const param = '/include/ajax.php?service=job&action=invitation';
            if(that.btnLoad) return false;
            that.btnLoad = true;
            let formArr = [];
            for(let item in that.invitateForm){
                formArr.push(item + '=' + that.invitateForm[item])
            }

            $.ajax({
                url: param,
                data: formArr.join('&'),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.btnLoad = false;
                    if(data.state == 100){
                        showErrAlert('已发送面试邀请','success')
                        that.invitatePostPop = false;
                        that.showSlidePop = false;

                        // 清空表单
                        for( let item in that.invitateForm){
                            that.invitateForm[item] = ''
                        }


                    }else{
                        showErrAlert(data.info)
                    }
                },
                error: function (data) {
                    that.btnLoad = false;
                    showErrAlert(data.info)
                }
            });
        },

        // 选择时间
        choseTime(type,item){
            const that = this;
            that.$nextTick(() => {
                if(that.dateChose.day && that.dateChose.hour ){
                    for(let i = 0; i < that.minArr.length; i++){
                        if(that.checkTime('',that.minArr[i].min) && (that.dateChose.min <=  that.minArr[i].min || !that.dateChose.min)){
                            that.dateChose.min = that.minArr[i].min;
                            break
                        }
                    }
                }
            })
        },

        // 选择邀请的职位
        choseInvitePost(item){
            const that = this;
            that.invitateForm.pid = item.id;
            that.invitateForm.postName = item.title;
            that.invitateForm.post = item;
            that.invitatePostChose = false;
            let addr_ind = that.jobAddrList.findIndex(addr => {
                return addr.id == item.job_addr
            })

            if(addr_ind > -1){
                that.invitateForm.place = item.job_addr;
                that.invitateForm.placeName = that.jobAddrList[addr_ind].address
            }
        },


        // // 获取面试地点
        // getAllAddr(type){
        //     const that = this;
        //     const url  = '/include/ajax.php?service=job&action=op_address';
        //     var paramStr = '';
        //     if(type == 'all'){
		// 		paramStr = '&method=all&company_addr=1'
		// 	}else if(type == 'add'){
		// 		var obj = {
		// 			id:0,
		// 			add:true,
		// 			lng:that.newAddr.lng,
		// 			lat:that.newAddr.lat,
		// 			address:that.newAddr.address,
		// 			addrid:that.newAddr.addrid ? that.newAddr.addrid[that.newAddr.addrid.length - 1] : 0
		// 		}
		// 		var paramArr = []
		// 		for(var item in obj){
		// 			paramArr.push(item + '=' + obj[item])
		// 		}
		// 		paramStr = '&method=add&' + paramArr.join('&');
		// 	}

        //     $.ajax({
		// 		url: url,
		// 		type: "POST",
        //         data:paramStr,
		// 		dataType: "json",
		// 		success: function (data) {
        //             if(data.state == 100){
        //                 if(type == 'all'){

        //                     that.companyDetail.all_addr = data.info;
        //                 }else{
		// 					for(var i = 0; i < that.companyDetail.all_addr.length; i++){
		// 						if(that.companyDetail.all_addr[i].id == 0){
		// 							that.companyDetail.all_addr[i].id = data.info;
		// 							break;
		// 						}
		// 					}
        //                 }

        //             }
		// 		},
		// 		error: function (data) { 
        //             showErrAlert(data.info)
		// 		}
		// 	});
        // },

         // 选择地址
        choseInvitateAddress(item){
            const that = this;
            if(item){

                that.invitateForm.place = item.id 
                that.invitateForm.placeName = item.address 
            }else{
                that.invitateForm.place = -1;
                that.invitateForm.placeName = that.companyDetail.address
            }
            that.invitateAddrChose = false;
        },

        // 确定选择的时间
        sureChosedDate(){
            const that = this;
            that.invitateChosed.currentDate = that.invitateChosed.currentDate ? that.invitateChosed.currentDate : new Date()
            let timeStr = parseInt(that.invitateChosed.currentDate.valueOf() / 1000)
            that.invitateForm.interview_time = timeStr;
            that.invitateDateChose = false;
        },


        // 地点相关
        confirmAddr(){
            const that = this;
            var obj = {
                id:0,
                add:true,
                lng:that.newAddr.lng,
                lat:that.newAddr.lat,
                address:that.newAddr.address,
                addrid:that.addrid ? that.addrid[that.addrid.length - 1] : 0
            }
            
            // that.invitateForm.placeName = that.newAddr.address;
            
        
            that.hideAddPosiPop();
            let objInd = that.jobAddrList.findIndex(item => {
                return item.id == 0;
            })
            if(objInd > -1){ //已经新增过
                that.jobAddrList.splice(objInd,1)
            }
            that.jobAddrList.unshift(obj)

            // 选中新地址
            that.choseInvitateAddress(obj)
        },

        //显示当前选中的地址
        showMapCurr(){
            const that = this;
            that.addWorkPosi = true
            console.log(that.newAddr);
            var mPoint = new BMap.Point(that.newAddr.lng, that.newAddr.lat);
            that.hideSearchPage()
            map.centerAndZoom(mPoint, 18);
            that.getLocation(mPoint);
        },

        // 隐藏弹窗
        hideAddPosiPop(){
            const that = this;
            that.addWorkPosi = false;
        },

         // 选择定位
        chosePosi(item,type,ind){
            const that =  this;
            that.currInd = ind;
            let point = {};
            if(!type){
                that.newAddr['id'] = 0;
                that.newAddr['address'] = item.address;
                that.newAddr['lng'] = item['lng'];
                that.newAddr['lat'] = item['lat'];
                point['lng'] = item['lng'];
                point['lat'] = item['lat'];

            }else{
                that.newAddr['id'] = 0;
                that.newAddr['address'] = item.address;
                that.newAddr['lng'] = item.point['lng'];
                that.newAddr['lat'] = item.point['lat'];
                point['lng'] = item.point['lng'];
                point['lat'] = item.point['lat'];
            }
            HN_Location.lnglatGetTown(point,function(data){
                var province = '',city = '',district = '',town  = '';
                if( data.province){
                    province = data.province.replace('省','').replace('市',''); // 省,直辖市
                }
                
                if(data.city){
                    city = data.city.replace('市',''); // 市
                }
                
                if(data.district){
                    district = data.district.replace('区','').replace(city,'');
                }
                
                if(data.town){
                    town= data.town.replace('镇','').replace('街道','');
                }

                if(province || city || district || town){
                    that.calcAddrid(province,city,district,town)
                }
            })
      
        },

        calcAddrid(myprovince,mycity,mydistrict,town){
            const that = this;
            var cityArr = [myprovince,mycity,mydistrict,town]
            if(myprovince == mycity){
                cityArr = [myprovince,mydistrict,town]
            }
            that.addridArr = [];
            that.addrname = [];
            that.checkCityid(cityArr,0);
        },

        // 获取城市id
        checkCityid(strArr,type){
            const that = this;
            var id = 0;
            switch(type){
                case 0 : 
                    id = 0;
                    break;
                case 1 : 
                    id = pid;
                    break;
                case 2 : 
                    id = cid;
                    break;
                case 3 : 
                    id = did;
                    break;
            }
            var typeStr = '&type='+id;

            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
                type: "POST",
                dataType: "jsonp",
                success: function(data){
                    if(data && data.state == 100){
                        var city = data.info;
                        for(var i=0; i<city.length; i++){
                            if(city[i].typename == strArr[type] || (city[i].typename == strArr[type] + '区') ||  (city[i].typename == strArr[type] + '省') ||  (city[i].typename == strArr[type] + '市') ||  (city[i].typename == strArr[type] + '镇') ){
                                switch(type){
                                    case 0 : 
                                        pid = city[i].id;
                                        break;
                                    case 1 : 
                                        cid = city[i].id;
                                        break;
                                    case 2 : 
                                        did = city[i].id;
                                        break;
                                    case 3 : 
                                        tid = city[i].id;
                                        break;
                                }
                                type++;
                                that.addridArr.push(city[i].id)
                                that.addrname.push(city[i].typename)
                                if(type < (strArr.length - 1)){
                                    that.checkCityid(strArr,type)
                                }else{
                                    that.newAddr['addrid'] = that.addridArr;
                                    
                                    
                                }
                            }
                        }
                    }else{
                        if(that.addridArr && that.addridArr.length){
                            that.newAddr['addrid'] = that.addridArr;
                        }
                    }
                }

            })

        },

         // 获取地址/	// 提交新增地址的请求
		getAllAddrList(type,mCallback){
			var that = this;
			var paramStr = ''
			if(type == 'all'){
				paramStr = '&method=all&company_addr=1'
			}else if(type == 'add'){
				var obj = {
					id:0,
					add:true,
					lng:that.newAddr.lng,
					lat:that.newAddr.lat,
					address:that.newAddr.address,
					addrid:that.newAddr.addrid ? that.newAddr.addrid[that.newAddr.addrid.length - 1] : 0
				}
				var paramArr = []
				for(var item in obj){
					paramArr.push(item + '=' + obj[item])
				}
				paramStr = '&method=add&' + paramArr.join('&');
			}
			$.ajax({
				url: '/include/ajax.php?service=job&action=op_address' + paramStr ,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						if(type == 'all'){
							that.jobAddrList = data.info;
							if(that.jobAddrList.lnegth && that.jobAddrList.length == 1 && that.jobAddrList[0].addrid){
								that.invitateForm.place = that.jobAddrList[0].id; //此处属于初始化
								that.invitateForm.placeName = that.jobAddrList[0].title; //此处属于初始化
                                that.$nextTick(() => {
                                    that.changeForm = false;
                                })
							}
						}else{
							// 新增地址
							that.invitateForm.place = data.info;
							for(var i = 0; i < that.jobAddrList.length; i++){
								if(that.jobAddrList[i].id == 0){
									that.jobAddrList[i].id = data.info;
									break;
								}
							}

                            if(mCallback){
                                mCallback(data.info)
                            }

						}

					}else{
                        showErrAlert(data.info)
					}
				},
				error: function () { 

				}
			});
		},

        // 地图汇总
        drawMap(data) {
            var tt = this;
            var lnglat = '';
            if (data) {
                lnglat = [data.lng, data.lat]
            }
            if (site_map == 'baidu') {
                tt.draw_baidu(lnglat)
            } else if (site_map == 'google') {
                tt.draw_google(lnglat)
            } else if (site_map == 'amap') {

                tt.draw_Amap(lnglat)
            }

        },

        // 百度地图
        draw_baidu(lnglat) {
            var that = this;
            map = new BMap.Map("mapdiv");
            if (that.city != city && !lnglat) {
                map.centerAndZoom(that.city, 18);
                setTimeout(function () {
                    lnglat = map.getCenter();
                    that.lng = lnglat.lng;
                    that.lat = lnglat.lat;
                    var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);

                    console.log(mPoint)
                    that.getLocation(mPoint);
                }, 500)
            } else {
                var mPoint = new BMap.Point(lnglat[0], lnglat[1]);
                map.centerAndZoom(mPoint, 18);
                that.getLocation(mPoint);
            }
            $('.mapCenter').addClass('animateOn');
            setTimeout(function () {
                $('.mapCenter').removeClass('animateOn');
            }, 600)
            map.addEventListener("dragend", function (e) {
                $('.mapCenter').addClass('animateOn');
                setTimeout(function () {
                    $('.mapCenter').removeClass('animateOn');
                }, 600)
                that.lng = e.point.lng
                that.lat = e.point.lat
                that.getLocation(e.point);
            });
            $(".loadImg").hide()
        },

        // 百度获取周边
        getLocation(point) {
            var that = this;
            that.loadEnd = false;
            if (site_map == 'baidu') {
                var myGeo = new BMap.Geocoder();
                myGeo.getLocation(point, function mCallback(rs) {
                    var allPois = rs.surroundingPois;
                
                    that.surroundingPois = [...rs.surroundingPois];
                    that.loadEnd = true;
                    var reg1 = rs.addressComponents.city;
                    var reg2 = rs.addressComponents.district;
                    var reg3 = rs.addressComponents.province;
                    if(that.currInd == 0){

                        that.newAddr['id'] = 0;
                        that.newAddr['address'] = that.surroundingPois[0].address;
                        that.newAddr['lng'] = that.surroundingPois[0]['lng'];
                        that.newAddr['lat'] = that.surroundingPois[0]['lat'];
                    }

                }, {
                    poiRadius: 5000, //半径一公里
                    numPois: 50
                });

            } //百度地图


        },

        searchKey(){
            const that = this;
            const el = event.currentTarget;
            const directory = $(el).val();
            console.log(directory);
            that.getList(directory)
        },

        showSearchPage(){
            const that = this;
            that.showSearch = true;
        },

        hideSearchPage(){
            const that = this;
            var el = event.currentTarget;
            if(!$(el).val()){
                that.showSearch = false; 
            }

        },

        // 搜索列表
        getList(directory) {
            var tt = this;
            if (ajaxIng) {
                ajaxIng.abort();
            }
            directory = directory.replace(/\s*/g, "");
            console.log(tt.isloadAddr);
            if (tt.isloadAddr) return false;
            tt.isloadAddr = true;
            tt.loading = true;

            console.log(directory)
            ajaxIng = $.ajax({
                // url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+page+'&lng='+tt.lng+'&lat='+tt.lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
                url: '/include/ajax.php?action=getMapSuggestion&cityid=' + tt.cityid + '&lat=' + tt.lat + '&lng=' + tt.lng + '&query=' + directory + '&region=' + tt.city + '&service=siteConfig',
                dataType: 'json',
                success: function (data) {
                    tt.isloadAddr = false;
                    tt.loading = false;
                    if (data.state == 100) {
                        tt.loadEnd = true;
                        // totalCount = data.info.totalCount;
                        // pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
                        var list = data.info;
                        tt.searchList = list;

                    } else {
                        tt.loading = false;
                        tt.loadEnd = true;
                        tt.isloadAddr = false;
                        tt.searchList = [];
                    }
                },
                error: function () {
                    tt.isloadAddr = false;
                    tt.loading = false;
                    //showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
                }
            });
        },

        // 修改面试时间  确定
        changeTime(){
            const that = this;
            that.dateChose.day = that.dateChose.day ? that.dateChose.day : new Date().getDate();
            that.dateChose.hour = that.dateChose.hour ? that.dateChose.hour : new Date().getHours();
            that.dateChose.min = that.dateChose.min ? that.dateChose.min : (parseInt(new Date().getMinutes() / 10) + 1) * 10;

            let currDateChose= (new Date(new Date(that.dateChose.day * 1000).setHours(that.dateChose.hour,that.dateChose.min)));
            that.invitateForm.interview_time = parseInt(currDateChose.valueOf() / 1000)
            that.invitateDateChose = false;



            // paramStr = '&action=updateInterView&date=' + parseInt(currDateChose.valueOf() / 1000)
            // $.ajax({
			// 	url: '/include/ajax.php?service=job&id='+id + paramStr,
			// 	type: "POST",
			// 	dataType: "json",
			// 	success: function (data) {
			// 		if(data.state == 100){
            //             showErrAlert('设置成功','success');
            //             that.showSlidePop = false;
            //             that.reloadList()
            //         }else{
            //             showErrAlert(data.info)
            //         }
			// 	},
			// 	error: function () { 
            //         tt.isload = false;
			// 	}
			// });
        },

        // 获取接下来两个月的日期数据
        getNextDate(num){
            const that = this;
            // let days = month
            const curr = new Date();
            const today = new Date(new Date().setHours(0, 0, 0, 0)); //0点
            const today_str = parseInt(today.valueOf() / 1000);
            const hh = curr.getHours();  //小时
            const mm = curr.getMinutes(); //分钟
            let dateArr = [];
            for(let i = 0; i < num * 30; i++){
                dateArr.push({
                    dateStr:today_str + 86400 * i,
                })
            }
            that.dateArr = dateArr;

            let hourArr = []
            for(var i = 6; i <= 21; i++){
                hourArr.push({
                    hour:i,
                    hourText: i > 12 ? '下午' + (i - 12) + '点' : '上午' + i + '点'
                })
            }
            that.hourArr = hourArr;


            let minArr = []
            for(var i = 0; i < 60; i=i+ 10){
                minArr.push({
                    min:i,
                    minText: (i < 10 ? '0' + i :  i) + '分'
                })
            }
            that.minArr = minArr;
        },


        // 验证是否为当前时间
        checkTime(hour,min){
            const that = this;
            let now = new Date();
            let mm = now.getMinutes()
            let hh = now.getHours()
            let returnValue = false;
            if(new Date(that.dateChose.day * 1000).toDateString() === now.toDateString()){
                if(hour && hour >= hh){
                    if(mm <= 50 || hour != hh){
                        returnValue = true
                    }
                }
                if(min || min === 0){
                    if(that.dateChose.hour == hh ){
                        if(min >= mm){
                            returnValue = true
                        }
                    }else{
                        returnValue = true
                    }
                    
                }
            }else{
                returnValue = true
            }

            return returnValue
        },

        toLink(){
            const that = this;

        
        },

        // // 回绝
        // refuseDelivery(){
        //     const that = this;
        // },

         // 拒绝
        refuseResume(){
            var tt = this;
            tt.changeResumeState(tt.curroptItem,2)
        },

        // 更改状态
        changeResumeState(item,state){ //state是要更改的状态,type是区分remark和state
            var tt = this;
            var idArr = [];
            if(item){
                idArr.push(item.id);
            }else{
                tt.optbultArr.forEach(function(val){
                    idArr.push(val.id)
                })
                state = 1;
            }
            var paramStr = '';
            if(state == 2){
                paramStr = '&refuse_msg=' + tt.markSelect;
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateDelivery&id='+idArr.join(',')+'&state='+state + paramStr,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
                        showErrAlert(data.info)
                        setTimeout(() => {
                            tt.reloadList(); //重新加载
                        })
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function () { 
					
				}
			});
        },


        // 失去焦点
        loseFocus(){
            const that = this;
            console.log(that.keywords)
            setTimeout(() => {
                console.log(that.keywords) 
            }, 1500);
            that.$nextTick(() => {
                if(!that.keywords){
                    that.keywords = that.keySave;
                }
            })
        }
    },

    watch:{
        // 页面数据切换 ，投递/收藏/下载
        currPage:{
            handler:function(){
                const that = this;
                that.reloadList()
                that.$nextTick(() => {
                    setTimeout(function(){
                        that.fixedTop = $(".fixedTop").height()
                    },150)
                })
        },immediate:true},

        // 状态切换
        currTab:function(){
            const that = this;
            that.reloadList()
        },

        // 职位切换
        postSelect:function(){
            const that = this;
            that.showSlidePop = false;
            that.reloadList()
        },

        // 沟通状态
        resumeState:function(){
            const that = this;
            that.showSlidePop = false;
            that.reloadList()
        },

        // 过滤不合适
        noFit(val){
            const that = this;
            that.setBtns[3].set = val;
            that.reloadList(1)
        },

        // 加载数据中...
        loading(val){
            if(val){
                $('html').addClass('noscroll')
            }else{
                $('html').removeClass('noscroll')
            }
        },

        curroptItem(){
            const that = this;
           
            that.refuseForm['remark_type'] = that.curroptItem.remark ? that.curroptItem.remark.remark_type:'';
            that.refuseForm['remark'] = that.curroptItem.remark ? that.curroptItem.remark.remark:'';
            that.refuseForm['id'] = that.curroptItem.id;
        },

        'refuseForm.remark_type':function(val){
            this.refuseForm.remark = '';
            if(val == 5 && this.curroptItem.delivery ){
                this.refuseForm.remark = this.refuseArr[0]
            }
        },

        // 显示地图弹窗
        addWorkPosi:function(val){
            const that = this;
            if((!that.lng || !that.lat) && val){
                HN_Location.init(function (data) {
                    if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
                        console.log('定位失败，请刷新页面');
                        that.drawMap()
                    } else {
                        var name = data.name == '' ? data.address : data.name;
                        that.lng = data.lng;
                        that.lat = data.lat;
                        // that.city = data.city;
                        posiCity = data.city;
                        if (that.city == '') {
                            that.city = posiCity;
                        }
                        that.addrArr = data.city + ' ' + data.district

                        // 生成地图
                        that.drawMap(data)
                    }
                });
            }
            
        },

        // 取消搜索时 应重新加载数据
        searchShow:function(val){
            const that = this;
            if(!val){
                that.keywords = '';
                if(that.keySave){
                    that.reloadList()
                }
            }else{
                that.$nextTick(() => {
                    that.$refs.searchInp.focus()
                })
            }
        },

        showSlidePop(val){
            const that = this;
            if(val){
                $('html').addClass('noscroll');

                that.$nextTick(() => {
                    console.log(that.curroptItem);
    
                    if(that.showType == 'markPop' && that.curroptItem && that.curroptItem.resume && !that.curroptItem.resume.invitation){
                        let pid = 0;
                        if(that.currPage == 0 && that.curroptItem && that.curroptItem.post && that.curroptItem.post.id ){
                            pid =  that.curroptItem.post.id
                        }else  if(that.currPage == 2 && that.curroptItem.pid){
                            pid = that.curroptItem.pid
                        }
                        let choseItem = that.postArr.filter(item => {
                            return item.id === pid
                        });
                        
                        that.delivery_pid = pid
                        if(choseItem && choseItem.length){
                            that.invitateForm.pid = choseItem[0].id
                            that.invitateForm.post = choseItem[0];
                            that.invitateForm.postName = choseItem[0].title;
                            that.invitateForm.place = choseItem[0].job_addr ? choseItem[0].job_addr : '';
                            
                            that.choseInvitePost(choseItem[0]);
                        }
        
                        if(!pid){
                            that.invitateForm.pid = '';
                            that.invitateForm.postName = '';
                            that.invitateForm.post = '';
                            that.invitateForm.place = '';
                        }
                    }
                })

            }else{
                $('html').removeClass('noscroll')
            }
        },

        'invitateForm.pid':function(val){
            console.log(val);
        }
    }
})