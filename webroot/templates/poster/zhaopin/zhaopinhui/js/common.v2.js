//页面提示
var $p = {
    stimo: undefined,
    id: function (id) {
        return document.getElementById(id)
    }
}
function tipFun(msg, callFn, tim) {
    $('#arrorbox').remove();
    tipLoadingRemove();
    clearTimeout($p.stimo);
    if (msg !== "") {
        $("#arrorbox").length > 0 ? $("#arrorbox").html(msg) : $("body").append("<div id='arrorbox' style='background:rgba(0,0,0,0.6); position:fixed; top:130px;left:0;border-radius:17px; text-align:center; color:#FFF; font-size:14px; padding:10px 15px;max-width:300px;overflow:hidden;z-index:99999999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'>" + msg + "</div>");
        $("#arrorbox").css({
            "margin-left": -Math.floor($("#arrorbox").outerWidth() / 2),
            "left": "50%",
            "top": 130 + "px",
            "opacity": 1
        });
        $p.stimo = (tim == undefined) ? setTimeout(function () { $('#arrorbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function () { $('#arrorbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
    }
};
// 分类弹窗
function tipFun2(msg, callFn, tim) {
    $('#arrorbox').remove();
    tipLoadingRemove();
    clearTimeout($p.stimo);
    if (msg !== "") {
        $("#arrorbox").length > 0 ? $("#arrorbox").html(msg) : $("body").append("<div id='arrorbox' style='background:rgba(0,0,0,0.6); position:fixed; top:50%;left:0;border-radius:40px; text-align:center; color:#FFF; font-size:16px; padding:10px 30px;max-width:300px;overflow:hidden;z-index:99999999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'>" + msg + "</div>");
        $("#arrorbox").css({
            "margin-left": -Math.floor($("#arrorbox").outerWidth() / 2),
            "margin-top": -Math.floor($("#arrorbox").outerHeight() / 2),
            "left": "50%",
            "top": "50%",
            "opacity": 1
        });
        $p.stimo = (tim == undefined) ? setTimeout(function () {
            $('#arrorbox').remove();
            if (callFn != "" && typeof callFn == "function") {
                callFn()
            }
        }, 3000) : setTimeout(function () {
            $('#arrorbox').remove();
            if (callFn != "" && typeof callFn == "function") {
                callFn()
            }
        }, tim);
    }
};

function tipLoading(loadingCon, type, top, left) {
    //if(loadingCon=="" || loadingCon=='undefined' || loadingCon==null){tipFun("<img src='//img.pccoo.cn/wap/webapp/images/loading.gif'>请稍后~");return;}
    if ($("arrorbox")) $('#arrorbox').remove();
    tipLoadingRemove();
    var dataType = [
        '<div class="sk-circle"><div class="sk-circle1 sk-child"></div><div class="sk-circle2 sk-child"></div><div class="sk-circle3 sk-child"></div><div class="sk-circle4 sk-child"></div><div class="sk-circle5 sk-child"></div><div class="sk-circle6 sk-child"></div><div class="sk-circle7 sk-child"></div><div class="sk-circle8 sk-child"></div><div class="sk-circle9 sk-child"></div><div class="sk-circle10 sk-child"></div><div class="sk-circle11 sk-child"></div><div class="sk-circle12 sk-child"></div></div>',
        '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',
    ]
    var html = "<div class='tiploading'></div>";
    var type = type || 0,
        top = top || "130px",
        left = left || "50%",
        timer = null;
    $("body").append(html);
    if ($(".tiploading")) {
        $(".tiploading").css({
            "margin-left": -20 + "px",
            "left": left,
            "top": top
        });
        !type == 1 ? $(".tiploading").append(dataType[type] + "<div class='tiploading-con'></div>") : $(".tiploading").append(dataType[type] + "<div class='tiploading-con'></div>");
    }
    // timer=setTimeout(function(){
    //    tipLoadingRemove();
    // },5000)
}

function tipLoadingRemove() {
    if ($(".tiploading")) {
        $(".tiploading").remove();
    }
}
//判断登录
function doisLogin() {
    if ($.cookie("webapp") == "" || $.cookie("webapp") == null) {
        tipFun("请先登录~", function () { window.location.href = "/login/?reurl=" + window.location.href; }, 2000);
        return false
    } else {
        return true
    }
}
//页面返回
function fback(pd) {
    var refurl = document.referrer;
    var reful2 = window.location.href;
    if (reful2.indexOf("#andriod_redirect") > 0) {
        closePage();
        return;
    }
    if (pd != undefined && pd != "") {
        if (pd.indexOf("3118.html") > 0) {
            if (refurl == "") {
                window.location.href = pd;
            }
            else {
                window.history.back();
            }
        } else {
            window.location.href = pd;
        }
    } else if (window.history.length > 1) {
        if (refurl.indexOf("transcoder.baiducontent.com") > 0) {
            window.location.href = "/"
        } else {
            window.history.back();
            sessionStorage.setItem("_SIGN", "1")
        }
    } else {
        window.location.href = "/"
    }
}
//设置图片容器宽高
function setSize(parentNode, children) {
    var divw = $(parentNode).width();
    var w = divw / 3,
        h = w * 0.75;
    $(children).each(function () {
        var url = $(this).find("img").attr("psrc");
        $(this).css({ "width": w, "height": h, "background": "url(" + url + ") no-repeat center", "background-size": "cover" });
    });
}
//浏览器信息
function browser() {
    var u = navigator.userAgent.toLowerCase();
    var app = navigator.appVersion.toLowerCase();
    return {
        txt: u, // 浏览器版本信息
        version: (u.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1], // 版本号
        msie: /msie/.test(u) && !/opera/.test(u), // IE内核
        mozilla: /mozilla/.test(u) && !/(compatible|webkit)/.test(u), // 火狐浏览器
        safari: /safari/.test(u) && !/chrome/.test(u), //是否为safair
        chrome: /chrome/.test(u), //是否为chrome
        opera: /opera/.test(u), //是否为oprea
        presto: u.indexOf('presto/') > -1, //opera内核
        webKit: u.indexOf('applewebkit/') > -1, //苹果、谷歌内核
        gecko: u.indexOf('gecko/') > -1 && u.indexOf('khtml') == -1, //火狐内核
        mobile: !!u.match(/applewebkit.*mobile.*/), //是否为移动终端
        ios: !!u.match(/\(i[^;]+;( u;)? cpu.+mac os x/), //ios终端
        android: u.indexOf('android') > -1, //android终端
        iPhone: u.indexOf('iphone') > -1, //是否为iPhone
        iPad: u.indexOf('ipad') > -1, //是否iPad
        webApp: !!u.match(/applewebkit.*mobile.*/) && u.indexOf('safari/') == -1 //是否web应该程序，没有头部与底部
    };
}
//打开城市通对应的频道
var timeout;


function open_appstore() {
    var b = browser();
    //alert(b.android);
    var _siteId = $.cookie("siteid");
    //if ( $.cookie("siteid") == 2045 || _siteId == 789 || _siteId == 1507) {
    var siteDatas = getSiteDownInfo();
    if (b.ios || b.iPhone || b.iPad) {
        window.location = siteDatas.downIosUrl;
    } else if (b.android) {
        window.location = siteDatas.downAndroidUrl;
    }
    /*} else {

        if (b.ios || b.iPhone || b.iPad) {
            window.location = "itms-apps://itunes.apple.com/cn/app/ccoo-cheng-shi-tong-ben-shi/id939332605?mt=8";
        } else if (b.android) {
            window.location = "http://m.app.so.com/detail/index?from=qing&id=1575163";
        }
    }*/
}
function getSiteDownInfo() {
    var b = browser();
    var _siteId = $.cookie("siteid"), siteDownData = {};
    var defaultData = {
        iosUrl: 'ccoo939332605://jumpLink?type=2&ids=0,0,0,&url=',
        androidUrl: 'ccoocity://ccoo.cn/jumpLink?type=2&ids=0,0,0,&url=',
        downIosUrl: 'itms-apps://itunes.apple.com/cn/app/ccoo-cheng-shi-tong-ben-shi/id939332605?mt=8',
        downAndroidUrl: 'http://m.app.so.com/detail/index?from=qing&id=1575163',
        iosLogo: 'http://img.pccoo.cn/tp/wx_common/images/city-logo.png'
    }
    if (!!sessionStorage.getItem('iosUrl')) {
        siteDownData.iosUrl = sessionStorage.getItem('iosUrl');
        siteDownData.androidUrl = sessionStorage.getItem('androidUrl');
        siteDownData.downIosUrl = sessionStorage.getItem('downIosUrl');
        siteDownData.downAndroidUrl = sessionStorage.getItem('downAndroidUrl');
        siteDownData.iosLogo = sessionStorage.getItem('iosLogo');
    } else {
        $.ajax({
            url: '/home/GetAppConfigInfo',
            type: 'POST',
            async: false,
            success: function (res) {
                if (res) {
                    sessionStorage.setItem('iosUrl', res.iosUrl)
                    sessionStorage.setItem('androidUrl', res.androidUrl)
                    sessionStorage.setItem('downIosUrl', res.downIosUrl)
                    sessionStorage.setItem('downAndroidUrl', res.downAndroidUrl)
                    sessionStorage.setItem('iosLogo', res.iosLogo)
                    siteDownData.iosUrl = res.iosUrl;
                    siteDownData.androidUrl = res.androidUrl;
                    siteDownData.downIosUrl = res.downIosUrl;
                    siteDownData.downAndroidUrl = res.downAndroidUrl;
                    siteDownData.iosLogo = res.iosLogo;
                }
            },
            error: function (err) {
                sessionStorage.setItem('iosUrl', defaultData.iosUrl)
                sessionStorage.setItem('androidUrl', defaultData.androidUrl)
                sessionStorage.setItem('downIosUrl', defaultData.downIosUrl)
                sessionStorage.setItem('downAndroidUrl', defaultData.downAndroidUrl)
                sessionStorage.setItem('iosLogo', defaultData.iosLogo)
                siteDownData.iosUrl = defaultData.iosUrl;
                siteDownData.androidUrl = defaultData.androidUrl;
                siteDownData.downIosUrl = defaultData.downIosUrl;
                siteDownData.downAndroidUrl = defaultData.downAndroidUrl;
                siteDownData.iosLogo = defaultData.iosLogo;
            }
        })
    }
    return siteDownData;
}
function try_to_open_app() {
    //id1,id2,id3公用的三层id
    var href = window.location.href;
    var b = browser();
    var that = this;
    var _siteId = $.cookie("siteid");
    href = href.replace("sxinfo.aspx", "shareinfo.aspx");
    href = href.replace("bbs/shareinfo.aspx", "bbs/topic.aspx");
    href = href.replace("tieba/shareinfo.aspx", "tieba/thread.aspx");
    href = href.replace("cnews/shareinfo.aspx", "cnews/news_show.aspx");
    href = href.replace("cover/mm/shareinfo.aspx", "cover/mm/photo_show.aspx");
    href = href.replace("cover/gg/shareinfo.aspx", "cover/gg/photo_show.aspx");
    href = href.replace("?from=singlemessage", "");
	href = href.replace(".webccoo.cn", ".ccoo.cn");
	href = href.replace(".appccoo.cn", ".ccoo.cn");
    return_url = href;
    if (!$('.down').attr('data-clipboard-text') || !$('.ch-now a').attr('data-clipboard-text') || !$('.A_link').attr('data-clipboard-text') || !$('.down-link').attr('data-clipboard-text')) {
        $.ajax({
            url: '/common/getappcode',
            data: { htmlUrl: return_url },
            type: 'POST',
            async: false,
            success: function (res) {
                $('.down').attr('data-clipboard-text', res.code)
                $('.ch-now a').attr('data-clipboard-text', res.code)
                $('.A_link').attr('data-clipboard-text', res.code)
                $('.down-link').attr('data-clipboard-text', res.code)
            }
        })
    }
    setTimeout(function () {
        var siteDatas = getSiteDownInfo();
        if (b.ios || b.iPhone || b.iPad) {
            window.location = siteDatas.iosUrl + return_url;
        } else if (b.android) {
            window.location = siteDatas.androidUrl + return_url;
        }
    }, 500)
    timeout = setTimeout('open_appstore()', 1000);
}

$(function () {
    // if ($.cookie("siteid") == 1507) {
    //     if (ccooShare.isWeixin() || ccooShare.isbaiduBrowser() || ccooShare.isbaiduChajian() || ccooShare.isliebaoBrowser() || ccooShare.issougouBrowser()) {
    //         Clipboard()
    //     } else if (ccooShare.isqqBrowser()) {
    //         var b = browser();
    //         if ((b.ios || b.iPhone || b.iPad)) {
    //             Clipboard()
    //         }
    //     }
    //     function Clipboard() {
    //         var href = location.href
    //         if (href.indexOf('jiuji.webccoo') >= 0) { return }
    //         if (!$('.down').attr('data-clipboard-text') || !$('.ch-now a').attr('data-clipboard-text') || !$('.A_link').attr('data-clipboard-text') || !$('.down-link').attr('data-clipboard-text')) {
    //             $.ajax({
    //                 url: '/common/getappcode',
    //                 data: { htmlUrl: window.location.href },
    //                 type: 'POST',
    //                 success: function (res) {
    //                     $('.down').attr('data-clipboard-text', res.code)
    //                     $('.ch-now a').attr('data-clipboard-text', res.code)
    //                     $('.A_link').attr('data-clipboard-text', res.code)
    //                     $('.down-link').attr('data-clipboard-text', res.code)
    //                 }
    //             })
    //         }
    //         new ClipboardJS('.down', {
    //             text: function (trigger) {
    //                 // tipFun2('复制成功');
    //                 return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
    //             },
    //         });
    //         new ClipboardJS('.ch-now a', {
    //             text: function (trigger) {
    //                 // tipFun2('复制成功');
    //                 return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
    //             },
    //         });
    //         new ClipboardJS('.A_link', {
    //             text: function (trigger) {
    //                 // tipFun2('复制成功');
    //                 return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
    //             },
    //         });
    //         new ClipboardJS('.down-link', {
    //             text: function (trigger) {
    //                 // tipFun2('复制成功');
    //                 return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
    //             },
    //         });
    //     }
    // } else {
    if (ccooShare.isWeixin() || ccooShare.isqqBrowser() || ccooShare.isbaiduBrowser() || ccooShare.isbaiduChajian() || ccooShare.isliebaoBrowser() || ccooShare.issougouBrowser()) {
        var href = location.href
        if (href.indexOf('jiuji.webccoo') >= 0) { return }
        if (!$('.down').attr('data-clipboard-text') || !$('.ch-now a').attr('data-clipboard-text') || !$('.A_link').attr('data-clipboard-text') || !$('.down-link').attr('data-clipboard-text')) {
            $.ajax({
                url: '/common/getappcode',
                data: { htmlUrl: window.location.href },
                type: 'POST',
                success: function (res) {
                    $('.down').attr('data-clipboard-text', res.code)
                    $('.ch-now a').attr('data-clipboard-text', res.code)
                    $('.A_link').attr('data-clipboard-text', res.code)
                    $('.down-link').attr('data-clipboard-text', res.code)
                }
            })
        }
        new ClipboardJS('.down', {
            text: function (trigger) {
                // tipFun2('复制成功');
                return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
            },
        });
        new ClipboardJS('.ch-now a', {
            text: function (trigger) {
                // tipFun2('复制成功');
                return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
            },
        });
        new ClipboardJS('.A_link', {
            text: function (trigger) {
                // tipFun2('复制成功');
                return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
            },
        });
        new ClipboardJS('.down-link', {
            text: function (trigger) {
                // tipFun2('复制成功');
                return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
            },
        });
    }
    //}
})

//签到弹出框
function signIn(money, grow, index) {
    var html = '<div class="cover sign" >\
            <div class="qiandao_wrap">\
        <div class="shan_move">\
        </div>\
      <div style=" position: relative; z-index: 100;">\
                <span class="close"></span>\
                <p class="city"><span>城市币<em>+' + money + '</em></span><span>成长值<em>+' + grow + '</em></span></p>\
                <a href="/Activity/Index/">城市币抽奖</a>\
                    <ul class="qiandao_list">\
                <li class="on"><em>已签</em><span></span></li>\
                <li><em>2天</em><span></span></li>\
                <li><em>3天</em><span></span></li>\
                <li><em>4天</em><span></span></li>\
                <li><em>5天</em><span></span></li>\
                <li><em>6天</em><span></span></li>\
                <li><em>7天</em><span></span></li>\
                </ul>\
    <p class="sign_des">\
        连续签到7天将额外获得15城市币\
        第8天开始重新计算签到天数\
        </p>\
      </div>\
      </div>\
                </p>';
    $("body").append(html);
    $("ul.qiandao_list li").each(function () {
        if ($(this).index() < index) {
            $(this).addClass("on").find("em").html("已签");
        }
    });
    $("div.sign").fadeIn(100);
    //关闭遮罩层
    $("span.close").click(function () {
        $("div.cover").fadeOut(100, function () {
            $(this).remove();
        });
    });
    $(document).click(function (e) {
        if (e.target.className == "cover sign") {
            $("div.cover").fadeOut(100, function () {
                $(this).remove();
            });
        }
    });
}
$(".submit").click(function (e) {
    e.stopPropagation();
});
//个人主页--点击空白处隐藏编辑框
$(document).click(function (e) {
    if ($(".header-hide").is(":visible") && e.target.className != "iconfont icon-bianji1") {
        $(".header-hide").hide();
    }
});
//回到顶部
function backTop() {
    var h = $(window).height();
    if ($(".top2footer2bg").length <= 0) {
        if ($(".fli-back").length > 0) {
            $("body").append('<span class="backtop flindex"><img src="https://img.pccoo.cn/wap/webapp/images/top.png">顶部</span>');
        } else if ($(".fli-wrapper").length > 0) {
            $("body").append('<span class="fliwrapper"><img src="https://img.pccoo.cn/wap/webapp/images/top.png">顶部</span>');
        } else {
            $("body").append('<span class="backtop"><img src="https://img.pccoo.cn/wap/webapp/images/top.png">顶部</span>');
        }
        $("span.backtop").click(function () {
            //$(window).scrollTop(0);
            $("html,body").animate({ "scrollTop": 0 }, 200);
        });
        $(window).scroll(function () {
            var top = $(window).scrollTop();
            if (top >= h * 0.75) {
                $("span.backtop").fadeIn(100);
                if ($("a.fabutop").length > 0 || $(".w_release").length > 0) {
                    $("span.backtop").css("bottom", "125px");

                    if ($('#posterLink').length > 0) {
                        $('span.backtop').css('bottom', '190px');
                    }
                }



            } else {
                $("span.backtop").fadeOut(100);
                // if ($("a.fabutop").length > 0||$(".w_release").length>0) {
                //     $("span.backtop").css("bottom", "70px");
                // }
            }
        });
    }
}
$(function () {
    if ($.cookie("siteid") == 920) {
        $("body").on("click", ".w-pay-box .w-pay-close", function () {
            $("body").removeClass("noslide")
        })
        $("body").on("click", ".button.luck-btn", function () {
            $("body").addClass("noslide")
        })
    }
	
	//返回广告测试站点
	if ($.cookie("siteid") == 1507 || $.cookie("siteid") == 920) {
		$.cookie("_ispop", null, { path: '/' });
		$.cookie("isccmy", 0, { path: '/' });
	}

    // backTop();
    $(document).bind('touchstart', function () { }); //兼容IOSactive
    var u = navigator.userAgent;
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (window.devicePixelRatio && devicePixelRatio >= 2 && isiOS) {
        $('body').addClass('hairlines');
    }
});

function photoCover(num, imgArr, _t, _o) {
    if (_t == '' || _t == 'undefined') { _t = 0; }
    var imgHtml = '',
        pag = '';
    for (var i = 0; i < num; i++) {
        imgHtml += '<li><div><img src=' + imgArr[i] + '></div></li>';
        pag += '<span></span>';
    }
    if (_t == 2) {
        imgHtml += '<li><div><a href="' + _o.hr + '"><div class="x-ad-picbox"><img src=' + _o.sr + '></div></a></div></li>';
        pag += '<span></span>';
        num++;
    }
    if (_t == 3) {
        imgHtml += '<li><div class="x-ad-pic">' + _o.html + '<p class="x-ad-back">重新浏览</p></div></li>';
        pag += '<span></span>';
        num++;
    }
    var html = '<div class="photo-cover">' +
        '<div class="header clearfix"><dl><dd class="left"><i class="iconfont icon-jiantou"></i></dd><dt>图片预览</dt></dl></div>' +
        '<div class="photo-wrap"><ul class="photo-list"> ' + imgHtml + '</ul><div class="cursor">' + pag + '</div></div>' +
        '<div class="page"><span>1</span>&nbsp;/&nbsp;<em>0</em></div>' +
        '</div>';
    $("body").append(html);
    //$(".cursor span:first").addClass("active");
    $(".photo-list").css({ "width": num * 100 + "%" });
    $(".photo-list li").css({ "width": 100 / num + "%" });
    $(".photo-cover .page em").html(num);
    var _that;
    $('.photo-list').each(function () {
        $(this).slide({
            pagnition: $(this).next(), //气泡圆点
            interval: 3000, //间隔时间
            animateTime: 500, //动画时间
            auto: false, //是否自动播放
            pagclass: 'active',
            afterSlide: function (index) {
                var oind = $(".cursor span.active").index() + 1;
                $(".photo-cover .page span").html(oind);
            }, //回调函数
            issyn: false, //高度随子元素变化
            debug: false,
            step: 1,
            margin: 0 //右间距
        })
    });

    //var _that=$(this);
    //点击关闭图片预览
    $("div.photo-cover dd.left").click(function () {
        $("div.photo-cover").remove();
    });
    /*返回第一页*/
    $('.x-ad-back').click(function () {
        $(this).parents('.photo-list').data('go')(0)
    })
}

function photoCover1(num, imgArr, index) {
    //var left=Number(left);
    var page = index + 1;
    var imgHtml = '';
    //pag = '';
    for (var i = 0; i < num; i++) {
        imgHtml += '<li class="swiper-slide" style="background:#000"><div style="position:static"><img src=' + imgArr[i] + '></div></li>';
        // pag += '<span></span>';
    }
    var html = '<div class="photo-cover">' +
        '<div class="header clearfix"><dl><dd class="left close-photo" style="display:none;"><i class="iconfont icon-jiantou"></i></dd><dt>图片预览</dt><dd class="d-right close-photo"><span></span></dd></dl></div>' +
        '<div class="photo-wrap swiper-container"><ul class="photo-list swiper-wrapper"> ' + imgHtml + '</ul>' +
        // '<div class="swiper-pagination"><span></span> / <span>3</span></div>' +
        // '<div class="cursor">' + pag + '</div></div>' +
        '<div class="page" style="bottom:80px;z-index:20;"><span id="pages">' + page + '</span>&nbsp;/&nbsp;<em>0</em></div>' +
        '</div>';
    $("body").append(html);
    //$(".cursor span:first").addClass("active");
    $(".photo-list").css({ "width": num * 100 + "%" });
    $(".photo-list li").css({ "width": 100 / num + "%" });
    $(".photo-cover .page em").html(num);
    var swiperPhoto = new Swiper('.photo-cover .swiper-container', {
        autoplayDisableOnInteraction: false,
        speed: 500,
        onSlideNextStart: function () {
            var oLength = Number($('.photo-list').children().length);
            var total = Number($('#pages').text())
            var pages = Number($('#pages').text()) + 1;
            if (oLength == total) {
                $('#pages').text(oLength)
            } else {
                $('#pages').text(pages)
            }
        },
        onSlidePrevStart: function () {
            var pages = Number($('#pages').text()) - 1;
            var total = Number($('#pages').text())
            if (total == 1) {
                $('#pages').text(1)
            } else {
                $('#pages').text(pages)
            }
        },

    });
    swiperPhoto.slideTo(index, 0, false); //切换到第一个slide，速度为1秒
    //点击关闭图片预览
    $("div.photo-cover dd.close-photo").click(function () {
        $("div.photo-cover").remove();
    });
}
/*
  **广告位大图预览
    *opt: num:除广告位后图片数量
          imgArr:图片路径数组
          index:当前索引值
          type:可选值 2,3  //2为内部广告，3为百度广告   （无广告时为空）
          add为对象: //hr  为链接地址 //sr为图片地址 //html为百度广告结构   （无广告时为空）
*/
function photoCover2(opt) {
    var num = opt.num,
        imgArr = opt.imgs,
        _t = opt.type,
        _o = opt.add,
        index = opt.index,
        _index = 0,
        _l = 0,
        imgHtml = '',
        pag = '';
    if (_t == '' || _t == 'undefined') { _t = 0; }
    if (index && index > -1 && index < num) {
        var w = document.body.clientWidth;
        _index = index;
        _l = -w * _index
    }
    for (var i = 0; i < num; i++) {
        imgHtml += '<li><div><img src=' + imgArr[i] + '></div></li>';
        pag += '<span></span>';
    }
    if (_t == 2) {
        imgHtml += '<li><div><a href="' + _o.hr + '"><div class="x-ad-picbox"><img src=' + _o.sr + '></div></a></div></li>';
        pag += '<span></span>';
        num++;
    }
    if (_t == 3) {
        imgHtml += '<li><div class="x-ad-pic">' + _o.html + '<p class="x-ad-back">重新浏览</p></div></li>';
        pag += '<span></span>';
        num++;
    }
    var html = '<div class="photo-cover">' +
        '<div class="header clearfix"><dl><dd class="left"><i class="iconfont icon-jiantou"></i></dd><dt>图片预览</dt></dl></div>' +
        '<div class="photo-wrap"><ul class="photo-list"> ' + imgHtml + '</ul><div class="cursor">' + pag + '</div></div>' +
        '<div class="page"><span>1</span>&nbsp;/&nbsp;<em>0</em></div>' +
        '</div>';
    $("body").append(html);
    $(".photo-list").css({ "width": num * 100 + "%", 'left': _l + 'px' });
    $(".photo-list li").css({ "width": 100 / num + "%" });
    $(".photo-cover .page em").html(num);
    var _that;
    $('.photo-list').each(function () {
        $(this).slide({
            pagnition: $(this).next(), //气泡圆点
            interval: 3000, //间隔时间
            animateTime: 500, //动画时间
            auto: false, //是否自动播放
            pagclass: 'active',
            afterSlide: function (index) {
                var oind = $(".cursor span.active").index() + 1;
                $(".photo-cover .page span").html(oind);
            }, //回调函数
            issyn: false, //高度随子元素变化
            debug: false,
            step: 1,
            margin: 0 //右间距
        })
        $(this).data('go')(_index)
    });
    //点击关闭图片预览
    $("div.photo-cover dd.left").click(function () {
        $("div.photo-cover").remove();
    });
    /*返回第一页*/
    $('.x-ad-back').click(function () {
        $(this).parents('.photo-list').data('go')(0)
    })
}
/*
    **大图预览
     *opt: ele:swiper-slide外层
           attr:图片地址位置
*/
function bigP(opt) {
    var _ele = opt.ele,
        attr = opt.attr;
    $(document).on('click', _ele + ' .swiper-slide', function (e) {
        if ($(this).hasClass('video-box')) {
            return
        }
        var num = $(_ele).find(".swiper-slide").length;
        var arry = [];
        var _type = 0,
            _o = {},
            _index = $(this).index();
        if ($(_ele + ' .swiper-slide-duplicate').length > 0) {
            _index = $(_ele + ' .swiper-slide-active').attr('data-swiper-slide-index')
        }
        $(_ele + ' .swiper-slide').each(function () {
            if ($(this).hasClass('swiper-slide-duplicate')) {
                num--;
                return
            } else if ($(this).hasClass('video-box')) {
                num--;
                _index--;
                return;
            } else {
                var imgUrl = $(this).find('img').attr(attr);
                if (imgUrl.indexOf('300x225(s)') > 0) {
                    imgUrl = imgUrl.replace('300x225(s)', '500x300(w)')
                }
                arry.push(imgUrl);
            }
        });
        if ($('#x-ad-box').length > 0) {
            var _that = $('#x-ad-box');
            if (_that.find('script').length > 0) {
                _type = 3;
                _o.html = _that.html()
            } else {
                _type = 2;
                _o.sr = _that.find('img').attr('src');
                _o.hr = _that.find('a').attr('href')
            }
        }
        photoCover2({ num: num, imgs: arry, index: _index, type: _type, add: _o });
    })
}
/*
    **新楼盘广告大图预览
     *opt: ele:swiper-slide外层
           attr:图片地址位置
*/
function bigP1(opt) {
    var _ele = opt.ele,
        attr = opt.attr;
    $(document).on('click', _ele + ' .swiper-slide', function (e) {
        if ($(this).hasClass('video-box')) {
            return
        }
        var num = $(_ele).find(".swiper-slide").length;
        var arry = [];
        var _type = 0,
            _o = {},
            _index = $(this).index();
        if ($(_ele + ' .swiper-slide-duplicate').length > 0) {
            _index = $(_ele + ' .swiper-slide-active').attr('data-swiper-slide-index')
        }
        $(_ele + ' .swiper-slide').each(function () {
            if ($(this).hasClass('swiper-slide-duplicate')) {
                num--;
                return
            } else if ($(this).hasClass('video-box')) {
                num--;
                _index--;
                return;
            } else {
                var imgUrl = $(this).find('img').attr(attr);
                if (imgUrl.indexOf('300x225(s)') > 0) {
                    imgUrl = imgUrl.replace('300x225(s)', '500x300(w)')
                }
                arry.push(imgUrl);
            }
        });
        if ($('#xlp-ad-box').length > 0) {
            var _that = $('#xlp-ad-box');
            _type = 2;
            _o.sr = _that.find('img').attr('src');
            _o.hr = _that.find('a').attr('href');
            _o.p1 = _that.find('.p1').text();
            _o.p2 = _that.find('.p2').text();
        }
        photoCover3({ num: num, imgs: arry, index: _index, type: _type, add: _o });
    })
}
/*
  **广告位大图预览
    *opt: num:除广告位后图片数量
          imgArr:图片路径数组
          index:当前索引值
          type:可选值 2  //2为内部广告  （无广告时为空）
          add为对象: //hr  为链接地址 //sr为图片地址 //html为百度广告结构   （无广告时为空）
*/
function photoCover3(opt) {
    var num = opt.num,
        imgArr = opt.imgs,
        _t = opt.type,
        _o = opt.add,
        index = opt.index,
        _index = 0,
        _l = 0,
        imgHtml = '',
        pag = '';
    if (_t == '' || _t == 'undefined') { _t = 0; }
    if (index && index > -1 && index < num) {
        var w = document.body.clientWidth;
        _index = index;
        _l = -w * _index
    }
    for (var i = 0; i < num; i++) {
        imgHtml += '<li><div><img src=' + imgArr[i] + '></div></li>';
        pag += '<span></span>';
    }
    if (_t == 2) {
        imgHtml += '<li><div><a href="' + _o.hr + '"><div class="xlp-ad-picbox"><p class="p1">' + _o.p1 + '</p><div class="img-box"><img src=' + _o.sr + ' /></div><p class="p2">' + _o.p2 + '</p><span class="go">去看看</span></div></a></div></li>';
        pag += '<span></span>';
        num++;
    }
    var html = '<div class="photo-cover">' +
        '<div class="header clearfix"><dl><dd class="left"><i class="iconfont icon-jiantou"></i></dd><dt>图片预览</dt></dl></div>' +
        '<div class="photo-wrap"><ul class="photo-list"> ' + imgHtml + '</ul><div class="cursor">' + pag + '</div></div>' +
        '<div class="page"><span>1</span>&nbsp;/&nbsp;<em>0</em></div>' +
        '</div>';
    $("body").append(html);
    $(".photo-list").css({ "width": num * 100 + "%", 'left': _l + 'px' });
    $(".photo-list li").css({ "width": 100 / num + "%" });
    $(".photo-cover .page em").html(num);
    var _that;
    $('.photo-list').each(function () {
        $(this).slide({
            pagnition: $(this).next(), //气泡圆点
            interval: 3000, //间隔时间
            animateTime: 500, //动画时间
            auto: false, //是否自动播放
            pagclass: 'active',
            afterSlide: function (index) {
                var oind = $(".cursor span.active").index() + 1;
                $(".photo-cover .page span").html(oind);
            }, //回调函数
            issyn: false, //高度随子元素变化
            debug: false,
            step: 1,
            margin: 0 //右间距
        })
        $(this).data('go')(_index)
    });
    //点击关闭图片预览
    $("div.photo-cover dd.left").click(function () {
        $("div.photo-cover").remove();
    });
    /*返回第一页*/
    $('.x-ad-back').click(function () {
        $(this).parents('.photo-list').data('go')(0)
    })
}

function videoPhotoCover(num, imgArr, index, videoPoster) {
    //var left=Number(left);
    var page = index + 1;
    var imgHtml = '';
    //pag = '';
    for (var i = 0; i < num; i++) {
        //imgHtml += '<li class="swiper-slide" style="background:#000"><div style="position:static"><img src=' + imgArr[i] + '></div></li>';
        // pag += '<span></span>';
        if (imgArr[i].indexOf('.mp4') >= 0) {
            imgHtml += '<li class="swiper-slide" style="background:#000"><div style="position:static" class="video-box"><video class="my-video" x5-video-player-type="h5" src=' + imgArr[i] + ' poster=' + videoPoster + '>您的浏览器不支持 video 标签</video><div class="video-mask"><span></span></div></div></li>';
        } else {
            imgHtml += '<li class="swiper-slide" style="background:#000"><div style="position:static"><img src=' + imgArr[i] + '></div></li>';
        }
    }
    var html = '<div class="photo-cover">' +
        '<div class="header clearfix"><dl><dd class="left close-photo" style="display:none;"><i class="iconfont icon-jiantou"></i></dd><dt>图片预览</dt><dd class="d-right close-photo"><span></span></dd></dl></div>' +
        '<div class="photo-wrap swiper-container"><ul class="photo-list swiper-wrapper"> ' + imgHtml + '</ul>' +
        // '<div class="swiper-pagination"><span></span> / <span>3</span></div>' +
        // '<div class="cursor">' + pag + '</div></div>' +
        '<div class="page" style="bottom:80px;z-index:20;"><span id="pages">' + page + '</span>&nbsp;/&nbsp;<em>0</em></div>' +
        '</div>';
    $("body").append(html);
    //$(".cursor span:first").addClass("active");
    $(".photo-list").css({ "width": num * 100 + "%" });
    $(".photo-list li").css({ "width": 100 / num + "%" });
    $(".photo-cover .page em").html(num);
    var swiperPhoto = new Swiper('.photo-wrap', {
        //pagination: 'swiper-pagination',
        //type: 'fraction',
        autoplayDisableOnInteraction: false,
        speed: 500,
        onSlideNextStart: function () {
            var oLength = Number($('.photo-list').children().length);
            var total = Number($('#pages').text())
            var pages = Number($('#pages').text()) + 1;
            if (oLength == total) {
                $('#pages').text(oLength)
            } else {
                $('#pages').text(pages)
            }
        },
        onSlidePrevStart: function () {
            var pages = Number($('#pages').text()) - 1;
            var total = Number($('#pages').text())
            if (total == 1) {
                $('#pages').text(1)
            } else {
                $('#pages').text(pages)
            }
        },

    });
    swiperPhoto.slideTo(index, 0, false); //切换到第一个slide，速度为1秒
    //点击关闭图片预览
    $("div.photo-cover dd.close-photo").click(function () {
        $("div.photo-cover").remove();
    });
    anIosVideo();
    videoPlayPause2();
}
//安卓ios分别操作video
function anIosVideo() {
    return;
    /*var b = browser();
    if (b.ios || b.iPhone || b.iPad) {
        $(".video-box .video-mask").remove()
        $('.my-video').attr('controls', 'controls');
    }*/
}
// 获取app版本
function appVersionNumber() {
    var navi = navigator.userAgent;
    var agent;
    if (navi.indexOf('ccoocity_android_') > (-1)) {
        agent = 'ccoocity_android_'
    } else {
        agent = 'ccoocity_ios_'
    }
    var lengt = new String(agent).length;
    var appArr = navi.substr(navi.indexOf(agent) + lengt, 5).split('.');
    return parseInt(appArr[0]) * 100 + parseInt(appArr[1]) * 10 + parseInt(appArr[2] ? appArr[2] : 0)
}
//video单个视频点击播放暂停
function videoPlayPause() {
    $(document).on('click', '.video-box', function () {
        var ccooua = navigator.userAgent.toLowerCase();
        var isApp = ccooua.indexOf('ccoocity') > -1; //app内
        var isAndroid = ccooua.indexOf('ccoocity_android') > -1; //android终端
        var isiOS = ccooua.indexOf('ccoocity_ios') > -1; //ios终端
        var src = $(this).find('.my-video').eq(0).attr('src');
        var poster = $(this).find('.my-video').eq(0).attr('poster');
        var leve = appVersionNumber();
        if (isApp && leve > 621) {
            var json = {
                videoUrl: src, // 视频地址
                thumbUrl: poster, // 缩略图地址
            };
            if (isAndroid) {
                app.playVideoPlug(JSON.stringify(json));

            } else {
                window.webkit.messageHandlers.app.postMessage({ 'functionName': 'playVideoPlug', 'json': JSON.stringify(json) });
            }
        } else {
            var b = browser(),
                bool = false,
                _this = $(this),
                _html = "";
            if (b.ios || b.iPhone || b.iPad) {
                if ($('#xShow-video').length > 0)
                    $('#xShow-video').remove();
                _html = '<div id="xShow-video" style="opacity:0;position:fixed;left:-1000px;top:-1000px;z-index:-100">\
                        <video preload="auto" src="' + src + '"></video>\
                    </div>'
                $('body').append(_html);
                $('#xShow-video video').get(0).play();
                $("#show-video p").click(function () {
                    $("#xShow-video").remove()
                })
            } else {
                if ($('#show-video').lenght > 0)
                    $('#show-video').remove();
                _html = '<div id="show-video">\
                  <video preload="auto" x-webkit-airplay="true" x5-playsinline="true" webkit-playsinline="true" playsinline="true" src="' + src + '"></video>\
                  <p><span></span>关闭播放</p>\
              </div>';
                $('body').append(_html);
                $("#show-video video").get(0).play()
                $("#show-video p").click(function () {
                    $("#show-video").remove()
                })
            }
        }

    })
}
//video单个视频点击播放暂停
function videoPlayPauseXlp() {
    $(document).on('click', '.video-box', function () {
        var ccooua = navigator.userAgent.toLowerCase();
        var isApp = ccooua.indexOf('ccoocity') > -1; //app内
        var isAndroid = ccooua.indexOf('ccoocity_android') > -1; //android终端
        var isiOS = ccooua.indexOf('ccoocity_ios') > -1; //ios终端
        var src = $(this).find('.my-video').eq(0).attr('data-original');
        var poster = $(this).find('.my-video').eq(0).attr('src');
        var leve = appVersionNumber();
        //全景直接跳转
        if ($(this).hasClass('quanjingbox')) {
            return;
        }
        if (src.indexOf('iframe') > -1) {
            var bool = false,
                _this = $(this),
                _html = "";
            if ($('#show-video').lenght > 0)
                $('#show-video').remove();
            _html = '<div id="show-video" class="show-iframe">' + src + '<p><span></span>关闭播放</p>\
                  </div>';
            $('body').append(_html);
            $("#show-video p").click(function () {
                $("#show-video").remove()
            })
            return;
        }
        if (isApp && leve > 621) {
            var json = {
                videoUrl: src, // 视频地址
                thumbUrl: poster, // 缩略图地址
            };
            if (isAndroid) {
                app.playVideoPlug(JSON.stringify(json));

            } else {
                window.webkit.messageHandlers.app.postMessage({ 'functionName': 'playVideoPlug', 'json': JSON.stringify(json) });
            }
        } else {
            var b = browser(),
                bool = false,
                _this = $(this),
                _html = "";
            if (b.ios || b.iPhone || b.iPad) {
                if ($('#xShow-video').length > 0)
                    $('#xShow-video').remove();
                _html = '<div id="xShow-video" style="opacity:0;position:fixed;left:-1000px;top:-1000px;z-index:-100">\
                        <video preload="auto" src="' + src + '"></video>\
                    </div>'
                $('body').append(_html);
                $('#xShow-video video').get(0).play();
                $("#show-video p").click(function () {
                    $("#xShow-video").remove()
                })
            } else {
                if ($('#show-video').lenght > 0)
                    $('#show-video').remove();
                _html = '<div id="show-video">\
                  <video preload="auto" x-webkit-airplay="true" x5-playsinline="true" webkit-playsinline="true" playsinline="true" src="' + src + '"></video>\
                  <p><span></span>关闭播放</p>\
              </div>';
                $('body').append(_html);
                $("#show-video video").get(0).play()
                $("#show-video p").click(function () {
                    $("#show-video").remove()
                })
            }
        }

    })
}
//video单个视频点击播放暂停
function videoPlayPause2() {
    $(".video-box").click(function () {
        var _this = $(this);
        if ($(this).children('.my-video').get(0).paused) {
            $(this).children('.my-video').get(0).play();
            $(this).children(".video-mask").hide()
        }
        else {
            $(this).children('.my-video').get(0).pause();
            $(this).children(".video-mask").show()
        }
        $(this).children(".my-video").bind('ended', function () {
            _this.children(".video-mask").show()
        })
    })
}
//video全屏播放
function videoFullScreen() {
    $(".video-box").click(function () {
        var _this = $(this);
        if ($(this).children('.my-video').get(0).paused) {
            $(this).children('.my-video').get(0).play();
            $(this).children(".video-mask").hide()
            //进入全屏
            if ($(this).children('.my-video').get(0).requestFullscreen) {
                $(this).children('.my-video').get(0).requestFullscreen();
            } else if ($(this).children('.my-video').get(0).webkitRequestFullScreen) {
                $(this).children('.my-video').get(0).webkitRequestFullScreen();
            } else if ($(this).children('.my-video').get(0).mozRequestFullScreen) {
                $(this).children('.my-video').get(0).mozRequestFullScreen();
            }
        }
        else {
            $(this).children('.my-video').get(0).pause();
            $(this).children(".video-mask").show()
        }
        $(this).children(".my-video").bind('ended', function () {
            _this.children(".video-mask").show()
        })
    })
}

//提示弹出框
function tip(title, bod, bottom) {
    tipLoadingRemove();
    $('#arrorbox').remove();
    var cover = "<div class='cover' id='cover'>\
      <div class='tip'>\
        <div class='tip_title'>" + title + "</div>\
        <div class='tip_body'>" + bod + "</div>\
        <div class='tip_bottom'>" + bottom + "</div>\
      </div></div>";
    $("body").append(cover);
    var h = $("div.tip").height(),
        w = $("div.tip").width();
    $("div.tip").css({ "margin-top": -(h / 2) + "px", "margin-left": -(w / 2) + "px" });
    $(document).click(function (e) {
        if (e.target.className == "cover") {
            $("div.cover").remove();
        }
    });
}

function setPos() {
    var h = $("div.tip").height();
    $("div.tip").css({ "margin-top": -(h / 2) + "px" });
}
$("div.bottom_nav a").click(function () {
    $(this).siblings().removeClass("on").end().addClass("on");
})
/*选择弹出框*/
window.dialog = {
    //在元素onclick事件上调用此方法，将弹窗内容通过传参加入弹窗中
    fn: function (ele, title, arry, width, radius) {
        var a = dialog.makeitem(arry);
        $('body').append('<div class="cover" id="cover"><div class="item_wrap" style="width:' + width + ';border-radius:' + radius + ';"><h5>' + title + '</h5>' + a + '</div></div>');
        dialog.setPosition();
        dialog.cancel();
        dialog.choose(ele);
    },
    //将弹窗中要选择的项目循环排列出来
    makeitem: function (arry) {
        var num = arry.length;
        var item = '';
        for (var i = 0; i < num; i++) {
            item += '<li>' + arry[i] + '</li>';
        }
        item = '<ul class="item_list">' + item + '</ul>';
        return item;
    },
    //设置弹窗距顶部位置
    setPosition: function () {
        var h = $('.item_wrap').height();
        $('.item_wrap').css("margin-top", -(h / 2));
    },
    //点击遮罩层关闭弹窗
    cancel: function () {
        $(document).click(function (e) {
            if (e.target.className == "cover") {
                $('#cover').remove();
            }
        });
    },
    //点击所选项目，赋值
    choose: function (ele) {

    }
};
//发布活动弹出框
(function ($) {
    $.fn.extend({
        setOpt: function (options) {
            var defaults = {
                title: '',
                content: '',
                addbtn: '',
                button: '',
                callback: '',
                oid: '',
                cancel: function () { //点击‘取消’弹出框消失
                    $(".title_name span.cancel").click(function () {
                        $('#cover2').remove();
                    });
                }
            };
            var opts = $.extend(defaults, options);
            return this.each(function () {
                $(this).click(function () {
                    var oid = $(this).find("input").attr("id");
                    var val = $(this).find("input").val();
                    fn(opts);
                    //如果用户已设置报名项，再次点开会显示上次的设置
                    if (val != "") {
                        if (oid == "baoming") {
                            //把设置的值转为数组
                            var arry = val.split(","),
                                len = arry.length;
                            var str = "";
                            for (var i = 0; i < len; i++) {
                                var narr = arry[i].split("|");
                                str += '<div class="set_container bt"><div class="set_item set_item1"><b>费用名称：</b><input type="text" maxlength="6" name="feename" class="feename" placeholder="活动费用"  value="' + narr[0] + '"></div><div class="set_item set_item1"><b>金额：</b><input type="number" name="fee" class="fee" value="' + narr[1] + '" placeholder="免费请填0，发布后不能修改"></div><div class="set_item set_item1"><b>名额限制：</b><input type="number" name="num" class="num" value="' + narr[2] + '" placeholder="默认无限制"></div><span class="guanbi">x</span></div>';
                                $("div.set_box").html(str + '<input type="hidden" class="itemval">');
                            }
                            close();
                        }
                    }
                });
            });
        }
    });
})(jQuery);

function fn(opts) {
    var setcont = '<div id="cover2" class="cover">' +
        '<div class="set_wrap"></div>' +
        '</div>';
    $('body').append(setcont);
    //判读是否有标题
    if (opts.title != '') {
        $('div.set_wrap').append('<div class="title_name">' + opts.title + '<span class="cancel">取消</span></div>');
    }
    $('div.set_wrap').append(opts.content);
    //判读是否有‘添加’按钮
    if (opts.addbtn != '') {
        $('div.set_wrap').append(opts.addbtn);
    }
    //判读是否需要设置按钮
    if (opts.button != '') {
        $('div.set_wrap').append('<div class="button"><span id="' + opts.oid + '">' + opts.button + '</span></div>');
    }
    var _callback = opts.callback
    if (typeof (_callback) == 'function') {
        _callback();
    }
    //点击‘取消’弹出框消失
    opts.cancel();
}
/*
 遮罩 创建MarkCreate() 关闭 MarkClose()
 */
function Mark() {
    this.settings = {
        centent: '<div id="mark"></div>',
        animation: 'show',
        markH: null,
    };
    this.oSelector = null;
}
//关闭遮罩
function MarkClose() {
    $('#mark').fadeOut(100).remove();
}
var winH = $(window).height();

function scrHeight() {
    var _top = $(".listheader").offset().top;
    var oListdata = winH - _top - 37;
    $('.listdata').height(oListdata);
}
//定位
function Dir(dir, selector) {
    var _left, _top, _bottom, _right;
    if (dir == 'center') {
        _left = ($(document).width() - selector.outerWidth()) / 2 + 'px';
        _top = ($(window).height() - selector.height()) / 2 + 'px';
        selector.css({ 'left': _left, 'top': _top });
    } else if (dir == 'centerTop') {
        _left = ($(document).width() - selector.outerWidth()) / 2 + 'px';
        _top = 0 + 'px';;
        selector.css({ 'left': _left, 'top': _top })
    } else if (dir == 'centerBottom') {
        _left = ($(document).width() - selector.outerWidth()) / 2 + 'px';
        _bottom = 0 + 'px';
        selector.css({ 'left': left, 'bottom': _bottom })
    } else if (dir == 'centerTop20') {
        _left = ($(document).width() - selector.outerWidth()) / 2 + 'px';
        _top = 20 + 'px';
        selector.css({ 'left': _left, 'top': _top })
    } else if (dir == 'centerBottom20') {
        _left = ($(document).width() - selector.outerWidth()) / 2 + 'px';
        _bottom = 20 + 'px';
        selector.css({ 'left': _left, 'bottom': _bottom })
    } else if (dir == 'left') {
        _top = 0 + 'px';
        _left = 0 + 'px';
        selector.css({ 'left': _left, 'top': top });
    } else if (dir == 'leftCenter') {
        _left = 0 + 'px';
        _top = ($(document).height() - selector.outerWidth()) / 2 + 'px';
        selector.css({ 'left': _left, 'top': _top });
    } else {
        _left = ($(document).width() - selector.outerWidth()) / 2 + 'px';
        _top = ($(document).height() - selector.height()) / 2 + 'px';
        selector.css({ 'left': _left, 'top': _top });
    }
}
/*
 弹窗 vs---弹窗练手1.00
 ypf 2015-11-27
 */
;
(function ($) {
    var defaults = {
        //'style': 'style1',                                                                                               //默认dialog样式
        'title': { 'bool': false, 'className': 'dialog-tit', 'txt': 'dialog的抬头' }, //是否有抬头
        'exit': { 'bool': true, 'className': 'dialog-exit' }, //是否有退出按钮
        'content': {},
        'footer': {},
        'marker': true
    }
    $.fn.Dialog = function (options) {
        tipLoadingRemove();
        $('#arrorbox').remove();
        $("#dialog").remove();
        var opts = $.extend(defaults, options);
        this.each(function () {
            var thisTable = $(this);

            thisTable.bind('mousedown', function () {
                $.DialogCreat(opts);
                //var m1 = new Mark();
                //m1.init({ animation: 'fadeIn' });
                //$('#mark').css({ 'z-index': 9998, 'position': 'fixed' }).height($(window).height());
                var ss;
                if (thisTable.data('tit') != undefined) {
                    ss = thisTable.data('tit');
                    $('#dialog .dialog-tit').html(ss);
                }
                if (thisTable.data('img') != undefined) {
                    ss = thisTable.data('img');
                    $('#dialog .dialog-src').attr('src', ss);
                }
                if (thisTable.data('img2') != undefined) {
                    ss = thisTable.data('img2');
                    $('#dialog .imgwarp').append("<img class='simg' src='" + ss + "'>");
                }
                if (thisTable.data('p1') != undefined) {
                    ss = thisTable.data('p1');
                    $('#dialog .dialog-p3').html(ss);
                }
                if (thisTable.data('p2') != undefined) {
                    ss = thisTable.data('p2');
                    $('#dialog .dialog-p4').html(ss);
                }
                //liuchao
                if (thisTable.data('huati') != undefined) {
                    ss = thisTable.data('huati');
                    $('#dialog .dialog-p5').html(ss);
                }
                if (thisTable.data('take') == "take") {
                    $('#dialog .imgwarp').append('<i class="dian"></i>');
                }
                if (thisTable.data('num') != undefined) {
                    ss = thisTable.data('num');
                    $('#dialog .dialog-p6').html(ss);
                }
                if (thisTable.data('grow') != undefined) {
                    ss = thisTable.data('grow');
                    $('#dialog .dialog-p7').html(ss);
                }
                if (thisTable.data('imgflag') != undefined) {
                    ss = thisTable.data('imgflag');
                    var ahtml = (thisTable.data('atxt') == undefined) ? '' : thisTable.data('atxt');
                    switch (ss) {
                        case 0:
                            $('#dialog .img-get').attr('src', '//img.pccoo.cn/wap/WebApp/images/noget.png');
                            break;
                        case 1:
                            $('#dialog .img-get').attr('src', '//img.pccoo.cn/wap/WebApp/images/get1.png');
                            $('#dialog .dialog-a1').html(ahtml);
                            break;
                        default:
                            $('#dialog .img-get').attr('src', '//img.pccoo.cn/wap/WebApp/images/noget.png');
                            break;
                    }
                }
                if (thisTable.data('btn') != undefined) {
                    btnTxt(thisTable);
                }
            })
        });
    };
    $.DialogCreat = function (options, cb, cancelFilterClose) {
        tipLoadingRemove();
        var opts = $.extend(defaults, options);
        $("#dialog").remove();
        var style = (opts.style == '' || opts.style == null || opts.style == undefined) ? 'style1' : opts.style;
        $(document.body).append('<div id="dialog" class="' + style + '"><div class="dialog-warp"></div><div class="dialog-content"></div></div>')
        //设置dialog抬头
        if (opts.title.bool == true) {
            switch (opts.title.className) {
                case 'dialog-tit':
                    opts.title.txt = (opts.title.txt == undefined) ? 'dialog抬头' : opts.title.txt;
                    $('#dialog .dialog-warp').append('<div>' + opts.title.txt + '</div>');
                    $('#dialog .dialog-warp').find('div').addClass(opts.title.className);
                    break;
                default:
                    break;
            }
        }
        //设置dialog退出按钮
        if (opts.title.bool == true) {
            switch (opts.exit.className) {
                case 'dialog-exit':
                    $('#dialog .dialog-warp').append('<em>x</em>');
                    $('#dialog .dialog-warp').find('em').addClass(opts.exit.className);
                    break;
                default:
                    $('#dialog .dialog-warp').append('<em>x</em>');
                    $('#dialog .dialog-warp').find('em').addClass('dialog-exit');
                    break;
            }
        }
        //设置内容
        var ss = '';
        var temp = '';
        $.each(opts.content, function (i, n) {
            //ss = '';
            var iBq = i;
            var iJson = n;
            iJson = (iJson == undefined) ? '' : iJson;
            // ss += ss;
            switch (iBq) {
                case 'img':
                    ss += '<div class="dialog-img"><div class="imgwarp"><img src="https://img.pccoo.cn/wap/WebApp/images/neirongpinglun.png"  class="dialog-src" /></div></div>';
                    break;
                case 'imgRotate':
                    // opts.content.btn.txt = (opts.content.btn.txt == undefined) ? 'dialog按钮' : opts.content.btn.txt;
                    ss += '<div class="dialog-img"><div class="imgwarp"><img src="https://img.pccoo.cn/wap/WebApp/images/neirongpinglun.png"  class="dialog-src" /></div><div class="img-rotate"><img src="https://img.pccoo.cn/wap/WebApp/images/get1.png" class="img-get" /></div></div>';
                    break;
                case 'p':
                    $.each(iJson, function (i, n) {
                        ss += '<p class="' + iJson[i]['className'] + '">' + iJson[i]['txt'] + '</p>';
                    })
                    break;
                case 'a1':
                    // iJson[i]['className'] = (iJson[i]['className'] == undefined) ? 'dialog按钮' : iJson[i]['className'];
                    ss += '<div class="dialog-div1"><a class="dialog-a1" href="javascript:;" ></a></div>';
                    break;
                case 'btn':
                    opts.content.btn.txt = (opts.content.btn.txt == undefined) ? 'dialog按钮' : opts.content.btn.txt;
                    ss += '<div class="dialog-btn"><span class="btn ' + opts.content.btn.className + '">' + opts.content.btn.txt + '</span><sup class="sup"></sup></div>';
                    break;
                case 'ul':
                    var liclass = (opts.content.ul.liclass == null || opts.content.ul.liclass == undefined) ? 'dialog-li' : opts.content.ul.liclass;
                    if (opts.content.ul.txt.length > 0) {
                        ss += '<ul class="dialog-ul">'
                        for (var i = 0; i < opts.content.ul.txt.length; i++) {
                            ss += '<li class=' + liclass + '><a href="javascript:;">' + opts.content.ul.txt[i] + '</a></li>';
                        }
                        ss += '</ul>'
                    }
                    break;
                case 'html':
                    opts.content.html = (opts.content.html == null || opts.content.html == undefined) ? '' : opts.content.html;
                    ss += opts.content.html;
                    break;
                case 'inputxt':
                    var id, txt, _class, validator, length;

                    if (opts.content.inputxt.txt.length > 0) {
                        for (var i = 0; i < opts.content.inputxt.txt.length; i++) {
                            _class = (opts.content.inputxt.inputclass == undefined || opts.content.inputxt.inputclass[i] == null || opts.content.inputxt.inputclass[i] == undefined) ? 'dialog-inputxt1' :
                                opts.content.inputxt.inputclass[i];
                            id = (opts.content.inputxt.id == undefined || opts.content.inputxt.id[i] == null || opts.content.inputxt.id[i] == undefined) ? '' :
                                opts.content.inputxt.id[i];
                            txt = (opts.content.inputxt.txt == undefined || opts.content.inputxt.txt == null || opts.content.inputxt.txt == undefined) ? '' :
                                opts.content.inputxt.txt;
                            validator = (opts.content.inputxt.validator == undefined || opts.content.inputxt.validator == null || opts.content.inputxt.validator == undefined) ? '' :
                                opts.content.inputxt.validator;
                            length = (opts.content.inputxt.length == undefined || opts.content.inputxt.length == null || opts.content.inputxt.length == undefined) ? 50 :
                                opts.content.inputxt.length;
                            ss += '<div class="' + _class + '"><input   type="text" id="' + opts.content.inputxt.id[i] + '" validator = "' + opts.content.inputxt.validator[i] + '"  value="" placeholder="' + opts.content.inputxt.txt[i] + '" maxlength=' + length + '></div>';
                        }
                    }
                    break;
                case 'inputxt1':
                    var id, txt, _class, validator, length;
                    if (opts.content.inputxt1.txt.length > 0) {
                        for (var i = 0; i < opts.content.inputxt1.txt.length; i++) {
                            _class = (opts.content.inputxt1.inputclass == undefined || opts.content.inputxt1.inputclass[i] == null || opts.content.inputxt1.inputclass[i] == undefined) ? 'dialog-inputxt1' :
                                opts.content.inputxt.inputclass[i];
                            id = (opts.content.inputxt1.id == undefined || opts.content.inputxt1.id[i] == null || opts.content.inputxt1.id[i] == undefined) ? '' :
                                opts.content.inputxt.id[i];
                            txt = (opts.content.inputxt1.txt == undefined || opts.content.inputxt1.txt == null || opts.content.inputxt1.txt == undefined) ? '' :
                                opts.content.inputxt.txt;
                            validator = (opts.content.inputxt1.validator == undefined || opts.content.inputxt1.validator == null || opts.content.inputxt1.validator == undefined) ? '' :
                                opts.content.inputxt1.validator;
                            length = (opts.content.inputxt1.length == undefined || opts.content.inputxt1.length == null || opts.content.inputxt1.length == undefined) ? 50 :
                                opts.content.inputxt1.length;
                            ss += '<div class="' + _class + '"><input   type="text" id="' + opts.content.inputxt1.id[i] + '" validator = "' + opts.content.inputxt1.validator[i] + '"  value="" placeholder="' + opts.content.inputxt1.txt[i] + '"  maxlength=' + length + '></div>';
                        }
                    }
                    break;
                case 'inputradio':
                    var value, txt, _class, validator, title = '';
                    if (opts.content.inputradio.txt.length > 0) {
                        _class = (opts.content.inputradio.inputclass == undefined || opts.content.inputradio.inputclass[i] == null || opts.content.inputradio.inputclass[i] == undefined) ? 'dialog-inputxt1' :
                            opts.content.inputradio.inputclass[i];
                        title = (opts.content.inputradio.title == undefined || opts.content.inputradio.title == null || opts.content.inputradio.title == undefined) ? '' :
                            opts.content.inputradio.title;
                        ss += '<div class="' + _class + '">' + title + '';
                        for (var i = 0; i < opts.content.inputradio.txt.length; i++) {
                            var temp = '';
                            if (i == 1) {
                                temp = 'checked';
                            }
                            txt = (opts.content.inputradio.txt == undefined || opts.content.inputradio.txt == null || opts.content.inputradio.txt == undefined) ? '' :
                                opts.content.inputradio.txt;
                            value = (opts.content.inputradio.value == undefined || opts.content.inputradio.value == null || opts.content.inputradio.value == undefined) ? '' :
                                opts.content.inputradio.value;
                            ss += '<input   type="radio" name="' + opts.content.inputradio.name[i] + '" value = "' + opts.content.inputradio.value[i] + '" checked = " ' + temp + '"  />' + opts.content.inputradio.txt[i];
                        }
                        ss += '</div>';
                    }
                    break;
                case 'inputxtnum':
                    var value, txt, _class, validator, title = '';
                    var max, length;
                    if (opts.content.inputradio.title.length > 0) {
                        _class = (opts.content.inputxtnum.inputclass == undefined || opts.content.inputxtnum.inputclass == null || opts.content.inputxtnum.inputclass == undefined) ? 'dialog-inputxtnum ' :
                            opts.content.inputradio.inputclass;
                        title = (opts.content.inputxtnum.title == undefined || opts.content.inputxtnum.title == null || opts.content.inputxtnum.title == undefined) ? '' :
                            opts.content.inputxtnum.title;
                        id = (opts.content.inputxtnum.id == undefined || opts.content.inputxtnum.id == null || opts.content.inputxtnum.id == undefined) ? '' :
                            opts.content.inputxtnum.id;
                        value = (opts.content.inputxtnum.value == undefined || opts.content.inputxtnum.value == null || opts.content.inputxtnum.value == undefined) ? '1' :
                            opts.content.inputxtnum.value;
                        max = (opts.content.inputxtnum.max == undefined || opts.content.inputxtnum.max == null || opts.content.inputxtnum.max == undefined) ? 9 :
                            opts.content.inputxtnum.max;
                        length = (opts.content.inputxtnum.length == undefined || opts.content.inputxtnum.length == null || opts.content.inputxtnum.length == undefined) ? 30 :
                            opts.content.inputxtnum.length;

                        ss += '<div class="' + _class + '"><span>' + title + '</span><span class="dialog-num"><span class="inputxtnum-minus off">-</span><input type="number" id="' + id + '" name="num" value=' + value + ' class="inputnum" maxlength=' + length + ' data-max=' + max + '><span class="inputxtnum-add ">+</span></span></div>';
                    }
                    break;
                case 'inputxtnum1':
                    var id, txt, _class, validator, length;
                    if (opts.content.inputxtnum1.txt.length > 0) {
                        for (var i = 0; i < opts.content.inputxtnum1.txt.length; i++) {
                            _class = (opts.content.inputxtnum1.inputclass == undefined || opts.content.inputxtnum1.inputclass[i] == null || opts.content.inputxtnum1.inputclass[i] == undefined) ? 'dialog-inputxtnum1' :
                                opts.content.inputxt.inputclass[i];
                            id = (opts.content.inputxtnum1.id == undefined || opts.content.inputxtnum1.id[i] == null || opts.content.inputxtnum1.id[i] == undefined) ? '' :
                                opts.content.inputxt.id[i];
                            txt = (opts.content.inputxtnum1.txt == undefined || opts.content.inputxtnum1.txt == null || opts.content.inputxtnum1.txt == undefined) ? '' :
                                opts.content.inputxt.txt;
                            validator = (opts.content.inputxtnum1.validator == undefined || opts.content.inputxtnum1.validator == null || opts.content.inputxtnum1.validator == undefined) ? '' :
                                opts.content.inputxtnum1.validator;
                            length = (opts.content.inputxtnum1.length == undefined || opts.content.inputxtnum1.length == null || opts.content.inputxtnum1.length == undefined) ? 50 :
                                opts.content.inputxtnum1.length;
                            ss += '<div class="' + _class + '"><input   type="number" id="' + opts.content.inputxtnum1.id[i] + '" validator = "' + opts.content.inputxtnum1.validator[i] + '"  value="" placeholder="' + opts.content.inputxtnum1.txt[i] + '"  maxlength=' + length + '></div>';
                        }
                    }
                    break;
                default:
                    ss += '';
                    break;
            }
        })
        $('#dialog .dialog-content').append(ss);
        $.each(opts.footer, function (i, n) {
            var iBq = i;
            var iJson = n;
            iJson = (iJson == undefined) ? '' : iJson;
            $('#dialog .dialog-content').after('<div class="dialog-footer"></div>');
            switch (iBq) {
                case 'style':
                    $('#dialog .dialog-footer').addClass(iJson);
                    $('#dialog .dialog-footer').append('<div class="footer-left"></div><div class="footer-right"></div>')
                    break;
                case 'txt':
                    if ($('#dialog .dialog-footer').hasClass('dialog-footer1')) {
                        $('#dialog .footer-left').html(iJson[0]);
                        $('#dialog .footer-right').html(iJson[1]);
                    }
                    break;
                default:
                    break;
            }
        })
        //定位
        Dir('center', $('#dialog'));
        $('#dialog').fadeIn(100);
        if (opts.marker) {
            $.yyCreateMark("", cancelFilterClose);
        }
        //绑定事件
        $('#dialog .dialog-exit,#dialog .footer-left').bind('mousedown click', function () {
            if (typeof (opts.cancelCallback) == 'undefined') {
                $.DialogClose(opts, cb);
                return;
            } else {
                opts.cancelCallback();
                $.DialogClose(opts, cb);
            }
            $.DialogClose(opts, cb);
        })
        $('#dialog .footer-right').bind('mousedown', function () {
            if (typeof (opts.callback) == 'undefined') {
                return;
            } else {
                opts.callback();
                $.DialogClose(opts);
            }
        })
        $('#dialog .dialog-li').bind('click', function () {
            $.DialogClose(opts);
            if (typeof (opts.callback) == 'undefined') {
                return;
            } else {
                opts.callback();
            }
        })
        if (opts.bind != undefined) {
            $.each(opts.bind, function (i, n) {
                switch (i) {
                    case 'selector':
                        $(opts.bind.selector).bind('click', function () { })
                        return;
                        break;
                    case 'callback':
                        if (typeof (n) == 'undefined') {
                            return;
                        } else {
                            $(opts.bind.selector).bind('click', opts.bind.callback);
                        }
                        break;
                    default:
                        break;
                }
            })
        }
    }
    //关闭弹窗
    $.DialogClose = function (options, cb, cancelFilterClose) {
        if ((typeof cb == 'function') && cb) {
            cb()
        }
        var opts = $.extend(defaults, options);
        $('#dialog-warp').remove();
        $('#dialog').fadeOut(100).remove();
        $('#mark').fadeOut(100).remove();
    }
    $(document).click(function (e) {
        if (e.target.id == "mark") {
            if (!$("#mark").hasClass("close-sign")) {
                $.DialogClose();
            }
        }
    })
})(jQuery);
/*
 验证 vs---验证练手1.00
 ypf 2015-11-27
 */
;
(function ($) {
    $.Validator = function (options) {
        var defaults = {};
        var opts = $.extend(defaults, options);
        var bool = false;
        $.each($("input[validator],textarea[validator]"), function () {
            var thisTable = $(this);
            thisTable.attr('validator-flag', 0);
            var arrKey = [];
            //验证是否成功
            //提示语句
            var msgtxt = '';
            var txt = thisTable.attr('validator-txt');
            var thistxt = thisTable.val();
            var checkey = $.trim($(this).attr('validator'));
            if (checkey == '' && checkey == undefined && checkey == null) {
                return false;
            }
            switch (checkey) {
                case 'phone':
                    if (regJson.phone.reg.test(thisTable.val())) {
                        thisTable.attr('validator-flag', 1);
                    } else {
                        if (thistxt == '' && txt == undefined) {
                            msgtxt = regJson.phone.text1;
                        } else {
                            msgtxt = (txt == undefined || txt == null) ? regJson.phone.text2 : txt;
                        }
                        thisTable.attr('validator-flag', 0);
                        thisTable.focus();
                        tipFun(msgtxt)
                        //$.MsgCreat({ 'type': 'defalut', 'dir': 'center', 'txt': msgtxt });
                        return false;
                    };
                    break;
                case 'name':
                    if (regJson.name.reg.test(thisTable.val())) {
                        thisTable.attr('validator-flag', 1);
                    } else {
                        if (thistxt == '' && txt == undefined) {
                            msgtxt = regJson.name.text1;
                        } else {
                            msgtxt = (txt == undefined || txt == null) ? regJson.name.text2 : txt;
                        }
                        thisTable.attr('validator-flag', 0);
                        thisTable.focus();
                        tipFun(msgtxt)
                        //$.MsgCreat({ 'type': 'defalut', 'dir': 'center', 'txt': msgtxt });
                        return false;
                    };
                    break;
                case 'undefined':
                    if (regJson.undefined.reg.test(thisTable.val())) {
                        thisTable.attr('validator-flag', 1);
                    } else {
                        if (thistxt == '' && txt == undefined) {
                            msgtxt = regJson.undefined.text1;
                        } else {
                            msgtxt = (txt == undefined || txt == null) ? regJson.undefined.text2 : txt;
                        }
                        thisTable.attr('validator-flag', 0);
                        thisTable.focus();
                        tipFun(msgtxt)
                        //$.MsgCreat({ 'type': 'defalut', 'dir': 'center', 'txt': msgtxt });
                        return false;
                    };
                    break;
                case 'shengfenzhen':
                    if (regJson.undefined.reg.test(thisTable.val())) {
                        thisTable.attr('validator-flag', 1);
                    } else {
                        if (thistxt == '' && txt == undefined) {
                            msgtxt = regJson.shengfenzhen.text1;
                        } else {
                            msgtxt = (txt == undefined || txt == null) ? regJson.shengfenzhen.text2 : txt;
                        }
                        thisTable.attr('validator-flag', 0);
                        thisTable.focus();
                        tipFun(msgtxt)
                        //$.MsgCreat({ 'type': 'defalut', 'dir': 'center', 'txt': msgtxt });
                        return false;
                    };
                    break;
                case 'email':
                    if (regJson.email.reg.test(thisTable.val())) {
                        thisTable.attr('validator-flag', 1);
                    } else {
                        if (thistxt == '' && txt == undefined) {
                            msgtxt = '请填写邮箱！';
                        } else {
                            msgtxt = (txt == undefined || txt == null) ? regJson.email.text2 : txt;
                        }
                        thisTable.attr('validator-flag', 0);
                        thisTable.focus();
                        tipFun(msgtxt)
                        //$.MsgCreat({ 'type': 'defalut', 'dir': 'center', 'txt': msgtxt });
                        return false;
                    };
                    break;
                default:
                    break;
            }
        })
    }
})(jQuery);

function ZdyData(selector, ss) {
    if (selector.data('tit') != undefined) {
        ss = selector.data('tit');
    }
}
function addJsMd5(){
    if(location.href.indexOf('post/fabu')>-1){
        var ele = document.getElementsByTagName('head')[0];
        var sEle = document.createElement('script');
        sEle.setAttribute('src','https://img.pccoo.cn/wap/webapp/js/md5.js');
        ele.appendChild(sEle);
    }
}
function ajaxErrorLogSave(url,datainfo,jqXhr,textStatus,xhr){
    try{
       var datalist = 'PHSocket_SetAppLogMsg';
       var myDate = new Date();
       var requestTime = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate() + ' ' + myDate
           .getHours() +
           ':' + myDate.getMinutes() + ':' + myDate.getSeconds();
       var strval = '+6Hp9X5zR39SOI6oP0685Bk77gG56m7PkV89xYvl86A=' + datalist + requestTime
       var customerKey = md5(strval);
       var _href= location.href;
       var navi = navigator.userAgent;
       var paramData = {
           url:url,
           fromtype:'【手机版ajax错误】',
           logContent:'url:'+_href+'----------userAgent:'+navi+'---------options:'+datainfo,
           param:JSON.stringify(jqXhr)+'----------textStatus:'+textStatus+'----------xhr'+xhr
       }
       var data = {
           param: JSON.stringify({
               "customerID": 8001,
               "customerKey": customerKey,
               "requestTime": requestTime,
               "appName": "CcooCityWeb",
               "version": "6.4",
               "Method": datalist,
               "Param": paramData,
           })
       };
       $.ajax({
           url: 'http://logapi.bccoo.cn/appserverapi.ashx',
           type: 'POST',
           data:data,
           success: function(){

           },
       }); 
    }catch (e) { }
}
$.fn.smAjaxSubmit = function (param) {
    var md = $(this);
    var form = $(this).is("form") ? $(this) : $(this).find("form");
    var method = form.attr("method") || "POST";
    var url = form.attr('action');
    var success = param.success || $.noop;
    var d = param.data || {};
    var complete = param.complete || $.noop;
    var d = $.param(d);
    if (d) {
        d = "&" + d;
    }
    var data = form.serialize() + d;
    tipLoading(param.data);
    //tipFun("<img src='//img.pccoo.cn/wap/webapp/images/loading.gif'>请稍后~");
    $.ajax({
        url: url,
        type: method,
        data: data,
        success: success,
        async:false,
        timeout:500000,
        error: function (jqXhr, textStatus, xhr) {
            tipFun("请求发生错误，请稍后再试 code:2！【" + textStatus + "】");
            ajaxErrorLogSave(url,data,jqXhr,textStatus,xhr)
        },
        complete: function () {
            //md.smHideLoading();
            complete();
        }
    });
    return md;
}
smAjax = function (param) {
    var data = param.data || {};
    var method = param.method || "POST";
    var dataType = param.dataType || {};
    var url = param.url;
    var success = param.success || $.noop;
    var error = param.error || null;
    var complete = param.complete || $.noop;
    var beforeSend = param.beforeSend || $.noop;
    tipLoading();
    // tipFun("<img src='//img.pccoo.cn/wap/webapp/images/loading.gif'>请稍后~");
    $.ajax({
        cache: false,
        url: url,
        type: method,
        data: data,
        beforeSend: beforeSend,
        success: success,
        error: function (jqXhr, textStatus, xhr) {
            tipFun("请求发生错误，请稍后再试 code:1！【" + textStatus + "】");
			ajaxErrorLogSave(url,data,jqXhr,textStatus,xhr);
        },
        complete: function () {
            complete();
            tipLoadingRemove();
        }
    });
}
    // 遮罩 vs---遮罩练手1.00
    // ypf 2015-11-27
    ;
(function ($) {
    var defaults = {
        'dir': 'center',
        'animation': 'fadeIn',
        'markH': null,
        'selector': '',
    }
    $.fn.yyMark = function (opt) {
        var opts = $.extend(defaults, opt);
        var $this = $(this);
        $this.on('click', function () {
            $.yyCreateMark(opts);
        })
    }
    $.yyCreateMark = function (opt, closeSign) {
        var opts = $.extend(defaults, opt);
        var markH = $(window).height();
        var markW = $(window).width();
        var top, height;
        if (opts.selector == null || opts.selector == undefined || opts.selector == '') {
            top = 0;
        } else {
            top = opts.selector.offset().top + opts.selector.height();
        }
        if (closeSign) {
            $(document.body).append('<div id="mark" class="close-sign" style="position:fixed;left:0px;top:' + top + 'px;width:' + markW + 'px;height:' + markH + 'px;"></div>');
        } else {
            $(document.body).append('<div id="mark" style="position:fixed;left:0px;top:' + top + 'px;width:' + markW + 'px;height:' + markH + 'px;"></div>');
        }
        switch (opts.animation) {
            case 'slideDown':
                $('#mark').slideDown(100);
                break;
            case 'show':
                $('#mark').show(100);
                break;
            case 'fadeIn':
                $('#mark').fadeIn(100);
                break;
            default:
                $('#mark').slideDown(100);
                break;
        }
    }
    $.yyCloseMark = function () {
        $('#dialog').fadeOut(100).remove();
        $('#mark').fadeOut(100).remove();
    }
    $.markToggle = function (opt) {
        var opts = $.extend(defaults, opt);
        var markH = $(window).height();
        var markW = $(window).width();
        var _selector = opts.selector;
        var _top = $(_selector).offset().top + parseInt($(_selector).outerHeight());
        _top = (_top == undefined) ? 0 : _top;
        if (!$('#mark').hasClass('temp')) {
            $(document.body).append('<div id="mark" class= "temp" style="position:absolute;left:0px;top:' + _top + 'px;width:' + markW + 'px;height:1800px;"></div>');
        }
        switch (opts.animation) {
            case 'slideDown':
                $('#mark').slideDown(100);
                break;
            case 'show':
                $('#mark').show(100);
                break;
            case 'fadeIn':
                $('#mark').fadeIn(100);
                break;
            default:
                $('#mark').slideDown(100);
                break;
        }
    }
})(jQuery);
/*正则*/
var regJson = {
    'phone': { 'reg': /^[1][3-9][0-9]{9}$/, 'text1': '必填项，手机号不能为空!', 'text2': '输入错误！' },
    'email': { 'reg': /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, 'text1': '必填项，邮箱不能为空!', 'text2': '邮箱格式不正确，请从新填写！' },
    'name': { 'reg': /^[\u4E00-\u9FA5]{2,4}$/, 'text1': '必填项，姓名不能为空!', 'text2': '输入错误！' },
    'undefined': { 'reg': /\S/, 'text1': '不能为空！', 'text2': '不能为空！' },
    'shengfenzhen': { 'reg': /^\d{8,18}|[0-9x]{8,18}|[0-9X]{8,18}?$/, 'text1': '必填项，身份证不能为空!', 'text2': '输入错误！' },
}
/*点击 滑动*/
function readySwipter() {
    var jqSwiper = document.getElementById("horNav");
    var preview = ($(window).width() >= 400) ? 5 : 4;
    var itemWidth = $(window).width() / preview;
    var itemLenght = $('#horNav .swiper-slide').length;
    var thisIndex = $('#horNav .swiper-slide.active').index();
    var lastX = -itemWidth * (itemLenght - preview); //窗口显示区域外导航长度
    var thisX = -itemWidth * (thisIndex - 1); //高亮之前的导航长度
    if (thisIndex >= 3) {
        if (thisIndex > (itemLenght - preview)) {
            jqSwiper.style.WebkitTransform = jqSwiper.style.transform = "translate3d(" + lastX + "px,0,0)";
        } else {
            jqSwiper.style.WebkitTransform = jqSwiper.style.transform = "translate3d(" + thisX + "px,0,0)";
        }
    }
}
/**
 * 滑动nav 相对定位
 */
function scrollSwipt() {
    if ($('#horNav').length > 0) {
        var swiptrOldTop = $('#horNav').offset().top;
    }
    $(window).scroll(function () {
        var winTop = $(window).scrollTop();
        if (winTop >= swiptrOldTop) {
            $('#horNav').parents('.tabmove').css({
                position: 'fixed',
                top: '0px',
                left: '0px'
            });
            if ($(".havMes").length > 0) {
                if ($(".pos-hav-mes").length == 0) {
                    $(".tabmove").before("<div class='pos-hav-mes' style='position:relative;height:40px;'></div>")
                }
            }
            if ($(".tabmove").parent().is("nav.slide")) {
                $(".tabmove").parent().css({
                    position: 'fixed',
                    top: '0px',
                    left: '0px'
                });
                $(".cover").css("top", "40px");
            };
        } else {
            $('#horNav').parents('.tabmove').css({
                position: 'relative',
            });
            $(".pos-hav-mes").remove();
            $(".tabmove").parent().css({ position: 'relative' });
            $(".cover").css("top", "93px");
        }
    })
}

function flTopFixed() {
    var ccooua = navigator.userAgent.toLowerCase();
    var isApp = ccooua.indexOf('ccoocity') > -1;
    $(window).scroll(function () {
        var winTop = $(window).scrollTop();
    })
}
$(function () {
    addJsMd5();
    setTimeout(function () {
        flTopFixed();
    }, 100)
})
/**
 * 滑动nav
 */
function swipter() {
    //页面刷新，重新定位
    $(document).ready(function () {
        readySwipter();
    });
    var preview = ($(window).width() > 400) ? 5 : 4;
    //滑动插件js
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: preview,
    });
    //点击
    $('#horNav .swiper-slide').on('click', function () {
        $('#horNav .swiper-slide').removeClass('active');
        $(this).addClass('active');
        //延迟动画
        // var jqSwiper = document.getElementById("horNav");
        // jqSwiper.style.transition = jqSwiper.style.WebkitTransition = "0.5s";
        // readySwipter();
    });
    //滑动
    scrollSwipt();
}

function loadImg(sel) {
    showImg(sel);
    //按需加载图片
    window.onscroll = showImg;

    function showImg(sel) {
        sel = (sel == 'undefined') ? document : sel;
        //获取所有图片
        var oImg = document.getElementsByTagName('img');
        //滚动的高度
        var scorllTop = document.documentElement.scrollTop || document.body.scrollTop;
        for (var i = 0; i < oImg.length; i++) {
            //alert(oImg.length);
            //当滚动的高度+可视区的高大于 图片距离顶部的高度 【图片可见】且 自定义属性isLoad为假
            //第一次加载才行
            if ((scorllTop + document.documentElement.clientHeight) > getTop(oImg[i]) && !oImg[i].isLoad) {
                oImg[i].src = oImg[i].getAttribute("_src");
                oImg[i].isLoad = true;
            }
        }
    }
    //距离顶部高度
    function getTop(obj) {
        var iTop = 0;
        while (obj) {
            iTop += obj.offsetTop;
            obj = obj.offsetParent;
        }
        return iTop;
    }
}

function tip1(text) {
    $('body').append('<div class="tip1">' + text + '</div>');
    var left = -($('.tip1').outerWidth() / 2) + 'px';
    $('.tip1').css({ 'marginLeft': left });
    setTimeout(function () { $('.tip1').fadeOut(); }, 4000)
}
/**
 * [scrollFix 个人主页浮动js]
 * @param  {[type]} fixEle    [浮动el]
 * @param  {[type]} scrollEle [滑动el]
 * @param  {[type]} headerEle [头部el]
 * @return {[type]}           [description]
 */
function scrollFix(fixEle, scrollEle, headerEle) {
    var swiptrOldTop = $(fixEle).offset().top;
    var headerHeight = $(headerEle).height() + 'px';
    var thisHeight = $(fixEle).outerHeight();
    var lastEHeight = $(scrollEle).height();
    $(window).scroll(function () {
        var winTop = $(window).scrollTop();
        $(fixEle).width($(window).width());
        if (swiptrOldTop < (winTop + 50)) {
            $(fixEle).css({
                position: 'fixed',
                top: headerHeight,
                left: '0px'
            });
            $(scrollEle).css({ marginBottom: thisHeight + 'px' })

        } else {
            $(fixEle).css({
                position: 'relative',
                top: '0',
            });
            $(scrollEle).css({ marginBottom: 0 })
        }
    })
    // return scrollFix;
}

function scrollFix1(fixEle, scrollEle, headerEle) {
    $(document).ready(function () {
        readySwipter();
    });
    var preview = ($(window).width() > 400) ? 5 : 4;
    //滑动插件js
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: preview,
    });
    //点击
    $('#horNav .swiper-slide').on('click', function () {
        $('#horNav .swiper-slide').removeClass('active');
        $(this).addClass('active');
        //延迟动画
        var jqSwiper = document.getElementById("horNav");
        jqSwiper.style.transition = jqSwiper.style.WebkitTransition = "0.5s";
        readySwipter();
    });
    var swiptrOldTop = $(fixEle).offset().top;
    var headerHeight = $(headerEle).height() + 'px';
    var thisHeight = $(fixEle).outerHeight();
    var lastEHeight = $(scrollEle).height();
    $(window).scroll(function () {
        var winTop = $(window).scrollTop();
        $(fixEle).width($(window).width());
        if (swiptrOldTop < (winTop + 50)) {
            $(fixEle).css({
                position: 'fixed',
                top: headerHeight,
                left: '0px'
            });
            $(scrollEle).css({ marginBottom: thisHeight + 'px' })

        } else {
            $(fixEle).css({
                position: 'relative',
                top: '0',
            });
            $(scrollEle).css({ marginBottom: 0 })
        }

    })
}
$('.ifo2footer .tablecell').on('click', function () {
    $('.ifo2footer .tablecell').removeClass('active');
    $(this).addClass('active');
});
//APPdown
var siteDatas = getSiteDownInfo();
var isXingWenAppDownIcon = siteDatas.iosLogo;
/*var isXingWenAppDownIcon = '//img.pccoo.cn/wap/images/ioc-logo.png';
if($.cookie("siteid") == 2045 || $.cookie("siteid") == 789 || $.cookie("siteid") == 1507){
    var siteDatas = getSiteDownInfo();
    isXingWenAppDownIcon = siteDatas.iosLogo;
}*/
function openewmDia() {
    $('.erweima-dia').show()
}
function closewmDia() {
    $('.erweima-dia').hide()
}
function fbAppDown(pos, city, des) {
	//搜索引擎不展示弹窗
	if (ccooShare.isBaiduSpider() || ccooShare.is360Spider() || ccooShare.isSogouSpider())
	{
		return;
	}
	
    $(".A14_140123W").remove();
    pos.after('<section class="A14_140123WFB disflex"><i class="A_logo"></i><div class="flexn A_des"><p class="A_city">下载' + city + 'APP</p><p class="A_des">' + des + '</p></div><a class="A_link" href="https://img.pccoo.cn/wap/downapp.html">直接打开</a><span class="A_close"></span><span class="A_bg"></span></section>');
}

