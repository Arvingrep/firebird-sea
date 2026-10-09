$(function(){
		// 字体大小
	var Dpr = 1,
		uAgent = window.navigator.userAgent;
	var isIOS = uAgent.match(/iphone/i);
	var isYIXIN = uAgent.match(/yixin/i);
	var is2345 = uAgent.match(/Mb2345/i);
	var ishaosou = uAgent.match(/mso_app/i);
	var isSogou = uAgent.match(/sogoumobilebrowser/ig);
	var isLiebao = uAgent.match(/liebaofast/i);
	var isGnbr = uAgent.match(/GNBR/i);
	var wWidth, wHeight, wFsize = 100;

	function resizeRoot() {
		var wWidth = (screen.width > 0) ? (window.innerWidth >= screen.width || window.innerWidth == 0) ? screen.width : window.innerWidth : window.innerWidth,
			wDpr;
		var wHeight = (screen.height > 0) ? (window.innerHeight >= screen.height || window.innerHeight == 0) ? screen.height : window.innerHeight : window.innerHeight;
		if (window.devicePixelRatio) {
			wDpr = window.devicePixelRatio;
		} else {
			wDpr = isIOS ? wWidth > 818 ? 3 : wWidth > 480 ? 2 : 1 : 1;
		}
		if (isIOS) {
			wWidth = screen.width;
			wHeight = screen.height;
		}
		if (wWidth > wHeight) {
			// wWidth = wHeight;
		}
		wFsize = wWidth > 1080 ? 144 : wWidth / 7.5;
		wFsize = wFsize > 32 ? wFsize : 32;
		window.screenWidth_ = wWidth;
		if (isYIXIN || is2345 || ishaosou || isSogou || isLiebao || isGnbr) { //YIXIN 和 2345 这里有个刚调用系统浏览器时候的bug，需要一点延迟来获取
			setTimeout(function() {
				wWidth = (screen.width > 0) ? (window.innerWidth >= screen.width || window.innerWidth == 0) ? screen.width : window.innerWidth : window.innerWidth;
				wHeight = (screen.height > 0) ? (window.innerHeight >= screen.height || window.innerHeight == 0) ? screen.height : window.innerHeight : window.innerHeight;
				wFsize = wWidth > 1080 ? 144 : wWidth / 7.5;
				wFsize = wFsize > 32 ? wFsize : 32;
				document.getElementsByTagName('html')[0].style.fontSize = wFsize + 'px';
				$('body').addClass('show');
				complate(0, wWidth, wHeight, wFsize);
			}, 500);
		} else {
			document.getElementsByTagName('html')[0].style.fontSize = wFsize + 'px';
			$('body').addClass('show');
		}
	}

	resizeRoot();
	window.addEventListener("orientationchange", function() {
		resizeRoot();
	})


    //注册客户端webview
    function setupWebViewJavascriptBridge(callback){
      if(window.WebViewJavascriptBridge){
        return callback(WebViewJavascriptBridge);
      }else{
        document.addEventListener("WebViewJavascriptBridgeReady", function() {
          return callback(WebViewJavascriptBridge);
        }, false);
      }

      if(window.WVJBCallbacks){return window.WVJBCallbacks.push(callback);}
      window.WVJBCallbacks = [callback];
      var WVJBIframe = document.createElement("iframe");
      WVJBIframe.style.display = "none";
      WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";
      document.documentElement.appendChild(WVJBIframe);
      setTimeout(function(){document.documentElement.removeChild(WVJBIframe) }, 0);
    }

	// APP调用地图
	setupWebViewJavascriptBridge(function(bridge) {
  	$('.appMapBtn').click(function(e){
  		if (pageData.lat == "" && pageData.lng == "") {
  			if (pageData.lnglat != "") {
  				var local = pageData.lnglat.split(',');
  				var lng = local[0], lat = local[1];
  				e.preventDefault();
		        bridge.callHandler("skipAppMap", {
		            "lat": lat,
		            "lng": lng,
		            "addrTitle": pageData.addrTitle,
		            "addrDetail": pageData.addrDetail
		        }, function(responseData) {});
  			}
  		}else{
  			e.preventDefault();
	        bridge.callHandler("skipAppMap", {
	            "lat": pageData.lat,
	            "lng": pageData.lng,
	            "addrTitle": pageData.addrTitle,
	            "addrDetail": pageData.addrDetail
	        }, function(responseData) {});
      	}
  	})
  });




})