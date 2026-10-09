$(function () {

  $('.appMapBtn').attr('href', OpenMap_URL);
  // 初始进入拨打电话
  let url = location.search;
  let params = new URLSearchParams(url.slice(1));
  let callNumber = params.get('tel');
  if (callNumber) {
    $('.phone_frame p').text(callNumber.replace(' ', '+'));
    $('.phone_frame a').attr('href', `tel:${callNumber.replace(' ', '+')}`);
    $('.phone_frame').show();
    $('.desk').show();
  }
  // 电话咨询
  $('.building_phone, .call_phone').click(function () {
    $('.phone_frame p').text(pagePhone);
    $('.phone_frame a').attr('href', `tel:${pagePhone}`);
    $('.phone_frame').show();
    $('.desk').show();
  });
  $('.phone_frame .phone_cuo').click(function () {
    $('.phone_frame').hide();
    $('.desk').hide();
  });

  // 跳转到周边
  $(".peitao").click(function () {
    var t = $(this);
    var top = $("#peitao").offset().top;
    document.scrollingElement.scrollTop = top;
  })

  $('.markBox').find('a:first-child').addClass('curr');
  new Swiper('.topSwiper .swiper-container', {
    pagination: { el: '.topSwiper .swiper-pagination', type: 'fraction', }, autoplay: true, loop: true, grabCursor: true, paginationClickable: true,
    on: {
      slideChangeTransitionStart: function () {
        var len = $('.markBox').find('a').length;
        var sindex = this.activeIndex;
        if (len == 1) {
          $('.markBox').find('a:first-child').addClass('curr');
        } else {
          if (sindex > 1) {
            $('.pmark').removeClass('curr');
            $('.picture').addClass('curr');
          } else {
            $('.pmark').removeClass('curr');
            $('.markBox').find('a').eq(sindex).addClass('curr');
          }
        }

      },
    }
  });



  //如果是安卓腾讯X5内核浏览器，使用腾讯TCPlayer播放器
  var player = document.getElementById('video'), videoWidth = 0, videoHeight = 0, videoCover = '', videoSrc = '', isTcPlayer = false;
  if (device.indexOf('MQQBrowser') > -1 && device.indexOf('Android') > -1 && player) {
    videoSrc = player.getAttribute('src');
    videoCover = player.getAttribute('poster');
    var vid = player.getAttribute('id');

    videoWidth = $('#' + vid).width();
    videoHeight = $('#' + vid).height();

    $('#' + vid).after('<div id="tcPlayer"></div>');
    $('#' + vid).remove();
    document.head.appendChild(document.createElement('script')).src = '//imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.2.2.js';
    isTcPlayer = true;
  }


  // 图片放大
  var videoSwiper = new Swiper('.videoModal .swiper-container', { pagination: { el: '.videoModal .swiper-pagination', type: 'fraction', }, loop: false })
  $(".topSwiper").delegate('.topcomm', 'click', function () {
    var imgBox = $('.topSwiper .swiper-slide');
    var i = $(this).index();
    $(".videoModal").addClass('vshow');
    $('.markBox').toggleClass('show');
    videoSwiper.slideTo(i, 0, false);

    //安卓腾讯X5兼容
    if (player && isTcPlayer) {
      new TcPlayer('tcPlayer', {
        "mp4": videoSrc, //请替换成实际可用的播放地址
        "autoplay": false,  //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
        "coverpic": videoCover,
        "width": videoWidth,  //视频的显示宽度，请尽量使用视频分辨率宽度
        "height": videoHeight  //视频的显示高度，请尽量使用视频分辨率高度
      });
    }

    return false;
  });

  $(".videoModal").delegate('.vClose', 'click', function () {
    var video = $('.videoModal').find('video').attr('id');
    if (player && isTcPlayer) {
      $('#tcPlayer').html('');
    } else {
      $(video).trigger('pause');
    }

    $(this).closest('.videoModal').removeClass('vshow');
    $('.videoModal').removeClass('vshow');
    $('.markBox').removeClass('show');
    return false;
  });

  // 全景视频切换
  $('.tab_top').delegate('li', 'click', function () {
    var t = $(this), index = t.index();
    if (!t.hasClass('active')) {
      t.addClass('active').siblings('li').removeClass('active');
      $('.mainbox').eq(index).removeClass('fn-hide').siblings('.mainbox').addClass('fn-hide');
    }
  });


  //沙盘图拖动
  if ($("#shapan-box").length) {
    var drag = new Drag({
      dom: "#shapan-box",
      ondrag: function () {
      }
    });
  }
  var swiperSha = new Swiper('.shapanSwiper .swiper-container', {
    slidesPerView: 'auto',
    // spaceBetween: 17,
    pagination: {
      el: '.shapanSwiper .swiper-pagination',
      clickable: true,
    },
  });

  $(".map-mark").click(function () {
    var t = $(this), index = t.index() - 1;
    t.addClass("map-mark-active").siblings().removeClass("map-mark-active");
    $(".dist-items").eq(index).show().siblings().hide();
    swiperSha.slideTo(index);
  }).eq(0).click();




  // 电话弹出框
  $('.tel').click(function () {
    $("#tel").html('');
    $("#phone").html('');
    if ($(this).attr('data-tel') != '') {
      $("#tel").html('<a href="tel:' + $(this).attr('data-tel') + '">' + $(this).attr('data-tel') + '</a>').show();
    } else {
      $("#tel").hide();
    }
    if ($(this).attr('data-phone') != '') {
      $("#phone").html('<a href="tel:' + $(this).attr('data-phone') + '">' + $(this).attr('data-phone') + '</a>').show();
    } else {
      $("#phone").hide();
    }
    $('.desk').show();
    $('.phone').show();
  });
  $('.phone .signout').click(function () {
    $('.desk').hide();
    $('.phone').hide();
  });


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
    , timeLmtCountdown = function (el) {
      var content = el.find(".infbox");
      var $this = content.find(".time");
      var etime = $this.attr('data-etime'); //结束时间
      var ntime = $this.attr('data-ntime'); //当前时间
      var end = parseInt(etime - ntime);
      var time = end > 0 ? end : 0;

      var timeTypeText = '剩余';
      var countDown = new CountDown(time);
      countDownRun();

      function countDownRun(time) {
        time && (countDown.time = time);
        countDown.run(function (times, complete) {
          var html = timeTypeText + '<span>' + (times[0]) +
            '</span>天<span>' + (times[1]) +
            '</span>小时<span>' + (times[2] < 10 ? "0" + times[2] : times[2]) +
            '</span>分<span>' + (times[3] < 10 ? "0" + times[3] : times[3]) + '</span>秒';
          $this.html(html);
        });
      }
    }
  // timeLmtCountdown();

  $('.huodong .hd').each(function () {
    var t = $(this);
    cutTimeNew(t)
  })

  function cutTimeNew(el) {
    var content = el.find('.infbox');
    var endtime = content.find('.time').attr('data-etime');
    var timer = setInterval(function () {
      var now = (new Date()).valueOf();
      var time = endtime - parseInt(now / 1000);
      time = time > 0 ? time : 0;
      var d = parseInt(time / (60 * 60 * 24));
      var h = parseInt(time / 60 / 60 % 24);
      var m = parseInt(time / 60 % 60);
      var s = parseInt(time % 60);
      var html = '剩余' + d + '天' + h + '小时' + (m > 9 ? m : '0' + m) + '分钟' + (s > 9 ? s : '0' + s) + '秒';
      el.find('.time').html(html)
      if (time == 0) {
        clearInterval(timer)
      }
    }, 1000)

  }

  // 经纪人信息折叠/展开
  if ($('.list_right_list .lrl-item').length < 2) {
    $('.lrl-item .unfold').hide();
  }
  $('.list_right_list').delegate('.unfold', 'click', function () {
    let parentElement = $(this).closest('.list_right_list');
    $(this).hide(); //展开按钮隐藏
    parentElement.css({
      'height': 'auto',
      'overflow': 'visible'
    });
  });
  $('.list_right_list').delegate('.fold', 'click', function () {
    let parentElement = $(this).closest('.list_right_list');
    parentElement.find('.unfold').show();
    parentElement.css({
      'height': '.38rem',
      'overflow': 'hidden'
    });
  });
})
