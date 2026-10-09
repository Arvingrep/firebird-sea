var private_phone = null;
function isInclude(name) {
    var js = /js$/i.test(name);
    var es = document.getElementsByTagName(js ? 'script' : 'link');
    for (var i = 0; i < es.length; i++)
        if (es[i][js ? 'src' : 'href'].indexOf(name) != -1) return true;
    return false;

}
var advInterval = null; //激励广告的定时器
$(function () {

    private_phone = new Vue({
        el: "#private_phone_container",
        data: {
            userRealPhone: userRealPhone,
            userPhone: userPhone, //用户绑定的手机
            if_login: if_login,  //当前用户是否登录
            showPrivatePop: false, //显示弹窗
            showKeyBoard: true, //显示软键盘
            telphone: '', //手机号
            showKeyBoard2: false, //验证码软键盘
            phoneCode: '', //手机验证码
            areaCode: '86', //区号
            showConfirmPop: false, //确认弹窗
            phoneCheck: phoneCheck ? Number(phoneCheck) : 0, //手机是否绑定

            showCallPop: false, //拨打电话弹窗
            telPhone_to: '', //要拨打的电话

            dataGeetest: '',
            loading: false,

            // 创建隐私通话的字段
            phone_module: '',
            phone_temp: 'detail',
            phone_id: '',

            vercode: '', //使用其他手机号登录时需要

            cutDown: '', //倒计时
            private_phone: '', //虚拟号
            private_interval: null, //interval,倒计时的

            changePhone: false, //是否是绑定手机号

            // 通过扫码进入页面
            byScanIn: false, //通过扫码进入页面
            showPrivateScanPop: false, //弹窗显示
            scan_userPhone: '',
            scan_private_phone: '', //扫码
            scan_cutDown: '',
            appConfig:'',
            showRewardPop:false,
            cfg_payPhone:'',
            currency:cfg_currency,
            payInfo:'',
            platform:'h5',
            currBtn:'',
        },
        mounted() {
            var tt = this;
            tt.checkPlatform()
            // 极验相关
            if (geetest) {
                tt.$nextTick(() => {
                    captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)
                })
            }


            tt.getAppConfig(); //获取appConfig
            $('body').delegate('.privatePhoneBtn', 'click', function (event) {
                var btn = $(this);
                tt.currBtn = btn;
                if (typeof (timer_trade) != 'undefined') {
                    clearInterval(timer_trade);
                }

                if (btn.hasClass('disabled')) return false;
                var pp_temp = btn.attr('data-temp'),
                    pp_mod = btn.attr('data-module'),
                    pp_id = btn.attr('data-id');
                    tt.phone_id = pp_id
                    tt.phone_temp = pp_temp;
                    tt.phone_module = pp_mod;
                if (btn.hasClass('payPhoneBtn')){//如果需要先支付
                    let payDetail = {
                        pp_temp:pp_temp,
                        pp_mod:pp_mod,
                        pp_id:pp_id,
                    }
                    
                    tt.getPayInfo(payDetail,btn);
                    return false;
                };  
                
                tt.callPhone_keep(btn)
              


            })

            // 通过扫码进入该页面
            if (tt.getQueryVariable('privatephone') == '1') { //扫码
                tt.byScanIn = tt.getQueryVariable('privatephone');
                tt.scan_userPhone = tt.getQueryVariable('userPhone');
                tt.scan_private_phone = tt.getQueryVariable('private_phone');
                var expiredTime = tt.getQueryVariable('expire');
                var currTime = parseInt(new Date().getTime() / 1000);
                tt.phone_id = tt.getQueryVariable('aid')
                tt.phone_temp = tt.getQueryVariable('temp');
                tt.phone_module = tt.getQueryVariable('module');
                if ((expiredTime - currTime) > 0) {
                    tt.showPrivateScanPop = true
                    tt.scan_cutDown = (expiredTime - currTime) + 's';
                    tt.phone_cutDown((expiredTime - currTime), 1)
                    window.history.replaceState({}, 0, tt.delParam('privatephone'))
                } else {
                    showErrAlert('号码已过期，请重新获取')
                }
            }


            // 携带了订单参数
            if(tt.getQueryVariable('ordernum')){
                let ordernum = tt.getQueryVariable('ordernum')
                tt.getPhoneInfo(ordernum)
            }

        },

        methods: {
            // 极验
            // handlerPopupReg: function (captchaObjReg) {
            //     // 成功的回调
            //     var t = this;
            //     captchaObjReg.onSuccess(function () {
            //         var validate = captchaObjReg.getValidate();
            //         t.dataGeetest = "&geetest_challenge=" + validate.geetest_challenge + "&geetest_validate=" + validate.geetest_validate + "&geetest_seccode=" + validate.geetest_seccode;
            //         t.sendVerCode($('.pp_getCode'));

            //     });
            //     captchaObjReg.onClose(function () {
            //     })

            //     window.captchaObjReg = captchaObjReg;
            // },

            // 发送验证码
            sendVerCode: function (captchaVerifyParam,callback) {
                var tt = this;
                let btn = $('.pp_getCode')
                btn.addClass('noclick');
                var phone = tt.telphone;
                var areacode = tt.areaCode;

                var param = "phone=" + phone + "&areaCode=" + areacode ;
                if(captchaVerifyParam && geetest == 2){
                    param = param + '&geetest_challenge=' + captchaVerifyParam
                }else if(geetest == 1 && captchaVerifyParam){
                    param = param +  captchaVerifyParam
                }
                var codeType = (tt.changePhone || !tt.phoneCheck) && tt.if_login ? "verify" : "sms_login"
                $.ajax({
                    url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&terminal=mobile&type=" + codeType,
                    data: param,
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        if(callback){
                            callback(data)
                        }
                        //获取成功
                        if (data && data.state == 100) {
                            tt.showKeyBoard2 = true
                            tt.showKeyBoard = false;
                            tt.countDown(60, btn);
                            //获取失败
                        } else {
                            btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                            showErrAlert(data.info);
                        }
                    },
                    error: function () {
                        btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                        showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                    }
                });
            },

            // 获取短信验证码
            getPhoneMsg: function () {
                var tt = this;
                var btn = event.currentTarget;
                var phone = tt.telphone, areacode = tt.areaCode;

                if (phone == '') {
                    showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
                    return false;
                } else if (areacode == "86") {
                    var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                    if (!phoneReg.test(phone)) {
                        showErrAlert('请输入正确的手机号码');   //手机号码格式不正确
                        return false;
                    }
                }

                // // 需要极验
                // if (geetest && captchaObjReg) {
                //     captchaObjReg.verify();
                // }

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

            // 登录之前先验证手机号
            loginBefore: function () {
                var tt = this;
                var areaCode = tt.areaCode;
                var phone = tt.telphone;
                var code = tt.phoneCode;
                if (phone == '') {
                    showErrAlert('请先输入手机号');   //请先输入手机号
                    return false;
                }
                if (code == '') {
                    showErrAlert('请先输入验证码');   //请先输入验证码
                    return false;
                }
                if (areaCode == "86") {
                    var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                    if (!phoneReg.test(phone)) {
                        showErrAlert('请输入正确的手机号码');   //手机号码格式不正确
                        return false;
                    }
                }
                tt.showConfirmPop = true;
            },

            // 短信登录
            lohin_by_msg: function (btn) {
                var tt = this;
                var btn = event.currentTarget;
                var areaCode = tt.areaCode;
                var phone = tt.telphone;
                var code = tt.phoneCode;
                var loginUrl = "/include/ajax.php?service=member&action=smsLogin&phone=" + phone + "&code=" + code + "&areaCode=" + areaCode;
                // if(tt.appSign.length > 0){
                //     loginUrl += ('&' + t.appSign.join("&"));
                // }

                if (phone == '') {
                    showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
                    return false;
                }

                if (areaCode == "86") {
                    var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                    if (!phoneReg.test(phone)) {
                        showErrAlert('请输入正确的手机号码');   //手机号码格式不正确
                        return false;
                    }
                }

                if (code == '') {
                    showErrAlert(langData['siteConfig'][20][28]);//请输入短信验证码
                    return false;
                }

                let param = new URLSearchParams();
                param.append('phone', phone);
                param.append('code', code);
                param.append('areaCode', areaCode);
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
                    data: param,
                })
                    .then((response) => {
                        var data = response.data;
                        tt.loading = false;
                        tt.showConfirmPop = false;
                        tt.showPrivatePop = false;
                        if (data.state != 100) {
                            showErrAlert(data.info);
                        } else {
                            location.reload()
                            userinfo = data.info;
                            if (device.indexOf('huoniao') <= -1) {
                                if_login = 1
                                phoneCheck = userinfo.phoneCheck;
                                tt.if_login = 1;
                                tt.phoneCheck = userinfo.phoneCheck; //是否验证
                                tt.userPhone = userinfo.phoneEncrypt;
                                tt.userRealPhone = userinfo.phone; //绑定的手机号
                            }
                            // else {
                            //     setupWebViewJavascriptBridge(function (bridge) {
                            //         bridge.callHandler('appLoginFinish', {
                            //             'passport': userinfo.userid,
                            //             'username': userinfo.username,
                            //             'nickname': userinfo.nickname,
                            //             'userid_encode': userinfo.userid_encode,
                            //             'cookiePre': userinfo.cookiePre,
                            //             'photo': userinfo.photo,
                            //             'dating_uid': userinfo.dating_uid,
                            //             'access_token': userinfo.access_token,
                            //             'refresh_token': userinfo.refresh_token
                            //         }, function () {
                            //         });
                            //         bridge.callHandler('pageReload', {}, function (responseData) {
                            //         });
                            //         setTimeout(function () {
                            //             bridge.callHandler("goBack", {}, function (responseData) {
                            //             });
                            //         }, 200);
                            //     });
                            // }
                        }
                    });
            },

            // 倒计时
            countDown: function (time, obj, func) {
                times = obj;
                obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1', time));  //1s后重新发送
                mtimer = setInterval(function () {
                    obj.text(langData['siteConfig'][20][5].replace('1', (--time)));  //1s后重新发送
                    if (time <= 0) {
                        clearInterval(mtimer);
                        obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
                    }
                }, 1000);
            },

            // 打电话
            callPhone(tel) {
                var tt = this;
                window.location.href = 'tel:' + tel;
                return false;
            },

            // 创建隐私通话
            createPrivateNumber(type) {
                //phone_module-----模块code
                //temp-------------二级类目，如：商家为store，信息详情为detail，默认传detail
                //id---------------信息id
                var tt = this;
                var phone_module = tt.phone_module,
                    temp = tt.phone_temp,
                    id = tt.phone_id,

                    vercode = type ? '&vercode=' + tt.vercode : ''; //验证码
                var phone = type ? tt.telphone : tt.userRealPhone;

                axios({
                    method: 'post',
                    url: '/include/ajax.php?service=siteConfig&action=createPrivateNumber&module=' + phone_module + '&temp=' + temp + '&aid=' + id + '&areaCode=86&phone=' + phone + vercode,
                })
                    .then((response) => {
                        var data = response.data;
                        if (data.state == 100) {
                            tt.showPrivatePop = false;
                            tt.showPrivateScanPop = false;
                            tt.showKeyBoard = false;
                            tt.showKeyBoard2 = false;

                            //真实号码
                            if (!data.info.type) {
                                tt.loading = false;

                                window.location.href = 'tel:' + data.info.number;

                                // tt.showCallPop = true;
                                // tt.private_phone = data.info.number;

                                // $('.private_phone_header').hide();
                                // $('.private_phone_toCallBox p').hide();
                                return false;
                            } else {
                                $('.private_phone_header').show();
                                $('.private_phone_toCallBox p').show();
                            }
                            if(tt.private_interval){
                                clearInterval(tt.private_interval)
                            }
                            tt.cutDown = data.info.expire_second + 's'
                            tt.phone_cutDown(data.info.expire_second);
                            tt.private_phone = data.info.number;
                            tt.loading = false;
                            tt.showCallPop = true;
                            tt.userPhone = data.info.from
                        } else {
                            tt.loading = false;
                            showErrAlert(data.info);
                            if (data.state == 201) {
                                if (cfg_smsLogin_state == '1') {
                                    tt.changePhone = false;
                                    tt.showKeyBoard = true;
                                    tt.showPrivatePop = true;
                                } else {
                                    window.location.href = masterDomain + '/login.html';
                                }
                            }

                            if (data.state == 202) {
                                tt.showPrivatePop = true;
                                tt.showKeyBoard = true;
                                tt.changePhone = true;
                            }
                        }
                    })
            },

            // 隐私号倒计时
            phone_cutDown(num, type) {
                var tt = this;
                var time = num;
                tt.private_interval = setInterval(function () {
                    if (time > 0) {
                        time--;
                        if (type) {
                            tt.scan_cutDown = time + 's';
                        } else {

                            tt.cutDown = time + 's';
                        }
                    } else {
                        if (!tt.changePhone) {
                            tt.showConfirmPop = false;
                            tt.showPrivatePop = false;
                        }
                        if (tt.showPrivateScanPop || tt.showCallPop) {
                            showErrAlert('号码已过期，请重新获取')
                        }
                        tt.showCallPop = false;
                        tt.showPrivateScanPop = false;
                        clearInterval(tt.private_interval)
                    }
                }, 1000)
            },

            bindPhone() {
                var tt = this;
                var phone = tt.telphone;
                var code = tt.phoneCode;

                axios({
                    method: 'post',
                    url: '/include/ajax.php?service=member&action=updateAccount&do=chphone&phone=' + phone + '&vdimgck=' + code + '&areaCode=86',
                })
                    .then((response) => {
                        var data = response.data;
                        if (data.state == 100) {
                            tt.userPhone = phone.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")
                            tt.changePhone = false;
                            tt.userRealPhone = phone;
                            tt.showPrivatePop = false;
                            tt.showCallPop = true;
                            tt.phoneCheck = 1; //绑定成功
                            // tt.vercode = tt.phoneCode;  //验证码
                            tt.createPrivateNumber()
                        } else {
                            showErrAlert(data.info)
                        }
                    })
            },


            useOtherPhone() {
                var tt = this;
                var phone = tt.telphone;
                var code = tt.phoneCode;
                tt.vercode = tt.phoneCode;  //验证码
                tt.createPrivateNumber(1)

            },


            // 展示弹窗
            loginPopShow() {
                var tt = this;
                if (cfg_smsLogin_state == '1') { //开启了短信验证登录
                    tt.showPrivatePop = true;
                    // tt.showKeyBoard = true;
                    // tt.showKeyBoard2 = false;
                    tt.showConfirmPop = false;
                    tt.showCallPop = false;
                } else {
                    location.href = masterDomain + '/login.html';
                    return false;
                }

            },

            // 隐私通话弹窗
            callPopShow() {
                var tt = this;
                tt.createPrivateNumber()
                tt.loading = true;
            },

            // 获取url参数
            getQueryVariable(variable) {
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0] == variable) { return pair[1]; }
                }
                return (false);
            },

            // 删除url指定参数
            delParam(paramKey) {
                var url = window.location.href;    //页面url
                var urlParam = window.location.search.substr(1);   //页面参数
                var beforeUrl = url.substr(0, url.indexOf("?"));   //页面主地址（参数之前地址）
                var nextUrl = "";

                var arr = new Array();
                if (urlParam != "") {
                    var urlParamArr = urlParam.split("&"); //将参数按照&符分成数组
                    for (var i = 0; i < urlParamArr.length; i++) {
                        var paramArr = urlParamArr[i].split("="); //将参数键，值拆开
                        //如果键雨要删除的不一致，则加入到参数中
                        if (paramArr[0] != paramKey) {
                            arr.push(urlParamArr[i]);
                        }
                    }
                }
                if (arr.length > 0) {
                    nextUrl = "?" + arr.join("&");
                }
                url = beforeUrl + nextUrl;
                return url;
            },

            // 获取appConfig
            getAppConfig(){
                const that = this;
                $.ajax({
                    url: "/api/appConfig.json?v=" + (new Date().valueOf()),
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        that.appConfig = data;
                        that.cfg_payPhone = data.cfg_payPhone;
                    },
                    error: function () {
                        
                    }
                });
            },

            checkPlatform(){
                const that = this;
                let device = navigator.userAgent.toLowerCase();
                if(device.match(/micromessenger/)){
                    wx.miniProgram.getEnv(function (res) {
                        wx_miniprogram = res.miniprogram;
                        if(wx_miniprogram){
                            that.platform = 'wxmini'
                        }
                    });
                }else if(device.indexOf('huoniao') > -1 && device.indexOf('android') <= -1){
                    that.platform = 'ios';
                }else if(device.indexOf('huoniao') > -1 && device.indexOf('android') > -1){
                    that.platform = 'android';
                }else{
                    that.platform = 'h5'
                }
            },

            // 获取支付信息
            getPayInfo(paydetail,btn){
                const that = this;
                if (btn.hasClass('disabled')) return false;

                var payPhone_aid = btn.attr('data-id'),
                    payPhone_module = btn.attr('data-module'),
                    payPhone_temp = btn.attr('data-temp');

                btn.addClass('disabled');

                //APP端调用原生
                // if (
                //     device.indexOf('huoniao') > -1 &&
                //     device.indexOf('Android') > -1 &&
                //     appInfo && appInfo.version != '' &&
                //     compare('6.4.1', appInfo.version)
                // ) {
                //     setupWebViewJavascriptBridge(function (bridge) {
                //         bridge.callHandler("privacyCall", { 'module': payPhone_module, 'aid': payPhone_aid, 'temp': payPhone_temp }, function (responseData) {

                //         });
                //     })
                //     return;
                // }

                var userid = $.cookie(cookiePre + "login_user");
                if (userid == null || userid == "") {

                    if (typeof (private_phone) != 'undefined') {
                        private_phone.loginPopShow();
                        setTimeout(function () {
                            $('.private_phone_header p').hide();
                        }, 10);
                    } else {
                        window.location.href = masterDomain + '/login.html';
                    }
                    return false;
                }

                $('.payPop').addClass('payPhonePop');

                if ($('#publicpayform').find('#aid').size() == 0) {
                    $("#publicpayform").append('<input type="hidden" id="aid" name="aid"  value="' + payPhone_aid + '" />');
                } else {
                    $('#publicpayform').find('#aid').val(payPhone_aid);
                }

                if ($('#publicpayform').find('#module').size() == 0) {
                    $("#publicpayform").append('<input type="hidden" id="module" name="module"  value="' + payPhone_module + '" />');
                } else {
                    $('#publicpayform').find('#module').val(payPhone_module);
                }

                if ($('#publicpayform').find('#temp').size() == 0) {
                    $("#publicpayform").append('<input type="hidden" id="temp" name="temp"  value="' + payPhone_temp + '" />');
                } else {
                    $('#publicpayform').find('#temp').val(payPhone_temp);
                }

                $("#ordertype").val('payPhoneDeal');
                $("#publicpayform input[name='service']").val('siteConfig');
                $("#publicpayform input[name='action']").val('payPhoneDeal');

                payPopBtnObj = btn;

                $.ajax({
                    type: 'POST',
                    url: '/include/ajax.php?service=siteConfig&action=payPhoneDeal',
                    dataType: 'json',
                    data: $("#publicpayform").serialize(),
                    success: function (sdata) {
                        that.payInfo = sdata;
                        btn.removeClass('disabled');
                        if (typeof (timer_trade) != 'undefined') {
                            clearInterval(timer_trade);
                        }
        
                        if (sdata && sdata.state == 100) {
                            sinfo = sdata.info;
        
                            if (typeof (sinfo) == 'string' && sinfo.indexOf('已经支付过') > -1) {
        
                                //支付成功并有电话号码返回
                                if (typeof (sinfo.phone) != 'undefined' && sinfo.phone != '') {
        
                                    if (payPhoneVue) {
                                        payPhoneVue.payPhoneNumber = sinfo.phone;
                                        payPhoneVue.payPhoneTitle = sinfo.title;
                                        payPhoneVue.showPayPhonePop = true;
                                    } else {
                                        window.location.href = 'tel:' + sinfo.phone;
                                    }
                                    return false;
                                }
        
                                //如果开启了隐私号码
                                if (cfg_privateNumber_state == '1') {
                                    btn.removeClass('disabled payPhoneBtn');
                                    btn.click();
                                }
                                return;
                            }
                            
                            if(that.cfg_payPhone.wxmini && that.platform == 'wxmini'){
                                that.showRewardPop = true
                            }else if(that.platform == 'android' && that.cfg_payPhone.tencentGDP_app_id  && that.cfg_payPhone.tencentGDP_placement_id){
                                that.showRewardPop = true
                            }else{
                                that.directToPay();
                            }
        
                           
        
                            // validPayPhoneTrade = setInterval(function () {
                            //     checkPayPhoneResult(t, ordernum)
                            // }, 2000)
        
                        } else {
                            btn.removeClass('disabled');
        
                            if (sdata.info == '付费功能未启用！' || sdata.info == '已经支付过，无须重复支付' || sdata.info == '发布人是自己，无须付费！' || sdata.info == '付费金额小于0，无须支付！') {
        
                                //如果开启了隐私号码
                                if (cfg_privateNumber_state == '1') {
                                    btn.removeClass('payPhoneBtn');
                                    btn.click();
        
                                    if (!phoneCheck) {
                                        setTimeout(function () {
                                            $('.private_phone_header h3').html('现在绑定手机，为您使用虚拟号拨出');
                                            $('.private_phone_header p').html('安全保障，保护用户个人隐私');
                                        }, 10);
                                    }
                                } else {
                                    payPopBtnObj.attr('data-tel', sdata.phone);
        
                                    if (payPhoneVue) {
                                        payPhoneVue.payPhoneNumber = sdata.phone;
                                        payPhoneVue.payPhoneTitle = sdata.title;
                                        payPhoneVue.showPayPhonePop = true;
                                    } else {
                                        window.location.href = 'tel:' + sdata.phone;
                                    }
                                }
                            } else {
                                alert(sdata.info);
                            }
                        }

                       
                        
                    },
                    error: function () {
                        btn.removeClass('disabled');
                        alert('网络错误，请重试！');
                    }
                })
            },

            // 直接支付
            directToPay(){
                const that = this;
                that.showRewardPop = false; //隐藏广告弹窗
                let sdata = that.payInfo;
                if (typeof (timer_trade) != 'undefined') {
                    clearInterval(timer_trade);
                }
                let sinfo = sdata.info;
                if(cfg_iosVirtualPaymentState && window.__wxjs_environment == 'miniprogram'){  //是否开启禁用iOS端虚拟支付 
                    let isiOS = !!navigator.userAgent.match(/(iPhone|iPod|iPad);?/i); //ios终端  
                    // confirm弹窗
                    var popOptions = {
                        title: '温馨提示', //'确定删除信息？',  //提示文字
                        btnCancelColor: '#407fff',
                        isShow: true,
                        confirmHtml: '<p style="margin-top:.2rem;">' + cfg_iosVirtualPaymentTip + '</p>', //'一经删除不可恢复',  //副标题
                        btnCancel: '好的，知道了',
                        noSure: true
                    }
                    confirmPop(popOptions);
                    return;
                }

                ordernum = sinfo.ordernum;
                order_amount = sinfo.order_amount;

                service = 'siteConfig';
                $("#service").val('siteConfig');
                $("#amout").text(sinfo.order_amount);
                ordertype = 'payPhone';
                $("#ordertype").val('payPhone');
                $("#publicpayform input[name='action']").val('payPhone');
                $('.payMask,.payPop').show().css({ 'transform-origin': '0px 0px', 'opacity': 1, 'transform': 'scale(1, 1)' });

                if (totalBalance * 1 < sinfo.order_amount * 1) {
                    $("#moneyinfo").text('余额不足，');
                    $("#moneyinfo").closest('.check-item').addClass('disabled_pay')
                    $('#balance').hide();
                }

                if (monBonus * 1 < sinfo.order_amount * 1 && bonus * 1 >= sinfo.order_amount * 1) {
                    $("#bonusinfo").text('额度不足，');
                    $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                } else if (bonus * 1 < sinfo.order_amount * 1) {
                    $("#bonusinfo").text('余额不足，');
                    $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                } else {
                    $("#bonusinfo").text('');
                    $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                }

                ordernum = sinfo.ordernum;
                order_amount = sinfo.order_amount;

                clearInterval(payPopCutDown);
                payCutDown('', sinfo.timeout, sinfo);
            },

            // 直接付费
            callByPay(){
                const that = this;
                that.directToPay()
            },


            // 验证是否支付成功 
            /**
             * ordernum 表示已经看过广告 直接查询 
             * */
			getPhoneInfo(ordernum = null) {
				const that = this
                let btn = that.currBtn;
                $.ajax({
                    url: '/include/ajax.php?service=member&action=tradePayResult&order=' + (ordernum || that.payInfo.info.ordernum),
                    type: "POST",
                    dataType: "json",
                    success: function (data) {
                        if(data.state == 100){
                            clearInterval(advInterval);
                            that.callPhone_keep(that.currBtn,data);
                        }else{
                            console.log(data.info); //支付未成功
                        }
                    },
                    error: function () {
                        btn.removeClass('disabled')
                    }
                });
			},

            // 去看广告
            callBgAdv(){
                const that = this;
                let ordernum = that.payInfo.info.ordernum
                let btn = that.currBtn;
                
                if(that.cfg_payPhone.wxmini && that.platform == 'wxmini'){
                    if(advInterval){
                        clearInterval(advInterval)
                    }
                    btn.removeClass('disabled')
                    setTimeout(() => {
                        that.getPhoneInfo();
                        advInterval = setInterval(() => {
                            that.getPhoneInfo()
                        },1000)
                    }, 5000);
                    that.showRewardPop = false; //关闭
                    wx.miniProgram.navigateTo({ url: '/pages/rewardadv/rewardadv?payPhone_entrance='+that.cfg_payPhone.payPhone_entrance+'&wxmini='+ that.cfg_payPhone.wxmini +'&ordernum=' + ordernum });
                    
                }else if(that.platform == 'android' && that.cfg_payPhone.tencentGDP_app_id  && that.cfg_payPhone.tencentGDP_placement_id){
                    that.showRewardPop = false; //关闭
                    if(advInterval){
                        clearInterval(advInterval)
                    }
                    setupWebViewJavascriptBridge(function (bridge) {
                        bridge.callHandler("playRewardAd", { 'value': ordernum }, function (responseData) { 
                            if(responseData == 'success'){
                                // alert('订单号-'+ordernum)
                                that.getPhoneInfo();
                                advInterval = setInterval(() => {
                                    that.getPhoneInfo()
                                },1000)
                            }
                        });
                    })
                }
            },
            // 支付成功之后 继续拨打电话
            callPhone_keep(btn,data){
                const tt = this;
                if(!btn){
                    btn = tt.currBtn;
                }
                var tel = btn && btn.attr('data-tel') || '';
                if(data){
                    tel = data.phone
                }
                if (cfg_privateNumber_state != '1') {
                    var userid = $.cookie(cookiePre + "login_user");
                    if (userid == null || userid == "") {
                        window.location.href = masterDomain + '/login.html';
                        return false;
                    } else {
                        window.location.href = 'tel:' + tel
                    }
                } else {
                   
                    // 判断是否是app
                    // 判断是否是小程序
                    
                    if(device.indexOf('huoniao') > -1 &&
                    device.indexOf('Android') > -1 &&
                    appInfo && appInfo.version != '' &&
                    compare('6.3', appInfo.version) && tt.cfg_payPhone.tencentGDP_app_id && tt.cfg_payPhone.tencentGDP_placement_id){ //app 并且配置过广告id
                        // setupWebViewJavascriptBridge(function (bridge) {
                        //     bridge.callHandler("privacyCall", { 'module': tt.phone_module, 'aid': tt.phone_id, 'temp': tt.phone_temp }, function (responseData) {

                        //     });
                        // })
                        if (!if_login || !phoneCheck) {  //未登录
                            tt.loginPopShow(); //显示短信登录/跳转登录
                        } else {
                            tt.callPopShow(); //显示电话弹窗
                        }
                    }else{
                        if (!if_login || !phoneCheck) {  //未登录
                            tt.loginPopShow(); //显示短信登录/跳转登录
                        } else {
                            tt.callPopShow(); //显示电话弹窗
                        }
                    }
                    
                }
            },
        },

        watch: {
            phoneCode: function (val) {
                var tt = this;
                if (val.length > 6) {
                    tt.phoneCode = val.substr(0, 6)
                }
            },
            telphone: function (val) {
                var tt = this;
                if (val.length > 11) {
                    tt.telphone = val.substr(0, 11)
                }
            },

            showKeyBoard(val) {
                var tt = this;
                if (!val && !tt.showKeyBoard2) {
                    tt.showPrivatePop = false;
                }
            },
            showKeyBoard2(val) {
                var tt = this;
                if (!val && !tt.showKeyBoard) {
                    tt.showPrivatePop = false;
                }
            },
        }


    })






})


