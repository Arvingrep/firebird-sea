var pageVue = new Vue({
    el:'#page',
    data:{
        gjArr:[{ text:'招聘海报', url:'', },{ text:'付费推广', url:'', },{ text:pg_name, url:job_channel + '/general', },{ text:'招聘会报名', url:masterDomain + '/supplier/job/jobfairList.html', },{ text:'公司资料', url:'', },{ text:certification ? '资质已认证' : '资质认证', url:masterDomain+'/supplier/job/company_info.html?to=1&appFullScreen', },{ text:'工作地址', url:(address ? masterDomain+'/supplier/job/jobaddrmange.html': masterDomain+'/supplier/job/addrAdd.html?com=1'), }],
        businessInfo:'', //公司信息
        interviewScheduleObj:{
            isload:false,
            interviewSchedule:[],
            pageInfo:{}
        },
        currInterView:{}, //当前要沟通打对象
        showSlidePop:false,  //显示弹窗  
        showType:'chat', //弹窗类型 chat=>沟通  refresh => 刷新全部  confirm => 确认弹窗  companyInfo => 公司信息
        refreshNum:0,
        refreshFromBtn:false, //点击刷新职位
        company_state:company_state, //公司状态
        pcount:pcount, //企业发布的职位
    },
    mounted(){
        const that = this;
        if(job_cid){
            that.getinterviewSchedule();
            that.getBusinessInfo();
            that.checkVipExpire()
            if(pcount){
                that.checkRefresh()
            }
        }


        setTimeout(() => {
            $('.footer_4_3 li').each(function(){
                let t = $(this);
                if(t.attr('data-curr')){
                    let currIcon = t.find('a').attr('data-icon2');
                    t.find('img').attr('src',currIcon);
                    t.addClass('currOn')
                }
               if(t.hasClass('message_show')){
                let url = t.find('a').attr('data-url')
                let urlArr = url.split('&');
                let nUrlArr = [];
                for(let i = 0; i < urlArr.length; i++){
                    if(urlArr[i].indexOf('appIndex') <= -1){
                        nUrlArr.push(urlArr[i])
                    }

                }
                url = nUrlArr.join('&')
                t.find('a').attr('data-url',url)
               }
            })

            $('.footer_4_3 li.currOn').click(function(e){
                location.reload()
                e.preventDefault()
            })
        }, 300);
        var isBytemini = device.toLowerCase().includes("toutiaomicroapp");
        if(isBytemini){
            $('.general').hide();
        }
    },
    methods:{

        // 点击刷新全部
        torefresh(){
            const that = this;
            if(job_cid == '0'){
                // showErrAlert('请先配置商家信息')
                setTimeout(() => {
                    location.href = masterDomain + '/supplier/job/company_info.html?direct=1&appFullScreen'
                },1500)
            }else if(pcount == 0){
                this.checkState('',1);
                
            }else{
                
                that.showSlidePop = true ; 
                that.showType = 'refresh' ;
                that.refreshFromBtn = true
            }
        },

        // 隐藏引导图
        hideDirection(){
            const that = this;
            $('.maskDirection').hide()
        },
        // 招聘工具跳转
        toLink(item,ind){
            const that = this;
            if(job_cid == '0'){
                showErrAlert('请先配置商家信息')
                setTimeout(() => {
                    location.href = masterDomain + '/supplier/job/company_info.html?direct=1&appFullScreen'
                },1500)
                return false;
            }

            switch(ind){
                case 4:
                    that.showSlidePop = true;
                    that.showType = 'companyInfo'
                    break;
                case 1:
                    if(!jobCount){
                        showErrAlert('请先发布职位')
                        setTimeout(() => {
                            location.href = masterDomain + '/supplier/job/add_post.html?appFullScreen'
                        }, 1500);
                    }else{
                        $('.maskDirection').show()
                    }
                    break;
                case 0:
                    if(!jobCount){
                        showErrAlert('请先发布职位')
                        setTimeout(() => {
                            location.href = masterDomain + '/supplier/job/add_post.html?appFullScreen'
                        }, 1500);
                    }else{

                        jobPop.sharePop = true;
                        jobPop.shareType = 'poster'; //显示海报弹窗
                        jobPop.posterType = '';
                        jobPop.getPostArr();
                        jobPop.getPosterList(); //获取海报列表
                    }
            }
        },

        // 验证刷新提示
		checkRefresh(){
			const that = this;
            if(!jobCount) return false
			var refreshTip = $.cookie("HN_refresh_tip");
            var expire_tip = $.cookie("HN_vip_expire_tip");
			if(!refreshTip && expire_tip){
				var date_now = new Date();
                date_now.setDate(date_now.getDate()+1);
                date_now.setHours(0);
                date_now.setMinutes(0);
                date_now.setSeconds(0); 
                $.cookie("HN_refresh_tip",1,{ expires:date_now});  //第二天0点失效
                that.showSlidePop = true;
                that.showType = 'refresh';
                that.refreshFromBtn = false;
				
                    
			}
		},

        // 验证会员
        checkVipExpire(){
            const that = this;
            var expire_tip = $.cookie("HN_vip_expire_tip");
            const now = parseInt(new Date().valueOf() / 1000)
            var date_now = new Date();
                date_now.setDate(date_now.getDate()+1);
                date_now.setHours(0);
                date_now.setMinutes(0);
                date_now.setSeconds(0);
            let timeOff = combo_enddate != -1 ? (combo_enddate - now) : -1
            let day = parseInt(timeOff / 60 / 60 / 24);
            $.cookie("HN_vip_expire_tip",1,{ expires:date_now});  //第二天0点失效
            if( combo_id && day < 8 && !expire_tip){
                that.showPackagePop = true;
                that.showType = 'keepmeal'
                that.expired = day;
            }
        },

        // 验证会员到期还剩7天
        checkVipExpired(){
            const that = this;
            let expired = false
            const now = parseInt(new Date().valueOf() / 1000)
            var date_now = new Date();
                date_now.setDate(date_now.getDate()+1);
                date_now.setHours(0);
                date_now.setMinutes(0);
                date_now.setSeconds(0);
            let timeOff = combo_enddate != -1 ? (combo_enddate - now) : -1
            let day = parseInt(timeOff / 60 / 60 / 24);
            if(timeOff != -1 && combo_id && day < 8){
                expired = true
            }
            return expired
        },


        // 刷新全部职位
		refreshAllPost(){
			var tt = this;
            tt.showSlidePop = false;
			$.ajax({
				url: '/include/ajax.php?service=job&action=jobRefresh&all=1',
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){ //刷新成功
						if(typeof(data.info) == 'object'){  //部分刷新成功
                            that.showSlidePop = true;
                            that.refreshNum = data.info.success;
                            that.showType = 'confirm';
                            jobPop.showPackagePop = true; //显示刷新包
                            jobPop.showType = 'package'; //显示刷新包
                            jobPop.packagePopType = 5
						}else{
                            // 全部刷新成功
                            showErrAlert('成功刷新' + jobCount + '条职位','success')
						}

                        setTimeout(() => {
                            location.reload()
                        }, 1500);
					}else{
						showErrAlert('今日刷新次数已用完，请购买增值包');
                        jobPop.showPackagePop = true; //显示刷新包
                        jobPop.showType = 'package'; //显示刷新包
                        jobPop.packagePopType = 5
					}
				},
				error: function () { 
					
				}
			});


		},
        // 获取商家信息
        getBusinessInfo(){
            const that = this
            $.ajax({
				url: '/include/ajax.php?service=job&action=companyDetail&other_param=addr',
				type: "GET",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        that.businessInfo = data.info;
                    
                    }
                
				},
				error: function (data) { 
                    showErrAlert('网络错误，请稍后重试')
				}
			});
        },

        // 面试日程
        getinterviewSchedule(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=interviewSchedule',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    tt.interviewScheduleObj.isload = true;
                    if(data.state == 100){
                        tt.interviewScheduleObj.interviewSchedule = data.info.list;
                        tt.interviewScheduleObj.pageInfo = data.info.pageInfo;
                    }
                
                },
                error: function () { 
                    tt.interviewScheduleObj.isload = true;
                }
            });
        },

        // 时间转换
        timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
            var year_str = '<span>'+year+'</span>'
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
            month = month > 9 ? month : '0' + month
            var month_str = '<span>'+month+'</span>'
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
            dates = dates > 9 ? dates : '0' + dates
            var dates_sta = '<span>'+dates+'</span>'
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
            minute = minute > 9 ? minute : '0' + minute;
			// var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month_str + '月' + dates_sta + '日' ;
    
            let tomorrow = parseInt(new Date().setHours(0, 0, 0, 0).valueOf() / 1000) + 86400
            tomorrow = new Date(tomorrow * 1000)
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}else if(tomorrow.toDateString()=== date.toDateString()){
                datestr = '明天'
            }else if(year != now.getFullYear()){
                datestr = year_str + '年' + datestr
            }
            const str =  hour > 12 ? '下午' : '上午';
            hour = hour > 12  ? hour - 12 : hour
			datestr = datestr + '('+ weekDay[day] + ')'+ ' ' + str  + '<span>'+  hour +  ':' + minute +'</span>';

			return datestr;
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
            } else if(n == 6){
                const year_now = new Date().getFullYear();
                let str = year + '/' + month + '/' + day + ' ' + hour + ':' + minute 
                if(year_now == year){
                    str = month + '/' + day + ' ' + hour + ':' + minute 
                }
                return str;
            } else if(n == 7){
                return (year + '/' + month + '/' +  day );
            }else {
                return 0;
            }
        },

        // 隐藏资质
        hidezizhiBox(){
            const that = this;
            $('.zizhiBox').hide()
        },

        // 续费套餐
        renew_tc(){
            const that = this;
            jobPop.renewFee(combo_id,1)
        },

        // // 验证是否是商家
        // checkCompanyInfo(){
        //     const that = this;
        //     if(job_cid == '0'){
        //         return false
        //     }
        // }

        checkState(type,job){ //job表示是否发布过职位，并且已审核
            let text = ''
            switch (type){
                case 'resume':
                    text = '简历管理';
                    break;
                case 'interview':
                    text = '面试管理'
                    break;
                case 'jobfair' :
                    text = '招聘会管理'
                    break;
                case 'interested' :
                    text = '对我感兴趣'
                    break;
            }
            if(job_cid == '0'){
                location.href = masterDomain + '/supplier/job/company_info.html?direct=1&appFullScreen';
                return false;
            }

            let options = {
                title:'企业资料' + (company_state ? '审核未通过' : '审核中'),
                confirmTip:'企业资料审核通过后，即可进行' + text,
                btnSure:'好的',
                btnColor:'#3C7CFF',
                popClass:'myConfirm',
                isShow:true,
            }
            if(job){

                options = {
                    title:'请先发布招聘职位',
                    confirmTip:'发布职位后，即可下载简历获取联系方式、 邀请面试等',
                    btnSure:'发布职位',
                    btnColor:'#3C7CFF',
                    popClass:'myConfirm1 myConfirm',
                    btnCancelColor:'#000',
                    isShow:true,
                }
            }
            confirmPop(options,function(){
                if(job){
                    location.href = masterDomain + '/supplier/job/add_post.html'
                }
            })
        }
    },

})