// 表情相关
var emojiText = "😄 😝 😜 😪 😞 😚 😏 😎 😌 😋 😊 😍 😷 😘 😖 😳 😲 😱 😰 😩 😨 😭 😥 😤 😣 😢 😡 😠 😆 😅 😃 😂 😔 😓 😒 😫 😐 😉 😈 😇 😁 👽 🙊 🐻 🚗 🎵 ❤ 💔 👻 🎁 🎉 🎂 👀 🙋 🙏 🌹 🐴 🐶 🐠 🐔 🐼 🐺 🐭 🐌 🐷 🐯 🐍 🐮 🐝 ⚽ 💊 🍔 🍊 🍎 🍉 ☕ 🍜 🍚 🍞 🍺 ☀ ⛅ ☁ ☔ ⚡ ⛄ 💰 💕 💏 💎 💍 ✌ 👍 👎 👏 👌";
var cfg_appConfig = {} ; //appConfig 暂定
var cfg_useWxMiniProgramLogin = '';
var cfg_timezone = 'PRC';

function appendEmoji() {
    var emojiList = emojiText.split(' ');
    var html = '';
    var list = [];
    for (var i = 0; i < emojiList.length; i++) {
        list.push('<li class="emot_li" data-txt="' + emojiList[i] + '"><img src="/static/images/ui/emot/default/defult_' + (i + 1) + '.png?v=1"></li>');
    }
    html = '<ul class="fn-clear">' + list.join('') + '</ul>';
    return html;
}


var showAlertErrTimer, payPopBtnObj, payPhoneVue;
function showErrAlert(data, type = '',tip = '') {
    showAlertErrTimer && clearTimeout(showAlertErrTimer);
    $(".popErrAlert").remove();
    var type = type ?  '<s class="' + type + '"></s>' : '';
    let tipDom  = tip ? '<p class="popErr_tip">'+ tip +'</p>' : '' ;
    let moreH = tip && data ? 'moreHigh' : ''
    $("body").append('<div class="popErrAlert"><div class="popErrCon '+ moreH +'"><div class="popErr_msg">' + type + data + '</div>'+ tipDom +'</div></div>');

    $(".popErrAlert").css({
        "visibility": "visible"
    });
    showAlertErrTimer = setTimeout(function () {
        $(".popErrAlert").fadeOut(300, function () {
            $(this).remove();
        });
    }, 1500);
}

// alert(navigator.userAgent.toLowerCase())
function showSuccessTip(title, content, icon, cls) {
    // title 标题,content 内容,icon  图标
    if (!title) return false;
    showAlertErrTimer && clearTimeout(showAlertErrTimer);
    $(".popSuccessTip").remove();
    var iconHtml = icon ? '<s class="ps_tip_icon"><img src="' + icon + '" alt=""></s>' : '';
    var conTxt = content ? '<p>' + content + '</p>' : "";
    $("body").append('<div class="popSuccessTip ' + cls + '">' + iconHtml + '<div class="popSuccessText"> <h2>' + title + '</h2>' + conTxt + '</div></div>');
    $(".popSuccessTip").css({
        "visibility": "visible"
    });
    showAlertErrTimer = setTimeout(function () {
        $(".popSuccessTip").fadeOut(300, function () {
            $(this).remove();
        });
    }, 1500);
}
// 引入微信脚本
var wx_miniprogram, baidu_miniprogram, qq_miniprogram, dy_miniprogram;
if (navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof (wx) == 'undefined') {
    document.write(unescape("%3Cscript src='https://res.wx.qq.com/open/js/jweixin-1.6.0.js?v=" + ~(-new Date()) + "'type='text/javascript'%3E%3C/script%3E"));
    if (navigator.userAgent.toLowerCase().match(/android/)) {
        (function () {
            if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                handleFontSize();
            } else {
                if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", handleFontSize);
                    document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
                }
            }
            function handleFontSize() {
                // 设置网页字体为默认大小
                WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize': 0 });
                // 重写设置网页字体大小的事件
                WeixinJSBridge.on('menu:setfont', function () {
                    WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize': 0 });
                });
            }
        })();
    }
}

//多语言包
setTimeout(function () {
    if (typeof langData == "undefined") {
        var langDir = hn_getCookie('HN_lang');
        langDir = typeof langDir != "undefined" ? langDir : "zh-CN";
        document.head.appendChild(document.createElement('script')).src = '/include/lang/' + langDir + '.js?v=' + ~(-new Date());
    }
}, 3000);

// 判断设备类型，ios全屏
var device = navigator.userAgent;
// 百度小程序
var isbaidu = device.indexOf('swan-baiduboxapp') > -1; //百度小程序
// qq小程序
var isQQ = device.toLowerCase().indexOf('qq') > -1 && device.toLowerCase().indexOf('miniprogram') > -1;
//抖音小程序
var isBytemini = device.toLowerCase().includes("toutiaomicroapp");

if (document.getElementsByTagName("html")[0] && (device.indexOf('huoniao') > -1 || window.__wxjs_environment == 'miniprogram') || isbaidu || isQQ || isBytemini) {
    var bodyEle = document.getElementsByTagName('html')[0];
    bodyEle.className += " huoniao_iOS";
    // 新增全面屏幕样式
    bodyEle.className += " huoniao_Fullscreen";
}
if (document.getElementsByTagName("html")[0] && device.indexOf('huoniao') > -1 && device.indexOf('Linux') > -1 && device.indexOf('Android') > -1) {
    var bodyEle = document.getElementsByTagName('html')[0];
    bodyEle.className += " huoniao_Android";

    // 新增全面屏幕样式
    bodyEle.className += " huoniao_Fullscreen";
}
if (document.getElementsByTagName("html")[0] && device.indexOf('huoniao') > -1 && device.toLowerCase().indexOf('harmony') > -1) {
    var bodyEle = document.getElementsByTagName('html')[0];
    bodyEle.className += " huoniao_Harmony";

    // 新增全面屏幕样式
    bodyEle.className += " huoniao_Fullscreen";
}







if (window.__wxjs_environment == 'miniprogram') {
    var bodyEle = document.getElementsByTagName('html')[0];
    bodyEle.className += " wx_miniprogram";

}

if (getQueryParam('from') == 'wmsj') {
    var bodyEle = document.getElementsByTagName('html')[0];
    bodyEle.className += " from_wmsj";
}

// qq小程序
var isQQ = device.toLowerCase().indexOf('qq') > -1 && device.toLowerCase().indexOf('miniprogram') > -1;
if (isQQ) {
    document.write(unescape("%3Cscript src='https://qqq.gtimg.cn/miniprogram/webview_jssdk/qqjssdk-1.0.0.js?v=" + ~(-new Date()) + "'type='text/javascript'%3E%3C/script%3E"));
    var bodyEle = document.getElementsByTagName('html')[0];
}
if (isbaidu) {
    // var bodyEle = document.getElementsByTagName('html')[0];
    //  bodyEle.className += " baidu_miniprogram";

    // 引入js
    document.write(unescape("%3Cscript src='https://b.bdstatic.com/searchbox/icms/searchbox/js/swan-2.0.21.js?v=" + ~(-new Date()) + "'type='text/javascript'%3E%3C/script%3E"));
}

// var tt = null;
// if (isBytemini) {

//     document.write(unescape("%3Cscript src='https://lf1-cdn-tos.bytegoofy.com/goofy/developer/jssdk/jssdk-1.0.2.js?v=" + ~(-new Date()) + "'type='text/javascript'%3E%3C/script%3E"));
//     var bodyEle = document.getElementsByTagName('html')[0];
// }

!function (s, t) {
    function u() {
        var a = x.getBoundingClientRect().width;
        a / A > 540 && (a = 540 * A);
        var d = a / 7.5;
        x.style.fontSize = d + "px",
            C.rem = s.rem = d
    }
    var v, w = s.document, x = w.documentElement, y = w.querySelector('meta[name="viewport"]'), z = w.querySelector('meta[name="flexible"]'), A = 0, B = 0, C = t.flexible || (t.flexible = {});
    // y.remove();
    // y = false;
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
            y.setAttribute("content", "width=device-width, initial-scale=" + B + ", maximum-scale=" + B + ", minimum-scale=" + B + ", user-scalable=no, viewport-fit=cover"),
            x.firstElementChild) {
            x.firstElementChild.appendChild(y)
        } else {
            var J = w.createElement("div");
            J.appendChild(y),
                w.write(J.innerHTML)
        }
    }
    s.addEventListener("resize", function () {
        clearTimeout(v),
            v = setTimeout(u, 300)
    }, !1),
        "complete" === w.readyState ? w.body.style.fontSize = 12 * A + "px" : w.addEventListener("DOMContentLoaded", function (b) {
            // w.body.style.fontSize = 12 * A + "px"
        }, !1),
        u(),
        C.dpr = s.dpr = A,
        C.refreshRem = u,
        C.rem2px = function (c) {
            var d = parseFloat(c) * this.rem;
            return "string" == typeof c && c.match(/rem$/) && (d += "px"),
                d
        }
        ,
        C.px2rem = function (c) {
            var d = parseFloat(c) / this.rem;
            return "string" == typeof c && c.match(/px$/) && (d += "rem"),
                d
        }

    s.addEventListener("pageshow", function (b) {

        //iPhoneX适配
        var meta = document.getElementsByTagName('meta');
        for (var i = 0; i < meta.length; i++) {
            if (meta[i]['name'] == 'viewport') {
                meta[i].setAttribute('content', meta[i]['content'] + ', viewport-fit=cover');
            }
        }

        b.persisted && (clearTimeout(v),
            v = setTimeout(u, 300))

        // 判断设备类型，ios全屏
        var device = navigator.userAgent;
        if (document.getElementsByTagName("body")[0] && (device.indexOf('huoniao_iOS') > -1 || window.__wxjs_environment == 'miniprogram' || window.__qqjs_environment == 'miniprogram')) {
            var bodyEle = document.getElementsByTagName('body')[0];
            bodyEle.className += " huoniao_iOS";
        }

    }, false);
}(window, window.lib || (window.lib = {}));

//注册客户端webview
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    } else {
        document.addEventListener("WebViewJavascriptBridgeReady", function () {
            return callback(WebViewJavascriptBridge);
        }, false);
    }

    var _device = navigator.userAgent.toLowerCase();
    // if (device.indexOf('huoniao_iOS') > -1 && device.indexOf('huoniao_Android') <= -1) {
    // if(_device.indexOf('toutiaomicroapp') <= -1 && !wx_miniprogram && !baidu_miniprogram && !qq_miniprogram){
    if (_device.indexOf('huoniao') > -1) {
        if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement("iframe");
        WVJBIframe.style.display = "none";
        WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";

        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0);
    }
    // }
}

//获取客户端设备信息
var appInfo = { "device": "", "version": "" };
var pageBack;
var pageAlert;
//公用方法
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
    , number_format: function (number, decimals, dec_point, thousands_sep) {
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
    , transToTimes: function (timestamp) {
        var new_str = timestamp.replace(/:/g, '-');
        new_str = new_str.replace(/ /g, '-');
        var arr = new_str.split("-");
        var datum = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
        return datum.getTime() / 1000;
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
    , changeFileSize: function (url, width, height) {
        if (url == "" || url == undefined) return "";

        //小图尺寸
        if (width == 'small') {
            width = 200;
            height = 200;
        }

        //中图尺寸
        if (width == 'middle') {
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
        url = url.replace('4096x4096', width + "x" + height);

        return url;

        // 以下功能弃用
        var from = (from == "" || from == undefined) ? "large" : from;
        // if(hideFileUrl == 1){
        //  return url + "&type=" + to;
        // }else{
        return url.replace(from, to);
        // }
    }

    //获取字符串长度
    //获得字符串实际长度，中文2，英文1
    , getStrLength: function (str) {
        var realLength = 0, len = str.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;
            else realLength += 2;
        }
        return realLength;
    }

    //异步操作
    , operaJson: function (url, action, callback) {
        $.ajax({
            url: url,
            data: action,
            type: "POST",
            dataType: "json",
            success: function (data) {
                typeof callback == "function" && callback(data);
            },
            error: function () { }
        });
    }
    // 过滤html
    , checkhtml: function () {
        // 过滤html
        $('[contenteditable],[contenteditable="true"]').each(function () {
            // 干掉IE http之类地址自动加链接
            try {
                document.execCommand("AutoUrlDetect", false, false);
            } catch (e) { }

            $(this).on('paste', function (e) {
                e.preventDefault();
                var text = null;

                if (window.clipboardData && clipboardData.setData) {
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
        });
    }

}



//商家配置--谷歌地图
function businessgooleMap(gLng, gLat) {
    $('body').addClass('googleBody');//自动检索弹窗加样式
    var map, geocoder, marker,
        mapOptions = {
            zoom: 14,
            center: new google.maps.LatLng(gLat, gLng),
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
        }

    $('.mapcenter').remove();
    map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);

    marker = new google.maps.Marker({
        position: mapOptions.center,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });

    getLocation(mapOptions.center);

    google.maps.event.addListener(marker, 'dragend', function (event) {
        var location = event.latLng;
        var pos = {
            lat: location.lat(),
            lng: location.lng()
        };
        getLocation(pos);
    })
    function getLocation(pos) {

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: pos,
            radius: 500
        }, callback);

        var list = [];
        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    list.push('<li data-lng="' + results[i].geometry.location.lng() + '" data-lat="' + results[i].geometry.location.lat() + '"><h5>' + results[i].name + '</h5><p>' + results[i].vicinity + '</p></li>');
                }
                if (list.length > 0) {
                    $(".mapresults ul").html(list.join(""));
                    $(".mapresults").show();
                }
            }
        }
    }

    var input = document.getElementById('searchAddr');
    var places = new google.maps.places.Autocomplete(input, { placeIdOnly: true });

    google.maps.event.addListener(places, 'place_changed', function () {
        var address = places.getPlace().name;
        $('#searchAddr').val(address);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var locations = results[0].geometry.location;
                lng = locations.lng(), lat = locations.lat();
                if (lng && lat) {

                    //$("#local strong").html(results[0].formatted_address);
                    $("#lnglat").val(lng + ',' + lat);
                    $(".pageitem").hide();
                    $(".page.gz-address").show();
                    $(".chose_val #address").val(address);
                } else {
                    alert(langData["waimai"][7][132]);   /* 您选择地址没有解析到结果! */
                }
            }
        });

    });
}
/**
 * app切换城市分站   ios跳转h5页面  android跳转原生 
 * @param {string} url 跳转的页面  可以携带参数
 * @param {string} [mod='siteConfig'] 切换之后返回的页面
 * */ 
