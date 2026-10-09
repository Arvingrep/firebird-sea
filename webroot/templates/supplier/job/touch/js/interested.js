var pageVue = new Vue({
    el:'#page',
    data:{
        tabList:[ { id:'', tit:'全部' }, { id:1, tit:'收藏我', noread:0 }, { id:2, tit:'看过我', noread:0 } ],
		currOnTab:'',  //当前选中的 tab
		tabOffLeft:0, //tab底边偏移
		tdList:[],
		tdpage:1,
		isload:false,  
		loadEnd:false,  //加载完成 
        // resume:resume,

    },
    mounted:function(){
        const that = this;
        that.checkLeft();
        that.getList();
        $(window).scroll(function(){
            var scrTop = $(this).scrollTop();
            var bh = $('body').height() - 50;
            var wh = $(window).height();
            if (scrTop + wh >= bh && !that.isload && !that.loadEnd) {
                that.getList(); //获取简历
            }
        });
    },
    methods:{
        checkLeft(){
			var tt = this;
			var el = $('.tabBox li[data-id="'+tt.currOnTab+'"]');
			var left = el.offset().left + el.width()/2 - $('.tabBox .line').width() / 2;
			tt.tabOffLeft = left;
		},

        getList(){
            const that = this;
            if(that.isload) return false;
            that.isload = true;
            $.ajax({
                url: '/include/ajax.php?service=job&action=interestCompany&page='+that.tdpage+'&type=' + that.currOnTab,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    that.isload = false;
                    if (data.state == 100) {
                        if(that.tdpage == 1){
                            that.tdList = [] 
                        }
                        that.tdList = that.tdList.concat(data.info.list);
                        that.tdpage++;
                        if(that.tdpage > data.info.pageInfo.totalPage){
                            that.loadEnd = true;
                            that.isload = true
                        }
                    }else{
                        that.loadEnd = true;
                        that.isload = true
                    }
                },
                error: function () {
                    that.loadEnd = true;
                    that.isload = true
                }
            });
        },

        // 时间转换
        timeStrToDate(timeStr){
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
			var datestr = month_str + '/' + dates_sta ;
       
            let tomorrow = parseInt(new Date().setHours(0, 0, 0, 0).valueOf() / 1000) + 86400
            tomorrow = new Date(tomorrow * 1000);
            let yesterday = parseInt(new Date().setHours(0, 0, 0, 0).valueOf() / 1000) - 86400;
            yesterday =  new Date(yesterday * 1000);
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天' + hour + ':' + minute
			}else if(tomorrow.toDateString()=== date.toDateString()){
                datestr = '明天' + hour + ':' + minute
            }else if(yesterday.toDateString()=== date.toDateString()){
                datestr = '昨天' + hour + ':' + minute
            }else if(year != now.getFullYear()){
                datestr = year_str + '/' + datestr
            }
		

			return datestr;
		},
    },

    watch:{
        currOnTab:function(){
            const that =  this;
            this.checkLeft();
            that.tdpage = 1;
            that.isload = false;
            that.loadEnd = false;
            that.getList();
        }
    }
})