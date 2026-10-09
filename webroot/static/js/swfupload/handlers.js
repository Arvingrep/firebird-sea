function preLoad() {
    return this.support.loading ? void 0 : $("#uploadBt").html("加载失败，请检查flash版本！");
}
function loadFailed() {
    $("#uploadBt").html("加载失败，请检查flash版本！");
}
function uploadStart(file) {
    return true;
}
function uploadComplete() {
	try {
		this.startUpload();
	} catch (ex) {
		this.debug(ex);
	}
}
function uploadError(file, errorCode, message) {
	try {
		switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
			$.dialog.alert("上传错误：" + message);
			//this.debug("错误代码：HTTP错误，文件名：" + file.name + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
			$.dialog.alert("配置错误");
			//this.debug("错误代码：无后端文件，文件名：" + file.name + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
			$.dialog.alert("上传失败。");
			//this.debug("错误代码：上传失败，文件名称：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR:
			$.dialog.alert("服务器（IO）错误");
			//this.debug("错误代码：IO错误，文件名：" + file.name + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
			$.dialog.alert("安全错误");
			//this.debug("错误代码：安全性错误，文件名：" + file.name + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			//$.dialog.alert("上传限制超标。");
			//this.debug("错误代码：超过上传限制，文件名：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
			$.dialog.alert("找不到文件。");
			//this.debug("错误代码：文件未找到，文件名：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
			$.dialog.alert("未通过验证。上传跳过。");
			//this.debug("错误代码：文件验证失败，文件名：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			if (this.getStats().files_queued === 0) {
				document.getElementById(this.customSettings.cancelButtonId).disabled = true;
			}
			$.dialog.alert("注销");
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			$.dialog.alert("停止");
			break;
		default:
			$.dialog.alert("未处理的错误：" + error_code);
			//this.debug("错误代码：" + errorCode + "，文件名：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		}
	} catch (ex) {
        //this.debug(ex);
    }
}

