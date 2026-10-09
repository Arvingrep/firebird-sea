// 判断设备类型，ios全屏
var device = navigator.userAgent;
if (document.getElementsByTagName("html")[0] && device.indexOf('huoniao') > -1) {
  var bodyEle = document.getElementsByTagName('html')[0];
  bodyEle.className += " huoniao_iOS";
}

!function(s, t) {
    function u() {
        var a = x.getBoundingClientRect().width;
        a / A > 540 && (a = 540 * A);
        var d = a / 7.5;
        x.style.fontSize = d + "px",
        C.rem = s.rem = d
    }
    var v, w = s.document, x = w.documentElement, y = w.querySelector('meta[name="viewport"]'), z = w.querySelector('meta[name="flexible"]'), A = 0, B = 0, C = t.flexible || (t.flexible = {});
    if (y) {
        // console.warn("将根据已有的meta标签来设置缩放比例");
        var D = y.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        D && (B = parseFloat(D[1]),
        A = parseInt(1 / B))
    } else {
        if (z) {
            var E = z.getAttribute("content");
            if (E) {
                var F = E.match(/initial\-dpr=([\d\.]+)/)
                  , G = E.match(/maximum\-dpr=([\d\.]+)/);
                F && (A = parseFloat(F[1]),
                B = parseFloat((1 / A).toFixed(2))),
                G && (A = parseFloat(G[1]),
                B = parseFloat((1 / A).toFixed(2)))
            }
        }
    }
    if (!A && !B) {
        var H = (s.navigator.appVersion.match(/android/gi),
        s.navigator.appVersion.match(/iphone/gi))
          , I = s.devicePixelRatio;
        A = H ? I >= 3 && (!A || A >= 3) ? 3 : I >= 2 && (!A || A >= 2) ? 2 : 1 : 1,
        B = 1 / A
    }
    if (x.setAttribute("data-dpr", A),
    !y) {
        if (y = w.createElement("meta"),
        y.setAttribute("name", "viewport"),
        y.setAttribute("content", "initial-scale=" + B + ", maximum-scale=" + B + ", minimum-scale=" + B + ", user-scalable=no"),
        x.firstElementChild) {
            x.firstElementChild.appendChild(y)
        } else {
            var J = w.createElement("div");
            J.appendChild(y),
            w.write(J.innerHTML)
        }
    }
    s.addEventListener("resize", function() {
        clearTimeout(v),
        v = setTimeout(u, 300)
    }, !1),
    "complete" === w.readyState ? w.body.style.fontSize = 12 * A + "px" : w.addEventListener("DOMContentLoaded", function(b) {
        // w.body.style.fontSize = 12 * A + "px"
    }, !1),
    u(),
    C.dpr = s.dpr = A,
    C.refreshRem = u,
    C.rem2px = function(c) {
      var d = parseFloat(c) * this.rem;
      return "string" == typeof c && c.match(/rem$/) && (d += "px"),
      d
    }
    ,
    C.px2rem = function(c) {
      var d = parseFloat(c) / this.rem;
      return "string" == typeof c && c.match(/px$/) && (d += "rem"),
      d
    }

	  s.addEventListener("pageshow", function(b) {

      //iPhoneX适配
      var meta = document.getElementsByTagName('meta');
      for(var i = 0; i < meta.length; i++){
        if(meta[i]['name'] == 'viewport'){
            meta[i].setAttribute('content', meta[i]['content'] + ', viewport-fit=cover');
        }
      }

			b.persisted && (clearTimeout(v),
			v = setTimeout(u, 300))

      // 判断设备类型，ios全屏
			var device = navigator.userAgent;
			if (document.getElementsByTagName("body")[0] && device.indexOf('huoniao_iOS') > -1) {
				var bodyEle = document.getElementsByTagName('body')[0];
				bodyEle.className += " huoniao_iOS";
			}

	  }, false);
}(window, window.lib || (window.lib = {}));

//注册客户端webview
function setupWebViewJavascriptBridge(callback){
	if(window.WebViewJavascriptBridge){
		return callback(WebViewJavascriptBridge);
	}else{
		document.addEventListener("WebViewJavascriptBridgeReady", function() {
			return callback(WebViewJavascriptBridge);
		}, false);
	}

	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1 && device.indexOf('huoniao_Android') <= -1) {
    if(window.WVJBCallbacks){return window.WVJBCallbacks.push(callback);}
  	window.WVJBCallbacks = [callback];
  	var WVJBIframe = document.createElement("iframe");
  	WVJBIframe.style.display = "none";
  	WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";

		document.documentElement.appendChild(WVJBIframe);
		setTimeout(function(){document.documentElement.removeChild(WVJBIframe) }, 0);
	}
}

