$(function(){

	var djs = $('.second');

	//倒计时（开始时间、结束时间、显示容器）
	var countDown = function(time, obj, func){
		obj.text(langData['siteConfig'][45][39].replace('1',time));//1秒
		mtimer = setInterval(function(){
			obj.text(langData['siteConfig'][45][39].replace('1',(--time)));
			if(time <= 0) {
				clearInterval(mtimer);
				obj.text('');
				$('.cp-cnt,.wait-p').hide();
				$('.tip p').addClass('active')
			}
		}, 1000);
	}

	countDown(5,djs);

	var isOpen = false;

	//调起客户端支付
	function appPay(){
		setupWebViewJavascriptBridge(function(bridge) {
			isOpen = true;
			bridge.callHandler(appCall, {
				"orderInfo": orderInfo
			}, function(responseData){
			    if(responseData){
				    // alert(responseData);
			    }
			});
		});
	}

	//重新支付
	$(".repay").click(function(){
		appPay();
	});

	//延迟一秒调用APP支付
	setTimeout(function(){
		appPay();
	}, 1500);

	//三秒后还没有调用的话，刷新页面
	setTimeout(function(){
		if(!isOpen){
			location.href = location.href.indexOf('currentPageOpen') > -1 ? location.href : location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
		}
	}, 4000);



	//验证是否支付成功，如果成功跳转到指定页面
	setTimeout(function(){
		var timer = setInterval(function(){
			$.ajax({
				type: 'POST',
				async: false,
				url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
				dataType: 'json',
				success: function(str){
					if(str.state == 100 && str.info != ""){
                        clearInterval(timer);
						// if(device.indexOf('huoniao_Android') > -1) {
	                    //     setupWebViewJavascriptBridge(function (bridge) {
	                    //         bridge.callHandler('pageClose', {}, function (responseData) {
	                    //         });
	                    //     });
	                    //     location.href = str.info;
	                    // }else{
                      
	                        location.href = str.info + (str.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1&paytest=1';
                      		
	                    // }
					}
				}
			});
		}, 2000);
	}, 3000)

})
