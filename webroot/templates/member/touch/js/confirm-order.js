$(function(){

  //验证是否在客户端访问
	setTimeout(function(){
		if(appInfo.device == ""){
			if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
				$("#alipay, #globalalipay").remove();
			}
		}else{
			$("#pay").append('<input type="hidden" name="app" value="1" />');
		}
		$(".pay-list dl:first").addClass("active");
    $("#paytype").val($(".pay-list dl:first").attr("id"));
	}, 500);



  var reduceyue = $('.reduce-yue');

  //计算总价
  var totalPrice = 0;
  function calculationPayPrice(){
    totalPrice = 0;
    var modules = [];
    $('.order-list li').each(function(){
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
        $('.nextbtn a').html(langData['siteConfig'][19][666]);
      }else{
        $('#paytypeObj').show();
        $('.nextbtn a').html(langData['siteConfig'][19][665]);
      }
    }else{
      $('#paytypeObj').show();
      $('.pay-total').html(totalPrice.toFixed(2));
      $('.nextbtn a').html(langData['siteConfig'][19][665]);
    }

    $("#modules").val(modules.join(","));
    $("#balance").val($(".yue-btn").hasClass("active") ? 1 : 0);
    $("#paytype").val($(".pay-list .active").attr("id"));

  }

  calculationPayPrice();


  //如果不在客户端中访问，根据设备类型删除不支持的支付方式
  setTimeout(function(){
    if(appInfo.device == ""){
        if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
            $("#alipay").remove();
        }
    }else{
        $("#pay").append('<input type="hidden" name="app" value="1" />');
    }
    $(".pay-list dl:eq(0)").addClass("active");
    calculationPayPrice();
  }, 500);



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
  $('.order-list li .del').click(function(){
    if ($('.order-list li').length > 1) {
      if (confirm(langData['siteConfig'][20][211])) {
        $(this).closest('li').remove();
      }
      calculationPayPrice();
    }else{
      alert(langData['siteConfig'][20][313]);
    }
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

  // 付款方式
  $('.pay-list dl').click(function(){
    $(this).addClass('active').siblings('dl').removeClass('active');
    $("#paytype").val($(this).attr("id"));
  })


  //支付签约
  $(".nextbtn a").bind("click", function(){
    $("#pay").submit();
  });



})
