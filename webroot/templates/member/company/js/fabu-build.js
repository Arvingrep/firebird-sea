$(function(){

	getEditor("body");

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

		//分类
		,typeid: function(){
			return this.regexp($("#typeid"), "[1-9]\\d*", langData['siteConfig'][21][151]);//请选择商品分类
		}

		//品牌
		,brand: function(){
			return this.regexp($("#brand"), "[1-9]\\d*", langData['siteConfig'][45][74]);//请选择品牌
		}

		//名称
		,title: function(){
			return this.regexp($("#title"), ".{5,100}", langData['siteConfig'][27][90]);
		}

		//市场价
		,mprice: function(){
			return this.regexp($("#mprice"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}

		//一口价
		,price: function(){
			return this.regexp($("#price"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}

		//物流
		,logistic: function(){
			return this.regexp($("#logistic"), "[1-9]\\d*", langData['siteConfig'][27][92]);
		}

		//库存
		,inventory: function(){
			return this.regexp($("#inventory"), "[1-9]\\d*", langData['siteConfig'][27][92]);
		}


	}


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),
				litpic   = $("#litpic").val(),
				vdimgck  = $("#vdimgck");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		if(!regex.typeid() && offsetTop <= 0){
			offsetTop = $("#selType").position().top;
		}

		if(!regex.brand() && offsetTop <= 0){
			offsetTop = $("#selBrand").position().top;
		}

		if(!regex.title() && offsetTop <= 0){
			offsetTop = $("#title").position().top;
		}

		if(!regex.mprice() && offsetTop <= 0){
			offsetTop = $("#mprice").position().top;
		}

		if(!regex.price() && offsetTop <= 0){
			offsetTop = $("#price").position().top;
		}

		if(!regex.logistic() && offsetTop <= 0){
			offsetTop = $("#logistic").position().top;
		}

		if(!regex.inventory() && offsetTop <= 0){
			offsetTop = $("#inventory").position().top;
		}

		if(litpic == "" && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][27][78]);
			offsetTop = $("#listSection1").position().top;
		}

		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = $(".list-holder").position().top;
		}

		ue.sync();

		if(!ue.hasContents() && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][27][66]);
			offsetTop = $("#body").position().top;
		}

		//验证验证码
		if($.trim(vdimgck.val()) == ""){
			vdimgck.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][45][71]);//请输入码证码！
			offsetTop = offsetTop == 0 ? vdimgck.position().top : offsetTop;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
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
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip + "，"+langData['siteConfig'][20][404],
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
