$(function(){
	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

	//表单提示
	$(".form").delegate("input[type=text]", "focus", function(){
		var t = $(this), tip = t.data("title"), hline = t.siblings(".tip-inline");
		hline.removeClass().addClass("tip-inline focus").html("<s></s>"+tip);
	});

	$("#type").bind("change", function(){
		var t = $(this), tip = t.data("title"), hline = t.siblings(".tip-inline");
		if(t.val() == ""){
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
		}else{
			hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
		}
	});

	$(".form").delegate("input[type=text]", "blur", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), hline = t.siblings(".tip-inline"), check = true;
		if($.trim(t.val()) != ""){
			//验证码
			if(name == "vdimgck"){
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=checkVdimgck&code="+t.val(),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							if(data.info == "error"){
								hline.removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][99]);  //验证码输入错误，请重试！
							}else{
								hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
							}
						}
					}
				});
				return;
			}
			hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
		}else{
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
		}
	});

	//提交
	$("#submit").bind("click", function(event){
		event.preventDefault();

		var t = $(this), check = true;
		if($("#desc").val() == ""){
			alert(langData['siteConfig'][20][385]);  //请填写留言内容！
			check = false;
		}
		if(!check) return false;
		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");//提交中

		$.ajax({
			url: "/include/ajax.php",
			data: {
				"service": "member",
				"action": "suggestion",
				"desc": $("#desc").val(),
				"phone": $("#phone").val()
			},
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					t.html(langData['siteConfig'][21][242]);//举报成功！
				}else{
					alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][151]);//提交
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
				t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交
			}
		});

	});
});