//获取客户端设备信息
var appInfo = {"device": "", "version": ""};

window.onload = function(){

	setupWebViewJavascriptBridge(function(bridge) {

		//获取APP信息
		bridge.callHandler("getAppInfo", {}, function(responseData){
			var data = JSON.parse(responseData);
			appInfo = data;
		});

		//APP端后退、目前只有安卓端有此功能
		var deviceUserAgent = navigator.userAgent;
		if (deviceUserAgent.indexOf('huoniao') > -1) {
			$('.header .back, .goBack').bind('click', function(e){
				e.preventDefault();
				bridge.callHandler("goBack", {}, function(responseData){});
			});
		}

		// 开启下拉刷新
    // bridge.callHandler("setDragRefresh", {"value": "on"}, function(){});

	});

	//退出
	var logoutBtn = document.getElementsByClassName("logout")[0];
	if(logoutBtn && logoutBtn != undefined){
		logoutBtn.onclick = function(){
			var device = navigator.userAgent;
			if(device.indexOf('huoniao_Android') > -1){
				setupWebViewJavascriptBridge(function(bridge) {
          bridge.callHandler('appLogout', {}, function(){});
          bridge.callHandler("goBack", {}, function(responseData){});
          bridge.callHandler('pageReload',	{},	function(responseData){});
				});
			}
      else if(device.indexOf('huoniao_iOS') > -1){
				setupWebViewJavascriptBridge(function(bridge) {
          bridge.callHandler('appLogout', {}, function(){});
          bridge.callHandler("goBack", {}, function(responseData){});
          bridge.callHandler('pageReload',	{},	function(responseData){});
          location.href = 'logout.html';
				});
			}
		};
	}

	$('.header').on('touchmove', function(e){
    e.preventDefault();
  })

	if($("#navlist").size() > 0){
	  var myscroll_nav = new iScroll("navlist", {vScrollbar: false});
	  $('.header-search .dropnav').click(function(){
	    var a = $(this), header = a.closest('.header');
	    if(!header.hasClass('open')) {
	      header.addClass('open');
	      $('.btmMenu').hide();
	      $('.fixFooter').hide();
	      $('#navBox').css({'top':'0.9rem', 'bottom':'0'}).show();
				var device = navigator.userAgent;
	      if (device.indexOf('huoniao_iOS') > -1) {
	        $('#navBox').css({'top':'calc(0.9rem + 20px)', 'bottom':'0'});
	      }
	      $('#navBox .bg').css({'height':'100%','opacity':1});
	      myscroll_nav.refresh();
	    }else {
	      header.removeClass('open');
	      closeShearBox();
	    }
	  })

    //分享功能只提供给APP使用
    var deviceUserAgent = navigator.userAgent;
		if (deviceUserAgent.indexOf('huoniao') > -1) {
      $('.HN_PublicShare').show();
    }else{
      $('.HN_PublicShare').hide();
    }
	}


  $('#cancelNav').click(function(){
      closeShearBox();
  })


  $('#shearBg').click(function(){
      closeShearBox();
  })

  $('#navlist li').click(function(){
      closeShearBox();
  })


  function closeShearBox(){
    $('.fixFooter').show();
    $('.header').removeClass('open');
    $('#navBox').hide();
    $('#navBox .bg').css({'height':'0','opacity':0});
  }


  // 清除列表cookie
  $('#navlist li').click(function(){
    var t = $(this);
    if (!t.hasClass('HN_PublicShare')) {
      window.sessionStorage.removeItem('house-list');
      window.sessionStorage.removeItem('maincontent');
      window.sessionStorage.removeItem('detailList');
      window.sessionStorage.removeItem('video_list');
    }
  })

  var JuMask = $('.JuMask'), JubaoBox = $('.JubaoBox');

  // 判断是不是需要举报按钮
  if (typeof JubaoConfig != "undefined") {
    $('.HN_Jubao').show();
  }

  // 举报
  $('.HN_Jubao').click(function(){
    $('.Jubao-'+JubaoConfig.module).show();
    JubaoShow();
    JuMask.addClass('show');
  })

  // 关闭举报
  $('.JubaoBox .JuClose, .JuMask').click(function(){
    JubaoBox.hide();
    JuMask.removeClass('show');
  })


  // 选择举报类型
  $('.JuSelect li').click(function(){
    var t = $(this), dom = t.hasClass('active');
    t.siblings('li').removeClass('active');
    if (dom) {
      t.removeClass('active');
    }else {
      t.addClass('active');
    }
  })

  // 举报提交
  $('.JubaoBox-submit').click(function(){
    var t = $(this);
    if(t.hasClass('disabled')) return;
    if ($('.JuSelect .active').length < 1) {
      showErr('请选择举报类型');
    }else if ($('#JubaoTel').val() == "") {
      showErr('请填写联系方式');
    }else {

      var type = $('.JuSelect .active').text();
      var desc = $('.JuRemark textarea').val();
      var phone = $('#JubaoTel').val();

      if(JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0){
        showErr('信息传输失败！');
        setTimeout(function(){
          JubaoBox.hide();
          JuMask.removeClass('show');
        }, 1000);
        return false;
      }

      t.addClass('disabled').html('提交中...');

      $.ajax({
        url: masterDomain+"/include/ajax.php",
        data: "service=member&template=complain&module="+JubaoConfig.module+"&dopost="+JubaoConfig.action+"&aid="+JubaoConfig.id+"&type="+encodeURIComponent(type)+"&desc="+encodeURIComponent(desc)+"&phone="+encodeURIComponent(phone),
        type: "GET",
        dataType: "jsonp",
        success: function(data){
          t.removeClass('disabled').html('提交');
          if (data && data.state == 100) {
            showErr('举报成功，我们将尽快处理！');
            setTimeout(function(){
              JubaoBox.hide();
              JuMask.removeClass('show');
            }, 1500);

          }else{
            showErr(data.info);
          }
        },
        error: function(){
          t.removeClass('disabled').html('提交');
          showErr('网络错误，举报失败！');
        }
      });

    }
  })

  // 显示举报
  function JubaoShow(){
    JubaoBox.show();
    var jubaoHeight = JubaoBox.height();
    JubaoBox.css('margin-top', -(jubaoHeight / 2));
  }

  // 显示错误
  function showErr(txt){
    $('.JuError').text(txt).show();
    setTimeout(function(){
      $('.JuError').fadeOut();
    }, 2000)
  }

};

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


