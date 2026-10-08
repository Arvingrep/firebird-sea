$(function(){
    mobiscroll.settings = {
		theme: 'ios',
		themeVariant: 'light',
		height:40,
		lang:'zh',
		headerText:'选择分类',
		calendarText:'选择分类',  //时间区间选择
	};
	 
	 // 上传图片
	 var if_change = 0,change_item = '';   //0 表示上传  1表示修改
	//删除已上传图片
	var delAtlasPic = function(b) {
		var g = {
			mod: modelType,
			type: "delThumb",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};
	 var conuploader = WebUploader.create({
	 			auto: true,
	 			swf: staticPath + 'js/webuploader/Uploader.swf',
	 			server: '/include/upload.inc.php?mod=' + modelType + '&type=thumb',
	 			pick: '#filePicker1',
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
					$(".textarea").append($li).append($txt);
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
 
		// 完成上传完了，成功或者失败，先删除进度条。
		conuploader.on('uploadComplete', function(file) {
			$('#con_' + file.id).find('.progress').remove();
		});
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
					 $("#filePicker1 input").off('click').click();
					 console.log(if_change,change_item)
					 ev.stopPropagation(); //阻止冒泡
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


	// 上传视频
	var upvideoShow = new Upload({
		btn: '.upvideo',
		bindBtn: '',
		title: 'Video',
		mod: modelType,
		// msg_maxImg: langData['circle'][2][35],   /*视频数量已达上限 */
		params: 'type=thumb&filetype=video',
		// atlasMax: 1,
		deltype: 'delVideo',
		replace: false,
		chunked: true,
		accept: {
			title: 'Video',
			extensions: 'mp4,mov,mkv,rm,rmvb',
			mimeTypes: 'video/*'
		},
		fileQueued: function(file) {

			$(".singel_inp.coninp .textarea").append('<div class="video_li" id="' + file.id + '"><span class="load">视频上传中~</span></div>');
		},
		uploadSuccess: function(file, response) {

			if (response.state == "SUCCESS") {console.log(response)
				$('#' + file.id).html('<div class="img_show"><img style="display: none;" class="vposter fn-hide" src="'+response.poster+'"><video src="' + response.turl + '" data-url="' + response.url +'" /></div><div class="btns-group"><span style="100%" class="btn_del">删除</span></div>');
			}
		},
		uploadFinished: function() {
			if (this.sucCount == this.totalCount) {
				//         showErr('所有图片上传成功');
			} else {
				showErr((this.totalCount - this.sucCount) + langData['circle'][2][36]);  /* 个视频上传失败*/

				// 上传失败时，删除之前生成的video_li
				$(".upload_btn").hide();
				$('.video_li').remove();
			}

		},
		uploadError: function() {

		},
		showErr: function(info) {
			showErrAlert(info);
		}
	});
	// 删除视频
	$('.coninp').delegate('.video_li', 'click', function(e) {
		var t = $(this);
		t.find('.btns-group').show();
		e.stopPropagation(); //阻止冒泡
	});
	// 删除视频
	$('.coninp').delegate('.video_li .btn_del', 'click', function() {
		var t = $(this),
		val = t.siblings('video').attr('data-url');
		upvideoShow.del(val);
		t.parents('.video_li').remove();
		showErrAlert('视频删除成功');
	});
	
	 $(".save_btn").click(function(){
		 var t = $(this);
		 t.attr('disabled',true);
		 var jump = $("#menutype").val();
		 var data = $(".formbox form").serialize();
		
		 var body = $(".singel_inp.coninp .textarea").html();
		 body = encodeURIComponent(body);
       	 if($('input[name="title"]').val()== ''){
           showErrAlert('请输入标题');
           return false;
         }
       
       	 if($('#typeid').val()== ''){
           showErrAlert('请选择动态分类');
           return false;
         }
		 $.ajax({
			 url:action,
			 type: "POST",
			 data:data + '&body='+body,
			 dataType: "json",
			 success: function(data){
			   if(data.state==100){
				  if(about_id=='' || about_id=='0'){
					   showErrAlert('添加成功');
				  }else{
					  showErrAlert(data.info)
				  }
				  location.href = urlPath+'/business-news.html'
			   }else{
					showErrAlert(data.info)
              	}
			   t.removeAttr('disabled')
			 },
			 error: function(){
				t.removeAttr('disabled')
			   showErrAlert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
			 }
		   });
	 });
	 
	 typeList()
	 function typeList(){
		 $.ajax({
			 url:'/include/ajax.php?service=business&action=newstype',
			 type: "POST",
			 dataType: "json",
			 success: function(data){
			   if(data.state==100){
				  var list = data.info;
					var instance = mobiscroll.select('#typename', {
						data:list,
						dataText:'typename',
						dataValue:'id',
						onSet: function (event, inst) {
							$("#typename").val(event.valueText)
							$("#typeid").val(inst._wheelArray)
						},
					})
					if($("#typeid").val()){
						instance.setVal(typeid,true);
					}else{
						$("#typeid").val(list[0].id);
					}
					
			   }
			 },
			 error: function(){
			   showErrAlert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
			 }
		});
	 }
	 
	 
	
	 
	
})