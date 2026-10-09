
var swiper_tc ,swiper_other;
var swiper_package;
var pageVue = new Vue({
    el:'#page',
    data:{
        loading:false, //加载中
        comboList:[], //套餐列表
        packageList:[],  //增值包
        currItemChose:{}, //当前选择的套餐
        businessInfo:{
            combo_id:combo_id, //套餐id
            combo_job:combo_job, //上架
            package_job:package_job, //上架增值包
            can_resume_down:can_resume_down, //简历
            package_resume:package_resume, //简历增值包
            combo_top:combo_top, //置顶
            package_top:package_top, //置顶增值包
            can_job_refresh:can_job_refresh, //刷新
            package_refresh:package_refresh, //刷新增值包
            combo_wait:combo_wait ? JSON.parse(combo_wait ): ''
        },
        currTab:0,
        changeChoseItem:{}, //要修改的套餐
        showPop:false,
        showType:'tcCon', //change => 更改套餐  tcCon => 显示套餐内容
        showBottom:true, //因此套餐详情
        hasBeVip:combo_id ? true : false, //是否已经是会员
        currCon:{
            ind:0,
            tc:0,
            package:0
        },//当前展示到剩余
        hasGou:false, //是否勾选
    },
    mounted(){
        const that = this;
        that.getComboList(); //获取套餐列表
        that.getPackageList(1); //获取增值包

        // 增值包滑动 
        swiper_package =  new Swiper(".package-container", {
            autoHeight: true, //高度随内容变化
            on:{
                slideChange: function(){
                    that.currTab = this.activeIndex
                },
            }
        });

    },
    methods:{
        // 获取招聘套餐
        getComboList(){
            // /include/ajax.php?service=job&action=comboList&page=1&pageSize=100
            var that = this;
            that.loading = true;
            $.ajax({
                url: '/include/ajax.php?service=job&action=comboList&page=1&pageSize=9999',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.loading = false;
                    if(data.state == 100){
                        let ind = 0
                        that.comboList = JSON.parse(JSON.stringify(data.info.list));
                        if(combo_id){
                            ind = data.info.list.findIndex(item => {
                                return item.id == combo_id
                            })
                            ind = ind > -1 ? ind : 0;
                           that.comboList.splice(ind,1);
                        }
                        console.log(ind, that.comboList,data.info.list);
                        that.currItemChose = data.info.list[ind]
                        that.changeChoseItem = data.info.list[0]
                        
                        that.$nextTick(() => {
                            if($(".tcList").length){

                                swiper_tc = new Swiper(".tcList", {
                                    slidesPerView: 'auto',
                                    spaceBetween: 0,
                                    on:{
                                        touchStart:function(){
                                            if(that.showBottom){
                                                that.showBottom = false;
                                            }
                                        }
                                    }
                                });
                                // swiper_tc.slideTo(ind);
                                
                            }

                            swiper_other = new Swiper(".box-container", {
                                slidesPerView: 'auto',
                                spaceBetween: 0,
                            });
                        })
                    }
                },
                error: function (data) { 
                    that.loading = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
                }
            });
        },

         // 获取当前增值包
        getPackageList(type){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=packageList&type='+type+'&page=1&pageSize=100',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        tt.packageList = data.info.list;
                    }

                    if(tt.packageList.length == 0){
                        tt.currTab = 1
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 权益数
        checkQuanyi(){
            const that = this;
            let num = 0
            for(let item in that.currItemChose){
                if(['job','resume','refresh','top'].includes(item) && that.currItemChose[item] != 0){
                    num++;
                }
            }
            return num
        },

        // 改变tab
        changeTab(id){
            const that = this;
            that.currTab = id;
            swiper_package.slideTo(id)
        },

        // 因此弹窗里的套餐内容
        hideBottom(){
            const that = this;
            that.showBottom = false;
            console.log(111)
        },

        // 续费/购买
        renewFee(id,type,gou){  //type  商品类型{1.套餐，2.增值包，3.简历}

            var tt = this;

            // if(gou && !tt.hasGou){ //需勾选协议
            //     showErrAlert('请先查看并勾选招聘协议');
            //     return false;
            // }

            if(!job_cid){
                let options = {
                    title: '企业资料未完善',    // 提示标题
                    confirmTip:'完善公司基本信息后，即可开通套餐',
                    isShow:true,
                    btnSure:'去完善',
                    noCancel:true,
                }
                confirmPop(options,function(){
                    location.href = masterDomain + '/supplier/job/company_info.html?appFullScreen'
                })
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
                    // mapPop.showErrTipTit = '请先开通招聘套餐';
                    // mapPop.showErrTipText = '套餐内容不够时可使用增值包叠加~';
                    showErrAlert('请先开通招聘套餐')
                return false;
            }

            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        if(type == 1){  //购买套餐
                            payVue.paySuccessCall = function(){
                                let tip = ''
                                if(!combo_id ){
                                    tip = '支付成功，套餐已生效'
                                }else if(combo_id != id){
                                    tip = '支付成功，新套餐套餐已生效'
                                }else{
                                    tip = '续费成功，套餐已生效'
                                }
                                showErrAlert(tip,'success');
                                setTimeout(() => {
                                    location.reload()
                                }, 1500);
                            }
                        }else{
                            payVue.paySuccessCall = function(){
                                showErrAlert('支付成功','success');
                                jobPop.showPackagePop = false
                                if(typeof(timer_trade) != 'undefined'){
                                    clearInterval(timer_trade)
                                }
                            }
                        }
                        var info= data.info;
                        // orderurl = info.orderurl;
                        if(typeof (info) != 'object'){
                            location.href = info;
                            return false;
                        }

                        service = 'job';
						$('#ordernum').val(info.ordernum);
						$('#action').val('pay');

						$('#pfinal').val('1');
						$("#amout").text(info.order_amount);
						$('.payMask').show();
						$('.payPop').css('transform', 'translateY(0)');

						if (totalBalance * 1 < info.order_amount * 1) {

							$("#moneyinfo").text('余额不足，');

							$('#balance').hide();
						}

						if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
							$("#bonusinfo").text('额度不足，');
							$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
						}else if( bonus * 1 < info.order_amount * 1){
							$("#bonusinfo").text('余额不足，');
							$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
						}else{
							$("#bonusinfo").text('');
							$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
						}

						ordernum = info.ordernum;
						order_amount = info.order_amount;
                        payCutDown('', info.timeout, info);

                        
                        
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});

        },

        // 修改套餐
        changeTc(item){
            const that = this;
            var enddate = that.businessInfo.combo_wait.enddate; //以前保留的套餐
            var currDate = parseInt(new Date().valueOf()/1000);
            var days = parseInt((enddate - currDate)/86400);
            const str = enddate == -1 ? '' : '(剩余'+days+'天)'
            var html = that.businessInfo.combo_wait && that.businessInfo.combo_wait.title? '<li><s></s>原来为您保留的<em>'+that.businessInfo.combo_wait.title+'</em>'+str+'将失效</li>' : ''; 
            var ulDom = '<ul class="confirmTip">'+
                        '<li><s></s>购买后新套餐立即生效</li>' + 
                        (that.businessInfo.combo_wait.job > 0 ? '<li><s></s>默认保留最近的<em>'+that.businessInfo.combo_wait.job+'</em>例个职位</li>' : '') + 
                        (item.valid == -1 ? '':'<li><s></s>当前套餐剩余部分在新套餐到期后可继续使用</li>') + 
                        html + 
                        '</ul>';
            let options = {
                title: '确定更换套餐为<b>'+item.title+'</b>',    // 提示标题
                confirmHtml:ulDom,
                isShow:true,
                btnSure:'确定购买',
                btnCancelColor:'#000',
                popClass:'myConfirmPop'
            }
            confirmPop(options,function(){
               that.renewFee(item.id,1); //确认购买 
            })
        },
        
        // 显示增值包弹窗
        showPackagePop(type){    //{1.组合包，2.职位包，3.简历包，4.置顶包，5.刷新包}
            const that = this;
            jobPop.showPackagePop = true
            jobPop.packagePopType = type
            jobPop.showType = 'package'
        },

        // 定位到增值包
        showPackage(){
            const that = this;
            that.showPop = false;
            that.changeTab(1);
            $(window).scrollTop($(".pageBox .packageBox").offset().top)

        },

        // 选择展示
        choseCurrCon(ind){
            const that = this;
            const el = event.currentTarget;
            let tc = $(el).attr('data-tc');
            let package = $(el).attr('data-package');
            that.currCon = {
                tc:tc,
                package:package,
                ind:ind
            }
        },


        //显示修改套餐的弹窗
        showTcChange(ind){
            const that = this;
            that.showPop = true;
            that.showType = 'change';
            that.changeChoseItem = that.comboList[ind];
            setTimeout(() => {
                swiper_tc.slideTo(ind - 1);
            }, 500);
        }
    },

    watch:{
        showBottom:function(val){
            console.log(val)
        }
    }
})