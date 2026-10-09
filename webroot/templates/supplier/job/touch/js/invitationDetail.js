var pageVue = new Vue({
    el:'#page',
    data:{
        invitationDetail:{
            state:1,
            stating:0,
        },

        // 60天
        dateArr:[],
        hourArr:[],
        minArr:[],
        dateChose:{
            day:'',
            hour:'',
            min:'',
        },

        showSlidePop:false,
        showType:'showMark',//changeTime => 更改时间  postSelect => 职位选择  marked => 添加标注  calendar => 日历 ruzhi => 入职
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
        ruzhiForm:{  //入职传的数据
            rz_state:'',
            rz_date:'',
        },
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

        datePop:false, //日期选择
        dateType:1, //入职时间弹窗
        minDate:new Date(),
        remark_msg:'', //备注 => 面试
        remark_resume:'', //备注 => 简历
        pageFrom:type,
    },
    mounted(){
        const that = this;

        that.getNextDate(2);
        if(id){
            that.getDetail()
        }

    },
    methods:{


        // 时间转换
        timeStrToDate(timeStr,type){
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


        timeStrDate(timestamp,n){

            const dateFormatter = this.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
            
            if (n == 1) {
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
            } else if (n == 2) {
                return (year + '-' + month + '-' + day);
            } else if (n == 3) {
                return (month + '-' + day);
            }  else if (n ==4) {
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute);
            }else {
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

        // 获取详情
        getDetail(){
            const that = this;

            $.ajax({
                url: '/include/ajax.php?service=job&action=interviewDetail&id=' + id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){

                        that.invitationDetail = data.info;

                        if(data.info.state == 1 && data.info.stating){
                            let hour = new Date(data.info.date * 1000).getHours();
                            let min = new Date(data.info.date * 1000).getMinutes();
                            let date = parseInt(new Date(data.info.date * 1000).setHours(0,0,0).valueOf() / 1000);
                            that.dateChose['hour'] = hour;
                            that.dateChose['min'] = min;
                            that.dateChose['day'] = date;
                            
                        }
                        that.remarkForm.markState = data.info.state;
                        that.remarkForm.markText = data.info.remark.remark_invitation;
                        that.remarkForm.joinDate = data.info.rz_date 
                        that.ruzhiForm.rz_state= data.info.rz_state
                        that.ruzhiForm.rz_date= data.info.rz_date


                    }
                },
                error: function () { }
            });
        },

        // 修改面试时间
        changeTime(){
            const that = this;

            let currDateChose= (new Date(new Date(that.dateChose.day * 1000).setHours(that.dateChose.hour,that.dateChose.min)))
            paramStr = '&action=updateInterView&date=' + parseInt(currDateChose.valueOf() / 1000)
            $.ajax({
				url: '/include/ajax.php?service=job&id='+id + paramStr,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
                        showErrAlert('设置成功','success');
                        that.showSlidePop = false;
                        that.getDetail(); //更新一下
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function () { 
                    tt.isload = false;
				}
			});
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

        // 确定选择时间
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

        // 更新备注
        updateRemark(ruzhi){
            const that = this;
            let paramStr = '';
            paramStr = '&action=updateInterView&remark=' + that.remarkForm.markText + '&state=' + that.remarkForm.markState
            if(that.remarkForm.markState == 2 ){ //取消面试

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
				url: '/include/ajax.php?service=job&id='+id + paramStr,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        showErrAlert(data.info);
                        that.showSlidePop = false;
                        that.getDetail()
                    }
                },
                error:function(data){
                    showErrAlert('网络错误，请稍后再试')
                }
            })
        },

        

        // 更新以前的备注
        updateOldRemark(){
            const that = this;
            let remark_resume = that.invitationDetail.remark ? that.invitationDetail.remark.remark_resume : ''; //简历备注
            let remark_invitation = that.invitationDetail.remark ? that.invitationDetail.remark.remark_invitation : ''; //简历备注
            let tip = 1;
            if(remark_resume != that.remark_resume){
                console.log("简历备注");
                that.updateRemarkMsg(1,tip);
                tip = 0;
            }
            if(remark_invitation != that.remark_msg){
                console.log("面试备注");
                that.updateRemarkMsg('',tip);
                tip = 0;
            }
        },
        updateRemarkMsg(type,tip){
            const that = this;
            let param = []
            let url = '/include/ajax.php?service=job&action=updateInterView' ; //面试备注

            if(type){//更新面试备注
                url = '/include/ajax.php?service=job&action=customRemark'
                param.push('rid=' + that.invitationDetail.rid)
                param.push('remark=' + that.remark_resume)
            } else{
                param.push('state=' + that.invitationDetail.remark.remark_type)
                param.push('id=' + that.invitationDetail.id)
                param.push('remark=' + that.remark_msg)
            }

            $.ajax({
				url: url,
				type: "POST",
				dataType: "json",
                data:param.join('&'),
				success: function (data) {
					if(data.state == 100){
                        if(tip){
                            showErrAlert('更新成功','success');
                        }
                        that.showSlidePop = false;
                        that.getDetail(); //更新一下
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function () { 
                    tt.isload = false;
				}
			});
        },

        // 隐藏日期选择
        hideDatePop(){
            const that = this;
            that.datePop = false;
        },
    },

    watch:{
        showSlidePop(val){
            const that = this;
            if(val && that.showType == 'changeTime' && that.invitationDetail.state == 1 && that.invitationDetail.stating){
                let hour = new Date(that.invitationDetail.date * 1000).getHours();
                let min = new Date(that.invitationDetail.date * 1000).getMinutes();
                let date = parseInt(new Date(that.invitationDetail.date * 1000).setHours(0,0,0).valueOf() / 1000);
                that.dateChose['hour'] = hour;
                that.dateChose['min'] = min;
                that.dateChose['day'] = date;
            }

        },
        datePop:function(){
            console.log(this.remarkForm.joinDate * 1000)
        }
    }
})