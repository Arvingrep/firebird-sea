var pageVue = new Vue({
    el:'#page',
    data:{
        isload:false,
        loadEnd:false,
        list:{},
        page:1,
    },
    mounted(){
        const that = this;
        that.getList();
        // 下拉加载更多
        $(window).scroll(function(){
            var scrTop = $(this).scrollTop();
            var bh = $('body').height() - 50;
            var wh = $(window).height();
            if (scrTop + wh >= bh && !that.isload && !that.loadEnd) {
                // console.log(111)
                that.getList(); //获取简历
            }
        });
    },
    methods:{
        getList(){
            const that = this;
            if(that.isload) return false;
            that.isload = true;

            $.ajax({
                url: '/include/ajax.php?service=job&action=getCompanyFooter&pageSize=20&page=' + that.page ,
            
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.isload = false
                    if(data.state == 100){
                        let list = that.list
                        if(that.page == 1){
                            list = {};
                        }
                        for(let i = 0; i < data.info.list.length; i++){
                            const dateStr = parseInt(new Date(data.info.list[i].date * 1000).setHours(0,0,0,0) / 1000)
                            if(list[dateStr + ''] && list[dateStr + ''].length){
                                list[dateStr + ''].push(data.info.list[i].resume)
                            }else{
                                list[dateStr + ''] = [data.info.list[i].resume]
                            }
                        }
                        that.list = JSON.parse(JSON.stringify(list));
                        that.page++;
                        if(that.page > data.info.pageInfo.totalPage){
                            that.loadEnd = true;
                            that.isload = true
                        }
                        that.$forceUpdate()
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
				datestr = '今天'
			}else if(tomorrow.toDateString()=== date.toDateString()){
                datestr = '明天'
            }else if(yesterday.toDateString()=== date.toDateString()){
                datestr = '昨天'
            }else if(year != now.getFullYear()){
                datestr = year_str + '/' + datestr
            }
		

			return datestr;
		},

    }
})