var cityCheckInterval = null; //定时器 监听城市分站
function appToCityChange(url,mod = 'siteConfig'){
    if(cityCheckInterval){
        clearInterval(cityCheckInterval)
    }
    setupWebViewJavascriptBridge(function(bridge) {
        if(device.toLowerCase().includes('huoniao_ios') && !device.toLowerCase().includes('huoniao_android')){
            let o_cityInfo = $.cookie('HN_siteCityInfo')
            o_cityInfo = JSON.parse(JSON.stringify(o_cityInfo)); //原始的 
            bridge.callHandler('redirectNative', {'link': url}, function(){});
            localStorage.setItem('cityHasChange','0'); //表示正在改变城市分站
            cityCheckInterval = setInterval(() => {
                let cityHasChange = localStorage.getItem('cityHasChange')
                if(cityHasChange && cityHasChange !== '0'){
                    localStorage.removeItem('cityHasChange')
                    clearInterval(cityCheckInterval)
                    let n_cityInfo = $.cookie('HN_siteCityInfo'); //返回页面获取的cityInfo
                    if(JSON.stringify(o_cityInfo) != JSON.stringify(n_cityInfo)){
                        // 已从城市分站页面回来 并且已更新
                        location.reload()
                    }
                }
            },100)
            
        }else if(device.toLowerCase().includes('huoniao_android')){
            bridge.callHandler('goToCity', {'module': mod}, function(){});
        }
        
    });
}
window.onload = function () {

    //修复ios端cookie不生效问题
    if(navigator.userAgent.toLowerCase().match(/huoniao_ios/)){ //ios端
        let HN_siteCityInfo = JSON.parse($.cookie('HN_siteCityInfo'))||{};
        let HN_siteCityInfo_iOS_APP = JSON.parse($.cookie('HN_siteCityInfo_iOS_APP'))||{};
        if(JSON.stringify(HN_siteCityInfo_iOS_APP)=='{}'){
            $.cookie('HN_siteCityInfo_iOS_APP',JSON.stringify(HN_siteCityInfo));
        }else if(HN_siteCityInfo_iOS_APP?.cityid!=HN_siteCityInfo?.cityid){
            $.cookie('HN_siteCityInfo',JSON.stringify(HN_siteCityInfo_iOS_APP));
            location.reload();
        }
    }

    //  涉及到支付的地方  
    // 在微信小程序苹果端中 并且后台配置之后 
    // 类名  iOS_miniprogram_nocash  提示也是后台配置
    // cfg_iosVirtualPaymentState是否开启 0 是开启  1是关闭
    // cfg_iosVirtualPaymentTip 提示文字

    cfg_iosVirtualPaymentState = typeof cfg_iosVirtualPaymentState == 'undefined' ? 1 : cfg_iosVirtualPaymentState;  //默认关闭

    // 解绑绑定的事件
    if(cfg_iosVirtualPaymentState && window.__wxjs_environment == 'miniprogram'){  //是否开启禁用iOS端虚拟支付 
        let isiOS = !!navigator.userAgent.match(/(iPhone|iPod|iPad);?/i); //ios终端  
        if(isiOS){
            $('body').addClass('huoniao_hidePayBtn');
            $(".iosVirtualPaymentHide").hide();
            $(".iosVirtualPaymentHide").remove()
            $(".iosVirtualPaymentHide").css({
                'display':'none !important',
                'opacity':'0',
            })
        }
        let userid = $.cookie(cookiePre + "login_user")
        if(userid && isiOS){
            let hasClick = false; //用于禁止多次触发 
            // .off('click').unbind('click').undelegate('click') 该语句导致圈子所有功能在禁用虚拟支付的情况下失效，若遇到需要阻止冒泡的情况，用其他方法处理
            $('body').delegate('.iOS_miniprogram_nocash', 'touchstart', function () {
                //  涉及到支付的地方  
                // 在微信小程序苹果端中 并且后台配置之后 
                // 类名  iOS_miniprogram_nocash  提示也是后台配置
                cfg_iosVirtualPaymentTip = cfg_iosVirtualPaymentTip ? cfg_iosVirtualPaymentTip : '十分抱歉，由于相关规范，iOS小程序不支持该功能'
                if(!hasClick){
                   // confirm弹窗
                    var popOptions = {
                        title: '温馨提示', //'确定删除信息？',  //提示文字
                        btnCancelColor: '#407fff',
                        isShow:true,
                        confirmHtml: '<p style="margin-top:.2rem;">'+ cfg_iosVirtualPaymentTip +'</p>' , //'一经删除不可恢复',  //副标题
                        btnCancel: '好的，知道了',
                        noSure: true
                    }
                    confirmPop(popOptions);
                }
           
                hasClick = true
                setTimeout(() => {
                    hasClick = false
                }, 300);

                // 处理一下原始点击支付事件的问题  
                 $('.payBeforeLoading').hide()


                return false;
            })
        }
    }





    function getAppConfig(){
        $.ajax({
            url: '/api/appConfig.json',
            type: "POST",
            dataType: "json",
            success: function (data) {
               if(data){
                    cfg_appConfig = data;
                    cfg_useWxMiniProgramLogin = data.cfg_useWxMiniProgramLogin
               }
            },
            error: function () { }
        });
    }


    // 跳转城市切换
    if(device.toLowerCase().includes('huoniao')){
        $('.hn_cityChange').click(function(){
            let url = $(this).attr('href') || $(this).attr('data-url'),mod = $(this).attr('data-mod') || '';
            event.preventDefault();
            appToCityChange(url,mod)
        })
    }





    /*跳转第三方小程序*/


    $('a[href^="wxMiniprogram://"]').each(function (index, element) {
        var ahref = $(this).attr('href'), el = $(this);
        $(this).css({
            'display': 'block',
            'position': 'relative',
        });
        var isWeixin = device.toLowerCase().indexOf('micromessenger') != -1;
        var wx_stringArr = isWeixin ? device.toLowerCase().match(/micromessenger\/([\d\.]+)/i) : 0;
        var wx_version = wx_stringArr.length > 0 ? device.toLowerCase().match(/micromessenger\/([\d\.]+)/i)[1] : 0; //微信版本号
        var wx_for = isWeixin ? (wx_version.split('.')[0] >= 7 || (wx_version.split('.')[1] >= 0 && wx_version.split('.')[0] == 7) || (wx_version.split('.')[2] >= 12 && wx_version.split('.')[0] == 7 && wx_version.split('.')[1] == 0)) : 0;//微信版本号是否大于7.0.12
        ahref = ahref.replace('wxMiniprogram://', "");
        var miniId = ahref.split('?/')[0],  //小程序原始id
            path = ahref.split('?/')[1];  //跳转的路径
        miniId = miniId.split('/')[0];
        path = path != undefined && path ? '/' + path : '';
        if (isWeixin && wx_for && window.__wxjs_environment != 'miniprogram' && ahref.indexOf(miniProgramAppid) < 0) {
            wxOpentag(el, miniId, path);
        }

    });

    function wxOpentag(el, id, path) {
        var aw = (el.width() == 0) ? 120 : el.width(), ah = (el.height() == 0) ? 120 : el.height();
        if (path && path.indexOf('huoniao/') > -1) {
            path = path.replace('huoniao/', '/pages/redirect/index?url=/');
        }

        el.append('<div class="h5Toweapp" id="h5Toweapp">' +
            '     <wx-open-launch-weapp' +
            '          id="launch-weapp-btn"' +
            '          username="' + id + '"' +
            '          path="' + path + '"' +
            '          style="display:block;"' +
            '        ><template>\n' +
            '     <style>.toH5Btn { diplay:block; width:100%; height:100%; line-height:' + ah + 'px; opacity:0; background:#f00; font-size:16px; color:#000;}</style>\n' +
            '   <a href="javascript:;" class="toH5Btn">立即打开</a>\n' +  //立即打开
            '   </template>\n' +
            '   </wx-open-launch-weapp>\n' +
            '</div>');


        wx.ready(function () {
            var btn = document.getElementById('launch-weapp-btn');
            if (btn) {

                btn.addEventListener('launch', function (e) {
                    console.log('success');
                });
                btn.addEventListener('error', function (e) {
                    console.log('fail', e.detail);
                });
            }
        })
    }



    // 底部导航图标(小于5个按钮时处理)
    // if($(".footer_4_3").size() != 0 && $(".footer_4_3 li.ficon").size() != 0 && ($(".footer_4_3 li").size() <5 || $(".footer_4_3 li").size() >5) && $('.footer_4_3').attr('data-title') != 'paotui'){
    //   var currHref = window.location.href;
    //   $(".footer_4_3 li.ficon").each(function(i){
    //       var t = $(this);
    //       var url = t.find('a').attr('href');
    //       var icon1 = t.find('a').attr('data-icon1');
    //       var icon2 = t.find('a').attr('data-icon2');
    //       var currname = t.attr('data-curr');
    //       var domain = t.attr('data-city');
    //       var cityDomain =  masterDomain+'/'+domain;
    //       if(domain && currHref.indexOf(domain)>-1){
    //          url = url.replace(masterDomain,cityDomain);
    //       }

    //       if(domain && url.indexOf(domain)>-1){
    //          url = url.replace(cityDomain,"");
    //       }
    //       $(".footer_4_3 li.ficon").removeClass('icon_on');
    //        if( (currHref.split('?')[0] == busDomain_bottom ||currHref.split('/?')[0] == busDomain_bottom  ) && (url.split('?')[0]== memberDomain_bottom||url.split('/?')[0]== memberDomain_bottom)){
    //             t.addClass("icon_on").find('img').attr('src',icon2);
    //             console.log(444)
    //            return false;
    //        }else if((url.indexOf(currHref) > -1 || currHref.indexOf(url) > -1  || currHref.split('/?')[0].indexOf(url) >-1 || url.indexOf(currHref.split('/?')[0]) > -1 || currHref.indexOf(url.split('?')[0]) > -1) && currHref.indexOf(memberDomain_bottom) <=-1 && currHref.indexOf(busDomain_bottom) <=-1 ){
    //         if(currname != 'index' && i == 0 && (currHref.split('/?')[0]==masterDomain)||(currHref.split('/?')[0]==cityDomain)){
    //           t.removeClass("icon_on").find('img').attr('src',icon1);
    //            return ;
    //         }
    //          t.find('a').attr('href','javascript:;');
    //          t.addClass('icon_on').find('img').attr('src',icon2);

    //         if(currname == 'index'){
    //           return false;
    //         }
    //         console.log(333)
    //       }else if(currHref.indexOf(memberDomain_bottom) > -1 && ((url.indexOf(currHref) > -1 || url.indexOf(currHref.split('/?')[0]) > -1) && (currHref.indexOf(url) > -1  || currHref.split('/?')[0].indexOf(url) >-1  || currHref.indexOf(url.split('?')[0]) > -1))){
    //            t.find('a').attr('href','javascript:;');
    //            t.addClass('icon_on').find('img').attr('src',icon2);
    //            console.log(222)
    //            return ;
    //       }else{
    //         console.log(111)
    //           t.removeClass("icon_on").find('img').attr('src',icon1)

    //       }
    //   })
    // }


    // 导航修改

    if ($(".footer_4_3").size() != 0 && $(".footer_4_3 li.ficon").size() != 0 && ($(".footer_4_3 li").size() < 5 || $(".footer_4_3 li").size() > 5) && $('.footer_4_3').attr('data-title') != 'paotui') {

        var currHref = window.location.href; //当前页面的url;
        currHref = currHref.replace('.html','').split('?')[0]
        var len = $(".footer_4_3 li.ficon").length;
        var code = '', city = ''; //模块code  城市分站

        var curr_iconOn = $(".footer_4_3 li.icon_on");
        var currIndex = $(".footer_4_3 li.icon_on").index();
        var currIndexShow = $(".footer_4_3 li.icon_on").attr('data-currIndex');
        var currLink = $(".footer_4_3 li.icon_on").find('a').attr('data-url');
        var currLink1 = currLink2 = '';
        if (currLink) {
        	currLink = currLink.replace('.html','').split('?')[0]
            currLink1 = currLink.split('?')[0]; //当前页面的url;
            currLink2 = currLink.split('/?')[0]; //当前页面的url;
        }
        var currDomain = masterDomain;  //当前模块首页

        if (curr_iconOn.length && currIndex == currIndexShow && (currLink == currHref || (currLink + '/') == currHref || currLink1 == currHref || currLink2 == currHref || (currLink + '/?miniprogram=1') == currHref)) {
            console.log('不需要处理')
        } else {

            $(".footer_4_3 li.ficon").removeClass('icon_on');
            for (var i = 0; i < len; i++) {
                var currLi = $(".footer_4_3 li.ficon").eq(i);
                if (currLi.attr('data-code') != '') {
                    code = currLi.attr('data-code'); //当前模块
                }
                if (currLi.attr('data-city') != '') {
                    city = currLi.attr('data-city'); //当前模块
                }
                // currDomain = currDomain + '/' + city + '/' + code;
                var href = currLi.find('a').attr('data-url'); //链接
                href = href.replace('.html','').split('?')[0]
                var href1 = currLi.find('a').attr('data-url').split('?')[0].replace('/' + city, ''); //链接
                href1 = href1.replace('.html','').split('?')[0]
                var href2 = currLi.find('a').attr('data-url').split('/?')[0].replace('/' + city, ''); //链接
                href2 = href2.replace('.html','').split('?')[0]
                var rimg = currLi.find('a').attr('data-icon2'); //选中
                var img = currLi.find('a').attr('data-icon1');
                var chref1 = currHref.split('?')[0].replace('/' + city, '')
                var chref2 = currHref.split('/?')[0].replace('/' + city, '')
                currHref = currHref.replace('/' + city, '');
                if (currHref == href || href1 == currHref || href2 == currHref) {  //链接相等
                    currLi.addClass('icon_on').find('img').attr('src', rimg);
                    currLi.siblings('.ficon').removeClass('icon_on');
                    break;
                }

                // 链接带参数

            }

            $(".footer_4_3 li.ficon").each(function () {
                var t = $(this);
                if (!t.hasClass('icon_on')) {
                    t.find('img').attr('src', t.find('a').attr('data-icon1'))
                }
            })
        }

    }

    /**********************修复底部回复框被遮挡**************************/
    var userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
        if ($('.bottom_reply_fixed').is(':hidden')) {
            $(".bottom_reply_fixed").css("padding-bottom", ".28rem");
        }
    } else {
        if ($('.bottom_reply_fixed').is(':hidden')) {
            $(".bottom_reply_fixed").css("padding-bottom", "3rem");
            if ($(".Bottom_inputBox").size() > 0) {  //tab切换
                $(".bottom_reply_fixed").css("padding-bottom", "0");
                $(".bottom_reply_fixed input").focus(function () {
                    $(".bottom_reply_fixed").css("padding-bottom", "3rem");
                });
                $(".bottom_reply_fixed input").blur(function () {
                    $(".bottom_reply_fixed").css("padding-bottom", ".28rem");
                })
            }
        } else {
            $(".bottom_reply_fixed input").focus(function () {
                $(".bottom_reply_fixed").css("padding-bottom", "3rem");
            });
            $(".bottom_reply_fixed input").blur(function () {
                $(".bottom_reply_fixed").css("padding-bottom", ".28rem");
            })
        }
    } //修复底部回复框被遮挡

    /**********************修复底部回复框被遮挡**************************/

    //2020-9-21 详情页底部增加下载app按钮
    var isWeixin = device.toLowerCase().indexOf('micromessenger') != -1;
    var wx_stringArr = isWeixin ? device.toLowerCase().match(/micromessenger\/([\d\.]+)/i) : 0;
    var wx_version = wx_stringArr.length > 0 ? device.toLowerCase().match(/micromessenger\/([\d\.]+)/i)[1] : 0; //微信版本号
    var wx_for = isWeixin ? (wx_version.split('.')[0] >= 7 || (wx_version.split('.')[1] >= 0 && wx_version.split('.')[0] == 7) || (wx_version.split('.')[2] >= 12 && wx_version.split('.')[0] == 7 && wx_version.split('.')[1] == 0)) : 0;//微信版本号是否大于7.0.12
    var iOSver = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);  //ios版本信息
    var isIOS9 = iOSver ? iOSver[1] : 0; //ios的版本
    var url_path = window.location.href;

    if (typeof wxconfig != "undefined" && typeof masterDomain != "undefined") {
        if (wxconfig.link == masterDomain) {
            url_path = masterDomain;
        }
    }

    openclient = function () {
        var startTime = Date.now();
        // 用户点击时，在动态创建一个iframe，并且让这个iframe去加载config中的Schema
        var ifr = document.createElement('iframe');
        // 端口判断 安卓或IOS
        ifr.src = (device.indexOf('Android') > -1 || device.indexOf('Linux') > -1) ? appConfig.scheme_Adr : appConfig.scheme_IOS;
        ifr.style.display = 'none';
        if (isIOS9 >= 9) {
            window.location.href = appConfig.scheme_IOS;
            setTimeout(function () {
                window.location.href = appConfig.download_url_IOS
            }, appConfig.timeout)
        } else {
            document.body.appendChild(ifr);
        }
        var t = setTimeout(function () {
            var endTime = Date.now();
            //指定的时间内没有跳转成功 当前页跳转到apk的下载地址
            if ((endTime - startTime) < (appConfig.timeout + 200)) {
                //判断是安卓 还是IOS
                if (/iphone|ipad|ipod/.test(device.toLowerCase())) {
                    window.location.href = appConfig.download_url_IOS;
                } else if (/android/.test(device.toLowerCase())) {
                    window.location.href = appConfig.download_url_IOS;
                }
            } else {
                window.close();
            }
        }, appConfig.timeout);

        window.onblur = function () {
            clearTimeout(t);
        }
    }
    if (typeof cfg_appinfo != "undefined") {
        masterDomain = typeof (masterDomain) != 'undefined' ? masterDomain : '';
        var paramUrlAnd = url_path == masterDomain ? "" : '?url=' + url_path;
        // var paramUrlIos = url_path == masterDomain ? "" : '://?url=' + url_path;
        var paramUrlIos = '://?url=' + url_path;
        var appConfig = {
            scheme_IOS: cfg_appinfo.URLScheme_iOS ? (cfg_appinfo.URLScheme_iOS + paramUrlIos) : (masterDomain + '/mobile.html'),
            scheme_Adr: cfg_appinfo.URLScheme_Android ? ('portal://' + cfg_appinfo.URLScheme_Android + ':8000/splash' + paramUrlAnd) : (masterDomain + '/mobile.html'),
            download_url_IOS: masterDomain + '/mobile.html',
            timeout: 600
        };

        if (typeof JubaoConfig != "undefined" && location.href.indexOf('waimai') < 0) {
            //非app 非小程序
            if ((device.indexOf('huoniao') < 0) && !(window.__wxjs_environment == 'miniprogram') && !isbaidu && !isQQ && !isBytemini) {
                /* ================================圆形按钮============================== */
                // 显示app下载圆形按钮
                if (isWeixin && wx_for && cfg_appinfo.wx_appid) {
                    $('body').append('<div class="appDwonload" id="appDwonload">' +
                        '     <wx-open-launch-app' +
                        '          id="launch-appbtn"' +
                        '          appid="' + cfg_appinfo.wx_appid + '"' +
                        '      extinfo="' + url_path + '"' +
                        '        ><template>\n' +
                        '     <style>.downLoadBtn { width:42px; height:42px; diplay:block; line-height:42px; opacity:0;}</style>\n' +
                        '   <a href="javascript:;" class="downLoadBtn">立即打开</a>\n' +  //立即打开
                        '   </template>\n' +
                        '   </wx-open-launch-app>\n' +
                        '</div>')
                } else {
                    $('body').append('<a href="javascript:;" class="appDwonload" id="appDwonload"></a>')
                }

                $("body").delegate('.appDwonload', 'click', function () {
                    if (isWeixin && !wx_for) {
                        location.href = appConfig.download_url_IOS
                    } else if (!isWeixin) {
                        openclient();
                    }
                });

                //调起失败后兼容处理
                var isClick = false;
                $('.app_btn_down').bind('click', function () {
                    setTimeout(function () {
                        if (!isClick) {
                            isClick = true;
                            location.href = appConfig.download_url_IOS
                        }
                    }, 2000);
                })
                $('body').delegate('.appDwonload', 'click', function () {
                    setTimeout(function () {
                        if (!isClick) {
                            isClick = true;
                            location.href = appConfig.download_url_IOS
                        }
                    }, 2000);
                })

                if (isWeixin && wx_for) {
                    wx.ready(function () {
                        var btn = document.getElementById('launch-appbtn');
                        if (btn) {
                            btn.addEventListener('click', function (e) {
                                console.log('click');

                                //调起失败后兼容处理
                                setTimeout(function () {
                                    if (!isClick) {
                                        isClick = true;
                                        location.href = appConfig.download_url_IOS
                                    }
                                }, 1000);

                            });
                            btn.addEventListener('launch', function (e) {
                                console.log('success');
                            });
                            btn.addEventListener('error', function (e) {
                                //调起失败后兼容处理
                                isClick = true;
                                $.cookie('appDownloadLocation', true);
                                location.href = appConfig.download_url_IOS
                            });
                        }

                    })

                }

            }

        } else {
            if ((device.indexOf('huoniao') < 0) && !(window.__wxjs_environment == 'miniprogram') && !isbaidu && !isQQ && !$.cookie('downloadAppTips') && !isBytemini && typeof wxconfig != "undefined") {
                // 不需要的页面
                if (
                    location.href.indexOf('mobile') < 0 &&
                    location.href.indexOf('login') < 0


                ) {

                    if (isWeixin && wx_for && cfg_appinfo.wx_appid) {
                        $('body').append('<div class="downloadBox">\n' +
                            '<div class="left_app_info">\n' +
                            ' <a href="javascript:;" class="btn_close_appDownload"></a>\n' +
                            ' <div class="downloadLogo"><img src="' + cfg_appinfo.logo + '"></div>\n' +
                            '<h3>' + cfg_appinfo.subtitle + '</h3>\n' +
                            '</div>\n' +
                            '<a href="javascript:;" class="app_btn_down">\n' +
                            '<div class="btn_style">打开APP</div>\n' +
                            '<div class="wxDownLoad">\n' +
                            '     <wx-open-launch-app' +
                            '          id="launch-btn"' +
                            '          appid="' + cfg_appinfo.wx_appid + '"' +
                            '      extinfo="' + url_path + '"' +
                            '        ><template>\n' +
                            '     <style>.downLoadBtn { width:100px; height:100px; opacity:0; }</style>\n' +
                            '   <a href="javascript:;" class="downLoadBtn">打开APP</a>\n' +  //立即打开
                            '   </template>\n' +
                            '   </wx-open-launch-app>\n' +
                            '</div> \n' +
                            '</a>');
                    } else {
                        $('body').append('<div class="downloadBox">\n' +
                            '<div class="left_app_info">\n' +
                            ' <a href="javascript:;" class="btn_close_appDownload"></a>\n' +
                            ' <div class="downloadLogo"><img src="' + cfg_appinfo.logo + '"></div>\n' +
                            '<h3>' + cfg_appinfo.subtitle + '</h3>\n' +
                            '</div>\n' +
                            '<a href="javascript:;" class="app_btn_down">\n' +
                            '<div class="btn_style">打开APP</div>\n' +
                            '</a>');
                    }
                }

                $('body').delegate('.btn_close_appDownload', 'click', function () {
                    $('.downloadBox').removeClass('topShow');
                    $.cookie('downloadAppTips', 1, { expires: 1, path: '/' });

                });
                $("body").delegate('.downloadBox .app_btn_down', 'click', function () {
                    if (isWeixin && !wx_for) {
                        location.href = appConfig.download_url_IOS
                    } else if (!isWeixin) {
                        openclient();
                    }
                });
                if (isWeixin && wx_for) {
                    wx.ready(function () {
                        var btn = document.getElementById('launch-btn');

                        if (btn) {

                            btn.addEventListener('launch', function (e) {
                                console.log('success');

                            });
                            btn.addEventListener('error', function (e) {
                                window.location = appConfig.download_url_IOS;
                            });
                        }
                    })

                }
                setTimeout(function () {
                    $('.downloadBox').addClass('topShow');
                    setTimeout(function () {
                        $('.downloadBox').removeClass('topShow');
                    }, 8000)
                }, 1000)
            }

        }
    }


    // 微信小程序
    if (navigator.userAgent.toLowerCase().match(/micromessenger/)) {
        wx.miniProgram.getEnv(function (res) {
            wx_miniprogram = res.miniprogram;

            window.wx_miniprogram_judge = true;

            if (wx_miniprogram) {
                var bodyEle = document.getElementsByTagName('html')[0];
                bodyEle.className += " huoniao_iOS wx_miniprogram";

                var Days = 30;
                var exp = new Date();
                exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
                document.cookie = "HN_isWxMiniprogram=1;path=/;expires=" + exp.toGMTString();
                getAppConfig();
            } else {
                hn_delCookie('HN_isWxMiniprogram');
            }
        });

        if (!wx_miniprogram) {
            hn_delCookie('HN_isWxMiniprogram');
        }
    } else {
        window.wx_miniprogram_judge = false;
    }


    // 百度小程序
    if (isbaidu) {
        swan.webView.getEnv(function (res) {
            baidu_miniprogram = res.smartprogram
            // alert(`当前页面是否运行在小程序中：${baidu_miniprogram}`); // true

            if (baidu_miniprogram) {
                var bodyEle = document.getElementsByTagName('html')[0];
                bodyEle.className += " huoniao_iOS baidu_miniprogram";

                var Days = 30;
                var exp = new Date();
                exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
                document.cookie = "HN_isBaiDuMiniprogram=1;path=/;expires=" + exp.toGMTString();
            } else {
                hn_delCookie('HN_isBaiDuMiniprogram');
            }
        });
        if (!baidu_miniprogram) {
            hn_delCookie('HN_isBaiDuMiniprogram');
        }
    }



    // qq小程序
    if (isQQ) {
        qq.miniProgram.getEnv(function (res) {
            qq_miniprogram = res.miniprogram;
            // window.qq_miniprogram_judge = true;

            if (qq_miniprogram) {
                var bodyEle = document.getElementsByTagName('html')[0];
                bodyEle.className += " huoniao_iOS qq_miniprogram";
                var Days = 30;
                var exp = new Date();
                exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
                document.cookie = "HN_isQqMiniprogram=1;path=/;expires=" + exp.toGMTString();
            } else {
                hn_delCookie('HN_isQqMiniprogram');
            }
        });
        if (!qq_miniprogram) {
            hn_delCookie('HN_isQqMiniprogram');
        }
    } else {
        // window.qq_miniprogram_judge = true;
    }

    //抖音小程序

    if (isBytemini) {
        var bodyEle = document.getElementsByTagName('html')[0];
        bodyEle.className += " huoniao_iOS byte_miniprogram";
        if (device.indexOf('Linux') > -1 && device.indexOf('Android') > -1) {
            bodyEle.className += " huoniao_Android";
        }
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = "HN_isByteMiniprogram=1;path=/;expires=" + exp.toGMTString();
    } else {
        hn_delCookie('HN_isByteMiniprogram');
    }

    setupWebViewJavascriptBridge(function (bridge) {
        //初始化信息
        var jubao_show = 0, share_show = $(".HN_PublicShare").length;
        if (typeof JubaoConfig != "undefined" && JubaoConfig.module != 'shop' && JubaoConfig.module != 'waimai' && JubaoConfig.module != 'tuan' && JubaoConfig.module != 'travel') {
            jubao_show = 1;
        }

        if (typeof wxconfig != "undefined") {
            var apptitle = $('meta[name="apptitle"]');

            var initAppConfigData = {
                "apptitle": (apptitle.length > 0 && apptitle[0].content) ? apptitle[0].content : wxconfig.title,   //为空时不改变现有标题
                "share": (share_show && wxconfig.title != undefined && wxconfig.link != undefined ? 1 : 0),           //为1时显示分享按钮
                "report": jubao_show,           //为1时显示举报按钮
                "shareContent": {
                    "platform": "all",
                    "title": wxconfig.title,
                    "url": wxconfig.link,
                    "imageUrl": wxconfig.imgUrl,
                    "summary": wxconfig.description
                }
            }
            bridge.callHandler("initAppConfig", { 'value': initAppConfigData }, function (responseData) { });
        }

        //获取APP信息
        bridge.callHandler("getAppInfo", {}, function (responseData) {
            var data = JSON.parse(responseData);
            appInfo = data;
            // alert(JSON.stringify(appInfo))
        });

        //APP端后退、目前只有安卓端有此功能
        var deviceUserAgent = navigator.userAgent;
        if (deviceUserAgent.indexOf('huoniao') > -1) {
            $('.header .back, .goBack').bind('click', function (e) {
                e.preventDefault();
                bridge.callHandler("goBack", {}, function (responseData) { });
            });

        }

        // 开启下拉刷新
        // bridge.callHandler("setDragRefresh", {"value": "on"}, function(){});

        //显示隐藏菜单
        bridge.registerHandler("toggleAppMenu", function (data, responseCallback) {
            $('.header-search .dropnav').click();
        });

        //后退触发
        bridge.registerHandler("pageBack", function (data, responseCallback) {
            typeof pageBack == "function" && pageBack(data);
        });
        //弹窗
        bridge.registerHandler("pageAlert", function (data, responseCallback) {
            typeof pageAlert == "function" && pageAlert(data);
        });

        //举报按钮点击
        bridge.registerHandler("HN_report", function (data, responseCallback) {
            $('.HN_Jubao').click();
        });

    });


    //退出
    var logoutBtn = document.getElementsByClassName("logout")[0];
    if (logoutBtn && logoutBtn != undefined) {
        logoutBtn.onclick = function () {
            var device = navigator.userAgent;
            if (device.indexOf('huoniao') > -1) {
                $(this).html(langData['siteConfig'][45][54]);  //退出中
                if (device.indexOf('android') > -1) {
                    $('body').append('<iframe src="' + masterDomain + '/logout.html?from=app" style="display: none;"></iframe>');
                }
                setTimeout(function () {
                    setupWebViewJavascriptBridge(function (bridge) {
                        bridge.callHandler('appLogout', {}, function () { });
                        bridge.callHandler("goBack", {}, function (responseData) { });
                        bridge.callHandler('pageReload', {}, function (responseData) { });
                    });
                }, 2000);
            } else {
                if (typeof moduleName != undefined && moduleName == 'job') {
                    location.href = masterDomain + '/logout.html?url=' + encodeURIComponent(memberDomain + '/index_job.html' + (appBoolean ? '?appFullScreen' : ''));
                } else if (isBytemini) { //抖音退出
                    //此处功能和set.js内的功能重复，以set.js里面的为准，此处空着，防止功能冲突
                } else {
                    location.href = masterDomain + '/logout.html';
                }
            }
        };
    }

    $('.header').on('touchmove', function (e) {
        e.preventDefault();
    })

    if ($("#navlist").size() > 0) {
        var myscroll_nav = new iScroll("navlist", { vScrollbar: false });
        $('.header-search .dropnav').click(function () {
            var a = $(this), header = a.closest('.header');
            if (!header.hasClass('open')) {
                toggleDragRefresh('off');
                header.addClass('open');
                $('.btmMenu').hide();
                $('.fixFooter').hide();
                $('#navBox').css({ 'top': '0.9rem', 'bottom': '0' }).show();
                var device = navigator.userAgent;
                if (device.indexOf('huoniao_iOS') > -1) {
                    // $('#navBox').css({'top':'calc(0.9rem + 20px)', 'bottom':'0'});
                    $('#navBox').css({ 'top': '0', 'bottom': '0' });
                }
                $('#navBox .bg').css({ 'height': '100%', 'opacity': 1 });
                myscroll_nav.refresh();
            } else {
                toggleDragRefresh('on');
                header.removeClass('open');
                closeShearBox();
            }
        })

    }

    if ($("#navlist_4").size() > 0) {
        var isloadnav = false;
        var myscroll_nav = new iScroll("navlist_4", { vScrollbar: false });
        $('.header-search .dropnav').click(function () {
            var a = $(this), header = a.closest('.header');
            if (!header.hasClass('open')) {
                toggleDragRefresh('off');
                header.addClass('open');
                $('.btmMenu').hide();
                $('.fixFooter').hide();
                $('#navBox_4').css({ 'top': '0', 'bottom': '0' }).show();

                if (!isloadnav) {
                    isloadnav = true;
                    $('#navBox_4').find('img').each(function () {
                        var navimg_src = $(this).data('src');
                        $(this).attr('src', navimg_src);
                    })
                }

                var device = navigator.userAgent;
                if (device.indexOf('huoniao_iOS') > -1) {
                    // $('#navBox').css({'top':'calc(0.9rem + 20px)', 'bottom':'0'});
                    $('#navBox_4').css({ 'top': '0', 'bottom': '0' });
                }
                $('#navBox_4 .bg').css({ 'height': '100%', 'opacity': 1 });
                myscroll_nav.refresh();

                if ($('#HN_PublicShare_shearBox').size() <= 0) {
                    $('.HN_PublicShare').attr('style', 'display: none!important;');
                }
            } else {
                toggleDragRefresh('on');
                header.removeClass('open');
                closeShearBox();
            }
        })

    }

    //如果没有菜单内容，则隐藏APP端右上角菜单
    if (device.indexOf('huoniao') > -1 && ($('.dropnav').size() == 0 || $('#navlist_4').size() == 0)) {
        setTimeout(function () {
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler('hideAppMenu', {}, function () { });
            });
        }, 500);
    }

    if (typeof huoniao.checkhtml === "function") {
        huoniao.checkhtml();
    }

    $('#cancelNav').click(function () {
        closeShearBox();
    })


    $('#shearBg').click(function () {
        closeShearBox();
    })

    $('#navlist li').click(function () {
        setTimeout(function () {
            closeShearBox();
        }, 500);
    })

    //模块链接跳原生
    $('#navlist_4').delegate('a', 'click', function (e) {
        var t = $(this), name = t.attr('data-name'), code = t.attr('data-code'), href = t.attr('href');
        if (href != 'javascript:;' && device.indexOf('huoniao') > -1) {
            e.preventDefault();
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler('redirectNative', { 'name': name, 'code': code, 'link': href }, function () { });
            });
        }
    });


    function closeShearBox() {
        $('.fixFooter').show();
        $('.header').removeClass('open');
        $('#navBox').hide();
        $('#navBox .bg').css({ 'height': '0', 'opacity': 0 });
    }


    // 清除列表cookie
    $('#navlist_4 li').click(function () {
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
    if (typeof JubaoConfig != "undefined" && JubaoConfig.module != 'shop' && JubaoConfig.module != 'waimai' && JubaoConfig.module != 'tuan' && JubaoConfig.module != 'travel') {
        $('.HN_Jubao').show();
    }else{
        $('.HN_Jubao').hide();
    }
    if (typeof JubaoConfig == "undefined") {
        $('.HN_Jubao').hide();
    }

    // 举报
    $('body').delegate('.HN_Jubao','click',function () {
        if (JubaoConfig) {
            if($('.Jubao-' + JubaoConfig.module).length){
                $('.Jubao-' + JubaoConfig.module).show();
            }else{
                $('.Jubao-member').show();
            }
            $(".JubaoBox").css('display','block')
            setTimeout(function(){
                $(".JubaoBox").css('transform', 'translateY(0)');
            },100)
            JuMask.addClass('show');
            $('html').addClass('noscroll');
        }

    })

    // 关闭举报
    $('.JubaoBox .JuClose, .JuMask').click(function () {
        $(".JubaoBox").css('transform', 'translateY(100%)');
        JuMask.removeClass('show');
        setTimeout(function(){
            $(".JubaoBox").css('display','none')
        },300)
        $('html').removeClass('noscroll')
    })


    // 选择举报类型
    // $('.JuSelect li').click(function(){
    //   var t = $(this), dom = t.hasClass('active');
    //   t.siblings('li').removeClass('active');
    //   if (dom) {
    //     t.removeClass('active');
    //   }else {
    //     t.addClass('active');
    //   }
    // })

    // 举报提交
    // $('.JubaoBox-submit').click(function(){
    //   var t = $(this);
    //   if(t.hasClass('disabled')) return;
    //   if ($('.JuSelect .active').length < 1) {
    //     showErr(langData['siteConfig'][24][2]);  //请选择举报类型
    //   }else if ($('#JubaoTel').val() == "") {
    //     showErr(langData['siteConfig'][20][459]);  //请填写您的联系方式
    //   }else {

    //     var type = $('.JuSelect .active').text();
    //     var desc = $('.JuRemark textarea').val();
    //     var phone = $('#JubaoTel').val();

    //     if(JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0){
    //       showErr('Error!');
    //       setTimeout(function(){
    //         JubaoBox.hide();
    //         JuMask.removeClass('show');
    //       }, 1000);
    //       return false;
    //     }

    //     t.addClass('disabled').html('loading...');

    //     $.ajax({
    //       url: masterDomain+"/include/ajax.php",
    //       data: "service=member&template=complain&module="+JubaoConfig.module+"&dopost="+JubaoConfig.action+"&aid="+JubaoConfig.id+"&type="+encodeURIComponent(type)+"&desc="+encodeURIComponent(desc)+"&phone="+encodeURIComponent(phone),
    //       type: "GET",
    //       dataType: "jsonp",
    //       success: function(data){
    //         t.removeClass('disabled').html(langData['siteConfig'][6][151]);  //提交
    //         if (data && data.state == 100) {
    //           showErr(langData['siteConfig'][21][242]);  //举报成功！
    //           setTimeout(function(){
    //             JubaoBox.hide();
    //             JuMask.removeClass('show');
    //           }, 1500);

    //         }else{
    //           showErr(data.info);
    //         }
    //       },
    //       error: function(){
    //         t.removeClass('disabled').html(langData['siteConfig'][6][151]);  //提交
    //         showErr(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
    //       }
    //     });

    //   }
    // });


    // 举报提交
    $('.JubaoBox-submit').click(function () {
        var t = $(this);

        if ($('.JubaoBox .juChose').length == 0) {
            $(".JuReason .tip-line").addClass('focusIn red');
            setTimeout(function () {
                $(".JuReason .tip-line").removeClass('focusIn');
            }, 900)
        } else {
            $(".JuReason .tip-line").removeClass('red');
        }

        if ($('#Ju_tel').val() == "") {
            tip = $("#Ju_tel").closest('dl').find('.tip-line')
            tip.addClass('focusIn red');
            setTimeout(function () {
                tip.removeClass('focusIn');
            }, 900)
        } else {
            tip = $("#Ju_tel").closest('dl').find('.tip-line')
            tip.removeClass('red');
        }
        if (t.hasClass('JuDisabled')) return;

        if ($('.JubaoBox .juChose').length == 0) {
            showErrAlert(langData['siteConfig'][24][2]);  //请选择举报类型
        } else if ($('#Ju_tel').val() == "") {
            showErrAlert(langData['siteConfig'][20][459]);  //请填写您的联系方式
        } else {

            // var type = $('.JuSelect .active').text();
            var type = $('.JubaoBox .juChose').text();
            var desc = $('#JuDesc').val();
            var phone = $('#Ju_tel').val();
            var areaCode = $(".Ju_areaCode").attr('data-code');
            if (JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0) {
                showErrAlert('Error!');
                setTimeout(function () {
                    $(".JubaoBox").css('transform', 'translateY(100%)');
                    JuMask.removeClass('show');
                }, 1000);
                return false;
            }

            t.addClass('JuDisabled').html('loading...');

            $.ajax({
                url: masterDomain + "/include/ajax.php",
                data: "service=member&template=complain&module=" + JubaoConfig.module + "&dopost=" + JubaoConfig.action + "&aid=" + JubaoConfig.id + "&areaCode=" + areaCode + "&type=" + encodeURIComponent(type) + "&desc=" + encodeURIComponent(desc) + "&phone=" + encodeURIComponent(phone),
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    $('html').removeClass('noscroll')
                    t.removeClass('disabled').html(langData['siteConfig'][6][151]);  //提交
                    if (data && data.state == 100) {
                        showSuccessTip('举报提交成功', '', '/static/images/jubao/gou.png', 'vertical');
                        $('.JuReason li').removeClass('juChose');
                        $("#JuDesc,#Ju_tel").val('')
                        setTimeout(function () {
                            $(".JubaoBox").css('transform', 'translateY(100%)');
                            JuMask.removeClass('show');
                        }, 1500);

                    } else {
                        showErrAlert(data.info);
                    }
                },
                error: function () {
                    $('html').removeClass('noscroll')
                    t.removeClass('JuDisabled').html(langData['siteConfig'][6][151]);  //提交
                    showErrAlert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
                }
            });

        }
    });


    //apptitle
    var apptitle = $('meta[name="apptitle"]');
    if (apptitle.length > 0 && apptitle[0].content && (window.__wxjs_environment == 'miniprogram' || isbaidu || isQQ || isBytemini)) {
        document.title = apptitle[0].content;
    }

    //在线联系
    var userinfo, toUserinfo, chatToken, toChatToken;

    //创建websocket
    var kumanIMLib = function (wsHost) {

        var lib = this;

        this.timeOut = 30000;  // 每30秒发送一次心跳
        this.timeOutObj = null;

        // 重置心跳
        this.reset = function () {
            clearTimeout(this.timeOutObj);
            lib.start();
        }

        // 启动心跳
        this.start = function () {
            lib.timeOutObj = setInterval(function () {
                lib.socket.send('HeartBeat');
            }, lib.timeOut);
        }

        // 初始化连接
        if (window['WebSocket']) {
            this.socket = new WebSocket(wsHost);
            //this.socket.onopen = this.evt.onopen;  // 连接成功

            // 关闭
            this.socket.onclose = function () {
                lib.socket = new WebSocket(lib.socket.url);
            };

            // 异常
            this.socket.onerror = function () {
                this.close();
            };

            // 收到消息
            this.socket.onmessage = function (evt) {
                lib.reset();  //重置心跳
                var msg = JSON.parse(evt.data);
                switch (msg.type) {
                    case "init":
                        console.log(msg.info.content);
                        break;
                    default:
                        if (userinfo['uid'] == msg.info.to && msg.info.type == 'member') {

                        }
                        break;
                }

            };

        } else {
            alert('您的浏览器不支持WebSockets.');
            return false;
        }

        this.start();  //启动心跳检测

    };

    //获取token
    function getToken(id) {
        if (!id) {
            id = '';
        }
        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=getImToken&userid=' + id,
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (data.state == 100) {
                    var info = data.info;
                    //创建连接
                    if (!id) {
                        userinfo = info;
                        chatToken = info.token;
                        chatServer = info.server;
                        AccessKeyID = info.AccessKeyID;
                        chatLib = new kumanIMLib(chatServer + "?AccessKeyID=" + AccessKeyID + "&token=" + chatToken + "&type=member");

                    } else {
                        toUserinfo = info;
                        toChatToken = info.token;
                    }
                } else if (data.info != 'No data!') {
                    alert(data.info);
                    window.location.href = masterDomain + '/login.html';
                    return false;
                }

            },
            error: function () {
                console.log('网络错误，初始化失败！');
            }
        });
    }

    function msgto(msg, type) {
        console.log(userinfo);
        var time = Math.round(new Date().getTime() / 1000).toString();
        var data = {
            content: msg,
            contentType: type,
            from: chatToken,
            fid: userinfo['uid'],
            to: toChatToken,
            tid: toUserinfo['uid'],
            type: "person",
            time: time
        }
        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=sendImChat',
            data: data,
            type: 'post',
            dataType: 'json',
            success: function (data) {
                chatLib.reset();
            },
            error: function () {

            }
        });
    }

    if (typeof (imconfig) != "undefined") {
        var userid = $.cookie(cookiePre + "login_user");
        if (userid != null && userid != "") {
            getToken(imconfig.chatid);  //获取当前信息发布人的聊天Token
            getToken();  //获取当前登录用户的聊天Token
        }
    }

    $('.chat_to-Link').click(function () {
        var type = $(this).attr('data-type');
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            window.location.href = masterDomain + '/login.html';
            return false;
        }

        if (imconfig['imgUrl'] == '') {
            imconfig['imgUrl'] = shareAdvancedUrl;
        }

        /*
         1.获取自己的token
         2.获取好友的token
         3.发送消息
         4.跳转链接
         * */
        if (type == 'detail') {
            msgto(imconfig, 'link');
        } else if (type == "orderlist") {//订单列表中 多个用户
            var tmod = $(this).attr('data-mod'),
                tchatid = $(this).attr('data-chatid'),
                ttitle = $(this).attr('data-title'),
                tprice = $(this).attr('data-price'),
                timgUrl = $(this).attr('data-img'),
                tordernum = $(this).attr('data-ordernum'),
                tcount = $(this).attr('data-count'),
                tsdate = $(this).attr('data-sdate'),
                tlink = $(this).attr('data-link');
            var listimconfig = {
                'mod': tmod,
                'chatid': tchatid,
                'title': ttitle,
                "price": '<em>' + echoCurrency('symbol') + '</em>' + tprice,
                "imgUrl": timgUrl,
                "link": tlink,
                "ordernum": tordernum,
                "orderdate": tsdate,
                "ordercount": tcount,

            };
            getToken(tchatid);
            console.log(userinfo);

            setTimeout(function () {
                msgto(listimconfig, 'orderlist');
            }, 500)


        }
        // 更新房产用户联系经纪人
        if (imconfig.mod && imconfig.mod == 'house' && type == 'detail') {
            updateContact(imconfig.chatid, page_type, imconfig.title);
        }
        // 更新婚嫁用户咨询套餐
        if (imconfig.mod && imconfig.mod == 'marry' && type == 'detail') {
            updatemarryContact(imconfig.chatid, imconfig.usertel, imconfig.title, imconfig.username);
        }

        if (device.indexOf('huoniao') > -1 && userinfo && toUserinfo) {
            var param = {
                from: userinfo['uid'],
                to: toUserinfo['uid'],
            };
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler('invokePrivateChat', param, function (responseData) {
                    console.log(responseData)
                });
            });
            return false;
        } else {
            if (type == "orderlist") {
                setTimeout(function () {
                    window.location.href = user_member + '/im/chat-' + toUserinfo['uid'] + '.html'
                }, 800)
            } else {
                window.location.href = user_member + '/im/chat-' + toUserinfo['uid'] + '.html'
            }

        }

    });

    function updateContact(id, type, title) {
        var houseid = pageData ? pageData.id : '';
        if (houseid != '') {
            $.ajax({
                url: '/include/ajax.php?service=house&action=updateContactlog&jzuid=' + id + '&aid=' + houseid + '&title=' + title + '&type=' + type,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {

                    }
                },
                error: function (data) { },
            });
        }
    }

    function updatemarryContact(id, tel, title, name) {

        if (id != '') {
            $.ajax({
                url: '/include/ajax.php?service=marry&action=updateContactlog&jzuid=' + id + '&username=' + name + '&tel=' + tel + '&title=' + title,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {

                    }
                },
                error: function (data) { },
            });
        }
    }


    // 显示举报
    function JubaoShow() {
        JubaoBox.show();
        var jubaoHeight = JubaoBox.height();
        JubaoBox.css('margin-top', -(jubaoHeight / 2));
    }

    // 显示错误
    function showErr(txt) {
        $('.JuError').text(txt).show();
        setTimeout(function () {
            $('.JuError').fadeOut();
        }, 2000)
    }

    //判断是否为合法安全域名
    function checkSecureDomain(href, e) {

        //是否为点击内容图片放大插件
        var isPhotoSwipe = false;
        if ($(e.target).attr('data-size') != undefined && $(e.target).attr('data-med') != undefined) {
            isPhotoSwipe = true;
        }

        if (href != '' && href != 'javascript:;' && href != 'javascript:void(0);' && href != undefined && href != '#' && href != '###' && href.indexOf('wxMiniprogram') < 0 && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0 && typeof cfg_secure_domain != 'undefined' && cfg_secure_domain.length > 0 && window.location.pathname != '/middlejump.html' && href.indexOf('http') > -1 && href.indexOf('/include') < 0 && !isPhotoSwipe) {
            var hasSecureDomain = false, href = href.split("?")[0];
            for (var i = 0; i < cfg_secure_domain.length; i++) {
                var secure_domain = $.trim(cfg_secure_domain[i]);
                if (!hasSecureDomain) {
                    //不设置安全域名
                    if (secure_domain == '*') {
                        hasSecureDomain = true;
                    } else if (secure_domain != '') {
                        hasSecureDomain = href.indexOf(secure_domain) > -1;
                    }
                }
            }
            return hasSecureDomain;
        }
        return true;
    }


    //重置小程序中所有a链接
    // $('body').delegate('a', 'click', function(e){
    //     if(wx_miniprogram){
    //         var t = $(this), url = t.attr('data-url') ? t.attr('data-url') : t.attr('href'), href = url.toLowerCase();
    //         if(href != '' && href != 'javascript:;' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0){
    //             e.preventDefault();
    //             wx.miniProgram.navigateTo({url: '/pages/redirect/index?url=' + encodeURIComponent(url)});
    //         }

    //     }
    // });
    var wxmini_click = 0, bdmini_click = 0, qqmini_click = 0, bytemini_click = 0;
    $('body').delegate('a', 'click', function (e) {

        var t = $(this), url = t.attr('data-url') || t.attr('href') || '', href = url.toLowerCase(), a_domain = t.attr('data-domain') ? 1 : 0;
        if (t.hasClass('appMapBtn')) return false;
        let is_footer = t.closest('.footer_4_3').length > 0 ? true : false; // 是底部按钮
        if((url.indexOf('appFullScreen') > -1 || url.indexOf('appindex') > -1  || url.indexOf('appIndex') > -1)&& device.indexOf('huoniao_iOS') == -1){
            // 表示不是app端 需要将此参数删除
            let params = url.split('?').length > 1 ? url.split('?')[1] : '';
            if(params){
                let paramsArr = params.split('&');
                for(let i = 0; i < paramsArr.length; i++){
                    if(paramsArr[i].indexOf('appFullScreen') > -1 || paramsArr[i].indexOf('appIndex') > -1|| paramsArr[i].indexOf('appindex') > -1){
                        paramsArr.splice(i,1,'');
                    }
                }
                paramsArr = paramsArr.filter(item => item);
                url = url.split('?')[0] + '?' + paramsArr.join('&');
                // href = url.toLowerCase()
                href = url
                if(t.attr('href') != 'javascript:;'){
                    t.attr('href', href);
                }
                if(t.attr('data-url')){
                    t.attr('data-url', href);
                }
            }
        }
        if(typeof(cfg_hotLine) != 'undefined' && href.indexOf('work.weixin.qq.com/kfid') > -1 && device.indexOf('huoniao_Android') <= -1 && device.indexOf('huoniao_iOS') > -1){
            location.href = 'tel:' + cfg_hotLine
            return false;
        }
        //判断是否为站外链接
        if (!checkSecureDomain(href, e)) {
            e.preventDefault();
            console.log('第三方网站链接：' + href);
            var newHref = masterDomain + '/middlejump.html?target=' + encodeURIComponent(href);

            if (wx_miniprogram) {
                wx.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(newHref) });
            } else if (isBytemini) {
                // tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(newHref) });
            } else {
                window.open(newHref, "_blank");
            }
            return false;
        }

        if (url.indexOf('wxMiniprogram://') > -1) {
            if (!isWeixin && device.indexOf('huoniao_iOS') <= -1 && device.indexOf('huoniao_Android') <= -1) {
                showErrAlert('请在微信中打开页面');
                return false;
            } else if ((device.indexOf('huoniao_iOS') > -1 || device.indexOf('huoniao_Android') > -1) && url.indexOf('https://') < 0 && url.indexOf('http://') < 0) {
                var ahref = url.replace('wxMiniprogram://', "");
                var miniId = ahref.split('?/')[0],  //小程序原始id
                    path = ahref.split('?/')[1];  //跳转的路径
                miniId = miniId.split('/')[0];

                path = path == undefined ? '' : path;

                setupWebViewJavascriptBridge(function (bridge) {
                    if (path && path.indexOf('huoniao/') > -1) {
                        bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': path.replace('huoniao/', '/pages/redirect/index?url=/') }, function (responseData) { });
                    } else {
                        bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': path }, function (responseData) { });
                    }

                });
            } else if (isWeixin && wx_for && window.__wxjs_environment != 'miniprogram' && t.find(".h5Toweapp").length == 0) {
                t.css({
                    'display': 'block',
                    'position': 'relative',
                });
                var ahref = url.replace('wxMiniprogram://', "");
                var miniId = ahref.split('?/')[0],
                    path = ahref.split('?/')[1];  //跳转的路径
                miniId = miniId.split('/')[0];  //小程序原始id

                path = path == undefined ? '' : path;

                //自己的小程序，直接跳走
                if (typeof miniProgramAppid != 'undefined' && miniProgramAppid == miniId) {
                    wx.miniProgram.navigateTo({ url: path });
                } else {
                    wxOpentag(t, miniId, path);
                }
                return false;
            } else if (wx_miniprogram) {

                var ahref = url.replace('wxMiniprogram://', "");
                var miniId = ahref.split('?/')[0],
                    path = ahref.split('?/')[1];  //跳转的路径
                miniId = miniId.split('/')[0];  //小程序原始id

                //自己的小程序，直接跳走
                if (typeof miniProgramAppid != 'undefined' && miniProgramAppid == miniId) {
                    wx.miniProgram.navigateTo({ url: path });
                    return false;
                }
            }

        }

        // 判断是否登陆页面，微信小程序
        if (url.indexOf('login.html') > -1 && wx_miniprogram && typeof(cfg_useWxMiniProgramLogin) != 'undefined' && cfg_useWxMiniProgramLogin) {
            let locationTo = location.href.replace('forcelogout','')
            wx.miniProgram.navigateTo({ url: '/pages/login/index?url=' + encodeURIComponent(locationTo) + '&back=1&fromShare=' + $.cookie('HN_fromShare') });
            return false;
        }

        // 判断是否登陆页面，字节小程序
        if (url.indexOf('login.html') > -1 && isBytemini) {
             let locationTo = location.href.replace('forcelogout','')
            tt.miniProgram.navigateTo({ url: '/pages/login/index?path=' + encodeURIComponent(locationTo) + '&back=1&fromShare=' + $.cookie('HN_fromShare') });
            return false;
        }


        var foot = t.closest('.footer_4_3').length;  //是否是底部导航按钮
        var fmod = '';
        if (foot && wx_miniprogram) {
            var li = t.closest('li.ficon')
            fmod = t.closest('.footer_4_3').attr('data-title') == 'siteConfig' && li.index() == 1;

            //首页跳转
            if (typeof masterDomain != 'undefined') {
                var hrefArr = url.split('?');
                var href = hrefArr[0];
                if (href == masterDomain) {
                    wx.miniProgram.redirectTo({ url: '/pages/index/index' });
                    return;
                }
            }

        }
        if (a_domain) return false;
        if ((href.indexOf('login') > -1 || href.indexOf('logout') > -1)&&href.indexOf('loginbytoken')==-1) { //小程序会带上wxminiprogramloginbytoken
            location.href = href;
            return false;
        }
        var miniPath = t.attr('data-mini'); //跳小程序
        if (wx_miniprogram && miniPath && miniPath != '') {
            wx.miniProgram.redirectTo({ url: miniPath });
            return false;
        }

        if (isBytemini && miniPath && miniPath != '') {
            tt.miniProgram.redirectTo({ url: miniPath });
            return false;
        }
        if (t.hasClass('toMini') && device.indexOf('huoniao_Android') > -1) { //跳安卓手机 原生页面
            var temp = t.attr('data-temp'), moduleName = t.attr('data-module'), id = t.attr('data-id'), href = t.attr('href');
            var typename = t.attr('data-typename') ? t.attr('data-typename') : ""
            var keyword = t.attr('data-keyword') ? t.attr('data-keyword') : "";
            var type = t.attr('data-type') ? t.attr('data-type') : "";
            var pagetype = '';
            if (href.indexOf('pagetype=') > -1 && moduleName == 'shop' && href.indexOf('pagetype=') > -1) {
                pagetype = href.split('pagetype=')[1].split('&')[0];
                if (href.indexOf('search_list') > -1) {
                    temp = 'list';
                }

            }


            // if (appInfo && appInfo.version != '' && ((compare('5.7', appInfo.version) && moduleName != 'sfcar') || (compare('6.4.5', appInfo.version) && moduleName == 'sfcar')) && href != 'javascript:;') {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler("redirectTo", { "module": moduleName, "templates": temp, "id": id, "url": href, "type": type, "typename": typename, "name": typename, "keyword": keyword, "pagetype": pagetype }, function (responseData) { });
                })
            // }
            return false;
        }


        if (t.closest('.bigImg-box').size() > 0) {
            return false;
        }

        // if (wx_miniprogram && !wxmini_click && (!foot || fmod)) {
        if (wx_miniprogram && !wxmini_click && (!foot || fmod)) {

            wxmini_click = 1;
            if (href != '' && href != 'javascript:;' && href != 'javascript:void(0);' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0 && href.indexOf('currentpageopen') < 0) {
                e.preventDefault();
                if (href.indexOf('miniprogramlive_') > -1) {
                    wx.miniProgram.navigateTo({ url: '/pages/live/detail?roomid=' + href.replace('miniprogramlive_', '') });
                } else if (href.indexOf('wxminiprogram://') > -1) { //小程序跳转第三方小程序
                    var ahref = url.replace('wxMiniprogram://', "");
                    var miniId = ahref.split('?/')[0],  //小程序原始id
                        ghId = miniId.split('/')[0],
                        appid = miniId.split('/')[1],
                        path_to = ahref.split('?/').length > 1 ? ahref.split('?/')[1] : "";  //跳转的路径
                    path_to = path_to != '' ? ('||' + path_to) : ""
                    var param = appid + path_to;
                    var path = '/pages/openxcx/openxcx?appid=' + param;
                    wx.miniProgram.navigateTo({ url: path }) // 注意appid是 gh  开头的那个
                } else if (href.indexOf('work.weixin.qq.com/kfid') > -1) { //小程序跳转客服
                    var link = href.split('?id=')[0],  //客服链接
                        id = href.split('?id=')[1];  //企业ID
                    var path = '/pages/openkf/openkf?url=' + encodeURIComponent(link) + '&id=' + id;
                    wx.miniProgram.navigateTo({ url: path });

                } else {
                    if (t.hasClass('toMini')) {
                        var temp = t.attr('data-temp'), moduleName = t.attr('data-module'), id = t.attr('data-id');
                        var link = moduleName == 'member' || moduleName == 'index' ? `/pages/${moduleName}/${temp}` : `/pages/packages/${moduleName}/${temp}/${moduleName=='article'?'index':temp}`;
                        var a_version = t.attr('data-version'), a_needversion = t.attr('data-needversion');
                        let urlParam=t.attr('data-param'); //其他必要参数，格式：a=111&b=222&c=33
                        let linkType=Boolean(t.attr('data-link'))?'redirectTo':'navigateTo'; //使用用页面跳转方式(navigate和redirect)
                        if (id && id != 'undefined') {
                            link += `?id=${id}`;
                        }
                        if(urlParam){
                            link+=`?${urlParam}`;
                        }
                        link=link.replace(/[?]/g,'&').replace('&','?');
                        // 携带城市分站
                        var currCityInfo = $.cookie('HN_siteCityInfo');
                        if (currCityInfo) {
                            currCityInfo = JSON.parse(currCityInfo);
                            if (link.indexOf('?') <= -1) {
                                link = link + '?cityid=' + currCityInfo.cityid + '&cityname=' + currCityInfo.name
                            } else {
                                link = link + '&cityid=' + currCityInfo.cityid + '&cityname=' + currCityInfo.name
                            }
                        }
                        // 是否启用原生页面
                        let bool=miniprogram_native_module.includes(moduleName);
                        if(bool || (link.indexOf('/pages/') > -1 && link.indexOf('https') < 0)){
                            //是否指定版本
                            if (a_version != undefined && a_needversion != undefined) {
                                a_version = a_version.replace('v', '');
                                a_needversion = a_needversion.replace('v', '');
                                if (compare(a_needversion, a_version)) {
                                    wx.miniProgram[linkType]({ url: link });
                                } else {
                                    wx.miniProgram[linkType]({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) });
                                }
                            } else {
                                wx.miniProgram[linkType]({ url: link });
                            }
                        }else{
                            wx.miniProgram[linkType]({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) });
                        }
                    } else {

                        //首页跳转
                        if (typeof masterDomain != 'undefined') {
                            var hrefArr = url.split('?');
                            var href = hrefArr[0];
                            if (href == masterDomain) {
                                wx.miniProgram.redirectTo({ url: '/pages/index/index' });
                                return;
                            }
                        }

                        wx.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) });
                    }
                }
            } else {
                // if(href != '' && href != 'javascript:;' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0){
                //                 location.href = url;
                //             }
            }
        } else {
            // 抖音小程序
            // alert(baidu_miniprogram)
            if (isBytemini && !bytemini_click && (!foot || fmod)) {
                bytemini_click = 1;
                if (href != '' && href != 'javascript:;' && href != 'javascript:void(0);' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0 && href.indexOf('currentpageopen') < 0) {
                    e.preventDefault();
                    //? => huoniaowh
                    //& => huoniaolj
                    //= => huoniaodh
                    if (href.indexOf('tuan') > -1 && href.indexOf('detail') > -1 && href.indexOf('orderdetail') == -1 && href.indexOf('sqdetail') == -1) {
                        var ttid = (href.split('-')[1]).split('.')[0]
                        tt.miniProgram.navigateTo({ url: '/pages/packages/tuan/detail/detail?id=' + ttid });
                    } else if (href.indexOf('info') > -1) { //分类信息
                        if (href.indexOf('/detail') > -1) { //详情页
                            let id = t.attr('data-id');
                            tt.miniProgram.navigateTo({ url: '/pages/packages/info/detail/detail?id=' + id });
                        } else {
                            tt.miniProgram.navigateTo({ url: '/pages/packages/info/index/index' });
                        }
                    } else if (href.indexOf('/job') > -1 && href.indexOf('id=') == -1) { //招聘
                        tt.miniProgram.navigateTo({ url: '/pages/packages/job/index/index' });
                    } else if (t.hasClass('toMini')) {
                        var temp = t.attr('data-temp'), moduleName = t.attr('data-module'), id = t.attr('data-id');
                        var link = moduleName == 'member' ? `/pages/${moduleName}/${temp}` : `/pages/packages/${moduleName}/${temp}/${moduleName=='article'?'index':temp}`;
                        var a_version = t.attr('data-version'), a_needversion = t.attr('data-needversion');
                        if (moduleName == 'shop') {
                            tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) });
                        } else {

                            if (id && id != 'undefined') {
                                link = link + '?id=' + id;
                            }

                            // 携带城市分站
                            var currCityInfo = $.cookie('HN_siteCityInfo');
                            if (currCityInfo) {
                                currCityInfo = JSON.parse(currCityInfo);
                                if (link.indexOf('?') <= -1) {
                                    link = link + '?cityid=' + currCityInfo.cityid + '&cityname=' + currCityInfo.name
                                } else {
                                    link = link + '&cityid=' + currCityInfo.cityid + '&cityname=' + currCityInfo.name
                                }
                            }
                            // 是否启用原生页面
                            let bool=miniprogram_native_module.includes(moduleName);
                            if(bool){
                                //是否指定版本
                                if (a_version != undefined && a_needversion != undefined) {
                                    a_version = a_version.replace('v', '');
                                    a_needversion = a_needversion.replace('v', '');
                                    if (compare(a_needversion, a_version)) {
                                        tt.miniProgram.navigateTo({ url: link });
                                    } else {
                                        tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) });
                                    }
                                } else {
                                    tt.miniProgram.navigateTo({ url: link });
                                }
                            }else{
                                tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) });
                            }
                        }
                    } else {
                        tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url.replace('?', 'huoniaowh').replace(/\&/g, 'huoniaolj').replace(/\=/g, 'huoniaodh')) });
                    }




                } else {
                    // if(href != '' && href != 'javascript:;' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0){
                    //                 location.href = url;
                    //             }
                }
            }
            // 百度小程序
            // alert(baidu_miniprogram)
            else if (isbaidu && !bdmini_click && (!foot || fmod)) {
                bdmini_click = 1;
                if (href != '' && href != 'javascript:;' && href != 'javascript:void(0);' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0 && href.indexOf('currentpageopen') < 0) {
                    e.preventDefault();
                    //? => huoniaowh
                    //& => huoniaolj
                    //= => huoniaodh
                    swan.webView.navigateTo({ url: '/pages/redirect/redirect?url=' + encodeURIComponent(url.replace('?', 'huoniaowh').replace(/\&/g, 'huoniaolj').replace(/\=/g, 'huoniaodh')) });

                } else {
                    // if(href != '' && href != 'javascript:;' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0){
                    //                 location.href = url;
                    //             }
                }

                //QQ小程序
            } else {
                // alert(qq_miniprogram+'~'+ !qqmini_click+'~'+(!foot || fmod))
                if (qq_miniprogram && !qqmini_click && (!foot || fmod)) {
                    qqmini_click = 1;
                    if (href != '' && href != 'javascript:;' && href != 'javascript:void(0);' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0 && href.indexOf('currentpageopen') < 0) {
                        e.preventDefault();
                        qq.miniProgram.navigateTo({ url: '/pages/redirect/redirect?url=' + encodeURIComponent(url) });
                    }

                } else {

                    if (href.indexOf('miniprogramlive_') > -1 && !wx_miniprogram && !baidu_miniprogram) {

                        //APP端
                        if (device.indexOf('huoniao') > -1) {
                            setupWebViewJavascriptBridge(function (bridge) {
                                bridge.callHandler('redirectToWxMiniProgram', { 'path': '/pages/live/detail?roomid=' + href.replace('miniprogramlive_', '') }, function (responseData) { });
                            });
                        } else {
                            location.href = "/include/json.php?action=getMiniProgramLive&id=" + href.replace('miniprogramlive_', '');
                        }
                        return false;
                    } else {
                    	// 取消注释
                        if(href != '' && href != 'javascript:;' && href != '#' && href != '###' && href.indexOf('.jpg') < 0 && href.indexOf('.gif') < 0 && href.indexOf('.png') < 0 && href.indexOf('.jpeg') < 0 && href.indexOf('tel:') < 0 && (device.indexOf('huoniao') < 0 || is_footer)){  //is_footer判断 是由于所有底部按钮链接改为data-url 没有a链接自动跳转了
                            let li = t.closest('li'),ind = li.index();
                            let code = li.attr('data-code')
                            if(is_footer && code && device.indexOf('huoniao') > -1){
                                setupWebViewJavascriptBridge(function (bridge) {
                                    bridge.callHandler('redirectNative', { 'name': '', 'code': code, 'link': url }, function () { });
                                });
                            }else{
                                location.href = url;
                            }
                        }
                    }
                }
            }
        }

        setTimeout(function () {
            wxmini_click = 0;
            bdmini_click = 0;
            qqmini_click = 0;
            bytemini_click = 0;
        }, 500); //此处延迟时间由1500 改为500 由于多次点击会出现无法跳转原生页面的问题

    });

    //城市下拉菜单自动选中当前城市
    var cityIdSelectObj = $('select#cityid');
    if (cityIdSelectObj.size() > 0 && (cityIdSelectObj.val() == 0 || cityIdSelectObj.val() == '')) {
        var cityInfo = $.cookie('HN_siteCityInfo');
        cityInfo = eval('(' + cityInfo + ')');
        var cityInfoID = cityInfo.cityid;
        cityIdSelectObj.find("option[value='" + cityInfoID + "']").attr("selected", 'selected');
        cityIdSelectObj.siblings('#cityid_dummy').val(cityInfo.name);
    }

    var cityIdSelectObj = $('select#city');
    if (cityIdSelectObj.size() > 0 && (cityIdSelectObj.val() == 0 || cityIdSelectObj.val() == '')) {
        var cityInfo = $.cookie('HN_siteCityInfo');
        cityInfo = eval('(' + cityInfo + ')');
        var cityInfoID = cityInfo.cityid;
        cityIdSelectObj.find("option[value='" + cityInfoID + "']").attr("selected", 'selected');
        cityIdSelectObj.siblings('#city_dummy').val(cityInfo.name);
    }

    //多域名同步登录
    var masterDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : "",
        channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
    if (masterDomainClean != "" && channelDomainClean != "" && channelDomainClean.indexOf(masterDomainClean) == -1) {
        channelDomainClean = channelDomainClean.split("/")[0];
        $("body").append('<iframe src="' + masterDomain + '/sso.html?site=' + channelDomainClean + '" style="display:none;"></iframe>');
    }


    //内容页增加快速导航
    var pathname = location.pathname, pathnameArr = pathname.split('/'), pathfile = pathnameArr[pathnameArr.length - 1];
    var siteCityInfo = eval('(' + $.cookie('HN_siteCityInfo') + ')'), fastNav_cityid = siteCityInfo && siteCityInfo ? siteCityInfo.cityid : '';

    //延迟500ms加载
    setTimeout(function () {
        //不需要显示的页面
        if (
            pathname != '' &&
            pathname != 'index.html' &&
            pathname != '/' &&
            location.href.indexOf('changecity') < 0 &&
            location.href.indexOf('login') < 0 &&
            location.href.indexOf('register') < 0 &&
            location.href.indexOf('complain') < 0 &&
            location.href.indexOf('sso') < 0 &&
            location.href.indexOf('logout') < 0 &&
            location.href.indexOf('fpwd') < 0 &&
            location.href.indexOf('resetpwd') < 0 &&
            location.href.indexOf('memberVerifyEmail') < 0 &&
            location.href.indexOf('memberVerifyPhone') < 0 &&
            location.href.indexOf('getUserInfo') < 0 &&
            location.href.indexOf('bindMobile') < 0 &&
            location.href.indexOf('suggestion') < 0 &&
            location.href.indexOf('order') < 0 &&
            location.href.indexOf('pay') < 0 &&
            location.href.indexOf('confirm') < 0 &&
            // location.href.indexOf('cart') < 0 &&
            location.href.indexOf('buy') < 0 &&
            // location.href.indexOf('waimai') < 0 &&
            location.href.indexOf('address') < 0 &&
            location.href.indexOf('map') < 0 &&
            location.href.indexOf('fabu') < 0 &&
            location.href.indexOf('h_detail') < 0 &&
            location.href.indexOf('sharePage') < 0 &&
            location.href.indexOf('.html') > 0 &&
            location.href.indexOf('/u/') < 0 &&
            location.href.indexOf('/b/') < 0
        ) {
            huoniao.operaJson('/include/ajax.php', 'service=siteConfig&action=getFastNavigationRule&cityid=' + fastNav_cityid, function (data) {
                if (data && data.state == 100) {
                    var info = data.info, busiDomain = info.member.busiDomain, userDomain = info.member.userDomain, fabuArr = info.fabu, cartArr = info.cart;
                    var weixin = info.weixin, qr = weixin.qr, name = weixin.name, mQr = weixin.mQr, mName = weixin.mName;

                    //不需要的页面
                    if (
                        location.href.indexOf(busiDomain + '/') < 0 &&
                        location.href.indexOf(userDomain + '/') < 0
                    ) {

                        var liArr = [];
                        liArr.push('<li class="f-homePage"><a href="' + info.basehost + '">' + langData['siteConfig'][0][0] + '</a></li>');  //首页

                        if (qr || mQr) {
                            liArr.push('<li class="f-weChat"><a href="javascript:;">' + langData['siteConfig'][19][183] + '</a></li>');  //微信号


                            $('body').append('<div class="popupNavWechat">\n' +
                                '\t<div class="conWechat">\n' +
                                '\t\t<a href="javascript:;" class="closeWechat">×</a>\n' +
                                (qr ? '\t\t<dl><dt><img src="' + qr + '"></dt><dd>' + name + '<br>微信中长按识别</dd></dl>\n' : '') +
                                (mQr ? '\t\t<dl><dt><img src="' + mQr + '"></dt><dd>' + mName + '<br>微信中长按识别</dd></dl>\n' : '') +
                                '\t</div>\n' +
                                '</div>');

                        }

                        liArr.push('<li class="f-user"><a data-module="member" data-temp="member/index/index" class="toMini" href="' + userDomain + '">' + langData['siteConfig'][10][0] + '</a></li>');  //我的

                        //验证是否有发布需求
                        for (var i = 0; i < fabuArr.length; i++) {
                            if (location.href.indexOf(fabuArr[i].domain) > -1) {
                                liArr.push('<li class="f-fabu"><a href="' + fabuArr[i].link + '">' + langData['siteConfig'][11][0] + '</a></li>');  //发布
                                break;
                            }
                        }

                        //验证是否有购物车需求
                        for (var i = 0; i < cartArr.length; i++) {
                            if (location.href.indexOf(cartArr[i].domain) > -1) {

                                $('.wechat, .gocart, .my').remove();

                                liArr.push('<li class="f-cart"><a href="' + cartArr[i].link + '">' + langData['siteConfig'][22][12] + '</a></li>');  //发布
                                break;
                            }
                        }
                        var popcls = 'fn-hide';
                        if (typeof touch_poster != 'undefined') {   //如果有touch_poster,则需要显示按钮
                            popcls = '';
                            var userShareId = $.cookie((window.cookiePre ? window.cookiePre : 'HN_') + 'userid');
                            if (userShareId) {
                                var img = ($('.html2_qrcode').find('img').size() > 0) ? $('.html2_qrcode').find('img') : $('.html2_qrcode1').find('img');
                                var imgUrl = img.attr('src');
                                img.attr('src', imgUrl + "?fromShare=" + userShareId);
                            }
                            // $('body').append('<form id="poster_form" action="'+masterDomain+'/include/upload.inc.php?mod=siteConfig&type=card" method="post" target="iframe"><input type="hidden" id="poster_addr"></form>');
                            // getdetail_poster()

                        }

                        if (!isbaidu) {
                            $('body').append('<div class="popupRightBottom">\n' +
                                '    <a href="javascript:;" class="postFast ' + popcls + '" id="postFast"><em class="smsk"></em></a> \n' +
                                '    <div></div> \n' +
                                '    <div class="fastNav" id="fastNav">\n' +
                                '        <button><em class="smsk"></em></button>\n' +
                                '        <div class="slideMain"><div class="slideFastNav">\n' +
                                '            <a href="javascript:;" class="closeNav"><em class="smsk"></em></a>\n' +
                                '            <ul class="fn-clear">\n' + liArr.join('') +
                                '            </ul>\n' +
                                '        </div></div>\n' +
                                '    </div>\n' +
                                '    <div class="fastTop"><em class="smsk"></em><i></i></div>\n' +
                                '</div>');
                        }

                        //显示导航内容
                        $('body').delegate('.popupRightBottom button', 'click', function () {
                            var slideFastNav = $('.popupRightBottom .slideFastNav');
                            var fastNavBtn = $('.popupRightBottom .fastNav button');
                            var postNavBtn = $('.popupRightBottom .postFast');
                            var topNavBtn = $('.popupRightBottom .fastTop');
                            if (slideFastNav.hasClass('showNav')) {
                                $('.popupRightBottom .fastNav .slideMain').hide()
                                slideFastNav.addClass('hideNav');
                                fastNavBtn.removeClass('openNav');
                                topNavBtn.removeClass('hidefast');
                                postNavBtn.removeClass('hidefast');
                                setTimeout(function () {
                                    slideFastNav.removeClass('showNav');
                                    slideFastNav.removeClass('hideNav');
                                }, 200);
                            } else {
                                $('.popupRightBottom .fastNav .slideMain').show()
                                fastNavBtn.addClass('openNav');
                                slideFastNav.addClass('showNav').removeClass('hideNav');
                                topNavBtn.addClass('hidefast');
                                postNavBtn.addClass('hidefast');
                            }
                        });




                        //页面滚动
                        $(window).scroll(function () {
                            if ($('.popupRightBottom .fastNav button').hasClass('openNav')) {
                                $('.popupRightBottom .fastNav button').click()
                            }
                        });
                        // 生成海报
                        $(document).delegate('.postFast', 'click', function (e) {
                            $('html').addClass('noscroll')
                            $(".html2_mask").show();

                            //APP端取消下拉刷新
                            toggleDragRefresh('off');

                            getdetail_poster();
                        });

                        // 生成海报2
                        function getdetail_poster() {
                            if ($('.html2Wrap').size() > 0) {
                                var html2canvas_fixed = $('#html2canvas_fixed'), html2canvas_fixed_img = $('#html2canvas_fixed .html2_img img');

                                //生成带参数的微信二维码
                                //必须有微信分享信息和举报信息
                                if (wxconfig && JubaoConfig && html2canvas_fixed_img.size() == 0) {
                                    $.ajax({
                                        url: "/include/ajax.php",
                                        type: "POST",
                                        data: {
                                            service: 'siteConfig',
                                            action: 'getWeixinQrPost',
                                            module: JubaoConfig['module'],
                                            type: JubaoConfig['action'],
                                            aid: JubaoConfig['id'],
                                            title: wxconfig['title'],
                                            description: wxconfig['description'],
                                            imgUrl: wxconfig['imgUrl'],
                                            link: wxconfig['link']
                                        },
                                        async: false,
                                        dataType: "json",
                                        success: function (response) {
                                            if (response.state == 100) {
                                                if (response.info.indexOf('wxminProgram') > -1) {
                                                    if ($(".html2Wrap.newPoster .html2_qrcode .html2_qrcodeBox").size() > 0) {
                                                        $(".html2Wrap.newPoster .html2_qrcode .html2_qrcodeBox").html('<img src="' + response.info + '" />');
                                                    } else {
                                                        $(".html2Wrap .html2_qrcode").html('<img src="' + response.info + '" />');
                                                    }
                                                } else {
                                                    if ($(".html2Wrap.newPoster .html2_qrcode .html2_qrcodeBox").size() > 0) {
                                                        $(".html2Wrap.newPoster .html2_qrcode .html2_qrcodeBox").qrcode({
                                                            render: window.applicationCache ? "canvas" : "table",
                                                            width: $(".html2_qrcodeBox").width(),
                                                            height: $(".html2_qrcodeBox").height(),
                                                            text: toUtf8(response.info)
                                                        });
                                                    } else {
                                                        $(".html2Wrap .html2_qrcode").html('');
                                                        $(".html2Wrap .html2_qrcode").qrcode({
                                                            render: window.applicationCache ? "canvas" : "table",
                                                            width: $(".html2_qrcode").width(),
                                                            height: $(".html2_qrcode").height(),
                                                            text: toUtf8(response.info)
                                                        });
                                                    }
                                                }

                                                //    $('.html2_qrcode img, .html2_qrcode1 img').attr('src', '/include/qrcode.php?data=' + response.info);
                                            } else {
                                                $(".html2Wrap .html2_qrcode").html('');
                                                $(".html2Wrap .html2_qrcode").qrcode({
                                                    render: window.applicationCache ? "canvas" : "table",
                                                    width: $(".html2_qrcode").width(),
                                                    height: $(".html2_qrcode").height(),
                                                    text: toUtf8(wxconfig.link)
                                                });
                                                if ($(".html2_qrcode1").length > 0) {
                                                    var w = $(".html2_qrcode1").width(), h = $(".html2_qrcode1").height();
                                                    $(".html2Wrap .html2_qrcode1").html('');
                                                    $(".html2Wrap .html2_qrcode1").qrcode({
                                                        render: window.applicationCache ? "canvas" : "table",
                                                        width: w,
                                                        height: h,
                                                        text: toUtf8(wxconfig.link)
                                                    });
                                                }

                                            }
                                        },
                                        error: function (xhr, status, error) {

                                        }
                                    });

                                }

                                if (html2canvas_fixed_img.size() == 0) {

                                    //生成图片
                                    const shareContent = document.getElementById('html2_node')
                                    const rect = shareContent.getBoundingClientRect() // 获取元素相对于视口的
                                    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop // 获取滚动轴滚动的长度
                                    var width = shareContent.offsetWidth;//dom宽
                                    var height = shareContent.offsetHeight;//dom高 获取滚动轴滚动的长度
                                    var imghas = false;
                                    var createPosterCount = 0;
                                    var html2_timer = setInterval(function () {
                                        if (imghas) {
                                            clearInterval(html2_timer);
                                            return;
                                        }
                                        //最多重试3次
                                        if (createPosterCount > 2) {
                                            clearInterval(html2_timer);
                                            $('.html2_close').click();
                                            showErrAlert('生成失败，请直接分享页面链接！');
                                            return;
                                        }
                                        createPosterCount++;
                                        html2canvas(document.querySelector("#html2_node"), {
                                            //'backgroundColor':'#fff',
                                            'backgroundColor': 'transparent',
                                            'useCORS': true,
                                            'dpi': window.devicePixelRatio * 2,
                                            'scale': 2,
                                            'x': rect.left, // 绘制的dom元素相对于视口的位置
                                            'y': rect.top,
                                            'width': width,
                                            'height': height,
                                            'scrollY': 0,
                                            'scrollX': 0,
                                            'taintTest': true,
                                            // 'timeout': 500 // 加载延时
                                        }).then(function (canvas) {
                                            var a = canvasToImage(canvas);
                                            $('#html2canvas_fixed .html2_img').html(a);
                                            $(".html2_mask img").hide();
                                            $('.html2canvas_fixed').addClass('show');
                                            imghas = true;
                                        });
                                    }, 1500)


                                    function canvasToImage(canvas) {
                                        var image = new Image();
                                        image.setAttribute("crossOrigin", 'anonymous')
                                        var imageBase64 = canvas.toDataURL("image/png", 1);
                                        image.src = imageBase64;
                                        utils.setStorage("huoniao_poster", imageBase64);

                                        return image;
                                    }
                                } else {
                                    $('.html2canvas_fixed').addClass('show');
                                }

                                setTimeout(function () {
                                    if (($('.html2canvas_fixed').outerHeight() + 10) > $(window).height() * .9) {
                                        $('.html2_mask_bottom').fadeIn();
                                    } else {
                                        $('.html2_mask_bottom').fadeOut()
                                    }
                                }, 500)

                            }
                            return false;
                        }

                        $('.html2canvas_fixed').on('click', '.html2_close', function (e) {
                            e.preventDefault();
                            $('.html2canvas_fixed').removeClass('show')
                            $(".html2_mask").hide();
                            $('html').removeClass('noscroll');
                            $('.html2_mask_bottom').fadeOut();

                            //APP端开启下拉刷新
                            toggleDragRefresh('on');
                        });
                        $('.html2_mask').click(function (e) {
                            e.preventDefault();
                            $('.html2canvas_fixed').removeClass('show')
                            $(".html2_mask").hide();
                            $('html').removeClass('noscroll');
                            $('.html2_mask_bottom').fadeOut();

                            //APP端开启下拉刷新
                            toggleDragRefresh('on');
                        })




                        //长按
                        var flag = 1  //设置长按标识符
                        var timeOutEvent = 0;
                        $(".html2canvas_fixed .html2_img").on({
                            touchstart: function (e) {
                                if (flag) {
                                    clearTimeout(timeOutEvent);
                                    timeOutEvent = setTimeout("longPressPoster()", 800);
                                }
                                // e.preventDefault();
                            },
                            touchmove: function () {
                                clearTimeout(timeOutEvent);
                                timeOutEvent = 0;
                            },
                            touchend: function () {
                                flag = 1;
                            }

                        });


                        //隐藏导航内容
                        $('body').delegate('.popupRightBottom .closeNav', 'click', function () {
                            var slideFastNav = $('.popupRightBottom .slideFastNav');
                            slideFastNav.addClass('hideNav');
                            setTimeout(function () {
                                slideFastNav.removeClass('showNav');
                                slideFastNav.removeClass('hideNav');
                            }, 200);
                        });

                        //显示微信公众号
                        $('body').delegate('.popupRightBottom .f-weChat', 'click', function () {
                            $('.popupNavWechat').css("visibility", "visible");
                        });

                        //隐藏微信公众号
                        $('body').delegate('.popupNavWechat .closeWechat', 'click', function () {
                            $('.popupNavWechat').css("visibility", "hidden");
                        });

                        //返回顶部
                        $('body').delegate('.fastTop', 'click', function () {
                            // document.scrollingElement.scrollTop = 0;
                            $(window).scrollTop(0)
                        });

                        //隐藏返回顶部
                        $(window).on("scroll", function () {
                            if ($(window).scrollTop() > 400) {
                                $('.popupRightBottom .fastTop').css("visibility", "visible");
                            } else {
                                $('.popupRightBottom .fastTop').css("visibility", "hidden");
                            }
                        });

                        //隐藏原有按钮
                        $('.gotop, .wechat-fix').remove();

                    }
                }
            });
        }

    }, 500);


    if ($('#payPhone_container').size() > 0) {
        payPhoneVue = new Vue({
            el: "#payPhone_container",
            data: {
                showPayPhonePop: false,
                payPhoneNumber: '',
                payPhoneTitle: ''
            },
            methods: {
                // 打电话
                callPhone(tel) {
                    // var tt = this;
                    window.location.href = 'tel:' + tel;
                    return false;
                }
            }
        });
    }

   


    //评论前验证是否登录
    $('body').delegate('.comment_top, .comt_btn, .reply_box, .bbtns_box .left_box, .reply_input, .commt_btn, .reply_btn, .commCon, .bottom_reply_fixed, .btnReply, .reply_child, .money.needA', 'click', function () {
        var comment_userid = $.cookie(cookiePre + "login_user");
        if (comment_userid == null || comment_userid == "") {
            window.location.href = masterDomain + '/login.html';
            return false;
        }
    });

};


