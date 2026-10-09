$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var litpic = $("#litpic_");
	if(litpic.val() != ""){
		litpic.siblings("iframe").hide();
		litpic.siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+litpic.val()+'" />');
		litpic.siblings(".spic").find(".reupload").attr("style", "display:inline-block;");
		litpic.siblings(".spic").show();
	}

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//全景类型切换
	$("input[name='typeidArr']").bind("click", function(){
		$("#type0, #type1").hide();
		$("#type"+$(this).val()).show();
	});

	//swfupload s
	var thumbnail, picList;

	//上传全景
	thumbnail = function() {
		new SWFUpload({
			upload_url: "/include/upload.inc.php?mod="+modelType+"&type=thumb&filetype=flash",
			file_post_name: "Filedata",
			file_size_limit: flashSize,
			file_types: flashType,
			file_types_description: "swf文件",
			file_upload_limit: 0,
			file_queue_limit: 0,
			swfupload_preload_handler: preLoad,
			swfupload_load_failed_handler: loadFailed,
			file_queued_handler: fileQueuedThumb,
			file_queue_error_handler: fileQueueErrorThumb,
			file_dialog_complete_handler: fileDialogCompleteThumb,
			upload_start_handler: uploadStart,
			upload_progress_handler: uploadProgressThumb,
			upload_error_handler: uploadError,
			upload_success_handler: uploadSuccessVideo,
			upload_complete_handler: uploadComplete,
			button_action:SWFUpload.BUTTON_ACTION.SELECT_FILE,
			button_placeholder_id: "uploadBt",
			flash_url : adminPath+"../static/js/swfupload/swfupload.swf",
			flash9_url: adminPath+"../static/js/swfupload/swfupload_fp9.swf",
			button_width: 100,
			button_height: 25,
			button_cursor: SWFUpload.CURSOR.HAND,
			button_window_mode: "transparent",
			debug: false
		});

		var delThumbPic = function(b, d, c) {
				var g = {
					mod: modelType,
					type: "delFlash",
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
            },
			e = $("#license"),
			j = $("#litpic"),
			k = $("#licenseFiles,#cancelUploadBt,#licenseProgress,#reupload");

		$("#reupload").click(function() {
			//删除已经上传的文件
			delThumbPic(j.val(), true, function(){
				$("#licenseFiles a").attr("data-id", "");
				j.val(""),
				e.attr("class", "uploadinp");
				k.hide();
			});
		});

	};
	thumbnail();

	//上传图集
	picList = function() {
		new SWFUpload({
			upload_url: "/include/upload.inc.php?mod="+modelType+"&type=thumb&filetype=images",
			file_post_name: "Filedata",
			file_size_limit: thumbSize,
			file_types: thumbType,
			file_types_description: "图片文件",
			file_upload_limit: 6,
			file_queue_limit: 0,
			swfupload_preload_handler: preLoad,
			swfupload_load_failed_handler: loadFailed,
			file_queued_handler: fileQueuedList_,
			file_queue_error_handler: fileQueueErrorList,
			file_dialog_complete_handler: fileDialogCompleteList,
			upload_start_handler: uploadStart,
			upload_progress_handler: uploadProgressList,
			upload_error_handler: uploadError,
			upload_success_handler: uploadSuccessList_,
			upload_complete_handler: uploadComplete,
			//button_image_url: "/static/images/ui/swfupload/uploadbutton.png",
			button_placeholder_id: "flasHolder",
			flash_url : adminPath+"../static/js/swfupload/swfupload.swf",
			flash9_url: adminPath+"../static/js/swfupload/swfupload_fp9.swf",
			button_width: 100,
			button_height: 25,
			button_cursor: SWFUpload.CURSOR.HAND,
			button_window_mode: "transparent",
			debug: false
		});
	};
	picList();

	//填充图片
	if($("input[name='typeidArr']:checked").val() == 0 && $("#litpic").val() != ""){
		var picList = [], imglist = $("#litpic").val().split(",");
		for(var i = 0; i < imglist.length; i++){
			picList.push('<li class="clearfix" id="SWFUpload_1_0'+i+'">');
			picList.push('  <a class="li-rm" href="javascript:;">×</a>');
			picList.push('  <div class="li-thumb" style="display:block;">');
			picList.push('    <div class="r-progress"><s></s></div>');
			picList.push('    <img data-val="'+imglist[i]+'" src="'+cfg_attachment+imglist[i]+'" />');
			picList.push('  </div>');
			picList.push('</li>');
		}
		$("#listSection").html(picList.join(""));
	}

	//单张删除图集
	$("#listSection").delegate(".li-rm","click", function(){
		var t = $(this), img = t.siblings(".li-thumb").find("img").attr("data-val");
		delAtlasImg(t.parent().attr("id"), img);
		$("#previewQj").hide();
	});

	//图集排序
	$("#listSection").dragsort({ dragSelector: "li", placeHolderTemplate: '<li class="holder"></li>' });

	//组合图集html
	function fileQueuedList_(file) {
		var listSection = $("#listSection"), t = this;
		if(listSection.find("li").length >= 6){
			t.cancelUpload(file.id, false);
			$.dialog.alert("您上传的文件数已经达到限额，不能再上传了。");
			return false;

		}else{
			var pli = $('<li class="clearfix" id="'+file.id+'"></li>'),
				lir = $('<a class="li-rm" href="javascript:;">&times;</a>'),
				lin = $('<span class="li-name">'+file.name+'</span>'),
				lip = $('<span class="li-progress"><s></s></span>'),
				lit = $('<div class="li-thumb"><div class="r-progress"><s></s></div><img></div>');

			//关闭
			lir.bind("click", function(){
				t.cancelUpload(file.id, false);

				$("#"+file.id).remove();
				var stats = t.getStats();
				stats.successful_uploads--;
				t.setStats(stats);
			});

			pli.append(lir);
			pli.append(lin);
			pli.append(lip);
			pli.append(lit);

			listSection.append(pli);
		}
	}

	//图集上传完成
	function uploadSuccessList_(file, serverData) {
		var b = eval('('+serverData+')');
		var pro = file.id;
		if(b.state == "SUCCESS"){
			$("#"+pro).find(".li-name").hide();
			$("#"+pro).find(".li-progress").hide();
			$("#"+pro).find(".li-move").show();
			$("#"+pro).find(".li-thumb").show();
			$("#"+pro).find(".li-thumb img").attr("data-val", b.url);
			$("#"+pro).find(".li-thumb img").attr("src", cfg_attachment+b.url);
			$("#"+pro).find(".li-thumb .enlarge").attr("href", cfg_attachment+b.url);
			$("#"+pro).find(".li-desc").show();

			if($("#listSection").find("li").length == 6){
				$("#previewQj").show();
			}

			$("#"+pro).find(".li-rm").bind("click", function(){
				var t = $(this), img = t.siblings(".li-thumb").find("img").attr("data-val");
				delAtlasImg(pro, img);
				$("#previewQj").hide();
			});
		}else{
			$.dialog.alert(b.state);
			$("#"+pro).remove();
		}
	}

	//全景预览
	$("#licenseFiles a").bind("click", function(event){
		event.preventDefault();
		var id   = $(this).attr("data-id");

		window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	$("#previewQj").bind("click", function(){
		if($("#listSection").find("li").length == 6){

			event.preventDefault();
			var href = $(this).attr("href");

			pics = [];
			$("#listSection").find("img").each(function(index, element) {
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
			id           = $("#id").val(),
			title        = $("#title"),
			typeid       = $("input[name='typeidArr']:checked").val(),
			weight       = $("#weight");

		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if($("#litpic_").val() == ""){
			$.dialog.alert("请上传缩略图！");
			return false;
		}

		if(typeid == 0){
			if($("#listSection").find("li").length != 6){
				$.dialog.alert("请上传6张完整的全景图片！");
				return false;
			}

			var pics = [];
			$("#listSection").find("img").each(function(index, element) {
                pics.push($(this).attr("data-val"));
            });
			$("#litpic").val(pics.join(","));

		}else{
			if($("#videoUrl").val() == ""){
				$.dialog.alert("请上传全景文件！");
				return false;
			}
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "website360qj.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "Add"){
						huoniao.goTop();
						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-website360qj"+$("#website").val()).click();
									//parent.reloadPage($("body",parent.document).find("#body-website360qjphp")[0].contentWindow);
									parent.reloadPage($("body",parent.document).find("#body-website360qj"+$("#website").val()));
									$("body",parent.document).find("#nav-website360qjEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "website360qj.php?website="+$("#website").val();
								}
							},
							cancel: false
						});
					}
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
function uploadSuccess(obj, file, filetype){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+file+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "website",
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
