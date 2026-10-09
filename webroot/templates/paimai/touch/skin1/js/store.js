var goodcard = {
    props:['tab'],
    data:function(){
        return {
            totalPage:1,
            page:1,
            isload:false,
        }
    },
    computed:{
        
    },
    template:`<div id="GoodCard" class="goodCard" >
            <a :href="tab.url" class="goodInfo">
            <div class="inner">
                <span v-if="tab.pai_count > 0">{{tab.pai_count}}人出价</span>
                <img :src="tab.litpic" />
            </div>
            <div class="textCon">
                <span class="tit">{{tab.title}}</span>
                <div class="priceCon" >
                <div class="priceText" >当前价</div>
                <div class="symbol">`+echoCurrency("symbol")+`</div>
                <div class="price">{{tab.cur_mon_start}}</div>
                </div>
                <div class="enddate"><span>结束时间：</span>{{tab.enddate}}</div>
            </div>
            </a>
        </div>`,
    methods:{
        
    },
}

new Vue({
    el:'#MobileBusinessHome',
    data:{
        finished:false, //是否加载完毕
        loading:false, //是否加载中
        page:1, //当前页
        list:[], //列表

    },
    components:{
        'goodcard':goodcard,
    },
    mounted(){
        wx.miniProgram.postMessage({//
            data: {
                title: wxconfig.title,
                link: wxconfig.link,
                imgUrl: wxconfig.imgUrl,
                desc: wxconfig.description
            }
        })
    },
    methods:{
        onLoad(){
            var tt = this;
            tt.getDataList();
        },

        getDataList(){
            var tt = this;
            tt.loading = true;
            var page = tt.page ? tt.page : 1;   //页码
            // var orderby = tt.orderby ? tt.orderby : '';   //排序
            // var pm_id = tt.pm_id ? tt.pm_id : '';   //拍卖状态
            // var typeid = tt.typeid ? tt.typeid : '';   //拍卖状态
           
            tt.loading = true;
           
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getlist&store='+storeid+'&page='+page,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.list = tt.list.concat(data.info.list);
                        tt.page ++;
                        // tt.totalPage = data.info.pageInfo.totalPage;
                        tt.loading = (data.info.pageInfo.page >= data.info.pageInfo.totalPage);
                        tt.finished = (data.info.pageInfo.page >= data.info.pageInfo.totalPage);
                    }
                },
                error: function () { }

            });
        },
    },

})