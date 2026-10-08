$(function(){
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
                   $('.areaList ul').append(phoneList.join(''));
                }else{
                   $('.areaList ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.areaList ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }

    //选择区号
    $('#areaList').delegate('li','click',function(){
       var t = $(this), txt = t.find('span').text(), val = t.find('em').text();
       $('.form .area .inp').html(txt);
       $('.form .area .areaCode').html(val);
       $('#areaCode').val(val.replace('+', ''));
       $('#areaList').hide();
       return false;
    });

    $('.form .area').bind('click', function(){
        $('#areaList').show();
        return false;
    });

    /* 经营类目 */
    $('.typeList .flist li').bind('click', function(){
       var t = $(this), index = t.index();
       if(!t.hasClass('curr')){
           t.addClass('curr').siblings('li').removeClass('curr');
           $('.typeList .subtype ul').hide();
           $('.typeList .subtype ul:eq('+index+')').show();
       }
       return false;
    });
    $('.typeList .subtype li').bind('click', function(){
        var t = $(this), id = t.data('id'), txt = t.text();
        $('.typeList .subtype li').removeClass('curr');
        t.addClass('curr');
        $('#typeList').hide();
        $('#typeid').val(id);
        $('.form .type .inp').html($('.flist .curr').text() + ' > ' + txt);
        return false;
    });

    $('.form .type').bind('click', function(){
       $('#typeList').show();
       return false;
    });

    $('body').bind('click', function(){
       $('#areaList, #typeList').hide();
    });

    //input聚焦
   $('.form .inp').focus(function(){
      $(this).closest('.item').addClass('focus');
   });
   $('.form .inp').blur(function(){
       $(this).closest('.item').removeClass('focus');
   });

    //单选
    $('.costType label').bind('click', function(){
        if($(this).hasClass('disabled')) return;
        if(!$(this).hasClass('curr')){
            $(this).addClass('curr').siblings('label').removeClass('curr');
            $('#type').val($(this).data('id'));

            $('.costList ul').removeClass('curr');
            $('.costList ul:eq('+$(this).index()+')').addClass('curr');
            $('#cost').val($('.costList .curr .curr').index());
        }
        return false;
    });

    $('.agreeBox .radio').bind('click', function(){
        if($(this).hasClass('curr')){
            $(this).removeClass('curr');
        }else{
            $(this).addClass('curr');
        }
    });

    //功能介绍
    $('.baseIcon').hover(function(){
        $(this).closest('.tabConBox').find('.note').show();
    }, function(){
        $(this).closest('.tabConBox').find('.note').hide();
    });

    $('.tabConBox .note').hover(function(){
        $(this).show();
    }, function(){
        $(this).hide();
    })

    //更多联系方式
    $('.contact .qt li').bind('click', function(){
        var ct = $(this).hasClass('qq') ? 'qq' : 'tel';
        $('.popup_contact ul').hide();
        $('.popup_contact, .popup_contact_mask, .popup_contact .'+ct).show();
        if(ct == 'qq'){
            $('.popup_contact h2').html(langData['siteConfig'][30][38]);    //客服QQ
        }else{
            $('.popup_contact h2').html(langData['siteConfig'][19][298]);   //客服电话
        }
    })

    $('.popup_contact .close').bind('click', function(){
        $('.popup_contact, .popup_contact_mask').hide();
    });


    var dataGeetest = "";

    //发送验证码
    function sendVerCode(){
        var form = $(".form");
        var btn = form.find('.btnYzm'), v = form.find("#phone").val(), areaCode = $("#areaCode").val();

        if(v == ''){
            alert(langData['siteConfig'][20][463]);  //请输入手机号码
            form.find("#phone").focus();
            return false;
        }else{

            //中国大陆手机格式验证
            if(areaCode == '86'){
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if(!phoneReg.test(v)) {
                    alert(langData['siteConfig'][20][232]);   //请输入正确的手机号码
                    form.find("#phone").focus();
                    return false;
                }
            }

            btn.attr('disabled', true).val(langData['siteConfig'][7][10]+"..");   //发送中
            $.ajax({
                url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify",
                data: "type=join&phone="+v+'&areaCode='+areaCode+dataGeetest,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {

                    //获取成功
                    if(data && data.state == 100){
                        countDown(60, btn);
                        //获取失败
                    }else{
                        btn.removeAttr('disabled').val(langData['siteConfig'][4][1]);   //获取验证码
                        alert(data.info);
                    }
                },
                error: function(){
                    btn.removeAttr('disabled').val(langData['siteConfig'][4][1]);   //获取验证码
                    alert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                }
            });
        }
    }


    if(geetest){

        //极验验证
        var handlerPopupReg = function (captchaObjReg) {

            // 成功的回调
            captchaObjReg.onSuccess(function () {
                var validate = captchaObjReg.getValidate();
                dataGeetest = "&terminal=pc&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
                sendVerCode();
            });

            window.captchaObjReg = captchaObjReg;
        };

        //获取验证码
        $('.form').delegate('.btnYzm', 'click', function(){

            var form = $(".form");
            var c = form.find("#areaCode").val();
            var v = form.find("#phone").val();

            if(v == '') {
                alert('请输入手机号码');
                form.find("#phone").focus();
                return false;
            }

            //中国大陆手机格式验证
            if(c == '86'){
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if(!phoneReg.test(v)) {
                    alert(langData['siteConfig'][20][232]);  //请输入正确的手机号码
                    form.find("#phone").focus();
                    return false;
                }
            }

            if (captchaObjReg) {
                captchaObjReg.verify();
            }
        })

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=geetest&terminal=mobile&t=" + (new Date()).getTime(), // 加随机数防止缓存
            type: "get",
            dataType: "json",
            success: function (data) {
                initGeetest({
                    gt: data.gt,
                    challenge: data.challenge,
                    offline: !data.success,
                    new_captcha: true,
                    product: "bind",
                    width: '312px'
                }, handlerPopupReg);
            }
        });

    }

    if(!geetest){
        $('.form').delegate('.btnYzm', 'click', function(){
            sendVerCode();
        });
    }

    //选择入驻套餐
    $('.costList li').bind('click', function(){
       var t = $(this), index = t.index();
       t.addClass('curr').siblings('li').removeClass('curr');
       $('#cost').val(index);

        //计算费用
        calculationAmount();
    });

    //选择支付方式
    $('.paytype li').bind('click', function(){
       var t = $(this), id = t.data('id');
       t.addClass('curr').siblings('li').removeClass('curr');
       $('#paytype').val(id);
    });


    //下一步
    $('.next').bind('click', function(){
        if($('#areaCode').val() == '' || $('#areaCode').val() == ''){
            alert(langData['siteConfig'][30][39]);  //请选择国家区号
            $('#areaList').show();
            return false;
        }
        if($('#phone').val() == ''){
            alert(langData['siteConfig'][20][463]);  //请输入手机号码
            $('#phone').focus();
            return false;
        }
        if($('#yzm').val() == ''){
            alert(langData['siteConfig'][20][28]);  //请输入短信验证码
            $('#yzm').focus();
            return false;
        }
        if($('#name').val() == ''){
            alert(langData['siteConfig'][27][138]);  //请输入联系人
            $('#name').focus();
            return false;
        }
        if($('#typeid').val() == '' || $('#typeid').val() == 0){
            alert(langData['siteConfig'][30][40]);  //请选择经营类目
            $('#typeList').show();
            return false;
        }
        if(!$('.agreeBox .radio').hasClass('curr')){
            alert(langData['siteConfig'][30][41]);   //请同意并勾选《商家入驻服务协议》
            return false;
        }
        $('.step li:eq(1)').addClass('curr').siblings('li').removeClass('curr');

        var type = $('#type').val();
        var costType = $('.cost_type' + type);
        var costit = costType.children('li');
        var free = 0;

        costType.addClass('curr').siblings().removeClass('curr');
        if(costit.length){
            $('.tj').text(langData['siteConfig'][23][113]);   //立即支付
        }else{
            free = 1;
            $('.tj').text(langData['siteConfig'][30][42]);  //马上免费入驻
        }

        $('.step1').hide();
        $('.step2').show();

        //计算费用
        calculationAmount(free);
    });

    //选择使用余额
    $('.balance .info').bind('click', function(){
        var t = $(this);
       if(t.hasClass('curr')){
           t.removeClass('curr');
           $('#useBalance').val(0);
       }else{
           t.addClass('curr');
           $('#useBalance').val(1);
       }

        //计算费用
        calculationAmount();
    });

    //计算费用
    function calculationAmount(free){
        if(free){
            $('.balance, .onlinepay').hide();
            return;
        }else{
            $('.balance').show();
        }
        //总价
        var totalAmount = parseFloat($('.costList .curr .curr').data('price'));
        console.log(totalAmount)
        var payAmount = totalAmount;

        //余额
        if($('.balance').size() > 0 && $('.balance .info').hasClass('curr')){
            payAmount = totalBalance > totalAmount ? 0 : totalAmount - totalBalance;
            $('.useBalance strong').html((totalBalance > totalAmount ? totalAmount : totalBalance).toFixed(2));
        }else{
            $('.useBalance strong').html('0.00');
        }

        payAmount = payAmount.toFixed(2);

        $('.onlinepay .payInfo strong').html(payAmount);

        if(payAmount > 0){
            $('.onlinepay').show();
        }else{
            $('.onlinepay').hide();
        }
    }

    //返回上一步
    $('.tjbtn a').bind('click', function(){
        $('.step li:eq(0)').addClass('curr').siblings('li').removeClass('curr');
        $('.step1').show();
        $('.step2').hide();
    });

    // 提交
    $('.form').submit(function(e){
        e.preventDefault();
    })
    $('.tj').click(function(){
        var btn = $(this);
        if(btn.hasClass('disabled')) return;

        var form = $(".form"), action = form.attr("action");
        // btn.addClass("disabled").attr("disabled", true).val(langData['siteConfig'][6][35]+"...");

        //异步提交
        $.ajax({
          url: action+'&'+form.serialize(),
          type: "get",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){
                if(data.info == "ok"){
                    var url = configUrl1;
                    $(".success").show().siblings().hide();
                    $(".compare").hide();
                    $.ajax({
                        url: masterDomain+'/getUserInfo.html',
                        type: "get",
                        dataType: "jsonp",
                        success: function (data) {
                            if(data){
                                if(data.userType == 2){
                                    url = configUrl2;
                                    $('.success p span').text(langData['siteConfig'][30][43]);   //恭喜，您的入驻申请已审核通过。
                                }
                            }
                        }
                    })
                    function autoJump(t){
                        $('.success p em').text(--t);
                        if(t == 0){
                            location.href = url;
                        }else{
                            setTimeout(function(){
                                autoJump(t)
                            }, 1000)
                        }
                    }
                    autoJump(4);
                }else{
                    location.href = data.info;
                    // location.href = masterDomain + '/include/ajax.php?service=member&action=joinPay&'+form.serialize();
                }
            }else{
              alert(data.info);
              btn.removeClass("disabled").removeAttr("disabled").val(langData['siteConfig'][6][118]);  //重新提交
            }
          },
          error: function(){
            alert(langData['siteConfig'][20][183]);
            btn.removeClass("disabled").removeAttr("disabled").val(langData['siteConfig'][6][118]);  //重新提交
          }
        });
    })

});


//倒计时（开始时间、结束时间、显示容器）
var times = null;
var countDown = function(time, obj, func){
    times = obj;
    obj.addClass("not").text(time+'s');
    mtimer = setInterval(function(){
        obj.text((--time)+'s');
        if(time <= 0) {
            clearInterval(mtimer);
            obj.removeAttr('disabled').val(langData['siteConfig'][4][2]);  //重发验证码
        }
    }, 1000);
}