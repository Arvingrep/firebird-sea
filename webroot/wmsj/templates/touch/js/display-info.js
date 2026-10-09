var fileCount = 0,
	ratio = window.devicePixelRatio || 1,
	thumbnailWidth = 100 * ratio,   // 缩略图大小
	thumbnailHeight = 100 * ratio;  // 缩略图大小;

var swipershow;
new Vue({
	el:'#page',
	data:{
		shop_notice_used:shop_notice_used*1, //店铺公告开启
		imageList:typeof(imageList)!='undefined'?imageList:"", //店铺图片
		LOADING:false,  //loading图标显示
		imgShow:false,  //店铺主图
	},
	mounted() {
		var subType = $(".save_btn").attr('data-type');
		if(subType=='image-info'){
			this.uploadImage();
			swipershow = new Swiper('.swiper-container', {
		      slidesPerView:'auto',
			  observer:true,
			  observeParents:true,
		      pagination: {
				  el: '.pagenation',
				  type:"fraction",
				},
			});
		}
	},
	methods:{
		submit:function(){
			var form = $("#submitForm"), btn = $('.save_btn');
			var dotype = btn.attr('data-type')
			btn.attr('disabled');
			if(dotype =='image-info'){
				 var pics = [];
			    $(".detail_box.shop_image .thumbnail").each(function(){
			      var img = $(this).find('img'), val = img.attr('data-val');
			      if(val){
			        pics.push(val);
			      }
			      $("#shop_banner").val(pics.join(","));
			    })
			}
			this.LOADING = true;
			axios({
				method: 'post',
				url: '?id='+shopid,
				data:form.serialize()+'&dotype='+dotype,
			}).then((response)=>{
				var data = response.data
				if(data.state==100){
					
				}
				this.LOADING = false;
				btn.removeAttr('disabled');
				showErr(data.info);
			})
		},
		setMain:function(){
			var el = event.currentTarget;
			var index = $(".swiper-slide.swiper-slide-active").attr('data-index');
			var html1 = $("dd.litpic[data-index='"+index+"']");
			var html2 = $(".swiper-slide.swiper-slide-active");
			$(".swiper-box .swiper-wrapper").prepend(html2)
			$(".detail_box.shop_image dt").after(html1);
			swipershow.update();
			swipershow.slideTo($(".swiper-slide[data-index='"+index+"']").index());
			this.countImgUrl();
		},
		// 删除图片
		delimg:function(f){
			var el = event.currentTarget,li=$(el).closest("dd");
			var file = [];
			file['id'] = li.attr("id");
			this.removeFile(file);
			var index = li.attr('data-index');
			$(".swiper-box .swiper-wrapper .swiper-slide[data-index='"+index+"']").remove();
			swipershow.update();
		},
		show_delimg:function(){
			var index = $(".swiper-box .swiper-wrapper .swiper-slide-active").attr('data-index');
			console.log(index)
			$('.detail_box.shop_image dd[data-index="'+index+'"]').find(".del_btn").click();
		},
		/* 上传图片相关 */
		uploadImage:function(){
			var tt = this;
			
			// 上传图片
			uploader = WebUploader.create({
			 	auto: true,
			 	swf: '/static/js/webuploader/Uploader.swf',
			 	server: '/include/upload.inc.php?mod='+modelType+'&type=atlas',
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
			// 当有文件添加进来的时候
			uploader.on('fileQueued', function(file) {
	
				//先判断是否超出限制
				if(fileCount == (atlasMax-1)){
					$(".upbtn").hide()
				}
				if(fileCount == atlasMax){
					showErr(langData['siteConfig'][20][305]);//图片数量已达上限
					// $(".uploader-btn .utip").html('<font color="ff6600">图片数量已达上限</font>');
					return false;
				}
				console.log(file)
				fileCount++;
				tt.addFile(file);
				
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
					var len = $(".swiper-wrapper .swiper-slide:last-child").attr('data-index')*1 + 1;
					$(".swiper-wrapper").append('<div class="swiper-slide" data-index="'+len+'"><img src="'+response.turl+'" alt=""></div>');
					swipershow.update();
				}else{
					this.removeFile(file);
					showErr(langData['siteConfig'][20][306]+'！');//上传失败！
					// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
				}
			});
		
			// 文件上传失败，现实上传出错。
			uploader.on('uploadError', function(file){
				this.removeFile(file);
				showErr(langData['siteConfig'][20][306]+'！');//上传失败！
				// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
			});
			
			// 完成上传完了，成功或者失败，先删除进度条。
			uploader.on('uploadComplete', function(file){
				$('#'+file.id).find('.progress').remove();
				tt.countImgUrl();
			});
			//上传失败
			uploader.on('error', function(code){
				var txt = langData['siteConfig'][20][306]+'！';//上传失败！
				switch(code){
					case "Q_EXCEED_NUM_LIMIT":
						txt = langData['siteConfig'][20][305];//图片数量已达上限
						break;
					case "F_EXCEED_SIZE":
						txt = langData['siteConfig'][20][307].replace('1',(atlasSize/1024/1024));//图片大小超出限制，单张图片最大不得超过1MB
						break;
					case "F_DUPLICATE":
						txt = langData['siteConfig'][20][308];//此图片已上传过
						break;
				}
				showErr(txt);
				// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
			});
				
		},
		addFile:function(file){
			var len = $(".swiper-slide:last-child").attr('data-index')*1 + 1;
			var ii = $(".swiper-slide:last-child").index()+1;
			var $li   = $('<dd id="' + file.id + '" class="thumbnail litpic" data-index="'+len+'"><img></dd>'),
				$btns = $('<div class="del_btn"></div>').appendTo($li),
				$img = $li.find('img');
			var tt = this;
				// 创建缩略图
				uploader.makeThumb(file, function(error, src) {
						if(error){
							$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');//不能预览
							return;
						}
						$img.attr('src', src);
					}, thumbnailWidth, thumbnailHeight);
				// 删除图片
				$btns.on('click', function(){
					tt.delimg();
				});
				// 预览图片
				$img.on('click',function(){
					tt.imgShow = !tt.imgShow;
					tt.imgshow(ii);
				})
				$(".upbtn").before($li);
				
		},
		// 负责view的销毁
		removeFile:function(file) {
			var $li = $('#'+file.id);
			fileCount--;
			$(".upbtn").show()
			this.delAtlasPic($li.find("img").attr("data-val"));
			$li.remove();
			this.countImgUrl();
		},
		// 删除图片
		delAtlasPic:function(b){
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
		},
		countImgUrl:function(){
			var imgUrl = [];
			$(".detail_box.shop_image dd.litpic").each(function(){
				var t = $(this);
				imgUrl.push(t.find('img').attr('data-val'));
			});
			$("#shop_banner").val(imgUrl.join(','));
			console.log($("#shop_banner").val())
		},
		imgshow:function(index){
			swipershow.slideTo(index)
		}
	}
});



var showErrTimer;
function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});
	$(".popErr").css({
		"visibility": "visible"
	});
	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});
	}, 1500);
 }

 
	