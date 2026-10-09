$(function(){
	var mold_ = mold;
	function getEditor(id){
		ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'removeformat', 'formatmatch', 'autotypeset', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'simpleupload', '|', 'insertimage', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'link', 'unlink']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
		ue.on("focus", function() {ue.container.style.borderColor = "#999"});
		ue.on("blur", function() {ue.container.style.borderColor = ""})
	}

	getEditor("body");

	//选择分类
	$("#selType").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][22][96] && $(this).attr("data-id") != $("#typeid").val()){
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			var id = $(this).attr("data-id");
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

					html.push('<div class="sel-group" data-title="'+langData['siteConfig'][20][41]+'">');   //请选择所属分类
					html.push('<button class="sel">'+langData['siteConfig'][22][96]+'<span class="caret"></span></button>');  //不限
					html.push('<ul class="sel-menu">');
					html.push('<li><a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a></li>'); //不限
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


	// 选择是否是原创
	$('input[name="article_prop"]').change(function(){
		var article_prop = $(this).val();
		if(article_prop == '1'){
			$(".editInfoBox").addClass('reEdit')
			$('#source,#sourceurl').val('')
		}else{
			$(".editInfoBox").removeClass('reEdit')
		}
	})


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
            cityid = $('select[name=cityid]').val(),
				title       = $("#title"),
				typeid      = $("#typeid").val(),
				writer      = $("#writer"),
				source      = $("#source"),
				mold      = $("#mold").val(),
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
		if((typeid == "" || typeid == 0) && $('.sel-menu li').length){
			var dl = $("#typeid").closest("dl");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".sel-group:eq(0)").attr("data-title"));
			offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
		}

		ue.sync();

		if(mold == 0){
			if(!ue.hasContents() && offsetTop == 0){
				$.dialog.alert(langData['siteConfig'][20][519]);   //请输入投稿内容！
				offsetTop = offsetTop == 0 ? $("#body").offset().top : offsetTop;
			}
		}

		$('.uploadVideo').each(function(){
			if($(this).find('video').size() > 0) {
	      $(this).find('input[type=hidden]').val($(this).find('video').attr('data-val'));
	    }
		})

		//验证作者
		// var exp = new RegExp("^" + writerRegex + "$", "img");
		// if(!exp.test(writer.val())){
		// 	writer.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+writerErrTip);
		// 	offsetTop = offsetTop == 0 ? writer.offset().top : offsetTop;
		// }

		//验证来源
		var exp = new RegExp("^" + sourceRegex + "$", "img");
		if(!exp.test(source.val()) && $('input[name="article_prop"]').val() == '1'){
			source.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入来源");
			offsetTop = offsetTop == 0 ? source.offset().top : offsetTop;
		}

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

					fabuPay.check(data, url, t);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][69]);   //立即投稿
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
				t.removeClass("disabled").html(langData['siteConfig'][6][69]); //立即投稿
				$("#verifycode").click();
			}
		});


	});

	// 切换新闻类型
	$('#box_mold span').click(function(){
		var t = $(this), val = t.data('id');
		if(t.hasClass('curr')) return;
		// if(val == 3 || mold == 3){
		// 	$.dialog.alert(mold == 3 ? "短视频不支持更改类型" : "短视频类型仅支持在APP端上传并发布");
		// 	setTimeout(function(){
		// 		t.siblings('[data-id='+mold+']').addClass('curr').siblings().removeClass('curr');
		// 		$("#mold").val(mold);
		// 	}, 300)
		// 	return;
		// }
		mold = val;
		changeItem(val);
		getType(val);
	})
	function getType(id){
		$('#typeid').val(0);
		$("#typeid").prevAll().remove();
		$('#typeid').next('.tip-inline').removeClass('success');
		$.ajax({
			url: '/include/ajax.php?service=article&action=type',
			type: 'post',
			data: 'mold='+id,
			dataType: 'json',
			success: function(data){
				var html = [];
				html.push('<div class="sel-group" data-title="'+langData['siteConfig'][20][41]+'">');   //请选择所属分类
				html.push('<button class="sel">'+langData['siteConfig'][7][2]+'<span class="caret"></span></button>');  //请选择
				html.push('<ul class="sel-menu">');
				if(data && data.state == 100){
					var list = data.info;
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
				}
				html.push('</ul>');
				html.push('</div>');
				$('#typeid').before(html.join(""));
			},
			error: function(){
			}
		})
	}
	function changeItem(id){
		// not('[name="imglist"], [name="body"], [name="mbody"]')
		$('.variable').hide().find('input, textarea, select').filter('[name=video]').prop('disabled', true);
		$('.variable-'+id).show().find('input, textarea, select').prop('disabled', false);
		if(mold == 2){
			if($('#videotype').val() == '1'){
				$('.video_2').show();
				$('.video_1').hide();
			}else{
				$('.video_1').show();
				$('.video_2').hide();
			}
		}
	}
	changeItem(mold);

	// 切换视频来源
	$('#box_videotype span').click(function(){
		var t = $(this), val = t.data('id');
		if(t.hasClass('curr')) return;
		if(val == "1"){
			$('.video_2').show();
			$('.video_1').hide();
		}else{
			$('.video_1').show();
			$('.video_2').hide();
		}
	})

	//自动获取关键词、描述
	$(".autoget").bind("click", function(){
		var t = $(this), type = t.data("type");
		var title = $('#title').val();
		var body = ue.getContentTxt();
		if(body != ""){
			if(t.text() == langData['siteConfig'][19][88] || t.text() == langData['siteConfig'][6][202]){//自动获取  重新获取
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=autoget",
					data: "type="+type+"&title="+title+"&body="+body,
					type: "POST",
					dataType: "json",
					success: function(data){
						if(data.state == 100){
							$("#"+type).val(data.info);
							t.html(langData['siteConfig'][19][88]);//重新获取
						}else{
							t.html(langData['siteConfig'][44][2]);//获取失败，请稍后重试！
							setTimeout(function(){
								t.html(langData['siteConfig'][19][88]);//重新获取
							}, 2000);
						}
					}
				});
			}
		}else{
			$.dialog.alert(langData['siteConfig'][44][3]);//请先输入内容！
		}
	});

	$('#zhuanzai').click(function(){
		var remoteUrl = $.trim($('#remoteUrl').val());
		if(remoteUrl){
			$('body').append('<div class="loading" style="position: fixed; z-index: 1000; left: 0; top: 0; right: 0; bottom: 0; background-color: #000; opacity: .3; filter: alpha(opacity=30);"><p style="text-align:center;margin-top:30%;font-size:18px;color:#fff;">'+langData['siteConfig'][44][4]+'</p></div>');//正在获取，请稍后···
			$.ajax({
				url: reprintUrl,
				data: "url=" + encodeURIComponent(remoteUrl),
				type: "POST",
				dataType: "json",
				success: function(data){
					$('.loading').hide();
					if(data.state == 100 && data.content){
						$('#remoteUrl').val('');
						$('#title').val(data.title);
						$('#source').val(data.source);
						$('#sourceurl').val(data.url);
						ue.setContent(data.content);
						$('#keywords').val(data.keywords);
						$('#description').val(data.description);
					}else{
						$('.loading').hide();
						$.dialog.alert((data.info ? data.info : langData['siteConfig'][44][6]), '<a href="javascript:;" onclick="location.reload();">'+langData['siteConfig'][44][5]+'</a>');//要转载的网站内容解析失败！--点击重试
					}
				},
				error: function(){
					$('.loading').hide();
					$.dialog.alert(langData['siteConfig'][44][7], '<a href="javascript:;" onclick="location.reload();">'+langData['siteConfig'][44][5]+'</a>');// 网络错误，信息采集失败！--点击重试
				}
			})
		}else{
			$.dialog.alert(langData['siteConfig'][44][7]);//请输入网址
		}
	})

	$('.zhuanzaiBox .close').hover(function(){
		$('.zhuanzaiBox').addClass('hover');
	}, function(){
		$('.zhuanzaiBox').removeClass('hover');
	}).click(function(){
		$('.zhuanzaiBox').remove();
	})

});
