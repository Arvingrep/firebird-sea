$(function(){

	var djs = $('.second');

	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
	}


	//倒计时（开始时间、结束时间、显示容器）
	var countDown = function(time, obj, func){
		obj.text(time+'s');
		mtimer = setInterval(function(){
			obj.text((--time+'s'));
			if(time <= 0) {
				clearInterval(mtimer);
				obj.text('');
				$('.cp-cnt,.wait-p').hide();
				$('.tip p').addClass('active')
			}
		}, 1000);
	}

	countDown(5,djs);

	//调起客户端支付
    setupWebViewJavascriptBridge(function(bridge) {
		$(".repay").click(function(){
			bridge.callHandler(appCall, {
				"orderInfo": orderInfo
			}, function(responseData){
				// alert(responseData);
			})
		});

		$(".repay").click();
    });


	//验证是否支付成功，如果成功跳转到指定页面
	setTimeout(function(){
		var timer = setInterval(function(){
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
	}, 3000)

})
