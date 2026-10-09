new Vue({
    el:'#businessHome',
    data:{
        totalPage:1,
        page:1,
        isload:false,
        goodList:[],

    },
    mounted(){
        var tt = this;
        tt.getDataList();
    },
    methods:{
        // 获取数据
        getDataList:function(page){
            var tt = this;
            var page = page ? page : tt.page;
            tt.isload = true;
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getList&page='+page+'&pageSize=12&store='+storeid,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.totalPage = data.info.pageInfo.totalPage;
                        tt.totalCount = data.info.pageInfo.totalCount;
                        tt.goodList = data.info.list;
                        page ++ ;
                        tt.isload = false;
                        if(page > data.info.pageInfo.totalPage || tt.page > 2){
                            tt.isload = true;
                        }
                    }     
                },
                error: function () { }
            });
        }
    }

})