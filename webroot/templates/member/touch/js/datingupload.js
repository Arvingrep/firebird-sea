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

	//上传凭证
	var $list = $('#fileList'),
		uploadbtn = $('.uploadbtn'),
			ratio = window.devicePixelRatio || 1,
			fileCount = 0,
			thumbnailWidth = 100 * ratio,   // 缩略图大小
			thumbnailHeight = 100 * ratio,  // 缩略图大小
			uploader;

	fileCount = $list.find("li.item").length;

	// 初始化Web Uploader
	uploader = WebUploader.create({
		auto: true,
		swf: staticPath + 'js/webuploader/Uploader.swf',
		server: '/include/upload.inc.php?mod='+modelType+'&type='+upType1,
		pick: '#filePicker',
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
	    compressSize: 1024*200
		},
		fileNumLimit: atlasMax,
		fileSingleSizeLimit: atlasSize
	});

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

	//更新上传状态
	function updateStatus(){
		if(fileCount == 0){
			$('.imgtip').show();
		}else{
			$('.imgtip').hide();
			if(atlasMax > 1 && $list.find('.litpic').length == 0){
				$list.children('li').eq(0).addClass('litpic');
			}
		}
		$(".uploader-btn .utip").html(langData['siteConfig'][20][303].replace('1', (atlasMax-fileCount)));
	}

	// 负责view的销毁
	function removeFile(file) {
		var $li = $('#'+file.id);
		fileCount--;
		delAtlasPic($li.find("img").attr("data-val"));
		$li.remove();
		updateStatus();
	}

	//从队列删除
	$list.delegate(".cancel", "click", function(){
		var t = $(this), li = t.closest("li");
		var file = [];
		file['id'] = li.attr("id");
		removeFile(file);
		updateStatus();
	});

	// 切换litpic
	if(atlasMax > 1){
		$list.delegate(".item img", "click", function(){
			var t = $(this).parent('.item');
			if(atlasMax > 1 && !t.hasClass('litpic')){
			console.log('eee')
				t.addClass('litpic').siblings('.item').removeClass('litpic');
			}
		});
	}

	// 当有文件添加进来时执行，负责view的创建
	function addFile(file) {
		var $li   = $('<li id="' + file.id + '" class="thumbnail"><img></li>'),
				$btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
				$img = $li.find('img');

		// 创建缩略图
		uploader.makeThumb(file, function(error, src) {
				if(error){
					$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');
					return;
				}
				$img.attr('src', src);
			}, thumbnailWidth, thumbnailHeight);

			$btns.on('click', 'span', function(){
				uploader.removeFile(file, true);
			});

			uploadbtn.after($li);
	}

	// 当有文件添加进来的时候
	uploader.on('fileQueued', function(file) {

		//先判断是否超出限制
		if(fileCount == atlasMax){
			showErr(langData['siteConfig'][20][305]);
			// $(".uploader-btn .utip").html('<font color="ff6600">图片数量已达上限</font>');
			return false;
		}

		fileCount++;
		addFile(file);
		updateStatus();
	});

	// 文件上传过程中创建进度条实时显示。
	uploader.on('uploadProgress', function(file, percentage){
		var $li = $('#'+file.id),
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
	uploader.on('uploadSuccess', function(file, response){
		var $li = $('#'+file.id);
		if(response.state == "SUCCESS"){
			$li.find("img").attr("data-val", response.url).attr("data-url", response.turl);
		}else{
			removeFile(file);
			showErr(langData['siteConfig'][20][306]);
			// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
		}
	});

	// 文件上传失败，现实上传出错。
	uploader.on('uploadError', function(file){
		removeFile(file);
		showErr(langData['siteConfig'][20][306]);
		// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
	});

	// 完成上传完了，成功或者失败，先删除进度条。
	uploader.on('uploadComplete', function(file){
		$('#'+file.id).find('.progress').remove();
	});

	//上传失败
	uploader.on('error', function(code){
		var txt = langData['siteConfig'][20][306];
		switch(code){
			case "Q_EXCEED_NUM_LIMIT":
				txt = langData['siteConfig'][20][305];
				break;
			case "F_EXCEED_SIZE":
				txt = langData['siteConfig'][20][307].replace('1', atlasSize/1024/1024);
				break;
			case "F_DUPLICATE":
				txt = langData['siteConfig'][20][308];
				break;
		}
		showErr(txt);
		// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
	});


})