function appDownSign(pos, city, des) {
    function Dom(pos, city, des, data) {
        var diaHtml;
        // if (!isNaN(data.allFans) &&  (parseInt(data.allFans) == 0 || parseInt(data.allFans) < 10000)) {
        //     diaHtml = '<p class="info1">' + data.cityName + '事，早知道<br>' + data.cityName + '本地人都在关注</p>'
        // } else {
        //     diaHtml = '<p class="info1">' + data.cityName + '事，早知道<br>' + data.cityName + data.allFans + '人都在关注</p>'

        // }
        //原微信文档：订阅本地每日热点头条
        //新微信文档：关注本地疫情动态
        //diaHtml = '<p class="info1">订阅本地每日热点头条<br>' + data.cityName + '本地人都在关注</p>'
        diaHtml = '<p class="info1">' + data.cityName + '事，早知道<br>' + data.cityName + '本地人都在关注</p>';
        var html = '<div class="A14_140123W" style="visibility:visible !important;overflow:hidden;background: rgba(0,0,0,.7);">\
            <div class="swiper-container erwei-swiper">\
                <div class="swiper-wrapper" style="display:block;background:transparent">\
                    <div class="swiper-slide" style="height:46px;background:#444">\
                        <div class="im"><img src="'+ isXingWenAppDownIcon + '"></div>\
                        <div class="tx"><h3>下载'+ city + 'APP</h3><p>' + des + '</p></div>\
                        <a class="down" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">直接打开<i class="icon-A14_140123W download"></i></a>\
                        <a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a>\
                    </div>\
                    <div class="swiper-slide" style="height:46px;background:#444">\
                    <div class="im"><img src="https://img.pccoo.cn/wap/images/ioc-weilogo.png"></div>\
                    <div class="tx tx1"><h3>关注'+ city + '官方微信</h3><p>订阅本地每日热点头条</p></div>\
                        <a  class="down" href="javascript:;" onclick="openewmDia()">立即关注</a>\
                        <a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <section class="erweima-dia">\
            <div class="erweima-box">\
                <p class="tit">'+ city + '官方微信</p> ' + diaHtml + '<div class="pic-box">\
                <img src="'+ data.wxewm + '" alt="">\
                </div>\
                <p class="txt">长按二维码识别关注</p>\
                <span class="x-close-btn" onclick="closewmDia()"><i class="iconfont icon-guanbi"></i></span>\
            </div>\
        </section>'
        pos.after(html)
        $(function () {
            function timer(opj) {
                $(opj).animate({
                    marginTop: "-46px"
                }, 1000, function () {
                    $(this).css({
                        marginTop: "0px"
                    }).find(".swiper-slide:first").appendTo(this);
                })
            }
            var num = $('.erwei-swiper .swiper-slide').length;
            if (num > 1) {
                var time = setInterval(function () {
                    timer(".erwei-swiper .swiper-wrapper")
                }, 5000);
            }
        })
    }
    $(".A14_140123W").remove();
    if (ccooShare.isWeixin()) {
        var oDate = parseInt(sessionStorage.getItem('GetWxEwmInfo'));
        var newDate = (new Date()).getTime();
        if (oDate != NaN && (newDate - oDate) < 180000) {
            var aData = JSON.parse(sessionStorage.getItem('GetWxEwmInfoData'))
            Dom(pos, city, des, aData)
        } else {
            $.ajax({
                url: '/home/GetWxEwmInfo',
                type: 'POST',
                success: function (res) {
                    if (res.wxewm != '') {
                        var d = new Date();
                        d = d.getTime()
                        sessionStorage.setItem('GetWxEwmInfo', d)
                        sessionStorage.setItem('GetWxEwmInfoData', JSON.stringify(res))
                        Dom(pos, city, des, res)
                    } else {
                        pos.after('<div class="A14_140123W" style="visibility:visible !important"><div class="im"><img src="' + isXingWenAppDownIcon + '"></div> <div class="tx"><h3>下载' + city + 'APP</h3><p>' + des + '</p></div><a class="down" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">直接打开<i class="icon-A14_140123W download"></i></a><a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a></div>');
                    }
                },
                error: function (err) {
                    pos.after('<div class="A14_140123W" style="visibility:visible !important"><div class="im"><img src="' + isXingWenAppDownIcon + '"></div> <div class="tx"><h3>下载' + city + 'APP</h3><p>' + des + '</p></div><a class="down" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">直接打开<i class="icon-A14_140123W download"></i></a><a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a></div>');
                }
            })
        }

    } else {
        pos.after('<div class="A14_140123W" style="visibility:visible !important"><div class="im"><img src="' + isXingWenAppDownIcon + '"></div> <div class="tx"><h3>下载' + city + 'APP</h3><p>' + des + '</p></div><a class="down" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">直接打开<i class="icon-A14_140123W download"></i></a><a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a></div>');
    }
}

