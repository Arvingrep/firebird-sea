$(function(){
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
	}

	//错误提示
	var showErrTimer, showErr = function(txt){
		showErrTimer && clearTimeout(showErrTimer);
		$(".gzAddrErr").remove();
		$("body").append('<div class="gzAddrErr"><p>'+txt+'</p></div>');
		$(".gzAddrErr p").css({"margin-left": -$(".gzAddrErr p").width()/2, "left": "50%"});
		$(".gzAddrErr").css({"visibility": "visible"});
		showErrTimer = setTimeout(function(){
			$(".gzAddrErr").fadeOut(300, function(){
				$(this).remove();
			});
		}, 1500);
	}

	//验证是否在客户端访问
	setTimeout(function(){
		if(appInfo.device == ""){
			if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
				$("#alipayObj").remove();
			}
		}else{
			$("#payform").append('<input type="hidden" name="app" value="1" />');
		}
		$("input[name=paytype]:first").attr("checked", true);
		$(".check-item, .confirm").css({"visibility": "visible"});
	}, 500);

	//提交支付
	$("#payBtn").bind("click", function(event){
		var t = $(this), paytype = $("input[name=paytype]:checked").val();

		if($("#ordernum").val() == ""){
			// showErr("订单号获取失败，请刷新页面重试！");
			// return false;
		}
		if(paytype == "" || paytype == undefined){
			showErr(langData['siteConfig'][20][203]);
			return false;
		}

		if (paytype == "alipay" && navigator.userAgent.toLowerCase().match(/micromessenger/) && appInfo.device == "") {
			showErr(langData['siteConfig'][20][378]);
			return false;
		}

		$("#payform").submit();

	});

})
