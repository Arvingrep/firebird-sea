var private_phone = null;
private_phone = new Vue({
    el:"#private_phone_container",
    data:{
        if_login:if_login, //是否登录
        phoneCheck:phoneCheck, //手机号是否验证过
        showPrivatePop:false, //手机号绑定弹窗
        showCallPop:false,  //打电话弹窗
        userPhone:userPhone, //加密的真是电话
        userRealPhone:userRealPhone, //电话
        private_phone:'', //虚拟号
        telphone:'', //电话
        phoneCode:'',
        loading:false,
        detail_info:{
            url:"",
            phone_module:'',
            phone_temp:'',
            phone_id:'',
        },
        private_interval:null, //倒计时
        cutDown:'',
        expiredTime:0, //过期时间
        changePhone:false, //是否修改绑定的手机号
        dataGeetest:'',
        areacode:'86',
    },
    mounted(){
        var tt = this;

         // 极验相关
         if(geetest){

            tt.$nextTick(() => {
                captchaVerifyFun.initCaptcha('web','#codeButton',tt.sendVerCode)
            })
        }



        $('body').delegate('.privatePhoneBtn','click',function(event){
            var btn = $(this);
            if(btn.hasClass('disabled')) return false;
            if(btn.hasClass('payPhoneBtn')) return false;  //如果需要先支付

            payPopBtnObj = btn;
            
            var pp_temp = btn.attr('data-temp'),
                pp_mod = btn.attr('data-module'),
                pp_id =  btn.attr('data-id'),
                pp_url =  btn.attr('data-url');
            var tel = btn.attr('data-tel');
            if(cfg_privateNumber_state!='1'){
                var userid = $.cookie(cookiePre+"login_user");
                if(userid == null || userid == ""){
                    huoniao.login();
                    return false;
                }
                btn.find('span').text(tel)
            }else{
                var detailInfo = {};
                // pp_url = pp_url + (pp_url.indexOf('?') > -1 ? '&privatephone=1' : '?privatephone=1')
                detailInfo.url = pp_url != undefined ? pp_url : location.href;
                detailInfo.phone_id = pp_id
                detailInfo.phone_temp = pp_temp;
                detailInfo.phone_module = pp_mod;
                tt.detail_info = detailInfo;
                if(!if_login || !phoneCheck){  //未登录
                    tt.loginPopShow(); //显示短信登录/跳转登录
                }else{
                    tt.callPopShow(detailInfo); //显示电话弹窗
                }
            }
            return false;
            
        })
    },
    methods:{
        // 极验
        // handlerPopupReg:function(captchaObjReg){
        //     // 成功的回调
        //     var t = this;
        //     captchaObjReg.onSuccess(function () {
        //         var validate = captchaObjReg.getValidate();
        //         t.dataGeetest = "&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
        //         t.sendVerCode($('.pp_getCode'));

        //     });
        //     captchaObjReg.onClose(function () {
        //     })

        //     window.captchaObjReg = captchaObjReg;
        // },
        // 登录弹窗显示
        loginPopShow(){
            var tt = this;
                if(cfg_smsLogin_state == '1'){ //开启了短信验证登录
                    tt.showPrivatePop = true;
                }else{
                    location.href = masterDomain + '/login.html';
                    return false;
                }
        },

        // 电话弹窗显示
        callPopShow(item){
            var tt = this;
            tt.detail_info = item;
            if(!if_login || !phoneCheck){
                tt.showPrivatePop = true;
            }else{
                // tt.showCallPop = true;
                tt.loading = true;
                tt.createPrivateNumber()

            }
        },

        useOtherPhone(){
            var tt = this;
            var phone = tt.telphone;
            var code = tt.phoneCode;
            tt.vercode = tt.phoneCode;  //验证码
            tt.createPrivateNumber(1)
        },

        // 创建隐私通话
        createPrivateNumber(type){ 
            //phone_module-----模块code
            //temp-------------二级类目，如：商家为store，信息详情为detail，默认传detail
            //id---------------信息id
            var tt = this;
            var phone_module = tt.detail_info.phone_module,
                temp = tt.detail_info.phone_temp,
                id = tt.detail_info.phone_id,
                vercode = type ? '&vercode=' + tt.vercode : '' ; //验证码
                var phone = type ? tt.telphone : tt.userRealPhone;
            axios({
                method: 'post',
                url: '/include/ajax.php?service=siteConfig&action=createPrivateNumber&module='+phone_module+'&temp='+temp+'&aid='+id+'&areaCode=86&phone='+phone + vercode,
            })
            .then((response)=>{
                var data = response.data;
                if(data.state == 100){
                    // url参数
                    var paramArr = [];
                    
                    tt.expiredTime = data.info.expire;
                    tt.userPhone = data.info.from
                    tt.private_phone = data.info.number;

                    //真实号码
                    if(!data.info.type){
                        payPopBtnObj.find('.showTelNumObj').html(data.info.number);
                        payPopBtnObj.find('.showTelNumObj').closest('.privatePhoneBtn').addClass('disabled');
                        tt.showPrivatePop = false;
                        tt.loading = false;
                        return false;
                    }

                    paramArr.push('privatephone=1')
                    paramArr.push('userPhone='+tt.userPhone)
                    paramArr.push('private_phone='+tt.private_phone)
                    paramArr.push('expire='+tt.expiredTime);
                    paramArr.push('aid='+tt.detail_info.phone_id);
                    paramArr.push('module='+tt.detail_info.phone_module);
                    paramArr.push('temp='+tt.detail_info.phone_temp);
                    tt.detail_info.url = tt.detail_info.url +(tt.detail_info.url.indexOf('?') > -1 ? '&' : '?')+ paramArr.join('&')
                    tt.detail_info.url = encodeURIComponent(tt.detail_info.url)



                    clearInterval(tt.private_interval)
                    tt.cutDown = data.info.expire_second + 's'
                    tt.phone_cutDown(data.info.expire_second);
                    tt.showPrivatePop = false;
                    tt.loading = false;
                    tt.showCallPop = true;


                    
                }else{
                    tt.loading = false;
                    
                    if(data.state == 201){
                        if(cfg_smsLogin_state == '1'){
                            tt.changePhone=false;
                            tt.showCallPop = false;
                            tt.showPrivatePop = true;
                        }else{
                            window.location.href = masterDomain + '/login.html';
                        }
                    }
                    
                    if(data.state == 202){
                        tt.changePhone=true;
                        tt.showCallPop = false;
                        tt.showPrivatePop = true;
                    }

                    if(type && data.state == 101){
                        tt.phoneCode = '';
                    }

                    if(data.state != 201 && data.state != 202){
                        showErrAlert(data.info)
                    }
                }
            })
        },

        // 隐私号倒计时
        phone_cutDown(num){
            var tt = this;
            var time = num;
            tt.private_interval = setInterval(function(){
                if(time > 0){
                    time--;
                    tt.cutDown = time + 's';
                }else{
                    if(!tt.changePhone){
                        tt.showPrivatePop = false; //手机号绑定弹窗
                        tt.showCallPop = false;  //打电话弹窗
                    }
                    clearInterval(tt.private_interval)
                }
            },1000)
        },

        // 获取短信
        getPhoneMsg(){
            var tt = this;
            var btn =  event.currentTarget;
            var phone = tt.telphone,areacode = tt.areaCode;

            if(phone == ''){
                showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
                return false;
            }else if(areacode == "86"){
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if(!phoneReg.test(phone)){
                    showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
                    return false;
                }
            }

             // 不需要极验
             if (!geetest) {
                tt.sendVerCode();
            }else{  //需要验证
                if(geetest == 2){
                    // this.$refs.codeButton.$el.click()
                    document.getElementById('codeButton').click()
                }else{
                    captchaVerifyFun.config.captchaObjReg.verify();
                }
            }
        },

        // 发送验证码
        sendVerCode :function(captchaVerifyParam,callback){
            var tt = this;
            let btn = $('.pp_getCode')
            btn.addClass('noclick');
            var phone = tt.telphone;
            var areacode = tt.areaCode;

            var param = "phone="+phone +"&areaCode="+areacode + tt.dataGeetest;
            if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
            }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
            }
            var codeType = tt.changePhone || (!tt.phoneCheck && if_login) ? "verify":"sms_login"
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&terminal=mobile&type="+codeType,
                data: param,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(callback){
                        callback(data)
                    }
                    //获取成功
                    if(data && data.state == 100){
                        tt.countDown(60, btn);
                        //获取失败
                    }else{
                        btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                        showErrAlert(data.info);
                    }
                },
                error: function(){
                    btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                    showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                }
            });
        },

        // 倒计时
        countDown:function(time, obj, func){
            times = obj;
            obj.addClass("noclick").text(time + 's');  //1s后重新发送
            mtimer = setInterval(function(){
                obj.text(--time + 's');  //1s后重新发送
                if(time <= 0) {
                    clearInterval(mtimer);
                    obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
                }
            }, 1000);
        },

        // 短信登录
        lohin_by_msg:function(btn){
            var tt = this;
            var btn =  event.currentTarget;
            var areaCode = tt.areaCode;
            var phone = tt.telphone;
            var code = tt.phoneCode;
            var loginUrl = "/include/ajax.php?service=member&action=smsLogin&phone=" + phone + "&code=" + code + "&areaCode=" + areaCode;
            // if(tt.appSign.length > 0){
            //     loginUrl += ('&' + t.appSign.join("&"));
            // }

            if(phone == ''){
                showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
                return false;
            }

            if(areaCode == "86"){
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if(!phoneReg.test(phone)){
                    showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
                    return false;
                }
            }

            if(code == ''){
                showErrAlert(langData['siteConfig'][20][28]);//请输入短信验证码
                return false;
            }

            let param = new URLSearchParams();
            param.append('phone', phone);
            param.append('code', code);
            param.append('areaCode', areaCode);
            console.log($(btn))
            console.log($('.private_phone_btn'))
            $(btn).addClass('disabled').text(langData['siteConfig'][55][9]);  //登陆中~
            // // 从小程序过来的
            // if(path){
            //     param.append('path', path);
            //     param.append('wxMiniProgramLogin', wxMiniProgramLogin);
            // }

            tt.loading = true;
            axios({
                method: 'post',
                url: loginUrl,
                data:param,
            })
            .then((response)=>{
                var data = response.data;
                tt.loading = false;
                if(data.state != 100){
                    showErrAlert(data.info);
                    $(btn).removeClass('disabled').text('登录');
                }else{
                    location.reload()
                    tt.showPrivatePop = false;
                    userinfo = data.info;
                    if (device.indexOf('huoniao') <= -1) {
                        if_login = 1
                        phoneCheck = userinfo.phoneCheck;
                        tt.if_login = 1;
                        tt.phoneCheck = userinfo.phoneCheck; //是否验证
                        tt.userPhone = userinfo.phoneEncrypt;
                        tt.userRealPhone = userinfo.phone; //绑定的手机号
                    } 
                  
                }
            });
        },

        bindPhone(){
            var tt = this;
            var phone = tt.telphone;
            var code = tt.phoneCode;
            
            axios({
                method: 'post',
                url: '/include/ajax.php?service=member&action=updateAccount&do=chphone&phone='+phone+'&vdimgck='+code+'&areaCode=86',
            })
            .then((response)=>{
                var data = response.data;
                if(data.state == 100){
                    tt.userPhone  = phone.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
                    tt.userRealPhone  = phone;
                    tt.showPrivatePop = false;
                    tt.showCallPop = true;
                    tt.phoneCheck = 1; //绑定成功
                    // tt.vercode = tt.phoneCode;  //验证码
                    tt.changePhone = false;
                    tt.createPrivateNumber()
                }else{
                    tt.phoneCode = '';
                    showErrAlert(data.info)
                }
            })
        },
    },

    watch:{
        showPrivatePop:function(val){
            console.log(val)
        }
    }
})

var showAlertErrTimer;
function showErrAlert(data) {
    showAlertErrTimer && clearTimeout(showAlertErrTimer);
    $(".popErrAlert").remove();
    $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');

    $(".popErrAlert").css({
        "visibility": "visible"
    });
    showAlertErrTimer = setTimeout(function () {
        $(".popErrAlert").fadeOut(300, function () {
            $(this).remove();
        });
    }, 1500);
}