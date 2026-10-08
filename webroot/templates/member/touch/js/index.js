$(function(){

	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
		$("#appSetting").attr("style", "display: block");
		$('.fixFooter').hide();
	}

	//获取天气预报
	$.ajax({
		url: "/include/ajax.php?service=siteConfig&action=getWeatherApi&day=1&skin=2",
		dataType: "json",
		success: function (data) {
			if(data && data.state == 100){
				$("#weather").append(data.info);
			}
		}
	});

	//导航
	$('.header-r').click(function(){
		var nav = $('.nav'), t = $('.nav').css('display') == "none";
		if (t) {nav.show();}else{nav.hide();}
	});

	//客户端登录验证
	if (device.indexOf('huoniao') > -1) {
		setupWebViewJavascriptBridge(function(bridge) {
			//未登录状态下，隔时验证是否已登录，如果已登录，则刷新页面
			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				var timer = setInterval(function(){
					userid = $.cookie(cookiePre+"login_user");
					if(userid){
						$.ajax({
							url: masterDomain+'/getUserInfo.html',
							type: "get",
							async: false,
							dataType: "jsonp",
							success: function (data) {
								if(data){
									clearInterval(timer);
									bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo, 'dating_uid': data.dating_uid}, function(){});
									bridge.callHandler('pageReload', {}, function(responseData){});
								}
							}
						});

						// location.reload();
					}
				}, 500);
			}
		})
	}

})
