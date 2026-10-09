$(function(){

	setTimeout(function(){

		if(appInfo.device == ""){
				if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
						$(".alipay, .globalalipay").remove();
				}
		}else{
				$("#payform").append('<input type="hidden" name="app" value="1" />');
		}

		$(".pay_way li:first").addClass("on");
		$("#paytype").val($(".pay_way li:first").data("type"));
		$(".pay_way").show();

	}, 500);

	$(".pay_way ul li").click(function(){
		var x = $(this), type = x.data("type");
		x.addClass("on");
		x.siblings().removeClass("on");

		$("#paytype").val(type);
	});

  //使用余额
	$("#useBalance").bind("click", function(){
    payTotalAmoumt();
  });

  payTotalAmoumt();

  function payTotalAmoumt() {
    var btn = $("#useBalance");
		if(btn.is(":checked")){
			var balanceTotal = totalBalance;
			if(totalBalance > totalAmount){
				balanceTotal = totalAmount;
			}
			$("#useBcount").val(balanceTotal);

			var payAmount = (totalAmount-balanceTotal).toFixed(2);

			//如果支付金额小于等于0，则隐藏支付平台
			if(payAmount <= 0){
				// $(".pay-check").hide();
				$("#submit span").html("");
			}else{
				$("#submit").html(langData['siteConfig'][16][68]+"<span>" + echoCurrency("symbol") + payAmount + "</span>");
			}

		}else{
			// $(".pay-check").show();
			$("#submit").html(langData['siteConfig'][6][42]+"<span>" + echoCurrency("symbol") + totalAmount + "</span>");
		}
  }


})
