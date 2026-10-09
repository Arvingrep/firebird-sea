var businessConfig = businessConfig ? JSON.parse(businessConfig) : {}
new Vue({
    el:'#page',
    data:{
        businessConfig:businessConfig,
        joinTimes:businessConfig.joinTimes || [],
        // youhui:businessConfig.joinSale || [],
        xu_choseTime:'',
        xu_modInfo:{},
        privileges_no:{},
        store:[],
        slidePop:false,
        agreePop:false,
        agree:false,
        serviceList:[], //合作，服务
        topObj:{},
        bottomObj:{},
    },
    mounted(){
        const that = this;
        that.xu_choseTime = that.joinTimes[0];
        that.solveData()
        that.getServiceAdv()
    },
    computed:{
        // 计算积分
        earnPoint(){
            return function(month){
                const that = this;
                let pointArr = that.businessConfig.joinPoint || [];
                let point = 0;
                let pointObj = pointArr.find(item => {
                    return item.times == month
                })
                point = pointObj && pointObj.point;
                return point;
            }
        },
    },
    methods:{
        

        // 修改要购买的
        changeTc(item){
            const that = this;
            that.xu_choseTime = item
            that.$set(that.xu_modInfo,'totalAmount',parseFloat((that.xu_modInfo.price * item.times * that.xu_choseTime.discount / 10).toFixed(2)))
        },
        // 购买模块
        buyModule(){
            const that = this;
            if(!that.agree){
                that.agreePop = true
                $('.payBeforeLoading').hide();
                return false;
            }
            let dataPut = {
                module:that.mod,
                time:that.xu_choseTime.times
            }
            if(that.slidePop){
                dataPut = {
                    module:that.xu_modInfo.name,
                    time:that.xu_choseTime.times
                }
            }
            $.ajax({
                url: '/include/ajax.php?service=member&action=joinBusinessOrder',
                data:dataPut,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        payVue.paySuccessCall = function(){
                            location.href = busiDomain;
                        }

                        if(typeof data.info == 'string' && data.info.indexOf('http') > -1){
                            showErrAlert('支付成功');
                            $('.payBeforeLoading').hide();
                            setTimeout(function(){
                                location.href = data.info;
                            }, 1000);
                            return;
                        }

                        //提交成功，跳转到支付页面
                        sinfo = data.info;
                        service   = 'member';
                        $('#ordernum').val(sinfo.ordernum);
                        $('#action').val('pay');

                        $('#action_1').val('checkJoinPayAmount');
                        $('#action_2').val('joinBusinessPay');

                        $("#paction").val('joinBusinessPay');
                        $("#amout").text(sinfo.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');
                        if (totalBalance * 1 < sinfo.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                            $('#balance').hide();
                        }



                    if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
                        $("#bonusinfo").text('额度不足，');
                        $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                    }else if( bonus * 1 < sinfo.order_amount * 1){
                        $("#bonusinfo").text('余额不足，');
                        $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                    }else{
                        $("#bonusinfo").text('');
                        $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                    }


                        ordernum = sinfo.ordernum;
                        order_amount = sinfo.order_amount;

                        payCutDown('', sinfo.timeout, sinfo);

                    }else{
                        showErrAlert(data.info);
                        // t.removeClass('disabled');
                        // t.html('重新提交');
                    }
                },
                error: function () { }
            });
        },
        // 续费/开通弹窗
        showSlidePop(item){
             let isiOS = !!navigator.userAgent.match(/(iPhone|iPod|iPad);?/i); //ios终端  
            if(isiOS && iosVirtual && window.wx_miniprogram){
                // showErrAlert(cfg_iosVirtualPaymentTip)
                return false
            }
            const that = this;
            that.slidePop = true
            that.xu_modInfo = item;
            that.$set(that.xu_modInfo,'totalAmount', parseFloat((that.xu_modInfo.price * that.xu_choseTime.times * that.xu_choseTime.discount / 10)).toFixed(2) )
        },
        solveData(){
            const that = this;
            let busi = [],net = []
            for(let item in that.businessConfig.privilege){
                let obj = {
                    ...that.businessConfig.privilege[item],
                    name:item
                }
                if(['maidan','diancan','dingzuo','paidui'].includes(item)){
                    if(obj.state == 0){
                        busi.push(obj)
                    }
                }else{
                    if(obj.state == 0){
                        net.push(obj)
                    }
                }
            }
            that.privileges_no = {
                busi:busi,
                net:net
            }

            let i = 0
            for(let item in that.businessConfig.store){
                if(i < 2 ){
                    that.topObj[item] = that.businessConfig.store[item]
                }else{
                    that.bottomObj[item] = that.businessConfig.store[item]

                }
                i++;
                
            }

        },

        // 获取广告位  商家服务_移动端_更多合作服务
        getServiceAdv(){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=adv&model=siteConfig&title=商家服务_移动端_更多合作服务',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.serviceList = data.info.list
                    }
                },
                error: function () { }
            });
        }
      

    }
})