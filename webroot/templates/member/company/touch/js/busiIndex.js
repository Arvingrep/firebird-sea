var hasModObj = hasModArr && hasModArr != '"No data!"' ? JSON.parse(hasModArr) : {}
var businessConfig = businessConfig ? JSON.parse(businessConfig) : {}
if(!userid){
    location.href = masterDomain + '/login.html'
}
new Vue({
    el:"#page",
    data:{
        mod:mod, //当前要开通的模块,
        allMods: [], //已经购买过的模块
        privileges:[], //已购买的特权
        businessConfig:businessConfig,
        joinTimes:businessConfig.joinTimes || [],
        currModInfo:mod && businessConfig.store && businessConfig.store[mod] || {}, //当前要购买的模块
        youhui:businessConfig.joinSale || [],
        privileges_no:{}, //未购买的特权
        choseTime:'', //当前选择时间

        xu_modInfo:{}, //续费/开通
        xu_choseTime:'', //续费时间
        tabOn:mod ? 0 : 2, //当前选中的tab
        agree:false,
        agreePop:false, //同意弹窗
        slidePop:false, //套餐续费弹窗
        tabArr:['选择套餐','我已开通','我的套餐','其他套餐服务'],
        iconList:[
            {id:1,title:'数据服务',text:'更直观'},
            {id:2,title:'强势推流',text:'海量客户'},
            {id:3,title:'专属店铺',text:'店铺主页'},
            {id:4,title:'内容发布',text:'直通道'},
            {id:5,title:'头像加V',text:'企业v标识'},
            {id:6,title:'特权升级',text:'更超值'},
        ],
        swiperObj:[],
        isVip:false,  //是否是会员
    },
    mounted(){
        const that = this;
        that.solveData()
        // 初次赋值
        that.choseTime = that.joinTimes[0] ;
        that.xu_choseTime = that.joinTimes[0];
        if(!that.currModInfo.title){
            that.currModInfo = mod && businessConfig.privilege && businessConfig.privilege[mod]
        }
        if(that.currModInfo && that.currModInfo.title){
            that.$set(that.currModInfo,'totalAmount',parseFloat((that.currModInfo.price * that.choseTime.times * that.choseTime.discount / 10).toFixed(2)))

        }
        // that.getMemberPackage()
        that.$nextTick(() => {
            var swiper = new Swiper(".mySwiper",{
                slidesPerView: 4,
                pagination: {
                    el: ".pagination",
                    type:"progressbar"
                },
            });
        })
        
        // showErrAlert('<b>开通成功</b>','success','桌位、餐品价格等设置请至电脑端')
        // showErrAlert('开通成功')
    },
    computed:{
        compareYH:function(){
            return function(d){
                const that = this;
                let yh = 0;
                let yhArr = that.youhui.map(item => {
                    let yh_num = 0;
                    if(d >= Number(item.price)){
                        yh_num = item.amount
                    }
                    return yh_num
                })
                yh = Math.max(...yhArr)

                return yh
            }
        },
        // 计算积分
        earnPoint(){
            return function(month){
                const that = this;
                let pointArr = that.businessConfig.joinPoint || [];
                let point = 0;
                let pointObj = pointArr.find(item => {
                    return item.month == month
                })
                point = pointObj && pointObj.point;
                return point;
            }
        },

        // 时间转换
        timeTrans(){
            return function(timestr,n = 2,str = '.'){
                let timeShow = huoniao.transTimes(timestr,n)
                timeShow = timeShow.replace(/-/g,str)
                timeShow = timestr == '0' ? '—' : timeShow
                return timeShow
            }
        },

        // 验证是否过期
        checkExpired(){
            return function(expired,day){
                let now = parseInt(new Date().valueOf() / 1000)
                let offTime = expired - now;
                let offDay = parseInt(offTime / 86400)
                let hasExpired = offDay < day
                return hasExpired
            }
        }
    },
    methods:{
        arrToGroup(arr,num){
            const that = this;
            let result = []; // =>分组结果
            if(!arr || !arr.length) return false;
            for(let i = 0 ; i < arr.length ; i += num){
                result.push(arr.slice(i,i+num))
            }
            return result; 
        },

        // 修改要购买的
        changeTc(item,type = 0){ // 0 => 套餐  1 => 续费 
            const that = this;
            let count =  item.times * item.discount / 10
            if(!type){
                that.choseTime = item
                that.$set(that.currModInfo,'totalAmount',parseFloat((that.currModInfo.price * count).toFixed(2)))
            }else{
                that.xu_choseTime = item
                that.$set(that.xu_modInfo,'totalAmount',parseFloat((that.xu_modInfo.price * count).toFixed(2)))

            }
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
                time:that.choseTime.times
            }
            if(that.slidePop){
                dataPut = {
                    module:that.xu_modInfo.name,
                    time:that.xu_choseTime.times
                }
            }
            
            let privilege = that.privileges.map(item => {
                return item.name
            })
            let modules = that.allMods.map(item => {
                return item.name
            })
            let title = '开通成功',tip = ''
            if(privilege.includes(dataPut.module) || modules.includes(dataPut.module)){
                // 开通过特权
                title = '续费成功'
            }

            if(['diancan','dingzuo','maidan','paidui'].includes(dataPut.module)){
                tip = '桌位、餐品价格等设置请至电脑端'
            }

            $.ajax({
                url: '/include/ajax.php?service=member&action=joinBusinessOrder',
                data:dataPut,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        payVue.paySuccessCall = function(){
                            showErrAlert('<b>'+ title +'</b>','success',tip)
                            setTimeout(() => {
                                location.href = busiDomain;
                            }, 1500);
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
                        $('.payBeforeLoading').hide();
                        showErrAlert(data.info);
                        // shop,renovation,house，tuan   b/config-shop  config-house  
                        // article  u/config-selfmedia.html
                        // dating  /dating/enter_store.html

                        // if(data.info.includes('未入驻')){
                        //     setTimeout(() => {
                        //         location.href = businessUrl + '/config-' + that.mod
                        //     }, 1500);
                        // }
                        // t.removeClass('disabled');
                        // t.html('重新提交');
                    }
                },
                error: function () { }
            });
        },

        // 续费/开通弹窗
        showSlidePop(item){
            const that = this;
            let isiOS = !!navigator.userAgent.match(/(iPhone|iPod|iPad);?/i); //ios终端  
            if(isiOS && iosVirtual && window.wx_miniprogram){
                return false
            }
            if(item.name == 'job'){
                location.href = masterDomain + '/supplier/job/jobmeal.html'
                return false;
            }
            that.slidePop = true;
            that.xu_modInfo = item;
            that.$set(that.xu_modInfo,'totalAmount',parseFloat((that.xu_modInfo.price * that.xu_choseTime.time * item.discount / 10).toFixed(2)))
        },

        // 数据处理
        solveData(){
            const that = this
            let omodules = hasModObj && hasModObj.package && hasModObj.package.item  && hasModObj.package.item.store || [];
            let oprivilege = hasModObj && hasModObj.package && hasModObj.package.item  && hasModObj.package.item.privilege || [];
            let modules = [],privileges = []
            if(omodules.length || (hasModObj.package.modules.store && hasModObj.package.modules.store.length)){ //表示已有买过的模块 => 兼容旧套餐
                if(hasModObj && hasModObj.package && hasModObj.package.item && hasModObj.package.item.store){
                    modules = hasModObj.package.item.store;
                }else{
                    modules = omodules.map(item => {
                        let modCode = item.name;
                        let modInfo = businessConfig.store[mod] || businessConfig.privilege[mod]
                        item['expired'] = hasModObj.package.expired
                        item['price'] = modInfo.price
                        item['mprice'] = modInfo.mprice
                        return item
                    })
                }

                if(hasModObj.package.modules.store ){
                    let jobMod = hasModObj.package.modules.store.find(item => {
                        return item.name == 'job'
                    })

                    if(jobMod){
                        modules.push(jobMod)
                    }
                }
            }

            if(hasModObj && hasModObj.package && hasModObj.package.item && hasModObj.package.item.privilege){
                privileges = hasModObj.package.item.privilege;
            }else{
                privileges = oprivilege.map(item => {
                    let pname = item.name;
                    let pInfo = that.businessConfig.privilege[pname];
                    that.$set(that.businessConfig.privilege,'hasBuy',1)
                    item['expired'] = hasModObj.package.expired;
                    item['price'] = pInfo.price;
                    item['mprice'] = pInfo.mprice;
                    return item
                });
            }
            that.allMods = modules
            let ind = that.allMods.findIndex(item => {
                return item.name == that.mod
            })
            that.isVip = ind > -1 || (!that.mod && that.allMods.length > 0);
            that.privileges = privileges
            let busi = [],net = [],hasOpen = []
            if(that.privileges && that.privileges.length){
                hasOpen = that.privileges.map(item => {
                    return item.name
                })
            }
            for(item in that.businessConfig.privilege){
                let obj = {
                    ...that.businessConfig.privilege[item],
                    name:item
                }

                if(obj.state == 0 && !hasOpen.includes(item)){

                    if(['maidan','diancan','dingzuo','paidui'].includes(item)){
                        busi.push(obj)
                    }else{
                        net.push(obj)
                    }
                }
            }
            that.privileges_no = {
                busi:busi,
                net:net
            }
        },

        // 获取已开通的特权
        getMemberPackage(){
            const that = this;
            //  /include/ajax.php?service=member&action=memberPackage
            $.ajax({
                url: ' /include/ajax.php?service=member&action=memberPackage',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        console.log(data.info)
                    }
                },
                error: function () { }
            });
        },

        changeTab(ind){
            const that = this;
            if(ind < 3){
                that.tabOn = ind
                return false;
            }
        }
    },
})