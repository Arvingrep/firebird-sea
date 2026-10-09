$(function(){

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t = $(this),
			title   = $("#title"),
			litpic  = $("#litpic"),
			video   = $("#video");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//验证名称
		if($.trim(title.val()) == ""){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+title.data("title"));
			offsetTop = title.offset().top;
		}

		//验证缩略图
		if($.trim(litpic.val()) == ""){
			$.dialog.alert(langData['siteConfig'][27][78]);
			return false;
		}

		//验证视频地址
		if($.trim(video.val()) == ""){
			video.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+video.data("title"));
			offsetTop = video.offset().top;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['shop'][1][7];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}
					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip,
						ok: function(){
							location.href = url;
						}
					});
				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['shop'][1][7]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][7]);
				$("#verifycode").click();
			}
		});


	});


});