var huoniao = {

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
			error: function(){}
		});
	}

}


var utils = {
    canStorage: function(){
        if (!!window.localStorage){
            return true;
        }
        return false;
    },
    setStorage: function(a, c){
        try{
            if (utils.canStorage()){
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        }catch(b){
            if (b.name == "QUOTA_EXCEEDED_ERR"){
                alert("您开启了秘密浏览或无痕浏览模式，请关闭");
            }
        }
    },
    getStorage: function(b){
        if (utils.canStorage()){
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function(a){
        if (utils.canStorage()){
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function(){
        if (utils.canStorage()){
            localStorage.clear();
        }
    }
};


var	scrollDirect = function (fn) {
  var beforeScrollTop = document.body.scrollTop;
  fn = fn || function () {
  };
  window.addEventListener("scroll", function (event) {
      event = event || window.event;

      var afterScrollTop = document.body.scrollTop;
      delta = afterScrollTop - beforeScrollTop;
      beforeScrollTop = afterScrollTop;

      var scrollTop = $(this).scrollTop();
      var scrollHeight = $(document).height();
      var windowHeight = $(this).height();
      if (scrollTop + windowHeight > scrollHeight - 10) {
          fn('up');
          return;
      }
      if (afterScrollTop < 10 || afterScrollTop > $(document.body).height - 10) {
          fn('up');
      } else {
          if (Math.abs(delta) < 10) {
              return false;
          }
          fn(delta > 0 ? "down" : "up");
      }
  }, false);
}

//计算广告尺寸
function calculatedAdvSize(obj){
  var obj = $('#' + obj);
  if(obj.size() > 0){
    obj.find('h6').html('尺寸【'+parseInt(obj.width() * 2)+' × '+parseInt(obj.height() * 2)+'】px');
  }
}
