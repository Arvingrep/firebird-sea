$(function(){

    module = typeof module == 'undefined' || typeof cfg_module != 'undefined' ? cfg_module : module;

  var reduceyue = $('.reduce-yue');

  // 发布信息支付框
	$('.fabuPay .payway li').click(function(){
		var t = $(this);
		t.addClass('active').siblings('li').removeClass('active');
    calculationPayPrice();
	})

	// 选择余额
	$('.fabuPay .yue-btn').click(function(){
    var t = $(this), yue = $('.fabuPay .payPrice').text();
    if (t.hasClass('active')) {
      t.removeClass('active');
      reduceyue.text('0.00');
    }else {
      t.addClass('active');
      reduceyue.text(yue);
    }
    calculationPayPrice();
  })

	// 关闭支付框
	$('.fabuPay .payClose').click(function(){
		$('.fabuPay, .mask').hide();
    fabuPay.close();
	})

  calculationPayPrice();

  //计算总价
  function calculationPayPrice(){

    //改变表单内容
    $('#payform #paytype').val($('.fabuPay .payway .active').data('id'));
    var moduleinfo = $('.fabuPay .payPrice').attr('data-module');

    // $('#payform #amount').val(moduleinfo == 'info' ? 0 : $('.fabuPay .payPrice').text());
    $('#payform #amount').val($('.fabuPay .payPrice').text());

    $("#payform #useBalance").val($(".fabuPay .yue-btn").hasClass("active") ? 1 : 0);


    $('.fabuPay .paySubmit').show();
    var totalPrice = $('.fabuPay .payPrice').text();
    if($('.fabuPay .yue-btn').hasClass('active')){
      reduceyue.text(totalBalance > totalPrice ? totalPrice : totalBalance);
      balance = totalBalance > totalPrice ? totalPrice : totalBalance;
      $('.fabuPay .pay-total').html((totalPrice-balance).toFixed(2));

      if(totalPrice-balance <= 0){
        $('.fabuPay .paytypeObj').hide();
      }else{
        $('.fabuPay .paytypeObj').show();
        getQrCode();
      }
    }else{
      $('.fabuPay .paytypeObj').show();
      $('.fabuPay .pay-total').html(totalPrice);
      getQrCode();
    }
    resetPoputPos()

  }


  //支付
  $(".fabuPay .paySubmit").bind("click", function(){
    var t = $(this), aid = $("#aid").val();
    fabuPay.checkLevel(t, aid);
  });


  // manage页面继续支付
  $("body").delegate(".delayPay", "click", function(){
    var t = $(this), aid = t.closest(".item").attr("data-id");
    fabuPay.checkLevel(t, aid);
  })


  //支付方式切换
  $('.fabuPay .payTab li').bind('click', function(){
    var t = $(this), index = t.index();
    t.addClass('curr').siblings('li').removeClass('curr');
    if(index == 0){
      $('.fabuPay .qrpay').show();
      $('.fabuPay .payway, .fabuPay .paySubmit').hide();
    }else{
      $('.fabuPay .qrpay').hide();
      $('.fabuPay .payway, .fabuPay .paySubmit').show();
    }
    resetPoputPos();
  })

})

var fabuPayTimer = null;

