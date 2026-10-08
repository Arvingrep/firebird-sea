$(function(){

	var timer_trade = null;
	var depositPrice = 0;
	var timer = null;


	var init = {
		popshow: function() {
			$("body").append($('<div id="shadowlayer" style="display:block"></div>'));
			$("#feedback").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#feedback").hide();
			clearInterval(timer);
		}
	};

	$(".pay-pop .pop-close, .pay-pop .gray").bind("click", function(){
		init.pophide();
	});


	//支付方式初始值
	$("#paytype").val($("#payType .active:eq(0)").data("type"));

	//选择支付方式
	$("#payType a").bind("click", function(){
		$(this).addClass("active").siblings("a").removeClass("active");
		$("#bankList").hide();
		$("#prepaidCard").val("").hide();
		$("#amount").attr("disabled", false);
		$("#amount").removeClass("error").siblings(".tip-inline").removeClass().addClass("tip-inline").hide();
		$(".enterAmount").show();

		$("#paytype").val($(this).data("type"));

		//银行卡
		if($(this).find("span").attr("class") == "bankpayment"){
			$("#bankList").show();

			$("#paytype").val($("#bankList .active:eq(0)").data("type"));
		}

	});

	//选择其他银行
	$(".hasChooseBank a").bind("click", function(){
		$(".bankList").toggle();
	});

	//选择支付银行
	$(".bankList a").bind("click", function(){
		$(this).addClass("active").siblings("a").removeClass("active");
		var t = $(this), title = t.attr("title"), code = t.find("span").attr("class");
		$(".hasChooseBank .bank-icon").attr("title", title).find("span").attr("class", code);
		$(".bankList, .bankTips .blimit").hide();

		$("#paytype").val($(this).data("type"));
	});

	//金额验证
	$(".inp").bind("input click focus", function(){
		$(this).removeClass("error").siblings(".tip-inline").removeClass().addClass("tip-inline").show();
	});

	$("#amount").bind("input", function(){
		var t = $(this), val = t.val(), tip = t.siblings(".tip-inline");

		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(val)) {

			tip.removeClass().addClass("tip-inline error").show();
			t.addClass("error");
			$(".verifyAmount dd").html('<strong>'+huoniao.number_format(0, 2)+'</strong>');
			// $(".verifyAmount").hide();

			depositPrice = 0;

		}else{
			t.removeClass("error");
			tip.removeClass().addClass("tip-inline ok").show();

			$(".verifyAmount dd").html('<strong>'+huoniao.number_format(val, 2)+'</strong>');
			// $(".verifyAmount").show();

			depositPrice = val;
			getQrCode();
		}

	}).trigger('input');

	//充值卡
	// $("#paycard").bind("blur", function(){
	// 	var t = $(this), val = t.val(), tip = t.siblings(".tip-inline");

	// 	if(val == ""){

	// 		tip.removeClass().addClass("tip-inline error").show();
	// 		t.addClass("error");
	// 		$(".verifyAmount dd").html('');
	// 		$(".verifyAmount").hide();

	// 		depositPrice = 0;

	// 	}else{
	// 		t.removeClass("error");
	// 		tip.removeClass().addClass("tip-inline ok").show();

	// 		var money = 5869.61;
	// 		$(".verifyAmount dd").html('<strong>'+huoniao.number_format(money, 2)+'</strong>（可获得 '+(money*pointRatio)+' '+pointName+'）');
	// 		$(".verifyAmount").show();

	// 		depositPrice = money;
	// 	}
	// });

	//提交支付
	// $("#tj").bind("click", function(event){
	// 	var t = $(this);

	// 	if($("#paytype").val() == ""){
	// 		alert(langData['siteConfig'][21][75]);
	// 		return false;
	// 	}
	// 	if(depositPrice == 0){
	// 		alert(langData['siteConfig'][20][64]);
	// 		$("#amount").focus();
	// 		return false;
	// 	}
	// 	if(!$("#agree").is(":checked")){
	// 		alert(langData['siteConfig'][23][105]);
	// 		return false;
	// 	}

	// 	$("#payform").submit();
	// 	init.popshow();


	// 	//验证是否支付成功，如果成功跳转到指定页面
	// 	if(timer != null){
	// 		clearInterval(timer);
	// 	}
	// 	timer = setInterval(function(){

	// 		$.ajax({
	// 			type: 'POST',
	// 			async: false,
	// 			url: '/include/ajax.php?service=member&action=tradePayResult&type=2',
	// 			dataType: 'json',
	// 			success: function(str){
	// 				if(str.state == 100 && str.info != ""){
	// 					//如果已经支付成功，则跳转到指定页面
	// 					location.href = str.info;
	// 				}
	// 			}
	// 		});

	// 	}, 2000);

	// });

	$(".publicpaybtn").bind("click", function(event){
		var t = $(this);
		$('.pay_balance').hide();
		$('.pay_bonus').hide();

		// if($("#paytype").val() == ""){
		// 	alert(langData['siteConfig'][20][203]);
		// 	return false;
		// }
		if(depositPrice == 0){
			alert(langData['siteConfig'][20][64]);
			$("#amount").focus();
			return false;
		}
		if(!$("#agree").is(":checked")){
			alert(langData['siteConfig'][23][105]);
			return false;
		}

		$('#balance').hide();
		$.ajax({
			type: 'POST',
			url: '/include/ajax.php?service=member&action=deposit&amount='+depositPrice,
			dataType: 'json',
			success: function(str){
				var cutDown;
				info = str.info;
				if(str.state == 100 && str.info != ""){

					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					},1000)

					var datainfo = [];
					for(var k in info) {
						datainfo.push(k+'='+info[k]);
					}
					$("#module").val('deposit');
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
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

				}
			}
		});


		//验证是否支付成功，如果成功跳转到指定页面
		if(timer != null){
			clearInterval(timer);
		}
		timer = setInterval(function(){

			$.ajax({
				type: 'POST',
				async: false,
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

	});


	//支付方式切换
  $('.payTab li').bind('click', function(){
    var t = $(this), index = t.index();
    t.addClass('curr').siblings('li').removeClass('curr');
    if(index == 0){
      $('.qrpay').show();
      $('.payway, #tj, .agree').hide();
    }else{
      $('.qrpay').hide();
      $('.payway, #tj, .agree').show();
    }
  })

  //获取付款二维码
  function getQrCode(){
    $('.payTab li:eq(0)').hasClass('curr') ? $('.stepBtn').hide() : null;
    var data = $('#payform').serialize(), action = $('#payform').attr('action');

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
      						location.href = str.info;
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

});
