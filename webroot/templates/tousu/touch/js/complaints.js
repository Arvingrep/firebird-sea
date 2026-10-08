$(function(){

	var userid = $.cookie(cookiePre+'login_user');
	if(!userid){
		setTimeout(function(){
			alert("您还没有登录");
			location.href = '/login.html';
		},500)
		return;
	}
	var tousuType = [];
	tousuType['waimai'] = ['餐品质量','配送时效', '服务态度', '建议意见'];
	tousuType['shop'] = ['商品质量','送货时间', '服务态度', '建议意见'];
	tousuType['tuan'] = ['商家服务','描述不符', '核销问题', '建议意见'];
	tousuType['paotui'] = ['配送速度','服务态度', '建议意见'];


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




var thumbSize = 3072, thumbType = 'jpg,jpeg,gif,png,swf', atlasSize = 3221225472, atlasType = 'jpg,jpeg,gif,png', atlasMax = 3;
var modelType = 'siteConfig', upType1 = 'adv';
$('.filePicker').each(function() {
  var t = $(this), id = t.attr('id'), ulid = t.closest('.fileList').attr('id');
	//上传凭证
	var
  // $list = $('#'+id),
  $list = $('#'+ulid),
		uploadbtn = $list.find('.uploadbtn'),
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
		pick: '#'+id,
		fileVal: 'Filedata',
		accept: {
			title: 'Images',
			extensions: 'jpg,jpeg,gif,png',
			mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'
		},
		fileNumLimit: atlasMax,
		fileSingleSizeLimit: atlasSize
	});

	//删除已上传图片
	var delAtlasPic = function(b){
		var g = {
			mod: modelType,
			type: "delAdv",
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
		$(".uploader-btn .utip").html('还能上传'+(atlasMax-fileCount)+'张图片');
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
					$img.replaceWith('<span class="thumb-error">不能预览</span>');
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
			showErr('图片数量已达上限');
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
			showErr('上传失败！');
			// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
		}
	});

	// 文件上传失败，现实上传出错。
	uploader.on('uploadError', function(file){
		removeFile(file);
		showErr('上传失败！');
		// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
	});

	// 完成上传完了，成功或者失败，先删除进度条。
	uploader.on('uploadComplete', function(file){
		$('#'+file.id).find('.progress').remove();
	});

	//上传失败
	uploader.on('error', function(code){
		var txt = "上传失败！";
		switch(code){
			case "Q_EXCEED_NUM_LIMIT":
				txt = "图片数量已达上限";
				break;
			case "F_EXCEED_SIZE":
				txt = "图片大小超出限制，单张图片最大不得超过"+atlasSize/1024/1024+"MB";
				break;
			case "F_DUPLICATE":
				txt = "此图片已上传过";
				break;
		}
		showErr(txt);
		// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
	});

})

	$('#module').change(function(){
		var module = $(this).val();
		if(module == '0' || module == 'siteConfig'){
			$('.tousu .order').hide();
		}else{
			$('#orderList').html('<div class="load">正在查询，请稍后</div>').show().prev().show();
			$.ajax({
				url: '/include/ajax.php?service=member&action=myLatelyOrder&module='+module,
				type: 'get',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						var html = [], list = data.info, len = list.length;
						for(var i = 0; i < len; i++){
							html.push('<div class="it">');
							html.push('	<input type="radio" name="order" value="'+list[i].id+'" class="orderinp"><em></em>');
							html.push('	<p class="ordernum" data-ordernum="'+list[i].ordernum+'">订单号：'+list[i].ordernum+'</p>');
							html.push('	<p>订单时间：'+list[i].pubdate+'</p>');
							html.push('</div>');
						}
						$("#orderList").html(html.join(""));

						var typeList = [];
						typeList.push('<option value="0">请选择</option>');
						console.log(tousuType[module])
						for(var i = 0; i < tousuType[module].length; i++){
							typeList.push('<option value="'+tousuType[module][i]+'">'+tousuType[module][i]+'</option>')
						}
						$("#typeList").show().prev().show();
						$("#type").html(typeList.join(""));
					}else{
						$("#orderList").html('<div class="load">您最近没有订单</div>');
						$("#typeList").hide().prev().hide();
						$("#type").html("");
					}
				},
				error: function(){
					alert('网络错误，请重新选择');
				}
			})
		}
	})
	$('#complaints').click(function(){
		var t = $(this),
			module = $('#module').val(),
			content = $.trim($('#content').val()),
			contact = $.trim($('#contact').val());
		if(t.hasClass('disabled')) return false;

		var oid = 0, ordernum = '', type = '';
		if(module != '0' && module != 'siteConfig'){
			var checked = $('.orderinp:checked');
			oid = checked.val();
			if(!oid){
				alert('请选择订单');
				return false;
			}
			type = $('#type').val();
			ordernum = checked.siblings('.ordernum').attr('data-ordernum');
			if(type == ''){
				alert('请选择投诉内容');
				return false;
			}
		}

		if(content == ''){
			alert('请填写投诉说明');
			return false;
		}
		if(contact == ''){
			alert('请填写您的联系方式');
			return false;
		}

		var img = [];
		$('#fileList li').not('.litpic').each(function(){
			var src = $(this).find("img").attr("data-val");
			if(src != ''){
				img.push(src);
			}
		});

		$.ajax({
			url: '/include/ajax.php?service=member&action=complaints',
			data: {module:module, oid:oid, ordernum:ordernum, type:type, content:content, contact:contact, img:img.join(",")},
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					alert(data.info);
					location.reload();
				}else{
					alert(data.info);
					t.removeClass('disabled');
				}
			},
			error: function(){
				alert('网络错误，请重新提交');
				t.removeClass('disabled');
			}
		})
	})
})