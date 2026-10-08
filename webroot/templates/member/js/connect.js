var pageReload = true;
var nowBtn = null;
var nowCode = '';
$(function(){

	// $(".sidebar dl").each(function(index){
	// 	if(index > 0){
	// 		$(this).addClass("curr");
	// 		$(this).find("dd").hide();
	// 	}
	// });

	//绑定社交帐号
	$(".fail a").bind("click", function(e){
		e.preventDefault();
		var href = $(this).attr("href");
		nowBtn = $(this);
		nowCode = href.split("type=")[1];
		loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

		$(this).addClass("disabled").html("<img src='"+staticPath+"images/loading_16.gif' /> "+langData['siteConfig'][6][134]+"...");  //绑定中

		//判断窗口是否关闭
		mtimer = setInterval(function(){
			if(loginWindow.closed){
				clearInterval(mtimer);

				pageReload && location.reload();
			}
		}, 1000);
	});

	//解除绑定
	$(".ok a").bind("click", function(){
		var t = $(this), li = t.closest("li"), id = li.data("id");
		if(id != "" && id != 0 && id != undefined && !t.hasClass("disabled")){
			$.dialog.confirm(langData['siteConfig'][20][254], function(){     //请输入企业法人的证件号（身份证、护件照、军官证等均可） 
				t.addClass("disabled").html("<img src='"+staticPath+"images/loading_16.gif' /> "+langData['siteConfig'][6][135]+"...");   //解除中

				$.ajax({
					url: "/include/ajax.php?service=member&action=unbindConnect",
					data: "id="+id,
					type: "POST",
					dataType: "json",
					success: function (data) {
						if(data && data.state == 100){

							t.removeClass("disabled").html(langData['siteConfig'][20][255]);   //解除成功
							setTimeout(function(){
								location.reload();
							}, 1000);

						}else{
							$.dialog.alert(data.info);
							t.removeClass("disabled").html(langData['siteConfig'][6][133]); //解除绑定
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
							t.removeClass("disabled").html(langData['siteConfig'][6][133]);//解除绑定
					}
				});

			});
		}
	});

});
// 第三方账号已绑定其他用户
function hasBindOtherUser(sameConn){
	pageReload = false;
	$.dialog.confirm(langData['siteConfig'][21][251], function(){
		//该第三方账号已经注册过会员，确定要将该第三方账号绑定到当前登陆账号下吗？<br>确定后原账号将解除该第三方账号绑定，确认进入下一步？
		$.ajax({
			url: "/include/ajax.php?service=member&action=changeConnectBind",
			data: {sameConn: sameConn, code: nowCode},
			type: "post",
			dataType: "jsonp",
			success: function(data){
				if(data && data.state == 100){
					nowBtn.removeClass("disabled").html(langData['siteConfig'][6][133]);  //解除绑定
					setTimeout(function(){
						location.reload();
					}, 1000);
				}else{
					pageReload = true;
					$.dialog.alert(data.info);
					nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);  //立即绑定
				}
			},
			error: function(){
				pageReload = true;
				$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
				nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);  //立即绑定
			}
		})
	}, function(){
		setTimeout(function(){
			pageReload = true;
		},1200)
		nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);//立即绑定
	})
}