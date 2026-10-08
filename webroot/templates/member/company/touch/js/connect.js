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
		// e.preventDefault();
		var href = $(this).attr("href");
		nowBtn = $(this);
		nowCode = href.split("type=")[1];
		// loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

		$(this).addClass("disabled").html("<img src='"+staticPath+"images/loading_16.gif' /> "+langData['siteConfig'][6][134]+"...");

		//判断窗口是否关闭
		// mtimer = setInterval(function(){
		// 	if(loginWindow.closed){
		// 		clearInterval(mtimer);

		// 		pageReload && location.reload();
		// 	}
		// }, 1000);
	});

	//解除绑定
	$(".ok a").bind("click", function(){
		var t = $(this), li = t.closest("li"), id = li.data("id");
		if(id != "" && id != 0 && id != undefined && !t.hasClass("disabled")){
			if(confirm(langData['siteConfig'][20][254])){
				t.addClass("disabled").html("<img src='"+staticPath+"images/loading_16.gif' /> "+langData['siteConfig'][6][135]+"...");

				$.ajax({
					url: masterDomain + "/include/ajax.php?service=member&action=unbindConnect",
					data: "id="+id,
					type: "POST",
					dataType: "json",
					success: function (data) {
						if(data && data.state == 100){

							t.removeClass("disabled").html(langData['siteConfig'][20][255]);
							setTimeout(function(){
								location.reload();
							}, 1000);

						}else{
							alert(data.info);
							t.removeClass("disabled").html(langData['siteConfig'][6][133]);
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);
							t.removeClass("disabled").html(langData['siteConfig'][6][133]);
					}
				});

			};
		}
	});

	if(sameConnData != ''){
		var connData = sameConnData.split('#');
		nowCode = connData[0];
		sameConn = connData[1];
		nowBtn = $('#code_'+nowCode);
		nowBtn.addClass("disabled").html("<img src='"+staticPath+"images/loading_16.gif' /> "+langData['siteConfig'][6][134]+"...");
		hasBindOtherUser(sameConn);
	}

	$(".phone_msg .confirm").click(function(){
		$(".phone_msg").addClass("fn-hide");
		$.ajax({
			url: "/include/ajax.php?service=member&action=changeConnectBind",
			data: {sameConn: sameConn, code: nowCode},
			type: "post",
			dataType: "jsonp",
			success: function(data){
				if(data && data.state == 100){
					nowBtn.removeClass("disabled").html(langData['siteConfig'][6][133]);
					setTimeout(function(){
						location.reload();
					}, 1000);
				}else{
					pageReload = true;
					$.dialog.alert(data.info);
					nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);
				}
			},
			error: function(){
				pageReload = true;
				$.dialog.alert(langData['siteConfig'][20][183]);
				nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);
			}
		})
	})

	$(".phone_msg .close").click(function(){
		$(".phone_msg").addClass("fn-hide");
		nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);
	})

});

// 第三方账号已绑定其他用户
function hasBindOtherUser(sameConn){
	pageReload = false;
	$(".phone_msg").removeClass("fn-hide");
	pageReload = true;
	// nowBtn.removeClass("disabled").html(langData['siteConfig'][6][40]);
}