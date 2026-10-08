/**
 * 会员中心图文直播消息列表
 * by guozi at: 20150627
 */
var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";
var objId = $("#list"), keywords = "";
var editpro = 0 ,edit,editid=0;
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	//项目
	$(".main-sub-tab li label").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			atpage = 1;
			t.addClass("curr").siblings("label").removeClass("curr");
			getList();
		}
	});

	getList(1);

	//删除
	objId.delegate(".del_btn", "click", function(){
		var t = $(this), par = t.closest(".proli"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){  //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=live&action=delProduct&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								if(objId.children('.proli').length == 0){
									setTimeout(function(){getList(1);}, 200);
								}
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

	$(".search_btn").click(function(e){
		e.preventDefault();
		keywords = $.trim($("#search").val());
		getList(1);
	});

	$("#search").on("keydown",function(e){
		if(e.keyCode==13){
			e.preventDefault();
			keywords = $.trim($("#search").val());
			getList(1);
		}
	})

	var selectDate = function(el){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'yyyy-MM',
			maxDate: $('#month').val(),
			onpicked: function(){
				getArticleTotal();
			}
		});
	}
	$("#month").click(function(){
		selectDate("month");
	});


	// 关闭发布
	$(".fabu_pro .close_btn,.fabu_mask").click(function(){
		$('.fabu_mask,.fabu_pro').hide();
	});

	// 发布框显示
	$(".link_create").click(function(){
		editpro = 0;
		$('.fabu_mask,.fabu_pro').show();
		// 初始化弹出层
		$(".fabu_pro .pro_img .img_show").remove();
		$(".imglist-hidden,#ptitle,#pprice,#plink").val('');  //所有input清空
		$(".fabu_pro .up_img").show();
	});

	// 标题输入
	$("#ptitle").on("input propertychange", function(){
		var t = $(this), val = t.val();
		$(".count em").text(val.length)
		if(val.length>=25){
			t.val(val.substring(0,24))
		}
	});

	$(".list_main").delegate("li.proli .edit_btn","click",function(){
		editpro = 1;
		$('.fabu_mask,.fabu_pro').show();
		var li = $(this).closest('.proli');
		var id = li.attr("data-id");
		var img	= li.find(".pro_img img").attr("src");
		var imgval = li.find(".pro_img img").attr("data-val");
		var url = li.find("h2>a").attr("href");
		var price = li.find(".pro_price em").text();
		var title = li.find("h2>a").text();
		$(".fabu_pro .up_img").hide();
		$(".fabu_pro .pro_img").append('<div class="img_show" id="WU_FILE_0"><img src="'+img+'" data-val="'+imgval+'" data-url="'+img+'"><a href="javascript:;" class="del_img">重新上传</a></div>');
		$('.imglist-hidden').val(imgval)
		$("#plink").val(url);
		$("#ptitle").val(title);
		$("#pprice").val(price);
		$("em.symbol").addClass("onfocus");
		editid = id;
	});

	// 监听价格input
	$("#pprice").on("input propertychange",function(){
		var t = $(this), val = $(this).val();
		if(val != ""){
			$("em.symbol").addClass("onfocus");
		}else{
			$("em.symbol").removeClass("onfocus");
		}
		var nowval = val.replace(/[^\d\.]/g,'')
			t.val(nowval)
	});
	$("#pprice").on("blur",function(){
		var t = $(this), val = Number(t.val());
		if(val==""){
			$("em.symbol").removeClass("onfocus");
		}else{
			t.val(val.toFixed(2));
		}
	})


	// 点击发布按钮
	$(".btn_submit").click(function(event){
		event.preventDefault();
		if(!editpro){
			url     = '/include/ajax.php?service=live&action=putProduct&aid='+chatid;
		}else{
			url     = '/include/ajax.php?service=live&action=editProduct&id='+editid;
		}
		var t       = $(this),
			form    = $('#fabuForm'),
		    title   = $.trim($('#ptitle').val()),
			price   = $("#pprice").val(),
			link    = $("#plink").val(),
			imglist = $('.imglist-hidden').val();
			var uText = link.replace(/(^\s*)|(\s*$)/g, "");
			var reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

			if(title == ''){
				 $.dialog.alert('请输入商品名称');   //请输入商品名称
				 return false;
			}else if(price==''){
				$.dialog.alert('请输入商品价格');   //请输入商品价格
				return false;
			}else if(imglist==''){
				$.dialog.alert('请上传商品图片');   //请上传商品价格
				return false;
			}else if(link==''){
				$.dialog.alert('请输入商品链接');   //请上传商品价格
				return false;
			}else if(!reg.test(uText)){
				$.dialog.alert('这不是正确的链接');   //这不是正确的链接
				return false;
			}

			data = {
				'title' : title,
				'price' : price,
				'pic'   : imglist,
				'url'   : link
			}
			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中
			$.ajax({
			      url: url,
			      type: 'post',
			      data: data,
			      dataType: 'json',
			      success: function(res){
			        if(res && res.state == 100){
			          $.dialog.confirm(res.info, function(){
			            location.reload();
			          }, function(){
			            location.reload();
			          })
			        }else{
			          $.dialog.alert(res.info);
			          t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即投稿
			        }
			      },
			      error: function(){
			        $.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
			        t.removeClass("disabled").html(langData['siteConfig'][11][19]); //立即投稿
			      }
			 })
	})



	// 上传图片
	$('.filePicker').each(function() {
		 var picker = $(this), type = picker.data('type'), type_real = picker.data('type-real'), atlasMax = count = picker.data('count'), size = picker.data('size') * 1024, upType1, accept_title, accept_extensions = picker.data('extensions'), accept_mimeTypes = picker.data('mime');
		serverUrl = '/include/upload.inc.php?mod='+pubModelType+'&filetype=image&type=thumb';
		accept_title = 'Images';
		accept_extensions = 'jpg,jpeg,gif,png';
		accept_mimeTypes = 'image/*';
		 var i = $(this).attr('id').substr(10);
		 var $list = $('.pro_img'),
		uploadbtn = $('.up_img'),
		ratio = window.devicePixelRatio || 1,
		fileCount = 0,
		thumbnailWidth = 100 * ratio,   // 缩略图大小
		thumbnailHeight = 100 * ratio,  // 缩略图大小
		uploader;
		fileCount = $list.find('li.pubitem').length;

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

		//删除已上传图片
		var delAtlasPic = function(b){
			var delbox = b.closest('.pro_img'), delType = delbox.find('.filePicker').attr('data-type'), real_type = delbox.find('.filePicker').attr('data-type-real'), picpath = b.find("img").attr("data-val");
			if (delType == "thumb") {
				delType1 = "thumb";
			}else if (delType == "desc" || delType == "adv" || delType == "name" || delType == "album" || delType == "certs" || delType == "pics") {
			delType1 = "atlas";
			}else {
			// delType1 = real_type ? real_type : delType;
		  if(real_type){
			delType1 = real_type;
			picpath = picpath ? picpath : b.children().attr("data-val");
		  }else{
			delType1 = delType;
		  }
			}

			picpath = picpath ? picpath : b.closest('.listSection').next("input").val();
			var g = {
				mod: pubModelType,
				type: "delthumb",
				picpath: picpath,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				url: "/include/upload.inc.php",
				data: $.param(g)
			})
		};

		//更新上传状态
		function updateStatus(obj){
		var listImgBox = obj.closest('.pro_img'), listSection = listImgBox.find(".listSection"),
			li = listSection.find('li'), filePicker = listImgBox.find('.filePicker'), count = filePicker.attr('data-count');
			if(li.length == 0){
				$('.imgtip').show();
		  obj.closest('.listImgBox').find('.filePicker').show();
				obj.closest('.listImgBox').find('.listSection').hide();
				obj.closest('.listImgBox').find('.deleteAllAtlas').hide();
			}else{
				$('.imgtip').hide();
				if(count == 1){
					obj.closest('.listImgBox').find('.uploadinp').hide();
				}
			}

		}

		// 负责view的销毁
		var removeFile = function(file) {
			var $li = $('#'+file.id);
			$(".imglist-hidden").val('')
			fileCount--;
			if($li.find("img").attr("data-val") != ''){
				delAtlasPic($li);
			}
			$li.remove();
			updateStatus($li);
		}

		//从队列删除
		$list.delegate(".del_img", "click", function(){
			var t = $(this), li = t.closest(".img_show"), ul = li.closest('.pro_img'), dd = t.closest('.pro_img'), uploadinp = dd.find('.up_img'),
			dataCount = uploadinp.attr("data-count");
			var file = [];
			file['id'] = li.attr("id");
			removeFile(file);
			uploadinp.show();
		});
		// 当有文件添加进来时执行，负责view的创建
		function addFile(file) {
			 var $li = $('<div class="img_show" id="' + file.id + '"><img><a href="javascript:;" class="del_img">重新上传</a></div>');//删除图片
			var $btns = $li.find('.del_img'),
				$img = $li.find('img');

			// 创建缩略图
			uploader.makeThumb(file, function(error, src) {
					if(error){
						$list.show();
						$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
						return;
					}
					$img.attr('src', src);
				}, thumbnailWidth, thumbnailHeight);

				$btns.on('click', function(){
					uploader.cancelFile( file );
					uploader.removeFile(file, true);
				});

				$('.deleteAllAtlas').on('click', function(){
					uploader.removeFile(file, true);
				});

				picker.before($li);
				picker.hide();
		}

		// 当有文件添加进来的时候
				uploader.on('fileQueued', function(file) {

			    var pick = $(this.options.pick);
					//先判断是否超出限制
					if(fileCount == atlasMax){
				    alert(langData['siteConfig'][38][24]);//文件数量已达上限
						uploader.cancelFile( file );
						return false;
					}

					fileCount++;
					addFile(file);
					updateStatus(pick);
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

				// 文件上传成功，给pubitem添加成功class, 用样式标记上传成功。
				uploader.on('uploadSuccess', function(file, response){
					window.webUploadSuccess && window.webUploadSuccess(file, response, picker);
					var $li = $('#'+file.id);
					if(response.state == "SUCCESS"){
						var img = $li.find("img");
						$(".imglist-hidden").val(response.url)
						if (img.length > 0) {
							img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
							$li.find(".enlarge").attr("href", response.turl);
							$li.closest('.listImgBox').find('.deleteAllAtlas').show();
				      if(fileCount == atlasMax && atlasMax == 1){
				        $(this.options.pick).closest('.uploadinp').hide();
				  			return false;
				  		}
						}else {
							$li.addClass("complete");
							fileObj = $li.find('.enlarge');
							var src = fileObj.attr("src");
							if(src !== undefined){
								fileObj.attr("src", response.turl);
							}
							fileObj.attr("href", response.turl).attr("data-val", response.url);
							fileObj.find('.thumb-error').text(langData['siteConfig'][26][193]);//点击下载


						}
					}else{
			            $li.closest('.listImgBox').find('.filePicker').show();
						removeFile(file, true);
						var length = listSection.find('li').length;
						if (length == 0) {
							listSection.siblings('.filePicker').show();
							alert(response.state);
						}else if(response.state.indexOf('图片内容涉') > -1 || response.state.indexOf('上传失败') > -1){
		                    alert(response.state);
		                }
				    // showErr($(this.options.pick), "上传失败");
					}
				});

				// 文件上传失败，现实上传出错。
				uploader.on('uploadError', function(file){
					removeFile(file);
			    	alert(langData['siteConfig'][20][306]);//上传失败
				});

				// 完成上传完了，成功或者失败，先删除进度条。
				uploader.on('uploadComplete', function(file){
					$('#'+file.id).find('.progress').remove();
					//清空队列
			    //  uploader.reset();
				});

				// 所有文件上传成功后调用
				uploader.on('uploadFinished', function () {
				    //清空队列
				     uploader.reset();
				});

				//上传失败
				uploader.on('error', function(code){
					var txt = "上传失败！", size = this.options.fileSingleSizeLimit;
					switch(code){
						case "Q_EXCEED_NUM_LIMIT":
							txt = langData['siteConfig'][20][305];//图片数量已达上限
							break;
						case "F_EXCEED_SIZE":
							txt = langData['siteConfig'][20][307].replace('1',(size/1024/1024)); //图片大小超出限制，单张图片最大不得超过1MB
							break;
						case "F_DUPLICATE":
							txt = langData['siteConfig'][20][308];//此图片已上传过
							break;
					}
			    alert(txt);
				});


	});



});

