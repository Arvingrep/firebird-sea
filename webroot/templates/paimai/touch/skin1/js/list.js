

new Vue({
    el:"#MobileGoodsList",
    data:{
        orderby:'', //默认排序
        pm_id:'', //全部
        orderbyList:[{value:'',text:'默认排序'},{value:'1',text:'价格'},{value:'4',text:'出价次数'}],
        pmStates:[{value:'',text:'全部'},{value:1,text:'拍卖中'},{value:3,text:'已结束'},{value:2,text:'即将开始'},{value:4,text:'未结束'}],
     
        finished:false,
        loading:false,
        list:[],
        time:0,
        page:1,
        typeid:'',
        typeList:[],
        title:''
    },
    mounted(){
        var tt = this;
        tt.getTypeList();

        if(tt.getUrlParam('typeid')){
            tt.typeid = tt.getUrlParam('typeid');
        }
        if(tt.getUrlParam('keywords')){
            tt.title = tt.getUrlParam('keywords');
        }

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
        reload(){
            var tt = this;
              tt.page = 1;
              tt.finished = false;
              tt.loading = false;
              tt.list = [];
              tt.getDataList()
        },
        onLoad(){
            var tt = this;
            tt.getDataList();
        },
        getDataList(){
            var tt = this;
            var page = tt.page ? tt.page : 1;   //页码
            var orderby = tt.orderby ? tt.orderby : '';   //排序
            var pm_id = tt.pm_id ? tt.pm_id : '';   //拍卖状态
            var typeid = tt.typeid ? tt.typeid : '';   //拍卖状态
           
            tt.loading = true;
           
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getlist&title='+tt.title+'&page='+page+'&orderby='+orderby+'&timetype='+pm_id+'&typeid='+typeid,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.list = tt.list.concat(data.info.list);
                        tt.page ++;
                        tt.totalPage = data.info.pageInfo.totalPage;
                        tt.loading = (data.info.pageInfo.page >= data.info.pageInfo.totalPage);
                        tt.finished = (data.info.pageInfo.page >= data.info.pageInfo.totalPage);
                    }
                },
                error: function () { }

            });
        },

        goLink(url){
            window.location.href = url;
        },

        getTypeList:function(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=type&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        // tt.tabsArr = tt.tabsArr.concat(data.info);
                        // console.log(tt.typeList)
                        tt.typeList.push({'value':'',text:'全部类型'}); 
                        for(var i = 0 ;i < data.info.length; i++){
                            var type = {
                                value:data.info[i].id,
                                text:data.info[i].typename
                            }
                            tt.typeList.push(type); 
                        }

                        tt.$refs.dropdownItem0.toggle()
                        setTimeout(function(){
                            tt.$refs.dropdownItem0.toggle()
                            tt.$refs.dropdownItem.toggle();
                        })
                        setTimeout(() => {
                            tt.$refs.dropdownItem.toggle();
                        });
                       
                    }
                },
                error: function () { }
            });
        },

        countTime:function(enddate){
            var now = Math.round(new Date() / 1000);
                var end = Math.round(new Date(enddate.replace(/-/g,'/')) / 1000);
                var time = (end - now) * 1000;
                return time;
        },


        // 获取url参数
        getUrlParam:function(name){
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return decodeURIComponent(r[2]); return null;
        },
        
    },

    watch:{
        orderby:function(val){
            console.log(val)
        }
    }
})