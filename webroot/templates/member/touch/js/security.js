$(function(){

  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })

  	//注销账号弹出
	$('.operate li.logOff').click(function(){
    	$('.off-mask').show();
    	$('.offWrap').animate({'bottom':'0'},200)

		toggleDragRefresh('off');
  	})

  	//注销账号关闭
	$('.off-mask,.off-close').click(function(){
	    $('.off-mask').hide();
	    $('.offWrap').animate({'bottom':'-100%'},200)

		toggleDragRefresh('on');
	})

  	//同意注销
	$('.off-agree').delegate("a", "click", function(){
		var t = $(this);
		if(t.hasClass('disabled')) return false;

		$('.delMask').addClass('show');
		$('.delAlert').show();

	});
	//确认删除
	$('.sureDel').click(function(e){
		var t = $('.off-agree a'), txt = t.text();
		$('.delMask').removeClass('show');
		$('.delAlert').hide();
		t.addClass("disabled").html('申请中...');//退出中
		$.ajax({
			url: "/include/ajax.php?service=member&action=canceLlation",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					//注销成功
					t.addClass("disabled").html('申请中...');//注销成功
					var device = navigator.userAgent;
					if(device.indexOf('huoniao') > -1){
						if(device.toLowerCase().indexOf('android') > -1){
		                    $('body').append('<iframe src="'+masterDomain+'/logout.html?from=app" style="display: none;"></iframe>');
		                }
						setTimeout(function(){
							$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain, path: '/'});
							 setupWebViewJavascriptBridge(function(bridge) {
			                  bridge.callHandler('appLogout', {}, function(){});
			                  bridge.callHandler("goBack", {}, function(responseData){});
			                  bridge.callHandler('pageReload',	{},	function(responseData){});
							});
						},1000)

					}else{
				      	window.location.href="/logout.html"
				    }

				}else{
					alert(data.info);
					t.removeClass("disabled").html(txt);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
				t.removeClass("disabled").html(txt);
			}
		});
	})

	//关闭删除
	$('.cancelDel,.delMask').click(function(){
		$('.delMask').removeClass('show');
		$('.delAlert').hide();
	})



})
