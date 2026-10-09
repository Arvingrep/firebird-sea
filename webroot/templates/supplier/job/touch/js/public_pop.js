var clipboardShare;
var swiperPoster
var jobPop = new Vue({
    el:'#pubPop',
    data:{
        showPackagePop:false, //增值包是否显示
        packagePopType:0, //显示的增值包类型  5-->刷新
        showType:'package',  //package => 增值包   buymeal =>套餐
        expired:7, //过期时间
        chosePopular:{},
        sharePop:false,
        shareObj:{}, //分享对象
        shareType:'poster', //qrCode 显示二维码  poster  显示海报
        posterData:[], //海报类型列表
        loadPoster:false, //是否正在加载
        posterChosed:'', //选择大海报类型
        posterShowPop:false, //海报生成展示
        posterUrl:'', //海报url
        postLoading:false, //海报loading
        posterType:'', //海报类型
        postChosedArr:[], //选中的职位
        postidArr:[], //选中的职位id
        postList:[], //职位列表
        choseJobPop:false, //职位选择弹窗
        currChosedJobs:[], //当前职位弹窗选中的职位
        timer:'',  //定时器
        touchTime:0,  //触摸时间
    },
    mounted(){
        const that = this;

        $("#pubPop .packageBox .popCon .itemWrap").each(function(){
            if($(this).find('.itemUl li').length == 0){
                console.log($(this).index())
                $(".pageBox .singlePackage .package_li").eq($(this).index()).remove()
            }
        })

        
    },
    methods:{
        touchstartFn(){
            let tt=this;
            //清除定时器，并重新计时
            clearInterval(tt.timer);
            tt.touchTime=0;
            //长按计时开始
            tt.timer=setInterval(() => { 
                ++tt.touchTime;
                console.log(tt.touchTime);
                //达到8毫秒
                if (tt.touchTime >= 8) {
                    clearInterval(tt.timer);
                    longPressPoster();
                }
            }, 100);
        },
        touchendFn(){
            let tt=this;
            clearInterval(tt.timer);
            if(tt.touchTime>=8){
                longPressPoster();
            }
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
            }else {
                return 0;
            }
        },

        // 提交订单
        renewFee(id,type){  //type  商品类型{1.套餐，2.增值包，3.简历}

            var tt = this;
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

            if(type == 2 && !combo_id){
                showErrAlert('请先开通招聘套餐')
            }

            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        var sinfo = data.info;
                        payVue.paySuccessCall = function(){
                            showErrAlert('支付成功','success');
                            if(typeof(pageVue) != 'undefined' && pageVue.initData ){
                                pageVue.initData();
                            }else{
                                jobPop.showPackagePop = false
                            }
                        }
                        payVue.closePayPopCall = function(){
                            payVue.cancelpay(); //直接取消
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
                    }
                },

            })
        },


        // 获取模板
        getPosterList:function(){
            const that = this;
            if(that.loadPoster) return false
            that.loadPoster = true;
            // 海报类型
            $.ajax({
                url: '/include/ajax.php?',
                data: {
                    service: 'job',
                    action: 'getPosterTemplate',
                    type:that.posterType ? that.posterType : ''
                },
                dataType: 'json',
                success: (res) => {
                    that.loadPoster = false;
                    if (res.state == 100 && res.info.length > 0) {
                        let data = [];
                        for (let i = 0; i < res.info.length; i++) {
                            res.info[i].litpic = huoniao.changeFileSize(res.info[i].litpic, 320, 700);
                            data.push(res.info[i]);
                        }
                        that.posterData = res.info;
                        that.posterb = true
                        that.$nextTick(() => {
                            setTimeout(() => {
                                swiperPoster = new Swiper(".posterPopBox .posterModel .swiper-container", {
                                    slidesPerView: 'auto',
                                    spaceBetween: 0,
                                });
                            }, 500);
                        })
                    } else {
                        alert(res.info);
                    }
                }
            });
        },

        // 生成海报
        showPoster(item){
            const that = this;
            that.postLoading = true;
            that.posterShowPop = true;
            that.posterUrl = '';
            toggleDragRefresh('off'); 
            $.ajax({
                url: '/include/ajax.php?service=job&action=makePoster',
                data: {
                    id:that.posterType == 'post' ? that.shareObj.id : that.postidArr.join(','),
                    mid:item.id,
                    type:((that.posterType == 'post') || that.postidArr.length == 1) ? 'post' : 'company'
                },
                type:'POST',
                dataType:'json',
                success: (res) => {
                    that.postLoading = false;
                    if(res.state == 100){
                        that.posterUrl = res.info.url;
                        localStorage.setItem('huoniao_poster',res.info.url); //海报地址保存
                    }
                }
            });
        },
        // 关闭海报展示弹窗
        closePoster(){
            const that=this;
            that.posterShowPop = false; 
            that.postLoading = false;
            toggleDragRefresh('on');
        },
        // 修改图片尺寸
        changeFileSize(url,w,h){
            // return huoniao.changeFileSize(url,303)
            return url
        },

        // 获取职位列表
        getPostArr(){
            const that = this;
            if(that.postList.length > 0) return false; //已加载过
            $.ajax({
                url: '/include/ajax.php?service=job&action=postList&pageSize=9999999&com=1&state=1' ,
                dataType: 'json',
                success: (res) => {
                    if(res.state == 100){
                        that.postList = res.info.list;
                        let idArr = [];

                        if(res.info.list.length > 8){
                            that.postChosedArr = res.info.list.slice(0,8)
                            that.currChosedJobs = res.info.list.slice(0,8)
                        }else{
                            that.postChosedArr = res.info.list
                            that.currChosedJobs = res.info.list
                        }

                    }
                }
            });
        },

        // 获取职位名称
        getPostTit(){
            const that = this;
        
            let postNameArr = that.postChosedArr.map(item => {
                return item.title
            })
            return postNameArr.join(',')
        },

        choseJobToPoster(item){
            const that = this;
            let idArr = that.currChosedJobs.map(item => {
                return item.id
            })
            if(idArr.includes(item.id)){
                that.currChosedJobs.splice(idArr.indexOf(item.id),1)
            }else{
                that.currChosedJobs.push(item)
            }
        },

        // 验证是否选中
        checkChosed(id){
            const that = this;
            let idArr = that.currChosedJobs.map(item => {
                return item.id
            })
            return idArr.includes(id)
        },

        // 验证会员权益
        checkVipRight(){
            const that = this;
            let keepGo = true; //标识符
            const now = parseInt((new Date()).valueOf() /1000)
            let dateOff = combo_enddate != -1 ? (combo_enddate - now) : -1
            let day = parseInt(dateOff / 60 / 60 / 24);
            if(!combo_id){ //不是会员
                keepGo = false;
                that.showPackagePop = true;
                that.showType = 'buymeal'
            }else if(combo_enddate != -1 && day < 8){
                keepGo = false;
                that.showPackagePop = true;
                that.showType = 'keepmeal'
                that.expired = day;
            }

            return keepGo;
        }
    },
    watch:{
        showPackagePop(val){
            const that = this;
            if(val && that.showType == 'package'){
                var type = $("#pubPop .packageBox .popCon").attr('data-type')
                that.$nextTick(() => {
                    let wrap = $("#pubPop .packageBox .itemWrap[data-type='"+that.packagePopType+"']")
                    wrap.find('li').eq(0).click()
                })
            }
        },

        shareObj:{
            deep:true,//true为进行深度监听,false为不进行深度监听
            handler(newVal){
                const that = this;
                let url = that.shareObj.url;
                
                if(userid && url.indexOf('fromShare') <= -1){
                    that.shareObj.url = url + (url.indexOf('?') > -1 ? '&fromShare=' + userid : '?fromShare=' + userid);
                }

                wxconfig["title"] = newVal.title;
                wxconfig["link"] =  url;

                if(that.posterData.length == 0 && !that.loadPoster){
                    that.getPosterList()
                }

                var device = navigator.userAgent;
                if(device.indexOf('huoniao') <= -1){

                    if(!clipboardShare){
                        clipboardShare = new ClipboardJS('.HN_button_link');
                        clipboardShare.on('success', function(e) {
                            showErrAlert('复制成功');  //复制成功
                        });

                        clipboardShare.on('error', function(e) {
                            showErrAlert('复制失败'); //复制失败
                        });
                    }
                }
                
            }
        },

        postChosedArr:function(val){
            const that = this;
            if(val.length){
                let idArr = val.map(item => {
                    return Number(item.id)
                })
                that.postidArr  = idArr;
                if(swiperPoster){
                    setTimeout(() => {
                        swiperPoster.update()
                        
                    }, 1000);
                }
            }
        }
    }
})