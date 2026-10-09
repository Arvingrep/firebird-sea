$(function(){

  // 切换套餐类型
  $('.type li').click(function(){
    var t = $(this), index = t.index();
    $('.list').eq(index).addClass('active').siblings().removeClass('active');
    t.addClass('active').siblings().removeClass('active');

    calculationAmount();
  })

  // 选择套餐
  $('.list').delegate(".item", "click", function(){
    var t = $(this);
    if(t.hasClass('active')) return;
    t.addClass('active').siblings().removeClass('active');

    calculationAmount();
  })

  //选择使用余额
  // $('.balance .info').bind('click', function(){
  //     var t = $(this);
  //    if(t.hasClass('curr')){
  //        t.removeClass('curr');
  //        $('#useBalance').val(0);
  //    }else{
  //        t.addClass('curr');
  //        $('#useBalance').val(1);
  //    }
  //
  //     //计算费用
  //     // calculationAmount();
  // });
  //选择支付方式
  // $('.paytype li').bind('click', function(){
  //    var t = $(this), id = t.data('id');
  //    t.addClass('curr').siblings('li').removeClass('curr');
  //    $('#paytype').val(id);
  // }).eq(0).click();


  //计算费用
  function calculationAmount(){
      //总价
      var totalAmount = parseFloat($('.list.active .item.active').data('price'));
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

  // calculationAmount();

  // 购买
  $('.buy').click(function(){
    var f = $('#payForm'),
        t = $('.buy');
    if(t.hasClass('disabled')) return;

    var type = $('.type li.active').data("type"),
        item = $('.list.active li.active').data("item");
      $("#type").val(type);
    $("#item").val(item);
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=house&action=buyZjuserMeal',
      data: f.serialize(),
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100){
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
            ordernum = info.ordernum;
            order_amount = info.order_amount;

            service   = 'house';
            $("#ordertype").val('paymeal');

            $("#service").val('member');
            var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
            $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

          $('#ordernum').val(info.ordernum);
        }else{
          $.dialog.alert(data.info);
          t.removeClass('disabled');
        }
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][6][203]);  //网络错误，请重试！
        t.removeClass('disabled');
      }
    })
  })

  // 定位到指定套餐
  if(type_ != '' && item_ != ''){
    var otypte = $('.type li[data-type="'+type_+'"]'), oitem = $('.item_'+item_);
    if(upgrade){
      var next = tp.next();
      if(next.length){
        otypte = next;
        oitem = $('.listWrap .list').eq(next.index()).children('.item').eq(0);
      }
    }
    otypte.click();
    oitem.click();
    $('.w-form').removeClass('fn-hide');
  }else{
    var tli = $('.type li'), typeLen = tli.length;
    if(typeLen > 5){
      var ulh = $('.type').height(), lih = tli.height(), mg = parseInt(tli.css('margin-left')), pd = parseInt(tli.css('padding-left'));
      var i  = 0;
      while(ulh - lih > 10){
        mg-=2;
        pd-=1;
        pd = pd < 15 ? 15 : pd;
        if(mg < -10) return;
        tli.css({'margin' : '0 ' + mg + 'px -2px', 'padding' : '0 ' + pd + 'px'});
        ulh = $('.type').height();
        lih = $('.type li').height();
      }
    }
    $('.w-form').removeClass('fn-hide');
  }

})