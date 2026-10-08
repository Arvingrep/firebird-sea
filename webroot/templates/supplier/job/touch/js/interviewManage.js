var swiper;
var pageVue = new Vue({
    el:'#page',
    data:{
        showSlidePop:false,  //弹窗显示
        showType:'ruzhi' , //弹窗显示类型  postSelect => 职位选择  marked => 添加标注  calendar => 日历 ruzhi => 入职
        editItem:'', //当前标注的对象
        postArr:[], //发不过的职位
        postSelect:'', //职位选择
        keywords:'', //搜索关键字
        currTab:0,
        cancelFilter:'',//已取消
    
        tabsArr:[{
            id:1,
            text:'待面试',
            count:0,
            value:'1',
            list:[],
            isload:false,
            loadEnd:false,
            page:1,
        },{
            id:2,
            text:'沟通offer',
            count:0,
            value:'3',
            list:[],
            isload:false,
            loadEnd:false,
            page:1,
        },{
            id:3,
            text:'待入职',
            count:0,
            value:'4',
            list:[],
            isload:false,
            loadEnd:false,
            page:1,
        },],
        stateArr:[{  //入职状态
            label:'待入职',
            value:0
        },{
            label:'已入职',
            value:1
        },{
            label:'取消入职',
            value:2
        },],
        ruzhiForm:{
            rz_state:'',
            rz_date:'',
        },
        page:1,
        isload:false, //加载中
        loadEnd:false,//加载结束
        loading:false, //tab切换的lodaing
        interviewList:[], //数据
        solveDate:[], //处理过的二维数组
        dateArr:[], //日期数组
        rz_num:0,//已入职
        rz_num_1:0,//待入职
        cancelInterview:0,//已取消面试的

        filterDate:false, //是否正在过滤数据
        // 历史数据加载
        hisload:false,
        hloadEnd:false,
        hpage:1,
        interview_history:[],

        // 头部显示
        currInd:0,
        currDate:'',

        markArr:[{
            labText:'已录取，待入职',
            label:'待入职',
            value:4
        },{
            labText:'沟通offer',
            label:'沟通offer',
            value:3
        },{
            labText:'已面试，不合适',
            label:'不合适',
            value:5
        },{
            labText:'面试取消',
            label:'已取消',
            value:6
        }],

        remarkForm:{ //标注数据
            markState:4, //面试状态
            joinDate:'', //入职时间
            markText:'', //标注
            rz_date:'',
        },

        minDate:new Date(),
        dateType:1, //1是选择入职时间， 2是面试筛选
        datePop:false, //时间选择器
        dateChose:'',  
        choseDate:{
            month:new Date().getMonth() + 1,
            year:new Date().getFullYear(),
        },
        monthChose: new Date().getMonth() + 1, //当前选择的月份
        yearChose:new Date().getFullYear(), //当前选择的年份
        weeks:['日','一','二','三','四','五','六'],
        calendar_interview:[], //面试日历
        weekDays:[], //按周将月分割
        searchShow:false, //搜索框显示
        miniprogram:true, //是否在小程序中

        toInterview:0,

        focusIn:false, //是否聚焦
    },
    
    mounted(){
        const that = this;
        
        if(navigator.userAgent.toLowerCase().match(/micromessenger/)){ //判断是否在小程序中
            that.miniprogram = true
            that.searchShow = true
        }

        that.getPostList(); //获取职位
        that.getInterviewList(); 

        $(window).scroll(function(){
            const scrollTop = $(window).scrollTop() + $('.dateChange').height() + $('.fixedTop').height();
            for(let i = 0; i < $('.list_ul dl').length; i++){
                const curr =  $('.list_ul dl').eq(i);
                if(curr.attr('data-top') >= scrollTop || (curr.attr('data-top')  + curr.height()) >= scrollTop){
                    if(that.currInd !== i || !that.currDate){
                        that.currDate = $('.list_ul dl').eq(i-1).attr('data-time') 
                    }
                    break;
                }
            }
        })

        swiper = new Swiper(".swiper-container", {
            autoHeight:true,
            on:{
                slideChange: function(){
                    that.currTab = this.activeIndex
                },
            },
        });
        
    },
    computed:{
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
    },
    methods:{
        
         // 搜索
        toSearch(){
            const that = this;
            that.page =1;
            that.initData();
        },
        // 获取职位筛选的职位分类
        getPostList(){
            const that = this;

            $.ajax({
				url: '/include/ajax.php?service=job&action=postList&page=1&state=1&off=0&pageSize=10000&com=1',
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

        // 获取面试日程
        getInterviewList(){
            var that = this;
            if(that.tabsArr[that.currTab].isload) return false;
            that.tabsArr[that.currTab].isload = true;


            var paramStr = ''
            var state = that.tabsArr[that.currTab].value;
            paramStr = paramStr + '&state=' + state;

            if(that.cancelFilter){
                paramStr = paramStr + '&cancel=1'
            }
            if(that.postSelect){
                paramStr = paramStr + '&pid='+that.postSelect  //职位id
            }

            if(that.dateChose){
                paramStr = paramStr + '&date=' + that.dateChose;
            }

            $.ajax({
				url: '/include/ajax.php?service=job&action=interviewList&page='+that.page+'&pageSize=20&keyword='+that.keywords + paramStr,
				type: "POST",
				dataType: "json",
				success: function (data) {
					that.tabsArr[that.currTab].isload = false;
					if(data.state == 100){
                        if(that.page === 1){
                            if(that.currTab == 0){
                                that.interviewList = []; //存放面试日程 => 待面试
                                that.calendar_interview = data.info.pageInfo && data.info.pageInfo.calendar ? data.info.pageInfo.calendar : {};  //面试日历

                            }
                            that.tabsArr[that.currTab]['list'] = [];
                        }

                        that.tabsArr[that.currTab].page = that.tabsArr[that.currTab].page + 1;
                        if(that.currTab === 0){
                            that.interviewList = that.interviewList.concat(data.info.list);
                        }
                        that.tabsArr[that.currTab]['list'] = that.tabsArr[that.currTab]['list'].concat(data.info.list);
                        for(var i = 0; i < that.tabsArr.length; i++){
                            that.tabsArr[i].count =  data.info.pageInfo['state' + that.tabsArr[i].value]
                        }
                        that.cancelInterview = data.info.pageInfo.state2; //已取消面试的 
                        that.toInterview = data.info.pageInfo.state1; //待面试的 
                        that.rz_num = data.info.pageInfo.state4_0; //已入职
                        that.rz_num_1 = data.info.pageInfo.state4_1; //待入职

                        
                        if(that.tabsArr[that.currTab].page > data.info.pageInfo.totalPage){
                            that.tabsArr[that.currTab].isload = true;
                            that.tabsArr[that.currTab].loadEnd = true
                            if(state === 1 || state === '1'){
                                that.loadEnd = true;
                            }
                        }

                        that.$nextTick(() => {
                            swiper.updateAutoHeight(10);
                        })
                        
					}else{
                        that.tabsArr[that.currTab].isload = true;
                        that.tabsArr[that.currTab].loadEnd = true;
                        if(that.tabsArr[that.currTab].page == 1){
                            if(that.currTab === 0){
                                that.loadEnd = true;
                                that.interviewList = []
                            }
                            that.tabsArr[that.currTab]['list'] = [];
                        }
                        that.$nextTick(() => {
                            swiper.updateAutoHeight(10);
                        })
                    }
				},
				error: function () { 
                    that.tabsArr[that.currTab].isload = false;
                    that.tabsArr[that.currTab].loadEnd = true;
				}
			});
        },

        // 获取历史面试日程
        getHistory(){
            const that = this;
            if(that.hisload) return false;
            that.hisload = true;
            $.ajax({
				url: '/include/ajax.php?service=job&action=interviewList&page='+that.hpage+'&pageSize=20&state=-1&keyword='+that.keywords,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    that.hisload = false;
                    if(data.state == 100){
                        if(that.hpage == 1){
                            that.interview_history = [];
                        }
                        that.interview_history = that.interview_history.concat(data.info.list);
                        that.hpage++;
                        if(that.hpage > data.info.pageInfo.totalpage){
                            that.hisload = true;
                            that.hloadEnd = true;

                        }
                    }else{
                        that.hisload = false;
                        if(that.hpage == 1){
                            that.interview_history = []
                        }
                    }
                }
            })
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
                const year_now = new Date().getFullYear();
                let str = year + '/' + month + '/' + day + ' ' + hour + ':' + minute 
                if(year_now == year){
                    str = month + '/' + day + ' ' + hour + ':' + minute 
                }
                return str;
            } else if(n == 7){
                return (year + '/' + month + '/' +  day );
            }else {
                return 0;
            }
        },
        // 时间转换
        timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
            var year_str = '<span>'+year+'</span>'
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
            month = month > 9 ? month : '0' + month
            var month_str = '<span>'+month+'</span>'
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
            dates = dates > 9 ? dates : '0' + dates
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
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}else if(tomorrow.toDateString()=== date.toDateString()){
                datestr = '明天'
            }else if(year != now.getFullYear()){
                datestr = year_str + '年' + datestr
            }
            const str =  hour > 12 ? '下午' : '上午';
            hour = hour > 12  ? hour - 12 : hour
			datestr = datestr + '('+ weekDay[day] + ')'+ ' ' + str  + '<span>'+  hour +  ':' + minute +'</span>';

			return datestr;
		},

        // 验证是否为同一天
        checkDate(d1,d2){
            const that = this;
            d1 = that.transTimes(d1,2);
            d2 = that.transTimes(d2,2);
            return d1 == d2;
        },

        // 验证是否是今天
        checkToday:function(date){
            const that = this;
            const today_str = parseInt(new Date().valueOf() /1000)
            const today = that.transTimes(today_str,7)
            return date == today
        },

        initData(){
            const that = this;
            that.tabsArr[that.currTab]['page'] = 1;
            that.tabsArr[that.currTab]['isload'] = false;
            that.tabsArr[that.currTab]['loadEnd'] = false;
            if(that.currTab == 0){
                that.isload = false;
                that.loadEnd = false;
                that.page = 1;
            }
            that.getInterviewList()
        },

        callPhone(item){
            location.href = 'tel:' + item.resume.phone
        },

        // 验证入职时间
        checkRzDate(date){
            const now = parseInt(new Date().valueOf() / 1000)
            return date > now;
        },

        checkScrollTop(){
            const that = this;
            $('.list_ul dl').each(function(){
                // console.log($(this).offset().top,$(window).scrollTop())
                $(this).attr('data-top',$(this).offset().top)
            })
        },

        // 确定选择的时间
        sureDate(value){
            const that = this;
            const timeStr =  parseInt(value.valueOf() / 1000);
            if(that.dateType == 1){
                that.remarkForm.joinDate = timeStr;
            }else{
                // that.dateChose = that.transTimes(timeStr,2);
                // that.initData(); //筛选数据
                that.ruzhiForm.rz_date = timeStr
            }
            that.hideDatePop()
        },

        // 隐藏时间弹窗
        hideDatePop(){
            const that = this;
            that.datePop = false;
        },

        // 更新备注
        updateRemark(ruzhi){
            const that = this;
            let paramStr = '';
            paramStr = '&action=updateInterView&refuse_author=company&remark=' + that.remarkForm.markText + '&state=' + that.remarkForm.markState
            if(that.remarkForm.markState == 6 ){ //取消面试

            }else if(that.remarkForm.markState == 3){ //沟通
                // paramStr = paramStr + '&remark=' + that.remarkForm.markText + '&state=' + that.remarkForm.markState
            }else if(that.remarkForm.markState == 4){  //待入职
                paramStr = paramStr + '&rz_date=' + that.remarkForm.joinDate
            }else{
                paramStr = paramStr + '&refuse_msg=' + that.remarkForm.markText;
            }
           
            if(ruzhi){
                paramStr = '&action=updateBoarding&rz_state=' + that.ruzhiForm.rz_state + '&rz_date=' + that.ruzhiForm.rz_date
            }

            
            $.ajax({
				url: '/include/ajax.php?service=job&id='+that.editItem.id + paramStr,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        showErrAlert(data.info);
                        that.showSlidePop = false;
                        that.initData()
                    }else{
                        showErrAlert(data.info)
                    }
                },
                error:function(data){
                    showErrAlert('网络错误，请稍后再试')
                }
            })
        },

        // 获取月份的天数
        mGetDate(date){
            //构造当前日期对象
            var date = date;
            //获取年份
            var year = date.getFullYear();
            //获取当前月份
            var month = date.getMonth() + 1;
            var d = new Date(year, month, 0);
            return d.getDate();
        },

        // 更改月份  0表示上一个月， 1表示下个月
        changeMonth(type){
            const that = this;
            let year = that.yearChose;
            let month = that.monthChose;
            if(type){
                month = month + 1;
                year = month == 13 ? year + 1 : year;
                month = month == 13 ? 1 : month;
            }else{
                month = month - 1;
                year = month == 0 ? year - 1 : year;
                month = month == 0 ? 12 : month;
            }
            that.yearChose = year
            that.monthChose = month;
            that.getWeekDate(year,month)
        },

        // 获取接下来月份
        getNextDate(num){
            const that = this;
            let nextMonth = num ? num : 3; //获取接下来几个月的数据
            let year = that.yearChose;
            let month = that.monthChose;
            for(let i = 0; i < nextMonth; i++){
                let mm = month + i;
                let yy = mm > 12 ? year + 1 : year;
                mm = mm > 12 ? 1 : mm;
                that.weekDays.push({
                    year:yy,
                    month:mm,
                    weekday:that.getWeekDate(yy,mm)
                })
            }
        },

        // 获取日历数据
        getWeekDate(year,month){
            const that = this;
            const firstDay = new Date(year , month - 1);  //第一天
            console.log(firstDay)
            const monthDay = that.mGetDate(firstDay); //当月天数
        
            let monthDayArr = []; //日期
            const month_interview = that.calendar_interview[year + '-' + (month > 9 ? month : '0' + month)]
            const firstDay_day = firstDay.getDay(); //第一天是周几
            for(var i = 1; i <= monthDay; i++){
                const num = month_interview ? (month_interview[i] ? month_interview[i] : 0) : 0
                monthDayArr.push({
                    date:i,
                    num:num,
                    dateStr:parseInt(new Date(year + '/' + month + '/' + i).valueOf() / 1000 )
                })
            }
            if(firstDay_day){ //补全空白
                for(let i = 0; i < firstDay_day; i++){
                    monthDayArr.unshift({
                        date:0,
                        num:0
                    })
                }
            }

            let liArr = []; //按7天分组
            for(var i = 0; i < monthDayArr.length; i++){
                liArr.push(monthDayArr.slice(i, i + 7));
                i += 6;
            }

            // 判断是否有圆角
            liArr.forEach((item,ind) => {
                let borderLeft = false;
                let borderRight = false;
                for(let i = 0; i < item.length; i++){
                    if(!borderLeft && item[i].num){
                        borderLeft = true;
                        borderRight = false;
                        liArr[ind][i]['bleft'] = true;
                    }
                    

                    if(borderLeft && !borderRight && ((i == item.length - 1) || !item[i + 1].num )){
                        borderRight = true;
                        borderLeft = false;
                        liArr[ind][i]['bright'] = true;
                    }
                }
            })



            // that.weekDays = liArr;
            return liArr

        },

        // 
        choseShaiDate(d){
            const that = this
            if(d.num == 0){
                showErrAlert('当日没有面试安排');
                return false;
            }
            that.dateChose = that.transTimes(d.dateStr,2)
            that.showSlidePop = false;
            that.initData()
        },


        // 输入框聚焦
        inputFocus(){
            // const that = this;
            // that.$refs.textarea.focus()
            var target = event.currentTarget;
            setTimeout(function() {
                target.scrollIntoView(true);
            }, 100);
        }
    },
    watch:{
        interviewList:function(interview){
            const that = this;
            let arr = {};
            that.dateArr = [];
            if(interview && interview.length){

                that.currDate = interview[0].date; //设置默认时间 ，
            }else{
                that.currDate = ''
            }
            for(let i = 0; i < interview.length; i++){
                const date = that.transTimes(interview[i].date,7);
                if(that.dateArr.indexOf(date) <= -1){
                    that.dateArr.push(date)
                }
                if(!arr[date]){
                    arr[date] = []
                }
                arr[date].push(interview[i])
            }
            that.solveDate = arr;
            console.log(arr)
            that.$nextTick(() => {
                that.checkScrollTop()
            })
        },

        loadEnd(val){
            const that = this;
            if(val && !that.filterDate && that.interview_history.length == 0){
                that.getHistory()
            }
        },

        // 职位改变
        postSelect(val){
            const that = this;
            that.showSlidePop = false;
            that.initData();
        },

        //当前选择的
        currTab(val){
            const that = this;
            // if(val == 0){
            //     that.loadEnd = false;
            // }
            // that.initData()
            if(that.tabsArr[val].list.length == 0){
                that.initData()
            }
            swiper.slideTo(val)
        },

        // 标注的对象
        editItem(val){
            const that = this;
            that.remarkForm.markState = that.editItem.state;
            that.remarkForm.markText = that.editItem.remark.remark_invitation;
            that.remarkForm.joinDate = that.editItem.rz_date 
            that.ruzhiForm.rz_state= that.editItem.rz_state
            that.ruzhiForm.rz_date= that.editItem.rz_date
            
        },

        // 面试日程
        calendar_interview(){
            const that = this;
            that.getNextDate(3)
            // that.getWeekDate();

        },

        showSlidePop(val){
            if(val){
                $('html').addClass('noscrll')
            }else{
                $('html').removeClass('noscrll')
            }
        },

        focusIn(val){
            const that = this;
            that.$nextTick(() => {
                if(val){
                    $('html').removeClass('noscrll')
                    console.log(1);
                }else if(that.showSlidePop){
                    $('html').addClass('noscrll')
                    console.log(2);
                }
            })
        },

        showType(val){
            const that = this;
            let scroll = false;
            if(val == 'calendar'){
                that.$nextTick(() => {
                    if($('.allDates .today').length){

                        $('.allDates .dateBox').each(function(){
                            $(this).attr('data-top',$(this).position().top);
                        })
                        $('.allDates').scrollTop($('.allDates .dateBox .today').position().top -$('.allDates .dateBox .today').closest('.week').height())
                        
    
                        $('.allDates').scroll(function(){
                            let scrollTop =  $('.allDates').scrollTop();
                            $('.allDates .dateBox').each(function(ind){
                                let top = $(this).attr('data-top') * 1, hh = $(this).height()
                                if(scrollTop >= top &&  scrollTop < (top + hh)){
                                    
                                    that.choseDate.month = $(this).attr('data-month')
                                    that.choseDate.year = $(this).attr('data-year')
                                }
                            })
                        })
                    }
                })
            }
        }
    }
})