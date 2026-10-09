$(function(){

	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
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

	//客户端显示系统设置页面
	setupWebViewJavascriptBridge(function(bridge) {
		$("#appSetting").attr("style", "display: block");
	});


})
