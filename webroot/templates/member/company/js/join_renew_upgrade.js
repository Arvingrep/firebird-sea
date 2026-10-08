$(function(){

    //单选
    $('.costType label').bind('click', function(){
        if($(this).hasClass('disabled')) return;
        type = $(this).attr('data-id');

        if(!$(this).hasClass('curr')){
            $(this).addClass('curr').siblings('label').removeClass('curr');

            $('.costList ul').removeClass('curr');
            $('.costList ul:eq('+$(this).index()+')').addClass('curr');
            $('#cost').val($('.costList .curr .curr').index());

            if(type == 1){
                $('#type_').val('renew');
            }else{
                $('#type_').val('upgrade');
            }

            if(type == 2 && detail.type == 1){
                $('.next').text(langData['siteConfig'][43][26]);//立即升级
            }else{
                $('.next').text(langData['siteConfig'][43][23]);//立即续费
            }

        }
        return false;
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
            $('.popup_contact h2').html(langData['siteConfig'][30][38]);//客服QQ
        }else{
            $('.popup_contact h2').html(langData['siteConfig'][19][298]);//客服电话
        }
    })

    $('.popup_contact .close').bind('click', function(){
        $('.popup_contact, .popup_contact_mask').hide();
    });

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
    }).eq(0).click();


    //下一步
    $('.next').bind('click', function(){

        $('.step li:eq(1)').addClass('curr').siblings('li').removeClass('curr');

        var costType = $('.cost_type' + type);
        var costit = costType.children('li');
        var free = 0;

        costType.addClass('curr').siblings().removeClass('curr');
        if(costit.length){
            $('.tj').text(langData['siteConfig'][23][113]);//立即支付
        }else{
            free = 1;
            $('.tj').text(langData['siteConfig'][30][42]);//马上免费入驻
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
                    var url = configUrl2;

                    if(type == detail.type){
                        $('.success h5').text(langData['siteConfig'][45][78]);//续约成功
                    }else{
                        $('.success h5').text(langData['siteConfig'][45][77]);//升级成功
                    }
                    $(".success").show().siblings().hide();
                    $(".compare").hide();


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
                    // console.log(data.info)
                    location.href = data.info;
                    // location.href = masterDomain + '/include/ajax.php?service=member&action=joinPay&'+form.serialize();
                }
            }else{
              alert(data.info);
              btn.removeClass("disabled").removeAttr("disabled").val(langData['siteConfig'][6][118]);
            }
          },
          error: function(){
            alert(langData['siteConfig'][20][183]);
            btn.removeClass("disabled").removeAttr("disabled").val(langData['siteConfig'][6][118]);
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
            obj.removeAttr('disabled').val(langData['siteConfig'][4][2]);
        }
    }, 1000);
}