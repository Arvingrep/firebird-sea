var pageVue = new Vue({
    el:'#invitationCon',
    data:{
        invitationList:[],
        isload:false,
        page:1,
        totalCount:0,
        invitation:0,
        batch:'',
        noData:false,
        noDataAll:false, //没有任何数据
    },
    mounted(){
        const that = this;
        that.getInvitations(); //获取面试列表
        that.getResumeDetail();
    },
    methods:{
        getInvitations(){
            const that = this;
            if(that.isload) return false;
            that.isload = true;
            that.noData = false;
            $.ajax({
				url: "/include/ajax.php?service=job&action=myInterviewList&pageSize=10&batch="+ that.batch +"&page=" + that.page,
				type: "GET",
				dataType: "json",
				success: function (data) {
                    that.isload = false
                    if(data.state == 100){
                        that.invitationList = data.info.list;
                        that.totalCount = data.info.pageInfo.totalCount
                        that.invitation = data.info.pageInfo.state0
                        if(!data.info.pageInfo.totalCount){
                            that.noData = true;
                        }

                        if(data.info.pageInfo.totalCountAll == 0){
                            that.noDataAll = true;
                        }
                    }else{
                        if(!that.invitationList.length){
                            that.noData = true;
                        }
                    }
				},
				error: function(){
					that.isload = false;
                    if(!that.invitationList.length){
                        that.noData = true;
                    }
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
        // 时间转换
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

        changePage(page){
            const that = this;
            that.page = page;
            that.getInvitations();

        },
        gotoLink(item){
            if(item.job.off||item.job.del){ //已下架或者删除
                event.preventDefault();
				$('.invalidPop .ss-title p').text('该职位已失效');
				$('.invalidPop .ss-text p').text('该职位已被下架或删除，如需沟通投递或面试事宜，请与招聘方核实');
				$('.invalidPop').show();
				return
			}else if(item.job.state==0||item.job.state==2){ //审核中
                event.preventDefault();
				$('.invalidPop .ss-title p').text('该职位审核中');
				$('.invalidPop .ss-text p').text('该职位内容可能有变动，平台正在审核中');
				$('.invalidPop').show();
				return
			};
        },
        // 关闭投递弹窗
        closePopFn() {
            $('.invalidPop').children().css({ 'animation': 'bottomFadeOut .3s' });
            setTimeout(() => {
                $('.invalidPop').hide();
                $('.s-certificate').css({ 'animation': 'topFadeIn .3s' });
            }, 280);
        }
        
    },
    watch:{
        batch:function(val){
            this.page = 1;
            this.isload = false;
            this.totalCount = 0;
            this.getInvitations();
        },
    }
})