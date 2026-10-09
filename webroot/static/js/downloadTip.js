  
  var masterDomain = typeof (masterDomains) != 'undefined' ? masterDomains : '';
  var  device = navigator.userAgent;
  var isWeixin = device.toLowerCase().indexOf('micromessenger') != -1;
  var wx_stringArr = isWeixin ? device.toLowerCase().match(/micromessenger\/([\d\.]+)/i) : 0;
  var wx_version = wx_stringArr.length > 0 ? device.toLowerCase().match(/micromessenger\/([\d\.]+)/i)[1] : 0; //微信版本号
  var wx_for = isWeixin ? (wx_version.split('.')[0] >= 7 || (wx_version.split('.')[1] >= 0 && wx_version.split('.')[0] == 7) || (wx_version.split('.')[2] >= 12 && wx_version.split('.')[0] == 7 && wx_version.split('.')[1] == 0)) : 0;//微信版本号是否大于7.0.12
  var iOSver = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);  //ios版本信息
  var isIOS9 = iOSver ? iOSver[1] : 0; //ios的版本
  var url_path = window.location.href;
  var paramUrlAnd = url_path == masterDomain ? "" : '?url=' + url_path;
  var paramUrlIos = "://?url=' + url_path;"
  
  

  var istimeOut = null; //存放延时器
  var downloadIsShow = false;

  var isCheckLogin = false; //表示不需要检测登录状态,在onShow的时候 检验是否需要重载
  var interval_checkLogin = null; // 存放登录检测定时器
  var loginCheckCount = 0

  var checkUserid = function(){
    loginCheckCount = 0

    if(interval_checkLogin){
        clearInterval(interval_checkLogin)
    }
    interval_checkLogin =  setInterval(function(){
        loginCheckCount = loginCheckCount + 1
        var userid = $.cookie('HN_login_user') || $.cookie('HN_userid');
        if(userid){
            // alert('登录成功')
            clearInterval(interval_checkLogin)
            let url = window.location.href
            url = url.includes('currentPageOpen') ? url : `${url}${url.includes('?') ? '&currentPageOpen=1' : '?currentPageOpen=1'}`
            location.href = url
            return false;
        }else if(!isCheckLogin){
            location.href = window.masterDomains + '?appFullScreen=1&currentPageOpen=1'
        }
    },1000)

  }

  window.addEventListener('pagehide', function(e) {
    clearInterval(interval_checkLogin)
  });