// 普通会员发布信息支付费用
var fabuPay = {
  payform: $("#payform"),
  btn: null,
  url: '',
  check: function(data, url, btn){

    //支付成功回调
    callBack_fun_success = function(){
        location.href = url;
    };
    
    var moduleName = $('#module').val();
    url = url.split('#')[0];
    this.btn = btn;
    this.url = url;
    var tip = langData['siteConfig'][20][341], icon = "success.png";   //发布成功
    // 修改
    if(id){
      tip = langData['siteConfig'][20][229];   //修改成功！
    }else{
      // 付费
      if(data.info.amount > 0){
        fabuPay.show(data);
        return;
      }
    }

    $.dialog({
      title: langData['siteConfig'][19][287],  //请选择到岗时间！
      icon: icon,
      content: tip,
      close: false,
      ok: function(){
        location.href = url;
      },
      cancel: function(){
        location.href = url;
      }
    });
  },
  show: function(data){
    $("#aid").val(data.info.aid);

    var auth = data.info.auth;
    // 付费会员更新提示信息
    if(auth.level != 0){
      $(".payNotice").text(langData['siteConfig'][19][826].replace('1', auth.levelname).replace('2', auth.maxcount).replace('3', auth.alreadycount));
    }//您当前是1，此模块每天最多可免费发布2条信息，您已发布3条

    $("#payform #tourl").val(this.url);
    $('.fabuPay, .mask').show();
    getQrCode();
    resetPoputPos();
  },
  sub: function(){
    var F = this;
    // var url = F.payform.attr("action"), data = F.payform.serialize();

    this.payform.submit();

  },
  close: function(){
    window.location.href = this.url;
  },
  checkLevel: function(t, aid){
    var F = this;
    if(t.hasClass('load')) return;
    t.addClass("load");
    t.addClass('publicpaybtn');
    t.closest('.item').find('.delayPay').removeClass('publicpaybtn');
    $("#aid").val(aid);
    $('input[name="aid"]').val(aid)
    $("#tourl").val( document.URL);
    $("#payform #tourl").val( document.URL);
    $.ajax({
      type: 'POST',
      url: '/include/ajax.php?service=member&action=checkFabuAmount&module='+module,
      dataType: 'json',
      success: function(data){

        if(data){
          t.removeClass("load");
          // 需要支付
          if(data.info.needpay == "1"){

            $.ajax({
              url: '/include/ajax.php?service=member&action=fabuPay',
              type: 'post',
              dataType: 'json',
              data:$("#payform").serialize(),
              success: function (data) {
                if(data && data.state == 100) {

                  info = data.info;
                  cutDown = setInterval(function () {
                    $(".payCutDown").html(payCutDown(info.timeout));
                  }, 1000)

                  var datainfo = [];
                  for (var k in info) {
                    datainfo.push(k + '=' + info[k]);
                  }
                  $("#amout").text(info.order_amount);
                  $('.payMask').show();
                  $('.payPop').show();
                  if (usermoney * 1 < info.order_amount * 1) {
                    $("#moneyinfo").text('余额不足，');
                    $(".pay_balance").addClass('disabled_pay');
                  }else{
                    $("#moneyinfo").text('可用');
                    $(".pay_balance").removeClass('disabled_pay');
                  }

                  if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                    $("#bonusinfo").text('额度不足，可用');
                    $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                  }else if( bonus * 1 < info.order_amount * 1){
                    $("#bonusinfo").text('余额不足，可用');
                    $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                  }else{
                    $("#bonusinfo").text('可用');
                    $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                  }

                  ordernum  = info.ordernum;
                  order_amount = info.order_amount;
                  // module    =
                  $("#ordertype").val('fabupay');
                  $("#service").val('member');
                  var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                  $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                }
              },
              error: function () {

              }
            })


          // 已升级为会员
          }else{
            var auth = data.info.auth;
            jQuery.dialog({
              id: "updatePayState",
              title: langData['siteConfig'][23][107],    //修改信息支付状态
              content: langData['siteConfig'][19][827].replace('1', auth.levelname).replace('2', auth.alreadycount).replace('3', auth.maxcount),
              //您当前是1。此模块今天已免费发布2条信息，每天最多可免费发布3条。确认将该信息设为已支付吗？
              width: 450,
              ok: function(){
                $.ajax({
                  url: '/include/ajax.php?service=member&action=updateFabuPaystate&module='+module+'&type='+type+'&aid='+aid,
                  type: 'post',
                  dataType: 'json',
                  success: function(data){
                    if(data && data.state == 100){
                        if(callBack_fun_success){
                            callBack_fun_success();
                        }else{
                            location.reload();
                        }
                    }else{
                      $.dialog.alert(data.info);
                      t.removeClass('load')
                    }
                  },
                  error: function(){
                    $.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
                    t.removeClass('load')
                  }
                })
              },
              cancel: function(){
                t.removeClass('load');
              }
            });
          }
        }
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
        t.removeClass("load");
      }
    })
  }
}





//获取付款二维码
function getQrCode(){
  $('.fabuPay .payTab li:eq(0)').hasClass('curr') && $('.paytypeObj').is(':visible') ? $('.fabuPay .paySubmit').hide() : null;
  var data = $('#payform').serialize(), action = $('#payform').attr('action');

  $.ajax({
    type: 'POST',
    url: action,
    data: data  + '&qr=1',
    dataType: 'jsonp',
    success: function(str){
      if(str.state == 100){
        var data = [], info = str.info;
        for(var k in info) {
          data.push(k+'='+info[k]);
        }
        var src = masterDomain + '/include/qrPay.php?' + data.join('&');
        $('.fabuPay .qrimg').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

        //验证是否支付成功，如果成功跳转到指定页面
        if(fabuPayTimer != null){
          clearInterval(fabuPayTimer);
        }

        fabuPayTimer = setInterval(function(){

          $.ajax({
            type: 'POST',
            async: false,
            url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order=' + info['ordernum'],
            dataType: 'json',
            success: function(str){
              if(str.state == 100 && str.info != ""){
                //如果已经支付成功，则跳转到会员中心页面
                clearInterval(fabuPayTimer);
                if(typeof payReturn != "undefined"){
                  location.href = payReturn;
                }else{
                    if(callBack_fun_success){
                        callBack_fun_success();
                    }else{
                        location.reload();
                    }
                }
              }else if(str.state == 101 && str.info == '订单不存在！'){
                getQrCode();
              }
            }
          });

        }, 2000);


      }
    }
  });

}


//重置浮动层位置
function resetPoputPos(){
  var top = $('.fabuPay').height() / 2;
  $('.fabuPay').css({'margin-top': -top + 'px'});
}
