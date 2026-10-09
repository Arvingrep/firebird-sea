var ue = UE.getEditor('powerby', {'enterTag': ''});

$(function(){

	ue.addListener("ready", function () {
       ue.setContent($("#powerbyHtml").html());
    });


	var init = {
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


	//公共资源、会员中心模板修改
	$(".tpl-list.comment a").bind("click", function(event){
		var t = $(this), type = t.data("type"), touch = t.data("touch"), title = t.text(), act = t.data("action");

        if(act == 'member' && touch == 'touch' && type == 'diy'){
            window.open('userCenterDiy.php');
            return false;
        }

	    //手机底部按钮
        if(t.attr('id') == 'bottomButton'){
            var href = $(this).attr("href");
            try {
                event.preventDefault();
                parent.addPage("siteFooterBtnphp", "siteConfig", "手机底部导航", "siteConfig/siteFooterBtn.php");
            } catch(e) {}
            return false;
        }

		try {
			event.preventDefault();
			parent.addPage(action+"EditTemplate_"+touch+"_"+type, action, "编辑"+title+"模板", "siteConfig/editTemplate.php?action="+act+"&template="+type+"&title="+title+"&touch="+touch);
		} catch(e) {}
	});


	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	//开启、关闭交互
	$("input[name=visitState]").bind("click", function(){
		var t = $(this), parent = t.parent().parent().parent();
		if(t.val() == 1){
			parent.next("dl").show();
		}else{
			parent.next("dl").hide();
		}
	});

	//地图类型切换
	$("#map").bind("change", function(){
		var obj = $("#map1, #map2, #map3, #map4, #map5");
		obj.hide();
		$("#map"+$(this).val()).show();
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
	$(".adminBackgroundColor").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#adminBackgroundColor").val(color);
			$(this).find("em").css({"background": color});
		}
	});
	$(".markFontColor").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#markFontColor").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	$(".zizhiTextColor").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#zizhiTextColor").val(color);
			$(this).find("em").css({"background": color});
		}
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

	//远程服务器类型
	$("#ftpType"+$("input[name=ftpType]:checked").val()).show();
	$("input[name=ftpType]").bind("click", function(){
		var id = $(this).val();
		$(".ftpType").hide();
		$("#ftpType"+id).show();
	});

	// 客服联系方式
	$('#server_tel').tagsInput({defaultText: '点击添加电话', width: 530});
	$('#server_qq').tagsInput({defaultText: '点击添加QQ', width: 530});
	// $('#server_wx').tagsInput({defaultText: '点击添加微信', width: 530});

	$("#server_tel_tagsinput .tagsobj").dragsort({
    dragSelector: ".tag",
    placeHolderTemplate: '<li class="tag holder"></li>',
    dragEnd: function(){
      var specArr = [];
      var specObj = $("#server_tel_tagsinput li");
      for(var i = 0; i < specObj.length; i++){
        specArr.push(specObj.eq(i).find("span").text());
      }
      $("#server_tel").val(specArr.join(","));
    }
  });
  $("#server_qq_tagsinput .tagsobj").dragsort({
    dragSelector: ".tag",
    placeHolderTemplate: '<li class="tag holder"></li>',
    dragEnd: function(){
      var specArr = [];
      var specObj = $("#server_qq_tagsinput li");
      for(var i = 0; i < specObj.length; i++){
        specArr.push(specObj.eq(i).find("span").text());
      }
      $("#server_qq").val(specArr.join(","));
    }
  });
  // $("#server_wx_tagsinput .tagsobj").dragsort({
  //   dragSelector: ".tag",
  //   placeHolderTemplate: '<li class="tag holder"></li>',
  //   dragEnd: function(){
  //     var specArr = [];
  //     var specObj = $("#server_wx_tagsinput li");
  //     for(var i = 0; i < specObj.length; i++){
  //       specArr.push(specObj.eq(i).find("span").text());
  //     }
  //     $("#server_wx").val(specArr.join(","));
  //   }
  // });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var index = $(".config-nav .active").index(),
			type = $("input[name=configType]").val();

		if(type == "site"){
			var basehost = $("#basehost"),
				litpic = $("#litpic").val(),
				visitState = $("input[name=visitState]:checked").val(),
				visitMessage = $("#visitMessage").val(),
				onlinetime = $("#onlinetime");

			//网站域名
			if(!huoniao.regex(basehost)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(0)").click();
				return false;
			};

			//频道LOGO
			if($.trim(litpic) == ""){
				window.scroll(0, 0);
				//$(".config-nav button:eq(0)").click();
				init.showTip("error", "请上传网站LOGO！", "auto");
				return false;
			};

			//网站状态
			if(visitState == 1){
				if($.trim(visitMessage) == ""){
					//$(".config-nav button:eq(0)").click();
					return false;
				};
			}

			//在线用户时限
			if(!huoniao.regex(onlinetime)){
				//$(".config-nav button:eq(0)").click();
				return false;
			};

		}else if(type == "upload"){
			var uploadDir = $("#uploadDir").val(),
				softSize = $("#softSize"),
				softType = $("#softType").val(),
				thumbSize = $("#thumbSize"),
				thumbType = $("#thumbType").val(),
				atlasSize = $("#atlasSize"),
				atlasType = $("#atlasType").val(),
				photoSize = $("#photoSize"),
				photoType = $("#photoType").val(),
				flashSize = $("#flashSize"),
				audioSize = $("#audioSize"),
				audioType = $("#audioType").val(),
				thumbSmallWidth = $("#thumbSmallWidth").val(),
				thumbSmallHeight = $("#thumbSmallHeight").val(),
				thumbMiddleWidth = $("#thumbMiddleWidth").val(),
				thumbMiddleHeight = $("#thumbMiddleHeight").val(),
				thumbLargeWidth = $("#thumbLargeWidth").val(),
				thumbLargeHeight = $("#thumbLargeHeight").val(),
				atlasSmallWidth = $("#atlasSmallWidth").val(),
				atlasSmallHeight = $("#atlasSmallHeight").val(),
				photoSmallWidth = $("#photoSmallWidth").val(),
				photoSmallHeight = $("#photoSmallHeight").val(),
				photoMiddleWidth = $("#photoMiddleWidth").val(),
				photoMiddleHeight = $("#photoMiddleHeight").val(),
				photoLargeWidth = $("#photoLargeWidth").val(),
				photoLargeHeight = $("#photoLargeHeight").val(),
				quality = $("#quality");

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

			//照片上传限制
			if(!huoniao.regex(photoSize)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				return false;
			};

			//照片上传类型限制
			if($.trim(photoType) == ""){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请填写照片上传类型限制！", "auto");
				return false;
			};

			//flash上传限制
			if(!huoniao.regex(flashSize)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				return false;
			};

			//音频上传限制
			if(!huoniao.regex(audioSize)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				return false;
			};

			//音频上传类型限制
			if($.trim(audioType) == ""){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请填写音频上传类型限制！", "auto");
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
			if(!exp.test(photoSmallWidth)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请正确填写缩略图小图宽度！", "auto");
				return false;
			}
			if(!exp.test(photoSmallHeight)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请正确填写缩略图小图高度！", "auto");
				return false;
			}
			if(!exp.test(photoMiddleWidth)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请正确填写缩略图中图宽度！", "auto");
				return false;
			}
			if(!exp.test(photoMiddleHeight)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请正确填写缩略图中图高度！", "auto");
				return false;
			}
			if(!exp.test(photoLargeWidth)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请正确填写缩略图大图宽度！", "auto");
				return false;
			}
			if(!exp.test(photoLargeHeight)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				init.showTip("error", "请正确填写缩略图大图高度！", "auto");
				return false;
			}

			//图片质量
			if(!huoniao.regex(quality)){
				window.scroll(0, 0);
				//$(".config-nav button:eq(2)").click();
				return false;
			};
		}else if(type == "ftp"){
			//远程附件
			var ftpPort = $("#ftpPort"),
				ftpTimeout = $("#ftpTimeout");

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

			$("#ftpConfig input").attr("disabled", false);
		}else if(type == "mark"){
			var waterMarkWidth = $("#waterMarkWidth").val(),
				waterMarkHeight = $("#waterMarkHeight").val(),
				waterMarkPostion = $("#waterMarkPostion").val(),
				waterMarkType = $("input[name=waterMarkType]:checked").val(),
				markText = $("#markText").val(),
				zizhiText = $("#zizhiText").val(),
				markFontfamily = $("#markFontfamily").val(),
				markFontsize = $("#markFontsize"),
				markFontColor = $("#markFontColor").val(),
				zizhiTextColor = $("#zizhiTextColor").val(),
				markFile = $("#markFile").val(),
				markPadding = $("#markPadding"),
				transparent = $("#transparent"),
				markQuality = $("#markQuality");

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

		ue.sync();

		//异步提交
		post = $("#editform .item:eq("+index+")").find("input, select, textarea").serialize();
		if($("input[name=ftpStateType]:checked").val() == 0){
			$("#ftpConfig input").attr("disabled", true);
		}

		if(index == 0){
			post += "&powerby="+encodeURIComponent(ue.getContent());
		}
		huoniao.operaJson("siteConfig.php?action="+type, post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");
			parent.getPreviewInfo();
		});
	});



	//删除文件
	$(".weixinQr .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");

		var g = {mod: "siteConfig", type: "delCard", picpath: input.val(), randoms: Math.random()};
		$.ajax({
			type: "POST",
			cache: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					input.val("");
					t.prev(".sholder").html('');
					parent.hide();
					iframe.attr("src", src).show();
				} catch(b) {}
			}
		});
	});


    //查看缓存目录大小
    $('.checkCacheFolderSize').bind('click', function(){
        var t = $(this);
        if(t.hasClass('disabled')) return;
        t.addClass('disabled').html('<img src="/static/images/loading_16.gif" />');
        huoniao.operaJson("siteConfig.php", "dopost=checkCacheFolderSize", function(data){
            t.removeClass('disabled').text(data.state == 100 ? data.size : "获取失败！");
        })
    });
    $('.checkCacheFolderSize').click();

});



//上传成功接收
function uploadSuccess(obj, file, type, src){
	$("#"+obj).val(file);
	if(obj == 'favicon') {
        $("#" + obj).siblings(".spic").find(".sholder").html('<img src="/favicon.ico?v=' + Math.random() + '" style="width: 48px; height: 48px;" />');
    }else{
        $("#" + obj).siblings(".spic").find(".sholder").html('<img src="' + src + '?v=' + Math.random() + '" />');
	}
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").attr('src', $("#"+obj).siblings("iframe").attr('src'));
    if(obj != 'favicon') {
    	$("#"+obj).siblings("iframe").hide();
    }
}
