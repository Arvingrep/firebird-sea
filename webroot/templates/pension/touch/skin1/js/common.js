// document.domain = masterDomain.replace("http://", "");
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

		var site = channelDomain;

		//如果频道域名为子目录
		if(channelDomain.replace("//", "").indexOf("/") > 1){
			site = masterDomain;
		}

		var src = masterDomain+'/login.html?site='+site+'&v=1.8',
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

	//登录窗口尺寸调整
	,changeLoginFrameSize: function(height){
		$("#login_iframe, #login_iframe iframe").css({"height": height+"px"}).fadeIn("fast");
	}

	//关闭登录窗口
	,closeLoginFrame: function(){
		$("#login_iframe, #login_bg").fadeOut("fast", function(){
			$("#login_iframe, #login_bg").remove();
		});
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
		// if(hideFileUrl == 1){
		//  return url + "&type=" + to;
		// }else{
		return url.replace(from, to);
		// }
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

	//异步操作
	,operaJson: function(url, action, callback){
		$.ajax({
			url: url,
			data: action,
			type: "POST",
			dataType: "json",
			success: function (data) {
				typeof callback == "function" && callback(data);
			},
			error: function(){

				$.post("../login.php", "action=checkLogin", function(data){
					if(data == "0"){
						huoniao.showTip("error", "登录超时，请重新登录！");
						setTimeout(function(){
							location.reload();
						}, 500);
					}else{
						huoniao.showTip("error", "网络错误，请重试！");
					}
				});

			}
		});
	}

	//合并相同内容的单元格
	,rowspan: function(t, colIdx) {
	    return t.each(function() {
	        var that;
	        $('tr', this).each(function(row) {
	            $('td:eq(' + colIdx + ')', this).filter(':visible').each(function(col) {
	                if (that != null && $(this).html() == $(that).html()) {
	                    rowspan = $(that).attr("rowSpan");
	                    if (rowspan == undefined) {
	                        $(that).attr("rowSpan", 1);
	                        rowspan = $(that).attr("rowSpan");
	                    }
	                    rowspan = Number(rowspan) + 1;
	                    $(that).attr("rowSpan", rowspan);
	                    $(this).hide();
	                } else {
	                    that = this;
	                }
	            });
	        });
	    });
	}


}

function returnHumanTime(t,type) {
    var n = new Date().getTime();
    var c = n - t;
    var str = '';
    if(c < 3600) {
        str = parseInt(c / 60) + '分钟前';
    } else if(c < 86400) {
        str = parseInt(c / 3600) + '小时前';
    } else if(c < 604800) {
        str = parseInt(c / 86400) + '天前';
    } else {
        str = huoniao.transTimes(t,type);
    }
    return str;
}
function G(id) {
    return document.getElementById(id);
}
function in_array(needle, haystack) {
    if(typeof needle == 'string' || typeof needle == 'number') {
        for(var i in haystack) {
            if(haystack[i] == needle) {
                    return true;
            }
        }
    }
    return false;
}


$(function(){

    $.fn.scrollTo =function(options){
        var defaults = {
            toT : 0, //滚动目标位置
            durTime : 500, //过渡动画时间
            delay : 30, //定时器时间
            callback:null //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };

	// 点击收藏
    $('.follow-wrapper').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.find('.follow-icon').hasClass('active')){
            t.find('.follow-icon').removeClass('active');
            t.find('.text-follow').text('收藏');
            type = 'del';
        }else{
            t.find('.follow-icon').addClass('active');
            t.find('.text-follow').text('已收藏');
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=pension&temp=store-detail&type="+type+"&id="+infoData.id);
    });
    
    // 关闭
    $(".modal-public .modal-main .close").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
     })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

	
	//微信引导关注
    $('.mIcon.wx').bind('click', function(){
        $('.wechat-popup').css("visibility","visible");
    });

    $('.wechat-popup .close').bind('click', function(){
        $('.wechat-popup').css("visibility","hidden");
    });



   //回到顶部
	$('.gotop').click(function(){
		console.log(1)
		var dealTop = $("body").offset().top;
        $("html,body").scrollTo({toT:dealTop})
		$('.gotop').hide();
	})

	   // 回到顶部
	$('.gt i').click(function(){
		console.log(1)
		var dealTop = $("body").offset().top;
        $("html,body").scrollTo({toT:dealTop})
		$('.gt').hide();
	})
    // 返回上一页
    $('.goback').click(function(){
    	history.go(-1);
    })
    
	// 返回顶部
	 var windowTop=0;
    $(window).on("scroll", function(){
            var scrolls = $(window).scrollTop();//获取当前可视区域距离页面顶端的距离
            if(scrolls>=windowTop){//当B>A时，表示页面在向上滑动
                //需要执行的操作
                windowTop=scrolls;
                $('.gotop').hide();
                $('.wechat-fix').hide();

            }else{//当B<a 表示手势往下滑动
                //需要执行的操作
                windowTop=scrolls;
                $('.gotop').show();
                $('.wechat-fix').show();
            }
            if(scrolls==0){
            	$('.gotop').hide();
                $('.wechat-fix').hide();
            }
     });

   

})

