$(function () {



  //倒计时s
  var timeCompute = function (a, b) {
    if (this.time = a, !(0 >= a)) {
      for (var c = [86400 / b, 3600 / b, 60 / b, 1 / b], d = .1 === b ? 1 : .01 === b ? 2 : .001 === b ? 3 : 0, e = 0; d > e; e++) c.push(b * Math.pow(10, d - e));
      for (var f, g = [], e = 0; e < c.length; e++) f = Math.floor(a / c[e]),
        g.push(f),
        a -= f * c[e];
      return g
    }
  }
    , CountDown = function (a, b) {
      this.precise = parseFloat(b) || 1,
        this.time = a / this.precise,
        this.countTimer = null,
        this.run = function (a) {
          var b, c = this,
            e = this.precise;
          this.countTimer = setInterval(function () {
            b = timeCompute.call(c, c.time - 1, e),
              b || (clearInterval(c.countTimer), c.countTimer = null),
              "function" == typeof a && a(b || [0, 0, 0, 0, 0], !c.countTimer)
          },
            1e3 * e)
        }
    }
    , timeLmtCountdown = function () {
      var content = $(".infbox");
      var $this = content.find(".time");
      var etime = $this.attr('data-etime'); //结束时间
      var ntime = $this.attr('data-ntime'); //当前时间
      var end = etime - ntime;
      var time = end > 0 ? end : 0;

      var timeTypeText = '报名倒计时：';
      var countDown = new CountDown(time);
      countDownRun();

      function countDownRun(time) {
        time && (countDown.time = time);
        countDown.run(function (times, complete) {
          var html = '<span>' + timeTypeText + '<em>' + (times[0] < 10 ? "0" + times[0] : times[0]) +
            '</em>天<em>' + (times[1] < 10 ? "0" + times[1] : times[1]) +
            '</em>小时<em>' + (times[2] < 10 ? "0" + times[2] : times[2]) +
            '</em>分<em>' + (times[3] < 10 ? "0" + times[3] : times[3]) + '</em>秒</span>';
          $this.html(html);
        });
      }
    }
  // timeLmtCountdown();

  $(".la-list .lal-item").each(function () {
    cutTimeNew($(this))
  })

  // 倒计时 当前时间
  function cutTimeNew(el) {
    var endtime = el.attr('data-etime');
    var timer = setInterval(function () {
      var now = (new Date()).valueOf();
      var time = endtime - parseInt(now / 1000);
      time = time > 0 ? time : 0;
      var d = parseInt(time / (60 * 60 * 24));
      var h = parseInt(time / 60 / 60 % 24);
      var m = parseInt(time / 60 % 60);
      var s = parseInt(time % 60);
      let element = $('.lal-item .details .timer .left .end ');
      element.find('.days').text(d);
      element.find('.hours').text(h);
      element.find('.minutes').text(m);
      element.find('.seconds').text(s);
      //  var html = '<span>报名倒计时：<em>'+d+'</em>天<em>'+h+'</em>小时<em>'+(m>9?m:'0'+m)+'</em>分钟<em>'+(s>9?s:'0'+s)+'</em>秒</span>';
      //  el.find('.time').html(html)
      if (time == 0) {
        clearInterval(timer)
      }
    }, 1000)

  }


  //更新验证码
  var verifycode = $("#verifycode").attr("src");
  $("body").delegate("#verifycode", "click", function () {
    $(this).attr("src", verifycode + "?v=" + Math.random());
  });
  //国际手机号获取
  getNationalPhone();
  function getNationalPhone() {
    $.ajax({
      url: masterDomain + "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
      type: 'get',
      dataType: 'JSONP',
      success: function (data) {
        if (data && data.state == 100) {
          var phoneList = [], list = data.info;
          for (var i = 0; i < list.length; i++) {
            phoneList.push('<li data-cn="' + list[i].name + '" data-code="' + list[i].code + '">' + list[i].name + ' +' + list[i].code + '</li>');
          }
          $('.areaCode_wrap ul').append(phoneList.join(''));
        } else {
          $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
        }
      },
      error: function () {
        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
      }

    })
  }
  //显示区号
  $('.areaCode').bind('click', function () {
    var areaWrap = $(this).closest(".dc").find('.areaCode_wrap');
    if (areaWrap.is(':visible')) {
      areaWrap.fadeOut(300)
    } else {
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function () {
    var t = $(this), code = t.attr('data-code');
    var par = t.closest(".dc");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code);
  });

  $('body').bind('click', function () {
    $('.areaCode_wrap').fadeOut(300);
  });

  //验证提示弹出层
  function showMsg(msg) {
    $('.dy .dc').append('<p class="ptip">' + msg + '</p>')
    setTimeout(function () {
      $('.ptip').remove();
    }, 2000);
  }


  //提交订阅信息
  $("body").delegate("#btnTj", "click", function () {

    var type = [], t = $(this), obj = t.closest(".dy"), btnhtml = t.html();

    if (t.hasClass("disabled")) return false;

    obj.find("dl").each(function () {
      var checkbox = $(this).find(".checkbox");
      if (checkbox.hasClass("checked")) {
        type.push(checkbox.attr('data-val'));
      }
    });

    if (type.length == 0) {
      errMsg = "请选择要订阅的信息类型";
      showMsg(errMsg);
      return false;
    }

    var name = obj.find("#name1");
    var phone = obj.find("#phone1");
    var vercode = obj.find("#vercode1");
    var xy = obj.find(".xy");
    var areaCode = obj.find("#areaCode");
    let phoneRule = /^[1][3-8]\d{9}$|^([6|9])\d{7}$|^[0][9]\d{8}$|^[6]([8|6])\d{5}$/; //验证国内手机号

    if (name.val() == "" || name.val() == name.attr("placeholder")) {
      console.log(12)
      errMsg = "请输入您的姓名";
      showMsg(errMsg);
      return false;
    } else if (phone.val() == "" || phone.val() == phone.attr("placeholder")) {
      errMsg = "请输入您的手机号码";
      showMsg(errMsg);
      return false;
    } else if (areaCode.val() == '86' && !phoneRule.test(phone.val())) {
      errMsg = "请输入正确的手机号！";
      showMsg(errMsg);
      return false;
    } else if (vercode.val() == "" || vercode.val() == vercode.attr("placeholder")) {
      errMsg = "请输入验证码";
      showMsg(errMsg);
      return false;
    }

    if (!xy.hasClass("checked")) {
      errMsg = "请先同意[免责协议]";
      showMsg(errMsg);
      return false;
    }
    t.addClass("disabled").html("提交中...");

    var data = [];
    data.push("act=loupan");
    data.push("aid=" + pageData_.id);
    data.push("type=" + type.join(","));
    data.push("name=" + name.val());
    data.push("phone=" + phone.val());
    data.push("areaCode=" + areaCode.val());
    data.push("vercode=" + vercode.val());
    data = data.join("&");

    $.ajax({
      url: masterDomain + "/include/ajax.php?service=house&action=subscribe",
      data: data,
      dataType: "JSONP",
      success: function (data) {
        if (data && data.state == 100) {
          t.removeClass("disabled").html("订阅成功");
          setTimeout(function () {
            t.closest(".dy").find(".close").click();
          }, 1000);
        } else {
          t.removeClass("disabled").html(btnhtml);
          alert(data.info);
        }
      },
      error: function () {
        t.removeClass("disabled").html(btnhtml);
        alert("网络错误，请稍候重试！");
      }
    })

  });

  // 地图内容切换
  $('.tabBox li').on("click", function () {
    var t = $(this), i = t.index();
    if (!t.hasClass('selectTag')) {
      t.addClass('selectTag').siblings().removeClass('selectTag');
    }
  })


  $("html").delegate(".bdshare_popup_box", "mouseover", function () {
    $(".share").addClass("curr");
  });
  $("html").delegate(".bdshare_popup_box", "mouseout", function () {
    $(".share").removeClass("curr");
  });

  //动态
  $(".news dl").hover(function () {
    var t = $(this);
    t.addClass("curr").siblings("dl").removeClass("curr");
  });

  //文本框placeholder
  $("html input").placeholder();

  // 楼盘户型 
  $('.lphx .tab_nav li').click(function (event) {
    var t = $(this), index = t.index();
    if (!t.hasClass('curr')) {
      t.addClass('curr').siblings().removeClass('curr');
      if (index != 0 && !t.hasClass('loadimg')) {
        $('.lphx .tab_content').eq(index).find('img').each(function () {
          var img = $(this), src = img.attr('data-url');
          img.attr('src', src);
        })
        t.addClass('loadimg');
      }
    }
    $('.lphx .tab_content').eq(index).addClass('show').siblings().removeClass('show');
  });

  //新房顾问
  // $(".adviBox").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",pnLoop:"false",autoPlay:false,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});

  // 楼盘相册 
  // $('.lpAlbum .tab_nav li').click(function(event) {
  // 	var t = $(this),index = t.index();
  // 	if(!t.hasClass('curr')){
  // 		t.addClass('curr').siblings().removeClass('curr');
  // 	}
  // 	$('.lpAlbum .tab_content').eq(index).addClass('show').siblings().removeClass('show');
  // });
  //大图切换
  // $("#lp_slide").slide({titCell: ".plist li",mainCell: ".album",effect: "fold",autoPlay: false,delayTime: 500,switchLoad: "_src",pageStateCell:".pageState",startFun: function(i, p) {if (i == 0) {$(".sprev").click()} else if (i % 6 == 0) {$(".snext").click()}}});

  //小图左滚动切换
  // $("#lp_slide .thumb").slide({mainCell: "ul",delayTime: 300,vis: 6,scroll: 6,effect: "left",autoPage: false,prevCell: ".sprev",nextCell: ".snext",pnLoop: false});

  //楼盘相册
  var bigAlbum = [], smallAlbum = [];
  $(".lpAlbum .tab_nav li").click(function () {
    var t = $(this), i = t.index();
    if (!t.hasClass('curr')) {
      t.addClass('curr').siblings().removeClass('curr');
    }
    var i = $(this).index();
    $('.lpAlbum .tab_content').eq(i).addClass('show').siblings().removeClass('show');
    if (!bigAlbum[i]) {
      console.log(!bigAlbum[i])
      bigAlbum[i] = $('.lp_slide:eq(' + i + ')').slide({ titCell: ".plist li", mainCell: ".album", effect: "fold", autoPlay: false, delayTime: 500, switchLoad: "_src", pageStateCell: ".pageState", startFun: function (i, p) { } });
    }
    if (!smallAlbum[i]) {
      smallAlbum[i] = $('.lp_slide:eq(' + i + ')').find('.thumb').slide({ mainCell: "ul", delayTime: 300, vis: 6, scroll: 6, effect: "left", autoPage: true, prevCell: ".sprev", nextCell: ".snext", pnLoop: false });
      $('.lpAlbum .tab_content').eq(i).find('img').each(function () {
        var img = $(this), src = img.attr('data-url');
        img.attr('src', src);
      })
    }
  });
  $(".lpAlbum .tab_nav li:eq(0)").click();

  //页面改变尺寸重新对特效的宽高赋值
  $(window).resize(function () {
    var screenwidth = window.innerWidth || document.body.clientWidth;
    if (screenwidth < criticalPoint) {
      $("#lp_slide .tempWrap").css({ 'width': '1000px' });
      $(".album li").css({ 'width': '1000px' });
      $(".album").css({ 'width': '1000px' });
    } else {
      $("#lp_slide .tempWrap").css({ 'width': '1200px' });
      $(".album li").css({ 'width': '1200px' });
      $(".album").css({ 'width': '1200px' });
    }
  });



  var dzshapan = "#dzshapan", dzObj = $(dzshapan);


  //沙盘图拖动
  var shapanImg = $("#shapan-box");
  shapanImg.jqDrag({
    dragParent: dzshapan,
    dragHandle: "#shapan-obj"
  })

  window.HN = window.HN || {}; (function (a) { HN.Switch = function (c) { var b = this; b.op = a.extend({}, HN.Switch._default, c); b._isWebPSupport = false; b.isWebpSupport(); b._init() }; HN.Switch._default = { switchST: "", clipST: ".clip", conST: ".con", itemST: ".item", prevST: ".prev", nextST: ".next", pnavST: ".pnav", effect: "slide", event: "click", current: "cur", circle: false, vertical: false, auto: false, start: 0, duration: 400, interval: 4000, switchNum: 1, clipNum: 1 }; HN.Switch.prototype._init = function () { var c = this, e = c.op; e.sw = a(e.switchST); e.clip = e.sw.find(e.clipST); e.con = e.clip.find(e.conST).css({ position: "relative" }); e.item = e.con.find(e.itemST); e.prev = e.prevST == ".prev" ? e.sw.find(e.prevST) : a(e.prevST); e.next = e.nextST == ".next" ? e.sw.find(e.nextST) : a(e.nextST); e.pnav = e.pnavST == ".pnav" ? e.sw.find(e.pnavST) : a(e.pnavST); e.itemLen = e.item.length; e.switchNum > e.clipNum && (e.switchNum = e.clipNum); e.itemLen < e.clipNum && (e.itemLen = e.clipNum); if (e.effect != "slide") { e.switchNum = 1; e.clipNum = 1 } e.prevDisClass = a.trim(e.prevST).match(/\w\S*$/) + "-dis"; e.nextDisClass = a.trim(e.nextST).match(/\w\S*$/) + "-dis"; e.start = parseInt(e.start, 10); e.start = (e.start >= 0 && e.start < e.itemLen) ? e.start : 0; if (e.effect == "slide") { e.vertical || e.item.css({ "float": "left" }); e.leftOrTop = e.vertical ? "top" : "left"; e.widthOrHeight = e.vertical ? e.item.outerHeight(true) : e.item.outerWidth(true); e.conSize = e.widthOrHeight * e.itemLen; e.vertical ? e.con.css({ height: e.conSize }) : e.con.css({ width: e.conSize }) } else { if (e.effect == "fade") { e.item.not(e.item.eq(e.start).show()).hide().css({ position: "absolute" }) } else { e.item.not(e.item.eq(e.start).show()).hide(); e.effect = "none"; e.duration = 0 } } function b() { e.timer = setInterval(function () { e.showpage >= e.itemLen - e.clipNum ? c.switchTo(0) : c.next() }, e.interval) } function d() { clearInterval(e.timer) } d(); if (e.itemLen <= e.clipNum) { e.stopRun = true; c.switchTo(0); return } c.switchTo(e.start); e.prev.off("click.switch").on("click.switch", function () { a(this).hasClass(e.prevDisClass) || c.prev() }); e.next.off("click.switch").on("click.switch", function () { a(this).hasClass(e.nextDisClass) || c.next() }); e.pnav.each(function (f) { a(this).off(e.event + ".switch").on(e.event + ".switch", function () { c.switchTo(f) }) }); if (e.auto) { b(); e.sw.off("mouseenter.switch mouseleave.switch").on({ "mouseenter.switch": function () { d() }, "mouseleave.switch": function () { b() } }) } }; HN.Switch.prototype._play = function (d, j, g) { var c = this, h = c.op, f = null, e = {}, b = 0; if (a(c).trigger("playBefore") !== false) { if (d === null) { d = j ? h.showpage - h.switchNum : h.showpage + h.switchNum } else { d = isNaN(d) ? 0 : d; if (d == h.showpage) { return } } if (h.circle) { d < 0 && (d = h.itemLen - h.clipNum); d > h.itemLen - h.clipNum && (d = 0) } else { d < 0 && (d = 0); d > h.itemLen - h.clipNum && (d = h.itemLen - h.clipNum); d == 0 ? h.prev.addClass(h.prevDisClass) : h.prev.removeClass(h.prevDisClass); d == h.itemLen - h.clipNum ? h.next.addClass(h.nextDisClass) : h.next.removeClass(h.nextDisClass) } for (; b < h.clipNum + h.switchNum; b++) { if (d + b >= h.itemLen) { break } c._changeSrc(d + b) } if (h.effect == "slide") { e[h.leftOrTop] = -h.widthOrHeight * d; h.con.stop().animate(e, h.duration) } else { if (h.effect == "fade" || h.effect == "none") { f = h.item.eq(d); h.item.not(f).stop().fadeOut(h.duration); f.fadeIn(h.duration) } } h.pnav.removeClass(h.current); h.pnav.eq(Math.ceil(d / h.switchNum)).addClass(h.current); h.showpage = d; a(c).trigger("playAfter") } }; HN.Switch.prototype.isWebpSupport = function () { var c = this, e = window.localStorage && window.localStorage.getItem("webpsupport"), d = navigator.userAgent && /MSIE/.test(navigator.userAgent); e = d ? false : e; if (null === e && !d) { var b = new Image(); b.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"; if (b && 2 === b.width && 2 === b.height) { e = true } } window.localStorage && window.localStorage.setItem("webpsupport", e); c._isWebPSupport = "true" === e }; HN.Switch.prototype._changeSrc = function (e) { var b = this, g = b.op, d = g.item.eq(e).find("img"), f = 0; for (; f < d.length; f++) { var c = d.eq(f).data("src"); if (c && b._isWebPSupport) { c && (/pic1\.ajkimg\.com(.*)\.(jpg|png)/.test(c)) && !(c.match(/\?t=(\d)/i) > 0) && (c += "?t=4") } d.eq(f).attr("src") || d.eq(f).attr("src", c) } }; HN.Switch.prototype.switchTo = function (b) { this._play(b, false, false) }; HN.Switch.prototype.prev = function () { this._play(null, true, false) }; HN.Switch.prototype.next = function () { this._play(null, false, true) } })(jQuery);



  window.switchDistinfo = new HN.Switch({
    switchST: "#j-switch-distinfo",
    clipST: ".dist-clip",
    conST: "ul",
    itemST: "li",
    prevST: "#j-switch-distinfo .prev",
    nextST: "#j-switch-distinfo .next",
    switchNum: 6,
    clipNum: 6
  });
  var c = $("#j-switch-distinfo .dist-clip").find("li"),
    a = $("#j-dist-content .dist-items"),
    e = $("#shapan-obj").find(".map-mark");
  function b() {
    $(c).eq(0).addClass("active").siblings().removeClass("active");
    $(a).eq(0).show().siblings().hide();
    $(e).eq(0).addClass("map-mark-active").siblings().removeClass("map-mark-active");
    $(c).on("click", function () {
      var f = $(c).index($(this));
      $(this).addClass("active").siblings().removeClass("active");
      $(a).eq(f).show().siblings().hide();
      $(e).eq(f).addClass("map-mark-active").siblings().removeClass("map-mark-active");
    });
    $(e).on("click", function () {
      var f = $(e).index($(this)),
        g = Math.floor(f / 4);
      switchDistinfo.switchTo(g * 4) + 1;
      $(c).eq(f).addClass("active").siblings().removeClass("active");
      $(a).eq(f).show().siblings().hide();
      $(this).addClass("map-mark-active").siblings().removeClass("map-mark-active");
    })
  }
  function d() {
    e.each(function () {
      $(this).on({
        "mouseenter.district": function () {
          $(this).addClass("map-mark-hover")
        },
        "mouseleave.district": function () {
          $(this).removeClass("map-mark-hover")
        }
      });

    })
  }
  d();
  b()
  // 修改
  let pictureSwiper = new Swiper('.ep-swiper', {
    loop: true,//无限循环
    spaceBetween: 10
  });
  $('.epc-show').click(function () { //点击切换
    let element = $(this);
    pictureSwiper.slideToLoop(element.index(), 300, false);//切换到第一个slide，速度为1秒
  });
  // 订阅弹窗
  $('.eitp-left .label,.edi-list .item .label,.ls-btn').click(function () {
    $('.dy.other').css({ 'display': 'flex' });
  });
  $('.dc-close').click(function () {
    $('.dy.other').hide();
  });
  // 收藏
  $('.edi-more .btn .collect').click(async function () {
    let type = $(this).attr('data-type');
    let data = {
      service: 'member',
      action: 'collect',
      module: 'house',
      temp: 'loupan_detail',
      type: type == 1 ? 'del' : 'add',
      id: pageData_.id,
    }
    let result = await ajax(data, { dataType: 'json' });
    if (result.state == 100) {
      if (type == 1) {
        $('.edi-more .btn .item.collect').removeClass('has');
        $('.edi-more .btn .item.collect').attr('data-type', 0);
      } else {
        $('.edi-more .btn .item.collect').addClass('has');
        $('.edi-more .btn .item.collect').attr('data-type', 1);
      }
    }
  });
  //二维码
  // $(".scanCheck").qrcode({
  //   render: window.applicationCache ? "canvas" : "table",
  //   width: 74,
  //   height: 74,
  //   text: huoniao.toUtf8(window.location.href)
  // });
  // 在线咨询
  $('.eic-right .btn,.lbl-item .details .label .chat,.adviBox .itemInfo .label .chat').click(function () {
    let userid = $(this).attr('data-userid');
    imconfig.chatid = userid;
  });
  let counselorSwiper = new Swiper('.adviBox .bd', {
    spaceBetween: 40,
    slidesPerView: 3,
    navigation: {
      nextEl: ".adviBox .next",
      prevEl: ".adviBox .prev",
    }
  });
  // 顾问二维码弹窗调整
  $('.adviBox .itemInfo .label .scan').click(function () {
    let userid = $(this).siblings('.chat').attr('data-userid');
    let popUserid = $('.scan-pop').attr('data-userid');
    if ($('.scan-pop').css('display') == 'flex' && userid == popUserid) { //已显示，隐藏
      $('.scan-pop').hide();
    } else {//已隐藏，显示
      event.stopPropagation();
      let numLeft = $(this).offset().left - $('.adviBox .bd').offset().left;
      let numTop = $(this).position().top;
      $('.scan-pop').css({
        'left': `${numLeft}px`,
        'top': `${numTop + 36}px`,
        'display': 'flex'
      });
      // 扫码电话处理
      $('.scan-pop').attr('data-userid', userid);
      let telephone = $(this).attr('data-tel');
      let telSrc = $('.scan-pop img').attr('src');
      $('.scan-pop img').attr('src', telSrc.replace('data=', `data=${telephone}`));
      $(document).one('click', function () {
        $(this).find('.scan-pop').hide();
      })
    }
  });
  $('.adviBox .bd .slitem').on({ //修改弹窗top属性
    mouseenter: function () {
      let userid = $(this).find('.chat').attr('data-userid');
      let popUserid = $('.scan-pop').attr('data-userid');
      let numTop = $(this).find('.scan').position().top;
      if (userid == popUserid) { //对已弹出的弹窗修改
        $('.scan-pop').css({
          'top': `${numTop + 36}px`,
        });
      }
    },
    mouseleave: function () {
      let numTop = $(this).find('.scan').position().top;
      $('.scan-pop').css({
        'top': `${numTop + 36}px`,
      });
    }
  });
  // 房贷相关
  let houseLoanChart = echarts.init($('.htr-chart .chart')[0]);
  let option = {
    tooltip: {
      trigger: 'item',
      formatter: res => { //自定义
        let html = `
            <div class="toolTip">
              <div class="t-title">${res.data.name}</div>
              <div class="t-label">
                <div class="tl-dot" style="color:${res.color}">●</div>
                <div class="tl-text">总体占比：</div>
                <div class="tl-num">${res.percent}%</div>
              </div>
            </div>`;
        return html
      },
    },
    series: [
      {
        name: '贷款',
        type: 'pie',
        radius: ['40%', '70%'], //内圈和外圈占比
        color: ['#F54343', '#6094FF', '#FBB4B4'],
        avoidLabelOverlap: false,
        label: { //饼图中间文本设置
          show: true,
          position: 'center',
          fontWeight: 'bold',
          formatter: res => {
            let str = '';
            if (res.dataIndex == 1) {
              str = res.value > 0 ? `{text|${res.value}万}` : '-'
            }
            return `{title|贷款金额} \n \n \n ${str}`
          },
          rich: {
            title: {
              color: '#333',
              fontSize: 14
            },
            text: {
              color: '#6094FF',
              fontSize: 20
            }
          }
        },
        data: [
          { value: 0, name: '首付', label: { show: false } },
          { value: 0, name: '贷款' },
          { value: 0, name: '利息', label: { show: false } }
        ]
      }
    ]
  };
  houseLoanChart.setOption(option); //图表绘画
  // 房贷计算
  let timeoutTimer = '';
  $('.htl-percent .exhibition,.htl-time .exhibition').click(function () { //下拉选择框显示/隐藏
    event.stopPropagation(); //one方法用
    let listItem = $(this).siblings('.list');
    if (listItem.css('display') == 'none') {
      listItem.show();
    } else {
      listItem.hide();
    }
    $(document).one('click', function () {
      listItem.hide();
    })
  });
  $('.htl-percent .list,.htl-time .list').delegate('div', 'click', function () { //下拉选中
    let parentElement = $(this).closest('.list');
    parentElement.hide();//下拉框隐藏
    $(this).addClass('active').siblings().removeClass('active');
    parentElement.siblings('.exhibition').text($(this).text());
    if (parentElement.closest('.htl-percent')[0]) {
      let number = $(this).attr('data-number'); //文本展示修改
      $('.htr-chart .explain .series .item.pay .percent').text(`（${number}成）`);
      $('.htr-chart .explain .series .item.loan .percent').text(`（${10 - number}成）`);
    }
  });
  $('.htr-tab div').click(function () {
    $(this).addClass('active').siblings().removeClass('active');
    $('.htl-btn').click(); //自动计算
  });
  $('.htl-btn').click(function () {
    let allPrice = Number($('.htl-price .price input').val()); //总价
    let rate = Number($('.htl-rate .rate input').val()); //利率(月)
    let payment = Number($('.htl-percent .list .active').attr('data-number')); //首付比例
    let time = Number($('.htl-time .list .active').attr('data-number')); //贷款时间
    let numRule = /(^[1-9]([0-9]*)(\.[0-9]+)?$)|(^[0-9]{1}(\.[0-9]+)?$)/;
    if (!numRule.test(allPrice) || !numRule.test(rate)) { //价格验证
      popWarn('请检查房屋价格/利率格式');
      return false
    }
    let firstPay = allPrice * payment / 10; //首付金额
    $('.htr-chart .explain .series .item.pay .name').text(`首付：${firstPay}万`);
    $('.htr-chart .explain .series .item.pay .percent').text(`（${payment}成）`);
    let loanMoney = allPrice - firstPay; //贷款金额
    $('.htr-chart .explain .series .item.loan .name').text(`贷款：${loanMoney}万`);
    $('.htr-chart .explain .series .item.loan .percent').text(`（${10 - payment}成）`);
    let allInterest = 0;//总利息
    let type = $('.htr-tab .active').attr('data-type');//0:等额本金 1:等额本息 
    if (type == 0) { //等额本金
      let repayment = 0 //还款金额（本金+利息）
      let hasPay = 0; //已还额度
      for (let i = 0; i < time; i++) {
        hasPay = reduceLoan(loanMoney, time, loanMoney * i / time);
        repayment += hasPay;
        if (i == 0) { //首月还款
          $('.htr-chart .explain .title').html(`首月还款<span> ${(hasPay * 10000).toFixed(2)} </span>` + echoCurrency('short'));
        }
      }
      allInterest = (repayment.toFixed(2) - loanMoney).toFixed(2);
      $('.htr-chart .explain .series .item.interest').text(`利息：${allInterest}万（利率：${rate}%）`);
      function reduceLoan(loan, month, reduce) { //每月还款:（贷款金额/总月数）+（贷款金额 - 已还本金{不含利息}）* 月利率
        return (loan / month) + (loan - reduce) * (rate / 1200);
      }
    } else { //等额本息
      let monthRate = rate / 1200;//月利率
      let perMonth = (loanMoney * monthRate * Math.pow(1 + monthRate, time)) / (Math.pow(1 + monthRate, time) - 1);
      $('.htr-chart .explain .title').html(`每月还款<span> ${perMonth > 0 ? (perMonth * 10000).toFixed(2) : '0.00'} </span>` + echoCurrency('short'));
      allInterest = (perMonth * time - loanMoney).toFixed(2);
      $('.htr-chart .explain .series .item.interest').text(`利息：${allInterest > 0 ? allInterest : '0.00'}万（利率：${rate}%）`);
    }
    option.series[0].data[0].value = firstPay > 0 ? firstPay : 0;
    option.series[0].data[1].value = loanMoney > 0 ? loanMoney : 0;
    option.series[0].data[2].value = allInterest > 0 ? allInterest : 0;
    houseLoanChart.setOption(option); //图表绘画
  });
  function popWarn(info) { //弹窗提示
    $('.warnPop').text(info);
    $('.warnPop').css({ 'display': 'flex' });
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(res => {
      $('.warnPop').hide();
    }, 2000);
  }
});

