var swiper = null;
var checkPayResultDirect = null ; //直接二维码的
var pageVue = new Vue({
    el: '#pageVue',
    data:{
        currResume:{}, //当前简历详情
        myInterviewList:[], //我的面试日程
        interviewTotal:0,  //面试日程总计
        myDeliveryList:{}, //获取投递动态
        fairsList:[], //招聘会
        postList:[], //职位列表
        interview_state:['已面试','已取消','已拒绝','待面试'],
        stateArr:['已投递','被查看','有意向','邀面试','不合适'],
        resumeUpDatePop:false, //升级简历的弹窗
        resumeTabOn:0,
        refresh_tc:[], //刷新套餐
        top_tc:[], //置顶套餐
        delivery_tc:[], //投递套餐
        currTcIndex:0, //当前选择的套餐
        payload:false,
        payForm:{
            paySrc:'', //支付二维码
            payCount:10, //支付金额
        }, //支付相关信息

        payObj:'', //调起支付窗口
        payCodeSupport: (alipay === '1' || wxpay === '1'), //是否支持二维码
        successPop:{
            show:false,
            title:'',
            tip:'',
        }
    },
    mounted(){
        const that = this;
        that.getDefaultResume();    //获取当前默认简历
        that.getMyInterviewList();  //获取面试日程
        that.getMyDeliveryList();   //获取投递状态
        that.getFairsList(); //获取招聘会
        $('.jobSideBar ul').delegate('li','click',function(){
            if($(this).index()>=4){
                if(!that.currResume.id){
                    event.preventDefault();
                    $('.sendpop').show();
                }else if(that.currResume.education.length == 0 || that.currResume.work_jl.length == 0 && that.currResume.work_jy != 0){
                    event.preventDefault();
                    $('.ss-title p').text('您有一份简历待完善');
                    $('.ss-text p').text('完善简历后，才可投递心仪职位！请认真填写哦');
                    $('.ss-btn .cancel').text('暂不完善');
                    $('.ss-btn .certificate').text('继续填写简历');
                    $('.sendpop').show();
                }
            }
        });
    },
    methods:{
        // 获取默认简历
        getDefaultResume(){
            const that = this;

            $.ajax({
                url: '/include/ajax.php?service=job&action=resumeDetail&default=1',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.currResume = data.info;
                        that.getResumeList();
                        if(data.info.type && data.info.type.length){
                            that.getPostList(data.info.type.join(','))
                        }else{
                            that.getPostList()
                        };
                        if(data.info.education.length == 0 || data.info.work_jl.length == 0 && data.info.work_jy != 0){
                            $('.ss-title p').text('您有一份简历待完善');
                            $('.ss-text p').text('完善简历后，才可投递心仪职位！请认真填写哦');
                            $('.ss-btn .cancel').text('暂不完善');
                            $('.ss-btn .certificate').text('继续填写简历');
                            $('.sendpop').show();
                        };
                    }else{
                        if(data.info.indexOf('创建一个简历')!=-1){
							$('.sendpop').show();
						}
                        that.getPostList()
                    }
                    
                },
                error: function () {

                }
            });
        },
        getResumeList(){ //获取我的全部简历
            const that = this;

            $.ajax({
                url: '/include/ajax.php?service=job&action=resumeList&u=1',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        for(let i=0;i<data.info.list.length;i++){
                            if(data.info.list[i].state==1){ //有审核通过的简历
                                $('.auditting').hide();
                                return
                            }
                        };
                    }
                    
                },
                error: function () {

                }
            });
        },
        // 获取我的面试日程
        getMyInterviewList(){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=myInterviewList&page=1&pageSize=2&state=0',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.myInterviewList = data.info.list;
                        that.interviewTotal = data.info.pageInfo.totalCount;
                        if(data.info.list.length == 1){
                            that.$nextTick(() => {
                                setTimeout(() => {
                                    that.drawMap(data.info.list[0])  
                                }, 500);
                            })

                        }
                    }
                    
                },
                error: function () {

                }
            });
        },

        // 获取我的投递动态
        getMyDeliveryList(){
            const that = this
            $.ajax({
                url: '/include/ajax.php?service=job&action=myDeliveryList&batch=0&pageSize=3',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.myDeliveryList = data.info.list
                        
                    }
                    
                },
                error: function () {

                }
            });
        },

        // 招聘会列表
        getFairsList(){
            const that = this
            $.ajax({
                url: '/include/ajax.php?service=job&action=fairs&current=1&page=1&pageSize=1',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.fairsList = data.info.list
                        
                    }
                    
                },
                error: function () {

                }
            });
        },

        timeTrans(timeStr){
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

        // 获取职位推荐
        getPostList(typeid){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=postList&page=1&pageSize=8&type=' + typeid,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.postList = data.info.list
                    }
                    
                },
                error: function () {

                }
            });
        },


        // 获取增值包
        getPackageList(){
            const that = this;
            if(that.refresh_tc.length || that.top_tc.length || that.delivery_tc.length) return false;
            $.ajax({
                type: "POST",
                url: "/include/ajax.php",
                dataType: "json",
                data: {
                    'service': 'siteConfig',
                    'action': 'refreshTopConfig',
                    'module': 'job',
                    'act': 'detail',
                    'userid': userid_, //用户id
                },
                success: function (data) {
                    if (data && data.state == 100) {
                        var refreshSmart = data.info.config.refreshSmart;
                        // 投递套餐
                        that.refresh_tc = [];
                        that.normalRefreshPice = data.info.config.refreshNormalPrice
                        refreshSmart.forEach(function (val) {
                            that.refresh_tc.push({
                                days: val.day, //刷新天数
                                unit: val.unit, //单价
                                countPrice: val.price, //计价
                                fresh: val.times, //每日刷新次数
                                offer: val.offer, //优惠价格
                                rec:val.rec
                            })
                        })
                        
                        
                        // 置顶套餐
                        var topNormal = data.info.config.topNormal;
                        that.top_tc = [];
                        topNormal.forEach(function (val) {
                            that.top_tc.push({
                                days: val.day, //置顶天数
                                unit: val.price, //单价
                                countPrice: val.price, //计价
                                offer: val.offer, //优惠价格
                                rec:val.rec
                            })
                        })
                        var deliveryTop = data.info.config.deliveryTop;
                        // deliveryTop.forEach(val => {
                        //     that.delivery_tc.push({

                        //     })
                        // })
                        that.delivery_tc = deliveryTop

                    }
                }
            })
        },


        // 显示简历升级弹窗
        showResumeUpdatePop(type){
            const that = this;
            if(type == undefined || that.resumeTabOn == type){
                that.resumeUpDatePop = true;
            }else{
                that.resumeTabOn = type; // 续费
            }
            that.getPayInfo(); //获取请求数据
        },


        // 请求支付数据
        getPayInfo(payPop){
            const that = this;
            that.payload = true;
            const optArr = ['smartRefresh','topping','deliveryTop']
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+optArr[that.resumeTabOn]+'&module=job&act=resume&aid='+that.currResume.id+'&amount=&config=' + that.currTcIndex,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.payload = false;
                        var datainfo = [];
                        for (var k in data.info) {
                            datainfo.push(k + '=' + data.info[k]);
                        }
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        that.payForm.paySrc = masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src)
                        that.payForm.payCount = data.info.order_amount; //价格

                        that.payObj = data.info;
                        if(payPop){
                            that.changePayWay(payPop) 
                        }

                        // 验证是否支付成功
                        clearInterval(checkPayResultDirect); 
                        that.checkPaySuccess(data.info.ordernum);
                        $('#refreshTopForm input[name="act"]').val('deliveryTop')
                        $('#refreshTopForm input[name="config"]').val(that.currTcIndex)
                        $('#refreshTopForm input[name="amount"]').val(data.info.amount)
                        $('#refreshTopForm input[name="aid"]').val(that.currResume.id)
                        $('#refreshTopForm input[name="type"]').val(optArr[that.resumeTabOn])
                        // 支付成功之后的回调函数
                        callBack_fun_success = function(){
                            var success_tit = '';
                            var success_tip = '';
                            if(optArr[that.resumeTabOn] == 'smartRefresh'){  //智能刷新
                                success_tit = '智能刷新设置成功！'
                                const currTime = new Date()
                                const hour = currTime.getHours();
                                if(hour >= 8 && hour < 20 ){
                                    success_tip = '已刷新第一次，好工作即将赶来！'
                                }else{
                                    success_tip = '明日8:00刷新第一次，好工作即将赶来！'
                                    
                                }
                                if(that.currResume.refreshBegan != '0'){
                                    success_tip = '';
                                    success_tit = '续费成功！'
                                }
                            }else if(optArr[that.resumeTabOn] == 'topping'){ //简历置顶
                                success_tit = '简历置顶成功！'
                                success_tip = '正在推荐简历给更多HR，注意查收好消息！'

                                if(that.currResume.bid_end != '0'){
                                    success_tip = '';
                                    success_tit = '续费成功！'
                                }
                                
                            }else if(optArr[that.resumeTabOn] == 'deliveryTop'){  //投递置顶
                                success_tit = '购买成功！'
                                success_tip = '快去投递简历使用吧'
                            }
                            that.successPop.title = success_tit;
                            that.successPop.tip = success_tip;
                            that.resumeUpDatePop = false;
                            that.successPop.show = true;
                            if(!that.successPop.tip){
                                setTimeout(() => {
                                    that.successPop.show = false;
                                }, 2000);
                            }
                            that.getDefaultResume();
                        }
                    }
                },
                error: function () { }
            });
        },

        // 修改支付方式 ===> 弹出支付层
        changePayWay(payPop){
            var tt = this;
            if(!tt.payObj) return false; //没有支付信息  不能调起支付弹窗
            var info = tt.payObj;
            // clearInterval(checkPayResult)
            if(!payPop){

                $('.pay_balance').click(); //默认使用余额支付
            }
            orderurl = info.orderurl;
            if(typeof (info) != 'object'){
                location.href = info;
                return false;
            }
            
            cutDown = setInterval(function () {
                $(".payCutDown").html(payCutDown(info.timeout));
            }, 1000)
            
            var datainfo = [];
            for (var k in info) {
                datainfo.push(k + '=' + info[k]);
            }
            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').show();
            if (usermoney * 1 < info.order_amount * 1) {
                $("#moneyinfo").text('余额不足，');
            }else{
                $("#moneyinfo").text('剩余');

            }

            if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                $("#bonusinfo").text('额度不足，可用');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else if( bonus * 1 < info.order_amount * 1){
                $("#bonusinfo").text('余额不足，');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else{
                $("#bonusinfo").text('');
                $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }
            ordernum  = info.ordernum;
            order_amount = info.order_amount;
            $("#ordertype").val('refreshTop');
            $("#service").val('siteConfig');
            service = 'job';
            var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
            $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

            

            // 验证是否支付成功
            clearInterval(checkPayResult); 
            checkTradeResult(tt.payObj.ordernum)
        },
        // 关闭投递弹窗
        closePopFn() {
            $('.sendpop').children().css({ 'animation': 'bottomFadeOut .3s' });
            setTimeout(() => {
                $('.sendpop').hide();
                $('.s-certificate').css({ 'animation': 'topFadeIn .3s' });
            }, 280);
        },

        // 验证是否支付成功
        checkPaySuccess(ordernum){
            
            checkPayResultDirect = setInterval(function () {
                
                $.ajax({
                    type: 'POST',
                    async: false,
                    url: '/include/ajax.php?service=member&action=tradePayResult&order=' + ordernum,
                    dataType: 'json',
                    success: function (str) {
                        if (str.state == 100 && str.info != "") {
                            //如果已经支付成功，则跳转到会员中心页面
                            clearInterval(checkPayResultDirect)
                            $('.payMask,.payPop').hide();
                            if(callBack_fun_success){
                                callBack_fun_success()
                            }
                        }
                    }
                });
    
            }, 2000);
        },

        // 画地图
        drawMap(detail){
            const that = this;
            const pageData = {
                lng : detail.job.job_addr_detail.lng,
                lat : detail.job.job_addr_detail.lat,
                address:detail.job.job_addr_detail.address,
                title:detail.companyTitle
            }
            let map = new BMap.Map("map", {enableMapClick: false});
            point = new BMap.Point(pageData.lng, pageData.lat);
            setTimeout(function(){
                map.centerAndZoom(point, 13);
            }, 500);
            var labelStyle = {
                color: "#fff",
                borderWidth: "0",
                padding: "0",
                zIndex: "2",
                backgroundColor: "transparent",
                textAlign: "center",
                fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
            };
            var bLabel = new BMap.Label('<div class="markerBox"><div class="address" title="'+detail.job.job_addr_detail.address+'">'+detail.job.job_addr_detail.address+'</div><div class="marker_customn"></div></div>', {
                position: point,
                offset: new BMap.Size(-10, -10)
            });
            map.addOverlay(bLabel);
            
    
        },


        // 转换时间
        timeTransTime(timeStr,type){
            const dateTime = new Date(timeStr * 1000)
            const hour = dateTime.getHours();
            const minutes = dateTime.getMinutes();
            let str = (hour > 9 ? hour : '0' + hour) + ':' + (minutes > 9 ? minutes : '0' + minutes)
            if(type == 1){
                const curr = parseInt(new Date().valueOf() / 1000);
                const offTime = timeStr - curr;
                if(offTime <= 0){
                    str = 0
                }else{
                    str = Math.ceil(offTime / 86400)
                }
            }
            return str
        },
    },

    watch:{
        refresh_tc:function(val){
            const that = this;
            if(val.length){
                that.$nextTick(() => {
                    if(swiper){
                        swiper.update(1)
                    }else{
                        swiper =  new Swiper(".refreshTC .swiper-container", {
                            slidesPerView: 'auto',
                            // spaceBetween: 30,
                            navigation: {
                                nextEl: ".refreshTC .next",
                                prevEl: ".refreshTC .prev",
                            },
                        });
                    }
                })
            }
        },
        
        // 选择的套餐发生改变
        currTcIndex(val){
            const that = this;
            if(that.payCodeSupport){
                that.getPayInfo();
            }
        },


        // 选择的类型发生改变
        resumeTabOn(val){
            const that = this;
            const arr = ['refresh_tc','top_tc','delivery_tc'];
            that.resumeUpDatePop = true;
            if(that[arr[val]].length){
                that.payForm.payCount = val !== 2 ? that[arr[val]][0].countPrice : that[arr[val]][0].price;
                if(that.payCodeSupport){
                    that.getPayInfo();
                }
            }
            
        },


        // 显示弹窗
        resumeUpDatePop(val){
            const that = this;
            if(val){
                that.getPackageList();
                that.$nextTick(() => {
                    setTimeout(() => {
                        swiper = new Swiper(".refreshTC .swiper-container", {
                            slidesPerView: 'auto',
                            navigation: {
                                nextEl: ".refreshTC .next",
                                prevEl: ".refreshTC .prev",
                            },
                        });
                        
                    }, 500);
                })
            }else{
                swiper.destroy(false);
                clearInterval(checkPayResultDirect);  //清除验证支付是否成功的定时器
            }
        },

        


    }
})