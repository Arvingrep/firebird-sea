$(function(){

	setTimeout(function(){

		if(appInfo.device == ""){
				// 赏
				if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
						$(".alipay").remove();
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

		if(type == "balance"){
			$("#useBalance").val(1);
		}else{
			$("#useBalance").val(0);
		}
	});


})
