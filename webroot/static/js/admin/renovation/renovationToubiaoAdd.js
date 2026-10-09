$(function(){
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
			
	//swfupload s
	var softnail;
	
	//上传附件
	softnail = function() {
		new SWFUpload({
			upload_url: "/include/upload.inc.php?mod=renovation&type=file",
			file_post_name: "Filedata",
			file_size_limit: softSize,
			file_types: softType,
			file_types_description: "图片文件",
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
			upload_success_handler: uploadSuccessSoft,
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
		
		var delSoft = function(b, d, c) {
				var g = {
					mod: "renovation",
					type: "delFile",
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
			delSoft(j.val(), true, function(){
				k.eq(0).find("a").attr({
					href: adminPath+"../static/images/ui/loading.gif"
				});
				j.val(""),
				e.attr("class", "uploadinp");
				k.hide();
			});
		});
		
	};
	softnail();

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
	
	//搜索回车提交
    $("#editform input").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#btnSubmit").click();
        }
    });
	
	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t         = $(this),
			id        = $("#id").val(),
			material  = $("#material"),
			auxiliary = $("#auxiliary"),
			labor     = $("#labor"),
			manage    = $("#manage"),
			design    = $("#design");
		
		if(!huoniao.regex(material)){
			huoniao.goInput(material);
			return false;
		}
		
		if(!huoniao.regex(auxiliary)){
			huoniao.goInput(auxiliary);
			return false;
		}
		
		if(!huoniao.regex(labor)){
			huoniao.goInput(labor);
			return false;
		}
		
		if(!huoniao.regex(manage)){
			huoniao.goInput(manage);
			return false;
		}
		
		if(!huoniao.regex(design)){
			huoniao.goInput(design);
			return false;
		}

		t.attr("disabled", true);	
		
		//异步提交
		huoniao.operaJson("renovationToubiaoAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				$.dialog({
					fixed: true,
					title: "修改成功",
					icon: 'success.png',
					content: "修改成功！",
					ok: function(){
						try{
							$("body",parent.document).find("#nav-renovationToubiao").click();
							parent.reloadPage($("body",parent.document).find("#body-renovationToubiao"));
							$("body",parent.document).find("#nav-renovationToubiaoEdit"+id+" s").click();
						}catch(e){
							location.href = thisPath + "renovationToubiao.php";
						}
					},
					cancel: false
				});
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});
	
});