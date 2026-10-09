var pageVue = new Vue({
    el:'#page',
    data:{
        topDays_fee:topDays_fee, //置顶1天的单价
        searchShow:false, //显示搜索
        currTab:1, //当前选择tab
        keywords:'',  //关键字
        tableData:[],
        tabs:[{ tit:'招聘中', num:0, id:1,},{ tit:'待审核', num:0,id:0, },{ tit:'未通过', num:0,id:2 },{ tit:'已下架', num:0, id:3}],
        isload:false,
        page:1,
        loading:false, //数据正在加载中
        loadEnd:false, //是否加载完成
        refreshArr:[], //存放定时器id
        showPop:false, //是否显示弹窗
        showType:'', //弹窗类型  tg => 推广 tgDetail => 推广详情  top => 置顶   refresh =>  智能刷新
        tgDetail:{
            type:'',
            detail:{},
        },
        timeChoseInd:0, //当前选择的时间索引
        timesArr:[{ value:30, unit:'30分钟'},{ value:60, unit:'1小时'},{ value:120, unit:'2小时'},{ value:180, unit:'3小时' },{ value:240, unit:'4小时' },{ value:300, unit:'5小时' }],  //刷新时间
        topAlldays:isNaN(topAlldays) ? 0 : Number(topAlldays), //剩余置顶次数
        top_date:'', //手动填写的置顶天数
        toTopForm:{
            pid:'',
            top_date:1, //置顶天数
            noTopDay:'', //不置顶
            type:4,
            amount:0,
        }, //置顶需要的表单
        noTopDayArr:[],
        weekdays:[{ id:1, 'name':'周一' },{ id:2, 'name':'周二' },{ id:3, 'name':'周三' },{ id:4, 'name':'周四' },{ id:5, 'name':'周五' },{ id:6, 'name':'周六' },{ id:7, 'name':'周日' },],  //不置顶日期
        noTopPop:false, //显示不置顶日期设置的弹窗
        allRefreshDay:isNaN(allRefreshDay) ? 0 : Number(allRefreshDay), //剩余刷新次数
        canJobs:isNaN(canJobs) ? 0 : Number(canJobs), //可以上架的职位
        refreshForm:{
            pid:'',
            start_date:'',  //开始时间 yyyy-MM-DD
            end_date:'',  //结束时间
            interval:30,  //刷新间隔
            limit_start:'00:00', //刷新开始
            limit_end:'24:00', //刷新结束
            type:5, //
            refresh_type:2,

        }, //刷新需要的表单
        start_date:'', //开始时间 ，new Date()格式
        end_date:'', //开始时间 ，new Date()格式
        limit_start:'08:00', //刷新开始
        limit_end:'22:00', //刷新结束
        start_minDate:new Date(),
        end_minDate:new Date(),
        freshStartPop:false, //显示选择开始时间
        freshEndPop:false, //显示选择结束时间
        timeLimitPop:false, //时间限制弹窗
        payInfoObj:'', //相关支付信息       
        payLoad:false, //是否正在请求 
        interval_hour:'', //间隔时间，单位是小时
        inputFocus:false, //是否聚焦
        selfDefineTop:false,

        refreshPop:false,
        refreshPopType:1, //1表示正在智能刷新，2表示次数不够 需要购买
        refreshItem:'',  //当前需要刷新的职位
        freshSuccess:0,  //成功刷新的数

        shortCutOptions:[{value:7,title:'7天'},{value:15,title:'15天'},{value:30,title:'1个月'},{value:60,title:'2个月'},{value:90,title:'3个月'}],
        upPost_valid:'', //上架职位的有效期、
        long_valid:'', //长期有效
        fastChose:false, //快捷选项
        validDays:'', //当前选择的天数
        minDate:new Date(), //最低选择的时间
        validShow:'', //展示的选择的时间
        upPostItem:'',  //要上架的职位

        combo_enddate:combo_enddate, //套餐结束时间
        showUpPostPop:false, //显示职位上架弹窗
        chosePopular:{}, //当前选中的职位
        packageBuy:0, //0是直接购买，1买增值包
        miniprogram:true, //是否在小程序中
    },

    mounted(){
        
        const that = this
        if(tab){
            that.currTab = that.tabs[tab].id; 
            that.$nextTick(() => {
                that.getListBox(1);
            })
        }else{
            that.getListBox(1); 
        }
        $(window).scroll(function() {
            var scrTop = $(this).scrollTop();
            var bh = $('body').height() - 50;
            var wh = $(window).height();
            if (scrTop + wh >= bh && !that.isload) {
                that.getListBox();
            }
        });
        
        if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
            that.miniprogram = true
            that.searchShow = true
        }
    },

    methods:{

        // 初始化数据
        initData(){
            const that = this;
            that.isload = false;
            that.page = 1;
            that.getListBox();

        },

        // 列表数据
        getListBox(first){
            const that = this;
            if(that.isload) return false;  //加载中...
            that.isload = true;
            const paramStr = '&state=' + that.currTab;
            $.ajax({
				url: '/include/ajax.php?service=job&action=postList'+paramStr+'&page='+that.page+'&pageSize=10&com=1&keyword='+that.keywords+'',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					that.isload = false;
                    that.loading = false;
					if(data.state == 100){
                        if(that.page === 1){
                            that.tableData = [];
                        }
                        that.tableData = that.tableData.concat(data.info.list);
                        
                        let firstNodata = data.info['state' + that.currTab] === 0 && first ? true : false;  //首次加载没有数据
                    
                        for(let i = 0; i < that.tabs.length; i++){
                            if(data.info['state' + that.tabs[i].id]){
                                that.tabs[i].num = data.info['state' + that.tabs[i].id];
                                if(firstNodata && that.tabs[i].num ){ //加载第一个有数据的
                                    firstNodata = false;
                                    that.changeTab(that.tabs[i].id)
                                }
                            }
                        }
                        that.page = that.page + 1;
                        if(that.page > data.info.pageInfo.totalPage){
                            that.isload = true;
                            that.loadEnd = true;
                        }
                        
					}else{
                        that.isload= false;
                        that.loadEnd = true;
                        that.tableData = []
                    }

				},
				error: function () { 
                    that.loading = false;
					that.isload = false;
				}
			});
        },

        // 切换状态
        changeTab(id){
            const that = this;
            if(that.currTab === id) return false;
            that.loading = true
            that.currTab = id;
            that.page = 1;
            that.isload = false;
            that.loadEnd = false;
            
            that.getListBox(); //获取数据

        },

        // 显示更多菜单
        showMenu(){
            const that = this;
            const el = event.currentTarget;
            
            if($(el).find('.optBox').hasClass('show')){
                $(el).find('.optBox').removeClass('show');
            }else{
                $('.optBox').removeClass('show')
                $(el).find('.optBox').addClass('show');
            }
            
            const offTop = $(el).offset().top - $(window).scrollTop();
            const offbottom = $(window).height() - offTop;
            if(offbottom   < 300){
                $(el).find('.optBox').css({
                    bottom:'.8rem',
                    top:'auto'
                })
            }else{
                $(el).find('.optBox').css({
                    top:'.8rem',
                    bottom:'auto'
                })
            }

            $(document).one('click',function(){
                $(el).find('.optBox').removeClass('show');
                event.stopPropagation()
            })
            event.stopPropagation();
        },

        // 显示推广详情
        showTgDetailPop(item,type){
            const that = this;
            if(type == 'top' || type === 'refresh'){
                that.showPop = true;
                that.showType = 'tgDetail'
                that.tgDetail.type = type;
                that.tgDetail.detail = item
            }

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
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute );
            }else {
                return 0;
            }
        },

        timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
            month = month > 9 ? month : '0' + month
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
            dates = dates > 9 ? dates : '0' + dates
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
            hour = hour > 9 ? hour : '0' + hour;
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
            minute = minute > 9 ? minute : '0' + minute;
			// var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates ;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
			datestr = datestr + ' ' + hour +  ':' + minute;

			if(type == 1){
				datestr = month + '月' + dates + '日'
			}
			return datestr;
		},

        checkLeft(){
            let left_off = $(".tabBox .on_chose").length ? $(".tabBox .on_chose").offset().left : 0
            const left = left_off + $(".tabBox .on_chose").width() / 2 - $(".tabBox s").width() / 2;
            $(".tabBox s").css({
                left:left
            })
        },

        // 隐藏弹窗
        hidePop(){
            this.showPop = false;
            this.showType = ''
        },

        // 过滤不显示的时间
        timeFilter(type,val){
            let num = val
            if(type == 'minute' ){
                num = val.filter(item => {
                    return item % 10 == 0
                })
            }
            return num;
        },

        confirmTime(){
            const that = this;
            that.refreshForm.limit_end = that.limit_end ? that.limit_end : '24:00';
            that.refreshForm.limit_start = that.limit_start? that.limit_start : '00:00';
            that.timeLimitPop = false;
        },

        // 不限制时间
        noLimit(){
            const that = this;
            that.refreshForm.limit_end = '24:00';
            that.refreshForm.limit_start = '00:00';
            that.timeLimitPop = false;
        },

        // 确认时间
        confirmDate(type){
            const that = this;
            if(type == 'start'){
                that.freshStartPop = false;
                that.end_minDate = that[type + '_date']
            }else{
                that.freshEndPop = false;

            }
            let dateStr = parseInt(that[type + '_date'].valueOf() / 1000);
            that.refreshForm[type + '_date'] = that.transTimes(dateStr,2)
        },

        // 计算时间间隔
        timeOff(start,end){
            const that = this;
            let off = end - start;
            let day = parseInt(off / 86400);
            return day;
        },

        // 获取刷新支付的相关信息
        getPayInfo(){
            const that = this;
            that.loading = true;
            if(!that.tgDetail.detail.id){
                showErrAlert('没有选择职位，请重新选择')
                return false
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=countRefreshAmount&refresh_type=2&pid=' + that.tgDetail.detail.id,
				type: "POST",
				dataType: "json",
                data:that.refreshForm,
				success: function (data) {
                    that.loading = false;
                    if(data.state == 100){
                        that.payInfoObj = data.info;
                    }else{
                        showErrAlert(data.info);
                    }
				},
				error: function (data) { 
                    that.loading = false;
                    showErrAlert(data.info)
				}
			});
        },

        // 调起支付

        showPayPop(type,single,param){ //1.套餐，2.增值包，3.简历，4.职位置顶，5.职位刷新，6.职位上架
            const that = this;
            let paramObj = that.refreshForm;
            if(type === 4){
                paramObj = that.toTopForm;
            }

            if(single || param){  
                paramObj = param
            }

            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramObj,
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        var sinfo = data.info;
                        that.refreshPop = false; //关闭弹窗
                        if(sinfo.order_amount && sinfo.order_amount > 0){ //需要支付 调起支付弹窗
                            payVue.paySuccessCall = function(){
                                if(type == 5){
                                    that.allRefreshDay = that.payInfoObj.count > that.allRefreshDay ? 0 : (that.allRefreshDay - that.payInfoObj.count);
                                }
                                if(type != 6){ //刷新和置顶
                                    that.showPop = false;
                                    showErrAlert('支付成功','success');
                                    setTimeout(() => {
                                        that.page = 1;
                                        that.isload = false;
                                        that.loadEnd = false
                                        that.getListBox()
                                    }, 1500);

                                    if(type == 2){ //购买增值包
                                        that.canJobs = that.canJobs + that.chosePopular.job

                                    }

                                }else{  //上架
                                    that.confirmOffPost(that.upPostItem,0); //付款成功之后 直接上架
                                }
                            }
    
                            
                            service = 'job'
                            $('#ordernum').val(sinfo.ordernum);
                            $('#action').val('pay');
    
                            $('#pfinal').val('1');
                            $("#amout").text(sinfo.order_amount);
                            $('.payMask').show();
                            $('.payPop').css('transform', 'translateY(0)');
    
                            if (totalBalance * 1 < sinfo.order_amount * 1) {
    
                                $("#moneyinfo").text('余额不足，');
    
                                $('#balance').hide();
                            }
                            ordernum = sinfo.ordernum;
                            order_amount = sinfo.order_amount;
                            
                            payCutDown('', sinfo.timeout, sinfo);
                            if(type === 6){ //上架职位
                                $("#payPage .payInfoShow p").html('增加上架1个职位')
                            }
                        }else{
                            if(single && type === 5){
                                showErrAlert('刷新成功','success');
                                that.allRefreshDay = that.allRefreshDay - 1;  
                            }else{
                                if(type == 5){
                                    that.allRefreshDay = that.payInfoObj.count > that.allRefreshDay ? 0 : (that.allRefreshDay - that.payInfoObj.count);
                                }
                                that.showPop = false;
                                showErrAlert('设置成功','success');
                                setTimeout(() => {
                                    that.page = 1;
                                    that.isload = false;
                                    that.loadEnd = false
                                    that.getListBox()
                                }, 1500);
                            }
                        }
                    }
                },
            })
        },

        // 点击职位中的刷新
        refreshPost(item){
            const that = this;
            that.refreshItem = item;
            console.log(item.refreshDetail)
            if(item.is_refreshing){
                that.refreshPop = true;
                that.refreshPopType = 1;
                
            }else if(allRefreshDay == 0){
                that.refreshPop = true;
                that.refreshPopType = 2;
            }else{
                that.directRefresh(item); //普通刷新
            }

            

        },

        // 普通刷新
        directRefresh(item){
            const that = this;
            item = item ? item : that.refreshItem;
            let paramArr = []
            paramArr.push('type=5'); 
            paramArr.push('pid=' + item.id); 
            paramArr.push('refresh_type=1');
            that.showPayPop(5,1,paramArr.join('&'))
        },


        // 刷新全部职位
        refreshAllPost(){
            const that = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=jobRefresh&all=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){ //刷新成功
						if(typeof(data.info) == 'object'){  //部分刷新成功
                            that.freshSuccess = data.info.success
                            that.refreshPop = true;
                            that.refreshPopType = 3;
                        }else{
                            showErrAlert('刷新成功','success')
                            that.allRefreshDay = that.allRefreshDay - that.tableData.length;
                            // console.log(that.allRefreshDay);
                        }
                    }else{
                        let currDate = parseInt(new Date().valueOf() / 1000)
                        if(!combo_id || (currDate > combo_enddate && combo_enddate != -1)){
                            jobPop.showPackagePop = true;
                            if(!combo_id){
                                jobPop.showType = 'buymeal';
                            }else{//到期
                                jobPop.showType = 'keepmeal';
                            }

                        }else{
                            showErrAlert('今日刷新次数已用完，请购买增值包')
                            // 显示增值包购买
                            that.showPackagePop();
                        }


                    }
                }
            })
        },

        // 显示增值包弹窗
        showPackagePop(){
            const that = this;
            jobPop.showPackagePop = true;
            jobPop.packagePopType = 5
            jobPop.showType = 'package'; //显示刷新包
        },

        // 显示推广详情
        showPopDetail(type){
            const that = this;
            console.log(type)
            if(type == 'top' && that.tgDetail.detail && that.tgDetail.detail.is_topping && that.tgDetail.detail.toppingDetail.id && that.tgDetail.detail.toppingDetail.top_end > parseInt(new Date().valueOf() / 1000)){
                that.showType = 'tgDetail'
                that.tgDetail.type = 'top'
            }else if(type === 'refresh' && that.tgDetail.detail && that.tgDetail.detail.is_refreshing &&that.tgDetail.detail.refreshDetail && that.tgDetail.detail.refreshDetail.end_date > parseInt(new Date().valueOf() / 1000)){
                that.showType = 'tgDetail'
                that.tgDetail.type = 'refresh'
            }else{
                that.showType = type
            }
        },

        // 选择不置顶
        choseNoTop(item){
            const that = this;
            
            
            if(that.noTopDayArr.indexOf(item.id) > -1){
                that.noTopDayArr.splice(that.noTopDayArr.indexOf(item.id),1)
            }else{
                that.noTopDayArr.push(item.id)
            }
        
        },

        // 删除职位
        delPost(item){
            const that = this;
            let delOptions = {
                btnSure:'确认删除',
                isShow:true,
                title:'确定删除这条职位？',
                btnColor:'#FF4F38',
                btnCancelColor:'#000',
                confirmTip:'一经删除不可恢复',
                popClass:'delConfirmPop'
            }
            confirmPop(delOptions,function(){
                that.confirmDelPost(item)
            })
        },

        offPost(item,type){ //type有值表示取消上架
            const that = this;
            const tip = item.is_refreshing || item.is_topping ? '该职位的<span style="color:#256CFA;">推广进程(置顶、刷新)将终止</span></br>此操作不可恢复' : '温馨提示：已接收的简历处理不受影响'
            let delOptions = {
                btnSure:'确认下架',
                isShow:true,
                title:'确认下架这条职位？',
                btnColor:'#3377FF',
                btnCancelColor:'#000',
                confirmTip:tip,
                popClass:'delConfirmPop'
            }
            if(type){
                delOptions = {
                    btnSure:'取消上架',
                    isShow:true,
                    title:'确认取消上架这条职位？',
                    btnColor:'#3377FF',
                    btnCancelColor:'#000',
                    // confirmTip:tip,
                    popClass:'delConfirmPop'
                }
            }
            confirmPop(delOptions,function(){
                that.confirmOffPost(item)
            })
        },

        // 重新上架职位
        upPost(item){
            const that = this;
            
            if(that.canJobs){
                let delOptions = {
                    btnSure:'确认上架',
                    isShow:true,
                    title:'确认上架该职位？',
                    btnColor:'#3377FF',
                    btnCancelColor:'#000',
                    confirmTip:'您当前套餐可上架职位数为' + (canJobs_real == -1 ? '不限' : that.canJobs),
                    popClass:'delConfirmPop'
                }
                confirmPop(delOptions,function(){
                    // that.confirmOffPost(item);

                    // 此处应显示选择有效期弹窗
                    that.upPostItem = item; //处于编辑状态
                    that.showPop = true;
                    that.showType = 'valid'
                })
            }else{
                let delOptions = {
                    btnSure:'升级职位数',
                    isShow:true,
                    title:'上架职位数已满',
                    btnColor:'#3377FF',
                    btnCancelColor:'#000',
                    confirmTip:'当前套餐可上架职位数为'+ (combo_job_real == -1 ? '不限' : Number(combo_job_real) + Number(package_job)) +'，请升级职位数 或先下架一些职位',
                    popClass:'delConfirmPop'
                }
                confirmPop(delOptions,function(){
                    // 显示职位上架弹窗
                    var currDate = parseInt(new Date().valueOf() / 1000);
                     // 套餐过期  没购买套餐
                    if(!combo_id || (currDate > combo_enddate && combo_enddate != -1)){
                        console.log('去购买套餐')
                        location.href = masterDomain + '/supplier/job/jobmeal.html?appFullScreen'
                        return false;
                    }
                    that.upPostItem = item;
                    that.showUpPostPop = true; //显示购买职位上架弹窗

                })
            }
        },

        // 长期有效
        longValid(){
            const that = this;
            that.long_valid = 1; 
            that.upPost_valid = '';
            that.validDays = '';
            that.fastChose = true
            // that.hidePop(); //隐藏弹窗
            // if(!that.showUpPostPop){
            //     that.confirmOffPost(that.upPostItem,0)
            // }
        },

        // 关键字搜索
        searchKeyResult(){
            const that = this;
            that.page = 1;
            that.loadEnd = false;
            that.isload = false;
            that.getListBox(); //获取简历
        },

        // 选择有效期天数
        choseDays(item){
            const that = this;
            const time = item.value * 86400;
            that.upPost_valid = parseInt(new Date().valueOf() /1000) + time;
            that.long_valid = '';
            that.validDays = item.value;
            // that.hidePop(); //隐藏弹窗
            // if(!that.showUpPostPop){
            //     that.confirmOffPost(that.upPostItem,0);
            // }
        },

        popConfirm(type,opt){ //fastChose 新增 点击确定之后提交
            const that = this;
            if(type == 'valid'){ //选中有效期
                if(!that.fastChose){
                    let now = new Date();
                    let tomorrow = parseInt(new Date(now.toDateString()).getTime().valueOf() / 1000) + 86400 - 1; //今天24点的
                    that.upPost_valid = that.validShow  ? parseInt(that.validShow.valueOf() / 1000) :  tomorrow
                    that.long_valid = 0;
                    that.validDays = ''; //清空
                }
                that.hidePop(); //隐藏弹窗
                if(!that.showUpPostPop){ //直接确定上架
                    that.confirmOffPost(that.upPostItem,0);
                }

            }else if(type == 'noTop'){
                that.toTopForm.noTopDay = that.noTopDayArr.join(',');
                that.noTopPop = false;
            }

        },



        // 确认删除
        confirmDelPost(item){
            const that = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=delPost&id=' + item.id,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        showErrAlert('职位已删除')
                        that.initData()
                    }
				},
				error: function () { 
					that.isload = false;
				}
			}); 
        },


        // 确认下架/上架职位
        confirmOffPost(item,opt){
            const that = this;
            opt = opt === 0  ? 0 : 1;
            let param = ''
            if(!opt){
                param = '&long_valid=' + that.long_valid + '&valid=' + that.upPost_valid
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateOffPost&off='+opt+'&id=' + item.id + param,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
                        if(!opt){
                            that.long_valid = ''
                            that.validDays = '';
                            that.canJobs = that.canJobs - 1;
                            that.showUpPostPop = false; //隐藏弹窗
                            showErrAlert('职位已上架','success')
                        }else{
                            showErrAlert('职位已下架')
                        }
                        that.initData()
                        
                    }
				},
				error: function () { 
					that.isload = false;
				}
			});
        },

        // 选择需要购买的包
        choseCurrItem:function(){
            const that = this;
            const el = event.currentTarget;
            let id = $(el).attr('data-id')
            let type = $(el).attr('data-type')
            let price = $(el).attr('data-price')
            let mprice = $(el).attr('data-title')
            let top = $(el).attr('data-top')
            let job = $(el).attr('data-job')
            let refresh = $(el).attr('data-refresh')
            let resume = $(el).attr('data-resume')
            let buy = $(el).attr('data-buy')
            that.chosePopular = {
                id,
                type,
                price,
                mprice,
                top,
                job,
                resume,
                refresh,
                buy
            }
        },


        // 直接购买上架包
        directBuy(){
            const that = this
            let paramArr  = []
            paramArr.push('type=6'); 
            paramArr.push('num=1'); 
            that.showPayPop(6,'',paramArr.join('&'))
        },

        // 购买增值包
        buyPackage(type){
            const that = this;
            if(!that.chosePopular.id){
                showErrAlert('请选择增值包');
                return false;
            }
            let paramArr = [];
            paramArr.push('type=' + type)
            paramArr.push('packageid=' + that.chosePopular.id)
            that.showPayPop(type,'',paramArr.join('&'))
        },
        
        // 获取不置顶
        checkNoTop(){
            const that = this;
            let weekName = []
            weekName = that.noTopDayArr.map(item =>{
                let nameind = that.weekdays.findIndex(i => {
                    return item == i.id
                })
                return  that.weekdays[nameind].name
            })
            return weekName.join('、')
        },


        // 搜索关键字
        searchKey(){
            if(event.keyCode == 13){
                this.initData()
            }
        },


        // 显示分享弹窗
        showSharePop(item){
            const that = this;
            var device = navigator.userAgent;
            jobPop.shareObj = item;
            jobPop.shareType = '';
            jobPop.posterType = 'post';
            if(device.indexOf('huoniao') <= -1){
                jobPop.sharePop = true;
            }else{
                setupWebViewJavascriptBridge(function(bridge) {
                    bridge.callHandler("appShare", {
                        "platform": "all",
                        "title": item.title,
                        "url": item.url,
                        // "imageUrl": wxconfig.imgUrl,
                        // "summary": wxconfig.description
                    }, function(responseData){
                        var data = JSON.parse(responseData);
                    })
              });
            }
            
        },

        // 推广
        tuiguang(item){
            const that = this;
            // jobPop.checkVipRight(); //验证会员权益
            if(!jobPop.checkVipRight())  return false;
            that.showPop = true;
            that.showType = 'tg'; 
            that.tgDetail.detail = item
        },

        
    },
    watch:{
        tableData(val){
            const that = this;
            that.refreshArr.forEach(val => {
                clearInterval(val)
            })
            that.refreshArr = []
            if(val && val.length && that.currTab === 1){
                that.$nextTick(() => {
                    $(".list_item").each(function(){
                        const t = $(this)
                        const next = t.attr("data-next");
                        const inter = setInterval(() => {
                            const now = parseInt(new Date().valueOf() / 1000);
                            let offTime = next - now;
                            console.log()
                            if(offTime <= 0){
                                offTime = 0;
                                clearInterval(inter)
                            }
    
                            let hour = parseInt(offTime / 60 / 60);
                            hour = hour > 9 ? hour : '0' + hour
                            let min = parseInt(offTime / 60) % 60
                            min = min > 9 ? min : '0' + min
                            let sec = offTime % 60
                            sec = sec > 9 ? sec : '0' + sec;
                            t.find('.fshow').text(hour + ':' + min +':'+ sec)
                        }, 1000);
                        that.refreshArr.push(inter)
                    })
                })
            }
        },

        loading:{
            handler(val){
                if(val){
                    $('html').addClass('noscroll')
                } else{
                    $('html').removeClass('noscroll') 
                }
            },
            immediate:true
        },

        showPop:function(val){
            if(val){
                $('html').addClass('noscroll')
            }else{
                $('html').removeClass('noscroll')
            }
        },
        currTab:{
            handler(val){
                this.$nextTick(() => {
                    this.checkLeft()
                })
            },
            immediate:true,
        },

        // 刷新信息更新
        refreshForm:{
            handler:function(val){
                const that = this;
                if(val.interval && val.start_date && val.end_date){
                    that.getPayInfo()
                }

            },
            deep:true
        },

        showType(val){
            const that = this;
            if(val == 'refresh' || val == 'top'){ //刷新和置顶
                that.refreshForm['pid'] = that.tgDetail.detail.id;
                that.toTopForm['pid'] = that.tgDetail.detail.id;
            }
        },
        
        // 刷新间隔 ==> 手填
        interval_hour(val){
            const that = this;
            // if(!isNaN(val)){
            //     that.refreshForm.interval = parseInt(val * 60)
            // }
            if(val && !isNaN(val) && this.timeChoseInd == this.timesArr.length){
                this.refreshForm.interval = this.interval_hour * 60;
            }
        },

        // 置顶天数 ==> 手填
        top_date(val){
            const that = this;
            if(!isNaN(val)){
                that.toTopForm.top_date = val;
            }else{
                showErrAlert('请输入数字')
            }
            if(val > 999){
                showErrAlert('最多置顶999天')
                that.top_date = 999;
            }
        },

        'toTopForm.top_date':function(val){
            let payDay = 0;
            if(val > this.topAlldays){
                payDay = val - this.topAlldays
            }
            this.toTopForm.amount = payDay * this.topDays_fee; //价格
        },

        showUpPostPop:function(val){
            if(val){
                this.long_valid = '';
                this.upPost_valid = '';
                this.validDays = '';
                
            }
        },

        // 切换时间间隔
        timeChoseInd(val){
            const that = this;
            if(val < that.timesArr.length){
                that.refreshForm.interval = that.timesArr[val].value;
            }else if(that.interval_hour){
                that.refreshForm.interval = that.interval_hour * 60;
            }
        },

        // 置顶显示自定义
        selfDefineTop(val){
            const that = this;
            if(val){
                that.$nextTick(() => {
                    that.$refs.topDate.focus()
                })
            }
        }
      
    }
})