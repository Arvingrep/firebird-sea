$(function(){
	// 未付款状态
	if(!state && timeCount > 0){
		//时间换算
		function timer() {
			timeCount--

			if(timeCount <= 0){
				location.reload();
				$('.timebox').hide();
				return;
			}
			// var time = timeCount;

			var nowtime = new Date(),  //获取当前时间
				endtime = new Date(expiredDate);  //定义结束时间
			var time = endtime.getTime() - nowtime.getTime();

			timeCount = Math.floor(time/1000);

			var m = Math.floor(time/(1000*60)%60);
			var s = Math.floor(time/1000%60);
			return '<span class="mm">'+m+'</span>:<span class="ss">'+s+'</span>';
		}

		setInterval(function(){
			$(".time_cut").html(timer())
		}, 1000)
	}

	// 判断是否在微信小程序内
	 if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
		wx.miniProgram.getEnv(function (res) {
			if(res.miniprogram) {
				$(".share_pay .pay_btn").addClass('fn-hide');
				$(".copy_btn").removeClass('fn-hide');
				var clipboard;
				setTimeout(function(){
					if(!clipboard){
						clipboard = new ClipboardJS('.copy_btn');
						clipboard.on('success', function(e) {
							showErrAlert(langData['siteConfig'][46][101]);  //复制成功
						});

						clipboard.on('error', function(e) {
							showErrAlert(langData['siteConfig'][46][102]); //复制失败
						});
					}
				},1000)
			}
		})
	  }


	//未付款的订单，定时查询状态
	if(state == 0){
		var timer = setInterval(function () {

			$.ajax({
				type: 'POST',
				async: false,
				url: '/include/ajax.php?service=member&action=tradePayResult&type=1&order=' + ordernum,
				dataType: 'json',
				success: function (str) {
					if (str.state == 100 && str.info != "") {
						clearInterval(timer);
						//如果已经支付成功，则跳转到指定页面
						if(isMaster){
							location.href = str.info;
						}else{
							location.reload();
						}
					}
				}
			});
		}, 2000);
	}

	$(".publicPay").click(function () {


		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain+'/login.html';
			return false;
		}

		var action = '&action=pay';

		if (paotuitype == '1') {

			action = '&action=paotuipay';

			$("#pordertype").val('paotui');
		}

		$.ajax({
				url: '/include/ajax.php?service='+sservice+action,
				data: {'ordernum':ordernum,'peerpay':1,'peerpayfinal':0,'orderfinal':1,'confirmtype':confirmtype},
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){

						// if(device.indexOf('huoniao_Android') > -1) {
						//     setupWebViewJavascriptBridge(function (bridge) {
						//         bridge.callHandler('pageClose', {}, function (responseData) {
						//         });
						//     });
						//     location.href = data.info;
						// }else{
						//     location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
						// }

						if(typeof(paytype) !='undefined' && paytype == 1){
							location.href = data.info;

						}else{
							info = data.info;
							$("#amout").text(info.order_amount);
							$('.payMask').show();
							$('.payPop').css('transform','translateY(0)');

							$("#pfinal").val('1');
							// if(usermoney*1 < info.order_amount *1){
							//
							// 	$("#moneyinfo").text('余额不足，');
							// }
							if (usermoney * 1 < info.order_amount * 1) {

								$("#moneyinfo").text('余额不足，');
								$("#moneyinfo").closest('.check-item').addClass('disabled_pay')
							}else{
								$("#moneyinfo").text('');
								$("#moneyinfo").closest('.check-item').removeClass('disabled_pay')
							}

							if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
								$("#bonusinfo").text('额度不足，');
								$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
							}else if( bonus * 1 < info.order_amount * 1){
								$("#bonusinfo").text('余额不足，');
								$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
							}else{
								$("#bonusinfo").text('');
								$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
							}

							service 	 = sservice;
							$("#ppeerpay").val('1');
							ordernum     = info.ordernum;
							order_amount = info.order_amount;

							payCutDown('',info.timeout,info);
						}
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert("网络错误，请重试！");
				}
			});



	});
})