function appDownHide(url, key) {
    var arr = key.split(","),
        flag = false;
    arr.forEach(function (obj, index) {
        if (url.indexOf(obj) > 0) {
            flag = true;
        }
    })
    return flag;
}

function changeAppDownDes(url, pos, city) {
    var appDJson = [
        { key: "/bbs/", val: "随时接收好友互动提醒" },
        { key: "/tieba/", val: "随时随地分享身边精彩" },
        { key: "/zhaopin/", val: "本地更多职位随时查阅" },
        { key: "/job/", val: "本地更多职位随时查阅" },
        { key: "/jianzhi/", val: "本地更多职位随时查阅" },
        { key: "/qiuzhi/", val: "本地更多职位随时查阅" },
        { key: "/zhaopinhui/", val: "本地更多职位随时查阅" },
        { key: "/mingqi/", val: "本地更多职位随时查阅" },
        { key: "/fangwu/", val: "更多房源 任你选择" },
        { key: "/xinloupan/", val: "更多房源 任你选择" },
        { key: "/ershou/", val: "更多同城二手 任你选择" },
        { key: "/pinche/", val: "随时掌握同城拼车信息" },
        { key: "/cheliang/", val: "查看更多二手车信息" },
        { key: "/jiaoyou/", val: "查看更多同城交友信息" },
        { key: "/pet/", val: "查看更多宠物交易信息" },
        { key: "/shenghuo/", val: "查看更多生活服务信息" },
        { key: "_ELSE_", val: "关注本地人 家乡事" }
    ],
        appDFlag = false,
        appDHide = "/login/,/home/,/message/,/reg/,/user/,/task/,/fabu,/job/jobkind,/users/,/ActivityTmp/,/from_finish,/redpacketindex,/photo_show,/post/zhaopinhui,/ontheway,/appvote",
        appSiteId = ["1254","325"];
    //按site_id整站去除下载提示
    var _siteId = $.cookie("siteid");
    if (appSiteId.indexOf(_siteId) > -1) {
        return;
    }
    //政务号判断并去除弹窗
    if ($('#hidAppDownTip').val() == 1)
        return;
    if (!appDownHide(url, appDHide)) {
        appDJson.forEach(function (obj, k) {
            if (url.indexOf(obj.key) > 0) {
                appDownSign(pos, city, obj.val);
                appDFlag = true;
            }
        })
        if (!appDFlag) {
            if (url.indexOf("/post/") > 0) {
                appDownSign(pos, city, "查阅更多生活服务信息")
            } else if (url.indexOf('ccoo.cn/xiangqin') > 0) {
                appDownSign(pos, city, "本地相亲找对象")
            } else {
                appDownSign(pos, city, "关注本地人 家乡事")
            }
        }
    }
}
/* 2018-9-13更改APP下载弹窗参数 by xn */
function getAppDownLoadWin(msg, hidCallback, btn_name, href2) {
    if (!btn_name) { btn_name = '下次再说' };
    var html = '<div class="xdialogwrap" id="x-openAppDia">' +
        '<div class="xdialog-innerbox">' +
        '<p class="xdialog-title">' + msg + '</p>' +
        '<span class="xdialog-canel">' + btn_name + '</span><span class="xdialog-down" onclick="try_to_open_app()">打开APP</span>' +
        '</div>' +
        '</div>'
    $('body').append($(html))

    if (ccooShare.isWeixin()) {
        var href = window.location.href;
        if (href.indexOf('/bbs/tie.aspx') > -1) {
            href = href.substring(0, href.indexOf('tie.aspx'))
        }
        if (href.indexOf('/tieba/huatiadd.aspx') > -1) {
            href = href.substring(0, href.indexOf('huatiadd.aspx'))
        }
        if (href.indexOf('/task/task_show.aspx') > -1) {
            href = href.substring(0, href.indexOf('task_show.aspx'))
        }
        if (!$('.xdialog-down').attr('data-clipboard-text')) {
            $.ajax({
                url: '/common/getappcode',
                data: { htmlUrl: href },
                type: 'POST',
                success: function (res) {
                    $('.xdialog-down').attr('data-clipboard-text', res.code)
                }
            })
        }
        new ClipboardJS('.xdialog-down', {
            text: function (trigger) {
                // tipFun2('复制成功');
                return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
            },
        });
    }
    $('.xdialog-canel').click(function () {
        $('#x-openAppDia').remove();
        if (hidCallback)
            hidCallback();
    })
}

