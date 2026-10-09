// 确认弹窗
function confirmPop(options,callback,cancelcallback){
	var defaultOpt = {
	  // btnTrggle:'.cared',  //必须   点击显示弹窗的按钮，在页面配置
	  btnSure:'确认',   //按钮文字
	  noSure:false,//没有确认按钮
	  noCancel:false,//没有取消按钮
	  isShow:false,
	  btnCancel:'取消',  //取消按钮的文字
	  title:'确定删除信息？',    // 提示标题
	//   btnColor:'#fff',  //确认文字按钮颜色
	//   btnCancelColor:'#fff',  //确认文字按钮颜色
	  // confirmTip:'一经删除不可恢复',  //副标题
	  // trggleType:'1',  //不填表示只有一个按钮可以触发， 1表示有多个按钮触发
	  popClass:'',  //弹窗类名--需特别修改时候
	};
	var elId = 'confirm'+ (new Date()).valueOf();
	var btnNosure = options.noSure?options.noSure:defaultOpt.noSure;
	var btnNocancel = options.noCancel?options.noCancel:defaultOpt.noCancel;
	var firCla = (!btnNosure && !btnNocancel)?'':'singleBtns';//有两个按钮时
  
	//   var confirmHtml = '<div class="confirmPop '+(options.popClass?options.popClass:defaultOpt.popClass)+'" id="'+elId+'"><div class="pubdelMask"></div> ' +
	// 				  '   <div class="pubdelAlert">   ' +
	// 				  '     <div class="pubdelAlertCon">  ' +
	// 				  '       <div>  ' +
	// 				  '         <h2 class="delTile">'+(options.title?options.title:defaultOpt.title)+'</h2> ' +
	// 				  '         <p>'+(options.confirmTip?options.confirmTip:"")+'</p> ' +
	// 				  '       </div>' +
	// 				  '       <ul class="'+firCla+'"> ' +
	// 				  '         <li  style="display:'+(options.noCancel?"none":"block")+'"><a href="javascript:;" class="cancelDel" style="color:'+(options.btnCancelColor?options.btnCancelColor:defaultOpt.btnCancelColor)+'">'+(options.btnCancel?options.btnCancel:defaultOpt.btnCancel)+'</a>' +
	// 				  '         <li style="display:'+(options.noSure?"none":"block")+'"><a href="javascript:;" class="sureDel" style="color:'+(options.btnColor?options.btnColor:defaultOpt.btnColor)+'">'+(options.btnSure?options.btnSure:defaultOpt.btnSure)+'</a>' +
	// 				  '       </ul>' +
	// 				  '     </div>' +
	// 				  '   </div></div>';

		var popIcon = options && options.popIcon ? '<div class="popIcon"><img src="'+options.popIcon+'" /></div>' : ''
		var confirmHtml =   '<div class="confirmPop '+(options.popClass?options.popClass:defaultOpt.popClass)+'" id="'+elId+'">'+
								'<div class="alertPopMask"></div>'+
								'<div class="alertPop">'+
								'	<a href="javascript:;" class="tipClose"></a> '+ popIcon +
								
								'	<div class="popCon">'+
								'		<h3 class="delTile">'+(options.title?options.title:defaultOpt.title)+'</h3>'+
								'		<p class="alertPopText">'+(options.confirmTip?options.confirmTip:"")+'</p>'+
								'		<div class="alertPopBtns '+firCla+'" >'+
								'			<a class="alertPop_sure" style="display:'+(options.noSure?"none;":"inline-block;")+ 'background-color:'+(options.btnColor?options.btnColor:defaultOpt.btnColor)+'">'+(options.btnSure?options.btnSure:defaultOpt.btnSure)+'</a>'+
								'			<a class="alertPop_cancel" style="display:'+(options.noCancel?"none;":"inline-block;")+ 'background-color:'+(options.btnCancelColor?options.btnCancelColor:defaultOpt.btnCancelColor)+'">'+(options.btnCancel?options.btnCancel:defaultOpt.btnCancel)+'</a>'+
								'		</div>'+
								'	</div>'+
							'	</div>'+
							'</div>';


		$("body").append(confirmHtml);
		// 关闭
		$(".alertPop .alertPop_cancel").off('click').click(function(){
		  var p = $(this).closest('.confirmPop')
		  p.find(".alertPopMask").removeClass('show');
		  p.find(".alertPop").hide();
		  if(options.noSure || !options.btnTrggle){
			setTimeout(function(){
			  $("#"+elId).remove();
			},1000)
		  }
		  if(cancelcallback){
			cancelcallback();
		  }
  
		})
		// 关闭
		$(".alertPop .tipClose").off('click').click(function(){
		  var p = $(this).closest('.confirmPop')
		  p.find(".alertPopMask").removeClass('show');
		  p.find(".alertPop").hide();
		  if(options.noSure || !options.btnTrggle){
			setTimeout(function(){
			  $("#"+elId).remove();
			},1000)
		  }
		  
		})
  
		$(".alertPop .alertPop_sure").off('click').click(function(){
		  var p = $(this).closest('.confirmPop')
		  p.find(".alertPopMask").removeClass('show');
		  p.find(".alertPop").hide();
		  if(options.noSure || !options.btnTrggle){
			setTimeout(function(){
			  $("#"+elId).remove();
			},1000)
		  }
		  callback();
		});
		if(options.btnTrggle){
		  $("body").delegate(options.btnTrggle,'click',function(e){
			var btn = $(this);
			if(btn.attr('data-title')){
			  $("#"+elId).find(".alertPop .delTile").text(btn.attr('data-title'))
			}
			$("#"+elId).find(".alertPopMask").addClass('show');
			$("#"+elId).find(".alertPop").show();
		  })
		}
		if(options.isShow){
		  $("#"+elId).find(".alertPopMask").addClass('show');
		  $("#"+elId).find(".alertPop").show();
		}
  
  
  
  }

