$(function(){
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
	}

	var enterSubmit = false;//禁止直接（回车）提交
	var paysuccess = 0;  //订单是否提交成功

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
		if (device.indexOf('huoniao') > -1) {
			$("#payform").append('<input type="hidden" name="app" value="1" />');
		}else{
			if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
				$("#alipayObj").remove();
			}
		}
		$("input[name=paytype]:first").attr("checked", true);
		if(orderTotalAmount > 0){
			$(".check-item, .confirm").css({"visibility": "visible"});
		}
		if(orderTotalAmount == 0){
			$(".pay-check").hide();
			$(".confirm").css({"visibility": "visible"});
			$("#payBtn").html(langData['siteConfig'][6][42]);
		}
	}, 500);



	//使用积分&积分商城
	// if($('.balance').size() <= 0){
		// $("#usePoint").bind("click", function(){
		// 	if($(this).is(":checked")){
		// 		$(".balancePwd, .fogetpwd").show();
		// 		// checkPayAmount();
		// 	}else{
		// 		// $(".pay-check").show();
		// 		// $(".balancePwd").hide();
		// 		// $("#payBtn").html("确认支付<span>&yen;" + totalAmount + "</span>");
		//
		// 		// $("#deliveryObj").show();
		// 	}
		// }).click();

		//计算最多可用多少个积分
		if(totalPoint > 0){
			var pointMoney = totalPoint / pointRatio, cusePoint = totalPoint;
			if(pointMoney > totalAmount){
				cusePoint = totalAmount * pointRatio;
			}
		}

	// 	compute();
	// }


	//使用余额
	$("#useBalance").bind("click", function(){
		compute();
	});

	//使用积分
	$("#usePoint").bind("click", function(){
		if(service =='integral' && !$(this).is(":checked")){
			return false;
		}
		compute();
	});

	if(service =='awardlegou'){
		compute();
	}
    //支付密码回调链接
    if($('.fogetpwd a').size() > 0) {
        var fogetpwdUrl = $('.fogetpwd a').attr('href');
        $('.fogetpwd a').attr('href', fogetpwdUrl + (fogetpwdUrl.indexOf('?') > -1 ? '&' : '?') + 'furl=' + encodeURIComponent(location.href));
    }

	//积分商城强制选中使用积分
	if(service =='integral'){
		$('#usePoint').click();
	}

    //统一计算
	function compute(){

		var totalPayAmount = totalAmount;
		var usePoint = $('#usePoint');
		if(usePoint.is(":checked")){
			$("#usePcount").val(parseInt(cusePoint));

			//积分商城模块，强制显示密码
			if(service =='integral'){
				$('.fogetpwd, .balancePwd').show();
			}else{

				//如果积分足够支付
				console.log(parseInt(cusePoint)/pointRatio,totalPayAmount);
				if(parseInt(cusePoint) / pointRatio >= totalPayAmount){
					if(service =='integral'){
						$('.pay-check').hide();
						$('.balancePwd, .fogetpwd').show();

					}else{
						$('.balance, .balancePwd, .fogetpwd, .pay-check').hide();
					}
					$("#payBtn span").html("");
				}

				totalPayAmount -= parseInt(cusePoint) / pointRatio;
			}
		}else{
			$('#usePcount').val(0);
			$('.balancePwd').hide();
		}

		var useBalance = $('#useBalance');
		if(useBalance.is(":checked") && totalPayAmount > 0){
			$(".balance, .balancePwd, .fogetpwd").show();

			var balanceTotal = totalBalance;
			if(totalBalance > totalPayAmount){
				balanceTotal = totalPayAmount;
			}

			$("#useBcount").val(balanceTotal);
			totalPayAmount -= balanceTotal;
		}else{
			if(service =='integral'){
				$(".balance").hide();
			}
			$("#useBcount").val(0);
		}

		totalPayAmount = totalPayAmount.toFixed(2);

		//如果支付金额小于等于0，则隐藏支付平台
		if(totalPayAmount <= 0){
			$(".check-item").eq(0).find('[name=paytype]').prop('checked', true);
			$("#deliveryObj").hide();
			$(".pay-check").hide();
			$("#payBtn span").html("");
		}else{
			$("#deliveryObj").show();
			$('.balance, .pay-check').show();
			if(totalPayAmount < totalAmount){
				$("#payBtn").html(langData['siteConfig'][16][68]+"<span>" + echoCurrency("symbol") + totalPayAmount + "</span>");
			}else{
				$("#payBtn").html(langData['siteConfig'][6][42]+"<span>" + echoCurrency("symbol") + totalAmount + "</span>");
			}
		}

	}

	$("#payform").submit(function(e){
		if(!enterSubmit){
			e.preventDefault();
			$("#payBtn").click();
		}
	});

	//提交支付
	$("#payBtn").bind("click", function(event){

		var t = $(this), paytype = $("input[name=paytype]:checked").val();

		if(t.hasClass("disabled")) return false;
		if($("#ordernum").val() == ""){
			// showErr("订单号获取失败，请刷新页面重试！");
			// return false;
		}

		//代付
		if(paytype == 'peerpay'){
			location.href = wxconfig.link;
			return false;
		}

		if($("#useBalance").is(":checked") && $("#paypwd").val() == ""){
			showErr(langData['siteConfig'][20][213]);
			return false;
		}

		if($(".balance").size() <= 0 && $("#usePoint").is(":checked") && $("#paypwd").val() == ""){
			showErr(langData['siteConfig'][20][213]);
			return false;
		}

		if(paytype == "" || paytype == undefined){
			showErr(langData['siteConfig'][20][203]);
			return false;
		}

		if (paytype == "alipay" && navigator.userAgent.toLowerCase().match(/micromessenger/) && appInfo.device == "") {
			showErr(langData['siteConfig'][20][378]);
			return false;
		}

		var btnHtml = t.html();
		var service = $("#service").val();
		if(service == 'integral'){
			enterSubmit = true;
			$("#payform").submit();
			return;
		}
		$("#action").val(service == "waimai" || service == "huodong" || service == "live" || service == "info"  || service == "video" ? "pay" : ($('#action_1').size() > 0 ? $('#action_1').val() : "checkPayAmount"));

		/*有奖乐购退款支付邮费*/
		if($("#paytuikuanlogtic").val() == '1'){
			$("#action").val("logticpay");
		}
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		var data = $("#payform").serialize();
		if(service == "waimai" || service == "huodong" || service == "live" || service == "info" || service == "video" || (service == "awardlegou" && $("#paytuikuanlogtic").val() == '1')){
			data += "&check=1";
		}

		$.ajax({
			url: "/include/ajax.php",
			data: data,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					$("#action").val($('#action_2').size() > 0 ? $('#action_2').val() : "pay");

					if($("#paytuikuanlogtic").val() == '1'){
						$("#action").val("logticpay");
					}
					enterSubmit = true;

					if(service == 'waimai'){
                      utils.removeStorage("wm_cart_" + $('#shopid').val());
                    }
					
					
					
                    


                    if(device.indexOf('huoniao') > -1 && $("#useBalance").is(':checked')){
                    	submitPayForm()
                    }else{
                    	$("#payform").submit();
	                    setTimeout(function(){
							t.removeClass("disabled").html(btnHtml);
	                        if(device.indexOf('huoniao') > -1) {
	                            setupWebViewJavascriptBridge(function (bridge) {
	                                bridge.callHandler('pageClose', {}, function (responseData) {
	                                });
	                            });setupWebViewJavascriptBridge(function (bridge) {
	                                bridge.callHandler('goBack', {}, function (responseData) {
	                                });
	                            });
	                        }

						}, 3000);
                    }
                    paysuccess = 1;  //订单已经成功提交
                    t.removeClass("disabled").html(btnHtml);
			

				}else{
					if(!paysuccess){
						if(data.info.indexOf('超时') > -1){
							location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1'
						}else{
							$("#action").val("pay");
							showErr(data.info);
							t.removeClass("disabled").html(btnHtml);
						}
					}
				}
			},
			error: function(){
				$("#action").val("pay");
				showErr(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(btnHtml);
			}
		});

	});


	function submitPayForm(){
		$.ajax({
	      url: '/include/ajax.php',
	      data: $("#payform").serialize(),
	      type: "POST",
	      dataType: "json",
	      success: function (data) {
	        if(data.state == 100){
	        	if(device.indexOf('huoniao') > -1) {
	        		showErrAlert('打赏成功')
	        		setTimeout(function(){
	                    setupWebViewJavascriptBridge(function (bridge) {
	                        bridge.callHandler('goBack', {}, function (responseData) {
	                        });
	                    });
	                    setupWebViewJavascriptBridge(function (bridge) {
	                        bridge.callHandler('pageClose', {}, function (responseData) {
	                        });
	                    });
	        		},2000)
                }
	        }
	      },
	      error: function(){}
	    });
	}


	//验证是否支付成功，如果成功跳转到指定页面
	peerpay = $("#peerpay").val();
	service = $("#service").val();
	paytuikuanlogtic  = $("#paytuikuanlogtic").val();
	if(peerpay!=1 && service!='shop' && paytuikuanlogtic !=1) {
		setTimeout(function () {
			var timer = setInterval(function () {

				var type = 1;
				if ($('#service').val() == 'member' || $('#service').val() == 'video') {
					type = 3;
				}

				$.ajax({
					type: 'POST',
					async: false,
					url: '/include/ajax.php?service=member&action=tradePayResult&type=' + type + '&order=' + $("#ordernum").val(),
					dataType: 'json',
					success: function (str) {
						if (str.state == 100 && str.info != "") {
							clearInterval(timer);
							//如果已经支付成功，则跳转到指定页面
							location.href = str.info;
						}
					}
				});
			}, 2000);
		}, 3000)
	}

})