//手机验证
var _RegTelPhone_ = /(^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$)|(^((\(\d{3}\))|(\d{3}\-))?(1[3456789]\d{9})$)/;
var _RegPhone_ = /^[1][3456789][0-9]{9}$/;
//下载弹窗
function setAppDownCookie(name, time, val) {
    var date = new Date();
    date.setTime(date.getTime() + time * 1000);
    $.cookie(name, val, { path: '/', expires: date });
}

function appDownNext() {
    $(".downBox-mask,.downBox").remove();
    setAppDownCookie("_appDialogTime", 1800, 2);
}

function appDownLink() {
    appDownNext();
    // window.location.href = "https://img.pccoo.cn/wap/downapp.html";
    var href = window.location.href;
    var return_url = window.location.href;
    var b = browser();
    var that = this;
    var _siteId = $.cookie("siteid");
    //if ( _siteId == 2045 || _siteId == 789 || _siteId == 1507) {
    if (!$('.down').attr('data-clipboard-text') || !$('.ch-now a').attr('data-clipboard-text') || !$('.A_link').attr('data-clipboard-text') || !$('.down-link').attr('data-clipboard-text')) {
        $.ajax({
            url: '/common/getappcode',
            data: { htmlUrl: window.location.href },
            type: 'POST',
            async: false,
            success: function (res) {
                $('.down').attr('data-clipboard-text', res.code)
                $('.ch-now a').attr('data-clipboard-text', res.code)
                $('.A_link').attr('data-clipboard-text', res.code)
                $('.down-link').attr('data-clipboard-text', res.code)
            }
        })
    }
    setTimeout(function () {
        var siteDatas = getSiteDownInfo();
        if (b.ios || b.iPhone || b.iPad) {
            window.location = siteDatas.iosUrl + return_url;
        } else if (b.android) {
            window.location = siteDatas.androidUrl + return_url;
        }
    }, 500)
    timeout = setTimeout('open_appstore()', 1000);
    /*} else {
        if (b.ios || b.iPhone || b.iPad) {
            window.location = "ccoo939332605://jumpLink?type=2&ids=0,0,0,&url=" + href;
        } else if (b.android) {
            window.location = "ccoocity://ccoo.cn/jumpLink?type=2&ids=0,0,0,&url=" + href;
        }
        timeout = setTimeout('open_appstore()', 1000);
    }*/
    // if ($.cookie('siteid') == 1507) {

    //     if (b.ios || b.iPhone || b.iPad) {
    //         window.location = "ccoo939332605://jumpLink?type=2&ids=0,0,0,&url=" + href;
    //     } else if (b.android) {
    //         window.location = "ccoocity://ccoo.cn/jumpLink?type=2&ids=0,0,0,&url=" + href;
    //     }
    //     timeout = setTimeout('open_appstore()', 1000);
    // } else {
    //     window.location.href = "https://img.pccoo.cn/wap/downapp.html";
    // }
}

