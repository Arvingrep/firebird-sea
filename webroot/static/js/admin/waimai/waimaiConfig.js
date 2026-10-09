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


	//外卖平台
	$('#printPlat').change(function(){
		var t = $(this), val = t.val();
		$('.printPlat').hide();
		$('.printPlat.plat_' + val).show();
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
	$('.chooseTime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'09','minute':'40'}));

	var lievf = '<div class="rangedeliveryfee rangedeliveryfeeblock ">配送距离&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[start][]"value="0">&nbsp;公里至&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[stop][]"value="0">&nbsp;公里，跑腿每公里附加费&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[value][]"value="0">&nbsp;元<div class="deleterangedeliveryfee"title="删除自定义显示项">删除</div></div>';
	$("#delivery_fee_mode3").delegate(".addrangedeliveryfee", "click", function(){

		var t = $(this).closest(".lievf");
		var date1 = new Date().getTime();
		var date2 = new Date().getTime() + 1;
		var html = lievf.replace("date11", date1).replace("date22", date2);
		var newexperience = $(html);
		newexperience.insertAfter(t);
		newexperience.slideDown(300);
	});
	$("#delivery_fee_mode3").delegate(".deleterangedeliveryfee", "click", function(){
		$(this).closest(".rangedeliveryfeeblock").remove();
	});

	/*设置外卖骑手所得额外加成*/
	var lievf1 = '<div class="rangedeliveryfee rangedeliveryfeeblock">\n' +
		'                订单总价:&nbsp;<input type="text" style="width:80px;" class="name" name="orderprice[start][]" value="0">&nbsp;\n' +
		'                元至&nbsp;<input type="text" style="width:80px;" class="name" name="orderprice[stop][]" value="0">&nbsp额外加成\n' +
		'                <input type="text" style="width:80px;" class="content" name="orderprice[value][]" value="0">&nbsp;元\n' +
		'                <div class="deleterangedeliveryfee" title="删除自定义显示项">删除</div>\n' +
		'              </div>';
	$("#waimai_addition_mode3").delegate(".addrangedeliveryfee", "click", function(){

		var t = $(this).closest(".lievf");
		var date1 = new Date().getTime();
		var date2 = new Date().getTime() + 1;
		var html = lievf1.replace("date11", date1).replace("date22", date2);
		var newexperience = $(html);
		newexperience.insertAfter(t);
		newexperience.slideDown(300);
	});
	$("#waimai_addition_mode3").delegate(".deleterangedeliveryfee", "click", function(){
		$(this).closest(".rangedeliveryfeeblock").remove();
	});
	/*设置外卖骑手所得额外加成*/
	var lievf2 = ' <div class="rangedeliveryfee rangedeliveryfeeblock">\n' +
		'              公里数:&nbsp;<input type="text" style="width:80px;" class="name" name="additionkm[number1][]" value="0">&nbsp;\n' +
		'              至&nbsp;<input type="text" style="width:80px;" class="name" name="additionkm[number2][]" value="0">&nbsp;' +
		'			   <input type="text" style="width:80px;" class="name" name="additionkm[timelimit][]" value="0">分钟完成\n' +
		'              <div class="deleterangedeliveryfee" title="删除自定义显示项">删除</div>\n' +
		'            </div>';
	$("#waimai_addition_require").delegate(".addrangedeliveryfee", "click", function(){

		var t = $(this).closest(".lievf");
		var date1 = new Date().getTime();
		var date2 = new Date().getTime() + 1;
		var html = lievf2.replace("date11", date1).replace("date22", date2);
		var newexperience = $(html);
		newexperience.insertAfter(t);
		newexperience.slideDown(300);
	});
	$("#waimai_addition_require").delegate(".deleterangedeliveryfee", "click", function(){
		$(this).closest(".rangedeliveryfeeblock").remove();
	});

	//标注地图
	$("#printTemplateObj").bind("click", function(){
		$.dialog({
			id: "printTemplatePopup",
			title: "打印机小票DIY自定义",
			content: 'url:'+adminPath+'../include/printTemplate.php?module=waimai&template=' + encodeURIComponent($('#printTemplate').val()),
			width: 890,
			height: 700,
			button: [
				{
					name: '确认',
					callback: function(){
						var doc = $(window.parent.frames["printTemplatePopup"].document),
							templateVal = doc.find("#templateVal").val();
						$("#printTemplate").val(templateVal);
					},
					focus: true
				},
				{
					name: '恢复默认',
					callback: function(){
						$("#printTemplate").val('');
					}
				},
				{
					name: '取消'
				}
			]
		});
	});

	//增加优惠推荐时间段
	$('.addtime').bind('click', function(){
		var t = $(this);
		var tmp = `<div class="timeitem">
			<div class="input-prepend input-append">
				<input class="input-mini stime" type="text" placeholder="00:00" value="">
				<span class="add-on">-</span>
				<input class="input-mini etime" type="text" placeholder="00:00" value="">
				<span class="add-on">抢购</span>
				<input class="input-mini count" type="number" min="1" value="">
				<span class="add-on">份</span>
			</div>
			<button type="button" class="btn btn-small minus"><i class="icon-minus"></i></button>
		</div>`;
		t.before(tmp);
		$('.stime, .etime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'00','minute':'00'}));
	});

	//删除时间段
	$('#saleTimes').delegate('.minus', 'click', function(){
		var t = $(this);
		t.closest('.timeitem').remove();
	});

	$('.stime, .etime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'00','minute':'00'}));

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
				init.showTip("error", "请上传频道LOGO！", "auto");
				return false;
			};

			//启用频道域名
			if(subdomain == 0){
				if($.trim(channeldomain.val()) == ""){
					tj = false;
					window.scroll(0, 0);
					//$(".config-nav button:eq(0)").click();
					init.showTip("error", "请输入访问方式！", "auto");
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
					init.showTip("error", "请填写附件上传的目录！", "auto");
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
					init.showTip("error", "请填写附件上传类型限制！", "auto");
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
					init.showTip("error", "请填写缩略图上传类型限制！", "auto");
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
					init.showTip("error", "请填写图集上传类型限制！", "auto");
					return false;
				};

				//缩略图大小
				var exp = /^[0-9]\d*$/;
				if(!exp.test(thumbSmallWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写缩略图小图宽度！", "auto");
					return false;
				}
				if(!exp.test(thumbSmallHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写缩略图小图高度！", "auto");
					return false;
				}
				if(!exp.test(thumbMiddleWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写缩略图中图宽度！", "auto");
					return false;
				}
				if(!exp.test(thumbMiddleHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写缩略图中图高度！", "auto");
					return false;
				}
				if(!exp.test(thumbLargeWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写缩略图大图宽度！", "auto");
					return false;
				}
				if(!exp.test(thumbLargeHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写缩略图大图高度！", "auto");
					return false;
				}
				if(!exp.test(atlasSmallWidth)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写图集小图宽度！", "auto");
					return false;
				}
				if(!exp.test(atlasSmallHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(2)").click();
					init.showTip("error", "请正确填写图集小图高度！", "auto");
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
				waterMarkType = $("input[name=waterMarkType]:checked").val(),
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
					init.showTip("error", "请正确填写水印尺寸宽度！", "auto");
					return false;
				}
				if(!exp.test(waterMarkHeight)){
					window.scroll(0, 0);
					//$(".config-nav button:eq(4)").click();
					init.showTip("error", "请正确填写水印尺寸高度！", "auto");
					return false;
				}

				//文字类型
				if(waterMarkType == 1){
					//水印文字
					if($.trim(markText) == ""){
						window.scroll(0, 0);
						//$(".config-nav button:eq(4)").click();
						init.showTip("error", "请填写水印文字！", "auto");
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

		//优惠推荐
		var saleTimes = [];
		$('#saleTimes .timeitem').each(function(){
			var t = $(this), stime = t.find('.stime').val(), etime = t.find('.etime').val(), count = t.find('.count').val();
			saleTimes.push({'stime': stime, 'etime': etime, 'count': count});
		});
		saleTimes = JSON.stringify(saleTimes);

		//异步提交
		post = $("#editform .item:eq("+index+")").find("input, select, textarea").serialize();
		if($("input[name=ftpStateType]:checked").val() == 0){
			$("#ftpConfig input").attr("disabled", true);
		}
		huoniao.operaJson(formAction+"?action="+action+"&type="+type+"&saleTimes="+saleTimes, post + "&token="+$("#token").val(), function(data){
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
