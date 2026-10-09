$(function(){

  var reduceyue = $('.reduce-yue');

  // 切换
  $('.nav-tabs li').click(function(){
    var t = $(this), index = t.index();
    t.addClass('active').siblings('li').removeClass('active');
    $('.tbody').hide().eq(index).show();
  })

  var name = "";
  var price = 0;

  //计算总价
  var totalPrice = 0;
  function calculationPayPrice(){
    var year = Number($('.paybox .year').text());
    totalPrice = price * year;
    $('.perprice').html(price);
    $('.total-price em').html(totalPrice.toFixed(2));

    if($('.yue-btn').hasClass('active')){
      reduceyue.text(totalBalance > totalPrice ? totalPrice.toFixed(2) : totalBalance.toFixed(2));
      balance = totalBalance > totalPrice ? totalPrice : totalBalance;
      $('.pay-total').html((totalPrice-balance).toFixed(2));

      if(totalPrice-balance <= 0){
        $('#paytypeObj').hide();
        $('.next-btn').html(langData['siteConfig'][19][666]);
      }else{
        $('#paytypeObj').show();
        $('.next-btn').html(langData['siteConfig'][19][665]);
      }
    }else{
      $('#paytypeObj').show();
      $('.pay-total').html(totalPrice.toFixed(2));
      $('.next-btn').html(langData['siteConfig'][19][665]);
    }

    $("#modules").val(name+";"+year);
    $("#balance").val($(".yue-btn").hasClass("active") ? 1 : 0);
    $("#paytype").val($(".payway .active").data("id"));

  }

  // 续费弹出层
  $('.paybtn').click(function(){
    var t = $(this), table = t.closest('table'), title = table.data('title'), price_ = table.data('price');
    $('.payName').text(title);
    $('.paybox .year').text('1');

    name = table.data('name');
    price = price_;

    if(name && price){
      calculationPayPrice();
      $('.paybox, .mask').show();
    }
  })

  // 开通弹出层
  $('.openbtn').click(function(){
    var t = $(this), li = t.closest('li'), title = li.data('title'), price_ = li.data('price');
    $('.payName').text(title);
    $('.paybox .year').text('1');

    name = li.data('name');
    price = price_;

    if(name && price){
      calculationPayPrice();
      $('.paybox, .mask').show();
    }
  })

  // 关闭弹出层
  $('.paybox .close').click(function(){
    $('.paybox, .mask').hide();
  })

  // 增加年限
  $('.order-btn .add').click(function(){
    var t = $(this), year = t.siblings('.year'), yearNumber = Number(year.text()) + 1;
    year.text(yearNumber);
    calculationPayPrice();
  })

  // 减少年限
  $('.order-btn .reduce').click(function(){
    var t = $(this), year = t.siblings('.year'), yearNumber = Number(year.text());
    if (yearNumber > 1) {
      yearNumber -= 1;
      year.text(yearNumber);
      calculationPayPrice();
    }
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


  //支付签约
  $(".next-btn").bind("click", function(){
    $("#pay").submit();
  });

})
