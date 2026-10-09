$(function(){

	var transferCount = 0;

	//表单验证
	$(".inp").bind("input click focus", function(){
		$(this).removeClass("error").siblings(".tip-inline").removeClass().addClass("tip-inline").show();
	});


	//对方用户名
	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), tip = t.siblings(".tip-inline");
		if(val == ""){
			tip.removeClass().addClass("tip-inline error").show();
			t.addClass("error");
		}else{
			t.removeClass("error");
			tip.removeClass().addClass("tip-inline ok").show();
		}
	});


	//数量验证
	$("#amount").bind("blur", function(){
		var t = $(this), val = t.val(), tip = t.siblings(".tip-inline");
		var fee = val * pointFee / 100;

		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(val)) {

			tip.removeClass().addClass("tip-inline error").html('<s></s>'+langData['siteConfig'][20][218]).show();
			t.addClass("error");
			$("#fee").html(0);
			$("#true").html(0);
			transferCount = 0;

		}else if(val > totalPoint){

			tip.removeClass().addClass("tip-inline error").html('<s></s>'+langData['siteConfig'][20][579].replace('1', pointName)).show();
			t.addClass("error");
			$("#fee").html(0);
			$("#true").html(0);
			transferCount = 0;

		}else{
			t.removeClass("error");
			tip.removeClass().addClass("tip-inline ok").html('<s></s>'+langData['siteConfig'][20][218]).show();
			$("#fee").html(fee);
			$("#true").html(val - fee);
			transferCount = val;
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

		if($("#user").val() == ""){
			alert(langData['siteConfig'][20][220]);
			$("#user").focus();
			return false;
		}
		if(transferCount == 0){
			alert(langData['siteConfig'][20][221]);
			$("#amount").focus();
			return false;
		}
		if(transferCount > totalPoint){
			alert(langData['siteConfig'][20][222]);
			$("#amount").focus();
			return false;
		}
		if($("#paypwd").val() == ""){
			alert(langData['siteConfig'][20][216]);
			$("#paypwd").focus();
			return false;
		}
		if(!$("#agree").is(":checked")){
			alert(langData['siteConfig'][20][580]);
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
						content: langData['siteConfig'][20][223],
						ok: function(){
							location.reload();
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][46]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).html(langData['siteConfig'][6][46]);
			}
		});


	});

});
