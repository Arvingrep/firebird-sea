$(function(){


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t          = $(this),
				name       = $("#name"),
				post       = $("#post"),
				photo      = $("#litpic").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//验证名称
		if($.trim(name.val()) == ""){
			name.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+name.data("title"));
			offsetTop = name.offset().top;
		}

		//验证职位
		if($.trim(post.val()) == ""){
			post.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+post.data("title"));
			offsetTop = post.offset().top;
		}

    //头像
    if(photo == "" && offsetTop == 0){
      $.dialog.alert(langData['siteConfig'][27][125]);
      offsetTop = $(".thumb").offset().top;
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
					t.removeClass("disabled").html(langData['siteConfig'][6][69]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][69]);
				$("#verifycode").click();
			}
		});


	});


});
