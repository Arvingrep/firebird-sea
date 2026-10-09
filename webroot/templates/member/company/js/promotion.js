$(function(){
  var timer_trade  = null;
  var reduceyue = $('.reduce-yue');

  // 选择提取原因
  $('.select-tit').click(function(){
    $('.select ul').css('display') == 'none' ? $('.select ul').show() : $('.select ul').hide();
    return false;
  })

  $('.select ul li').click(function(){
    var t = $(this), txt = t.text(), id = t.attr('data-id');
    t.addClass('active').siblings('li').removeClass('active');
    $('.select-tit').attr('data-id', id).find('span').text(txt);
    $('.extract .error').text('');
  })

  $(document).click(function(){
    $('.select ul').hide();
  })

  // 选择保障金
  $('.select-ul li').click(function(){
    var t = $(this);
    t.addClass('active').siblings('li').removeClass('active');
    $('#amount').val('');
  })

  // 自定义金额
  $('#amount').bind('input properchange', function(){
    var val = $(this).val();
    if (val != "") {
      $('.select-ul li').removeClass('active');
    }
  })


  //计算总价
  function calculationPayPrice(){
    var selected = $('.select-ul li.active'), length = selected.length;
    var totalPrice = length > 0 ? selected.find('em').text() : $('#amount').val();
    totalPrice = parseFloat(totalPrice);

    $("#totalPrice").val(totalPrice);
    $("#balance").val($(".yue-btn").hasClass("active") ? 1 : 0);
    $("#paytype").val($(".payway .active").data("id"));

    $('.stepBtn').show();
    if($('.yue-btn').hasClass('active')){
      reduceyue.text(totalBalance > totalPrice ? totalPrice.toFixed(2) : totalBalance.toFixed(2));
      balance = totalBalance > totalPrice ? totalPrice : totalBalance;
      $('.pay-total').html((totalPrice-balance).toFixed(2));

      if(totalPrice-balance <= 0){
        $('#paytypeObj').hide();
        $('.next-btn').html(langData['siteConfig'][19][673]);
      }else{
        $('#paytypeObj').show();
        $('.next-btn').html(langData['siteConfig'][19][665]);
        getQrCode();
      }
    }else{
      $('#paytypeObj').show();
      $('.pay-total').html(totalPrice.toFixed(2));
      $('.next-btn').html(langData['siteConfig'][19][665]);
      getQrCode();
    }

  }

  // 缴纳提交
  $('.payment .submit').click(function(){
    calculationPayPrice();
    var t = $(this);
    var length = $('.select-ul li.active').length;
    var val = $('.select-ul li.active').val() == undefined ? $('#amount').val() : $('.select-ul li.active em').val();
    if (val == "" && length <= 0) {
      $('.payment .error').text(langData['siteConfig'][20][455]);
    // }else if (val != "" && val < 1000) {
    //   $('.payment .error').text(langData['siteConfig'][20][456]);
    }else {

      $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=promotion&createtype=1",
        data: {"amount": $("#totalPrice").val()},
        type: "POST",
        dataType: "jsonp",
        success: function (data) {

          if(data.state == 100){

            var info = data.info;
            //提交成功，跳转到支付页面
            cutDown = setInterval(function () {
              $(".payCutDown").html(payCutDown(info.timeout));
            },1000)

            var datainfo = [];
            for(var k in info) {
              datainfo.push(k+'='+info[k]);
            }
            $("#ordertype").val('promotion');
            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').show();

            if(timer_trade != null){
              clearInterval(timer_trade);
            }

            if (usermoney * 1 < info.order_amount * 1) {

              $("#moneyinfo").text('余额不足，');
              $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
            }else{
              $("#moneyinfo").text('可用');
              $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
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

            timer_trade = setInterval(function(){
              $.ajax({
                type: 'POST',
                // async: false,
                url: '/include/ajax.php?service=member&action=tradePayResult&type=1&order='+ordernum,
                dataType: 'json',
                success: function(str){
                  if(str.state == 100 && str.info != ""){
                    //如果已经支付成功，则跳转到指定页面
                    location.href = str.info;
                  }
                }
              });

            }, 2000);
            ordernum     = info.ordernum;
            order_amount = info.order_amount;
            service		 = 'member';
            var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
            $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

          }else{
            $.dialog.alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][19][673]);
          }
        },
        error: function(){
          $.dialog.alert(langData['siteConfig'][20][183]);
          t.removeClass("disabled").html(langData['siteConfig'][19][673]);
        }
      });

    }
  })

  // 提取提交
  $('.extract .submit').click(function(){
    var t = $(this);
    if(t.hasClass("disabled")) return false;

    var amount = $.trim($('.extract .input').val());
    if (amount == 0 || amount == '') {
        $('.extract .error').text('请填写提取金额');
        return false;
    }

    var select = $('.extract .select ul').find('.active');
    if (select.length == 0) {
      $('.extract .error').text(langData['siteConfig'][27][121]);
      return false;
    }

    var textarea = $.trim($('.extract .textarea').val());
    if (textarea == '') {
        $('.extract .error').text(langData['siteConfig'][20][435]);
        return false;
    }

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=extract",
        data: {"amount": amount, "title": select.text(), "note": $('.extract textarea').val()},
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          if(data.state == 100){
            $('.extract-success .titbox span').html(data.info);
            $('.extract-success, .mask').show();
            setTimeout(function(){
              location.reload();
            }, 2000);
          }else{
            $.dialog.alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][19][674]);
          }
        },
        error: function(){
          $.dialog.alert(langData['siteConfig'][20][183]);
          t.removeClass("disabled").html(langData['siteConfig'][19][674]);
        }
      });

  })

  // 关闭提示层
  $('.extract-success .close').click(function(){
    $('.extract-success, .mask').hide();
  })

  // 关闭弹出层
  $('.paybox .close').click(function(){
    $('.paybox, .mask').hide();
  })

  // 点击选择支付方式
  $('.payway li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
    $("#paytype").val($(this).data("id"));
  })

  // 账户余额
  $('.yue-btn').click(function(){
    var t = $(this), yue = t.find('em').text();
    if (t.hasClass('active')) {
      t.removeClass('active');
      reduceyue.text('0.00');
    }else {
      t.addClass('active');
      reduceyue.text(yue);
    }
    calculationPayPrice();
  })

  $("#amount").keyup(function () {
      var reg = $(this).val().match(/\d+\.?\d{0,2}/);
      var txt = '';
      if (reg != null) {
          txt = reg[0];
      }
      $(this).val(txt);
  }).change(function () {
      $(this).keypress();
      var v = $(this).val();
      if (/\.$/.test(v))
      {
        $(this).val(v.substr(0, v.length - 1));
      }
  });

  // 选择记录类型
  $('.main-tit .select-type em').click(function(){
     var t = $(this).parent();
     if (t.hasClass('show')) {
       t.removeClass('show');
     }else {
       t.addClass('show');
     }
     return false;
   })

   $('body').click(function(){
     $('.main-tit .select-type').removeClass('show');
   })

   //支付签约
   $(".next-btn").bind("click", function(){
     $("#pay").submit();
   });



   //支付方式切换
   $('.payTab li').bind('click', function(){
     var t = $(this), index = t.index();
     t.addClass('curr').siblings('li').removeClass('curr');
     if(index == 0){
       $('.qrpay').show();
       $('.payway, .stepBtn').hide();
     }else{
       $('.qrpay').hide();
       $('.payway, .stepBtn').show();
     }
   })


   var timer = null;

   //获取付款二维码
   function getQrCode(){
     $('.payTab li:eq(0)').hasClass('curr') ? $('.stepBtn').hide() : null;
     var data = $('#pay').serialize(), action = $('#pay').attr('action');

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
           $('#qrimg').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

           //验证是否支付成功，如果成功跳转到指定页面
           if(timer != null){
             clearInterval(timer);
           }

           timer = setInterval(function(){

             $.ajax({
               type: 'POST',
               async: false,
               url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order=' + info['ordernum'],
               dataType: 'json',
               success: function(str){
                 if(str.state == 100 && str.info != ""){
                   //如果已经支付成功，则跳转到会员中心页面
                   clearInterval(timer);
                   if(typeof payReturn != "undefined"){
                     location.href = payReturn;
                   }else{
                     location.reload();
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


})
