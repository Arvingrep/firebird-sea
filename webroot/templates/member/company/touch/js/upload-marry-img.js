//图片插入到textarea
var if_change = 0,change_item = '';   //0 表示上传  1表示修改
$(function(){	
	try{
		var upType1 = upType;
	}catch(e){
		var upType1 = 'atlas';
	}
	
		//错误提示
	var showErrTimer;
	function showErr(txt){
	    showErrTimer && clearTimeout(showErrTimer);
	    $(".popErr").remove();
	    $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
	    $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
	    $(".popErr").css({"visibility": "visible"});
	    showErrTimer = setTimeout(function(){
	        $(".popErr").fadeOut(300, function(){
	            $(this).remove();
	        });
	    }, 1500);
	}
	  
	//删除已上传图片
	var delAtlasPic = function(b){
		var g = {
			mod: modelType,
			type: "delAtlas",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};
	
	//上传凭证
	// var $list = $('#fileList3'),
	// 	uploadbtn2 = $('#uploadbtn3'),
	// 	ratio = window.devicePixelRatio || 1,
	// 	fileCount = 0,
	// 	thumbnailWidth = 100 * ratio,   // 缩略图大小
	// 	thumbnailHeight = 100 * ratio,  // 缩略图大小
	// 	uploader;
	
	var conuploader = WebUploader.create({
			auto: true,
			swf: staticPath + 'js/webuploader/Uploader.swf',
			server: '/include/upload.inc.php?mod=' + modelType + '&type=thumb',
			pick: '#filePicker3',
			fileVal: 'Filedata',
			accept: {
				title: 'Images',
				extensions: 'jpg,jpeg,gif,png',
				mimeTypes: 'image/*'
			},
			compress: {
				width: 750,
				height: 750,
				// 图片质量，只有type为`image/jpeg`的时候才有效。
				quality: 90,
				// 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
				allowMagnify: false,
				// 是否允许裁剪。
				crop: false,
				// 是否保留头部meta信息。
				preserveHeaders: true,
				// 如果发现压缩后文件大小比原来还大，则使用原来图片
				// 此属性可能会影响图片自动纠正功能
				noCompressIfLarger: false,
				// 单位字节，如果图片大小小于此值，不会采用压缩。
				compressSize: 1024 * 200
			},
			fileNumLimit: 0,
			fileSingleSizeLimit: 10 * 1024 * 1024 * 1024 //10M
		});
		// 当有文件添加进来的时候
		conuploader.on('fileQueued', function(file) {
			var $li = $('<div id="con_' + file.id + '" class="con_thum"><img></div>'),
				// $btns = $('<div class="btns-group"><span class="btn_change">更换</span><span class="btn_del">删除</span></div>').appendTo($li),
				$img = $li.find('img');
				$txt = '<div class="txtbox"></div>';
				// 创建缩略图
				conuploader.makeThumb(file, function(error, src) {
					if (error) {
						$img.replaceWith('<span class="thumb-error">' + langData['siteConfig'][20][304] + '</span>'); //不能预览
						return;
					}
					$img.attr('src', src);
				});
				if(if_change){
					$("#"+change_item).after($li);
					delAtlasPic($("#"+change_item).find('img').attr("data-val")); //删除原图
					$("#"+change_item).remove();
					if_change = 0, change_item = '';
				}else{
					$(".instr_box .textarea").append($li).append($txt);
				}
				
		});
		
		// 文件上传过程中创建进度条实时显示。
		conuploader.on('uploadProgress', function(file, percentage) {
			
			var $li = $('#con_' + file.id),
				$percent = $li.find('.progress span');
		
			// 避免重复创建
			if (!$percent.length) {
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');
			}
			$percent.css('width', percentage * 100 + '%');
		});
		
		// 文件上传成功，给item添加成功class, 用样式标记上传成功。
		conuploader.on('uploadSuccess', function(file, response) {
			var $li = $('#con_' + file.id);
			if (response.state == "SUCCESS") {
				$li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
			} else {
				alert(response.state); //上传失败！
			}
		});
		
		// 文件上传失败，现实上传出错。
		conuploader.on('uploadError', function(file) {
			alert(langData['siteConfig'][44][88]); //上传失败！
			$('.input_file').show();
		});
		
		// 完成上传完了，成功或者失败，先删除进度条。
		conuploader.on('uploadComplete', function(file) {
			$('#' + file.id).find('.progress').remove();
		});
		
		//上传失败
		conuploader.on('error', function(code) {
			var txt = langData['siteConfig'][44][88]; //上传失败！
			switch (code) {
				case "Q_EXCEED_NUM_LIMIT":
					txt = langData['siteConfig'][20][305]; //图片数量已达上限
					break;
				case "F_EXCEED_SIZE":
					txt = langData['siteConfig'][20][307].replace('1', (atlasSize / 1024 / 1024)); //图片大小超出限制，单张图片最大不得超过1MB
					break;
				case "F_DUPLICATE":
					txt = langData['siteConfig'][20][308]; //此图片已上传过
					break;
			}
			showErr(txt)
		});
		// 完成上传完了，成功或者失败，先删除进度条。
		conuploader.on('uploadComplete', function(file) {
			$('#con_' + file.id).find('.progress').remove();
		});

	
	
	
	//更新上传状态
	function updateStatus(){
//		if(fileCount == 0){
//			$('.imgtip').show();
//		}else{
//			$('.imgtip').hide();
			if(atlasMax2 > 1 && $list.find('.litpic').length == 0){
				$list.children('li').eq(0).addClass('litpic');
			}
//		}
		$(".uploader-btn .utip").html('还能上传'+(atlasMax2-fileCount)+'张图片');
	}

	// 负责view的销毁
	function removeFile(file) {
		var $li = $('#'+file.id+'_reno');
		fileCount--;
		delAtlasPic($li.find("img").attr("data-val"));
		$li.remove();
		updateStatus();
	}



	// 删除图片按钮显示
	$("body").delegate(".textarea img","click",function(ev){
		var img = $(this),btns;
		$(".btns-group").remove();
		var top = img.position().top+(img.height()/2);
		
		if(img.parents('.con_thum').size()>0){
			btns = $('<div class="btns-group" style="top:50%; margin-top:-.38rem;"><span class="btn_change">'+langData['live'][5][37]+'</span><span class="btn_del">'+langData['live'][0][36]+'</span></div>');  //更换  删除
		}else{
			btns = $('<div class="btns-group" style="margin-top:-.38rem;"><span class="btn_change">'+langData['live'][5][37]+'</span><span class="btn_del">'+langData['live'][0][36]+'</span></div>');
			btns.css("top",top);
		}
		
		$(this).after(btns);
		btns.show();
		// 选择删除
		$(".btns-group span").off('click').click(function(ev){
			var t =$(this),par = t.closest(".con_thum");
			if(t.hasClass("btn_del")){
				if(par.size()>0){
					delAtlasPic(img.attr('data-val'));
					par.next('.txtbox').remove();
					par.remove()
				}else{
					img.remove();
				}
			}else{
				if_change = 1;
				change_item = par.attr('id');
				console.log('cesji')
				 $("#filePicker3 input").off('click').click();
			}
		});
		$(document).one("click",function(){
			btns.remove();
		})
		ev.stopPropagation();
	});

	$(".textarea").click(function(){
		if_change = 0;
		change_item ='';
	})
	
	
	
	
	
});
