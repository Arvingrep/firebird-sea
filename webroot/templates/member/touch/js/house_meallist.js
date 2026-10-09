$(function(){

  var payAmount = 0;
  var totalAmount = 0;

  //验证是否在客户端访问
  setTimeout(function(){
    if(device.indexOf('huoniao') > -1){
      $("#payForm").append('<input type="hidden" name="app" value="1" />');
    }else{
      if(device.toLowerCase().match(/micromessenger/)){
        $("#alipay, #globalalipay").remove();
      }
    }
    $(".refreshTopPaybox li:eq(0)").addClass("on");
    $("#paytype").val($(".refreshTopPaybox li:eq(0)").attr("id"));
  }, 500);


  // 切换套餐类型
  $('.type li').click(function(){
    var t = $(this), index = t.index();
    $('.listbox').eq(index).addClass('active').siblings().removeClass('active');
    t.addClass('active').siblings().removeClass('active');
    calculationAmount();
  })

  // 选择套餐
  $('.listbox').delegate(".item", "click", function(){
    var t = $(this);
    if(t.hasClass('active')) return;
    t.addClass('active').siblings().removeClass('active');
    calculationAmount();
  })

  //支付方式
  $('.refreshTopPaybox li').bind('click', function(){
    var t = $(this), type = t.data('type');
    if(!t.hasClass('on')){
      t.addClass('on').siblings('li').removeClass('on');
      $('#paytype').val(type);
    }
  });
  //选择余额
  $('.rtSett .yue-btn').click(function(){
    var t = $(this);
    t.hasClass('active') ? t.removeClass('active') : t.addClass('active');
    calculationAmount();
  })

  //计算费用
  function calculationAmount(){
      //总价
      totalAmount = parseFloat($('.listbox.active .item.active').data('price'));
      payAmount = totalAmount;

      //余额
      if($('.rtSett').size() > 0 && $('.rtSett .yue-btn').hasClass('active')){
        payAmount = totalBalance > totalAmount ? 0 : totalAmount - totalBalance;
        $('#useBalance').val(1);
      }else{
        $('#useBalance').val(0);
      }

      payAmount = payAmount.toFixed(2);

      $('.rtPay .pay-total').html(payAmount);

  }
  calculationAmount();

  $('.refreshTopMask').click(function(){
    $('.refreshTopPaybox').animate({"bottom":"-100%"},300, function(){
      $('.refreshTopPaybox').removeClass('show');
      $('.refreshTopMask').hide();
    });
  })

  // 购买
  $('.buy').click(function(){
    if(totalAmount > 0){
      // $('.refreshTopPaybox').addClass('show').animate({"bottom":"0"},300);
      // $('.refreshTopMask').show();
      buy($(this));
    }else{
      buy($(this));
    }
  })

  //确认支付
  $('.refreshTopPaybox .paybtn').bind('click', function(){
    buy($(this));
  })

  function buy(btn){
    var f = $('#payForm'),
        t = btn;
    if(t.hasClass('disabled')) return;
    t.addClass('disabled');

    var type = $('.type li.active').data("type"),
        item = $('.listbox.active li.active').data("item");
    $("#type").val(type);
    $("#item").val(item);
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=house&action=buyZjuserMeal',
      data: f.serialize(),
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        t.removeClass('disabled');
        if(data && data.state == 100){

          sinfo = data.info;

          ordertype = 'paymeal';
          service   = 'house';
        //   $('#ordernum').val(sinfo.ordernum);
        //   $('#action').val('paymeal');

          $("#amout").text(sinfo.order_amount);
          $('.payMask').show();
          $('.payPop').css('transform', 'translateY(0)');

          // if (totalBalance * 1 < sinfo.order_amount * 1) {
          //
          //   $("#moneyinfo").text('余额不足，');
          //
          //   $('#balance').hide();
          // }
          if (totalBalance * 1 < sinfo.order_amount * 1) {

            $("#moneyinfo").text('余额不足，');
            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

            $('#balance').hide();
          }



          if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
            $("#bonusinfo").text('额度不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else if( bonus * 1 < sinfo.order_amount * 1){
            $("#bonusinfo").text('余额不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else{
            $("#bonusinfo").text('');
            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
          }

          ordernum = sinfo.ordernum;
          order_amount = sinfo.order_amount;

          payCutDown('', sinfo.timeout, sinfo);
        }else{
          alert(data.info);
        }
      },
      error: function(){
        alert(langData['siteConfig'][6][203]);//网络错误，请重试！
        t.removeClass('disabled');
      }
    })
  }

  // 定位到指定套餐
  if(type_ != '' && item_ != ''){
    var otypte = $('.type li[data-type="'+type_+'"]'), oitem = $('.item_'+item_);
    if(upgrade){
      var next = tp.next();
      if(next.length){
        otypte = next;
        oitem = $('.listWrap .listbox').eq(next.index()).children('.item').eq(0);
      }
    }
    otypte.click();
    oitem.click();
  }

})