function appDownDialogShow(city) {
    var _html = '<div onclick="appDownNext()" class="downBox-mask"></div><div class="downBox"><div class="down-tit"><p>下载' + city + '客户端</p><p>（城市通APP）</p></div><ul class="down-info disflex"><li><em></em>操作更容易 更流畅 更省流量</li><li><em></em>本地头条热点随时掌握</li><li><em></em>及时接收好友互动提醒</li></ul><div class="down-choose disflex"><span onclick="appDownNext()" class="ch-next">下次再说</span><span class="ch-now"><a style="display:block;color:#fff" onclick="appDownLink()" href="javascript:;">打开APP</a></span></div></div>';
    $("body").append(_html)
    if (ccooShare.isWeixin()) {
        if (!$('.ch-now a').attr('data-clipboard-text')) {
            $.ajax({
                url: '/common/getappcode',
                data: { htmlUrl: window.location.href },
                type: 'POST',
                success: function (res) {
                    $('.ch-now a').attr('data-clipboard-text', res.code)
                }
            })
        }
        new ClipboardJS('.ch-now a', {
            text: function (trigger) {
                // tipFun2('复制成功');
                return trigger.getAttribute('data-clipboard-text'); // 返回需要复制的内容
            },
        });
    }
}

function browserRedirect() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
        return false
    } else {
        return true
    }
}

