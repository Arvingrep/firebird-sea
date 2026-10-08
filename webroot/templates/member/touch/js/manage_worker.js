var page = new Vue({
    el:'#page',
    data:{
        currOn:1, //默认招聘信息
        page:1,
        isload:false,
        pgList:[], //数据
        page_qiuzhi:1,
        isload_qiuzhi:false,
        qiuzhi_list:[], //数据
        loading:false, //正在加载
        notab:false, //不显示tab
    },
    mounted(){
        var tt = this;
        tt.getDataList(1)
    },
    methods:{
        showTip(state){
            if(!state){
                showErrAlert('信息审核中')
            }else{
                showErrAlert('审核未通过，请按要求修改提交')
            }
        },

        // 获取列表
        getDataList(init){
            var tt = this;
            if((tt.isload && tt.currOn === 1) || (tt.isload_qiuzhi && tt.currOn === 2) || tt.loading) return false;
            tt.loading = true;
            var url = '/include/ajax.php?service=job&action=pgList&page=1&pageSize=20&u=1';
            if(tt.currOn == 2){
                url = '/include/ajax.php?service=job&action=qzList&page=1&pageSize=20&u=1'
                tt.isload_qiuzhi = true ;
            }else{
                tt.isload = true;
            }
            $.ajax({
                url: url, 
                type: "POST",
                dataType: "json",
                success: function (data) {
                    tt.loading = false;
                    if(data.state == 100){
                        if(tt.currOn == 2){  //求职
                            tt.isload_qiuzhi = false;
                            if(tt.page_qiuzhi == 1) {
                                tt.qiuzhi_list = []
                            }
                            for(var i = 0; i< data.info.list.length; i++){
                                tt.qiuzhi_list.push(data.info.list[i]);
                            }
                            tt.page_qiuzhi++;
                            if(data.info.pageInfo.totalPage > tt.page_qiuzhi){
                                tt.isload_qiuzhi = false;
                            }
                        }else{ //招聘
                            tt.isload = false;
                            if(tt.page == 1) {
                                tt.pgList = []
                            }
                            for(var i = 0; i<data.info.list.length; i++){
                                tt.pgList.push(data.info.list[i]);
                            }

                            // 没有数据
                            if(tt.pgList.length == 0 && tt.page == 1 && init){
                                tt.currOn = 2;
                                tt.notab = true;
                                return false;
                            }


                            tt.page++;
                            if(data.info.pageInfo.totalPage > tt.page){
                                tt.isload = false;
                            }
                        }
                        if(data.info.pageInfo.pg == 0 || data.info.pageInfo.qz == 0){
                            tt.notab = true;
                        }
                    }else{
                        if(init){
                            tt.currOn = 2
                        }
                    }
                },
                error: function () { 
                    tt.loading = false;
                }
            });
        },


        // 时间转换
        timetrans(time){
            var timestr = time * 1000;
            var str = '';
            if(new Date(timestr).toDateString() === new Date().toDateString()){
                str = '今天发布'
            }else if(new Date(timestr).getFullYear() == new Date().getFullYear()){
                str = huoniao.transTimes(time,3).replace(/-/g,'/');
            }else{
                str = huoniao.transTimes(time,2).replace(/-/g,'/');
            }
            return str;
        },

        // 编辑信息
        toEdit(id){
            var tt = this;
            if(tt.currOn === 1){
                window.location.href = (memberDomain + '/fabu_worker_seek.html?id=' + id)
            }else{
                window.location.href = (memberDomain + '/fabu_post_seek.html?id=' + id)

            }
        },

        // 删除信息
        delInfo(id){
            var tt = this;
            var  confirmPopOptions = {
                isShow:true,
                confirmTip:'一经删除不可恢复',  //副标题
            } ;
            confirmPop(confirmPopOptions,function(){
                tt.confirmDelInfo(id)
            })
        },

        confirmDelInfo(id){
            var tt = this;
            var type = tt.currOn === 1 ? 'delPg' : 'delQz'
            $.ajax({
                url: '/include/ajax.php?service=job&action='+ type +'&id=' + id, 
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        showErrAlert('删除成功');
                    }else{
                        showErrAlert(data.info);
                    }
                },
            })
        },
    },

    watch:{
        currOn:function(val){
            var tt = this;
            
            if(val == 2 && !tt.isload_qiuzhi && tt.qiuzhi_list.length == 0){
                tt.getDataList() 
            }
        }
    }
})