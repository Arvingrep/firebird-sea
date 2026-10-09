$(function(){

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t       = $(this),
				title   = $("#title"),
				addr    = $("#addr").val(),
				person  = $("#person"),
				tel     = $("#tel"),
				vdimgck = $("#vdimgck");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.offset().top;
		}

		var category = $("#category"),
				note     = $("#note"),
				lei      = $("#lei"),
				addrid   = $("#addrid").val(),
				contact  = $("#tel");

		//验证供求
		if(category.val() == ""){
			var dl = category.closest("dl");
			if(dl.find("input[type=hidden]").val() == ""){
				dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".radio").attr("data-title"));
				offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
			}
		}

		//验证描述
		var noteRegex = '.{10,500}', noteErrTip = langData['siteConfig'][20][522];   //输入错误，请正确填写手机号码
		var exp = new RegExp("^" + noteRegex + "$", "img");
		if(!exp.test(note.val())){
			note.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+noteErrTip);
			offsetTop = offsetTop == 0 ? note.offset().top : offsetTop;
		}

		//验证类别
		if(lei.val() == ""){
			var dl = lei.closest("dl");
			if(dl.find("input[type=hidden]").val() == ""){
				dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".radio").attr("data-title"));
				offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
			}
		}

		//验证区域
		if(addrid == "" || addrid == 0){
			$("#selAddr .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#selAddr .sel-group:eq(0)").attr("data-title"));
			offsetTop = offsetTop == 0 ? $("#selAddr").offset().top : offsetTop;
		}

		//验证联系人
		var exp = new RegExp("^" + personRegex + "$", "img");
		if(!exp.test(person.val())){
			person.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+personErrTip);
			offsetTop = offsetTop == 0 ? person.offset().top : offsetTop;
		}

		//验证手机号码
		var exp = new RegExp("^" + telRegex + "$", "img");
		if(!exp.test(contact.val())){
			contact.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+telErrTip);
			offsetTop = offsetTop == 0 ? contact.offset().top : offsetTop;
		}


		//验证验证码
		// if($.trim(vdimgck.val()) == ""){
		// 	vdimgck.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][176]);   //请输入验证码
		// 	offsetTop = offsetTop == 0 ? vdimgck.offset().top : offsetTop;
		// }

		if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];   //发布成功
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];    //修改成功！
					}
					$.dialog({ 
						title: langData['siteConfig'][19][287],  //提示消息
						icon: 'success.png',
						content: tip + (data.info.indexOf('|1') > 0 ? '' :  ("，" + langData['siteConfig'][20][404]) ),//正在审核中，请耐心等待！
						ok: function(){
							location.href = url;
						}
					});
				}else{
					$.dialog.alert(data.info); 
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
				$("#verifycode").click();
			}
		});


	});

});
