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
	function createAndOpenIframe(url) {
    	// 创建一个iframe元素
	    let iframe = document.createElement('iframe');
	    
	    // 设置iframe的属性
	    iframe.src = url; // 设置iframe的src属性为要打开的页面
	    iframe.height = '0'; // 设置iframe的高度
	    iframe.width = '0'; // 设置iframe的宽度
	    iframe.id = 'doc_iframe'; // 设置iframe的id
	    // 添加onload事件，以便在iframe加载完成后执行一些操作
	    if (iframe.attachEvent) {
	        iframe.attachEvent('onload', function() {
	            console.log('Iframe loaded using attachEvent');
	            // 这里可以添加一些在iframe加载完成后要执行的代码
	        });
	    } else {
	        iframe.onload = function() {
	            console.log('Iframe loaded using onload');
	            // 这里可以添加一些在iframe加载完成后要执行的代码
	        };
	    }
	    
	    // 将创建好的iframe元素添加到页面中的一个指定位置
	    document.getElementById('iframe-box').appendChild(iframe);
	}
	//调起客户端支付
	function appPay(){
		let isn_ios = navigator.userAgent.toLowerCase().indexOf('huoniao_android') > -1 || navigator.userAgent.toLowerCase().indexOf('huoniao_harmony') > -1;
		if(isn_ios || appCall == 'wechatPay' || appCall == 'aliPay'){
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
		}else if(appCall == 'allInPayWx'){ //ios端微信通联支付 跳转第三方小程序
			// 新增的通用支付方式 -- 通用微信 => 跳转第三方小程序
			let paramArr = []
			for(let item in orderInfo){
				paramArr.push(item + '=' + orderInfo[item])
			}
			let miniId = 'gh_e64a1a89a0ad';
			let miniPath = '/pages/orderDetail/orderDetail'
			miniPath = miniPath + '?' + paramArr.join('&')
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler('redirectToWxMiniProgram', {'id':miniId,'path': miniPath},  function(responseData){});
			})
		}else if(appCall == 'allInPayAli'){ //ios端支付宝通联支付 通过iframe打开支付宝
			// 调用函数来创建并打开iframe
			createAndOpenIframe(orderInfo);
		} 
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
