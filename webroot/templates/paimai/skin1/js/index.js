new Vue({
    el:'#Home',
    data:{
        tabList:[],
        childrenCate:[],
        showCateChildren:false,
        tabsOn:1,
        listUrl:listUrl, //列表url
        detailUrl:detailUrl, //详情url
        tabsArr:[{id:1,typename:'珠宝玉器'},{id:1,typename:'珠宝玉器'},{id:1,typename:'珠宝玉器'}],
        goodsList:[],
        totalCount:0,
        page:1,
        isload:false,
        interval:'', //定时器
        finished:false,
    },
    created:function(){
        this.getTypeList(); //获取分类
    },
    mounted(){
        var tt = this;
        tt. getDataList();

        $(window).scroll(function(){   
            var scrt = $(window).scrollTop();
            var bodyH = $(document).height() - $(window).height();
            if (($(window).scrollTop() >= $(document).height() - $(window).height() - 170) && !tt.isload) {
                tt.getDataList();
            }
        })

        $(".bannerBox").slide({titCell:".hd ul",mainCell:".bd",effect:"fold",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
    },
    computed:{
        cutDownTime(){
            return function(timedata){
                var time = timedata;
                var now = new Date().getTime();
                var end = new Date(time).getTime();
                var leftTime = end - now;
                var dStr = '';
                if(leftTime <= 0){
                    dStr = '已结束';
                }else{
                    var d = parseInt(leftTime / 1000 / 60 / 60 / 24, 10);
                    var h = parseInt(leftTime / 1000 / 60 / 60 % 24, 10);
                    var m = parseInt(leftTime / 1000 / 60 % 60, 10);
                    var s = parseInt(leftTime / 1000 % 60, 10);
                    dStr =  '距离结束 ' + d + "天" + h + "小时" + m + "分" + s + "秒";
                }
               return dStr; 
            }
        },

       
    },
    methods:{
        handleCateMouseEnter:function(id){
            var tt = this;
            tt.showCateChildren = true
            const currentChildrenCate = tt.tabList.find(item => item.id === id)
             tt.childrenCate = currentChildrenCate ? currentChildrenCate.lower : [];
        },

        // 切换tab
        changeTab:function(id){
            var tt = this;
            var el = $(event.currentTarget);
            if(tt.tabsOn == $(el).index()) return false;
            tt.tabsOn = $(event.currentTarget).index();
            var pleft = el.position().left;
            var width = el.width();
            var left = pleft + width/2 - $('.el-tabs__active-bar').width()/2 + 20;
            if(tt.tabsOn == 1){
                $('.el-tabs__active-bar').css('transform','translateX('+(left-20)+'px)');
            }else{
                $('.el-tabs__active-bar').css('transform','translateX('+left+'px)');
            }
            tt.page = 1;
            tt.getDataList(id);
        },

        // 获取数据
        getDataList:function(id){
            var tt = this;
            id = id ? id : '';
            tt.isload = true;
            tt.finished = false
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getList&typeid='+id+'&page='+tt.page+'&pageSize=20&arcrank=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.finished = true
                        if(tt.page == 1){
                            tt.goodsList = data.info.list;
                        }else{
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.goodsList.push(data.info.list[i]);
                            }
                        }

                        tt.listCutDown()
                        tt.page ++ ;
                        tt.isload = false;
                        if(tt.page > data.info.pageInfo.totalPage || tt.page > 2){
                            tt.isload = true;
                        }
                    }else{
                        tt.finished = true
                        tt.isload = false;
                        tt.goodsList = [];
                    }
                },
                error: function () { }
            });
        },

        // 获取分类
        getTypeList(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=type&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.tabList = data.info;
                        tt.tabsArr = data.info;
                    }
                },
                error: function () { }
            });
        },


        // 倒计时
        listCutDown(){
            var tt = this;
            tt.destroyed()
            tt.interval = setInterval(function(){
                tt.goodsList.forEach(function(item,key){
                    var stardate = item.startdate;
                    var enddate = item.enddate;
                    var now = new Date().getTime();
                    var end = new Date(enddate).getTime();
                    var start = new Date(stardate).getTime();
                    var leftTime = 0;
                    var typeText = '距离结束 ';
                    if(start > now ){
                        leftTime =  start - now;
                        typeText = '即将开始 '
                    }else{
                        leftTime = end - now;
                    }
                   
                    var dStr = '';
                    if(leftTime <= 0){
                        dStr = '已结束';
                    }else{
                        var d = parseInt(leftTime / 1000 / 60 / 60 / 24, 10);
                        var h = parseInt(leftTime / 1000 / 60 / 60 % 24, 10);
                        var m = parseInt(leftTime / 1000 / 60 % 60, 10);
                        var s = parseInt(leftTime / 1000 % 60, 10);
                        dStr =  typeText + d + "天" + h + "小时" + m + "分" + s + "秒";
                    }
                    Vue.set(tt.goodsList[key], 'djs', dStr)
                    Vue.set(tt.goodsList, key, tt.goodsList[key])
                 
                })
            },1000)
        },

        // 销毁
        destroyed() {
            clearInterval(this.interval);
        },
    },

    wacth:{
        goodsList:function(val){
            console.log(val)
        }
    }

})