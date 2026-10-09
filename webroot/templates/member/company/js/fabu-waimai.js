$(function(){


	//表单验证
	var regex = {

		regexp: function(t, reg, err){
			var val = $.trim(t.val()), dl = t.closest("dl"), name = t.attr("name"),
					tip = t.data("title"), etip = tip, hline = dl.find(".tip-inline"), check = true;

			if(val != ""){
				var exp = new RegExp("^" + reg + "$", "img");
				if(!exp.test(val)){
					etip = err;
					check = false;
				}
			}else{
				check = false;
			}

			if(dl.attr("data-required") == 1){
				if(val == "" || !check){
					hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
				}else{
					hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
				}
				return check;
			}
		}

		//价格
		,price: function(){
			return this.regexp($("#price"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}


	}

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t = $(this),
			title   = $("#title"),
			typeid  = $("#typeid").val(),
			price   = $("#price"),
			litpic   = $("#litpic").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//验证名称
		if($.trim(title.val()) == ""){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+title.data("title"));
			offsetTop = title.offset().top;
		}

		//验证分类
		if(typeid == "" || typeid == 0){
			var dl = $("#selType");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][50]);
			offsetTop = offsetTop == 0 ? dl.position().top : offsetTop;
		}

		//验证价格
		if(!regex.price() && offsetTop <= 0){
			offsetTop = $("#price").position().top;
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
