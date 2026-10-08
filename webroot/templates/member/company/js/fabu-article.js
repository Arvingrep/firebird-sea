$(function(){

	getEditor("body");

	//选择分类
	$("#selType").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][22][96] && $(this).attr("data-id") != $("#addr").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildType(id);
		}
	});

	//获取子级分类
	function getChildType(id){
		if(!id) return;
		$.ajax({
			url: "/include/ajax.php?service=article&action=type&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button class="sel">'+langData['siteConfig'][22][96]+'<span class="caret"></span></button>');
					html.push('<ul class="sel-menu">');
					html.push('<li><a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a></li>');
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#typeid").before(html.join(""));

				}
			}
		});
	}


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
        		cityid = $('select[name=cityid]').val(),
				title       = $("#title"),
				typeid      = $("#typeid").val(),
				writer      = $("#writer"),
				source      = $("#source"),
				sourceurl   = $("#sourceurl");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

        //验证城市
        if(cityid == "" || cityid == 0){
            var dl = $("#cityid").closest("dl");
            dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#cityid").attr("data-title"));
            offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
        }

		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.offset().top;
		}

		//验证分类
		if(typeid == "" || typeid == 0){
			var dl = $("#typeid").closest("dl");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".sel-group:eq(0)").attr("data-title"));
			offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
		}

		ue.sync();

		if(!ue.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['siteConfig'][20][519]);
			offsetTop = offsetTop == 0 ? $("#body").offset().top : offsetTop;
		}

		//验证作者
		var exp = new RegExp("^" + writerRegex + "$", "img");
		if(!exp.test(writer.val())){
			writer.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+writerErrTip);
			offsetTop = offsetTop == 0 ? writer.offset().top : offsetTop;
		}

		//验证来源
		var exp = new RegExp("^" + sourceRegex + "$", "img");
		if(!exp.test(source.val())){
			source.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+sourceErrTip);
			offsetTop = offsetTop == 0 ? source.offset().top : offsetTop;
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
