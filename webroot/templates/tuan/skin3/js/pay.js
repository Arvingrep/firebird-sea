$(function(){

	$("#paytype").val($(".pay-bank .active:eq(0)").data("type"));

	var timer = null;

	var init = {
		popshow: function() {
			$("body").append($('<div id="shadowlayer" style="display:block"></div>'));
			$("#feedback").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#feedback").hide();
			clearInterval(timer);
		}
	};

	$(".pay-pop .pop-close, .pay-pop .gray").bind("click", function(){
		init.pophide();
	});

	//支付方式
	$(".pay-bank .tab a").bind("click", function(){
		var t = $(this), index = t.index();
		!t.hasClass("current") ? t.addClass("current").siblings("a").removeClass("current") : "";
		$(".pay-bank .blist").hide();
		$(".pay-bank .blist:eq("+index+")").show();
	});

	$(".pay-bank .bank-icon").bind("click", function(){
		var t = $(this);
		if(t.data("type") != 'peerpay'){
			!t.hasClass("active") ? t.addClass("active").siblings("a").removeClass("active") : "";
			$("#paytype").val(t.data("type"));
		}
	});

	//计算最多可用多少个积分
	if(totalPoint > 0){

		var pointMoney = totalPoint / pointRatio, cusePoint = totalPoint;
		if(pointMoney > totalAmount){
			cusePoint = totalAmount * pointRatio;
		}

		//填充可使用的最大值
		$("#cusePoint").html(parseInt(cusePoint));
		$("#usePcount").val(parseInt(cusePoint));

	}

	//计算最多可用多少余额
	if(totalBalance > 0){

		var cuseBalance = totalBalance;
		if(totalBalance > totalAmount){
			cuseBalance = totalAmount;
		}
		$("#cuseBalance").html(cuseBalance);

	}

	var anotherPay = {

		//使用积分
		usePoint: function(){
			$("#usePcount").val(parseInt(cusePoint));  //重置为最大值
			$("#disMoney").html(cusePoint / pointRatio);  //计算抵扣值

			//判断是否使用余额
			if($("#useBalance").attr("checked") == "checked"){
				this.useBalance();
			}
		}

		//使用余额
		,useBalance: function(){

			var balanceTotal = totalBalance;

			//判断是否使用积分
			if($("#usePinput").attr("checked") == "checked"){

				var pointSelectMoney = $("#usePcount").val() / pointRatio;
				//如果余额不够支付所有费用，则把所有余额都用上
				if(totalAmount - pointSelectMoney < totalBalance){
					balanceTotal = totalAmount - pointSelectMoney;
				}

			//没有使用积分
			}else{

				//如果余额大于订单总额，则将可使用额度重置为订单总额
				if(totalBalance > totalAmount){
					balanceTotal = totalAmount;
				}

			}

			balanceTotal = balanceTotal < 0 ? 0 : balanceTotal;
			balanceTotal = balanceTotal.toFixed(2);
			cuseBalance = balanceTotal;
			$("#useBcount").val(balanceTotal);
			$("#balMoney, #cuseBalance").html(balanceTotal);  //计算抵扣值
		}

		//重新计算还需支付的值
		,resetTotalMoney: function(){

			var totalPayMoney = totalAmount, usePcountInput = $("#usePcount").val(), useBcountInput = $("#useBcount").val();

			if($("#usePinput").attr("checked") == "checked" && usePcountInput > 0){
				totalPayMoney -= usePcountInput / pointRatio;
			}
			if($("#useBalance").attr("checked") == "checked" && useBcountInput > 0){
				totalPayMoney -= useBcountInput;
			}

			$("#totalPayMoney").html(totalPayMoney.toFixed(2));
		}

	}


	//使用积分抵扣/余额支付
	$("#usePinput, #useBalance").bind("click", function(){
		var t = $(this), ischeck = t.attr("checked"), parent = t.closest(".account-summary"), type = t.attr("name"), label = t.closest('label')
				discharge = label.siblings('.discharge');
		if(ischeck == "checked"){
			label.addClass('bbottom');
			discharge.addClass('show');
			parent.find(".use-input, .use-tip").show();
		}else{
			label.removeClass('bbottom');
			discharge.removeClass('show');
			parent.find(".use-input, .use-tip").hide();
		}

		//积分
		if(type == "usePinput"){
			$("#disMoney").html("0");  //重置抵扣值

			//确定使用
			if(ischeck == "checked"){
				anotherPay.usePoint();

			//如果不使用积分，重新计算余额
			}else{

				$("#usePcount").val("0");

				//判断是否使用余额
				if($("#useBalance").attr("checked") == "checked"){
					anotherPay.useBalance();
				}
			}

		//余额
		}else if(type == "useBalance"){
			$("#balMoney").html("0");

			//确定使用
			if(ischeck == "checked"){
				anotherPay.useBalance();
			}else{
				$("#useBcount").val("0");
			}
		}

		anotherPay.resetTotalMoney();
	});


	//验证积分输入
	var lastInputVal = 0;
	$("#usePcount").bind("blur", function(){
		var t = $(this), val = t.val();

		//判断输入是否有变化
		if(lastInputVal == val) return;

		if(val > cusePoint){
			alert("此单最多可用 "+cusePoint+" 个"+pointName);
			$("#usePcount").val(cusePoint);
			$("#disMoney").html(cusePoint / pointRatio);
			lastInputVal = cusePoint;
		}else{
			lastInputVal = val;
			$("#disMoney").html(val / pointRatio);
		}

		//判断是否使用余额
		if($("#useBalance").attr("checked") == "checked"){
			anotherPay.useBalance();
		}
		anotherPay.resetTotalMoney();

	});


	//验证余额输入
	$("#useBcount").bind("blur", function(){
		var t = $(this), val = Number(t.val()), check = true;

		cuseBalance = Number(cuseBalance);

		var exp = new RegExp("^(?:[1-9]\\d*|0)(?:.\\d{1,2})?$", "img");
		if(!exp.test(val)){
			check = false;
		}

		if(!check){
			alert("请输入正确的数值，最多支持两位小数！");
			$("#useBcount").val("0");
			$("#balMoney").html("0");
		}else if(val > cuseBalance){
			alert("此单最多可用 "+cuseBalance+" "+echoCurrency('short'));
			$("#useBcount").val(cuseBalance);
			$("#balMoney").html(cuseBalance);
		}else{
			$("#balMoney").html(val);
		}
		anotherPay.resetTotalMoney();
	});


	//提交支付
	$("#tj").bind("click", function(event){
		var t = $(this);

		if($("#ordernum").val() == ""){
			alert("订单号获取失败，请刷新页面重试！");
			return false;
		}
		if($("#paytype").val() == ""){
			alert("请选择支付方式！");
			return false;
		}


		var pinputCheck  = $("#usePinput").attr("checked"),
				point        = $("#usePcount").val(),
				balanceCheck = $("#useBalance").attr("checked"),
				balance       = $("#useBcount").val(),
				paypwd       = $("#paypwd").val();

		if(balanceCheck == "checked" && balance > 0 && paypwd == ""){
			alert("请输入支付密码！");
			return false;
		}

		if((pinputCheck == "checked" && point > 0) || (balanceCheck == "checked" && balance > 0)){

			var data = [];
			data.push('ordernum='+ordernum);

			//积分
			if(pinputCheck == "checked" && point > 0){
				data.push('point='+point);
			}

			//余额
			if(balanceCheck == "checked" && balance > 0){
				data.push('useBalance=1');
				data.push('balance='+balance);
				data.push('paypwd='+paypwd);
			}

			t.attr("disabled", true).html("提交中...");

			$.ajax({
				url: "/include/ajax.php?service=tuan&action=checkPayAmount",
				data: data.join("&"),
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){

						$("#payform").submit();
						init.popshow();
						t.attr("disabled", false).html("立即支付");


						//验证是否支付成功，如果成功跳转到指定页面
						if(timer != null){
							clearInterval(timer);
						}
						timer = setInterval(function(){

							$.ajax({
								type: 'POST',
								async: false,
								url: '/include/ajax.php?service=member&action=tradePayResult&type=1&order='+ordernum,
								dataType: 'json',
								success: function(str){
									if(str.state == 100 && str.info != ""){
										//如果已经支付成功，则跳转到指定页面
										location.href = str.info;
									}
								}
							});

						}, 2000);

					}else{
						alert(data.info);
						t.attr("disabled", false).html("立即支付");
					}
				},
				error: function(){
					alert("网络错误，请重试！");
					t.attr("disabled", false).html("立即支付");
				}
			});



		}else{

			$("#usePcount, #useBcount, #paypwd").val("");

			$("#payform").submit();
			init.popshow();


			//验证是否支付成功，如果成功跳转到指定页面
			if(timer != null){
				clearInterval(timer);
			}
			timer = setInterval(function(){

				$.ajax({
					type: 'POST',
					async: false,
					url: '/include/ajax.php?service=member&action=tradePayResult&type=1&order='+ordernum,
					dataType: 'json',
					success: function(str){
						if(str.state == 100 && str.info != ""){
							//如果已经支付成功，则跳转到指定页面
							location.href = str.info;
						}
					}
				});

			}, 2000);

		}





	});


});