$(function(){

	var showExpiredPop = $.cookie('showExpired')
	// 商城会员到期提醒
	if( memberExpired == '1'){
		$(".daoqi_mask,.daoqiPop").show();
		
	}
	if(memberExpiredDay  != '' && !showExpiredPop){
		$(".daoqi_mask,.daoqiPop").show();
	}

	$(".daoqiPop .btn_close").click(function(){
		$(".daoqi_mask,.daoqiPop").hide();
		if(memberExpired != '1'){
			$.cookie('showExpired', '1', { expires: 1 });  
		}
	});


	//退出
	$('.logout').bind("click", function(){
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain, path: '/'});
	});

	//鼠标经过显示二级菜单
	$(".head li").hover(function(){
		var t = $(this), popup = t.find(".popup"), subnav = t.find(".subnav");
		if(popup.size() > 0 && !t.hasClass("menu")){
			popup.show();
		}
		if(subnav.size() > 0){
			subnav.show();
		}
	}, function(){
		var t = $(this), popup = t.find(".popup"), subnav = t.find(".subnav");
		if(popup.size() > 0 && !t.hasClass("menu")){
			popup.hide();
		}
		if(subnav.size() > 0){
			subnav.hide();
		}
	});

	$(".menu>a").bind("click", function(){
		$(this).next(".popup").toggle();
		$(this).addClass("hover");
		return false;
	});

	$(".popupMenuList").html($(".sidebar-content").html());

	//商户菜单瀑布流
	$(".popupMenuList").waterfall({
		itemCls: 'item',
    prefix: 'popupMenuList', // the waterfall elements prefix
    colWidth: 135,
    gutterWidth: 5,
    gutterHeight: 5,
    minCol:6,
    maxCol:6,
    checkImagesLoaded: false,
    fitWidth: false,
    dataType: 'html',
    resizable: false,
    loadingMsg:""
	});
	$(".menu .popup").addClass("load");


	//头部搜索
	$(".head li").bind("click", function(){
		var t = $(this);
		if(t.hasClass("search")){
			t.find(".sform").show();
			t.find("input").focus();
			return false;
		}
	});


	if($(".sidebar dl.active").length){
		let par = $(".sidebar dl.active")
		let linkhtml = par.find('dd').html();
		if(linkhtml){
			$('.linkBox').html(linkhtml)
			$('.main').addClass('sideOpen')
			$(".child-bar").removeClass('fn-hide')
		}else{
			$(".child-bar").addClass('fn-hide')
			$(".sidebar").removeClass('openChild')
		}
	}else{
		$(".child-bar").addClass('fn-hide')
		$(".sidebar").removeClass('openChild')
	}

	//侧栏折叠、展开
	$(".sidebar dt").bind("click", function(){
		var t = $(this), par = t.parent();
		let url = par.find('dd').eq(0).find('a').attr('href');
		if(par.find('dd').eq(0).find('a').attr('target') == '_blank'){
			window.open(url)
		}else{
			location.href = url;

		}
		// $('.sidebar').addClass('openChild')
		// par.addClass("active");
		// par.siblings("dl").removeClass("active");
		// let linkhtml = par.find('dd').html();
		// if(linkhtml){
		// 	$('.linkBox').html(linkhtml)
		// 	$('.main').addClass('sideOpen')
		// }
	});

	
	if(typeof(yingye) != 'undefined' && yingye == '0' && typeof(storeState) != 'undefined' &&storeState != '1' && memberExpired != '1'){
		$(".formTab a").click(function(event){
			event.preventDefault();
			if($(this).attr('href').indexOf('yingye=') > -1){
				confirmPop(optionsPop)
			}
		})
		$(".sidebar-content .item.active a").off('click').click(function(event){
			event.preventDefault();
			var href = $(this).attr('href');
			if(href.indexOf('shop') > -1 && (href.indexOf('order-shop') <= -1 && href.indexOf('verify-shop') <= -1)){
				confirmPop(optionsPop);
			}else{
				window.location.href = href;
			}
			return false;
		})
	}else{
		$(".sidebar dd a").bind("click", function(){
			$(this).addClass("curr").siblings("a").removeClass("curr");
		});
	}


	if(memberExpired == 1){
		$(".sidebar-content .item.active a").off('click').click(function(event){
			event.preventDefault();
			var href = $(this).attr('href');
			if(href.indexOf('shop') > -1 && (href.indexOf('order-shop') <= -1 && href.indexOf('verify-shop') <= -1)){
				$(".daoqi_mask,.daoqiPop").show();
			}else{
				window.location.href = href;
			}
			return false;
		});
	}
	

	$("html input").placeholder();

	resizeMainHeight();
	$(window).resize(function(){
		resizeMainHeight();
	});
	function resizeMainHeight(){
		var wh = $(window).height(), hh = $(".head").height();
		$(".main").css({"height": wh-hh-20+"px"});
	}

	$(".notice .close").bind("click", function(){
		var par = $(this).closest(".notice");
		par.animate({"opacity": 0}, 200, function(){
			par.slideUp();
		});
	});

	$(document).click(function (e) {

		$(".menu>a").removeClass("hover");
		$(".menu .popup").hide();

		//点击页面隐藏搜索区域
		if($(".sform input").val() == "" || $(".sform input").val() == $(".sform input").attr("placeholder")){
			$(".sform").hide();
		}

		//点击空白位置隐藏下拉菜单内容
		$(".sel-group").removeClass("open").find(".sel-menu").hide();
	});

	$(".message ").click(function(e){
		if($(e.target).closest('.popup').length == 0 && pageCurr != 'message'){
			window.open(busiUrl + '/message.html')
		}
	})

	//消息
	var messageUl = $(".head .message .mlist");
	var audio = new Audio();
	audio.src = staticPath + 'audio/notice01.mp3';
	var noticed = $.cookie(cookiePre+'noticed');
	if(noticed == undefined || noticed == '' || noticed == 0){
		noticed = [];
	}else{
		noticed = noticed.split(',');
	}
	function getNews(){
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=message&state=0&pageSize=100",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state != 200){
					if(data.state == 101){
						messageUl.html("<li class='empty'>暂无未读消息</li>");
					}else{
						var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

						//拼接列表
						var hasNew = false;
						if(list.length > 0){

							var url = messageUl.data("url");

							for(var i = 0; i < list.length; i++){
								if(i < 10){
									var item  = [],
											id    = list[i].id,
											title = list[i].title,
											date  = list[i].date.split(" "),
											link  = url.replace("%id", id);

									html.push('<li><a href="'+link+'" title="'+title+'"><i>·</i><span class="msg_con">'+title+'</span></a><span class="msg_date">'+date[0]+'</span></li>');
								}

								if(!in_array(noticed, id)){
									hasNew = true;
									noticed.push(id);
								}
							}

							messageUl.html(html.join(""));

							if(hasNew){
								audio.play();
							}
							$.cookie(cookiePre+'noticed', noticed.join(','));

						}else{
							messageUl.html("<li class='empty'>暂无未读消息</li>");
						}

						$('.message > a').html('<s></s>'+langData['siteConfig'][19][239] + '<i class="msg_num">'+pageInfo.unread+'</i>');

					}
				}else{
					$('.message > a').html('<s></s><i>0</i>'+langData['siteConfig'][19][239]);
					$.cookie(cookiePre+'noticed', '');
					messageUl.html("<li class='empty'>暂无未读消息</li>");
				}
			}
		});
		// setTimeout(function(){
		// 	getNews();
		// }, 3000)
	}
	function in_array(arr, id){
		for(var i in arr){
			if(arr[i] == id) return true;
		}
		return false;
	}

	getNews()
	var pageHide = false;
    $('.custom-nav').bind('click', function(){
        $.dialog({
            id: "popupModuleConfig",
            fixed: false,
            title: "模块开关",
            content: '<div class="popup_module_config">'+$('#popupModuleList').html()+'</div>',
            width: 600,
            ok: function(){

				//获取未勾选模块
				var hide = [];
				$('.popup_module_config input').each(function(){
					var t = $(this);
					if(!t.is(":checked")){
						hide.push($(this).val());
					}
				});

				//保存数据
			    $.ajax({
			        url: '/include/ajax.php',
			        data: 'service=member&action=updateBusinessModule&hide=' + hide.join(','),
			        type: 'post',
			        dataType: 'json',
			        success: function (res) {
						if(pageCurr == 'module'){
		            		var url = $('#custom-nav').attr('data-url');
		            		if(url == undefined || url == ''){
		            			location.href = channelDomain;
		            		}else{
		            			location.href = url;
		            		}
		            	}else{
			            	if(pageHide){
			            		location.href = channelDomain;
			            	}else{
								location.reload();
			            	}
		            	}
			        },
			        error: function (res) {
			            alert(langData['siteConfig'][6][201], 2000, false); //网络错误，保存失败，请稍候重试！
			        }
			    })

            }
        });
	});


});