function appDownstatus(city) {
    if (!browserRedirect()) {
        return
    }
    //var appSiteId=["1254"];
    ////按site_id整站去除下载提示
    //var _siteId = $.cookie("siteid");
    //if(appSiteId.indexOf(_siteId)>-1){
    //    return;
    //}
    var _siteId = $.cookie("siteid");
    //url和siteid为字符串，siteid多个时用逗号隔开url最多一个  url为空时匹配到的站点所有webapp页面不展示下载提示     site_id为空时所有站点匹配到的url页面的不展示下载提示
    var whiteList =[
            {url:'/post/zhaopinhu',siteid:'128'}
        ];
    var pageUrl = location.href;
    var noShow = false;
    for(var i=0;i<whiteList.length;i++){
        var item = whiteList[i];
        if(!item.url && item.siteid!=0){
            if(item.siteid.split(',').indexOf('_siteId')>-1){
                noShow=true;
            }
        }
        if(item.siteid==0 && item.url && pageUrl.indexOf(item.url)!=-1){
            noShow=true;
        }
        if(item.url && item.siteid!=0 && pageUrl.indexOf(item.url)!=-1 && item.siteid.split(',').indexOf(_siteId)!=-1){
            noShow=true;
        }
    }
    if(noShow) return;

    //增加第一次不弹框限制
    var _appDialogOne = $.cookie("_appDialogOne");
    if (_appDialogOne == null) {
        //setAppDownCookie("_appDialogTime", 300, 1); //占时去掉，第一次进入时要弹下载
        setAppDownCookie("_appDialogOne", 350, 1);
    }

    //政务号判断并去除弹窗
    if ($('#hidAppDownTip').val() == 1)
        return;
    var refurl = document.referrer;
    var _appDialogTime = $.cookie("_appDialogTime");
    if ($(".no_appdownload").length == 0 && window.location.href.indexOf("/fabu") <= 0 && window.location.href.indexOf("from_finish") <= 0 && window.location.href.indexOf("/login") <= 0) {
        if (_appDialogTime == null) {
            if (window.location.href.indexOf('http://media.ccoo.cn/') != -1) return

            //招聘详情存在简历提示弹框是不展示下载
            if (localStorage.getItem("JobViewCount") != '' && localStorage.getItem("JobViewCount") != 'NaN') {
                var viewnum = parseInt(localStorage.getItem("JobViewCount"));
                if (viewnum >= 8) {
                    return;
                }
            }

            //房产详情获取底价提示弹框是不展示下载
            var nowday = new Date().getFullYear().toString() + (new Date().getMonth() + 1).toString() + new Date().getDate().toString();
            var key_tj = localStorage.getItem("_lasttime" + $.cookie("siteid") + '_' + nowday);
            if (key_tj != null && !key_tj) {
                return;
            }

            setAppDownCookie("_appDialogTime", 600, 1);
			//搜索引擎不展示弹窗
			if (ccooShare.isBaiduSpider() || ccooShare.is360Spider() || ccooShare.isSogouSpider())
			{
                return;
            }
            // jQuery.ajax({
            //     url: "/Handler/js/AppDownload.ashx",
            //     type: "POST",
            //     success: function (data) {
            //         if (data == 0) {
            //             appDownDialogShow(city); //下载弹窗
            //         }
            //     }
            // });
        }
    }
}
$(function () {
    if ((document.URL).indexOf('#andriod_redirect') > 0 || (document.URL).indexOf('#ios_redirect') > 0) {
        $("header,div.bottom_nav").not(".sh").hide();
        document.cookie = "agent=1;path=/";
        document.cookie = "isheader=1;path=/";
    }
    var isheader = $.cookie("isheader");
    var sitename = "城市通";
    var localURL = window.location.href;
    var appDownFb = ["发帖更容易 及时接收互动提醒", "可上传小视频 及时接收互动提醒", "可上传小视频 获得更多关注"];
    if ($.cookie("sitename") != "" && $.cookie("sitename") != null) {
        sitename = $.cookie("sitename").replace(/手机/, "");
    }
    if (isheader != 1 && localURL.indexOf("webapp.ccoo.cn") < 0) {
        appDownstatus(sitename);
    }
    if (isheader != 1 && $(".notdown").length == 0 && $(".A14_140123W").length == 0 && $(".find_job_person").length == 0) {
        var downapp = (/MicroMessenger/i.test(navigator.userAgent)) ? "http://a.app.qq.com/o/simple.jsp?pkgname=com.www.ccoocity.ui" : ((/iPhone/i.test(navigator.userAgent)) ? "https://itunes.apple.com/cn/app/ccoo-cheng-shi-tong/id939332605" : "http://a.app.qq.com/o/simple.jsp?pkgname=com.www.ccoocity.ui");
        if ((/Android|iPhone/i.test(navigator.userAgent) && $.cookie("appdown") != 1 && $("header").length > 0)) {
            // $("header.header-list").after('');
            changeAppDownDes(localURL, $("header.header-list"), sitename)
            if ($("header.header1").length > 0 && $("#babyBanner").length > 0) {
                $("#babyBanner").after('<div class="A14_140123W" style="visibility:visible !important"><div class="im"><img src="' + isXingWenAppDownIcon + '"></div> <div class="tx"><h3>下载' + sitename + 'APP</h3><p>关注本地人 家乡事</p></div><a class="down" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">直接打开<i class="icon-A14_140123W download"></i></a><a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a></div>');
                changeAppDownDes(localURL, $("#babyBanner"), sitename)
            }
            var fbHtml = '',
                fbDes = '';
            if (localURL.indexOf("/bbs/tie.aspx") > 0 && localURL.indexOf("/login/?") < 0) {
                fbDes = appDownFb[0];
                fbAppDown($("header.header-list"), sitename, fbDes);
            }
            if (localURL.indexOf("/tieba/huatiadd.aspx") > 0 && localURL.indexOf("/login/?") < 0) {
                fbDes = appDownFb[1];
                fbAppDown($("header.header-list"), sitename, fbDes);
            }
            if (localURL.indexOf("/cover/add.aspx") > 0 && localURL.indexOf("/login/?") < 0) {
                fbDes = appDownFb[2];
                fbAppDown($("#form1"), sitename, fbDes);
            }
            if ($(".A_close").length > 0) {
                $(".A_close").click(function () {
                    $(".A14_140123WFB").remove();
                    var date = new Date();
                    date.setTime(date.getTime() + 1800 * 1000);
                    $.cookie("appdown", 1, { path: '/', expires: date });
                    $(".A14_140123WFB").remove()
                })
            }
        } else if ($.cookie("appdown") != 1 && ((document.URL).indexOf('shareinfo.aspx') > 0 || (document.URL).indexOf('sxinfo.aspx') > 0)) {
            var _appbox = $('.xAdBox-top').length > 0 && '.xAdBox-top' || '.header-share';
            $(_appbox).before('<div class="A14_140123W" style="visibility:visible !important"><div class="im"><img src="' + isXingWenAppDownIcon + '"></div> <div class="tx"><h3>下载' + sitename + 'APP</h3><p>关注本地人 家乡事</p></div><a class="down" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">直接打开<i class="icon-A14_140123W download"></i></a><a id="closedow" href="javascript:;"><span><i class="icon-A14_140123W cross"></i></span></a></div>');

            $(window).scroll(function () {
                var top = $(window).scrollTop();
                if (top >= 50) {
                    $(".A14_140123W").css("position", "fixed");
                } else { $(".A14_140123W").css("position", "static"); }
            })

        }
        var _tpAppvote = "appvote";
        if (localURL.indexOf(_tpAppvote) > 0) {
            $(".A14_140123W").remove();
            $("header.header-list").before('<div class="A14_child" style="height:46px;"></div><div class="A14_140123W disflex" style="visibility:visible !important;position:fixed;top:0;left:0;z-index:2018;"><div class="im"><img src="' + isXingWenAppDownIcon + '"></div><p class="flexn" style="line-height:46px;color:#fff;font-size:14px;text-align:center;">打开“城市通”，为TA投一票</p> <a class="down" style="width:60px;margin-right:10px" href="javascript:;" data-clipboard-text="" onclick="try_to_open_app()">打开</a></div>');
        }
        $("body").on('click', '#closedow', function () {
            var date = new Date();
            date.setTime(date.getTime() + 300 * 1000);
            $.cookie("appdown", 1, { path: '/', expires: date });
            $(".A14_140123W,.A14_child").remove()
        })
    }
});
//旧版分享
function showTebox(tit, cont) {
    //微信分享
    if (/MicroMessenger/i.test(navigator.userAgent)) {
        if (!document.querySelector('#tip')) {
            $(document.body).append('<div id="tip" style="display:none"><div id="tipcon"></div></div>')
        }
        $('#tip').show().bind('click', function () {
            $(this).hide()
        });
        return;
    }
    $("#showTebox").remove();
    $("body").append('<div id="showTebox"><div id="showTit"><span>' + tit + '</span><i id="close">×</i></div><div class="dowcont">' + cont + '</div></div>');
    $("#showTebox").css({
        "top": Math.floor($(window).height() / 2 + $("body").scrollTop() - $("#showTebox").outerHeight() / 2) + "px"
    });
    $("#showTit i").click(function () {
        $("#showTebox").remove()
    })
};

function showAlertBox(url) {
    $("#nav_tools").toggleClass("navhover");
    $("#showTebox").remove();
    url = (url == undefined) ? document.URL : url;
    showTebox("分享到", '<ul class="fxconte"><li><a class="weibo" href="http://service.weibo.com/share/share.php?raltateUid=&amp;url=' + encodeURIComponent(url) + '"><i></i></a>新浪微博</li><li><a class="tenct" href="http://v.t.qq.com/share/share.php?url=' + encodeURIComponent(url) + '"><i></i></a>腾讯微博</li><li><a class="qzon" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + encodeURIComponent(url) + '"><i></i></a>QQ空间</li></ul>')
};
//底部招商
function showAddUs() {
	//搜索引擎不展示弹窗
	if (ccooShare.isBaiduSpider() || ccooShare.is360Spider() || ccooShare.isSogouSpider())
	{
		return;
	}
    var isjf = $.cookie("isjf");
    if (isjf == null || isjf == 0) {
        $.ajax({
            url: '/common/getopensite',
            type: 'get',
            success: function (data) {
                document.cookie = "isjf=" + data + ";path=/";
                if (data == 0) {
                    zsAd();
                }
            }
        });
    } else if ($.cookie("isjf") == 0 && $(".index_banner").length == 0) {
        zsAd();
    }
}

function zsAd() {
    var url = location.href,
        bool = true;
    var addrs = [
        'jobshow.aspx',
        'jzshow.aspx',
        'jlshow.aspx',
        'fw_showcs.aspx',
        'fw_showcz.aspx',
        'shop_detail.aspx',
        'ershou_show.aspx',
        'topic.aspx',
        'news_show.aspx',
        'cnews/shareinfo.aspx'
    ];
    for (var i = 0; i < addrs.length; i++) {
        if (url.indexOf(addrs[i]) > -1) {
            bool = false;
            break;
        }
    }
    if (bool)
        return false;
    //添加底招商广告
    $('body').append('<div class="wmbottom_nav_mask1" id="mask">' +
        '<span class="close_us">×</span>' +
        '<a href="http://m.ccoo.net.cn/mesContactus?type=1#demo1" class="link_us">加盟、代理' +
        '</a>' +
        '</div>');
}
function randomAdPic() {
    //页面广告随机图片
    if ($('.ccooadvclick').length) {
        var imgList = [
            'http://p21.pccoo.cn/news/20220426/2022042614004150831165_640_150.gif',
            'http://p21.pccoo.cn/news/20220426/2022042614010331958022_640_150.gif',
            'http://p21.pccoo.cn/news/20220426/2022042614011690675513_640_150.png',
            'http://p21.pccoo.cn/news/20220426/2022042614013153198712_640_150.png',
            'http://p21.pccoo.cn/news/20220424/2022042415501543924960_640_150.gif',
        ]
        var index = Math.floor(Math.random() * imgList.length);
        $('.ccooadvclick').find('img').attr('src', imgList[index]);
    }
}
$(function () {
    // var isjf = $.cookie("isjf");
    // var istimed = $.cookie('istimed') || 1552639369000;

    // if (window.location.href.indexOf('http://media.ccoo.cn/') != -1) return
    // if (isjf != 1) {
    //     showAddUs();
    // } else {
    //     var _t = new Date().getTime();
    //     var _dif = (_t - istimed);
    //     if (_dif > 300000) {
    //         $.cookie("isjf", 0, { path: '/' });
    //         showAddUs();
    //     }
    // }
    $("body").delegate(".close_us", "click", function () {
        var _t = new Date().getTime();
        $('#mask').hide();
        $.cookie("isjf", 1, { path: '/' });
        $.cookie('istimed', _t, { path: '/' })
    })
    //解决IOS fixed获得焦点不滚动问题
    if ($(".formdiv").length > 0) {
        if ($("header").length > 0) {
            $(".formdiv").css({ "position": "absolute", "top": "50px", "bottom": "0", "overflow": "scroll", "width": "100%", "-webkit-overflow-scrolling": "touch" })
        } else {
            $(".formdiv").css({ "position": "absolute", "top": "0", "bottom": "0", "overflow": "scroll", "width": "100%", "-webkit-overflow-scrolling": "touch" })
        }
    }
    //安卓6.9.2升级功能
    refreshAndroidApp('当前城市通APP版本过低，部分功能可能无法使用，请更新为最新版本6.9.3！')
});
// 微信新版一键分享ccooshare()
function wx_share() {
    // 微信新规则10/22：去掉分享提示遮罩
    // $("body").append('<div id="share_box"></div>')
    // $("body").on("click", "#share_box", function () {
    //     $("#share_box").remove()
    // })
    tipFun('点击右上角···分享给好友')
};


function orShare(elementNode, config) {
    config = config || {};
    dzId = config.dzId || 0;
    tId = config.tId || 0;
    // console.log(dzId+"||"+tId)
    smAjax({
        url: "/Common/ShareMethod",
        data: { "dzId": dzId, "tId": tId },
        type: "post",
        success: function (data) {
            if (data.code == 1000) {
                //调用分享动作成功
                // tipFun(data.message);
            } else { }
        }
    });
    tipLoadingRemove();
};
var ccooShare = {
    bLevel: {
        qq: { forbid: 0, lower: 1, higher: 2 },
        uc: { forbid: 0, allow: 1 }
    },
    UA: navigator.appVersion,
    isqqBrowser: function () {
        return (this.UA.split("MQQBrowser/").length > 1) ? ccooShare.bLevel.qq.higher : ccooShare.bLevel.qq.forbid
    },

    // var isqqBrowser = (UA.split("MQQBrowser/").length > 1) ? bLevel.qq.higher : bLevel.qq.forbid;
    isucBrowser: function () {
        return (this.UA.split("UCBrowser/").length > 1) ? ccooShare.bLevel.uc.allow : ccooShare.bLevel.uc.forbid
    },
    isbaiduBrowser: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/baidubrowser/) != null ? 1 : 0
    },
    isbaiduChajian: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/baiduboxapp/) != null ? 1 : 0
    },
    issougouBrowser: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/metasr/) != null ? 1 : 0
    },
    isliebaoBrowser: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/lbbrowser/) != null ? 1 : 0
    },
	isBaiduSpider: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/Baiduspider/) != null ? 1 : 0
    },
	is360Spider: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/360Spider/) != null ? 1 : 0
    },
	isSogouSpider: function () {
        var _ua = navigator.userAgent.toLocaleLowerCase();
        return _ua.match(/Sogou web spider/) != null ? 1 : 0
    },
    version: {
        uc: "",
        qq: ""
    },
    isWeixin: function () {
        return (this.UA.split("MicroMessenger/").length > 1) ? 1 : 0

    },
    nativeShare: function (elementNode, config) {
        var qApiSrc = {
            lower: "http://3gimg.qq.com/html5/js/qb.js",
            higher: "http://jsapi.qq.com/get?api=app.share",
            wxer: "http://res.wx.qq.com/open/js/jweixin-1.0.0.js"
        };
        config = config || {};
        this.elementNode = 'shareBox';
        this.url = config.url || document.location.href || '';
        this.title = config.title || document.title || '';
        this.desc = config.desc || document.title || '';
        this.img = config.img || "https://img.pccoo.cn/wap/WebApp/images/share.jpg" || '';
        this.img_title = config.img_title || document.title || '';
        this.from = config.from || window.location.host || '';
        this.ucAppList = {
            sinaWeibo: ['kSinaWeibo', 'SinaWeibo', 11, '新浪微博'],
            weixin: ['kWeixin', 'WechatFriends', 1, '微信好友'],
            weixinFriend: ['kWeixinFriend', 'WechatTimeline', '8', '微信朋友圈'],
            QQ: ['kQQ', 'QQ', '4', 'QQ好友'],
            QZone: ['kQZone', 'QZone', '3', 'QQ空间']
        };
        this.share = function (to_app) {
            var title = this.title,
                url = this.url,
                desc = this.desc,
                img = this.img,
                img_title = this.img_title,
                from = this.from;
            if (this.isucBrowser()) {
                to_app = to_app == '' ? '' : (platform_os == 'iPhone' ? this.ucAppList[to_app][0] : this.ucAppList[to_app][1]);
                if (to_app == 'QZone') {
                    B = "mqqapi://share/to_qzone?src_type=web&version=1&file_type=news&req_type=1&image_url=" + img + "&title=" + title + "&description=" + desc + "&url=" + url + "&app_name=" + from;
                    k = document.createElement("div"), k.style.visibility = "hidden", k.innerHTML = '<iframe src="' + B + '" scrolling="no" width="1" height="1"></iframe>', document.body.appendChild(k), setTimeout(function () {
                        k && k.parentNode && k.parentNode.removeChild(k)
                    }, 5E3);
                }
                if (typeof (ucweb) != "undefined") {
                    ucweb.startRequest("shell.page_share", [title, title, url, to_app, "", "@" + from, ""])
                } else {
                    if (typeof (ucbrowser) != "undefined") {
                        ucbrowser.web_share(title, title, url, to_app, "", "@" + from, '')
                    } else { }
                }
            } else if (this.isqqBrowser() && !this.isWx) {
                to_app = to_app == '' ? '' : this.ucAppList[to_app][2];
                var ah = {
                    url: url,
                    title: title,
                    description: desc,
                    img_url: img,
                    img_title: img_title,
                    to_app: to_app, //微信好友1,腾讯微博2,QQ空间3,QQ好友4,生成二维码7,微信朋友圈8,啾啾分享9,复制网址10,分享到微博11,创意分享13
                    cus_txt: "请输入此时此刻想要分享的内容"
                };
                ah = to_app == '' ? '' : ah;
                //browser.app.share(ah)
                if (typeof (browser) != "undefined") {
                    if (typeof (browser.app) != "undefined" && this.isqqBrowser() == this.bLevel.qq.higher) {
                        browser.app.share(ah)
                    }
                } else {
                    if (typeof (window.qb) != "undefined" && this.isqqBrowser() == this.bLevel.qq.lower) {
                        window.qb.share(ah)
                    } else { }
                }
            }
            // else if (this.isWx) {
            //     var ah = {
            //         title: title, // 分享标题
            //         desc: desc, // 分享描述
            //         link: url, // 分享链接
            //         imgUrl: img
            //     }
            //     switch (to_app) {
            //         case "weixin":
            //             wx.onMenuShareAppMessage(ah);
            //             break;
            //         case "weixinFriend":
            //             wx.onMenuShareTimeline(ah);
            //             break;
            //     }
            // }
        };
        this.html = function () {
            var position = document.getElementById(this.elementNode);
            var html = '<div class="share-bk-box"><div class="label">分享到</div>' +
                '<div class="list clearfix">' +
                '<span data-app="sinaWeibo" class="nativeShare1 weibo"><i></i>新浪微博</span>' +
                '<span data-app="weixin" class="nativeShare1 weixin"><i></i>微信好友</span>' +
                '<span data-app="weixinFriend" class="nativeShare1 weixin_timeline"><i></i>微信朋友圈</span>' +
                '<span data-app="QQ" class="nativeShare1 qq"><i></i>QQ好友</span>' +
                '<span data-app="QZone" class="nativeShare1 qzone"><i></i>QQ空间</span>' +
                '</div></div>' +
                '<div class="am-share-footer"><button class="share_btn">取消</button></div>';
            position.innerHTML = html;
        };
        this.isloadqqApi = function () {
            if (this.isqqBrowser() || this.isWx) {
                if (this.isWx) {
                    var b = qApiSrc.wxer
                } else {
                    var b = (this.version.qq < 5.4) ? qApiSrc.lower : qApiSrc.higher;
                };
                var d = document.createElement("script");
                var a = document.getElementsByTagName("body")[0];
                d.setAttribute("src", b);
                a.appendChild(d)
            }
        };
        this.getPlantform = function () {
            ua = navigator.userAgent;
            if ((ua.indexOf("iPhone") > -1 || ua.indexOf("iPod") > -1)) {
                return "iPhone"
            }
            return "Android"
        };
        // console.log(this)
        this.is_weixin = function () {
            var a = ccooShare.UA.toLowerCase();
            if (a.match(/MicroMessenger/i) == "micromessenger") {
                return true
            } else {
                return false
            }
        };
        this.getVersion = function (c) {
            var a = c.split("."),
                b = parseFloat(a[0] + "." + a[1]);
            return b
        };
        this.sharehtml = '<span class="nativeShare"><a class="wb" href="http://service.weibo.com/share/share.php?raltateUid=&amp;url=' + encodeURIComponent(this.url) + '"></a><br>微博</span><span class="nativeShare"><a class="kj" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + encodeURIComponent(this.url) + '"></a><br>QQ空间</span><span class="nativeShare"><a class="qwb" href="http://v.t.qq.com/share/share.php?url=' + encodeURIComponent(this.url) + '"></a><br>腾讯微博</span>';
        if (this.is_weixin()) {
            this.sharehtml = this.sharehtml + '<span data-app="weixin" class="nativeShare"><a class="wx" onClick="wx_share()"></a><br>微信好友</span><span data-app="weixinFriend" class="nativeShare"><a class="pyq" onClick="wx_share()"></a><br>朋友圈</span>'
        }
        this.init = function () {
            platform_os = this.getPlantform();
            this.version.qq = this.isqqBrowser() ? this.getVersion(ccooShare.UA.split("MQQBrowser/")[1]) : 0;
            this.version.uc = this.isucBrowser() ? this.getVersion(ccooShare.UA.split("UCBrowser/")[1]) : 0;
            this.isWx = this.is_weixin();
            if ((this.isqqBrowser() && this.version.qq < 5.4 && platform_os == "iPhone") || (this.isqqBrowser() && this.version.qq < 5.3 && platform_os == "Android")) {
                this.isqqBrowser = bLevel.qq.forbid
            } else {
                if (this.isqqBrowser() && this.version.qq < 5.4 && platform_os == "Android") {
                    this.isqqBrowser = bLevel.qq.lower
                } else {
                    if (this.isucBrowser() && ((this.version.uc < 10.2 && platform_os == "iPhone") || (this.version.uc < 9.7 && platform_os == "Android"))) {
                        this.isucBrowser = bLevel.uc.forbid
                    }
                }
            }
            this.isloadqqApi();
            if (this.isqqBrowser() && !this.isWx) {
                this.html();
                $('#shareBox').show();
            } else if (this.isucBrowser()) {
                this.share("");
            } else {
                $("#" + this.elementNode).html(this.sharehtml)
            };
        };
        this.init();
        var share = this;
        $('#shareBox').find('.nativeShare1').each(function () {
            $(this).on('click', function () {
                share.share($(this).attr('data-app'));
                $('#shareBox').hide();
            })
        })
        return this;
    },
    openshare: function (elementNode, config) {
        orShare(elementNode, config);
        //app内
        var ccooua = navigator.userAgent.toLowerCase();
        var isApp = ccooua.indexOf('ccoocity') > -1;
        if (ccooShare.isqqBrowser() && !isApp && !ccooShare.isWeixin()) {
            $('body').append('<div id="shareBox"></div><div class="sharebg"></div>');
        }
        if (ccooShare.isqqBrowser() && !isApp && !ccooShare.isWeixin() || ccooShare.isucBrowser() && !isApp && !ccooShare.isWeixin()) {
            this.nativeShare(elementNode, config);
        } else if (ccooShare.isWeixin()) {
            if (config && config.wx_type) {
                window.location.href = "http://" + config.url + (config.url.indexOf("?") > -1 ? "&wx_share_fl=1" : "?wx_share_fl=1")
            } else {
                wx_share()
            }
        } else if (isApp) {
            config = config || {};
            var elementNode = elementNode,
                url = config.url || document.location.href || '',
                title = config.title || document.title || '',
                desc = config.desc || document.title || '',
                img = config.img || "https://img.pccoo.cn/wap/WebApp/images/share.jpg",
                img_title = config.img_title || document.title || '',
                from = config.from || window.location.host || '';
            //console.log(url)
            onShare(title, desc, img, url);
            // 自动获取页面第一张图片
            // document.getElementsByTagName('img').length > 0 && document.getElementsByTagName('img')[0].src
            // $('#shareClick').attr("href","ccoo://onShare?title='"+title+"'&desc='"+title+"'&link='"+url+"'&imgUrl='"+img+"'");
        } else {
            ActionSheet.layer({
                content: '<div class="fxconts sharetabox">' + this.nativeShare().sharehtml + '</div>',
                button: [
                    ["取消", function () {
                        ActionSheet.close()
                    }]
                ]
            })
        }
    }
};
$(document).on('click', '.sharebg,.share_btn', function () {
    $('#shareBox').remove();
    $(".sharebg").remove();
})
var ActionSheet = {
    fade: '<div id="u_action" onClick="ActionSheet.close()"></div>',
    tbox: undefined,
    layer: function (id) {
        if (typeof (id.content) == "object") {
            ActionSheet.tbox = id.content.parent()
        } else {
            ActionSheet.tbox = undefined;
        }
        ActionSheet.fabulist(id.content, id.button);
        return id
    },
    fabulist: function (id, butn) {
        var buntxt = (butn != undefined) ? '<div class="u_butn_conts">' + butn[0][0] + '</div>' : "";
        if ($("#u_action").length == 0) {
            $("body").append(ActionSheet.fade + '<div class="u_actionsheet" id="u_actionsheet"></div>');
        }
        $("#u_action").show().addClass("u_fade_curr");
        $("#u_actionsheet").html('<div class="u_actionsheet_menu"><div></div></div>' + buntxt);
        $(".u_actionsheet_menu>div").html(id).css("max-height", $(window).height() / 2);
        $("#u_actionsheet").addClass("u_actionsheet_toggle");
        $(".u_butn_conts").on("click", function () {
            butn[0][1]()
        })
    },
    close: function (id) {
        if (ActionSheet.tbox != undefined) {
            ActionSheet.tbox.append($(".u_actionsheet_menu>div").html())
        }
        $("#u_action").hide().removeClass("u_fade_curr")
        $("#u_actionsheet").removeClass("u_actionsheet_toggle")
    },
    msg: function (msg, data) {
        var stimo, succfun = undefined;
        var tim = 3000;
        var top = "50%";
        var lateY = "translateY(-50%)";
        var posit = "fixed";
        var windht = $(window).height();
        if (data != undefined && typeof (data) == "object") {
            tim = (data.tim != undefined) ? data.tim : 3000;
            lateY = (data.top > 0 && data.top < 100) ? "translateY(-50%)" : ((data.top == 0) ? "" : "translateY(-100%)");
            if (data.position == "absolute") {
                posit = data.position;
                top = (data.top != undefined) ? (windht * data.top / 100 + $(document).scrollTop() * 1) + "px" : (windht / 2 + $(document).scrollTop() * 1) + "px";
            } else {
                posit = "fixed";
                top = (data.top != undefined) ? data.top + "%" : "50%";
            };
        } else if (data != undefined && typeof (data) == "function") {
            succfun = function () {
                data()
            }
        };
        if (msg !== "") {
            clearInterval(stimo);
            $("#msgboxcont").length > 0 ? $("#msgboxcont").html(msg) : $("body").append("<div id='msgboxcont' style='background:rgba(0,0,0,0.7); position:" + posit + "; top:" + top + ";left:50%;-webkit-transform:" + lateY + " translateX(-50%);border-radius:5px; line-height:20px; text-align:center;color:#FFF;font-size:16px;padding:10px; max-width:300px;z-index:9999;opacity:0;-webkit-transition:opacity .2s ease-in-out;word-wrap:break-word;'>" + msg + "</div>");
            $("#msgboxcont").css({
                "opacity": 1
            });
            setTimeout(function () {
                $('#msgboxcont').remove();
                if (succfun) {
                    succfun()
                }
            }, tim)
        }
    }
};
$(function () {
    //将tn res服务器转化为img服务器
    if ($(".top_nav").length > 0) {
        $(window).scroll(function () {
            if ($(document).scrollTop() > 48 && $(".top_zw").length == 0) {
                $(".top_nav").after("<div class='top_zw' style='height:40px;width:100%'></div>")
                $(".top_nav").addClass("top_nav_pos")
            } else if ($(document).scrollTop() <= 48 && $(".top_zw").length > 0) {
                $(".top_zw").remove()
                $(".top_nav").removeClass("top_nav_pos")
            }
        })
    }
})
//实现滚动条无法滚动
var mo = function (e) { e.preventDefault(); };
//取消滑动限制
function movescoll() {
    document.body.style.overflow = '';
    document.removeEventListener("touchmove", mo, false);
}
//禁止页面滑动动
function stopscoll() {
    document.body.style.overflow = 'hidden';
    document.addEventListener("touchmove", mo, false);
};
$(function () {
    if ($(".table.nav2 .tablecell").length > 0) {
        if ($(".table.nav2 .tablecell").length == 5) {
            $(".table.nav2 .tablecell").css("width", "20%")
        }
    }
    //随机广告图
    //randomAdPic();
})
//大图缩放预览
function bigImgShow(type) {
    function initSrc(src) {
        if (!src) {
            return;
        }
        if (type == 1) {
            src = src.replace("_500x300(w).", '.')
        } else {
            if (/^http:\/\/:p$/.test(src)) {
                src = src.replace("(s)", "(w)")
            } else {
                if (/\.gif/i.test(src)) {
                    src = src.replace('_300x225(s)', '').replace('_200x150(s)', '').replace('_400x300(s)', '').replace("http://r", "http://p");
                } else {
                    src = src.replace('300x225(s)', '500x300(w)');
                    src = src.replace('200x150(s)', '500x300(w)');
                    src = src.replace('400x300(s)', '500x300(w)');
                }
            }
        }
        return src
    }
    $(document).on("click", "#img_box img,.imgshow img", function (e) {
        adHref = $(this).parents('a').attr('href')
        if ($(this).parents().is('a') && adHref.indexOf('http') >= 0) {
            window.location.href = adHref
        } else {
            var index = $(this).index();
            var oLeft = $(window).width() * index
            e.preventDefault();
            var num = $(this).length;
            var arry = [];
            var reg = /.gif/gi;
            $(this).parents('#img_box,.imgshow').find("img").each(function () {
                var imgUrl = $(this).attr("data-original");
                if (!reg.test(imgUrl) && imgUrl) {
                    arry.push(initSrc(imgUrl));
                }
            });
            var current = initSrc($(this).attr("data-original"));
            var obj = {
                urls: arry,
                current: current
            };
            if (!current || current.indexOf("/Emotions/") >= 0) {
                return;
            }
            previewImage.start(obj);
        }
    });
}
// app关闭页面
function closeAppPage() {
    var ccooua = navigator.userAgent.toLowerCase();
    var isAndroid = ccooua.indexOf('ccoocity_android') > -1; //android终端
    var isiOS = ccooua.indexOf('ccoocity_ios') > -1; //ios终端
    if (isAndroid) {
        app.closePage();
    } else if (isiOS) {
        window.webkit.messageHandlers.app.postMessage({ 'functionName': 'closePage' });
    }
}