$(function(){
    if(wxBoolean && typeof(wxconfig) != 'undefined' && typeof(service) != 'undefined' && service != '' && service != 'siteConfig' && wxconfig.wxjssdk_url != window.location.href){
        location.reload()
    }
    if(typeof(cfg_appinfo) == 'undefined'){
        return false
    }
    let cssDom = `<style>
    .downloadBox{position: fixed; bottom: -2.8125rem; left: .9375rem; right: .9375rem; height: 2.8125rem; border-radius: 1.40625rem; background-color: #fff; box-shadow: 0 .15625rem .71875rem 0 rgba(0, 0, 0, 0.15); display: flex; align-items: center; justify-content: space-between;padding:  0 .625rem; z-index: 10000;transition: transform .4s ease-in-out;  transform: translateY(0); box-sizing: border-box;}
    .downloadBox.topShow{margin-bottom:calc(-.3125rem + constant(safe-area-inset-bottom));margin-bottom: calc(-.3125rem + env(safe-area-inset-bottom));  transform: translateY(-6.875rem);}
    .downloadBox .app_btn_down{width: 4.6875rem; line-height: 1.875rem; text-align: center; color: #fff; font-weight: 500;background: linear-gradient(89deg, #F25819 0%, #EE2824 100%); border-radius: .9375rem; position: relative; font-size: .75rem;}
    .downloadBox .app_btn_down{text-decoration: none;}
    .downloadBox .app_btn_down .wxDownLoad{display: block; position: absolute; left: 0; right: 0; bottom: 0; top: 0;}
    .downloadBox .left_app_info{display: flex; align-items: center;}
    .downloadBox .left_app_info h3{font-size: .8125rem; font-weight: bold; color: #333; max-width: 11.875rem;}
    .downloadBox .left_app_info .downloadLogo{width: 1.875rem; height: 1.875rem; background-color: #fff; box-shadow: 0 .15625rem .71875rem 0 rgba(0, 0, 0, 0.09); border-radius: .3125rem; margin-right: .28125rem; overflow: hidden;}
    .downloadBox .left_app_info .downloadLogo img{display: block; width: 100%; height: 100%; object-fit: cover;}
    .downloadBox .left_app_info .btn_close_appDownload{display: block; width: .625rem; height: .625rem; background: url(/static/images/close_down.png) no-repeat center/cover; margin-right: .625rem; margin-left: .3125rem;}
</style>`
    $('body').prepend(cssDom)
    
    var appConfig = {
        scheme_IOS: cfg_appinfo.URLScheme_iOS ? (cfg_appinfo.URLScheme_iOS + paramUrlIos) : (masterDomain + '/mobile.html'),
        scheme_Adr: cfg_appinfo.URLScheme_Android ? ('portal://' + cfg_appinfo.URLScheme_Android + ':8000/splash' + paramUrlAnd) : (masterDomain + '/mobile.html'),
        download_url_IOS: masterDomain + '/mobile.html',
        timeout: 600
    };
    var openclient = function () {
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
    

    function showDownloadTip(){

        if(istimeOut){
            clearTimeout(istimeOut)
            downloadIsShow = false;
            $('.downloadBox').removeClass('topShow');
            istimeOut = null
        }
        if(typeof(cfg_appinfo) == 'undefined' || downloadIsShow) return false;
        downloadIsShow = true;
        if ((device.indexOf('huoniao') < 0) && !(window.__wxjs_environment == 'miniprogram') && !$.cookie('downloadAppTips') && typeof wxconfig != "undefined") {
            if($(".downloadBox").length){
                $('.downloadBox').addClass('topShow');
                istimeOut = setTimeout(function () {
                    $('.downloadBox').removeClass('topShow');
                    downloadIsShow = false;
                }, 8000)
            }else{

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
                    jWeixin.ready(function () {
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
                    istimeOut = setTimeout(function () {
                        $('.downloadBox').removeClass('topShow');
                        downloadIsShow = false;
                    }, 8000)
                }, 1000)
            }
        
        }
    }

    showDownloadTip()
    var _wr = function(type) {
        var orig = history[type];
        return function() {
            var rv = orig.apply(this, arguments);
        var e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return rv;
        };
    };
    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState');


    window.addEventListener('replaceState', function(e) {
    });
    window.addEventListener('pushState', function(e) {
        showDownloadTip()
    });
})

function getWxInfo(){
    var xhr = new XMLHttpRequest();  //这里没有考虑IE浏览器，如果需要择if判断加
    xhr.open('GET', "/include/ajax.php?service=siteConfig&action=getWeChatSignPackage&url=" + window.location.href,true);
    xhr.send(null);//这里要是没有参数传，就写null
    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            //js处理数据
            let data = JSON.parse(xhr.responseText);
            if(data.state == 100){
                wxconfig.appId = data.info.appId;
                wxconfig.timestamp = data.info.timestamp;
                wxconfig.nonceStr = data.info.nonceStr;
                wxconfig.signature = data.info.signature;
                console.log(data.info)
                jWeixin.config({
                    debug: true,
                    appId: wxconfig.appId,
                    timestamp: wxconfig.timestamp,
                    nonceStr: wxconfig.nonceStr,
                    signature: wxconfig.signature,
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ',
                        'onMenuShareWeibo', 'updateAppMessageShareData', 'updateTimelineShareData',
                        'onMenuShareQZone', 'openLocation', 'scanQRCode', 'chooseImage', 'previewImage',
                        'uploadImage', 'downloadImage', 'getLocation'
                    ],
                    openTagList: ['wx-open-launch-app',
                        'wx-open-launch-weapp'
                    ] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
                });
            }
        }
    }
}