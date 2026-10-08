$(function(){
	var formAction = $("#editform").attr("action"),
		init = {
		//提示信息
		showTip: function(type, message){
			var obj = $("#infoTip");
			obj.html('<span class="msg '+type+'">'+message+'</span>').show();

			setTimeout(function(){
				obj.fadeOut();
			}, 5000);
		}
	};

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$("input[name=configType]").val(type);
			$(".item:eq("+index+")").fadeIn();
		}
	});


	//咨询热线切换
	$("input[name=hotline_rad]").bind("click", function(){
		var t = $(this);
		if(t.val() == 0){
			t.parent().siblings("#hotline").hide();
		}else{
			t.parent().siblings("#hotline").show();
		}
	});

	//图片裁剪切换
	$("input[name=photoCutType]").bind("click", function(){
		var val = $(this).val();
		if(val == "position"){
			$("#photoCutPosition").show();
		}else{
			$("#photoCutPosition").hide();
		}
	});

	//水印位置选择
	$(".watermarkpostion li").bind("click", function(){
		var val = $(this).attr("data-id");
		$(this).siblings("li").removeClass("current");
		if($(this).hasClass("current")){
			$(this).removeClass("current");
			$(this).parent().siblings("input").val("0");
		}else{
			$(this).addClass("current");
			$(this).parent().siblings("input").val(val);
		}
	});

	//水印类型选择
	$("input[name=waterMarkType]").bind("click", function(){
		var t = $(this), val = t.val();
		if(val == 1){
			$("#markType2").hide();
			$("#markType1").show();
		}else{
			$("#markType2").show();
			$("#markType1").hide();
		}
	});

	//颜色面板
	$(".color_pick").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#markFontColor").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	//远程服务器类型
	$("#ftpType"+$("input[name=ftpType]:checked").val()).show();
	$("input[name=ftpType]").bind("click", function(){
		var id = $(this).val();
		$(".ftpType").hide();
		$("#ftpType"+id).show();
	});

	//启用远程附件交互
	if($("input[name=ftpStateType]:checked").val() == 1){
		$("#ftpConfig input").attr("disabled", false);
	}else{
		$("#ftpConfig input").attr("disabled", true);
	}
	$("input[name=ftpStateType]").bind("click", function(){
		if($(this).val() == 1){
			$("#ftpConfig input").attr("disabled", false);
		}else{
			$("#ftpConfig input").attr("disabled", true);
		}
	});

	//表单验证
	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	//开启、关闭交互
	$("input[name=subdomain]").bind("click", function(){
		var t = $(this), parent = t.parent().parent().parent(), input = $("#channeldomain"), basehost = $("#basehost").val();
		if(t.val() == 0){
			input.removeClass().addClass("input-large");
			input.prev(".add-on").html("http://");
			input.next(".add-on").hide();
		}else if(t.val() == 1){
			input.removeClass().addClass("input-mini");
			input.prev(".add-on").html("http://");
			input.next(".add-on").html("."+basehost).show();
		}else{
			input.removeClass().addClass("input-mini");
			input.prev(".add-on").html("http://"+basehost+"/");
			input.next(".add-on").hide();
		}
	});

	$("input[name=articleLogo], input[name=channelswitch]").bind("click", function(){
		var t = $(this), parent = t.parent().parent().parent();
		if(t.val() == 1){
			parent.next("dl").show();
		}else{
			parent.next("dl").hide();
		}
	});

	$("input[name=articleUpload], input[name=articleFtp], input[name=articleMark]").bind("click", function(){
		var t = $(this), parent = t.parent().parent().parent();
		if(t.val() == 1){
			parent.next("div").show();
		}else{
			parent.next("div").hide();
		}
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var index = $(".config-nav .active").index(),
			type = $("input[name=configType]").val();

		if(type == "site"){
			var channelname = $("#channelname"),
				channelLogo = $("input[name=articleLogo]:checked").val(),
				litpic = $("#litpic").val(),
				subdomain = $("input[name=subdomain]:checked").val(),
				channeldomain = $("#channeldomain"),
				channelswitch = $("input[name=channelswitch]:checked").val(),
				closecause = $("#closecause").val(),
				title = $("#title").val(),
				keywords = $("#keywords").val(),
				description = $("#description").val();

			//频道名称
			if(!huoniao.regex(channelname)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(0)").click();
				return false;
			};

			//频道LOGO
			if(channelLogo == 1 && $.trim(litpic) == ""){
				window.scroll(0, 0);
				//$(".config-nav button:eq(0)").click();
				init.showTip("error", langData['waimai'][6][103], "auto");
				return false;
			};

			//启用频道域名
			if(subdomain == 0){
				if($.trim(channeldomain.val()) == ""){
					tj = false;
					window.scroll(0, 0);
					//$(".config-nav button:eq(0)").click();
					init.showTip("error", langData['waimai'][6][104], "auto");
					return false;
				};
			}
		}else if(type == "upload"){
			var articleUpload = $("input[name=articleUpload]:checked").val(),
				uploadDir = $("#uploadDir").val(),
				softSize = $("#softSize"),
				softType = $("#softType").val(),
				thumbSize = $("#thumbSize"),
				thumbType = $("#thumbType").val(),
				atlasSize = $("#atlasSize"),
				atlasType = $("#atlasType").val(),
				thumbSmallWidth = $("#thumbSmallWidth").val(),
				thumbSmallHeight = $("#thumbSmallHeight").val(),
				thumbMiddleWidth = $("#thumbMiddleWidth").val(),
				thumbMiddleHeight = $("#thumbMiddleHeight").val(),
				thumbLargeWidth = $("#thumbLargeWidth").val(),
				thumbLargeHeight = $("#thumbLargeHeight").val(),
				atlasSmallWidth = $("#atlasSmallWidth").val(),
				atlasSmallHeight = $("#atlasSmallHeight").val(),
				quality = $("#quality");

			//自定义
			if(articleUpload == 1){
				//上传目录
				if($.trim(uploadDir) == ""){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][105], "auto");
					return false;
				};

				//附件上传限制
				if(!huoniao.regex(softSize)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					return false;
				};

				//附件上传类型限制
				if($.trim(softType) == ""){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][106], "auto");
					return false;
				};

				//缩略图上传限制
				if(!huoniao.regex(thumbSize)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					return false;
				};

				//缩略图上传类型限制
				if($.trim(thumbType) == ""){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][107], "auto");
					return false;
				};

				//图集上传限制
				if(!huoniao.regex(atlasSize)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					return false;
				};

				//图集上传类型限制
				if($.trim(atlasType) == ""){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][108], "auto");
					return false;
				};

				//缩略图大小
				var exp = /^[0-9]\d*$/;
				if(!exp.test(thumbSmallWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][109], "auto");
					return false;
				}
				if(!exp.test(thumbSmallHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][113], "auto");
					return false;
				}
				if(!exp.test(thumbMiddleWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][110], "auto");
					return false;
				}
				if(!exp.test(thumbMiddleHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][114], "auto");
					return false;
				}
				if(!exp.test(thumbLargeWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][111], "auto");
					return false;
				}
				if(!exp.test(thumbLargeHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][115], "auto");
					return false;
				}
				if(!exp.test(atlasSmallWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][112], "auto");
					return false;
				}
				if(!exp.test(atlasSmallHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", langData['waimai'][6][116], "auto");
					return false;
				}

				//图片质量
				if(!huoniao.regex(quality)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					return false;
				};
			}
		}else if(type == "ftp"){
			//远程附件
			var articleFtp = $("input[name=articleFtp]:checked").val(),
				ftpPort = $("#ftpPort"),
				ftpTimeout = $("#ftpTimeout");

			//自定义
			if(articleFtp == 1){
				//FTP服务器端口
				if(!huoniao.regex(ftpPort)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(3)").click();
					return false;
				};

				//FTP超时
				if(!huoniao.regex(ftpTimeout)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(3)").click();
					return false;
				};
			}

			$("#ftpConfig input").attr("disabled", false);
		}else if(type == "mark"){
			var articleMark = $("input[name=articleMark]:checked").val(),
				waterMarkWidth = $("#waterMarkWidth").val(),
				waterMarkHeight = $("#waterMarkHeight").val(),
				waterMarkPostion = $("#waterMarkPostion").val(),
				waterMarkType = $("input[name=waterMarkType]").val(),
				markText = $("#markText").val(),
				markFontfamily = $("#markFontfamily").val(),
				markFontsize = $("#markFontsize"),
				markFontColor = $("#markFontColor").val(),
				markFile = $("#markFile").val(),
				markPadding = $("#markPadding"),
				transparent = $("#transparent"),
				markQuality = $("#markQuality");

			//自定义
			if(articleMark == 1){
				//水印尺寸限制
				var exp = /^[0-9]\d*$/;
				if(!exp.test(waterMarkWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(4)").click();
					init.showTip("error", langData['waimai'][6][117], "auto");
					return false;
				}
				if(!exp.test(waterMarkHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(4)").click();
					init.showTip("error", langData['waimai'][6][118], "auto");
					return false;
				}

				//文字类型
				if(waterMarkType == 1){
					//水印文字
					if($.trim(markText) == ""){
						window.scroll(0, 0);
						//$(".config-nav button:eq(4)").click();
						init.showTip("error", langData['waimai'][6][119], "auto");
						return false;
					}
					//水印文字大小
					if(!huoniao.regex(markFontsize)){
						window.scroll(0, 0);
						//$(".config-nav button:eq(4)").click();
						return false;
					};
				}

				//水印边距
				if(!huoniao.regex(markPadding)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(4)").click();
					return false;
				};

				//水印透明度
				if(!huoniao.regex(transparent)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(4)").click();
					return false;
				};

				//水印图片质量
				if(!huoniao.regex(markQuality)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(4)").click();
					return false;
				};
			}
		}

		//异步提交
		post = $("#editform .item:eq("+index+")").find("input, select, textarea").serialize();
		if($("input[name=ftpStateType]:checked").val() == 0){
			$("#ftpConfig input").attr("disabled", true);
		}
		huoniao.operaJson(formAction+"?action="+action+"&type="+type, post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}

			if(data.state == 2001){
				$.dialog.alert(data.info);
			}else{
				huoniao.showTip(state, data.info, "auto");
			}

			if(data.state == 100){
				parent.getPreviewInfo();
			}
		});

	});

	//初始化
	$("input[name=subdomain]:checked").click();
});
