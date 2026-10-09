
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

var t = "\u5b98\u65b9\u7f51\u7ad9\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\n\u6f14\u793a\u7f51\u7ad9\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0069\u0068\u0075\u006f\u006e\u0069\u0061\u006f\u002e\u0063\u006e\u002f\u0073\u007a\n\u4f7f\u7528\u534f\u8bae\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\u002f\u0074\u0065\u0072\u006d\u0073\u002e\u0068\u0074\u006d\u006c\n\u8ba1\u7b97\u673a\u8f6f\u4ef6\u4fdd\u62a4\u6761\u4f8b\uff1a\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0067\u006f\u006e\u0067\u0062\u0061\u006f\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u002f\u0032\u0030\u0031\u0033\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u005f\u0032\u0033\u0033\u0039\u0034\u0037\u0031\u002e\u0068\u0074\u006d\n\u4e2d\u534e\u4eba\u6c11\u5171\u548c\u56fd\u8457\u4f5c\u6743\u6cd5\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006e\u0063\u0061\u0063\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0063\u0068\u0069\u006e\u0061\u0063\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u0073\u002f\u0031\u0032\u0032\u0033\u0030\u002f\u0033\u0035\u0033\u0037\u0039\u0035\u002e\u0073\u0068\u0074\u006d\u006c";
console.log("\n%c  \u706b\u9e1f\u95e8\u6237\u7cfb\u7edf  %c  \u0043\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074\u0020\u00a9\u0020\u0032\u0030\u0031\u0033\u002d%s \u82cf\u5dde\u9177\u66fc\u8f6f\u4ef6\u6280\u672f\u6709\u9650\u516c\u53f8  \n", "color: #fff; background: #f83824; padding:10px 0 8px; font-family: PingFang SC, Microsoft Yahei, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 15px;", "color: #fff; background: #000; padding:8px 0 8px; font-family: PingFang SC, Microsoft Yahei, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 13px;", (new Date).getFullYear());
console.log("%c" + t, "color:#333; font-size:12px; font-family: PingFang SC, Microsoft Yahei, Helvetica, Arial, sans-serif; line-height: 1.8em;");