var swiper;
new Vue({
    el:'#page',
    data:{
        navList:navList,
        currid:9,
        hoverid:'',
        logoUrl:'',
        defaultMeal_icon:templets + 'images/no_meal.png',
        vipMeal_icon:templets + 'images/leve_icon.png',
        tabOn:0, //招聘套餐/增值包 切换
        week:['一','二','三','四','五','六','日'],
        hasBeVip:hasBeVip, //是否购买过套餐
        mealTabOn:0, // 套餐/置顶/刷新
        mealTab:[
            {id:0,name:'套餐'},
            {id:1,name:'置顶'},
            {id:2,name:'刷新'}
        ],
        addValOn:0, //当前所在增值包
        addValArr:[{
            id:0,
            title:'超值优享包',
            text:'全面组合 精准补充',
            icon:'',
        },{
            id:1,
            title:'上架职位',
            text:'企业招聘职位',
            icon:'',
        },
        {
            id:2,
            title:'简历下载',
            text:'捕获更多人才',
            icon:'',
        },
        {
            id:3,
            title:'职位置顶',
            text:'置顶位流量飞升',
            icon:'',
        },
        {
            id:4,
            title:'职位刷新',
            text:'持续稳定曝光',
            icon:'',
        },],

        // 记录
        timeArea:'', //时间筛选
        pickerOptions:{
            // disabledDate: (time) => {
            //     let nowData = new Date()
            //     nowData = new Date(nowData.setDate(nowData.getDate() - 1))
            //     return time >= nowData
            // }
        },
        orderby:2, //排序
        orderArr:[
            {
                value:1,
                label:'按时间正序'
            },
            {
                value:2,
                label:'按时间倒序'
            },
        ],

        recordData:[],
        recordTotalCount:0, //总条数
        optData_1:[], //置顶数据
        optData_2:[], //智能刷新数据


        loading:false, //数据加载中
        businessInfo:'', //当前商家信息
        comboList:[], //套餐列表
        packageList:[],  //增值包
        currItemChose:'', //当前选择的
        page:1, //记录的页码
        onTab:'' , //记录所在 空值是全部  1是置顶中  2是已结束
    },
    mounted(){
        var tt = this;
        if(tt.getUrlParam('tab') && tt.getUrlParam('tab') == '1'){
            tt.tabOn = Number(tt.getUrlParam('tab'));
            tt.currid = 8;
        }else{
            // 获取套餐
            tt.getComboList();
        }
        // 获取商家信息
        tt.getBusinessInfo();        
        
    },

    computed:{
        checkeDate(){
            return function(timeStr,type,str){
                type = type ? type : 2;
                var date = mapPop.transTimes(timeStr,type);
                if(str){
                    date = date.replace(/-/g,'/')
                }
                return date;
            }
        }
    },

    methods:{
        // 以更改套餐为例

        showConfirmPop(item){
            var tt = this;
            var enddate = tt.businessInfo.combo_wait.enddate; //以前保留的套餐
            var currDate = parseInt(new Date().valueOf()/1000);
            var days = parseInt((enddate - currDate)/86400);
            if(days > 0 && days <= 1){
                days = 1;
            }else if(days < 0){
                days = 0;
            }
            // console.log(+tt.businessInfo.combo_wait)
            const str = enddate == -1 ? '' : '(剩余'+days+'天)'
            var html = tt.businessInfo.combo_wait && tt.businessInfo.combo_wait.title? '<li><s></s>原来为您保留的<em>'+tt.businessInfo.combo_wait.title+'</em>'+str+'将失效</li>' : ''; 
            var ulDom = '<ul>'+
                        '<li><s></s>购买后新套餐立即生效</li>' + 
                        (item.job > 0 ? '<li><s></s>默认保留最近的<em>'+item.job+'</em>个职位</li>' : '') + 
                        (item.valid == -1 ? '':'<li><s></s>当前套餐剩余部分在新套餐到期后可继续使用</li>') + 
                        html + 
                        '</ul>';
            mapPop.confirmPopInfo = {
                title:'确定更换套餐为<b>'+item.title+'</b>？',
                tip:ulDom,
                popClass:'mealChangePop',
                btngroups:[
                    {
                        tit:'取消',
                        fn:function(){
                            mapPop.confirmPop = false;
                        },
                        cls:'cancel_btn',
                        type:'primary'
                    },
                    {
                        tit:'确定，继续购买',
                        
                        fn:function(){
                            // 立即购买
                            tt.renewFee(item.id,1);

                            callBack_fun_success = function(){
                                mapPop.confirmPop = false;
                                mapPop.successTip = true;
                                mapPop.successTipText = '支付成功，新套餐已生效！'
                                setTimeout(() => {
                                    // 刷新页面
                                    window.location.reload()
                                }, 2000);

                            }
                        },
                        type:'primary',
                    },
                    
                ]
            }

            mapPop.confirmPop = true;





        },

        // 获取招聘套餐
        getComboList(){
            // /include/ajax.php?service=job&action=comboList&page=1&pageSize=100
            var tt = this;
            tt.loading = true;
            $.ajax({
                url: '/include/ajax.php?service=job&action=comboList&page=1&pageSize=9999',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    tt.loading = false;
                    if(data.state == 100){
                        tt.comboList = data.info.list;
                    }
				},
				error: function (data) { 
                    tt.loading = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 获取增值包
        getpackageList(type){
            var tt = this;
            tt.loading = true;
            tt.packageList = []
            $.ajax({
                url: '/include/ajax.php?service=job&action=packageList&type='+type+'&page=1&pageSize=100',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    tt.loading = false;
                    if(data.state == 100){
                        tt.packageList = data.info.list;
                        tt.currItemChose = tt.packageList[0];
                    }
				},
				error: function (data) { 
                    tt.loading = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 获取商家详情
        getBusinessInfo(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=companyDetail&other_param=addr',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        tt.businessInfo = data.info;
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },


         // 置顶刷新记录
        getRecordList(type){
            var tt = this;
            var param = [];
            var type = tt.mealTabOn;
            param.push('orderby=' + tt.orderby);
            param.push('page=' + tt.page);
            param.push('pageSize=10')
            if(tt.timeArea){
                param.push('start_time=' + parseInt(tt.timeArea[0]/1000))
                param.push('end_time=' + parseInt(tt.timeArea[1]/1000))
            }
            param.push('state=' + tt.onTab);//全部，置顶中，已结束
            var url = '/include/ajax.php?service=job&action=refresh_log'
            if(type == 1){
                url = ' /include/ajax.php?service=job&action=top_log_list'
            }

            $.ajax({
				url: url,
				type: "POST",
				dataType: "jsonp",
                data:param.join('&'),
				success: function (data) {
                    if(data.state == 100){
                        // console.log(data.info)
                        if(type != 1){

                            tt.recordData = data.info.list; //数据
                        }else {
                            tt.recordData = data.info.list.map(function(val){
                                var arr = ['周一','周二','周三','周四','周五','周六','周日'];
                                var noTopArr = []
                                if(val.noTop && val.noTop.length){
                                    noTopArr = val.noTop.map(function(val){
                                        return arr[val - 1];
                                    })
                                }
                                val['noTopArr'] = noTopArr;
                                return val;
                            })
                        }
                        tt.recordTotalCount = data.info.pageInfo.totalCount
                    }else{
                        tt.recordData = []
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 更改页码
        changePage(page){
            var tt = this;
            tt.page = page;
            tt.getRecordList(tt.mealTabOn)
        },

        // 获取正在智能刷新/计划置顶
        getPostOpt(){
            var tt = this;
            if(tt['optData_' + tt.mealTabOn] && tt['optData_' + tt.mealTabOn].length) return false; //已加载过
            var url = '/include/ajax.php?service=job&action=smarty_refresh_list';
            if(tt.mealTabOn == 1){
                url = '/include/ajax.php?service=job&action=top_job_list'
            }
            tt.loading = true;
            $.ajax({
				url: url,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        // tt['optData_' + tt.mealTabOn] = data.info;
                        var dataArr = []
                        if(tt.mealTabOn != 1){
                            for(var i = 0; i <data.info.length; i++){
                                var item = data.info[i];
                                item['lastStr'] = tt.timeStrToDate(item.last)
                                item['nextStr'] = tt.timeStrToDate(item.next)
                                item['startStr'] = tt.timeStrToDate(item.start_date)
                                item['endStr'] = tt.timeStrToDate(item.end_date)
                                dataArr.push(data.info[i])
                            }
                        }else{
                            dataArr = data.info.map((val) => {
                                var arr = ['周一','周二','周三','周四','周五','周六','周日'];
                                var noTopArr = []
                                if(val.noTop && val.noTop.length){
                                    noTopArr = val.noTop.map(function(val){
                                        return arr[val - 1];
                                    })
                                }
                                var cutDown = val.top_less;
                                val['topText'] = tt.changeCutDown(cutDown)
                                var interval = setInterval(function(){
                                    if(cutDown > 0){
                                        val['topText'] = tt.changeCutDown(cutDown)
                                    }else{
                                        clearInterval(interval)
                                    }
                                    cutDown = cutDown - 1;
                                },1000)
                                val['noTopArr'] = noTopArr;
                                return val;
                            })
                        }
                        tt['optData_' + tt.mealTabOn] = dataArr;
                    }
                    tt.loading = false;
				},
				error: function (data) { 
                    tt.loading = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },


        // 续费/购买
        renewFee(id,type){  //type  商品类型{1.套餐，2.增值包，3.简历}

            var tt = this;
            if(!job_cid){
                tt.checkConfig('',8)
                return false
            }
            var paramArr = [];
            if(type){  //提交订单
                paramArr.push('type=' + type);
                if(type === 1){
                    paramArr.push('comboid=' + id)
                }else if(type === 2){
                    paramArr.push('packageid=' + id)
                }else if(type === 3){
                    paramArr.push('rid=' + id)
                }
            }

            // 非会员不能购买增值包
            if(type === 2 && !tt.hasBeVip){
                mapPop.showErrTip = true;
                mapPop.showErrTipTit = '请先开通招聘套餐';
                mapPop.showErrTipText = '套餐内容不够时可使用增值包叠加~';
                return false;
            }



            // if(mapPop){
                

            // }


            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        var info= data.info;
                        // orderurl = info.orderurl;
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
                        $("#ordertype").val('');
                        $("#service").val('job');
                        service = 'job';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

                        if(!callBack_fun_success){

                            if(type != 1 || tt.hasBeVip){  //不是购买套餐的成功回调
                                // 成功之后回调
                                callBack_fun_success = function(){
                                    // 刷新页面
                                    mapPop.successTip = true;
                                    mapPop.successTipText = '支付成功！'

                                    setTimeout(() => {
                                        // 刷新页面
                                        window.location.reload()
                                    }, 2000);
                                }

                            }else{
                                callBack_fun_success = function(){
                                    mapPop.confirmPop = true; 
                                    var tips = mapPop.businessInfo.complete ? '立即开启一站式企业招聘，快速获取人才！' : '建议先完善信息优化企业形象、提升招聘效果！'
                                    var btngroups = [
                                        {
                                            tit:'继续完善资料',
                                            cls:'btn_mid',
                                            fn:function(){
                                                window.open(masterDomain + '/supplier/job/company_info.html')
                                            },
                                            type:'primary'
                                        },
                                        {
                                            tit:'直接发布职位',
                                            cls:'btn_mid',
                                            fn:function(){
                                                window.open(masterDomain + '/supplier/job/add_post.html')
                                            },
                                            type:'primary',
                                        },
                                        {
                                            cls:'btn_sm',
                                            tit:'预览主页',
                                            fn:function(){
                                                open(`${jobChannel}/job/company.html?id=${cid}`)
                                            },
                                        }
                                    ];

                                    if(mapPop.businessInfo.complete){ //信息已完善
                                        btngroups = [
                                            {
                                                tit:'发布职位',
                                                cls:'btn_mid',
                                                fn:function(){
                                                    window.open(masterDomain + '/supplier/job/add_post.html')
                                                },
                                                type:'primary'
                                            },
                                            {
                                                tit:'前往人才库',
                                                cls:'btn_mid',
                                                fn:function(){
                                                    window.open(masterDomain + '/supplier/job/personList.html')
                                                },
                                                type:'primary',
                                            },
                                            {
                                                cls:'btn_sm',
                                                tit:'预览主页',
                                                fn:function(){
                                                    open(`${jobChannel}/job/company.html?id=${cid}`)
                                                },
                                            }
                                        ];
                                    }
                                    mapPop.confirmPopInfo = {
                                        icon:'success',
                                        title:'套餐购买成功!',
                                        tip:tips,
                                        reload:true,
                                        btngroups:btngroups
                                    }


                                    
                                }
                            }
                        }

                        // 失败后回调
                        callBack_fun_fail = function(){
                            // 清空方法
                            // callBack_fun_success = '';
                            // callBack_fun_fail = '';
                            console.log('关闭弹窗'); //不需要跳转
                            return false;
                        }
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});

        },


        // 单项购买刷新/置顶
        showPopularPop(mealTabOn){
            var tt = this;
            mapPop.noSingle = 1;
            mapPop.popularAddPop = true;
            mapPop.popularType = mealTabOn == 1 ? 4 : 5;  
            mapPop.popularTip = '请选择想要购买的增值包';  
            mapPop.businessInfo = tt.businessInfo; 
        },


       // 点左边侧边栏
		checkConfig(item,ind){
			var el = event.currentTarget;
			var url = item ? item.link 
						: $(el).attr('data-url')  ? $(el).attr('data-url') 
						: $(el).attr('href')   ?   $(el).attr('href') : ''
			if(((job_cid && busi_state == 1) || ind <= 3 || 8<=ind) && url){
				window.location.href = (url)
			}else{

				var popTit  =   !job_cid ? '企业资料未完善' 
								:busi_state == 0 ? '企业资料审核中' 
								:busi_state == 2 ? '企业资料审核拒绝' : ''

				var popTip_1 = !job_cid ? '完善公司基本信息后，即可' 
								:busi_state == 0 ? '企业资料审核通过后，即可' 
								:busi_state == 2 ? '请修改企业资料，审核通过后，即可' : ''
				var popTip_2 = item ? (item.txt=='招聘会'?'参加':item.txt=='增值包'?'购买':'进行') + item.txt 
								:ind == 3 ? '发布职位'
								:ind == 9 ? '开通套餐' 
								: '';

				mapPop.confirmPop = true;
				mapPop.confirmPopInfo = {
					icon:'error',
					title:popTit,
					tip:popTip_1 + popTip_2,
					btngroups:[
						{
							tit:'好的，知道了',
							cls:'btn_big',
							fn:function(){
								// window.location.href = masterDomain + '/supplier/job/company_info.html'
								mapPop.confirmPop = false;
							},
							type:'primary'
						},
						
					]
				}

			}
		},

        // 倒计时
        changeCutDown(time){
            var day = parseInt(time / 60 / 60 / 24);
            var hh = parseInt(time / 60 / 60 % 24);
            var mm = parseInt(time / 60 % 60 );
            var ss = parseInt(time % 60 );
            return (day ? day + '天' : '') + (hh <= 9 ? '0' + hh : hh) + ':' + (mm <= 9 ? '0' + mm : mm) + ':' + (ss <= 9 ? '0' + ss : ss);
        },

        // 时间转换
		timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
            var currYear = new Date().getFullYear()
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
			var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates ;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
            if(year != currYear){
                datestr = year + '/' + datestr
            }
			datestr = datestr +'  '+ (hour > 9 ? hour : '0' + hour) +  ':' + (minute > 9 ? minute : '0' + minute);
			return datestr;
		},
        // 获取url参数
        getUrlParam(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },

        toUrl(){
            window.location.href = masterDomain + '/supplier/job/postManage.html'
        },

       
    },

    watch:{
    
        mealTabOn:function(val){
            var tt = this;
            var el = $('.mealTab li[data-id="'+val+'"]');
            var left = el.position().left + el.width()/2 - $('.mealTab .line').width()/2
            $('.mealTab .line').css({'transform':'translateX('+left+'px)'});
            if(!val){
                setTimeout(() => {
                    swiper = new Swiper(".tabConBox .swiper-container", {
                        slidesPerView: 'auto',
                        spaceBetween: 30,
                        pagination: {
                            el: ".swiper-pagination",
                            clickable: true,
                            
                            
                        },
                        navigation: {
                            nextEl: ".tabConBox .next",
                            prevEl: ".tabConBox .prev",
                        },
                    });
                }, 100);
            }else if(swiper && !swiper.destroy){

                swiper.destroy();
            }

            if(val){

                tt.getPostOpt()
                // 记录
                tt.page = 1;
                tt.orderby=2;
                tt.timeArea = '';
                tt.onTab = '',
                tt.recordTotalCount = 0;
                tt.getRecordList(val)
            }
        },

        // 套餐变化
        comboList:function(val){
            var tt = this;

            setTimeout(() => {
                swiper = new Swiper(".tabConBox .swiper-container", {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true,     
                    },
                    navigation: {
                        nextEl: ".tabConBox .next",
                        prevEl: ".tabConBox .prev",
                    },
                });
            }, 50);
        },

        // 套餐和增值包
        tabOn:function(val){
            var tt = this;
            if(val){
                tt.getpackageList(tt.addValOn + 1);
                if(!tt.hasBeVip){ //如果不是会员
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '请先开通招聘套餐';
                    mapPop.showErrTipText = '套餐内容不够时可使用增值包叠加~';
                }
            }else if(!tt.comboList || tt.comboList.length == 0){
                tt.getComboList()
            }
        },

        // 左侧tab切换
        addValOn:function(val){
            var tt = this;
            tt.getpackageList(tt.addValOn + 1)
        },

        // 置顶记录/刷新记录
        onTab:function(val){
            var tt = this;
            tt.page = 1;
            tt.getRecordList();

        },
        

        //时间变化
        timeArea:function(val){
            var tt = this;
            tt.page = 1;
            tt.getRecordList();
        },


        //排序变化
        orderby:function(val){
            var tt = this;
            tt.page = 1;
            tt.getRecordList();
        }

    }
})