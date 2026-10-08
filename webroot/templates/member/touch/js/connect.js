var pageReload = true;
var nowBtn = null;
var nowCode = '';
$(function(){

    var device = navigator.userAgent;

	// $(".sidebar dl").each(function(index){
	// 	if(index > 0){
	// 		$(this).addClass("curr");
	// 		$(this).find("dd").hide();
	// 	}
	// });

	//绑定社交帐号
	$(".fail a").bind("click", function(e){
		var href = $(this).attr("href");
		nowBtn = $(this);
		nowCode = href.split("type=")[1];

		var id = $(this).attr("id");
		if($(this).hasClass('disabled')) return false;

        //微信登录验证
		if(!device.toLowerCase().match(/micromessenger/) && device.toLowerCase().match(/iphone|android/) && device.indexOf('huoniao') <= -1 && id == 'code_wechat'){
			alert(langData['siteConfig'][44][63]);//请在微信或者APP中使用此功能！
			return false;
		}

        if((device.indexOf('huoniao') <= -1 && device.indexOf('Alipay') <= -1) && alipay_app_login == false && id == 'code_alipay'){
            alert(langData['siteConfig'][44][64]);//请在支付宝或者APP中使用此功能！
            return false;
        }

        $(this).addClass("disabled").html(langData['siteConfig'][6][134] + "...");

        if(device.indexOf('huoniao') > -1 && (id == 'code_qq' || id == 'code_wechat' || id == 'code_alipay' || id == 'code_sina')){
            setupWebViewJavascriptBridge(function(bridge) {

                var action = "", loginData = {};

                //QQ登录
                if(id == "code_qq"){
                    action = "qq";
                }

                //微信登录
                if(id == "code_wechat"){
                    action = "wechat";
                }

                //新浪微博登录
                if(id == "code_sina"){
                    action = "sina";
                }

                //支付宝登录
                if(id == "code_alipay"){
                    action = "alipay";
                    loginData = alipay_app_login;
                }


                bridge.callHandler(action+"Login", loginData, function(responseData) {
                    if(responseData){
                        var data = JSON.parse(responseData);
                        var access_token = data.access_token ? data.access_token : data.accessToken, openid = data.openid, unionid = data.unionid;

                        //异步提交
                        $.ajax({
                            url: masterDomain+"/api/login.php",
                            data: "type="+action+"&action=appback&access_token="+access_token+"&openid="+openid+"&unionid="+unionid+"&qr="+qr,
                            type: "GET",
                            dataType: "text",
                            success: function (data) {
								if(data.indexOf('alert(') > -1){
									$("body").append('<div style="display:none;">'+data+'</div>');
								}else{
									alert(langData['siteConfig'][21][250]);  //恭喜您，绑定成功！
								}
								location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                            },
                            error: function(){
                                alert(langData['siteConfig'][20][168]);
								location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                            }
                        });
                    }
                });
            });
            return false;
        }

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
								location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
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
						location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
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
