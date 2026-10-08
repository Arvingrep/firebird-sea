/**
 * 会员中心图文直播消息列表
 * by guozi at: 20150627
 */
var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";
var objId = $("#list"), keywords = "";
$(function(){

	
	getList(1);

	//删除
	objId.delegate(".del_dt", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){  //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=live&action=delImgText&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								if(objId.children('.item').length == 0){
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
	$(".fabu_pop .close_btn,.fabu_mask").click(function(){
		$('.fabu_mask,.fabu_pop').hide();
	});
	
	// 发布框显示
	$(".link_create").click(function(){
		$('.fabu_mask,.fabu_pop').show();
	});
	
	// 点击发布按钮
	$(".btn_submit").click(function(event){
		event.preventDefault();
		var t       = $(this),
			form    = $('#fabuForm'),
			url     = form.attr('action'),
		    text    = $.trim($('#text').val()),
			imglist = $('.imglist-hidden').val();
			
			if(text == '' && (imglist == "" || imglist == undefined)){
				 $.dialog.alert(langData['siteConfig'][38][45]);//请填写文字消息或上传图片
				 return 
			}
			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中
			$.ajax({
			      url: url,
			      type: 'post',
			      data: form.serialize(),
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
		 var $list = $('#listSection1'),
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
			var delbox = b.closest('.listImgBox'), delType = delbox.find('.filePicker').attr('data-type'), real_type = delbox.find('.filePicker').attr('data-type-real'), picpath = b.find("img").attr("data-val");
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
				type: "del"+delType1,
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
		var listImgBox = obj.closest('.listImgBox'), listSection = listImgBox.find(".listSection"),
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
			fileCount--;
			if($li.find("img").attr("data-val") != ''){
				delAtlasPic($li);
			}
			$li.remove();
			updateStatus($li);
		}

		//从队列删除
		$list.delegate(".del_img", "click", function(){
			var t = $(this), li = t.closest("li"), ul = li.closest('ul'), dd = t.closest('.listImgBox'), uploadinp = dd.find('.uploadinp'),
			dataCount = uploadinp.attr("data-count");
			var file = [];
			file['id'] = li.attr("id");
			removeFile(file);
			updateStatus(ul);
			imgListVal(ul);
			uploadinp.show();
		});
		// 当有文件添加进来时执行，负责view的创建
		function addFile(file) {
			 var $li = $('<li id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a href="javascript:;" class="del_img">'+langData["live"][0][36]+'</a></li>');//删除图片
			var $btns = $li.find('.del_img'),
				$img = $li.find('img');

			// 创建缩略图
			uploader.makeThumb(file, function(error, src) {
					// $img.closest('.listSection').show();
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
		
					//音频文件浏览器右下角增加上传进度
					if(file.ext == 'mp3'){
						var progressFixed = $('#progressFixed_' + file.id);
						if(!progressFixed.length){
							var $i = $("<b id='progressFixed_"+file.id+"'>");
					        $i.css({bottom: 0, left: 0, position: "fixed", "z-index": "10000", background: "#a5a5a5", padding: "0 5px", color: "#fff", "font-weight": "500", "font-size": "12px"});
							$("body").append($i);
							progressFixed = $('#progressFixed_' + file.id);
						}
						progressFixed.text(""+langData['siteConfig'][38][25]+"："+parseInt(percentage * 100) + '%');//上传进度
						if(percentage == 1){
							progressFixed.remove();
						}
					}
		
				});
		
				// 文件上传成功，给pubitem添加成功class, 用样式标记上传成功。
				uploader.on('uploadSuccess', function(file, response){
					window.webUploadSuccess && window.webUploadSuccess(file, response, picker);
					var $li = $('#'+file.id), listSection = $li.closest('.listSection');
					listSection.show();
					if(response.state == "SUCCESS"){
						var img = $li.find("img");
						if (img.length > 0) {
							img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
							$li.find(".enlarge").attr("href", response.turl);
							$li.closest('.listImgBox').find('.deleteAllAtlas').show();
							imgListVal(img);
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
							imgListVal(fileObj);
		
							if(type_real == "video"){
								$li.find(".cancel").text(langData['siteConfig'][6][8]);//删除
								$li.append('<p class="info">'+langData['siteConfig'][38][26]+'<span class="time">00:00</span></p> '); //上传成功
								if(response.poster){
									fileObj.attr("poster", response.poster);
								}
								var video_ = document.getElementById('video_'+file.id);
			          video_.addEventListener("loadedmetadata", function(){
			           	var seconde = parseInt(video_.duration);
			           	var time = "";
			           	if(seconde > 3600){
			           		var h = seconde % 3600,
			           				m = ( seconde - h * 3600 ) % 60,
			           				s = seconde - h * 3600 - m * 60;
			           		h = h < 10 ? '0' + h : h;
			           		m = m < 10 ? '0' + m : m;
			           		s = s < 10 ? '0' + s : s;
			           		time = h + ':' + m + ':' + s;
			           	}else if(seconde > 60){
			           		var m = seconde % 60,
			           				s = seconde - m * 60;
			       				m = m < 10 ? '0' + m : m;
			           		s = s < 10 ? '0' + s : s;
			           		time = m + ':' + s;
			           	}else{
			           		var s = seconde < 10 ? '0' + seconde : seconde;
			           		time = '00:' + s;
			           	}
			           	$li.find(".info span").text(time);
			          })
							}
						}
					}else{
			            $li.closest('.listImgBox').find('.filePicker').show();
						removeFile(file, true);
						var length = listSection.find('li').length;
						if (length == 0) {
							listSection.siblings('.filePicker').show();
							alert(response.state);
						}else if(response.state.indexOf(langData['live'][2][31]) > -1 || response.state.indexOf(langData['live'][2][32]) > -1){ /* 图片内容涉  上传失败 */
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
					var txt = langData['live'][2][32], size = this.options.fileSingleSizeLimit;
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
	
		function imgListVal(obj){
			var dd = obj.closest('.listImgBox'), btn = dd.find('.filePicker'), type = btn.data("type"),
					listLi = dd.find('.listSection li.pubitem'), $li_list = [];
	
			if (listLi.length != 0) {
				for (var k = 0; k < listLi.length; k++) {
					if (type == "thumb") {
						var imgsrc = listLi.find('img').attr('data-val');
						dd.find('.imglist-hidden').val(imgsrc);
					}else if (type == "desc"){
						var imgsrc = listLi.eq(k).find('img').attr("data-val"), imgdes = listLi.eq(k).find('.li-desc').val();
						$li_list.push(imgsrc+"|"+imgdes);
						dd.find('.imglist-hidden').val($li_list);
					}else if (type == "adv") {
						var imgsrc = listLi.eq(k).find('img').attr("data-val"), name = listLi.eq(k).find('.i-name').val(), href = listLi.eq(k).find('.i-link').val(), desc = listLi.eq(k).find('.i-desc').val(), mark = listLi.eq(k).find('.mark:checked').val();
						$li_list.push(imgsrc+"##"+name+"##"+href+"##"+desc+"##"+mark);
						dd.find('.imglist-hidden').val($li_list);
					}else if (type == "name") {
						var imgsrc = listLi.eq(k).find('img').attr("data-val"), title = listLi.eq(k).find('.li-title').val();
						$li_list.push(imgsrc+"||"+title);
						dd.find('.imglist-hidden').val($li_list);
					}else if (type == "pics") {
						var imgsrc = listLi.eq(k).find('img').attr("data-val"), title = listLi.eq(k).find('.li-title').val();
						$li_list.push(imgsrc+"||"+(title != undefined ? title : ''));
						dd.find('.imglist-hidden').val($li_list.join("###"));
					}else if (type == "album" || type == "single") {
						var imgsrc = listLi.eq(k).find('img').attr("data-val");
						$li_list.push(imgsrc);
						dd.find('.imglist-hidden').val($li_list);
					}else if (type == "certs") {
	          var imgsrc = listLi.eq(k).find('img').attr("data-val"), name = listLi.eq(k).find('.i-name').val(), note = listLi.eq(k).find('.i-note').val();
	          $li_list.push(imgsrc+"##"+name+"##"+note);
	          dd.find('.imglist-hidden').val($li_list.join("||"));
					}else if (type == "quanj") {
						var imgsrc = listLi.find('img').attr('data-val');
						$('#litpic').val(imgsrc);
					}else if (type == "filenail") {
						var imgsrc = listLi.find('.enlarge').attr('data-val');
						dd.find('.imglist-hidden').val(imgsrc);
					}else {
	          var imgsrc = listLi.find('img').attr('data-val');
						dd.find('.imglist-hidden').val(imgsrc);
					}
				}
			}else {
				$li_list = [];
				dd.find('.imglist-hidden').val($li_list);
			}
	
	
		}

});

function getList(is){
	$('#getTotal').hasClass('openTotal') && $('#getTotal').click();
	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	var mold = $('.main-sub-tab label.curr').data('id');

	$("#total").html(0);
	$("#audit").html(0);
	$("#gray").html(0);
	$("#refuse").html(0);

	$.ajax({
		url: "/include/ajax.php?service=live&action=imgTextList&chatid="+chatid+"&page="+atpage+"&pageSize="+pageSize+"&keywords="+keywords,
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

						for(var i = 0; i < list.length; i++){
							var item    = [],
									id      = list[i].id,
									img     = list[i].img,
									text    = list[i].text,
									pubdate = list[i].pubdate,
									title   = '';
							html.push('<li class="fn-clear item" data-id="'+id+'">');
							html.push('<div class="fn-clear con">');
							html.push('<div class="dt_con">');
							html.push('<p>'+huoniao.transTimes(pubdate, 1)+'</p>');
							if(text){
								html.push('<h2>'+text+'</h2>');
							}
							if(img.length>0){
								html.push('<div class="img_list fn-clear">');
								for(var m=0; m<(img.length>4?4:img.length); m++){
									if(img[m]){
										html.push('<a target="_blank" href="'+img[m]+'" class="imgbox"><img src="'+img[m]+'">');
									}else{
										html.push('<a href="javascript:;" class="empty imgbox"><img src="/static/images/placeholder_img.png" title="'+langData['siteConfig'][38][87]+'" />');//图片已删除
									}
									if(img.length>4 && m==3){
										html.push('<div class="mask_img">5+</div>')
									}
									html.push('</a>');
									
								}
								html.push('</div>')
							}
							html.push('</div>');
							html.push('<a href="javascript:;" class="del_dt"><i></i>删除');
							// html.push('<div class="pop_box" style="display: block;"><i class="arr"></i><h5>确认关闭回放？</h5><p>任何用户都将不可收看直播内容</p><div class="btns_group"><a href="javascript:;" class="cancel_btn">取消</a><a href="javascript:;" class="sure_btn">确认</a></div></div>')
							html.push('</a></div></li>');
							// html.push('<div class="item fn-clear" data-id="'+id+'">');
							// html.push('<div class="o"><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');  
							// html.push('<div class="i">');

							// html.push('<p>'+langData['siteConfig'][11][8]+'：'+huoniao.transTimes(pubdate, 1)+'</p>');   //发布时间
							// html.push('<h5><a href="javascript:;">'+title+'</a></h5>');
							// html.push('<div class="content">');
							// if(text){
							// 	html.push('<p>'+text+'</p>');
							// }
							// if(img.length){
							// 	html.push('<div class="pics">');
							// 	for(var n = 0; n < img.length; n++){
							// 		if(img[n]){
							// 			html.push('<a href="'+img[n]+'" target="_blank"><img src="'+img[n]+'" /></a>');
							// 		}else{
							// 			html.push('<a href="javascript:;" class="empty"><img src="/static/images/placeholder_img.png" title="'+langData['siteConfig'][38][87]+'" /></a>');//图片已删除
							// 		}
							// 	}
							// 	html.push('</div>');

							// }
							// html.push('</div>');
							// html.push('</div>');
							// html.push('</div>');

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