function getList(is){
	// $('#getTotal').hasClass('openTotal') && $('#getTotal').click();
	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();



	$.ajax({
		url: "/include/ajax.php?service=live&action=product&aid="+chatid+"&orderby=asc&zero=1&pageSize="+pageSize+"&u=1&page="+atpage+"&keywords="+keywords,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  // //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
						$(".live_head h3 em").text(data.info.pageInfo.totalCount)
					//拼接列表
					if(list.length > 0){
						pro_num = (atpage - 1)*pageSize;
						for(var i = 0; i < list.length; i++){
							var item    = [],
								id      = list[i].id,
								img     = list[i].pic,
								url     = list[i].url,
								title   = list[i].title,
								click   = list[i].click,
								price   = list[i].price;
								pro_num = pro_num + 1;

							html.push('<li class="proli" data-id="'+id+'">');
							html.push('<div class="fn-clear pbox">');
							html.push('<div class="pro_num">'+(list[i].px)+'</div>');
							html.push('<div class="pro_img"><img data-val="'+img+'"  src="/include/attachment.php?f='+img+'"></div>');
							html.push('<div class="pro_info">');
							html.push('<h2><a href="'+url+'" target="_blank">'+title+'</a></h2>');
							html.push('<p><a href="'+url+'" target="_blank">'+url+'</a></p>');
							html.push('<div class="pro_detail"><span class="pro_price">'+echoCurrency('symbol')+'<em>'+price+'</em></span>');
							html.push('<span class="pro_click">'+click+'点击</span></div></div>');
							html.push('<div class="pro_op"><a href="javascript:;" class="edit_btn"><i></i>编辑</a>');
							html.push('<a href="javascript:;" class="del_btn"><i></i>删除</a></div></div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					// switch(state){
					// 	case "":
					// 		totalCount = pageInfo.totalCount;
					// 		break;
					// 	case "0":
					// 		totalCount = pageInfo.gray;
					// 		break;
					// 	case "1":
					// 		totalCount = pageInfo.audit;
					// 		break;
					// 	case "2":
					// 		totalCount = pageInfo.refuse;
					// 		break;
					// }


					// $("#total").html(pageInfo.totalCount);
					// $("#audit").html(pageInfo.audit);
					// $("#gray").html(pageInfo.gray);
					// $("#refuse").html(pageInfo.refuse);
					totalCount = pageInfo.totalCount;
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
			}
		}
	});
}