//查询付费查看电话订单是否支付成功
function checkPayPhoneResult(btn, ordernum) {
    $.ajax({
        type: 'POST',
        async: false,
        url: '/include/ajax.php?service=member&action=tradePayResult&px=1&order=' + ordernum,
        dataType: 'json',
        success: function (str) {
            if (str.state == 100 && str.info != "") {
                clearInterval(validPayPhoneTrade);

                $('.payMask,.payPop').hide();

                //支付成功并有电话号码返回
                if (typeof (str.info.phone) != 'undefined') {
                    window.location.href = 'tel:' + str.info.phone;
                    return false;
                }

                //如果开启了隐私号码
                if (cfg_privateNumber_state == '1') {
                    btn.removeClass('disabled payPhoneBtn');
                    btn.click();
                }

            }
        }
    });
}



//开启关闭下拉刷新
function toggleDragRefresh(val) {
    if (device.indexOf('huoniao') > -1) {
        setTimeout(function () {
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler("setDragRefresh", { "value": val }, function () {
                });
            });
        }, 500);
    }
}
//长按执行的方法
function longPressPoster(el) {
    var imgsrc = ''
    if (el) {
        imgsrc = el.attr('src')
    } else {
        imgsrc = $(".html2canvas_fixed .html2_img").find('img').attr('src');
    }

    if (imgsrc == '' || imgsrc == undefined) {
        alert(langData['siteConfig'][44][94]);//下载失败，请重试
        return 0
    }
    flag = 0;
    setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler(
            'saveImage',
            { 'value': 'huoniao_poster' },
            function (responseData) {
                if (responseData == "success") {
                    setTimeout(function () {
                        flag = 1;
                    }, 200)
                }
            }
        );
    });
}
//输出货币标识
function echoCurrency(type) {
    var pre = (typeof cookiePre != "undefined" && cookiePre != "") ? cookiePre : "HN_";
    var currencyArr = $.cookie(pre + "currency");
    if (currencyArr) {
        var currency = JSON.parse(decodeURIComponent(atob(currencyArr)));
        if (type) {
            return unescape(currency[type].replace(/&#x/g, '%u').replace(/;/g, ''));
        } else {
            return currencyArr['short'];
        }
    } else if (typeof cfg_currency != "undefined") {
        if (type) {
            return unescape(cfg_currency[type].replace(/&#x/g, '%u').replace(/;/g, ''))
        } else {
            return cfg_currency['short'];
        }
    }
}


//单点登录执行脚本
function ssoLogin(info) {

    var host = window.location.host;
    var host_ = host.split('.');
    var len = host_.length;
    var domain = '', start = len > 2 ? len - 2 : 0;
    for (var i = start; i < len; i++) {
        domain += '.' + host_[i];
    }

    //已登录
    if (info) {

        $.cookie(cookiePre + 'login_user', info['userid_encode'], { expires: 365, domain: host, path: '/' });
        $.cookie(cookiePre + 'login_user', info['userid_encode'], { expires: 365, domain: domain, path: '/' });

        //未登录
    } else {
        $.cookie(cookiePre + 'login_user', null, { expires: -10, domain: host, path: '/' });
        $.cookie(cookiePre + 'login_user', null, { expires: -10, domain: domain, path: '/' });
    }

}


var utils = {
    canStorage: function () {
        if (!!window.localStorage) {
            return true;
        }
        return false;
    },
    setStorage: function (a, c) {
        try {
            if (utils.canStorage()) {
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        } catch (b) {
            if (b.name == "QUOTA_EXCEEDED_ERR") {
                alert("您开启了秘密浏览或无痕浏览模式，请关闭");
            }
        }
    },
    getStorage: function (b) {
        if (utils.canStorage()) {
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function (a) {
        if (utils.canStorage()) {
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function () {
        if (utils.canStorage()) {
            localStorage.clear();
        }
    }
};


var scrollDirect = function (fn) {
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


// 确认弹窗
function confirmPop(options, callback, cancelcallback) {
    var defaultOpt = {
        // btnTrggle:'.cared',  //必须   点击显示弹窗的按钮，在页面配置
        btnSure: '确认',   //按钮文字
        noSure: false,//没有确认按钮
        noCancel: false,//没有取消按钮
        isShow: false,
        btnCancel: '取消',  //取消按钮的文字
        title: '确定删除信息？',    // 提示标题
        btnColor: '#3B7CFF',  //确认文字按钮颜色
        btnCancelColor: '#666',  //确认文字按钮颜色
        // confirmTip:'一经删除不可恢复',  //副标题
        confirmHtml: '',  //提示部分
        // trggleType:'1',  //不填表示只有一个按钮可以触发， 1表示有多个按钮触发
        popClass: '',  //弹窗类名--需特别修改时候
    };
    var elId = 'confirm' + (new Date()).valueOf();
    var btnNosure = options.noSure ? options.noSure : defaultOpt.noSure;
    var btnNocancel = options.noCancel ? options.noCancel : defaultOpt.noCancel;
    var firCla = (!btnNosure && !btnNocancel) ? 'popfirmUl' : '';//有两个按钮时

    var confirmHtml = '<div class="confirmPop ' + (options.popClass ? options.popClass : defaultOpt.popClass) + '" id="' + elId + '"><div class="pubdelMask"></div> ' +
        '   <div class="pubdelAlert">   ' +
        '     <div class="pubdelAlertCon">  ' +
        '       <div>  ' +
        '         <h2 class="delTile">' + (options.title ? options.title : defaultOpt.title) + '</h2> ' +
        (options.confirmTip ? ('  <p>' + (options.confirmTip ? options.confirmTip : "") + '</p> ') : '') +
        (options.confirmHtml ? options.confirmHtml : '') +
        '       </div>' +
        '       <ul class="' + firCla + '"> ' +
        '         <li  style="display:' + (options.noCancel ? "none" : "block") + '"><a href="javascript:;" class="cancelDel" style="color:' + (options.btnCancelColor ? options.btnCancelColor : defaultOpt.btnCancelColor) + '">' + (options.btnCancel ? options.btnCancel : defaultOpt.btnCancel) + '</a>' +
        '         <li style="display:' + (options.noSure ? "none" : "block") + '"><a href="javascript:;" class="sureDel" style="color:' + (options.btnColor ? options.btnColor : defaultOpt.btnColor) + '">' + (options.btnSure ? options.btnSure : defaultOpt.btnSure) + '</a>' +
        '       </ul>' +
        '     </div>' +
        '   </div></div>';
    $("body").append(confirmHtml);
    // 关闭
    $(".pubdelAlert .cancelDel").click(function () {
        var p = $(this).closest('.confirmPop')
        p.find(".pubdelMask").removeClass('show');
        p.find(".pubdelAlert").hide();
        if (options.noSure || !options.btnTrggle) {
            setTimeout(function () {
                $("#" + elId).remove();
            }, 1000)
        }
        if (cancelcallback) {
            cancelcallback();
        }

    })

    $(".pubdelAlert .sureDel").click(function () {
        var p = $(this).closest('.confirmPop')
        p.find(".pubdelMask").removeClass('show');
        p.find(".pubdelAlert").hide();
        if (options.noSure || !options.btnTrggle) {
            setTimeout(function () {
                $("#" + elId).remove();
            }, 1000)
        }
        callback();
    });
    if (options.btnTrggle) {
        $("body").delegate(options.btnTrggle, 'click', function (e) {
            var btn = $(this);
            if (btn.attr('data-title')) {
                $("#" + elId).find(".pubdelAlert .delTile").text(btn.attr('data-title'))
            }
            $("#" + elId).find(".pubdelMask").addClass('show');
            $("#" + elId).find(".pubdelAlert").show();
        })
    }
    if (options.isShow) {
        $("#" + elId).find(".pubdelMask").addClass('show');
        $("#" + elId).find(".pubdelAlert").show();
    }



}


//计算广告尺寸
function calculatedAdvSize(obj) {
    var obj = $('#' + obj);
    if (!obj.parent().height()) {
        obj.css({ 'min-height': '2.5rem' });
    };
    if (obj.size() > 0) {
        obj.find('h6').html('尺寸【' + parseInt(obj.width() * 2) + ' × ' + parseInt(obj.height() * 2) + '】px');
    }
}

function hn_getCookie(key) {
    var arr, reg = RegExp('(^| )' + key + '=([^;]+)(;|$)');
    if (arr = document.cookie.match(reg))
        return decodeURIComponent(arr[2]);
    else
        return null;
}

function hn_delCookie(key) {
    var date = new Date();
    date.setTime(date.getTime() - 1);
    var delValue = hn_getCookie(key);
    if (!!delValue) {
        document.cookie = key + '=' + delValue + ';expires=' + date.toGMTString();
    }
}

function returnHumanTime(t, type) {
    var n = new Date().getTime() / 1000;
    var c = n - t;
    var str = '';
    if (c < 60) {
        str = '刚刚';
    } else if (c < 3600) {
        str = parseInt(c / 60) + '分钟前';
    } else if (c < 86400) {
        str = parseInt(c / 3600) + '小时前';
    } else if (c < 604800) {
        str = parseInt(c / 86400) + '天前';
    } else {
        str = huoniao.transTimes(t, type);
    }
    return str;
}
function returnHumanClick(click) {
    if (click >= 10000) {
        click = (click / 10000).toFixed(1) + '万';
    }
    return click;
}

//获取URL参数
function getQueryParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

//ajax封装,使用说明参考common.js
function ajax(data, param = {}) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: param.url||'/include/ajax.php?',
			data: data,
			type: param.type||'POST',
			dataType: param.dataType||'jsonp',
			timeout: 5000, //超时时间
			success: (res) => {
				resolve(res);
			},
			error: error => {
				reject(error);
			}
		})
	})
}

// 转blob流文件
var loadImageToBlob = function (img, url, callback) {
    if (!url || !callback) return false;
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        // 注意这里的this.response 是一个blob对象 就是文件对象，由于安卓端不支持blog文件的长按保存，这里再转一次base64
        if (this.status == 200) {
            blobToDataURI(this.response, callback);
        } else {
            callback('/static/images/404.jpg');
        }
    }
    xhr.onerror = function () {
        if (img.attr('src').indexOf('qlogo.cn') > -1) {
            img.attr('src', '/static/images/noPhoto_100.jpg');
        }
        // img.remove();
    }
    xhr.send();
    return true;
}

//这里不再对内容图片转换，开始做这个操作的原因是通过html2canvas生成海报时，如果有外部跨域资源，直接将请求失败的图片从内容中移除掉，但是这样做的结果会导致原始内容中的图片丢失，影响比较严重
//publicShare.js中生成海报的功能中已经做了优化处理，如果生成失败，直接提示生成失败，请分享页面链接的信息。
//原则上是要保证原始内容不被修改
function imgToBlob(dom) {
    // 2023.05.09 虽然publicShare.js中已经做了失败提示处理，但是贴吧详情页的生成失败几率太大，这里还是需要做blob处理，后期如果排查到具体问题再做处理
    // return false;
    $(dom).find('img').each(function () {
        var t = $(this), src = t.attr('src'), id = t.attr('id');
        if(id != 'firstImage'){
            loadImageToBlob(t, src, function (filedate) {
                // var blobSrc = URL.createObjectURL(filedate);
                t.attr('data-url', src).attr('src', filedate);
            });
        }
    })
}

function blobToDataURI(blob, callback) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (e) {
        callback(e.target.result);
    }
}

function toUtf8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}


function compare(curV, reqV) {
    var a = toNum(curV);
    var b = toNum(reqV);
    var version_ = true;
    if (a == b) {
        version_ = true
    } else if (a > b) {
        version_ = false
    } else {
        version_ = true
    }
    return version_
}


//计算版本号大小,转化大小
function toNum(a) {
    var a = a.toString();
    var c = a.split('.');
    var num_place = ["", "0", "00", "000", "0000"], r = num_place.reverse();
    for (var i = 0; i < c.length; i++) {
        var len = c[i].length;
        c[i] = r[len] + c[i];
    }
    var res = c.join('');
    return res;
}


//数据加密处理
function rsaEncrypt(data) {

    if (typeof JSEncrypt == 'function') {

        var returnData = [];

        //验证公钥
        if (typeof encryptPubkey == 'undefined' || encryptPubkey == '') {
            return data;
        }

        data = encodeURIComponent(data.toString());

        var pubkey = encryptPubkey;
        pubkey = pubkey.replace("-----BEGIN PUBLIC KEY-----\n", "");
        pubkey = pubkey.replace("\n-----END PUBLIC KEY-----", "");

        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(pubkey);

        //内容长度大于100，自动分组
        if (data.length > 100) {
            var lt = data.match(/.{1,2}/g);
            lt.forEach(function (entry) {
                returnData.push(encrypt.encrypt(entry));
            });
        } else {
            returnData.push(encrypt.encrypt(data));
        }

        return returnData.join('||rsa||');  //多个分组数据用||rsa||分隔，后台接收时需要先进行分组解密再组合

    } else {
        return data;
    }

}