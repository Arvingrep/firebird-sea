if(typeof langData == "undefined"){
    document.head.appendChild(document.createElement('script')).src = '/include/json.php?action=lang';
}

var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";

$(function(){
	/* *********自定义导航******** */
	
	renderbtn()
	function renderbtn(){
		$('.filePicker').each(function() {
			var picker = $(this), type = picker.data('type'), type_real = picker.data('type-real'), atlasMax = count = picker.data('count'), size = picker.data('size') * 1024, upType1, accept_title, accept_extensions = picker.data('extensions'), accept_mimeTypes = picker.data('mime');
			serverUrl = '/include/upload.inc.php?mod='+pubModelType+'&filetype=image&type=atlas&utype='+type;
			var li = $(this).closest('li');
			$(this).attr('id','filePicker'+ li.index())
			accept_title = 'Images';
			accept_extensions = 'jpg,jpeg,gif,png';
			accept_mimeTypes = 'image/*';
		
			//上传凭证
			var i = $(this).attr('id').substr(10);
			var $list = picker.siblings('.imgShow'),
				ratio = window.devicePixelRatio || 1,
				fileCount = 0,
				thumbnailWidth = 100 * ratio,   // 缩略图大小
				thumbnailHeight = 100 * ratio,  // 缩略图大小
				uploader;
	
	
			// 初始化Web Uploader
			uploader = WebUploader.create({
				auto: true,
				swf: pubStaticPath + 'js/webuploader/Uploader.swf',
				server: serverUrl,
				pick: '#filePicker' + i,
				fileVal: 'Filedata',
				accept: {
					title: accept_title,
					extensions: accept_extensions,
					mimeTypes: accept_mimeTypes
				},
				chunked: true,//开启分片上传
				// threads: 1,//上传并发数
				fileNumLimit: count,
				fileSingleSizeLimit: size
			});
	
			uploader.on('fileQueued', function(file) {
				// 创建缩略图
				uploader.makeThumb(file, function(error, src) {
						if(error){
							$list.removeClass("fn-hide");
							$list.html('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
							return;
						}
					$list.append('<img src="'+src+'"><a href="javascript:;" class="del_img"></a>');
					}, thumbnailWidth, thumbnailHeight);

			});

			uploader.on('uploadSuccess', function(file,response) {
				$list.find('img').attr('data-url',response.url).attr('data-src',response.turl)
				$list.siblings(".spePic").val(response.url)
				$list.removeClass("fn-hide");
				picker.addClass("fn-hide");
			});


			// 所有文件上传成功后调用
			uploader.on('uploadFinished', function () {
				//清空队列
				 uploader.reset();
			});
	
			
	

		});
	}
	$(".navList").delegate(".del_img","click",function(){
			var del = $(this);
			var img_box = del.closest(".imgShow");
			var upimg = img_box.siblings(".up_img");
			upimg.removeClass("fn-hide");
			img_box.addClass("fn-hide");
			var picpath = img_box.find("img").attr('data-url');
			var g = {
				mod: pubModelType,
				type: "delatlas",
				picpath: picpath,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				url: "/include/upload.inc.php",
				data: $.param(g),
				success: function(a) {
					img_box.html('');
				}
			})
	});
	
	$(".addNav").click(function(){
		var len = $('.navList li').length;
		$(".navList").append('<li class="nav"><div class="nav_icon"><div class="imgShow fn-hide"></div><div class="up_img filePicker" >'+langData['business'][9][21]+'</div></div><div class="nav_detail"><div class="navname"><input type="text" placeholder="'+langData['business'][9][22]+'" name="name" autocomplete="off"></div><div class="navlink"><input type="text" placeholder="'+langData['business'][9][23]+'" name="link"  autocomplete="off"></div></div><a href="javascript:;" class="del"></a></li>');
		// 上传导航图标    输入导航标题，建议使用四个字     输入网址，以http://或https://开头
		renderbtn()
	})

// 	删除导航
	$(".navList").delegate('.del',"click",function(){
		var t = $(this);
		var li = t.closest('li');
		li_id = li.attr('data-id');
		li.find('.del_img').off('click').click();
		li.remove();
		if(li_id){
			navSubmit()
		}
	})
	
	function navSubmit(tt){
		var flag = true;
		var navData = [];
		var reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
		$(".navList li").each(function(m){
			var t = $(this);
			var uname = t.find('.navname input').val();
			var uText = t.find('.navlink input').val();
			uText = uText.replace(/(^\s*)|(\s*$)/g, "");
			t .attr('data-id',m)
			if(t.find(".imgShow img").size()==0){
				showErrAlert(langData['business'][9][24]);   //{#*  请上传导航图标  *#}
				flag = false;
				return false;
			}else if(uname == ''){
				showErrAlert(langData['business'][9][25]);   //{#*  请输入导航标题  *#}
				flag = false;
				return false;
			}else if(uText == ''){
				showErrAlert(langData['business'][9][26]);  // {#*  请输入导航链接  *#}
				flag = false;
				return false;
			}else if(!reg.test(uText)){
				showErrAlert(langData['business'][9][27]);  // {#*  请输入正确的链接  *#}
				flag = false;
				return false;
			}else{
				navData.push(
					 t.find(".imgShow img").attr('data-url')+ ',' +t.find('input[name="name"]').val() + ',' + t.find('input[name="link"]').val()
				)
			}
		})
		if(!flag) return false; 
		$.ajax({
			url:'/include/ajax.php?service=business&action=updateStoreConfig&custom_nav='+navData.join('|'),
			type: 'get',
			dataType: 'jsonp',
			success: function(data){
				if(data && data.state == 100) {
					showErrAlert(data.info)
				}else{
					showErrAlert(data.info)
				}
			},
			error: function(){
				tt.removeAttr('disabled').html(langData['siteConfig'][45][72]);//重新保存
			}
		})
		
	}
	
	$(".save_btn.add_nav").click(function(){
		var t = $(this);
		navSubmit(t)
	})
	
	/* *********自定义导航******** */
	
	/* 自定义菜单 */
	$(".menuList").delegate('.del_btn',"click",function(){
		var t = $(this),did = t.closest('dl.menu').attr('data-id');
		$(".delMask").addClass('show');
		$(".delAlert").attr('data-id',did).show();
		// t.attr('disabled')
		// $.ajax({
		// 	url: '/include/ajax.php?service=business&action=updateStoreCustomMenu&del=1&id='+did,
		// 	type: 'get',
		// 	dataType: 'jsonp',
		// 	success: function(data){
		// 		if(data && data.state == 100) {
		// 			t.closest('dl').remove();
		// 			showErrAlert(langData['business'][9][28])  ////删除成功
		// 		}else{
		// 			showErrAlert(data.info);
		// 		}
		// 		t.removeAttr('disabled')
		// 	},
		// 	error: function(){
		// 		t.removeAttr('disabled')
		// 		showErrAlert(langData['siteConfig'][44][23]);//网络错误，请重试
		// 	}
		// })
	});
	
	$(".delAlert .cancelDel,.delMask").click(function(){
		$(".delMask").removeClass('show');
		$(".delAlert").hide();
	})
	
	$(".delAlert .sureDel").off('click').click(function(){
		var t = $(this),did = $(".delAlert").attr('data-id')
		t.attr('disabled')
		$.ajax({
			url: '/include/ajax.php?service=business&action=updateStoreCustomMenu&del=1&id='+did,
			type: 'get',
			dataType: 'jsonp',
			success: function(data){
				if(data && data.state == 100) {
					$(".delMask").click()
					$('.menu[data-id="'+did+'"]').remove();
					showErrAlert(langData['business'][9][28])  ////删除成功
				}else{
					showErrAlert(data.info);
				}
				t.removeAttr('disabled')
			},
			error: function(){
				t.removeAttr('disabled')
				showErrAlert(langData['siteConfig'][44][23]);//网络错误，请重试
			}
		})
	})
	
	

})