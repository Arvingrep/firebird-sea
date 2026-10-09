//多模板预览
// var currentModule = typeof channelDomain != "undefined" ? channelDomain : "siteConfig";
// document.write(unescape("%3Cscript src='"+masterDomain+"/static/js/skin.js?v=1' id='skinObj' data-val='"+currentModule+"' type='text/javascript'%3E%3C/script%3E"));

// document.domain = masterDomain.replace("http://", "").replace("https://", "");
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
		location.href = masterDomain + '/login.html';
		return false;
		$("#login_iframe, #login_bg").remove();

		var site = channelDomain;

		//如果频道域名为子目录
		if(channelDomain.replace("//", "").indexOf("/") > 1){

			if (site.indexOf("https") > -1) {
				var channelDomain_ = channelDomain.replace("https://", "").split("/");
				site = "https://"+channelDomain_[0];
			}else {
				var channelDomain_ = channelDomain.replace("http://", "").split("/");
				site = "http://"+channelDomain_[0];
			}
		}

		var src = masterDomain+'/login_popup.html?site='+site+'&v=1.9',
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
				}else{
					// alert("登录失败！");
				}
			},
			error: function(){
				// alert("登录失败！");
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
		var newUrl = "";
		if(hideFileUrl == 1){
			newUrl =  url + "&type=" + to;
		}else{
			newUrl = url.replace(from, to);
		}

		return newUrl;

		//判断图片是否存在
		// var xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		// xmlhttp.open("GET", newUrl, false);
		// xmlhttp.send();
		// if(xmlhttp.readyState==4){
		// 	//url存在
		// 	if(xmlhttp.status==200){
		// 		return newUrl;
		//
		// 	//url不存在
		// 	}else if(xmlhttp.status==404){
		// 		return url;
		//
		// 	//其他状态
		// 	}else{
		// 		return url;
		// 	}
		// }else{
		// 	return url;
		// }


		// var ImgObj = new Image();
	    // ImgObj.src = newUrl;
		// if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
	    //     return newUrl;
	    // } else {
	    //     return url;
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

$(function(){
	if(window.loadHuoniaoJs) return;
  window.loadHuoniaoJs = 1;

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

	// 第三方登录
	$("body").delegate(".loginconnect, .login-other li a", "click", function(e){
			e.preventDefault();

			var href = $(this).attr("href"), type = href.split("type=")[1];
			loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

			//判断窗口是否关闭
			mtimer = setInterval(function(){

				if($.cookie(cookiePre+"connect_uid") && $.cookie(cookiePre+"connect_code") == type){
					console.log('a')
					loginWindow.close();
					var modal = '<div id="loginconnectInfo"><div class="mask"></div> <div class="layer"> <p class="layer-tit"><span>温馨提示</span></p> <p class="layer-con">为了您的账户安全，请绑定您的手机号<br /><em class="layer_time">3</em>s后自动跳转</p> <p class="layer-btn"><a href="'+masterDomain+'/bindMobile.html?type='+type+'">前往绑定</a></p> </div></div>';

					$("#loginconnectInfo").remove();
					$('body').append(modal);

					var t = 3;
					var timer = setInterval(function(){
						if(t == 1){
							clearTimeout(timer);
							location.href = masterDomain+'/bindMobile.html?type='+type;
						}else{
							$(".layer_time").text(--t);
						}
					},1000)
				}else{
					console.log('b')

					if(loginWindow.closed){
					console.log('c')

						clearInterval(mtimer);
						huoniao.checkLogin(function(){
							location.reload();
						});
					}
				}
			}, 1000);
	});


	//退出
	$("body").delegate(".logout", "click", function(){

		// var channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
		// var channelDomain_1 = channelDomainClean.split('.');
		// var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		// channelDomain_ = channelDomainClean.split("/")[0];
		// channelDomain_1_ = channelDomain_1_.split("/")[0];

		// $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomainClean, path: '/'});
		// $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain_1_, path: '/'});
	});


	//多域名同步登录
	var masterDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : "",
			channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
	if(masterDomainClean != "" && channelDomainClean != "" && channelDomainClean.indexOf(masterDomainClean) == -1){
		channelDomainClean = channelDomainClean.split("/")[0];
		$("body").append('<iframe src="'+masterDomain+'/sso.html?site='+channelDomainClean+'" style="display:none;"></iframe>');
	}

	//页面初始加载判断登录
	//huoniao.loginSuccess();

	//登录
	$("body").delegate("#login", "click", function(){
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

	//返回顶部
	$(".btntop .top").bind("click", function(){
		$('html, body').animate({scrollTop:0}, 300);
	});

	//关闭返回顶部
	$(".btntop .close").bind("click", function(){
		$(this).closest(".btntop").hide();
	});


	//引入消息通知公共脚本
	document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).src = masterDomain + '/static/js/memberPublicNotice.js?v=' + ~(-new Date());


	$('[contenteditable]').each(function() {
		clearContenteditableFormat($(this));
	});




	// 搜索
  $(".HouseSeacher_btn").bind("click", function(){
      var keywords = $("#HouseSearch"), txt = $.trim(keywords.val()),
          type = $('.MooudleBC').attr('data-type');
      if(txt != ""){
              location.href = masterDomain +"/house/"+type+".html?keywords="+txt;
      }else{
          keywords.focus();
      }
  });
  $(".JobSeacher_btn").bind("click", function(){
      var keywords = $("#JobSearch"), txt = $.trim(keywords.val()),
          type = $('.MooudleBC').attr('data-type');
      if(txt != ""){
              location.href = masterDomain +"/job/"+type+".html?title="+txt;
      }else{
          keywords.focus();
      }
  });
  $(".MoudleNav ul li").click(function(){
      var index = $(this).closest('a').attr("data-module");
      $(".MoudleNav ul li").removeClass('MooudleBC');
      $(this).addClass('MooudleBC');
      $('.FormBox').find('.'+index+'').show().siblings().hide();
      $('.FormBox').find('.'+index+'').find(".inpbox input").focus();
      $('.keytype').text($(this).text());
      $('.search dl').removeClass('hover');
  })
  $('.search dl').hover(function(){
      var a = $(this);
      a.addClass('hover');
      a.find('dd .curr').addClass('active').siblings().removeClass();
  },function(){
      $(this).removeClass('hover');
  }).find('dd a').click(function(){
      var a = $(this);
      var index = $(this).attr("data-module");
      if (a.attr("data-id") == "0") {
          $('.FormBox').find('.'+index+'').show().siblings().hide();
          $('.FormBox').find('.'+index+'').find(".inpbox input").focus();
          $('.keytype').text(a.find('span').text());
          a.addClass('active curr').siblings().removeClass();
          $('.search dl').removeClass('hover');
      }
  }).hover(function(){
      var a = $(this);
      a.addClass('active').siblings().removeClass('active');
  })

  $('.searchkey').focus(function(){
      $('.hotkey').addClass('leave').stop().animate({
          'right' : '-400px'
      },500);
  }).blur(function(){
      $('.hotkey').removeClass('leave').stop().animate({
          'right' : '15px'
      },500);
  })

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


	// 导航固定
	if($('.fixedpane').size() > 0){
		var top = $('.header').offset().top + 139;
		$(window).scroll(function(){
			var sct = $(window).scrollTop();
			if(sct >= top) {
				if(!$('.fixedpane').hasClass('fixed')){
					$('.fixedpane').hide().addClass('fixed').slideDown();
				}
			} else {
				$('.fixedpane').removeClass('fixed');
			}
		}).trigger('scroll')
	}

	var sortBy = function(prop){
		return function (obj1, obj2) {
			var val1 = obj1[prop];
			var val2 = obj2[prop];
			if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
				val1 = Number(val1);
				val2 = Number(val2);
			}
			if(val1 < val2) {
				return -1;
			}else if(val1 > val2) {
				return 1;
			}else{
				return 0;
			}
		}
	}

	// 切换城市弹出层
	$(".changeCityBtn").hover(function(){
		var t = $(this);
		if(t.hasClass("do")) return;
		t.addClass("do");
		var cityInfo = $.cookie(cookiePre+'siteCityInfo');
		cityInfo = eval('('+cityInfo+')');

		var con = $(".changeCityList"), listCon = con.find(".list");

		var cityListData = [];
    $('.changeCityList .content li').each(function(i){
      var t = $(this).find("a"), domain = t.data('domain');
      cityListData.push(domain);
    });
    if(cityListData.length < 10){
    	$('.changeCityList .content').show();
    	return;
    }else{
    	$('.changeCityList .content').remove();
    }

    var cityArr = [];
    var hotCityHtml = [];
    for (var i = 0; i < cityListData.length; i++) {
      var pinyin = cityListData[i].pinyin.substr(0,1);
      if(cityArr[pinyin] == undefined){
        cityArr[pinyin] = [];
      }
      cityArr[pinyin].push(cityListData[i]);
      if(cityListData[i].hot == 1){
      	var cls = cityInfo.domain == cityListData[i].domain ? ' class="curr"' : '';
      	hotCityHtml.push('<a href="'+cityListData[i].url+'"'+cls+' data-domain=\''+JSON.stringify(cityListData[i])+'\'>'+cityListData[i].name+'</a>');
      }
    }

    var szmArr = [];
    for(var key in cityArr){
      szmArr.push(key);
    }

    szmArr.sort();
    var list = [], topSzm = [];
    for(var i = 0; i < szmArr.length; i++){
    	if(szmArr[i] == "in_array") continue;
    	var cls1 = '';

			cityArr[szmArr[i]].sort(sortBy('cityid'));

    	list.push('<dl>');
    	list.push('	<dt>'+szmArr[i].toUpperCase()+'</dt>');
    	list.push('	<dd>');
    	for(var n = 0; n < cityArr[szmArr[i]].length; n++){
    		var cls = '';
    		if(cityInfo.domain == cityArr[szmArr[i]][n].domain){
	  			cls1 = cls = ' class="curr"';
  			}
    		list.push('<a href="'+cityArr[szmArr[i]][n].url+'"'+cls+' data-domain=\''+JSON.stringify(cityArr[szmArr[i]][n])+'\'>'+cityArr[szmArr[i]][n].name+'</a>');
    	}
    	list.push('	</dd>');
    	list.push('</dl>');
    	topSzm.push('<span'+cls1+'>'+szmArr[i].toUpperCase()+'</span>');
    }

    if(hotCityHtml.length){
    	con.find(".hot dd").html(hotCityHtml.join(""));
    }else{
    	con.find(".hot").remove();
    }
    con.find(".pytit dd, .setwidth").html(topSzm.join(""));
    listCon.html(list.join(""));

    con.find(".morecontent").removeClass("fn-hide");

    listCon.children("dl").each(function(){
    	var t = $(this);
    	t.attr("data-top", t.position().top);
    })
    con.delegate(".pytit span", "click", function(){
    	var t = $(this), index = t.index(), sct = listCon.children("dl").eq(index).attr("data-top");
    	listCon.scrollTop(sct);
    	t.addClass("curr").siblings().removeClass("curr");
    })
    con.find(".pytit span.curr").click();

    con.delegate('a', 'click', function(){
	    var t = $(this), domain = t.data('domain');
	    $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(domain), {expires: 7, path: '/', domain: '.' + cfg_clihost});
	  });

	})

});


