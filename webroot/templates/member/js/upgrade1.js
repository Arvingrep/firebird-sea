$(function(){

  var reduceyue = $('.reduce-yue');

  // 选择会员类型
  $('.grade li').click(function(){
    var t = $(this), index = t.index();
    t.addClass('active').siblings('li').removeClass('active');
    $('.special .specbox').eq(index).show().siblings().hide();
    $('.choose .pricebox').eq(index).addClass('show').siblings().removeClass('show');
    calculationPayPrice();
  })

  // 选择开通类型
  $('.pricebox li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
    calculationPayPrice();
  })

  // 选择支付方式
  $('.payway li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
    calculationPayPrice();
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


  $('.next-btn').bind("click", function(){
    $('#payform').submit();
  });


  calculationPayPrice();
  var timer = null;


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


  //计算总价
  function calculationPayPrice(){

    //改变表单内容
    if($('.payway .active').length > 0){
      $('#paytype').val($('.payway .active').data('id'));
    }
    $('#amount').val($('.choose .show .active').data('amount'));
    $('#day').val($('.choose .show .active').data('day'));
    $('#daytype').val($('.choose .show .active').data('daytype'));
    $('#level').val($('.choose .show .active').data('level'));
    $("#useBalance").val($(".yue-btn").hasClass("active") ? 1 : 0);

    $('.stepBtn').show();
    var totalPrice = $('.pricebox.show .active').data("amount");
    if($('.yue-btn').hasClass('active')){
      reduceyue.text(totalBalance > totalPrice ? totalPrice : totalBalance);
      balance = totalBalance > totalPrice ? totalPrice : totalBalance;
      $('.pay-total').html((totalPrice-balance).toFixed(2));

      if(totalPrice-balance <= 0){
        $('#paytypeObj').hide();
        $('.next-btn').html(langData['siteConfig'][6][185]);  //立即开通
        clearInterval(timer);
      }else{
        $('#paytypeObj').show();
        $('.next-btn').html(langData['siteConfig'][19][665]);  //续费
        getQrCode();
      }
    }else{
      $('#paytypeObj').show();
      $('.pay-total').html(totalPrice);
      $('.next-btn').html(langData['siteConfig'][19][665]);//续费
      getQrCode();
    }


  }

  //获取付款二维码
  function getQrCode(){
    $('.payTab li:eq(0)').hasClass('curr') ? $('.stepBtn').hide() : null;
    var data = $('#payform').serialize();

    $.ajax({
      type: 'POST',
      url: masterDomain + '/include/ajax.php',
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
      						location.href = userCenter;
      					}else if(str.state == 101 && str.info == langData['siteConfig'][21][162]){  //订单不存在！
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
