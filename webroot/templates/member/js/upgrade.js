$(function(){
    var timer_trade = null;
    var reduceyue = $('.reduce-yue');
   $(".grade").slide({mainCell:".g_ul", autoPage:true, effect:"left", autoPlay:false, vis:4, trigger:"click",prevCell:".prev1", nextCell:".next1",pnLoop:false,});




  $(".container_box .hui_box").slide({mainCell:"ul", autoPage:true, effect:"left", autoPlay:false, vis:4, pnLoop:false,prevCell:".prev_1", nextCell:".next_1",trigger:"click"})





  // 选择会员类型
  $('.grade li').click(function(){
    var t = $(this), index = t.index();
    t.addClass('active').siblings('li').removeClass('active');
    $('.special_box .right_box').eq(index).addClass('show1').siblings().removeClass('show1');
    $('.hui_container .hui_box').eq(index).addClass('show').siblings().removeClass('show');


  })


  $(".open").click(function(){
  		 var t = $(this),p = t.parents("li");
  		  price = p.attr('data-count');
  		  level = p.attr('data-id');
        console.log(level);
  		  day =  p.attr('data-time');

  		  $.ajax({
  		      url: '/include/ajax.php?service=member&action=upgrade&check=1',
  		      data: {
  		      amount  : price,
              level   : level,
              day     : day,
              daytype : 'month',
              paytype : 'wxpay',
              final :  0
  		      },
  		      type: 'post',
  		      dataType: 'json',
  		      success: function(data){
  		  		if(data && data.state == 100){

                    info = data.info;
                    cutDown = setInterval(function () {
                        $(".payCutDown").html(payCutDown(info.timeout));
                    },1000)

                    var datainfo = [];
                    for(var k in info) {
                        datainfo.push(k+'='+info[k]);
                    }
                    $("#amout").text(info.order_amount);
                    $('.payMask').show();
                    $('.payPop').show();

                    $("#plevel").val(level);
                    $("#pday").val(day);
                    $("#pdaytype").val('month');

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
                    var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                    $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
	  			}else{
					if(data.info.indexOf('超时') > -1){
						location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1'
					}else{
						alert(data.info);
					}
				}
  		  	 },
  		  	error: function(){

  		  	}
  		  });
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