function clearContenteditableFormat(t){
	// 干掉IE http之类地址自动加链接
	try {
		document.execCommand("AutoUrlDetect", false, false);
	} catch (e) {}

	t.on('paste', function(e) {
		e.preventDefault();
		var text = null;
		if(window.clipboardData && clipboardData.setData) {
			// IE
			text = window.clipboardData.getData('text');
		} else {
			text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
		}
		if (document.body.createTextRange) {
			if (document.selection) {
				textRange = document.selection.createRange();
			} else if (window.getSelection) {
				sel = window.getSelection();
				var range = sel.getRangeAt(0);

				// 创建临时元素，使得TextRange可以移动到正确的位置
				var tempEl = document.createElement("span");
				tempEl.innerHTML = "&#FEFF;";
				range.deleteContents();
				range.insertNode(tempEl);
				textRange = document.body.createTextRange();
				textRange.moveToElementText(tempEl);
				tempEl.parentNode.removeChild(tempEl);
			}
			textRange.text = text;
			textRange.collapse(false);
			textRange.select();
		} else {
			// Chrome之类浏览器
			document.execCommand("insertText", false, text);
		}
	});
	// 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
	t.on('keydown', function(e) {
		// e.metaKey for mac
		if (e.ctrlKey || e.metaKey) {
			switch(e.keyCode){
				case 66: //ctrl+B or ctrl+b
				case 98:
				case 73: //ctrl+I or ctrl+i
				case 105:
				case 85: //ctrl+U or ctrl+u
				case 117: {
					e.preventDefault();
					break;
				}
			}
		}
	});
}


