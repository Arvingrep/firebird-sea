$(function(){

  var reduceyue = $('.reduce-yue');

  //计算总价
  var totalPrice = 0;
  function calculationPayPrice(){
    totalPrice = 0;
    var modules = [];
    $('.selected-module li').each(function(){
      var t = $(this), id = t.data('id'), price = parseFloat(t.data('price')), year = parseInt(t.find(".year em").text());
      totalPrice += price * year;
      modules.push(id+";"+year);
    });
    $('.total-price em').html(totalPrice.toFixed(2));

    if($('.yue-btn').hasClass('active')){
      reduceyue.text(totalBalance > totalPrice ? totalPrice.toFixed(2) : totalBalance.toFixed(2));
      balance = totalBalance > totalPrice ? totalPrice : totalBalance;
      $('.pay-total').html((totalPrice-balance).toFixed(2));

      if(totalPrice-balance <= 0){
        $('#paytypeObj').hide();
        $('.next-btn').html(langData['siteConfig'][19][666]);  //立即签约
      }else{
        $('#paytypeObj').show();
        $('.next-btn').html(langData['siteConfig'][19][665]); //去支付
      }
    }else{
      $('#paytypeObj').show();
      $('.pay-total').html(totalPrice.toFixed(2));
      $('.next-btn').html(langData['siteConfig'][19][665]); //去支付
    }

    $("#modules").val(modules.join(","));
    $("#balance").val($(".yue-btn").hasClass("active") ? 1 : 0);
    $("#paytype").val($(".paybox .active").data("id"));

  }

  calculationPayPrice();

  // 点击选择支付方式
  $('.paybox li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
    $("#paytype").val($(this).data("id"));
  })


  // 增加年限
  $('.order-btn .add').click(function(){
    var t = $(this), year = t.siblings('.year').find('em'), yearNumber = Number(year.text()) + 1, li = t.closest('li'),
        pertotal = li.find('.order-total em'), pertotalPrice = Number(pertotal.text()), perprice = li.attr('data-price');
    pertotal.text((perprice * yearNumber).toFixed(2));
    year.text(yearNumber);
    calculationPayPrice();
  })

  // 减少年限
  $('.order-btn .reduce').click(function(){
    var t = $(this), year = t.siblings('.year').find('em'), yearNumber = Number(year.text()), li = t.closest('li'),
        pertotal = li.find('.order-total em'), total = Number(li.find('.order-total em').text()), perprice = li.attr('data-price');
    if (yearNumber > 1) {
      yearNumber -= 1;
      year.text(yearNumber);
      pertotal.text((perprice * yearNumber).toFixed(2));
      calculationPayPrice();
    }
  })

  // 删除选择模块
  $('.selected-module li .del').click(function(){
    if ($('.selected-module li').length > 1) {
      if (confirm(langData['siteConfig'][20][515])) {  //确定删除此模块吗？
        $(this).closest('li').remove();
      }
      calculationPayPrice();
    }else {
      alert(langData['siteConfig'][20][313]);  //最少选择一个模块！
    }
  })


  // 账户余额
  $('.yue-btn').click(function(){
    var t = $(this);
    if (t.hasClass('active')) {
      t.removeClass('active');
      reduceyue.text('0.00');
    }else {
      t.addClass('active');
      reduceyue.text(totalBalance > totalPrice ? totalPrice.toFixed(2) : totalBalance.toFixed(2));
    }
    calculationPayPrice();
  })


  //支付签约
  $(".next-btn").bind("click", function(){
    $("#pay").submit();
  });



})
