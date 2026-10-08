$(function(){

	$("#typeObj span").bind("click", function(){
		var t = $(this), id = t.data("id");
		$("#type0, #type1").hide();
		$("#type"+id).show();
	});

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
			title    = $("#title"),
			type = $("#type").val(),//类别
			area = $("#area").val(),//面积
			apartment = $("#apartment").val(),//造价
			style = $("#style").val(),//风格
			units = $("#units").val(),//户型
			comstyle = $("#comstyle").val(),//公装类型
			kongjian = $("input[name='kongjian[]']:checked").length,//空间
			jubu = $("input[name='jubu[]']:checked").length;//局部

				
		if(t.hasClass("disabled")) return;

		var offsetTop = 0;


		if($.trim(title.val()) == ""){
			var hline = title.next(".tip-inline"), tips = title.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(style == ""){//风格
			var par = $("#style").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#style").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}

		if(units == "" && type == 0){//户型
			var par = $("#units").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#units").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}

		if(kongjian == 0 && type == 0){//空间
			var par = $("input[name='kongjian[]']").closest('dd');
			var hline = par.find(".tip-inline"), tips = par.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}else if(kongjian > 0 && type == 0){
			var par = $("input[name='kongjian[]']").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(jubu == 0 && type == 0){//局部
			var par = $("input[name='jubu[]']").closest('dd');
			var hline = par.find(".tip-inline"), tips = par.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}else if(jubu > 0 && type == 0){
			var par = $("input[name='jubu[]']").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(area == "" && type == 0){//面积
			var par = $("#area").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#area").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(comstyle == ""  && type == 1){//公装类型
			var par = $("#comstyle").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#comstyle").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}

		if(apartment == ""){//造价
			var par = $("#apartment").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#apartment").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			var par = $("#apartment").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}


		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['renovation'][9][34]);//请上传效果图
			offsetTop = $(".list-holder").position().top;
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
