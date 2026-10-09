pics = JSON.parse(pics)
pics.unshift(litpic)
new Vue({
    el:'#MobileGoodInfo',
    data:{
        currentState:Number(currentState), //状态
        time:(enddate * 1000 - new Date().getTime()),
        stime:(startdate * 1000 - new Date().getTime()),
        showRecordPopup:false, //是否显示记录弹窗
        finished:false, //是否加载完毕
        loading:false, //是否加载中
        page:1, //当前页
        list:[], //列表
        showEnsurePopup:false, //是否显示确认弹窗
        chosenAddressId:0, //选中的地址id
        showAddressPicker:false, //是否显示地址选择器
        options:[],
        enddate:huoniao.transTimes(enddate,1), //结束时间
        cur_mon_start:cur_mon_start * 1, //当前出价，
        u_reg:u_reg, //当前拍下的数量实际是，
        mSymbol:echoCurrency('symbol'), //
        amount:amount, //保证金
        id:id, //商品id
        sale_num:sale_num, //成功售卖的件数
        add_money:add_money * 1, //加价
        price_keep:0, //我的价
        currPrice:cur_mon_start , //当前我的价
        paiCount:paiCount, //已经参与竞拍次数

        showImg:false, // 预览图片
        images:pics, //图片列表
        index:0,
        currType:'regist',
        defaultAddress:''
    },
    computed:{
        countTime:function(){
            return function(enddate){
                var tt = this;
                console.log(enddate)
                var endtime = new Date(enddate.replace(/-/g,'/')).getTime();
                var now = new Date().getTime();
                var time = endtime - now;
                return time;
            }
        
        }
    },
    mounted(){
        var tt = this;
        tt.getAddressList()
        tt.price_keep = tt.cur_mon_start * tt.u_reg + tt.add_money;
        wx.miniProgram.postMessage({//
            data: {
                title: wxconfig.title,
                link: wxconfig.link,
                imgUrl: wxconfig.imgUrl,
                desc: wxconfig.description
            }
        })
    },
    methods:{
        onLoad(){
            var tt = this;
            console.log('开始了')
            tt.getGoodPriceList();
        },
        dialog(tit,msg){
            vant.Dialog.alert({
                title: tit,
                message: msg,
            });
        },
        onConfirm(){
            var tt = this;
        },
        // 跳转
        goLink(url){
            window.location.href = url;
        },
        // 商品出价列表
        getGoodPriceList(){
            var tt = this;
            tt.loading = true;
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=prList&pageSize=10&id='+id+'&page='+tt.page,
                // data:{'id':id},
                type:'post',
                dataType:'jsonp',
                success:function(data){
                    if(data.state == 100){
                        tt.list =tt.list.concat(data.info.list);
                        // tt.totalPage = data.info.pageInfo.totalPage;
                        // tt.totalCount = data.info.pageInfo.totalCount;
                        tt.loading = false;
                        tt.page++;
                        tt.loading = tt.finished = data.info.pageInfo.page >= data.info.pageInfo.totalPage;
                       
                    }else{
                        tt.loading = false;
                    }
                },
                error:function(){
                    console.log('网络错误，请稍候重试');
                }
            })
        },


        // 竞拍
        pai(){
            var tt = this;
            var userid = $.cookie(cookiePre + "login_user");
            if (userid == null||userid == "") {
                window.location.href = masterDomain + '/login.html';
                return false;
            }
            var data = {
                id:tt.id,
                money:tt.price_keep,
            }
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=pai',
                data:data,
                type:'post',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        vant.Dialog.alert({
                            message: data.info,
                        }).then(() => {
                            location.reload()
                        });;
                        
                    }else{
                        vant.Dialog.alert({
                            title: '错误提示',
                            message: data.info,
                        });
                    }
                },
                error:function(){
                }
            })
        },


        // 付钱
        toPay(type){
            console.log(type)
            var tt = this;
            var userid = $.cookie(cookiePre + "login_user");
            if (userid == null || userid == "") {
                window.location.href = masterDomain + '/login.html';
                return false;
            }

            var addrStr  = "&addrid=" + tt.chosenAddressId ;
            if(!tt.chosenAddressId){
                showErrAlert('请先选择收货地址')
                return false;
            }
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=deal' + addrStr,
                type:'post',
                data:{
                    id:tt.id,
                    // addrid:address,
                    type:type,
                    num:tt.u_reg,
                },
                dataType:'json',
                success:function(data){
                    sinfo = data.info;
                    if(data.state == 100){

                        if(typeof (data.info) != 'object'){
                            location.href = data.info;
                            return false;
                        }
                        service = 'paimai';
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
                        showErrAlert(data.info)
                    }
                },
                error:function(){}
            })


        },

        // 获取地址列表
        getAddressList(){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=member&action=address',
                data:{'page':1,'pageSize':100},
                type:'post',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        // tt.options = data.info.list;
                        var addressList = data.info.list
                        tt.chosenAddressId = addressList[0].id
                        tt.defaultAddress = addressList[0].address
                        tt.options = addressList.map(function(item){
                            if(item.default == '1'){
                                tt.chosenAddressId = item.id
                                tt.defaultAddress = item.address;
                            }
                            return {
                                id: item.id,
                                name: item.person,
                                tel: item.mobile,
                                address: item.address,
                                isDefault: item.default== '1' ? true : false,
                            }
                        })
                        console.log(tt.options)
                    }
                    
                },
                error:function(){
                    console.log('网络错误，请稍候重试');
                }
            })
        },

        // 点击编辑
        onEdit(row) {
            var url = window.location.href;
            location.href = addreeAdd +'&addressid=' + row.id + '&from=' + encodeURIComponent(url);
        },

        // 点击添加
        onAdd() {
            var url = window.location.href;
            location.href = addreeAdd + '?from=' + encodeURIComponent(url);
        },

        // 选中
        onSelect(row) {
            var tt = this;
            tt.showAddressPicker = false;
            tt.chosenAddressId = row.id;
            tt.defaultAddress = row.address;
            if(tt.currType == 'pai'){
                tt.toPay('pai');
            }
        },

        // 点击swiper-item
        swiperClick(val){
            var tt = this;
            tt.showImg = true; //
        },

        swiperChange(val){
            var tt = this;
            tt.index = val;
        },

        // 显示弹窗
        showPopEnsure(){
            var tt = this;
            var userid = $.cookie(cookiePre + "login_user");
            if (userid == null || userid == "") {
                window.location.href = masterDomain + '/login.html';
                return false;
            }
            tt.showEnsurePopup = true;
        }
    },

    watch:{
         currPrice:function(val){
            var tt = this;
            tt.price_keep = val * tt.u_reg;
        }
    }
})