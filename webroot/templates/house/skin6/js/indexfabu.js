$(function () {
    var hasLoadGt = false;
    var getYzmBtn = null;
    var getYzmType = '';

    $(".form-input").submit(function (e) {
        e.preventDefault();
        var f = $(this),
            t = f.find("#submit"),
            loupan = f.find("#selectTypeText"),
            phone = f.find(".tel-text"),
            vcode = f.find("#number"),
            nickname = f.find('.nickname'),
            r = true;

        if (loupan.text() == "" || loupan.text() == "请选择") {
            r = false;
            alert('请选择意向楼盘');
            return false;
        }
        if (nickname.val() == "") {
            r = false;
            nickname.focus();
            nickname.attr('placeholder', '请输入您的姓名');
        } else if (phone.val() == "") {
            r = false;
            phone.focus();
            phone.attr('placeholder', '请输入手机号码');
        }
        if (!r) return;

        var data=[];
        var loupan = $("#selectTypeText").text();
        var tel = $.trim($(".tel-text").val());
        var name = $.trim($(".name-text").val());
        var code = $(".form-input .code").find(".number").val();
        $.ajax({
            url: '/include/ajax.php?service=house&action=booking',
            type: 'get',
            data: {
                loupan: loupan,
                name: name,
                mobile: tel,
                // flag: '1',
                code: code,
            },
            dataType: 'json',
            success: function (data) {
                if (data.state == 100) {
                    alert("预约成功！");
                    $('#number').val('');
                    $('#selectTypeText').text('请选择意向楼盘');
                } else {
                    alert(data.info);
                }
            }
        })
    }) 

    var sendSmsData = [];

    if(geetest){
       

        captchaVerifyFun.initCaptcha('web', '#codeButton', sendSmsFunc)
        $('.sendvdimgck').bind("click", function () {
            if ($(this).hasClass('disabled')) return false;
            var tel = $(".tel-text").val();
            if (tel == '') {
                errMsg = "请输入手机号码";
                showMsg(errMsg);
                $(".tel-text").focus();
                return false;
            }

            //弹出验证码
            if (geetest == 1) {
                captchaVerifyFun.config.captchaObjReg.verify();
            } else {
                $('#codeButton').click()
            }
        })
    }else{
        $(".sendvdimgck").bind("click", function (){
            if($(this).hasClass('disabled')) return false;
            var tel = $(".tel-text").val();
            if(tel == ''){
                errMsg = "请输入手机号码";
                alert(errMsg);
                $('.tel-text').focus().attr('placeholder', '请输入手机号码');
                return false;
            }
            $("#number").focus();
            sendSmsFunc();
        })
    }

    //发送验证码
    function sendSmsFunc(captchaVerifyParam,callback){
        var tel = $(".tel-text").val();
        var areaCode = $("#areaCode").val().replace('+', '');
        var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";

        sendSmsData = []; //清空
        sendSmsData.push('type=verify');
        sendSmsData.push('areaCode=' + areaCode);
        sendSmsData.push('phone=' + tel);
        let param = sendSmsData.join('&')
        if (captchaVerifyParam && geetest == 2) {
            param = param + '&geetest_challenge=' + captchaVerifyParam
        } else if (geetest == 1 && captchaVerifyParam) {
            param = param + captchaVerifyParam
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
                        alert(res.info);
                    }
                }else{
                    returnDJS($('.sendvdimgck'), 60);
                }
            }
        })
    }

    //倒计时
    var ct;

    function returnDJS(obj, time) {
        obj.attr('disabled', true);
        obj.css('background', '#eee');
        ct = setInterval(function () {
            obj.text(--time + 's');
            if (time <= 0) {
                clearInterval(ct);
                obj.text('获取').removeClass('loading');
                obj.attr('disabled', false);
                obj.css('background', '#f1370b');
            }
        }, 1000)
    }


    //预约看房累计人数
    $.ajax({
        url: '/include/ajax.php?service=house&action=bookingList',
        data: '',
        dataType: 'json',
        type: 'get',
        success: function (data) {
            if (data.state == 100) {
                var count = data.info.pageInfo.totalCount;
                $(".buy-right .add span").text(count);
            } else if (data.state == 101) {
                $(".buy-right .add span").text(0);
            }

        }
    })
    
})
