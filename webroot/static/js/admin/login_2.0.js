
var pageUrl = location.href.split('login.php');
pageUrl = pageUrl[0];

$(function () {

    //判断是否为顶级窗体
    if (self.location != top.location) {
        parent.location.href = self.location;
    }

    //登录方式切换
    $('.tabs li').click(function () {
        var t = $(this), index = t.index();
        if (t.hasClass('curr')) return;

        $('.error-msg').html('').hide();
        t.addClass('curr').siblings('li').removeClass('curr');
        $('#login-form .item').hide();
        $('#login-form .item:eq(' + index + ')').show();
        $('#login-form .item:eq(' + index + ')').find('input:eq(0)').focus();
    });

    //其他登录方式
    $('.other p').click(function () {
        var t = $(this);
        $('.error-msg').html('').hide();
        if (t.hasClass('wechat')) {
            $('.tabs li').removeClass('curr').hide();
            $('.tabs .wechat').addClass('curr').css('display', 'inline-block');
            $('#login-form .item, .btn').hide();
            $('#login-form .item:eq(2)').show();

            //判断是否已经加载iframe
            var loginIframe = $('#loginIframe');
            if (loginIframe.attr('src') == '') {
                loginIframe.attr('src', loginIframe.attr('data-src'));
            }

        } else {
            $('.tabs li').removeClass('curr').css('display', 'inline-block');
            $('.tabs .wechat').hide();
            $('.tabs li:eq(0)').addClass('curr');

            $('#login-form .item').hide();
            $('#login-form .item:eq(0), .btn').show();
            $('#login-form .item:eq(0)').find('input:eq(0)').focus();

        }
        t.hide();
        t.siblings('p').show();
    });

    //默认用户名聚焦
    $("#userid").focus();

    $('#pwd').togglePassword({
        el: '#eyes',
        at: 'curr',
        sh: '显示密码',
        hd: '隐藏密码'
    });


    //显示错误信息
    var showErrorMsg = function(info){
        $('.error-msg').html(info).show();
    }

    //隐藏错误信息
    $('#login-form input').bind('input', function(){
        $('.error-msg').html('').hide();
    });


    //短信验证码
    var sendSmsData = [];

    //启用极验
    if (geetest) {
        captchaVerifyFun.initCaptcha('web','#button',sendSmsFunc)    
        $('.send-btn').bind("click", function () {
            if ($(this).hasClass('disabled')) return false;

            var phone = $("#phone").val();

            if (phone == '') {
                showErrorMsg('请输入手机号');
                $("#phone").focus();
                return false;
            }

            if(geetest == 1){
                captchaVerifyFun.config.captchaObjReg.verify();
            }else{
                $('#button').click()
            }
        })
    } 
    //没有使用极验
    else {
        $(".send-btn").bind("click", function () {
            if ($(this).hasClass('disabled')) return false;

            var phone = $("#phone").val();

            if (phone == '') {
                showErrorMsg('请输入手机号');
                $("#phone").focus();
                return false;
            }

            $("#code").focus();
            sendSmsFunc();
        })
    }

    //发送验证码
    function sendSmsFunc(captchaVerifyParam,callback) {
        var phone = $("#phone").val();
        var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";
        sendSmsData = [];
        sendSmsData.push('type=sms_login');
        sendSmsData.push('phone=' + phone);
        let param = sendSmsData.join('&')
		if(captchaVerifyParam && geetest == 2){
			param = param + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
			param = param +  captchaVerifyParam
		}
        $.ajax({
            url: sendSmsUrl,
            data: param,
            type: 'POST',
            dataType: 'json',
            success: function (res) {
                if(callback){
					callback(res)
				}
                if (res.state == 101) {
                    if(res.info != '图形验证错误，请重试！'){
                        showErrInfo(res.info);
                    }
                } else {
                    countDown(60, $('.send-btn'));
                }
            }
        })
    }


    //倒计时
    function countDown(time, obj) {
        obj.html(time + langData['siteConfig'][30][46]).addClass('disabled');   //秒后重发
        mtimer = setInterval(function () {
            obj.html((--time) + langData['siteConfig'][30][46]).addClass('disabled');   //秒后重发
            if (time <= 0) {
                clearInterval(mtimer);
                obj.html(langData['siteConfig'][6][55]).removeClass('disabled');   //重新发送
            }
        }, 1000);
    }

    //登录检测
    $("#login-form").bind("submit", function (event) {
        event.preventDefault();

        var type = $('.tabs .curr').index(),
            data = [];

        data.push('dopost=login');
        data.push('type=' + type);

        //账号密码
        if(type == 0){

            var userid = $.trim($("#userid").val()), pwd = $("#pwd").val();
            if (userid == "") {
                showErrorMsg('请输入账号');
                $("#userid").focus();
                return false;
            }
            if (pwd == "") {
                showErrorMsg('请输入密码');
                $("#pwd").focus();
                return false;
            }

            data.push('userid=' + encodeURIComponent(userid));
            data.push('pwd=' + encodeURIComponent(pwd));

        }

        //手机验证码
        else if(type == 1){

            var phone = $.trim($("#phone").val()), code = $("#code").val();
            if (phone == "") {
                showErrorMsg('请输入手机号');
                $("#phone").focus();
                return false;
            }
            if (code == "") {
                showErrorMsg('请输入验证码');
                $("#code").focus();
                return false;
            }

            data.push('phone=' + phone);
            data.push('code=' + code);

        }
        

        var t = $('.btn');
        t.html("登录中...").attr("disabled", true);
        $.ajax({
            url: "login.php",
            data: data.join('&'),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data.state == 100) {
                    t.html("登录成功，正在进入后台...").attr("disabled", false);
                    gotopage = $("#gotopage").val();
                    if (gotopage != "") {
                        location.href = pageUrl + '?gotopage=' + gotopage;
                    } else {
                        location.href = pageUrl + "index.php";
                    }
                } else if (data.state == 200) {
                    t.html("重新登录").attr("disabled", false);
                    if (data.count >= 5) {
                        showErrInfo('由于您的登录密码错误次数过多，<br />本次登录请求已经被拒绝，请 15 分钟后重新尝试。');
                    } else {
                        showErrInfo(data.info);
                    }
                } else if (data.state == 300) {
                    t.html("重新登录").attr("disabled", false);
                    showErrInfo(data.info);
                };
            },
            error: function(){
                t.html("重新登录").attr("disabled", false);
                showErrInfo('网络错误，请重试！');
            }
        });
    });


    //关闭错误提示
    $('.error-tips').delegate('.close, button', 'click', function(){
        $('.error-tips').hide();
    });

});

//提示错误信息
function showErrInfo(info){
    $('.error-tips .info').html(info);
    $('.error-tips').show();
}

//微信扫码登录回调
function hasBindOtherUser(info){
    if(info == 'success'){
        gotopage = $("#gotopage").val();
        if (gotopage != "") {
            location.href = pageUrl + '?gotopage=' + gotopage;
        } else {
            location.href = pageUrl + "index.php";
        }
    }else{
        showErrInfo(info);
    }
}

console.log("\n%c  菲鸟生活管理后台  %c  FBird SEA © " + (new Date).getFullYear() + "  \n", "color: #fff; background: #3275FA; padding:8px 12px; font-weight:bold; border-radius:4px 0 0 4px;", "color: #fff; background: #1e293b; padding:8px 12px; border-radius:0 4px 4px 0;");