//  paytypeId paytype:1 套餐类 2：（发布刷新）类 3：jl
//打开弹窗
function payDialogTip(id, paytype, posttype) {
    var oPayBox = '<div class="pay-status-box-common disflex">' +
        '<div class="box-con">' +
        '<p class="p-tit">支付订单</p>' +
        '<a href="javascript:;" class="close-btn" onclick="closePayDia($(this))"></a>' +
        '<ul>' +
        '<li>1、如果已完成支付，请点击【支付完成】</li>' +
        '<li>2、如果未打开支付客户端或未完成支付，请点击【重新支付】可继续支付。</li>' +
        '</ul>' +
        '<div class="d-footer"><input type="button" value="重新支付" class="cx-pay-btn" onclick="payBillChk($(this),1,' + id + ',' + paytype + ',' + posttype + ')">' +
        '<input type="button" value="支付完成" class="pay-ok" onclick="payBillChk($(this),0,' + id + ',' + paytype + ',' + posttype + ')"></div></div>' +
        '</div>';
    $('body').append(oPayBox);
}

//再次发起支付
function payComplete(ele, id, paytype) {
    var oHtml = '<p class="p-tit">尚未获取支付结果</p>' +
        '<a href="javascript:;" class="close-btn" onclick="closePayDia($(this))"></a>' +
        '<ul>' +
        '<li>若已完成支付，可再次查询支付结果；</li>' +
        '<li>若未完成支付，请重新支付</li>' +
        '</ul>' +
        '<div class="d-footer"><input type="button" value="重新支付" class="cx-pay-btn" onclick="payBillChk($(this),1,' + id + ',' + paytype + ')"><input type="button" value="查询支付结果" class="check-btn" onclick="payBillChk($(this),0,' + id + ',' + paytype + ')"></div></div>';
    ele.parents('.box-con').html(oHtml);
}

//提升支付成功
function againPay(ele, url) {
    var oHtml = '<p class="p-tit1">您的订单已支付</p><div class="d-footer1"><input type="button" class="sure-pay-suc" value="确定返回"></div>';
    ele.parents('.box-con').html(oHtml);
    $('.sure-pay-suc').click(function () {
        paySucc(url);
    })
}

//订单支付成功（跳转）
function paySucc(url) {
    tipFun('支付成功');
    window.location.href = url;
}

//关闭按钮x
function closePayDia(ele) {
    ele.parents('.pay-status-box-common').remove();
}

/*!
 * clipboard.js v2.0.0
 * https://zenorocha.github.io/clipboard.js
 *
 */

! function (t, e) { "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.ClipboardJS = e() : t.ClipboardJS = e() }(this, function () {
    return function (t) {
        function e(o) { if (n[o]) return n[o].exports; var r = n[o] = { i: o, l: !1, exports: {} }; return t[o].call(r.exports, r, r.exports, e), r.l = !0, r.exports }
        var n = {};
        return e.m = t, e.c = n, e.i = function (t) { return t }, e.d = function (t, n, o) { e.o(t, n) || Object.defineProperty(t, n, { configurable: !1, enumerable: !0, get: o }) }, e.n = function (t) { var n = t && t.__esModule ? function () { return t.default } : function () { return t }; return e.d(n, "a", n), n }, e.o = function (t, e) { return Object.prototype.hasOwnProperty.call(t, e) }, e.p = "", e(e.s = 3)
    }([function (t, e, n) {
        var o, r, i;
        ! function (a, c) { r = [t, n(7)], o = c, void 0 !== (i = "function" == typeof o ? o.apply(e, r) : o) && (t.exports = i) }(0, function (t, e) {
            "use strict";

            function n(t, e) { if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function") }
            var o = function (t) { return t && t.__esModule ? t : { default: t } }(e),
                r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) { return typeof t } : function (t) { return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t },
                i = function () {
                    function t(t, e) {
                        for (var n = 0; n < e.length; n++) {
                            var o = e[n];
                            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, o.key, o)
                        }
                    }
                    return function (e, n, o) { return n && t(e.prototype, n), o && t(e, o), e }
                }(),
                a = function () {
                    function t(e) { n(this, t), this.resolveOptions(e), this.initSelection() }
                    return i(t, [{
                        key: "resolveOptions",
                        value: function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                            this.action = t.action, this.container = t.container, this.emitter = t.emitter, this.target = t.target, this.text = t.text, this.trigger = t.trigger, this.selectedText = ""
                        }
                    }, { key: "initSelection", value: function () { this.text ? this.selectFake() : this.target && this.selectTarget() } }, {
                        key: "selectFake",
                        value: function () {
                            var t = this,
                                e = "rtl" == document.documentElement.getAttribute("dir");
                            this.removeFake(), this.fakeHandlerCallback = function () { return t.removeFake() }, this.fakeHandler = this.container.addEventListener("click", this.fakeHandlerCallback) || !0, this.fakeElem = document.createElement("textarea"), this.fakeElem.style.fontSize = "12pt", this.fakeElem.style.border = "0", this.fakeElem.style.padding = "0", this.fakeElem.style.margin = "0", this.fakeElem.style.position = "absolute", this.fakeElem.style[e ? "right" : "left"] = "-9999px";
                            var n = window.pageYOffset || document.documentElement.scrollTop;
                            this.fakeElem.style.top = n + "px", this.fakeElem.setAttribute("readonly", ""), this.fakeElem.value = this.text, this.container.appendChild(this.fakeElem), this.selectedText = (0, o.default)(this.fakeElem), this.copyText()
                        }
                    }, { key: "removeFake", value: function () { this.fakeHandler && (this.container.removeEventListener("click", this.fakeHandlerCallback), this.fakeHandler = null, this.fakeHandlerCallback = null), this.fakeElem && (this.container.removeChild(this.fakeElem), this.fakeElem = null) } }, { key: "selectTarget", value: function () { this.selectedText = (0, o.default)(this.target), this.copyText() } }, {
                        key: "copyText",
                        value: function () {
                            var t = void 0;
                            try { t = document.execCommand(this.action) } catch (e) { t = !1 }
                            this.handleResult(t)
                        }
                    }, { key: "handleResult", value: function (t) { this.emitter.emit(t ? "success" : "error", { action: this.action, text: this.selectedText, trigger: this.trigger, clearSelection: this.clearSelection.bind(this) }) } }, { key: "clearSelection", value: function () { this.trigger && this.trigger.focus(), window.getSelection().removeAllRanges() } }, { key: "destroy", value: function () { this.removeFake() } }, { key: "action", set: function () { var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "copy"; if (this._action = t, "copy" !== this._action && "cut" !== this._action) throw new Error('Invalid "action" value, use either "copy" or "cut"') }, get: function () { return this._action } }, {
                        key: "target",
                        set: function (t) {
                            if (void 0 !== t) {
                                if (!t || "object" !== (void 0 === t ? "undefined" : r(t)) || 1 !== t.nodeType) throw new Error('Invalid "target" value, use a valid Element');
                                if ("copy" === this.action && t.hasAttribute("disabled")) throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                                if ("cut" === this.action && (t.hasAttribute("readonly") || t.hasAttribute("disabled"))) throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                                this._target = t
                            }
                        },
                        get: function () { return this._target }
                    }]), t
                }();
            t.exports = a
        })
    }, function (t, e, n) {
        function o(t, e, n) { if (!t && !e && !n) throw new Error("Missing required arguments"); if (!c.string(e)) throw new TypeError("Second argument must be a String"); if (!c.fn(n)) throw new TypeError("Third argument must be a Function"); if (c.node(t)) return r(t, e, n); if (c.nodeList(t)) return i(t, e, n); if (c.string(t)) return a(t, e, n); throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList") }

        function r(t, e, n) { return t.addEventListener(e, n), { destroy: function () { t.removeEventListener(e, n) } } }

        function i(t, e, n) { return Array.prototype.forEach.call(t, function (t) { t.addEventListener(e, n) }), { destroy: function () { Array.prototype.forEach.call(t, function (t) { t.removeEventListener(e, n) }) } } }

        function a(t, e, n) { return u(document.body, t, e, n) }
        var c = n(6),
            u = n(5);
        t.exports = o
    }, function (t, e) {
        function n() { }
        n.prototype = {
            on: function (t, e, n) { var o = this.e || (this.e = {}); return (o[t] || (o[t] = [])).push({ fn: e, ctx: n }), this },
            once: function (t, e, n) {
                function o() { r.off(t, o), e.apply(n, arguments) }
                var r = this;
                return o._ = e, this.on(t, o, n)
            },
            emit: function (t) {
                var e = [].slice.call(arguments, 1),
                    n = ((this.e || (this.e = {}))[t] || []).slice(),
                    o = 0,
                    r = n.length;
                for (o; o < r; o++) n[o].fn.apply(n[o].ctx, e);
                return this
            },
            off: function (t, e) {
                var n = this.e || (this.e = {}),
                    o = n[t],
                    r = [];
                if (o && e)
                    for (var i = 0, a = o.length; i < a; i++) o[i].fn !== e && o[i].fn._ !== e && r.push(o[i]);
                return r.length ? n[t] = r : delete n[t], this
            }
        }, t.exports = n
    }, function (t, e, n) {
        var o, r, i;
        ! function (a, c) { r = [t, n(0), n(2), n(1)], o = c, void 0 !== (i = "function" == typeof o ? o.apply(e, r) : o) && (t.exports = i) }(0, function (t, e, n, o) {
            "use strict";

            function r(t) { return t && t.__esModule ? t : { default: t } }

            function i(t, e) { if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function") }

            function a(t, e) { if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return !e || "object" != typeof e && "function" != typeof e ? t : e }

            function c(t, e) {
                if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + typeof e);
                t.prototype = Object.create(e && e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
            }

            function u(t, e) { var n = "data-clipboard-" + t; if (e.hasAttribute(n)) return e.getAttribute(n) }
            var l = r(e),
                s = r(n),
                f = r(o),
                d = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) { return typeof t } : function (t) { return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t },
                h = function () {
                    function t(t, e) {
                        for (var n = 0; n < e.length; n++) {
                            var o = e[n];
                            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, o.key, o)
                        }
                    }
                    return function (e, n, o) { return n && t(e.prototype, n), o && t(e, o), e }
                }(),
                p = function (t) {
                    function e(t, n) { i(this, e); var o = a(this, (e.__proto__ || Object.getPrototypeOf(e)).call(this)); return o.resolveOptions(n), o.listenClick(t), o }
                    return c(e, t), h(e, [{
                        key: "resolveOptions",
                        value: function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                            this.action = "function" == typeof t.action ? t.action : this.defaultAction, this.target = "function" == typeof t.target ? t.target : this.defaultTarget, this.text = "function" == typeof t.text ? t.text : this.defaultText, this.container = "object" === d(t.container) ? t.container : document.body
                        }
                    }, {
                        key: "listenClick",
                        value: function (t) {
                            var e = this;
                            this.listener = (0, f.default)(t, "click", function (t) { return e.onClick(t) })
                        }
                    }, {
                        key: "onClick",
                        value: function (t) {
                            var e = t.delegateTarget || t.currentTarget;
                            this.clipboardAction && (this.clipboardAction = null), this.clipboardAction = new l.default({ action: this.action(e), target: this.target(e), text: this.text(e), container: this.container, trigger: e, emitter: this })
                        }
                    }, { key: "defaultAction", value: function (t) { return u("action", t) } }, { key: "defaultTarget", value: function (t) { var e = u("target", t); if (e) return document.querySelector(e) } }, { key: "defaultText", value: function (t) { return u("text", t) } }, { key: "destroy", value: function () { this.listener.destroy(), this.clipboardAction && (this.clipboardAction.destroy(), this.clipboardAction = null) } }], [{
                        key: "isSupported",
                        value: function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ["copy", "cut"],
                                e = "string" == typeof t ? [t] : t,
                                n = !!document.queryCommandSupported;
                            return e.forEach(function (t) { n = n && !!document.queryCommandSupported(t) }), n
                        }
                    }]), e
                }(s.default);
            t.exports = p
        })
    }, function (t, e) {
        function n(t, e) {
            for (; t && t.nodeType !== o;) {
                if ("function" == typeof t.matches && t.matches(e)) return t;
                t = t.parentNode
            }
        }
        var o = 9;
        if ("undefined" != typeof Element && !Element.prototype.matches) {
            var r = Element.prototype;
            r.matches = r.matchesSelector || r.mozMatchesSelector || r.msMatchesSelector || r.oMatchesSelector || r.webkitMatchesSelector
        }
        t.exports = n
    }, function (t, e, n) {
        function o(t, e, n, o, r) { var a = i.apply(this, arguments); return t.addEventListener(n, a, r), { destroy: function () { t.removeEventListener(n, a, r) } } }

        function r(t, e, n, r, i) { return "function" == typeof t.addEventListener ? o.apply(null, arguments) : "function" == typeof n ? o.bind(null, document).apply(null, arguments) : ("string" == typeof t && (t = document.querySelectorAll(t)), Array.prototype.map.call(t, function (t) { return o(t, e, n, r, i) })) }

        function i(t, e, n, o) { return function (n) { n.delegateTarget = a(n.target, e), n.delegateTarget && o.call(t, n) } }
        var a = n(4);
        t.exports = r
    }, function (t, e) { e.node = function (t) { return void 0 !== t && t instanceof HTMLElement && 1 === t.nodeType }, e.nodeList = function (t) { var n = Object.prototype.toString.call(t); return void 0 !== t && ("[object NodeList]" === n || "[object HTMLCollection]" === n) && "length" in t && (0 === t.length || e.node(t[0])) }, e.string = function (t) { return "string" == typeof t || t instanceof String }, e.fn = function (t) { return "[object Function]" === Object.prototype.toString.call(t) } }, function (t, e) {
        function n(t) {
            var e;
            if ("SELECT" === t.nodeName) t.focus(), e = t.value;
            else if ("INPUT" === t.nodeName || "TEXTAREA" === t.nodeName) {
                var n = t.hasAttribute("readonly");
                n || t.setAttribute("readonly", ""), t.select(), t.setSelectionRange(0, t.value.length), n || t.removeAttribute("readonly"), e = t.value
            } else {
                t.hasAttribute("contenteditable") && t.focus();
                var o = window.getSelection(),
                    r = document.createRange();
                r.selectNodeContents(t), o.removeAllRanges(), o.addRange(r), e = o.toString()
            }
            return e
        }
        t.exports = n
    }])
});

