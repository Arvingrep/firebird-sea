var pageVue = new Vue({
    el:'#deliveryPage',
    data:{
        orderby:1, //排序
        selOptions:[
            {label:'按更新状态',value:2},
            {label:'按投递时间',value:1},
        ],
        tabList:[ { id:'', tit:'全部' }, { id:1, tit:'被查看', noread:0 }, { id:2, tit:'有意向', noread:0 }, { id:3, tit:'邀面试', noread:0 }, { id:4, tit:'不合适', noread:0 }, ],
		currOn:'', 
        deliveryList:[], //投递数据
        isload:false,
        page:1,
        totalCount:0,
        batch:'',
		stateArr:['已投递','被查看','有意向','邀面试','不合适'],
        noData:false,
        noDataAll:false,

    },
    mounted:function(){
        this.getDeliveryList(); //获取数据
        this.getResumeDetail();
    },
    methods:{

        // 获取投递列表
        getDeliveryList(){
            const that = this;
            if(that.isload) return false;
            that.noData = false;
            that.noDataAll = false;
            that.isload = true
            $.ajax({
                url: '/include/ajax.php?service=job&action=myDeliveryList&pageSize=10&orderby='+that.orderby+'&page='+that.page+'&state='+that.currOn+'&batch=' + that.batch,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    that.isload = false;
                    if (data.state == 100) {
                        that.deliveryList = data.info.list
                        // that.page = that.page + 1;
                        if(that.page > data.info.pageInfo.totalPage){
                            // that.isload = true;
                            console.log('加载完成')
                        }
                        if(data.info.pageInfo.totalCount === 0){
                            that.noData = true;
                        }

                        if(data.info.pageInfo.totalCountAll == 0){
                            that.noDataAll = true;
                        }
                        console.log(data.info.pageInfo)
                        that.totalCount = data.info.pageInfo.totalCount;
                    }else{
                        that.noData = true;
                        // that.noDataAll = true;
                    }
                    for(var i = 0; i < that.tabList.length; i++){
                        that.tabList[i]['state'] = data.info.pageInfo['state' + i]
                    }
                    
                },
                error: function () {
                    that.noData = true;
                    that.noDataAll = true;
                }
            });
        },
        // 获取简历
        getResumeDetail(){
            $.ajax({
                url: '/include/ajax.php?service=job&action=resumeDetail&default=1',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    this.isload = false;
                    if (data.state != 100) {
                        history.go(-1);
                    }
                    
                },
                error: function () {
                    this.noData = true;
                    this.noDataAll = true;
                }
            });
        },
        // 页码改变
        changePage(page){
            var tt = this;
            tt.page = page;
            tt.getDeliveryList()
        },

        transTimes(timeStr){
            const that = this;
            update = new Date(timeStr * 1000);//时间戳要乘1000
            year = update.getFullYear();
            month = (update.getMonth() + 1 < 10) ? ('0' + (update.getMonth() + 1)) : (update.getMonth() + 1);
            day = (update.getDate() < 10) ? ('0' + update.getDate()) : (update.getDate());
            hour = (update.getHours() < 10) ? ('0' + update.getHours()) : (update.getHours());
            minute = (update.getMinutes() < 10) ? ('0' + update.getMinutes()) : (update.getMinutes());
            second = (update.getSeconds() < 10) ? ('0' + update.getSeconds()) : (update.getSeconds());

            if (new Date(Number(timeStr)* 1000).toDateString() === new Date().toDateString()) {
                return ('今天' +  ' ' + hour + ':' + minute )
            } else if (year == new Date().getFullYear()){
                return ( month + '/' + day + ' ' + hour + ':' + minute )
            }else{
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute );
            }
            
        },
        // 关闭投递弹窗
        closePopFn() {
            $('.invalidPop').children().css({ 'animation': 'bottomFadeOut .3s' });
            setTimeout(() => {
                $('.invalidPop').hide();
                $('.s-certificate').css({ 'animation': 'topFadeIn .3s' });
            }, 280);
        },
        // 跳转链接
        gotoLink(row, column, event){
            if(row.job.off||row.job.del){ //已下架或者删除
				$('.invalidPop .ss-title p').text('该职位已失效');
				$('.invalidPop .ss-text p').text('该职位已被下架或删除，如需沟通投递或面试事宜，请与招聘方核实');
				$('.invalidPop').show();
				return
			}else if(row.job.state==0||row.job.state==2){ //审核中
				$('.invalidPop .ss-title p').text('该职位审核中');
				$('.invalidPop .ss-text p').text('该职位内容可能有变动，平台正在审核中');
				$('.invalidPop').show();
				return
			};
			if(row.postState == 3){
                open(memberDomain + '/post_detail.html?type=invitation&id=' + row.invition_id)
            }else{
                open(memberDomain + '/post_detail.html?type=delivery&id=' + row.id)
            }
		},
    },

    watch:{
        batch:function(val){
            this.page = 1;
            this.isload = false;
            this.totalCount = 0;
            this.getDeliveryList()
        },

        currOn:function(val){
            this.page = 1;
            this.isload = false;
            this.totalCount = 0;
            this.getDeliveryList()
        },

        orderby:function(val){
            this.page = 1;
            this.isload = false;
            this.totalCount = 0;
            this.getDeliveryList()
        }
    },
})