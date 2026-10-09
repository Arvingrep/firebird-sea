$(function(){

	var convertPrice = 0;

	//表单验证
	$(".inp").bind("input click focus", function(){
		$(this).removeClass("error").siblings(".tip-inline").removeClass().addClass("tip-inline").show();
	});


	//金额验证
	$("#amount").bind("blur", function(){
		var t = $(this), val = t.val(), tip = t.siblings(".tip-inline");

		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(val)) {

			tip.removeClass().addClass("tip-inline error").html('<s></s>'+langData['siteConfig'][20][63]).show();
			t.addClass("error");
			$("#count").html(0);
			convertPrice = 0;

		}else if(val > totalMoney){

			tip.removeClass().addClass("tip-inline error").html('<s></s>'+langData['siteConfig'][20][214]).show();
			t.addClass("error");
			$("#count").html(0);
			convertPrice = 0;

		}else{
			t.removeClass("error");
			tip.removeClass().addClass("tip-inline ok").html('<s></s>'+langData['siteConfig'][20][63]).show();
			$("#count").html(val * pointRatio);
			convertPrice = val;
		}

	});


	//支付密码
	$("#paypwd").bind("blur", function(){
		var t = $(this), val = t.val(), tip = t.siblings(".tip-inline");
		if(val == ""){
			tip.removeClass().addClass("tip-inline error").show();
			t.addClass("error");
		}else{
			t.removeClass("error");
			tip.removeClass().addClass("tip-inline ok").show();
		}
	});


	//提交支付
	$("#tj").bind("click", function(event){
		var t = $(this);

		if(convertPrice == 0){
			alert(langData['siteConfig'][20][516]);
			$("#amount").focus();
			return false;
		}
		if(convertPrice > totalMoney){
			alert(langData['siteConfig'][20][215]);
			$("#amount").focus();
			return false;
		}
		if($("#paypwd").val() == ""){
			alert(langData['siteConfig'][20][216]);
			$("#paypwd").focus();
			return false;
		}
		if(!$("#agree").is(":checked")){
			alert(langData['siteConfig'][20][517]);
			return false;
		}

		var action = $("#payform").attr("action"), data = $("#payform").serialize();

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: langData['siteConfig'][20][217],
						ok: function(){
							location.reload();
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][43]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).html(langData['siteConfig'][6][43]);
			}
		});


	});

});
