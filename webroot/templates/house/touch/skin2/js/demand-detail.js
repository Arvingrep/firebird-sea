$(function() {


    var detail = {};
    var login = $('.editBtn').attr('data-login'); //是否登录
    //获取信息详细信息
    $.ajax({
        url: masterDomain + '/include/ajax.php?service=house&action=demandDetail&id=' + aid,
        dataType: "jsonp",
        success: function(data) {
            $('.editBtn').show();
            if (data && data.state == 100) {
                var info = data.info;
                detail = info;
                $('#title').val(info.title);
                $('#req_textarea').val(info.note);
                $('.checkbox[data-type=act]').find('dd[data-id="' + info.action + '"]').addClass('on');
                $('.checkbox[data-type=type]').find('dd[data-id="' + info.type + '"]').addClass('on');
                $('.checkbox[data-type=manage]').find('dd:eq(0)').addClass('on');
                $('.gz-addr-seladdr').attr('data-ids', info.addrIds.join(' ')).attr('data-id', info.addrid).find('p').html(info.addrName.join(' '));
                $('#person').val(info.person);
                if (login == 1) {
                    $('#contact').val(info.contact);
                }
                if(info.areaCode != ''&& info.areaCode != '86'){
                    $('#areaCode').val(info.areaCode);
                    $('.areacode_span label').text("+"+info.areaCode)
                }else{
                    $('.areacode_span label').text("+86");
                    $("#areaCode").val('86');
                }

            } else {
                alert(data.info);
            }
        }
    });
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                    }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })

    //管理信息
    $('.editBtn').bind('click',
    function() {
        $('.page_title').html('修改求租求购信息<s></s>');
        $('.sub_btn button').html('提交修改');
        $('.changeinfo').show();
        $('.container').addClass('fn-hide');
        $('.gz-address').addClass('show');
        $('html').addClass('nos');
    });

    //选择框点击效果
    $('.checkbox dd').click(function() {
        $(this).addClass('on').siblings('dd').removeClass('on');

    });

    //单选框
    $('.radioBox .active').click(function() {
        $(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
        var value = $(this).find('a').data('id');
        $('#usersex').val(value);
    });

    //字符限制
    $('#req_textarea').on('input',
    function() {
        $('.num').text($(this).val().length + '/200');
    });

    //输入手机号，发送验证码
    // $('#contact').bind('change', function() {
    //      if(!$('.test_code').show()){
    //    $('.test_code').fadeIn(); 
    //  }
    // });
    $('#contact').bind('change',
    function() {
        checkContact();
    });
    function checkContact() {
        $('.test_code').hide();
        var v = $('#contact').val();
        if (v != '') {
            if (v != detail.contact && ((userinfo.phoneCheck && v != userinfo.phone) || !userinfo.phoneCheck)) {
                $('.test_code').show();
            }
        }
    }

    //点击返回按钮
    $('.go_back,.back-bottom').click(function() {
        $('.container').removeClass('fn-hide');
        $('.gz-address').removeClass('show');
        $('html').removeClass('nos');
    })

    $('.sub_btn button').click(function() {
        var t = $(this);
        var ids = $('.gz-addr-seladdr').attr('data-ids');
        var idsArr = ids.split(' ');
        var title = $.trim($('#title').val()),
        note = $.trim($('#req_textarea').val()),
        act = $('.content-box dl[data-type=act] .on').data('id'),
        type = $('.content-box dl[data-type=type] .on').data('id'),
        manage = $('.content-box dl[data-type=manage] .on').data('id'),
        cityid = idsArr[0],
        addr = idsArr[idsArr.length - 1],
        person = $.trim($('#person').val()),
        sex = $('#usersex').val(),
        contact = $.trim($('#contact').val()),
        areaCode = $.trim($('#areaCode').val()),
        password = $.trim($('#password').val());

        if (type == '' || type == undefined) {
            alert('请选择发布类型！');
            return false;
        }

        if (act == '' || act == 0 || act == undefined) {
            alert('请选择房源类别！');
            return false;
        }

        if (title == '') {
            alert('请输入标题！');
            return false;
        }

        if (note == '') {
            alert('请输入需求描述！');
            return false;
        }

        if (addr == '' || addr == 0) {
            alert('请选择位置！');
            return false;
        }

        if (person == '') {
            alert('请输入您的称呼！');
            return false;
        }
        //var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (contact == '') {
            alert('请输入联系电话！');
            return false;
        } 
        //else if (!contact.match(myreg)) {
            //alert('您输入的联系方式不正确！');
            //return false;
        //}

        if (password == '') {
            alert('请输入管理密码！');
            return false;
        }
        t.attr('disabled', true);
        var action = aid ? 'edit': 'put';

        //删除
        if (manage == '2') {
            $.ajax({
                url: masterDomain + '/include/ajax.php?service=house&action=del&type=demand&password=' + password + '&id=' + aid,
                dataType: "jsonp",
                success: function(data) {
                    if (data && data.state == 100) {
                        alert('删除成功！');
                        if (device.indexOf('huoniao') > -1) {
                            setupWebViewJavascriptBridge(function(bridge) {
                                bridge.callHandler("pageRefresh", {},
                                function(responseData) {});
                            });
                        } else {
                            history.go( - 1);
                        }
                    } else {
                        alert(data.info);
                        t.removeAttr('disabled');
                    }
                },
                error: function() {
                    alert(langData['siteConfig'][20][183]);
                    t.removeAttr('disabled');
                }
            });
            return false;
        }
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=house&action=' + action + '&type=demand',
            data: {
                'id': aid,
                'title': title,
                'note': note,
                'category': type,
                'lei': act,
                'cityid': cityid,
                'addrid': addr,
                'person': person,
                'contact': contact,
                'areaCode': areaCode,
                'password': password,
                'vercode': $('#vercode').val(),
                'sex': sex
            },
            dataType: "jsonp",
            success: function(data) {
                if (data && data.state == 100) {

                    var info = data.info.split('|');
                    if (info[1] == 1) {
                        alert(aid ? '修改成功': '发布成功！');
                    } else {
                        alert(aid ? '提交成功，请等待管理员审核！': '发布成功，请等待管理员审核！');
                    }

                    if (device.indexOf('huoniao') > -1) {
                        setupWebViewJavascriptBridge(function(bridge) {
                            bridge.callHandler("pageRefresh", {},
                            function(responseData) {});
                        });
                    } else {
                        location.reload();
                        window.location.href = masterDomain + '/house/demand.html'
                    }

                } else {
                    alert(data.info);
                    t.removeAttr('disabled');
                }
            },
            error: function() {
                alert(langData['siteConfig'][20][183]);
                t.removeAttr('disabled');
            }
        });

    })

    var dataGeetest = "";
    var ftype = "phone";

    //发送验证码
    function sendPhoneVerCode(captchaVerifyParam, callback) {
        var btn = $('.test_btn button');
        if (btn.filter(":visible").hasClass("disabled")) return;

        var vericode = $("#vdimgck").val(); //图形验证码
        if (vericode == '' && !geetest) {
            alert(langData['siteConfig'][20][170]);
            return false;
        }

        var number = $('#contact').val();
        if (number == '') {
            alert(langData['siteConfig'][20][27]);
            return false;
        }

        if (isNaN(number)) {
            alert(langData['siteConfig'][20][179]);
            return false;
        } else {
            ftype = "phone";
        }

        btn.addClass("disabled");

        if (ftype == "phone") {

            var action = "getPhoneVerify";
            var dataName = "phone";
            
            let param = "vericode="+vericode+"&areaCode=86&phone="+number
            if (captchaVerifyParam && geetest == 2) {
                param = param + '&geetest_challenge=' + captchaVerifyParam
            } else if (geetest == 1 && captchaVerifyParam) {
                param = param + captchaVerifyParam
            }
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
                data: param,
                type: "GET",
                dataType: "json",
                success: function(data) {
                    if (callback) {
                        callback(data)
                    }
                    //获取成功
                    if (data && data.state == 100) {
                        //获取失败
                        alert(data.info);
                    } else {
                        btn.removeClass("disabled");
                        if (data.info != '图形验证错误，请重试！'){
                            alert(data.info);
                        }
                    }
                },
                error: function() {
                    btn.removeClass("disabled");
                    alert(langData['siteConfig'][20][173]);
                }
            });
        }
    }

    if (!geetest) {
        $('.test_btn button').click(function() {
            if (!$(this).hasClass("disabled")) {
                sendPhoneVerCode();
            }
        });
    } else {
        
        captchaVerifyFun.initCaptcha('h5','#codeButton',sendPhoneVerCode)
        //获取验证码
        $('.test_btn button').click(function() {
            if ($(this).hasClass("disabled")) return;
            var number = $('#contact').val();
            if (number == '') {
                alert(langData['siteConfig'][20][27]);
                return false;
            } else {
                if (isNaN(number)) {
                    alert(langData['siteConfig'][20][179]);
                    return false;
                } else {
                    ftype = "phone";
                }
                //弹出验证码
                if(geetest == 1){
                    captchaVerifyFun.config.captchaObjReg.verify();
                }else{
                    $('#codeButton').click()
                }
            }
        });

    }

})