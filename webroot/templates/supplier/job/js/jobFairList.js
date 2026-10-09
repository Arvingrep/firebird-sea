if(certificateState!=1){
    history.go(-1);
}
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:7,
		hoverid:'',
		loading:false,
        keywords:'', //搜索关键字
        totalCount:0,
        page:1,
        isload:false,
        tabsArr:[{
            id:0,
            text:'我的招聘会',
            count:0,
        },{
            id:1,
            text:'报名记录',
            count:0,
        }],
        currTab:0, //当前的tab 1是报名记录 0是我参加的
        loadEnd:false, //我的招聘会是否加载完成
        myJoinData:[], //我的招聘会
        tableData:[{
            date:'1',
            name:'2',
            address:'3'
        },{
            date:'1',
            name:'2',
            address:'3'
        }],
        addrList:[], //区域列表
        addrid:cityid, //区域id
        cityid:cityid, //城市id
        jobFairList:[], //我的招聘会/报名记录
        recFairList:[], //推荐的招聘列表
        page:1,
        noData:false,
	},
	mounted() {
        var tt = this;
        tt.checkLeft();
        // 获取当前城市的区域
        tt.getCityAddr();
        // console.log($.cookie(cookiePre+"siteCityInfo"))
        
        
        // 获取列表
        tt.getFairList();
    },
    watch:{
        currTab:function(val){
            var tt = this;
            tt.checkLeft(val);
            tt.page = 1;
            tt.getFairList();
        },
        addrid:function(val){
            var tt = this;
            tt.getFairList(1)
        }
    },
    methods:{
        checkLeft(val){
            var tt = this;
            var currTab = val ? val : tt.currTab;
            var el = $(".tabBox li[data-id='"+currTab+"']");
            if(el && el.size()){

                var left = el.position().left + el.innerWidth()/2  - $(".tabBox s").width()/2;
                $(".tabBox s").css({
                    'transform':'translateX('+left+'px)'
                })
            }
        },
        // 表格全选
        selectAll(){
            var tt = this;
            tt.$refs.table.toggleAllSelection()
        },

        // // 对所选数据进行操作
        // optSelection(){
        //     var tt = this;
        //     // console.log(tt.$refs.table.selection)
        // },

        // // 下架
        // offPost(rowInfo){  //rowInfo是当前行的数据
        //     console.log(rowInfo)
        // },

         // 页码改变
        changePage(page){
            var tt = this;
            tt.page = page;
            tt.getFairList()
        },


        // 获取城市区域
        getCityAddr(){
            var tt = this;

            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=addr&type=' + cityid,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        tt.addrList = data.info;
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 获取我参加的/推荐的/报名的
        getFairList(rec){
            var tt = this;
            var param = '';
            if(!rec){
                if(tt.page === 1){
                    tt.totalCount = 0
                }
                tt.noData = false;
                param = '&pageSize=4&page=' + tt.page +'&u=1' + (tt.currTab ? '' : '&current=1')
            }else{
                param = '&pageSize=2&page=1&addrid=' + tt.addrid
                tt.loadEnd = false;
            }
            tt.loading = true;
            $.ajax({
                url: '/include/ajax.php?service=job&action=fairs' + param,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    tt.loading = false;
                    tt.loadEnd = true;
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
                            var n = tt.currTab ? 5 : 4; //时间展示的样式
                            data.info.list[i]['startdate_str'] = tt.transTimes(startdate,n).replace(/-/g,'/');
                            data.info.list[i]['enddate_str'] = tt.transTimes(enddate,n).replace(/-/g,'/');
                            data.info.list[i]['state'] = state;
                            dataArr.push(data.info.list[i])
                        }
                        if(rec && rec == 1){
                            tt.totalCount = data.info.pageInfo.totalCount;
                            tt.recFairList = dataArr
                        }else{
                            tt.myJoinData = dataArr;
                            tt.loadEnd = true;
                        }
                    }else{
                        if(!rec && tt.page == 1){
                            tt.noData = true;
                            tt.getFairList(1);
                        }
                    }
				},
				error: function (data) { 
                    tt.loading = false;
                    tt.loadEnd = true;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        goLink(url){
            window.open(url)
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
        }

    }
})