/*
 * 阅读文章，下载app按钮
 * el:文章内容容器
 * txt:下载按钮显示文字
 * lbm 5-6
 */
function hideInfo(el, txt) {

    var hideInfo = {
        wH: $(window).height(),
        dH: $(el).height()
    };
    var html;
    if ($('.down-app').length) {
        html = $('.down-app').clone();
        html.find('.down-link').html(txt)
    } else {
        html = '<div class="down-app">\
                <a href="javascript:;" onclick="try_to_open_app()" class="down-link">\
                <i class="icon-jt"></i> \
                <span>下载<em class="share-down-name2">' + txt + '</span>\
                </a>\
              </div>'
    }

    var dom = '<div class="new-down-app">\
                <div class="new-mak">\
                  <i class="iconfont icon-xiangxia"></i>\
                </div>\
                <div class="new-down-app-box">\
                </div>\
              </div>';
    if ((hideInfo.dH) > (hideInfo.wH * 1.5)) {
        $(el).css({
            'height': (hideInfo.wH * 1.5) + 'px',
            'overflow': 'hidden',
            'position': 'relative'
        })
        $(el).append($(dom))
        $('.new-down-app .new-down-app-box').append(html)
        $(".swiper-container .lazy").lazyload({ effect: "fadeIn" });
        $(window).on('scroll', function () {
            $(".liuyan img.lazy,.jingcai img.lazy").lazyload({ effect: "fadeIn" });
        })
        $(document).on('click', '.new-mak', function () {
            $(this).parents('.new-down-app').css('position', 'relative');
            $(this).remove();
            $(el).css('height', 'auto')
        })
    }
}
/*
 * 提示APP上级弹窗
 * msg:提示文字
 * lbm 6-21
 */
function upDownApp(msg) {
    var leve = appVersionNumber();
    $.DialogCreat({
        'style': 'style2',
        'content': {
            'p': [
                { 'className': 'dialog-p3', 'txt': "操作提示" },
                { 'className': 'dialog-p1', 'txt': msg }]
        },
        'footer': { 'style': 'dialog-footer1', 'txt': ['下次再说', '立即升级'] },
        'callback': function () {
            try {
                var ccooua = navigator.userAgent.toLowerCase();
                var isAndroid = ccooua.indexOf('ccoocity_android') > -1; //android终端
                var isiOS = ccooua.indexOf('ccoocity_ios') > -1; //ios终端
                console.log(isAndroid)
                console.log(leve)
                if (isAndroid && leve > 621) {
                    app.checkAppUpdate()
                } else if (isAndroid && leve <= 621) {
                    window.location = "http://m.app.so.com/detail/index?from=qing&id=1575163";
                } else if (isiOS) {
                    window.location = "itms-apps://itunes.apple.com/cn/app/ccoo-cheng-shi-tong-ben-shi/id939332605?mt=8";
                }
            } catch (e) { }
        }
    });
}
/****
 * 分类没有广告删除广告父级盒子
 * el:父级盒子class名
 * ***/
function removeAdvParent(el) {
    $(document).find(el).each(function () {
        if ($(this).children().length == 0 || $(this).children().children().length == 0) {
            $(this).remove()
        }
    })
}

//专题聚合app内阻止nav区域以外的拖动
function columnNavTouch() {
    var ccooua = navigator.userAgent.toLowerCase();
    var isApp = ccooua.indexOf('ccoocity') > -1; //app内
    var isAndroid = ccooua.indexOf('ccoocity_android') > -1; //android终端
    var isiOS = ccooua.indexOf('ccoocity_ios') > -1; //ios终端

    if (isApp && isAndroid) {
        $('.column-group .slide').bind("touchmove", function (e) {
            app.dispatchTouchViewPager(1)
        });
        $('.column-group .slide').bind("touchend", function (e) {
            app.dispatchTouchViewPager(0)
        });
    }

}
/*详情页添加关注微信弹窗 2020-1-7 by xn*/
function adWxDia() {
    return
    var shareTop = $(document).height() - 200;
    if ($('.share-headlines').offset()) shareTop = $('.share-headlines').offset().top;
    if (ccooShare.isWeixin()) {
        $(window).scroll(function () {
            var t = $(document).scrollTop();
            var wx_time_show = $.cookie('wx_time_show') || 0;
            var timeFlag = (+ new Date() - wx_time_show) > 1000 * 60 * 60 * 3;
            if (timeFlag && t > shareTop || timeFlag && ($(document).height() - $(document).scrollTop() - 200) <= $(window).height()) {
                $.ajax({
                    url: '/home/GetWxEwmInfo',
                    type: 'POST',
                    success: function (res) {
                        if (res.wxewm != '') {
                            var data = res;
                            var _html = '<section class="erweima-dia" id="erweima-dia" style="display:block">\
                                            <div class="erweima-box">\
                                                <p class="tit">'+ data.siteName + '官方微信</p>\
                                                <p class="info1">'+ data.cityName + '事，早知道<br>' + data.cityName + '本地人都在关注</p>\
                                                <div class="pic-box">\
                                                <img src="'+ data.wxewm + '" alt="">\
                                                </div>\
                                                <p class="txt">长按二维码识别关注</p>\
                                                <span class="x-close-btn" onclick="$(\'#erweima-dia\').remove();"><i class="iconfont icon-guanbi"></i></span>\
                                            </div>\
                                        </section>';
                            // if (parseInt(data.allFans) == 0 || parseInt(data.allFans) < 10000) {
                            //     var _html = '<section class="erweima-dia" id="erweima-dia" style="display:block">\
                            //                 <div class="erweima-box">\
                            //                     <p class="tit">'+ data.siteName + '官方微信</p>\
                            //                     <p class="info1">'+ data.cityName + '事，早知道<br>' + data.cityName + '本地人都在关注</p>\
                            //                     <div class="pic-box">\
                            //                     <img src="'+ data.wxewm + '" alt="">\
                            //                     </div>\
                            //                     <p class="txt">长按二维码识别关注</p>\
                            //                     <span class="x-close-btn" onclick="$(\'#erweima-dia\').remove();"><i class="iconfont icon-guanbi"></i></span>\
                            //                 </div>\
                            //             </section>';
                            // } else {
                            //     var _html = '<section class="erweima-dia" id="erweima-dia" style="display:block">\
                            //                     <div class="erweima-box">\
                            //                         <p class="tit">'+ data.siteName + '官方微信</p>\
                            //                         <p class="info1">'+ data.cityName + '事，早知道<br>' + data.cityName + data.allFans + '人都在关注</p>\
                            //                         <div class="pic-box">\
                            //                            <img src="'+ data.wxewm + '" alt="">\
                            //                         </div>\
                            //                         <p class="txt">长按二维码识别关注</p>\
                            //                         <span class="x-close-btn" onclick="$(\'#erweima-dia\').remove();"><i class="iconfont icon-guanbi"></i></span>\
                            //                     </div>\
                            //                 </section>';
                            // }
                            if ($('#erweima-dia').length) $('#erweima-dia').remove();
                            $('body').append(_html);
                            $.cookie('wx_time_show', + new Date(), { path: '/' });
                        }
                    }
                })
            }
        })
    }
}
//页面滚动 20200813 by xn
function xSetScroll() {
    setTimeout(function () {
        var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
        window.scrollTo(0, Math.max(scrollHeight - 1, 0));
    }, 100);
}
/*
    *倒计时 by xn
    opt{
        ele:倒计时元素 (在此元素 data-endtime属性上取结束时间戳)
        type:1 返回时间以小时，分，秒间隔（不填默认为1）
        type:2 返回时间以：分隔
        hasDay 默认为（时分秒，如有天需加此参数）
        addBox 参数为返回时间插入位置（不填默认为倒计时元素）
        endfunc 结束回调
    }
*/
function mathTime(opt) {
    var _t = this;
    _t.type = 1;
    if (opt && opt.type) {
        _t.type = opt.type;
    }
    _t.num = function (num) {
        return num >= 10 ? num : '0' + num
    }
    var endtxt = opt.endtxt || '已开始';
    _t.setInter = function (times, ele, type) {
        var _n;
        _n = setInterval(function () {
            var _now = new Date().getTime();
            if (_now - times >= 0) {
                clearInterval(_n);
                if (opt.endfunc) {
                    opt.endfunc(ele)
                } else {
                    ele.text(endtxt);
                }
                return false;
            }
            var _dif = Math.floor((times - _now) / 1000)
            var _d = Math.floor(_dif / (60 * 60 * 24));
            var _h = Math.floor(_dif / (60 * 60)) % 24;
            var _m = Math.floor(_dif / 60) % 60
            var _s = _dif % 60;
            var _html = '';
            if (type == 1) {
                if (opt.hasDay) {
                    _html = '<em class="time-h">' + _d + '</em>' + '天';
                    _html += '<em class="time-h">' + _t.num(_h) + '</em>' + '小时';
                    _html += '<em class="time-m">' + _t.num(_m) + '</em>' + '分';
                    _html += '<em class="time-s">' + _t.num(_s) + '</em>' + '秒';
                } else {
                    _html = '<em class="time-h">' + (_d * 24 + _h) + '</em>' + '小时';
                    _html += '<em class="time-m">' + _t.num(_m) + '</em>' + '分';
                    _html += '<em class="time-s">' + _t.num(_s) + '</em>' + '秒';
                }
            } else if (type == 2) {
                if (opt.hasDay) {
                    _html = '<em class="time-h">' + _d + '</em>' + ':';
                    _html += '<em class="time-h">' + _t.num(_h) + '</em>' + ':';
                    _html += '<em class="time-m">' + _t.num(_m) + '</em>' + ':';
                    _html += '<em class="time-s">' + _t.num(_s) + '</em>';
                } else {
                    _html = '<em class="time-h">' + (_d * 24 + _h) + '</em>' + ':';
                    _html += '<em class="time-m">' + _t.num(_m) + '</em>' + ':';
                    _html += '<em class="time-s">' + _t.num(_s) + '</em>';
                }
            }
            if (opt.addBox)
                ele.find(opt.addBox).html(_html)
            else
                ele.html(_html)
        }, 1000)
    }
    $(opt.ele).each(function () {
        var that = $(this);
        var _end = parseInt(that.attr('data-endtime'));
        var _now = new Date().getTime();
        if ((_end - _now) > 0) {
            _t.setInter(_end, that, _t.type)
        }
    })
}
/*APP更新*/
function refreshAndroidApp(msg, hidCallback, btn_name) {
    var leve = appVersionNumber();
    var ccooua = navigator.userAgent.toLowerCase();
    var isAndroid = ccooua.indexOf('ccoocity_android') > -1; //android终端
    var _refreshAppTime = $.cookie("_refreshAppTime");
    if ($.cookie('siteid') == 1507 && !_refreshAppTime && isAndroid && leve == 692) {
        setAppDownCookie("_refreshAppTime", 120, 1);
        if (!btn_name) { btn_name = '下次再说' };
        var html = '<div class="xdialogwrap" id="x-refreshAppDia">' +
            '<div class="xdialog-innerbox">' +
            '<p class="xdialog-title">' + msg + '</p>' +
            '<span class="xdialog-canel js-refresh-canel">' + btn_name + '</span><span class="xdialog-down js-refresh-ok">立即更新</span>' +
            '</div>' +
            '</div>'
        $('body').append($(html))
        $('.js-refresh-canel').click(function () {
            $('#x-refreshAppDia').remove();
            if (hidCallback)
                hidCallback();
        })
        $('.js-refresh-ok').click(function () {
            $('#x-refreshAppDia').remove();
            //$('<a href="http://img.pccoo.cn/wap/downapp.html" target="_blank" />')[0].click();
            $('<a href="http://down.pccoo.cn/ccoocity.apk" target="_blank" />')[0].click();
        })
    }
}
//展开收起
function jsRow(obj) {
    if ($(obj).hasClass('on')) {
        $(obj).parents('.js-linehide').addClass('on').css('max-height', $(obj).parents('.js-linehide').data('maxhei'));
        $(obj).html('<i class="iconfont icon-xjt1"></i> 展开')
        $(obj).removeClass('on')
    } else {
        $(obj).parents('.js-linehide').removeClass('on').css('max-height', 'unset');
        $(obj).html('<i class="iconfont icon-sjt1"></i> 收起')
        $(obj).addClass('on')
    }
}
function hideLine(ele, maxHei) {
    ele.each(function (index, el) {
        var hei = $(this).height();
        console.log(hei)
        if (hei > maxHei) {
            $(this).addClass('on').css('max-height', maxHei).data('maxhei', maxHei).find('.js-linerow').remove()
            $(this).append('<a href="javascript:;" class="js-linerow" onclick="jsRow(this)"><i class="iconfont icon-xjt1"></i> 展开</a>')
        }
    });
}
//单张图片大图预览
function singShowImg() {
    $(document).on("click", ".showitem", function (e) {
        e.preventDefault();
        var imgUrl = $(this).data("original");
        $('body').append('<div class="singleimg-wrap" onclick="$(this).remove()">\
                            <div class="header clearfix">\
                                <dl>\
                                    <dt>图片预览</dt>\
                                    <dd class="d-right close-photo"><span></span></dd>\
                                </dl>\
                            </div>\
                            <div class="con">\
                                <img class="img" onclick="event.stopPropagation()" src="'+ imgUrl + '">\
                            </div>\
                        </div>')
    });
}

$(document).on("click", ".ccooadvclick,.ccooadvclick1", function (e) {
    var adid = $(this).data("adid");
    $.ajax({
        url: '/common/advclick',
        type: 'POST',
        data: { adid: adid },
        success: function (res) {
        }
    })
});

/*私域分享弹窗*/
function sySharePop(src,txt){
    $('body').append('<div class="pop-cityercode">\
        <div class="pop-zhezhao" onclick="$(this).parents(\'.pop-cityercode\').remove()"></div>\
        <div class="con">\
            <img class="ercode" src="'+src+'">\
            <p class="txt">'+txt+'</p>\
            <i class="close iconfont icon-guanbi" onclick="$(this).parents(\'.pop-cityercode\').remove()"></i>\
        </div>\
    </div>')
}
/*私域打开小程序弹窗*/
function syOpenPop(txt,path,btn){
    $('body').append('<div class="pop-cityercode">\
        <div class="pop-zhezhao" onclick="$(this).parents(\'.pop-cityercode\').remove()"></div>\
        <div class="con type2">\
            <img class="img" src="https://img.pccoo.cn/wap/webapp/images/siyu-logo2.png">\
            <p class="txt2">'+txt+'</p>\
            <wx-open-launch-weapp id="launch-btn" username="gh_40e1b6d51159" path="'+ path+'" style="display:block;width:100%;height:20px;font-size:14px;color:#3373F3;text-align:center;">\
                        <template>\
                            <span style="display:block;width:100%;height:20px;font-size:14px;color:#3373F3;text-align:center;">'+ btn+'</span>\
                        </template>\
                    </wx-open-launch-weapp>\
            <i class="close iconfont icon-guanbi" onclick="$(this).parents(\'.pop-cityercode\').remove()"></i>\
        </div>\
    </div>')
}
function syOpenPop2(path){
    $('body').append('<wx-open-launch-weapp id="launch-btn" username="gh_40e1b6d51159" path="'+ path+'" style="display:block;width:100%;height:20px;font-size:14px;color:#3373F3;text-align:center;position:fixed;left:999px;top:0;">\
                        <template>\
                            <span style="display:block;width:100%;height:20px;font-size:14px;color:#3373F3;text-align:center;">打开私域小程序</span>\
                        </template>\
                    </wx-open-launch-weapp>')
    $('#launch-btn').click();
}
/*私域H5跳转小程序*/
function syToUrlscheme(pages, query) {
	$.ajax({
		url: "/common/Urlscheme",
		data: { pages: pages, query: query },
		type: "post",
		success: function (data) {
			if (data != "") {
				window.location.href = data;
			} else {
				tipFun("跳转小程序失败，请重试~");
			}
		},
		error: function () {
			tipFun("服务系统异常，请稍后再试~");
		}
	});
}

/*PC浏览器打开H5页面跳转到PC页面    20230721 by xn*/
function checkPcAndJump(){
    var bool = /phone|pad|pod|iPhone|iPod|ios|iPad|Android|Fennec|BlackBerry|Mobile|IEMobile|MQQBrowser|JUC|Fennec|WosBrowser|BrowserNG|WebOS|Symbian|Windows Phone/i.test(navigator.userAgent);
    var url = '';
    var _link = $('link[rel="canonical"]').attr('href')
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if(!bool && width>800 && _link){
        window.location.href=_link;
    }
}
$(function(){
    checkPcAndJump();
})