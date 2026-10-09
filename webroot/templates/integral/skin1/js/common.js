var uploadErrorInfo = [],
	huoniao = {

    //转换PHP时间戳
    transTimes: function(timestamp, n){

        const dateFormatter = this.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;

        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
            return dateFormatter;
        }else{
            return 0;
        }
    },

    //判断是否为合法时间戳
    isValidTimestamp: function(timestamp) {
        return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
    },

    //创建 Intl.DateTimeFormat 对象并设置格式选项
    dateFormatter: function(timestamp){
        
        if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};

        const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
        // 使用Intl.DateTimeFormat来格式化日期
        const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
        });
        
        // 获取格式化后的时间字符串
        const formatted = dateTimeFormat.format(date);
        
        // 将格式化后的字符串分割为数组
        const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

        // 返回一个对象，包含年月日时分秒
        return {year, month, day, hour, minute, second};
    }

	//数字格式化
	,number_format: function(number, decimals, dec_point, thousands_sep) {  
		var n = !isFinite(+number) ? 0 : +number,
				prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
				sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
				dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
				s = '',
				toFixedFix = function (n, prec) {
					var k = Math.pow(10, prec);
					return '' + Math.round(n * k) / k;
				};

		s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || '').length < prec) {
			s[1] = s[1] || '';
			s[1] += new Array(prec - s[1].length + 1).join('0');
		}
		return s.join(dec);
	}

	//将普通时间格式转成UNIX时间戳
	,transToTimes: function(timestamp){
		var new_str = timestamp.replace(/:/g,'-');
    new_str = new_str.replace(/ /g,'-');
    var arr = new_str.split("-");
    var datum = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
    return datum.getTime()/1000;
	}

	//登录
	,login: function(){
		$("#login_iframe, #login_bg").remove();
		var src = '/login.html?v=1.7',
				wWidth = $(document).width(), 
				wHeight = $(document).height(), 
				fWidht = 650, 
				fHeight = 314;
		$("<div>")
			.attr("id", "login_iframe")
			.html('<iframe scrolling="no" src="'+src+'" frameborder="0" allowtransparency="true"></iframe>')
			.appendTo("body");
		$("<div>")
			.attr("id", "login_bg")
			.css({"height": wHeight+"px"})
			.html('<div class="loadPage">页面加载中，请稍候...</div><iframe></iframe>')
			.appendTo("body");
	}

	//判断登录成功
	,checkLogin: function(fun){
		//异步获取用户信息
		$.ajax({
			url: masterDomain+'/getUserInfo.html',
			type: "GET",
			async: false,
			dataType: "jsonp",
			success: function (data) {
				if(data){
					fun();
				}
			},
			error: function(){
				return false;
			}
		});
	}

	//登录成功
	,loginSuccess: function(){
		//异步获取用户信息
		$.ajax({
			url: masterDomain+'/getUserInfo.html',
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){

					location.reload();
					return false;
					$("#navLoginBefore").hide();

					if(data.photo != ""){
						$("#upic a").html('<img src="'+huoniao.changeFileSize(data.photo, "small")+'" />');
					}else{
						$("#upic").html('欢迎您，').css({"width": "auto"});
					}
					$("#uname").html(data.nickname);

					if(data.message > 0){
						$("#umsg").html("消息("+(data.message > 99 ? "99+" : data.message)+")").show();
					}
					$("#navLoginAfter").show();
				}
			},
			error: function(){
				
			}
		});
	}

	/**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
     ,changeFileSize: function(url, width, height){
        if(url == "" || url == undefined) return "";
    
        //小图尺寸
        if(width == 'small'){
            width = 200;
            height = 200;
        }
    
        //中图尺寸
        if(width == 'middle'){
            width = 500;
            height = 500;
        }
    
        //默认尺寸
        width = typeof width === 'number' ? width : 800;
        height = typeof height === 'number' ? height : 800;
    
        //阿里云、华为云
        url = url.replace('w_4096', 'w_' + width);
        url = url.replace('h_4096', 'h_' + height);
    
        //七牛云
        url = url.replace('w/4096', 'w/' + width);
        url = url.replace('h/4096', 'h/' + height);
    
        //腾讯云
        url = url.replace('4096x4096', width+"x"+height);
    
        return url;
    
        // 以下功能弃用
		if(to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		if(hideFileUrl == 1){
			return url + "&type=" + to;
		}else{
			return url.replace(from, to);
		}
	}

	//获取字符串长度
	//获得字符串实际长度，中文2，英文1
	,getStrLength: function(str) {
		var realLength = 0, len = str.length, charCode = -1;
		for (var i = 0; i < len; i++) {
		charCode = str.charCodeAt(i);
		if (charCode >= 0 && charCode <= 128) realLength += 1;
		else realLength += 2;
		}
		return realLength;
	}

	//上传缩略图
	,uploadThumb: function(mod, size, type, obj, width, height, queuedList, successList){
		new SWFUpload({

			//后端上传接口
			upload_url: "/include/upload.inc.php?mod="+mod+"&type=thumb",
			
			//上传表单名【需要与后端统一】
			file_post_name: "Filedata",

			//单张上传限制
			file_size_limit: size,

			//类型限制
			file_types: type,

			//类型提示说明
			file_types_description: "图片文件",

			//最大数量限制
			file_upload_limit: 0,

			//最小数量限制
			file_queue_limit: 0,

			//加载上传组件
			swfupload_preload_handler: function(){
				return this.support.loading ? void 0 : $("#"+obj).html("加载失败，请检查flash版本！");
			},

			//加载失败提示
			swfupload_load_failed_handler: function(){
				$("#"+obj).html("加载失败，请检查flash版本！");
			},

			//拼接文件队列
			file_queued_handler: queuedList,

			//收集上传失败信息
			file_queue_error_handler: function(file, errorCode, message){
				try {
					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							$.dialog.alert("文件大小超过最大"+this.settings.file_size_limit/1024+"MB上传限制。");
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							$.dialog.alert("零字节文件无法上传。");
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							$.dialog.alert("无效的文件类型。");
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							$.dialog.alert("您选择的文件太多。" +  message > 1 ? "最多可以选择 " +  message + " 个文件。" : "");
							break;
						default:
							if (file !== null) {
								$.dialog.alert("未处理的错误");
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
				numFilesSelected >= 1 && 0 == numFilesQueued ? $.dialog.alert('文件大小超过最大'+this.settings.file_size_limit/1024+'MB上传限制。') : numFilesSelected > 1 ? ($.dialog.alert("您只需要上传一张缩略图即可"), $("#license").attr("class", "uploadinp"), $("#licenseProgressBar").width(0), $("#licenseFiles, #cancelUploadBt, #licenseProgress, #reupload").hide()) : ($("#licenseProgressBar").width(""), this.startUpload())
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
					$.dialog.alert("上传失败！错误代码："+errorCode);
				}
			},

			//上传成功
			upload_success_handler: successList,

			upload_complete_handler: function(){
				try {
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
			file_types_description: "图片文件",

			//最大数量限制
			file_upload_limit: max,

			//最小数量限制
			file_queue_limit: 0,

			//加载上传组件
			swfupload_preload_handler: function(){
				return this.support.loading ? void 0 : $("#"+obj).html("加载失败，请检查flash版本！");
			},

			//加载失败提示
			swfupload_load_failed_handler: function(){
				$("#"+obj).html("加载失败，请检查flash版本！");
			},

			//拼接文件队列
			file_queued_handler: queuedList,

			//收集上传失败信息
			file_queue_error_handler: function(file, errorCode, message){
				try {
					if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {

						//拼接文件队列
						var listSection = $("#listSection"), already = listSection.find("li").length, count = atlasMax - already;
						$.dialog.alert(message > 0 && count != 0 ? "您只能再上传" + count + "个文件。" : "您上传的文件数已经达到限额，不能再上传了。");
						return;
					}
					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							uploadErrorInfo.push("文件：" + file.name + " 大小超过" + this.settings.file_size_limit/1024 + "M");
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							uploadErrorInfo.push("文件：" + file.name + " 零字节文件无法上传");
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							uploadErrorInfo.push("文件：" + file.name + " 无效的文件类型");
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							break;
						default:
							if (file !== null) {
								uploadErrorInfo.push("文件：" + file.name + " 未处理的错误");
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
						$.dialog.alert("以下图片将不会上传：\r\n" + tip );
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
					$.dialog.alert("上传失败！错误代码："+errorCode);
				}
			},

			//上传成功
			upload_success_handler: successList,

			upload_complete_handler: function(){
				try {
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

	//将字符串转成utf8
	,toUtf8: function(str) {   
		var out, i, len, c;
		out = "";
		len = str.length;
		for(i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if ((c >= 0x0001) && (c <= 0x007F)) {
				out += str.charAt(i);
			} else if (c > 0x07FF) {
				out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
				out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
				out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
			} else {
				out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
				out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
			}
		}
		return out;
	}  
	
}

$(function(){

	//页面自适应设置
	$(window).resize(function(){
		var screenwidth = window.innerWidth || document.body.clientWidth;
		var criticalPoint = criticalPoint != undefined ? criticalPoint : 1240;
		var criticalClass = criticalClass != undefined ? criticalClass : "w1200";
		if(screenwidth < criticalPoint){
			$("html").removeClass(criticalClass);
		}else{
			$("html").addClass(criticalClass);
		}

		if($("#login_bg").html() != undefined){
			$("#login_bg").css({"height": $(document).height()});
		}
	});

	//页面初始加载判断登录
	//huoniao.loginSuccess();

	//登录
	$("#login").bind("click", function(){
		huoniao.login();
	});

	//鼠标经过头部链接显示浮动菜单
	$(".topbarlink li").hover(function(){
		var t = $(this), pop = t.find(".pop");
		pop.show();
		t.addClass("hover");
	}, function(){
		var t = $(this), pop = t.find(".pop");
		pop.hide();
		t.removeClass("hover");
	});

	//搜索
	$(".tsearch .stype").hover(function(){
		var t = $(this);
		t.find("ul").show();
		t.addClass("hover");
	}, function(){
		var t = $(this);
		t.find("ul").hide();
		t.removeClass("hover");
	});

	$(".tsearch .stype ul a").bind("click", function(){
		var val = $(this).text(), id = $(this).attr("data-val");
		$(".tsearch .stva").attr("data-val", id).html(val+"<s></s>");
		$(".tsearch .stype ul").hide();
	});

	//二级导航
	$(".nav li").hover(function(){
		$(this).addClass("current");
	}, function(){
		$(this).removeClass("current");
	});

	//分享功能
	$("html").delegate(".sharebtn", "mouseenter", function(){
		var t = $(this), title = t.attr("data-title"), url = t.attr("data-url"), pic = t.attr("data-pic"), site = encodeURIComponent(document.title);
		title = title == undefined ? "" : encodeURIComponent(title);
		url   = url   == undefined ? "" : encodeURIComponent(url);
		pic   = pic   == undefined ? "" : encodeURIComponent(pic);
		if(title != "" || url != "" || pic != ""){
			$("#shareBtn").remove();
			var offset = t.offset(), 
					left   = offset.left - 42 + "px",
					top    = offset.top + 20 + "px",
					shareHtml = [];
			shareHtml.push('<s></s>');
			shareHtml.push('<ul>');
			shareHtml.push('<li class="tqq"><a href="http://share.v.t.qq.com/index.php?c=share&a=index&url='+url+'&title='+title+'&pic='+pic+'" target="_blank">腾讯微博</a></li>');
			shareHtml.push('<li class="qzone"><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+url+'&desc='+title+'&pics='+pic+'" target="_blank">QQ空间</a></li>');
			shareHtml.push('<li class="qq"><a href="http://connect.qq.com/widget/shareqq/index.html?url='+url+'&desc='+title+'&title='+title+'&summary='+site+'&pics='+pic+'" target="_blank">QQ好友</a></li>');
			shareHtml.push('<li class="sina"><a href="http://service.weibo.com/share/share.php?url='+url+'&title='+title+'&pic='+pic+'" target="_blank">腾讯微博</a></li>');
			shareHtml.push('</ul>');

			$("<div>")
				.attr("id", "shareBtn")
				.css({"left": left, "top": top})
				.html(shareHtml.join(""))
				.mouseover(function(){
					$(this).show();
					return false;
				})
				.mouseout(function(){
					$(this).hide();
				})
				.appendTo("body");
		}
	});

	$("html").delegate(".sharebtn", "mouseleave", function(){
		$("#shareBtn").hide();
	});

	$("html").delegate("#shareBtn a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		var w = $(window).width(), h = $(window).height();
		var left = (w - 760)/2, top = (h - 600)/2;
		window.open(href, "shareWindow", "top="+top+", left="+left+", width=760, height=600");
	});

	//返回顶部
	$(".btntop .top").bind("click", function(){
		$('html, body').animate({scrollTop:0}, 300);
	});

	//关闭返回顶部
	$(".btntop .close").bind("click", function(){
		$(this).closest(".btntop").hide();
	});
});


//监听滚动条开始与结束事件
(function(){
 
    var special = jQuery.event.special,
        uid1 = 'D' + (+new Date()),
        uid2 = 'D' + (+new Date() + 1);
 
    special.scrollstart = {
        setup: function() {
 
            var timer,
                handler =  function(evt) {
 
                    var _self = this,
                        _args = arguments;
 
                    if (timer) {
                        clearTimeout(timer);
                    } else {
                        evt.type = 'scrollstart';
                        jQuery.event.handle.apply(_self, _args);
                    }
 
                    timer = setTimeout( function(){
                        timer = null;
                    }, special.scrollstop.latency);
 
                };
 
            jQuery(this).bind('scroll', handler).data(uid1, handler);
 
        },
        teardown: function(){
            jQuery(this).unbind( 'scroll', jQuery(this).data(uid1) );
        }
    };
 
    special.scrollstop = {
        latency: 300,
        setup: function() {
 
            var timer,
                    handler = function(evt) {
 
                    var _self = this,
                        _args = arguments;
 
                    if (timer) {
                        clearTimeout(timer);
                    }
 
                    timer = setTimeout( function(){
 
                        timer = null;
                        evt.type = 'scrollstop';
                        jQuery.event.handle.apply(_self, _args);
 
                    }, special.scrollstop.latency);
 
                };
 
            jQuery(this).bind('scroll', handler).data(uid2, handler);
 
        },
        teardown: function() {
            jQuery(this).unbind( 'scroll', jQuery(this).data(uid2) );
        }
    };
 
})();