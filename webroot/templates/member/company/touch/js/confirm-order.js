$(function(){

  var reduceyue = $('.reduce-yue');

  // 增加年限
  $('.order-btn .add').click(function(){
    var t = $(this), year = t.siblings('.year').find('em'), yearNumber = Number(year.text()) + 1, li = t.closest('li'),
        pertotal = li.find('.order-total em'), pertotalPrice = Number(pertotal.text()), perprice = li.attr('data-price');
    pertotal.text((perprice * yearNumber).toFixed(2));
    year.text(yearNumber);
    totalMoney();
  })

  // 减少年限
  $('.order-btn .reduce').click(function(){
    var t = $(this), year = t.siblings('.year').find('em'), yearNumber = Number(year.text()), li = t.closest('li'),
        pertotal = li.find('.order-total em'), total = Number(li.find('.order-total em').text()), perprice = li.attr('data-price');
    if (yearNumber > 1) {
      yearNumber -= 1;
      year.text(yearNumber);
      pertotal.text((perprice * yearNumber).toFixed(2));
      totalMoney();
    }
  })

  // 删除选择模块
  $('.order-list li .del').click(function(){
    if (confirm(langData['siteConfig'][20][515])) {//确定删除此模块吗？
      $(this).closest('li').remove();
    }
    totalMoney();
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
    totalMoney();
  })

  // 付款方式
  $('.pay-list dl').click(function(){
    $(this).addClass('active').siblings('dl').removeClass('active');
  })


  function totalMoney(){
    var totalPrice = 0, budgetPrice = Number($('.budget-price').text()), yuePrice = Number($('.reduce-yue').text());
    $('.order-list li').each(function(){
      var t = $(this), pertotal = Number(t.find('.order-total em').text()), total = $('.total-price em');
      totalPrice += pertotal;
      total.text(totalPrice.toFixed(2));
    })
    var payTotal = totalPrice - budgetPrice - yuePrice;
    if (payTotal < 0) {
      $('.pay-total').text(0);
    }else {
      $('.pay-total').text(payTotal);
    }
  }


})
