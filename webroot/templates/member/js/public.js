
$(function(){

	//退出
	$('.logout').bind("click", function(){
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain, path: '/'});
	});

	//侧栏折叠
	$(".sidebar .setting").bind("click", function(){
		return false;
	});

	$(".sidebar dt").bind("click", function(){
		var t = $(this), par = t.closest("dl");
		par.hasClass("curr") ? (par.removeClass("curr"), par.find("dd").stop().show(200)) : (par.addClass("curr"), par.find("dd").stop().hide(200));
		return false;
	});

	// $(".sidebar dd").hover(function(){
	// 	var t = $(this);
	// 	if(t.find("ul").size() > 0){
	// 		t.addClass("curr");
	// 	}
	// }, function(){
	// 	var t = $(this);
	// 	if(t.find("ul").size() > 0){
	// 		t.removeClass("curr");
	// 	}
	// });

	$(".sidebar dd").click(function(){
		var t = $(this);
		if(t.find("ul").size() > 0){
			t.find("ul").slideDown(150);
			t.siblings('dd').find("ul").slideUp(150);
		}
		 t.addClass("curr").siblings('dd').removeClass("curr");
	})




	$(".subnav dd").hover(function(){
		var t = $(this), dl = t.find("dl");
		if(dl.size() > 0){
			dl.show();
			t.addClass("curr");
		}
	}, function(){
		var t = $(this), dl = t.find("dl");
		if(dl.size() > 0){
			dl.hide();
			t.removeClass("curr");
		}
	});

	//公告
	if($(".crumbs .notice").size() > 0){
		$(".crumbs .notice").slide({mainCell: "ul", effect: "top", autoPlay: true});
	}

});


//上传
var uploadCustom = {
	//上传缩略图
	uploadThumb: function(mod, size, type, obj, width, height, queuedList, successList){

		if(typeof(uploadType) == "undefined"){
			uploadType = "thumb";
		}

		new SWFUpload({

			//后端上传接口
			upload_url: "/include/upload.inc.php?mod="+mod+"&type="+uploadType,

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
				return this.support.loading ? void 0 : $("#"+obj).html(langData['siteConfig'][20][546]);//加载失败，请检查flash版本！
			},

			//加载失败提示
			swfupload_load_failed_handler: function(){
				$("#"+obj).html(langData['siteConfig'][20][546]);//加载失败，请检查flash版本！
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
							$.dialog.alert(langData['siteConfig'][20][549]);
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							$.dialog.alert(langData['siteConfig'][20][550] +  message > 1 ? langData['siteConfig'][20][551].replace('1', message) : "");//最多可以选择1个文件。
							break;
						default:
							if (file !== null) {
								$.dialog.alert(langData['siteConfig'][20][552]);//未处理的错误
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
			},//文件大小超过最大1MB上传限制。--您只需要上传一张缩略图即可

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
					$.dialog.alert(langData['siteConfig'][20][554]+errorCode);  //上传失败！错误代码：
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
			file_types_description: langData['siteConfig'][23][115],//图片文件

			//最大数量限制
			file_upload_limit: max,

			//最小数量限制
			file_queue_limit: 0,

			//加载上传组件
			swfupload_preload_handler: function(){
				return this.support.loading ? void 0 : $("#"+obj).html(langData['siteConfig'][20][546]);//加载失败，请检查flash版本！
			},

			//加载失败提示
			swfupload_load_failed_handler: function(){
				$("#"+obj).html(langData['siteConfig'][20][546]);//加载失败，请检查flash版本！
			},

			//拼接文件队列
			file_queued_handler: queuedList,

			//收集上传失败信息
			file_queue_error_handler: function(file, errorCode, message){
				try {
					if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {

						//拼接文件队列
						var listSection = $("#listSection"), already = listSection.find("li").length, count = atlasMax - already;
						$.dialog.alert(message > 0 && count != 0 ? langData['siteConfig'][20][555].replace('1', count) : langData['siteConfig'][20][556]);//您只能再上传1个文件。----您上传的文件数已经达到限额，不能再上传了。
						return;
					}
					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][557] + this.settings.file_size_limit/1024 + "M");//文件：---大小超过1M
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][548]);//文件：---零字节文件无法上传
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][549]);//文件：----无效的文件类型
							break;
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							break;
						default:
							if (file !== null) {
								uploadErrorInfo.push(langData['siteConfig'][23][116] + file.name + " " + langData['siteConfig'][20][552]);//文件：----未处理的错误
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
						$.dialog.alert(langData['siteConfig'][20][558]+"\r\n" + tip );//以下图片将不会上传：
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
					$.dialog.alert(langData['siteConfig'][20][554]+errorCode);//上传失败！错误代码：
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
	pages.className = "pagination-pages";
	info.append(pages);

	//拼接所有分页
	if (allPageNum > 1) {

		//上一页
		if (nowPageNum > 1) {
			var prev = document.createElement("a");
			prev.className = "prev";
			prev.innerHTML = langData['siteConfig'][6][33];//上一页
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
			next.innerHTML = langData['siteConfig'][6][34];//下一页
			next.onclick = function () {
				atpage = nowPageNum + 1;
				getList();
			}
			info.find(".pagination-pages").append(next);
		}

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
