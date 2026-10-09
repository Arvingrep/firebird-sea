$(function(){
	//表单提示
	$(".comBox").delegate("input[type=text]", "focus", function(){
		var t = $(this), dl = t.closest("dl"), tip = t.data("title"), hline = dl.find(".tip-inline");
		hline.removeClass().addClass("tip-inline focus").html("<s></s>"+tip);
	});
	$(".comBox").delegate("input[type=text]", "blur", function(){
		var t = $(this), dl = t.closest("dl"), tip = t.data("title"), hline = dl.find(".tip-inline");

		if(dl.attr("data-required") == 1){
			if($.trim(t.val()) == ""){
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
			}else{
				hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
			}
		}
	});

	$(".w-form").delegate("select", "change", function(){
		var t = $(this), dl = t.closest("dl"), tip = t.data("title"), hline = dl.find(".tip-inline");

		if(dl.attr("data-required") == 1){
			if($.trim(t.val()) == ""){
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
			}else{
				hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
			}
		}
	});

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
			comname    = $("#comname"),		
			maxtable    = $("#maxtable"),					
			besttable    = $("#besttable"),					
			floorheight    = $("#floorheight"),					
			area    = $("#area"),					
			column    = $("#column"),					
			fields    = $("#fields");					
					

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if($.trim(comname.val()) == ""){
			var hline = comname.next(".tip-inline"), tips = comname.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}
		if($.trim(maxtable.val()) == ""){
			var hline = maxtable.closest('dd').find(".tip-inline"), tips = maxtable.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($.trim(besttable.val()) == ""){
			var hline = besttable.closest('dd').find(".tip-inline"), tips = besttable.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($.trim(floorheight.val()) == ""){
			var hline = floorheight.closest('dd').find(".tip-inline"), tips = floorheight.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}


		if($.trim(area.val()) == ""){
			var hline = area.closest('dd').find(".tip-inline"), tips = area.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($.trim(column.val()) == ""){
			var hline = column.closest('dd').find(".tip-inline"), tips = column.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($.trim(fields.val()) == ""){
			var hline = fields.closest('dd').find(".tip-inline"), tips = fields.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($('#listSection1 .pubitem').length == 0){
			$.dialog.alert(langData['marry'][4][8]);//请至少上传一张图片
			offsetTop = $("#selTeam").position().top;
		}
		//宴会厅图集
        var pics = [];
        $("#listSection1").find('.pubitem').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));


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