//上传
var uploadCustom = {
	//上传缩略图
	uploadThumb: function(mod, size, type, obj, width, height, queuedList, successList){
		new SWFUpload({

			//后端上传接口
			upload_url: "/include/upload.inc.php?mod="+mod+"&filetype=image&type="+uploadType,

			//上传表单名【需要与后端统一】
			file_post_name: "Filedata",

			//单张上传限制
			file_size_limit: size,

			//类型限制
			file_types: type,

			//类型提示说明
			file_types_description: langData['siteConfig'][23][115],

			//最大数量限制
			file_upload_limit: 0,

			//最小数量限制
			file_queue_limit: 0,

			//加载上传组件
			swfupload_preload_handler: function(){
				return this.support.loading ? void 0 : $("#"+obj).html(langData['siteConfig'][20][546]);
			},

			//加载失败提示
			swfupload_load_failed_handler: function(){
				$("#"+obj).html(langData['siteConfig'][20][546]);
			},

			//拼接文件队列
			file_queued_handler: queuedList,

			//收集上传失败信息
			file_queue_error_handler: function(file, errorCode, message){
				try {
					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							$.dialog.alert(langData['siteConfig'][20][547].replace('1', (this.settings.file_size_limit/1024)));
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							$.dialog.alert(langData['siteConfig'][20][548]);
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							$.dialog.alert(langData['siteConfig'][20][54]);
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							$.dialog.alert(langData['siteConfig'][20][550] +  message > 1 ? langData['siteConfig'][20][551].replace('1', message) : "");
							break;
						default:
							if (file !== null) {
								$.dialog.alert(langData['siteConfig'][20][552]);
							}
							break;
					}
				} catch (ex) {
				//this.debug(ex);
				}

				$("#license").attr("class", "uploadinp"),
				$("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide();
			},

			//上传失败提示
			file_dialog_complete_handler: function(numFilesSelected, numFilesQueued){
				numFilesSelected >= 1 && 0 == numFilesQueued ? $.dialog.alert(langData['siteConfig'][20][547].replace('1', (this.settings.file_size_limit/1024))) : numFilesSelected > 1 ? ($.dialog.alert(langData['siteConfig'][20][553]), $("#license").attr("class", "uploadinp"), $("#licenseProgressBar").width(0), $("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide()) : ($("#licenseProgressBar").width(""), this.startUpload())
			},

			//开始上传
			upload_start_handler: function(){
				return true;
			},

			//上传进度提示
			upload_progress_handler: function(file, bytesLoaded, bytesTotal){
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
			},

			//上传失败
			upload_error_handler: function(file, errorCode, message){
				if(errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED){
					$.dialog.alert(langData['siteConfig'][20][554]+errorCode);
				}
			},

			//上传成功
			upload_success_handler: successList,

			upload_complete_handler: function(){
				try {
					this.startUpload();
				} catch (ex) {}
			},

			button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,  //单选

			//上传按钮实例名
			button_placeholder_id: obj,
			flash_url : cfg_staticPath+"js/swfupload/swfupload.swf",
			flash9_url: cfg_staticPath+"js/swfupload/swfupload_fp9.swf",

			//按钮尺寸
			button_width: width,
			button_height: height,
			button_cursor: SWFUpload.CURSOR.HAND,
			button_window_mode: "transparent",
			debug: false
		});
	}

	//上传图集
	,uploadAtlas: function(mod, size, type, max, obj, width, height, queuedList, successList){
		new SWFUpload({

			//后端上传接口
			upload_url: "/include/upload.inc.php?mod="+mod+"&type=atlas",

			//上传表单名【需要与后端统一】
			file_post_name: "Filedata",

			//单张上传限制
			file_size_limit: size,

			//类型限制
			file_types: type,

			//类型提示说明
			file_types_description: langData['siteConfig'][23][115],

			//最大数量限制
			file_upload_limit: max,

			//最小数量限制
			file_queue_limit: 0,

			//加载上传组件
			swfupload_preload_handler: function(){
				return this.support.loading ? void 0 : $("#"+obj).html(langData['siteConfig'][20][546]);
			},

			//加载失败提示
			swfupload_load_failed_handler: function(){
				$("#"+obj).html(langData['siteConfig'][20][546]);
			},

			//拼接文件队列
			file_queued_handler: queuedList,

			//收集上传失败信息
			file_queue_error_handler: function(file, errorCode, message){
				try {
					if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {

						//拼接文件队列
						var listSection = $("#listSection"), already = listSection.find("li").length, count = atlasMax - already;
						$.dialog.alert(message > 0 && count != 0 ? langData['siteConfig'][20][555].replace('1', count) : langData['siteConfig'][20][556]);
						return;
					}
					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][557] + this.settings.file_size_limit/1024 + "M");
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][548]);
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][549]);
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							break;
						default:
							if (file !== null) {
								uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][552]);
							}
							break;
					}

					if (errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
						delete this.queueData.files[file.id];
					}
					if (this.settings.onSelectError) this.settings.onSelectError.apply(this, arguments);

				} catch (ex) {}
			},

			//上传失败提示
			file_dialog_complete_handler: function(){
				try {
					this.startUpload();
					if(uploadErrorInfo.length > 0){
						var tip = uploadErrorInfo.join("\r");
						$.dialog.alert(langData['siteConfig'][20][558]+"\r\n" + tip );
						uploadErrorInfo = [];
					};
				} catch (ex)  {}
			},

			//开始上传
			upload_start_handler: function(){
				return true;
			},

			//上传进度提示
			upload_progress_handler: function(file, bytesLoaded, bytesTotal){
				try {
					var pro = file.id;
					var f = Math.ceil(100 * (bytesLoaded / bytesTotal));
					$("#"+pro).find(".li-progress s").stop().animate({
						width: f + "%"
					}, 600);
				} catch(g) {}
			},

			//上传失败
			upload_error_handler: function(file, errorCode, message){
				if(errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED){
					$.dialog.alert(langData['siteConfig'][20][554]+errorCode);
				}
			},

			//上传成功
			upload_success_handler: successList,

			upload_complete_handler: function(){
				try {
					if(atlasUpload == undefined){
						atlasUpload = this;
					}
					this.startUpload();
				} catch (ex) {}
			},

			//上传按钮实例名
			button_placeholder_id: obj,
			flash_url : cfg_staticPath+"js/swfupload/swfupload.swf",
			flash9_url: cfg_staticPath+"js/swfupload/swfupload_fp9.swf",

			//按钮尺寸
			button_width: width,
			button_height: height,
			button_cursor: SWFUpload.CURSOR.HAND,
			button_window_mode: "transparent",
			debug: false
		});
	}

	//旋转图集文件
	,rotateAtlasPic: function(mod, direction, img, c) {
			var g = {
				mod: mod,
				type: "rotateAtlas",
				direction: direction,
				picpath: img,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				cache: false,
				async: false,
				url: "/include/upload.inc.php",
				dataType: "json",
				data: $.param(g),
				success: function(a) {
					try {
						c(a)
					} catch(b) {}
				}
			});
		}

	//删除已上传的图片
	,delAtlasImg: function(mod, obj, path, listSection, delBtn){
		var g = {
			mod: mod,
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

		if($("#"+listSection).find("li").length < 1){
			$("#"+listSection).hide();
			$("#"+delBtn).hide();
		}
	}
}


