$(function(){

  var name = "";
  var price = 0;

  var isload = false;
  var conHeight = $('.open-module').height(),
      winHeight = $(window).height() - $('.header').height() - $('.module-tab').height();
  var Stype = location.hash.replace('#', '');

  // 初始高度
  if (winHeight > conHeight) {
    setTimeout(function(){
      $('#swiper-container2').height(winHeight);
    }, 300)
  }

  // 状态栏滑动
  var tabsSwiper = new Swiper('#swiper-container2',{
    speed:500,
    autoHeight: true,
    initialSlide: index,
    onSlideChangeStart: function(){
      $('#swiper-container2').addClass('active');
      $("#swiper-container1 .active").removeClass('active');
      if(tabsSwiper != undefined){
        $("#swiper-container1 a").eq(tabsSwiper.activeIndex).addClass('active');
        $("#swiper-container2 .swiper-slide").eq(tabsSwiper.activeIndex).css('height', '100%').siblings('.swiper-slide').height($(window).height() - $('.header').height() - $('#swiper-container1').height());
      }else{
        $("#swiper-container1 a").eq(index).addClass('active');
        $("#swiper-container2 .swiper-slide").eq(index).css('height', '100%').siblings('.swiper-slide').height($(window).height() - $('.header').height() - $('#swiper-container1').height());
      }
      $(window).scrollTop(0);
    },
    onSliderMove: function(){
      isload = true;
    },
    onSlideChangeEnd: function(){
      isload = false;
    }
  })
  $("#swiper-container1 a").on('touchstart mousedown',function(e){
    e.preventDefault();
    $("#swiper-container1 .active").removeClass('active')
    $(this).addClass('active')
    tabsSwiper.slideTo( $(this).index() )
  })
  $("#swiper-container1 a").click(function(e){
    e.preventDefault()
  })

  if (Stype == 'type2') {
    tabsSwiper.slideTo(1);
  }else if (Stype == 'type3') {
    tabsSwiper.slideTo(2);
  }


  // 点击续费
  $('.paybtn').click(function(){
    var t = $(this);
    name = t.closest('li').data('name');
    title = t.closest('li').data('title');
    price = t.closest('li').data('price');

    //如果不在客户端中访问，根据设备类型删除不支持的支付方式
    if(appInfo.device == ""){
        // 赏
        if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
            $("#alipay").remove();
        }
    }else{
        $("#payform").append('<input type="hidden" name="app" value="1" />');
    }
    $(".pay-list dl:eq(0)").addClass("active");
    calculationPayPrice();

    $('.perprice').text(price);
    $('.payName').text(title);
    $('.module-list').addClass('fn-hide');
    $('.payBox').removeClass('fn-hide');
    $('.header-l').attr('data-prev', '1');
    $('.header-c').text(t.text());
  })

  // 上一步
  $('.header-l').click(function(){
    var t = $(this), prev = t.attr('data-prev');
    if (prev == "1") {
      $('.header-l').attr('data-prev', '0');
      $('.module-list').removeClass('fn-hide');
      $('.payBox').addClass('fn-hide');
      $('.header-c').text(langData['siteConfig'][19][472]);
    }else {
      location.href = 'index.html';
    }
  })

  var reduceyue = $('.reduce-yue');

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
  $('.pay-list dl').click(function(){
    $(this).addClass('active').siblings('dl').removeClass('active');
    $("#paytype").val($(this).attr("id"));
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

  //计算总价
  var totalPrice = 0;
  function calculationPayPrice(){
    var year = Number($('.order-btn .year').text());
    totalPrice = price * year;
    $('.perprice').html(price);
    $('.total-price em').html(totalPrice.toFixed(2));

    if($('.yue-btn').hasClass('active')){
      reduceyue.text(totalBalance > totalPrice ? totalPrice.toFixed(2) : totalBalance.toFixed(2));
      balance = totalBalance > totalPrice ? totalPrice : totalBalance;
      $('.pay-total').html((totalPrice-balance).toFixed(2));

      if(totalPrice-balance <= 0){
        $('#paytypeObj').hide();
        $('#submit').html(langData['siteConfig'][19][666]);
      }else{
        $('#paytypeObj').show();
        $('#submit').html(langData['siteConfig'][19][665]);
      }
    }else{
      $('#paytypeObj').show();
      $('.pay-total').html(totalPrice.toFixed(2));
      $('#submit').html(langData['siteConfig'][19][665]);
    }

    $("#modules").val(name+";"+year);
    $("#balance").val($(".yue-btn").hasClass("active") ? 1 : 0);
    $("#paytype").val($(".pay-list .active").attr("id"));
  }


  //支付签约
  $("#submit").bind("click", function(){
    $("#pay").submit();
  });
  // 判断设备类型，ios全屏
  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

})