//单点登录执行脚本
function ssoLogin(info){

	$("#navLoginBefore, #navLoginAfter").remove();

	var host = window.location.host;
  var host_ = host.split('.');
  var len = host_.length;
  var domain = '', start = len > 2 ? len - 2 : 0;
  for(var i = start; i < len; i++){
    domain += '.' + host_[i];
  }

	//已登录
	if(info){
		// $(".top .topbar").prepend('<div class="userinfo" id="navLoginAfter"><div id="upic"><a href="'+info['userDomain']+'" target="_blank"><img onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_40.jpg\';"src="'+info['photo']+'"></a></div><a href="'+info['userDomain']+'" id="uname" target="_blank">'+info['nickname']+'</a><a href="'+masterDomain+'/logout.html" class="logout">安全退出</a></div>');
		$('.loginbox').append('<div class="loginafter fn-clear" id="navLoginBefore"><span class="fn-left">欢迎您回来，</span><a href="'+info['userDomain']+'" target="_blank">'+info['nickname']+'</a>'+(info['message'] > 0 ? '<a href="'+info['userDomain']+'/message.html?state=0" target="_blank">(<font color="#ff0000">'+info['message']+'</font>)</a>' : '')+'<a href="'+masterDomain+'/logout.html" class="logout">退出</a></div>');

		// var channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
		// var channelDomain_1 = channelDomainClean.split('.');
		// var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		// channelDomain_ = channelDomainClean.split("/")[0];
		// channelDomain_1_ = channelDomain_1_.split("/")[0];


    $.cookie(cookiePre+'login_user', info['userid_encode'], {expires: 365, domain: host, path: '/'});
    $.cookie(cookiePre+'login_user', info['userid_encode'], {expires: 365, domain: domain, path: '/'});

		// $.cookie(cookiePre+'login_user', info['userid_encode'], {expires: 365, domain: channelDomainClean, path: '/'});
		// $.cookie(cookiePre+'login_user', info['userid_encode'], {expires: 365, domain: channelDomain_1_, path: '/'});


	//未登录
	}else{
		// $(".top .topbar").prepend('<ul class="logreg" id="navLoginBefore"><li><a href="javascript:;" id="login">登录</a></li><li><a href="'+masterDomain+'/register.html">注册</a></li></ul>');
		$('.loginbox').append($('#notLoginHtml').html());

		// var channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
		// var channelDomain_1 = channelDomainClean.split('.');
		// var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		// channelDomain_ = channelDomainClean.split("/")[0];
		// channelDomain_1_ = channelDomain_1_.split("/")[0];

		// $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomainClean, path: '/'});
		// $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain_1_, path: '/'});

		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: host, path: '/'});
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: domain, path: '/'});

	}

}


//输出货币标识
function echoCurrency(type){
	var pre = (typeof cookiePre != "undefined" && cookiePre != "") ? cookiePre : "HN_";
	var currencyArr = $.cookie(pre+"currency");
	if(currencyArr){
		var currency = JSON.parse(decodeURIComponent(atob(currencyArr)));
		if(type){
			return currency[type]
		}else{
			return currencyArr['short'];
		}
	}
}



//子元素scroll父元素容器不跟随滚动
//用法：$('#test').scrollUnique();
$.fn.scrollUnique = function() {
    return $(this).each(function() {
        var eventType = 'mousewheel';
        if (document.mozHidden !== undefined) {
            eventType = 'DOMMouseScroll';
        }
        $(this).on(eventType, function(event) {
            // 一些数据
            var scrollTop = this.scrollTop,
                scrollHeight = this.scrollHeight,
                height = this.clientHeight;

            var delta = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : -(event.originalEvent.detail || 0);

            if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
                this.scrollTop = delta > 0? 0: scrollHeight;
                // 向上滚 || 向下滚
                event.preventDefault();
            }
        });
    });
};



Array.prototype.in_array = function(e){
	for(i=0;i<this.length && this[i]!=e;i++);
	return !(i==this.length);
}
