$(function(){

	getEditor("body");

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
				shopname    = $("#shopname"),//标题
				typeid      = $("#typeid");//分类

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//标题
		if($.trim(shopname.val()) == "" || shopname.val() == 0){
			var stip = shopname.data('title');
			shopname.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? shopname.position().top : offsetTop;
		}		

		//封面图
		if($('#listSection2').find('.pubitem').size() == 0){
			$.dialog.alert('请上传封面图');
			offsetTop = offsetTop == 0 ? $('#listSection2').position().top : offsetTop;
		}

		//分类
		if(typeid.val() == ''){
			var pardl = typeid.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = typeid.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? typeid.position().top : offsetTop;
		}

		//图文内容
		ue.sync();
		if(!ue.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['travel'][14][148]);   //请输入图文内容！
			offsetTop = offsetTop == 0 ? $("#body").offset().top : offsetTop;
		}


		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}


		var form = $("#fabuForm"), action = form.attr("action"),url=form.attr("data-url");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var data = form.serialize();
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
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					setTimeout(function(){location.href = url;},500)
					
				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});


	});
});