//打印分页
function showPageInfo() {
	var info = $(".pagination");
	var nowPageNum = atpage;
	var allPageNum = Math.ceil(totalCount/pageSize);
	var pageArr = [];

	info.html("").hide();

	var pages = document.createElement("div");
	pages.className = "pagination-pages fn-clear";
	info.append(pages);

	//拼接所有分页
	if (allPageNum > 1) {

		//上一页
		if (nowPageNum > 1) {
			var prev = document.createElement("a");
			prev.className = "prev";
			prev.innerHTML = langData['siteConfig'][6][33];
			prev.onclick = function () {
				atpage = nowPageNum - 1;
				getList();
			}
			info.find(".pagination-pages").append(prev);
		}

		//分页列表
		if (allPageNum - 2 < 1) {
			for (var i = 1; i <= allPageNum; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("span");
					page.className = "curr";
					page.innerHTML = i;
				} else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						getList();
					}
				}
				info.find(".pagination-pages").append(page);
			}
		} else {
			for (var i = 1; i <= 2; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("span");
					page.className = "curr";
					page.innerHTML = i;
				}
				else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						getList();
					}
				}
				info.find(".pagination-pages").append(page);
			}
			var addNum = nowPageNum - 4;
			if (addNum > 0) {
				var em = document.createElement("span");
				em.className = "interim";
				em.innerHTML = "...";
				info.find(".pagination-pages").append(em);
			}
			for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
				if (i > allPageNum) {
					break;
				}
				else {
					if (i <= 2) {
						continue;
					}
					else {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								getList();
							}
						}
						info.find(".pagination-pages").append(page);
					}
				}
			}
			var addNum = nowPageNum + 2;
			if (addNum < allPageNum - 1) {
				var em = document.createElement("span");
				em.className = "interim";
				em.innerHTML = "...";
				info.find(".pagination-pages").append(em);
			}
			for (var i = allPageNum - 1; i <= allPageNum; i++) {
				if (i <= nowPageNum + 1) {
					continue;
				}
				else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						getList();
					}
					info.find(".pagination-pages").append(page);
				}
			}
		}

		//下一页
		if (nowPageNum < allPageNum) {
			var next = document.createElement("a");
			next.className = "next";
			next.innerHTML = langData['siteConfig'][6][34];
			next.onclick = function () {
				atpage = nowPageNum + 1;
				getList();
			}
			info.find(".pagination-pages").append(next);
		}

		//输入跳转
		var insertNum = Number(nowPageNum + 1);
		if (insertNum >= Number(allPageNum)) {
			insertNum = Number(allPageNum);
		}

		var redirect = document.createElement("div");
		redirect.className = "redirect";
		redirect.innerHTML = '<i>'+langData['siteConfig'][13][51]+'</i><input id="prependedInput" type="number" placeholder="'+langData['siteConfig'][26][174]+'" min="1" max="'+allPageNum+'" maxlength="4"><i>'+langData['siteConfig'][13][54]+'</i><button type="button" id="pageSubmit">'+langData['siteConfig'][6][1]+'</button>';
		info.find(".pagination-pages").append(redirect);

		//分页跳转
		info.find("#pageSubmit").bind("click", function(){
			var pageNum = $("#prependedInput").val();
			if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
				atpage = Number(pageNum);
				getList();
			} else {
				$("#prependedInput").focus();
			}
		});

		info.show();

	}else{
		info.hide();
	}
}