//上传单张缩略图
function fileQueuedThumb(file) {
    var b = this,
		c = $("#license"),
		d = $("#lblicense"),
		e = $("#cancelUploadBt"),
		f = $("#licenseProgress"),
		g = $("#licenseFiles");
    c.attr("class", "uploadinp uploading"),
    e.show(),
	f.show(),
    e.click(function() {
        return b.cancelUpload(file.id, false),
        c.attr("class", "uploadinp"),
        d.attr("class", "cl"),
        g.hide(),
		e.hide(),
		f.hide(),
        false
    })
}
function fileQueueErrorThumb(event, errorCode) {
	try {
		switch (errorCode) {
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			$.dialog.alert("文件大小超过最大"+this.settings.file_size_limit/1024+"MB上传限制。");
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			$.dialog.alert("零字节文件无法上传。");
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			$.dialog.alert("无效的文件类型。");
			break;
		case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
			$.dialog.alert("您选择的文件太多。" +  message > 1 ? "最多可以选择 " +  message + " 个文件。" : "");
			break;
		default:
			if (file !== null) {
				$.dialog.alert("未处理的错误");
			}
			break;
		}
	} catch (ex) {
        //this.debug(ex);
    }
	
    $("#license").attr("class", "uploadinp"),
    $("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide();
}
function fileDialogCompleteThumb(numFilesSelected, numFilesQueued) {
    numFilesSelected >= 1 && 0 == numFilesQueued ? $.dialog.alert('文件大小超过最大'+this.settings.file_size_limit/1024+'MB上传限制。') : numFilesSelected > 1 ? ($.dialog.alert("您只需要上传一张缩略图即可"), $("#license").attr("class", "uploadinp"), $("#licenseProgressBar").width(0), $("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide()) : ($("#licenseProgressBar").width(""), this.startUpload())
}
function uploadProgressThumb(file, bytesLoaded, bytesTotal) {
    try {
        var d = $("#licensePercent");
        d.html().replace("%", "");
        var f = Math.ceil(100 * (bytesLoaded / bytesTotal));
        d.attr("class", f > 55 ? "white": ""),
        $("#licenseProgressBar").stop().animate({
            width: f + "%"
        }, 600),
        d.html(f + "%");
    } catch(g) {
        this.debug(g)
    }
}
function uploadSuccessThumb(file, serverData) {
	var b = eval('('+serverData+')');
	if(b.state == "SUCCESS"){
		setTimeout(function() {
			var c = $("#license"),
			f = $("#litpic"),
			g = $("#licenseFiles"),
			h = $("#reupload");
			if (b == "") $.dialog.alert("上传过程中网络出现了问题，您可重新上传"),
				c.attr("class", "uploadinp"),
				g.hide(),
				$("#cancelUploadBt, #licenseProgress").hide(),
				h.hide();
			else {
				var i = new Image,
				j = g.find("a:eq(0)"),
				k = j.find("img:eq(0)");
				g.attr("style", "display:inline-block"), 
				c.attr("class", "uploadinp uploading"), 
				g.show(), 
				h.attr("style", "display:inline-block"), 
				j.attr("href", cfg_attachment+b.url), 
				k.attr("alt", file.name),
				i.src = j.attr("href");
				if(b.type == "photo"){
					k.attr("src", cfg_attachment+b.url+"&type=middle");
				}else{
					k.attr("src", cfg_attachment+b.url+"&type=small");
				}
				k.attr("onerror", "javascript:this.src='"+cfg_attachment+b.url+"'"),
				k.css({"width": "auto"}),
				$("#cancelUploadBt, #licenseProgress, #licenseFileName").hide(), 
				f.val(b.url);
			}
		}, 1000);
	}else{
		$.dialog.alert(b.state);
		$("#license").attr("class", "uploadinp"),
    	$("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide();
	}
}

//上传多张图（图集）
var errInfo = [];
function fileQueuedList(file) {
    var listSection = $("#listSection"), t = this;
	
	var pli = $('<li class="clearfix" id="'+file.id+'"></li>'),
	    lim = $('<a class="li-move" href="javascript:;" title="拖动调整图片顺序">移动</a>'),
	    lir = $('<a class="li-rm" href="javascript:;">&times;</a>'),
		lin = $('<span class="li-name">'+file.name+'</span>'),
		lip = $('<span class="li-progress"><s></s></span>'),
		lit = $('<div class="li-thumb"><div class="r-progress"><s></s></div><span class="ibtn"><a href="javascript:;" class="Lrotate" title="逆时针旋转90度"></a><a href="javascript:;" class="Rrotate" title="顺时针旋转90度"></a><a href="javascript:;" target="_blank" class="enlarge" title="放大"></a></span><span class="ibg"></span><img></div>'),
		lid = $('<textarea class="li-desc" placeholder="请输入图片描述"></textarea>');
	
	//关闭
	lir.bind("click", function(){
		t.cancelUpload(file.id, false);
		
		$("#"+file.id).remove();
		var stats = t.getStats();
		stats.successful_uploads--;
		t.setStats(stats);
	});
	
	pli.append(lim);
	pli.append(lir);
	pli.append(lin);
	pli.append(lip);
	pli.append(lit);
	pli.append(lid);
	
	listSection.append(pli);
}

function fileQueueErrorList(file, errorCode, message) {
	try {
		if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
			$.dialog.alert(message > 0 ? "您只能再上传" + message + "个文件。 " : "您上传的文件数已经达到限额，不能再上传了。");
			return;
		}

		switch (errorCode) {
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			//$.dialog.alert("文件大小超过最大2MB上传限制。");
			errInfo.push("文件：" + file.name + " 大小超过" + this.settings.file_size_limit/1024 + "M");
			//this.debug("错误代码：文件太大，文件名称：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			//$.dialog.alert("零字节文件无法上传。");
			errInfo.push("文件：" + file.name + " 零字节文件无法上传");
			//this.debug("错误代码：零字节的文件，文件名称：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			//$.dialog.alert("无效的文件类型。");
			errInfo.push("文件：" + file.name + " 无效的文件类型");
			//this.debug("错误代码：无效的文件类型，文件名：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
			//$.dialog.alert("您选择的文件太多。" +  message > 1 ? "最多可以选择 " +  message + " 个文件。" : "");
			break;
		default:
			if (file !== null) {
				//$.dialog.alert("未处理的错误");
				errInfo.push("文件：" + file.name + " 未处理的错误");
			}
			//this.debug("错误代码：" + errorCode + "，文件名：" + file.name + "，文件大小：" + file.size + "，信息：" + message);
			break;
		}

		if (errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
			delete this.queueData.files[file.id];
		}
		if (this.settings.onSelectError) this.settings.onSelectError.apply(this, arguments);
	} catch (ex) {
        this.debug(ex);
    }
}
function fileDialogCompleteList(numFilesSelected, numFilesQueued) {
    try {
		this.startUpload();
		if(errInfo.length > 0){
			var tip = errInfo.join("<br />");
			$.dialog.alert("<div class='errInfo'><strong>以下图片将不会上传：</strong><br />" + tip + '</div>');
			errInfo = [];
		};
	} catch (ex)  {
        this.debug(ex);
	}
}
function uploadProgressList(file, bytesLoaded, bytesTotal) {
    try {
		var pro = file.id;
        var f = Math.ceil(100 * (bytesLoaded / bytesTotal));
        $("#"+pro).find(".li-progress s").stop().animate({
            width: f + "%"
        }, 600);
    } catch(g) {
        this.debug(g)
    }
}
function uploadSuccessList(file, serverData) {
	var b = eval('('+serverData+')');
	var pro = file.id;
	if(b.state == "SUCCESS"){
		$("#"+pro).find(".li-name").hide();
		$("#"+pro).find(".li-progress").hide();
		$("#"+pro).find(".li-move").show();
		$("#"+pro).find(".li-thumb").show();
		$("#"+pro).find(".li-thumb img").attr("data-val", b.url);
		$("#"+pro).find(".li-thumb img").attr("src", cfg_attachment+b.url+"&type=small");
		$("#"+pro).find(".li-thumb .enlarge").attr("href", cfg_attachment+b.url);
		$("#"+pro).find(".li-desc").show();	
		
		$("#deleteAllAtlas").show();
		
		$("#"+pro).find(".li-rm").bind("click", function(){
			var t = $(this), img = t.siblings(".li-thumb").find("img").attr("data-val");
			delAtlasImg(pro, img);
		});
	}else{
		$.dialog.alert(b.state);
		$("#"+pro).remove();
	}
}

//附件上传完成
function uploadSuccessSoft(file, serverData) {
	var b = eval('('+serverData+')');
	if(b.state == "SUCCESS"){
		setTimeout(function() {
			var c = $("#license"),
			f = $("#litpic"),
			g = $("#licenseFiles"),
			h = $("#reupload");
			if (b == "") $.dialog.alert("上传过程中网络出现了问题，您可重新上传"),
				c.attr("class", "uploadinp"),
				g.hide(),
				$("#cancelUploadBt, #licenseProgress").hide(),
				h.hide();
			else {
				var i = new Image,
				j = g.find("a:eq(0)");
				g.attr("style", "display:inline-block"), 
				c.attr("class", "uploadinp uploading"), 
				g.show(), 
				h.attr("style", "display:inline-block"), 
				j.attr("href", cfg_attachment+b.url), 
				i.src = j.attr("href"), 
				$("#cancelUploadBt, #licenseProgress, #licenseFileName").hide(), 
				f.val(b.url);
			}
		}, 1000);
	}else{
		$.dialog.alert(b.state);
		$("#license").attr("class", "uploadinp"),
    	$("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide();
	}
}

//视频上传完成
function uploadSuccessVideo(file, serverData) {
	var b = eval('('+serverData+')');
	if(b.state == "SUCCESS"){
		setTimeout(function() {
			var c = $("#license"),
			f = $("#litpic"),
			g = $("#licenseFiles"),
			h = $("#reupload");
			if (b == "") $.dialog.alert("上传过程中网络出现了问题，您可重新上传"),
				c.attr("class", "uploadinp"),
				g.hide(),
				$("#cancelUploadBt, #licenseProgress").hide(),
				h.hide();
			else {
				g.attr("style", "display:inline-block"), 
				c.attr("class", "uploadinp uploading"), 
				g.show();
				h.attr("style", "display:inline-block"), 
				$("#cancelUploadBt, #licenseProgress, #licenseFileName").hide(), 
				f.val(b.url);
				$("#licenseFiles a").attr("data-id", b.url);
			}
		}, 1000);
	}else{
		$.dialog.alert(b.state);
		$("#license").attr("class", "uploadinp"),
    	$("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide();
	}
}

//删除已上传图集文件
function delAtlasImg(obj, path){
	var g = {
		mod: modelType,
		type: "delAtlas",
		picpath: path,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: false,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function() {}
	});
	$("#"+obj).remove();
	
	if($("#listSection li").length < 1){
		$("#deleteAllAtlas").hide();
	}
}