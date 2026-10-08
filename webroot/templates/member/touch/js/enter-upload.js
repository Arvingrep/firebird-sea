$(function(){

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

  // 新增一条 电话、qq
  $(".addNew").click(function(){
    var t = $(this), con = t.closest('dl').find('dd .con'), child = con.children('.item'), item = child.eq(0).clone();
    if(con.children('.item').length <= 2){
      item.children('input').val('');
      con.append(item);
    }
    if(con.children('.item').length >= 3){
      t.addClass('disabled');
    }
  })
  // 删除一条
  $(".slideBox").delegate(".close", "click", function(){
    $(this).closest(".item").remove();
  })


  // 上传图片
  $('.input-img').each(function(){
    var t = $(this), id = t.attr('id');
    //上传凭证
  	var $list = t.closest('dl').find('dt'),
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
  		server: '/include/upload.inc.php?mod=member&type=card',
  		pick: {
        id:'#'+id,
        multiple: false
      },
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
  		fileNumLimit: 2,
  		fileSingleSizeLimit: atlasSize
  	});

  	//删除已上传图片
  	var delAtlasPic = function(b){
  		var g = {
  			mod: 'member',
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

    var fileArr = [];

    // 当有文件添加进来时执行，负责view的创建
  	function addFile(file) {
  		var $li   = $('<div id="' + file.id + '"><img></div>'),
  				$img = $li.find('img');

          var imgval = $('#'+id.replace('up_', '')).val();
          if (imgval != "") {
            // uploader.removeFile(imgval, true);
            // removeFile(imgval);
          }

  		// 创建缩略图
  		uploader.makeThumb(file, function(error, src) {
  				if(error){
  					$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');
  					return;
  				}
  				$img.attr('src', src);
  			}, thumbnailWidth, thumbnailHeight);



  			$list.html($li);
  	}

  	// 当有文件添加进来的时候
  	uploader.on('fileQueued', function(file) {

  		//先判断是否超出限制
  		if(fileCount == atlasMax){

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
        $('#'+id.replace('up_', '')).val(response.url);
        fileArr = file;
        $li.closest('dl').find('.picker-btn').text(langData['siteConfig'][6][59]);
  		}else{
  			removeFile(file);
  			showErr(langData['siteConfig'][20][306]);
  		}
  	});

  	// 文件上传失败，现实上传出错。
  	uploader.on('uploadError', function(file){
  		removeFile(file);
  		showErr(langData['siteConfig'][20][306]);
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
  	});
  })
  
  // 提交
  $(".next-btn").click(function(){
    $("#submitForm").submit();
  })
  $("#submitForm").submit(function(e){

    e.preventDefault();
    var t = $(".next-btn"), form = $(this);
    if(t.hasClass("disabled")) return;

    var title = $('#title').val(),
        company = $('#company').val(),
        addrid = $('#addrid').val(),
        address = $('#address').val();

    if(title == ''){
      showErr(langData['siteConfig'][21][128]);
      return false;
    }
    var tel_ok = false;
    $('.tel').each(function(){
      var a = $(this), v = $.trim(a.val());
      if(v != ''){
        tel_ok = true;
      }else{
        if($('.tel').length > 1){
          a.parent().remove();
        }
      }
    })
    // if(!tel_ok){
    //   showErr(langData['siteConfig'][7][0]+langData['siteConfig'][3][1]);
    //   return false;
    // }
    var email_err = email_empty = false;
    $('.email').each(function(){
      var a = $(this), v = $.trim(a.val());
      if(v != ''){
        var emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        if(!emailReg.test(v)){
          a.addClass('warning');
          email_err = true;
        }else{
          a.removeClass('warning');
        }
      }else{
        if($('.email').length > 1){
          a.parent().remove();
        }else{
          email_empty = true;
          return false;
        }
      }
    })

    if(email_err){
      showErr(langData['siteConfig'][21][57]);
      return false;
    }else if(email_empty){
      // showErr(langData['siteConfig'][20][497]);
      // return false;
    }

    if(company == ''){
      showErr(langData['siteConfig'][21][232]);
      return false;
    }

    if(addrid == '0' || addrid == ''){
      showErr(langData['siteConfig'][20][134]);
      return false;
    }

    if(address == ''){
      showErr(langData['siteConfig'][20][252]);
      return false;
    }

    var ids = $(".gz-addr-seladdr").attr("data-ids");
    $("#cityid").val(ids.split(' ')[0]);

    t.addClass("disabled").html(langData['siteConfig'][26][153]);
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=business&action=storeConfig",
      data: form.serialize(),
      dataType: "jsonp",
      success: function (data) {
        if(data.state == 100){
          location.href = data.info;
        }else{
          showErr(data.info);
          t.removeClass("disabled").html(langData['siteConfig'][6][128]);
        }
      },
      error: function(){
        t.removeClass("disabled").html(langData['siteConfig'][6][128]);
        showErr(langData['siteConfig'][20][181]);
      }
    });
  })

  //导航排序
  var bar = document.getElementById("navList");
  var navSort = new Sortable(bar, { group: "omega", filter: function(a, b, c){
    if(b !== null){
      console.log((b))
      console.log((c))
      $('.modal-public').addClass("curr");
      $('html').addClass('nos');
      $('.m-server').addClass('curr');
    }
  }});
  $("#navList").delegate(".close", "click", function(){
    console.log("remove");
    var t = $(this);
    t.parent().remove();
  })
  
  $(".navList .edit").click(function(){
    var t = $(this);
    $(".navList").addClass("edit");
    if($(".navList").hasClass("edit")){
      t.text("完成")
    }
    navSort.options.disabled = true;
  })

  // 关闭
  $(".modal-public .modal-main .close, .bClose").on("touchend",function(){
      $("html, .modal-public").removeClass('curr nos');
      return false;
  })
  $(".bgCover").on("touchend",function(){
      $("html, .modal-public").removeClass('curr nos');
      return false;
  })

})

// 错误提示
function showErr(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}

// 删除图片
function delFile(src){
  var g = {
    mod: "member",
    type: "delCard",
    picpath: src,
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
}