//判断手机号码
function checkPhone(num){
	var exp = new RegExp("^1[34578]{1}[0-9]{9}$", "img");
	if(!exp.test(num)){
		//return false;
	}
	return true;
}

//判断邮箱
function checkEmail(num){
	if(!/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/.test(num)){
		return false;
	}
	return true;
}

//判断身份证信息
function checkIdcard(sId) {
	var tj = true;
	var aCity = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }
	var iSum = 0
	var info = ""
	if (!/^\d{17}(\d|x)$/i.test(sId)) {
		tj = false;
	}
	sId = sId.replace(/x$/i, "a");
	if (aCity[parseInt(sId.substr(0, 2))] == null) {
		tj = false;
	}
	sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
	var d = new Date(sBirthday.replace(/-/g, "/"))
	if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {
		tj = false;
	}
	for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11)
	if (iSum % 11 != 1) {
		tj = false;
	}
	return tj;
}

//货币金额格式化
//number传进来的数,fix保留的小数位,默认保留两位小数,fh为整数位间隔符号,默认为空格,jg为整数位每几位间隔,默认为3位一隔
function number_format(number,fix,fh,jg){
   var fix = arguments[1] ? arguments[1] : 2 ;
   var fh = arguments[2] ? arguments[2] : ' ' ;
   var jg = arguments[3] ? arguments[3] : 3 ;
   var str = '' ;
   number = number.toFixed(fix);
   zsw = number.split('.')[0];//整数位
   xsw = number.split('.')[1];//小数位
   zswarr = zsw.split('');//将整数位逐位放进数组
   for(var i=1;i<=zswarr.length;i++)
   {
      str = zswarr[zswarr.length-i] + str ;
      if(i%jg == 0)
      {
        str = fh+str;//每隔jg位前面加指定符号
      }
   }
   str = (zsw.length%jg==0) ? str.substr(1) : str;  //如果整数位长度是jg的的倍数,去掉最左边的fh
   zsw = str+'.'+xsw;//重新连接整数和小数位
   return zsw;
}
