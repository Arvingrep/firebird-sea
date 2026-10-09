new Vue({
    el:'#page',
    data:{
        fairList:[],
        page:1,
        isload:false,
        loadEnd:false,
        showPop:false,
        page_record:1,
        isload_record:false,
        loadEnd_record:false,
        fairList_record:[],
    },
    mounted(){
        const that = this;
        that.getfairList();

        // 下拉加载更多
        $(window).scroll(function(){
            var scrTop = $(this).scrollTop();
            var bh = $('body').height() - 50;
            var wh = $(window).height();
            if (scrTop + wh >= bh && !that.isload && !that.loadEnd) {
                that.getfairList(); //获取简历
            }
        });
        $('.bottomPopBox .pop_con').scroll(function(){
            var scrTop = $(this).scrollTop();
            var bh = $('.bottomPopBox .pop_con ul').height() - 50;
            var wh = $(window).height();
            if (scrTop + wh >= bh && !that.isload_record && !that.loadEnd_record) {
                that.getfairList(1); //获取简历
            }
        });
    },
    methods:{
        getfairList(end){ //end表示结束的
            const that = this;
            const endStr = end ? '_record':''
            if(that['isload' + endStr]) return false;
            that['isload' + endStr] = true;
            let param = '&pageSize=20&page=' + that['page' + endStr] + '&u=1';
            if(!end){
                param = '&pageSize=20&page=' + that['page' + endStr] + '&u=1&current=1'
            }
            $.ajax({
                url: '/include/ajax.php?service=job&action=fairs' + param,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    that['isload' + endStr] = false;
                    if(data.state == 100){

                        var dataArr = []
                        for(var i = 0; i < data.info.list.length; i++){
                            var startdate = data.info.list[i].startdate;
                            var enddate = data.info.list[i].enddate;
                            var state = 0;
                            var currDate = parseInt(new Date().valueOf()/1000) ;
                            if(currDate < startdate){
                                state = 0
                            }else if(currDate >= startdate && currDate <= enddate){
                                state = 1
                            }else{
                                state = 2 
                            }
                            data.info.list[i]['startdate_str'] = that.transTimes(startdate,4).replace(/-/g,'/');
                            data.info.list[i]['enddate_str'] = that.transTimes(enddate,4).replace(/-/g,'/');
                            data.info.list[i]['state'] = state;
                            dataArr.push(data.info.list[i])
                        }
                        that['fairList' + endStr] = dataArr;
                        that['page' + endStr]++ ;
                        if(that['page' + endStr] > data.info.pageInfo.totalPage){
                            that['loadEnd' + endStr] = true;
                            that['isload' + endStr] = true;
                        }
                    }else{
                        that['loadEnd' + endStr] = true;
                        that['isload' + endStr] = false;
                    }
                
				},
				error: function (data) { 
                    that['loadEnd' + endStr] = true;
                    that['isload' + endStr] = false;
                    
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
            }else {
                return 0;
            }
        },

        // 显示分享弹窗
        showSharePop(item){
            const that = this;

            jobPop.sharePop = true;
            jobPop.shareObj = item;
            jobPop.shareType = '';
            jobPop.posterType = 'post';
        },
    },
    watch:{
        showPop:function(val){
            const that = this;
            if(that.fairList_record.length == 0){
                that.getfairList(1);
            }
        }
    }
})