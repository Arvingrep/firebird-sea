/**
 /**
  * 会员中心新闻投稿列表
  * by guozi at: 20150627
  */

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

 			//将普通时间格式转成UNIX时间戳
 			,
 		transToTimes: function(timestamp) {
 				var new_str = timestamp.replace(/:/g, '-');
 				new_str = new_str.replace(/ /g, '-');
 				var arr = new_str.split("-");
 				var datum = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
 				return datum.getTime() / 1000;
 			}


 			//判断登录成功
 			,
 		checkLogin: function(fun) {
 				//异步获取用户信息
 				$.ajax({
 					url: masterDomain + '/getUserInfo.html',
 					type: "GET",
 					async: false,
 					dataType: "jsonp",
 					success: function(data) {
 						if (data) {
 							fun();
 						}
 					},
 					error: function() {
 						return false;
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
 				if (to == "") return url;
 				var from = (from == "" || from == undefined) ? "large" : from;
 				if (hideFileUrl == 1) {
 					return url + "&type=" + to;
 				} else {
 					return url.replace(from, to);
 				}
 			}

 			//获取字符串长度
 			//获得字符串实际长度，中文2，英文1
 			,
 		getStrLength: function(str) {
 				var realLength = 0,
 					len = str.length,
 					charCode = -1;
 				for (var i = 0; i < len; i++) {
 					charCode = str.charCodeAt(i);
 					if (charCode >= 0 && charCode <= 128) realLength += 1;
 					else realLength += 2;
 				}
 				return realLength;
 			}



 			//删除已上传的图片
 			,
 		delAtlasImg: function(mod, obj, path, listSection, delBtn) {
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
 				$("#" + obj).remove();

 				if ($("#" + listSection).find("li").length < 1) {
 					$("#" + listSection).hide();
 					$("#" + delBtn).hide();
 				}
 			}

 			//异步操作
 			,
 		operaJson: function(url, action, callback) {
 			$.ajax({
 				url: url,
 				data: action,
 				type: "POST",
 				dataType: "json",
 				success: function(data) {
 					typeof callback == "function" && callback(data);
 				},
 				error: function() {

 				}
 			});
 		}
 	}


 var objId = $("#list");
 var keywords = "";
 $(function() {


 	//导航
 	$('.header-r .screen').click(function() {
 		var nav = $('.nav'),
 			t = $('.nav').css('display') == "none";
 		if (t) {
 			nav.show();
 		} else {
 			nav.hide();
 		}
 	})


 	//项目
 	$(".tab .type").bind("click", function() {
 		var t = $(this),
 			id = t.attr("data-id"),
 			index = t.index();
 		if (!t.hasClass("curr") && !t.hasClass("sel")) {
 			state = id;
 			atpage = 1;
 			$('.count li').eq(index).show().siblings("li").hide();
 			t.addClass("curr").siblings("li").removeClass("curr");
 			$('#list').html('');
 			getList(1);
 		}
 	});

$(".search_clear").click(function(){
		$("#keywords").val('');
	})
 	// 下拉加载
 	$(window).scroll(function() {
 		var h = $('.item').height();
 		var allh = $('body').height();
 		var w = $(window).height();
 		var scroll = allh - w - h;
 		if ($(window).scrollTop() > scroll && !isload) {
 			atpage++;
 			getList();
 		};
 	});

 	getList(1);
 	var M = {};
 	// 删除
 	objId.delegate(".del", "click", function() {
 		var t = $(this),
 			par = t.closest(".item"),
 			id = par.attr("data-id");
 		if (id) {
 			M.dialog = jqueryAlert({
 				'title': '',
 				'content': langData['siteConfig'][44][98], //确定要删除吗?
 				'modal': true,
 				'buttons': {
 					'是': function() {
 						M.dialog.close();
 						t.siblings("a").hide();
 						t.addClass("load");
 						$.ajax({
 							url: masterDomain + "/include/ajax.php?service=live&action=delImgText&id=" + id,
 							type: "GET",
 							dataType: "jsonp",
 							success: function(data) {
 								if (data && data.state == 100) {

 									//删除成功后移除信息层并异步获取最新列表
 									par.slideUp(200, function() {
 										par.remove();
 										if (objId.children('.item').length == 0) {
 											getList(1);
 										} else {
 											$(window).trigger('scroll');
 										}
 									});
 									// objId.html('');
 									// getList(1)

 								} else {
 									alert(data.info);
 									t.siblings("a").show();
 									t.removeClass("load");
 								}
 							},
 							error: function() {
 								alert(langData['siteConfig'][20][183]);
 								t.siblings("a").show();
 								t.removeClass("load");
 							}
 						});
 					},
 					'否': function() {
 						M.dialog.close();
 					}
 				}
 			})
 		}
 	});

 	// // 头部搜索
 	$('.searchbox').submit(function(e) {
		keywords = $.trim($('#keywords').val());
 		getList(1);
 		e.preventDefault();
 	});
	
	$("#keywords").blur(function(){
		if($(this).val()){
			$(".placeholder").hide();
			$(".search_icon").show();
		}else{
			$(".placeholder").show();
			$(".search_icon").hide();
		}
	});
	$("#keywords").focus(function(){
		$(".placeholder").hide();
		$(".search_icon").show();
		
	});
	$("#keywords").on("input",function(){
		if($(this).val()){
			$(".searchbox i.search_clear").show();
		}else{
			$(".searchbox i.search_clear").hide();
		}
	})
	
 	var selectDate = function(el) {
 		WdatePicker({
 			el: el,
 			isShowClear: false,
 			isShowOK: false,
 			isShowToday: false,
 			qsEnabled: false,
 			dateFmt: 'yyyy-MM',
 			maxDate: $('#month').val(),
 			onpicked: function() {
 				getArticleTotal();
 			}
 		});
 	}
 	$("#month").click(function() {
 		selectDate("month");
 	})

 	$('#reload').click(function() {
 		getList(1);
 	})


 	function getList(is) {

 		isload = true;


 		if (is != 1) {
 			// 	$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
 		} else {
 			objId.html('');
 			atpage = 1;
 		}
 		objId.find('.loading').remove();
 		objId.append('<p class="loading">' + langData['siteConfig'][20][184] + '...</p>');

 		$.ajax({
 			url: "/include/ajax.php?service=live&action=imgTextList&chatid=" + chatid + "&page=" + atpage + "&pageSize=" +
 				pageSize + "&keywords=" + keywords,
 			type: "GET",
 			dataType: "jsonp",
 			success: function(data) {
 				if (data && data.state != 200) {
 					if (data.state == 101) {
 						objId.html("<p class='loading'>" + langData['siteConfig'][20][126] + " <a class='add_link' href='"+usermember+"/fabu_live_imgtext.html?id="+chatid+"'>"+langData['live'][6][4]+"</a></p>");
 						$('.count span').text(0);
 					} else {
 						var list = data.info.list,
 							pageInfo = data.info.pageInfo,
 							html = [];

 						//拼接列表
 						if (list.length > 0) {

 							var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

 							for (var i = 0; i < list.length; i++) {
 								var item = [],
 									id = list[i].id,
 									img = list[i].img,
 									text = list[i].text,
 									pubdate = list[i].pubdate,
 									title = '';

 								html.push('<div class="item" data-id="' + id + '">');
 								// html.push('<div class="title">');
 								// html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+huoniao.transTimes(pubdate, 1)+'</span>');
 								// html.push('</div>');
 								html.push('<div class="info-item fn-clear">');
 								// html.push('<div class="icontxt"></div>')
 								html.push('<dl>');
 								html.push('<dt title="' + text + '">' + text + '</dt>');
 								// html.push('<dd class="item-area"></span>');
 								// html.push('</dd>');
 								if (img.length) {
 									html.push('<div class="pics">');
 									if (img.length > 3) {
 										html.push('<span class="img_len">' + img.length + '+</span>')
 									}
 									for (var n = 0; n < img.length; n++) {
 										if (img[n]) {
											if(n>=3){
												html.push('<a class="fn-hide pimg " href="javascript:;"><img src="' + img[n] + '" /></a>');
											}else{
												html.push('<a href="javascript:;" class="pimg '+(img.length==1?"big_img":"")+'"><img src="' + img[n] + '" /></a>');
											}
 										} else {
 											html.push('<a href="javascript:;" class="empty"></a>');
 										}
 									}

 									html.push('</div>');
 								}
 								html.push('</dl>');
 								html.push('</div>');
 								html.push('<div class="o fn-clear">');
 								html.push('<span class="ftime fn-left">' + huoniao.transTimes(pubdate, 1) + '</span>')
 								html.push('<a href="javascript:;" class="del">' + langData['siteConfig'][6][8] + '</a>');
 								html.push('</div>');
 								html.push('</div>');
 								html.push('</div>');

 							}

 							objId.append(html.join(""));
 							$('.loading').remove();
							Zepto.fn.bigImage({
							  artMainCon:".pics",  //图片所在的列表标签
							  show_Con:".pimg "
							 });
 							isload = false;

 						} else {
 							$('.loading').remove();
 							objId.append("<p class='loading'>没有更多了~</p>");
 						}
 						switch (state) {
 							case "":
 								totalCount = pageInfo.totalCount;
 								break;
 							case "0":
 								totalCount = pageInfo.gray;
 								break;
 							case "1":
 								totalCount = pageInfo.audit;
 								break;
 							case "2":
 								totalCount = pageInfo.refuse;
 								break;
 						}


 						if (pageInfo.audit > 0) {
 							$("#audit").show().html(pageInfo.audit);
 						} else {
 							$("#audit").hide();
 						}
 						if (pageInfo.gray > 0) {
 							$("#gray").show().html(pageInfo.gray);
 						} else {
 							$("#gray").hide();
 						}
 						if (pageInfo.refuse > 0) {
 							$("#refuse").show().html(pageInfo.refuse);
 						} else {
 							$("#refuse").hide();
 						}
 						// 	showPageInfo();
 					}
 				} else {
 					objId.html("<p class='loading'>" + langData['siteConfig'][20][126] + "1111</p>");
 					$('.count span').text(0);
 				}
 			}
 		});
 	}

 })
