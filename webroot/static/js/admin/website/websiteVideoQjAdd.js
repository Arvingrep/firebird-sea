$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//视频类型切换
	$("input[name='videotype']").bind("click", function(){
		$("#type0, #type1").hide();
		$("#type"+$(this).val()).show();
	});
	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//全景类型切换
	$("input[name='typeidArr']").bind("click", function(){
		$("#qj_type0, #qj_type1").hide();
		$("#qj_type"+$(this).val()).show();
	});

	//全景预览
	$("#licenseFiles a").bind("click", function(event){
		event.preventDefault();
		var id   = $(this).attr("data-id");

		window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	$("#previewQj").bind("click", function(){
		if($("#listSection2").find("li").length == 6){

			event.preventDefault();
			var href = $(this).attr("href");

			pics = [];
			$("#listSection2").find("img").each(function(index, element) {
        pics.push($(this).attr("data-val"));
      });

			window.open(href+pics.join(","), "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");

		}else{
			$.dialog.alert("请上传6张完整的全景图片！");
		}
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

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			website        = $("#website").val(),
			typeid       = $("input[name='typeidArr']:checked").val(),
			weight       = $("#weight");


		if($("#litpic_").val() == "" && $("#video").val() != ""){
			$.dialog.alert("请上传视频缩略图！");
			return false;
		}
		if($("#video").val() == "" && $("#litpic_").val() != ""){
			$.dialog.alert("请上传视频！");
			return false;
		}

		var pics = [];
		if(typeid == 0){
			if($("#listSection2").find("li").length > 0 && $("#listSection2").find("li").length != 6){
				$.dialog.alert("请上传6张完整的全景图片！");
				return false;
			}

			$("#listSection2").find("img").each(function(index, element) {
        pics.push($(this).attr("data-val"));
	    });
			
		}else if(typeid == 1){
			// if($("#url").val() == ""){
			// 	$.dialog.alert("请输入URL地址！");
			// 	return false;
			// }
		}
		$("#litpic").val(pics.join(","));

		var banner = [];
		$("#listSection3").find("img").each(function(index, element) {
      banner.push($(this).attr("data-val")+'|'+$('this').find('.inputVal').val());
    });
    $("#banner").val(banner.join(","));

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "websiteVideoQj.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "保存成功",
						icon: 'success.png',
						content: "保存成功！",
						ok: function(){
							location.reload();
						},
						cancel: false
					})
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false);
				};
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});

});


//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	var media = "";
	if(filetype == "swf" || file.split(".")[1] == "swf"){
		media = '<embed src="'+fileurl+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
	}else if(obj == "video"){
		media = '<video src="'+cfg_attachment+file+'"></video>';
	}else{
		media = '<img src="'+cfg_attachment+file+'" />';
	}
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline;");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "house",
		type: "delThumb",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
