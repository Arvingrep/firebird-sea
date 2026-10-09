new Vue({
    el:'#GoodsList',
    data:{
        goodStatusList:[ 
            {label:'不限',value:''}, 
            {label:'拍卖中',value:'1'}, 
            {label:'即将开始',value:'2'}, 
            {label:'已结束',value:'3'}, 
            {label:'未结束',value:'4'}, 
            
        ],
        searchForm:{ arcrank: "", orderby: "",  store: "", timetype: "", title: "", typeid: typeid , u: "" },
        goodsList:[],
        page:1,
        totalPage:1,
        tabList:[], //分类
        storeList:[], //店铺
        totalCount:0,
        finished:false,
    },
    mounted(){
        var tt = this;
        tt.getStoreList(); //初始加载店铺
        tt.getTypeList(); //初始加载分类
        

        var keywords = tt.getQueryString('keywords');
        if(keywords){
            tt.page = 1;
            tt.searchForm.title = keywords;
            tt.getDataList();
            $('.searchInput').val(keywords)
        }else{
        	setTimeout(() => {
	            tt.getDataList(); //初始加载数据
	        }, 500);
        }   
        
        $('.searchBtn').click(function(){
            tt.page = 1;
            tt.searchForm.title = $('.searchInput').val();
            tt.getDataList();
        });

        $(".searchInput").on('keyup',function(e){
            if(e.keyCode == 13){
                tt.page = 1;
                tt.searchForm.title = $('.searchInput').val();
                tt.getDataList();
            }
        })


        // $(".downBtn").off('click').on('click',function(){
        //     var orderby = '';
        //     if($(this).hasClass('up')){
        //         orderby = $(this).attr('data-up')
        //         $(this).removeClass('up')
        //     }else{
        //         orderby = $(this).attr('data-down');
        //         $(this).addClass('up')
        //     }
        //     // tt.chanageSearchForm('orderby',orderby)
        //     console.log(orderby,11)
        // })
    },
    computed:{
        cutDownTime(){
            return function(timedata){
                var tt = this;
                // var str = '';
                // // tt.cutDownTimeF(timedata,tt.getReturn);
                // // str = tt.cutDownTimeF(timedata,tt.getReturn)
                // console.log(tt.cutDownTimeF(timedata,tt.getReturn))
                // return str;

                return  tt.cutDownTimeF(timedata)
                // var interval = setInterval(function(){
                // },1000)
            }
        },
    },
    methods:{
        // 获取数据
        getDataList:function(page){
            var tt = this;
            var page = page ? page : tt.page;
            tt.isload = true;
            console.log(tt.searchForm);
            tt.finished = false;
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getList&page='+page+'&pageSize=20',
                data:tt.searchForm,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.finished = true;
                    if(data.state == 100){
                        tt.totalPage = data.info.pageInfo.totalPage;
                        tt.totalCount = data.info.pageInfo.totalCount;
                        tt.goodsList = data.info.list;
                        tt.listCutDown()
                        page ++ ;
                        tt.isload = false;
                        if(page > data.info.pageInfo.totalPage || tt.page > 2){
                            tt.isload = true;
                        }
                        tt.page = page;
                    }else{
                        tt.isload = false;
                        tt.goodsList = [];
                    }
                },
                error: function () {  tt.finished = true; }
            });
        },

         //点击页码
        getPageData:function(key,type){
            var tt = this;
            if(key > 0){
                if(type == 1){
                    tt.getDataList(key - 1);
                }else{
                    tt.getDataList(key);
                }

                setTimeout(() => {
                    $(window).scrollTop(0) 
                }, 500);
                
            }
        } ,

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
                        
                    }
                },
                error: function () { }
            });
        },

        // 点击修改筛选
        onclick(e){
            var el = event.currentTarget;
            var orderby = '';
            var tt = this;
            // $(el).toggleClass('up')
            if($(el).closest('.downBtn').hasClass('up')){
                orderby = $(el).closest('.downBtn').attr('data-up')
                $(el).closest('.downBtn').removeClass('up')
            }else{
                orderby = $(el).closest('.downBtn').attr('data-down');
                $(el).closest('.downBtn').addClass('up')
            }
            tt.chanageSearchForm('orderby',orderby)
            console.log(orderby)
        
        },

        // 改变数据筛选条件
        chanageSearchForm(key,value){
            var tt = this;
            tt.page = 1;
            tt.searchForm[key] = value;
            console.log(key,value);
            tt.getDataList();
        },

        // 获取店铺
        getStoreList(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=storeList',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.storeList = data.info.list;
                        
                    }
                },
                error: function () { }
            });
        },

        //获取url参数
        getQueryString(name) {
            var paramStr = window.location.search.substr(1);
            paramStr = decodeURIComponent(paramStr);
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = paramStr.match(reg);
            if (r != null) return unescape(r[2]); return null;
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
})