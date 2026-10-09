$(function(){

  // {#$langData['siteConfig'][18][2]#}
  $('.header-middle span').click(function(){
    var t = $(this);
    if (t.hasClass('on')) {
      $('body').removeClass('fixed');
      t.removeClass('on');
      $('.layer').removeClass('show').animate({"opacity":"0"}, 100);
    }else {
      $('body').addClass('fixed');
      t.addClass('on');
      $('.layer').addClass('show').animate({"opacity":"1"}, 100);
    }

  })

  $('.layer .mask').click(function(){
    $('body').removeClass('fixed');
    $('.header-middle span').removeClass('on');
    $('.layer').removeClass('show').animate({"opacity":"0"}, 100);
  })

  // 下拉刷新
  var RefreshCreateList = function () {
    var tab = $('.tabs .active'), index = tab.index();
    var html = [];
    for (var i = 0; i < 2; i += 1) {
        html.push('<div class="item">')
        html.push('<a href="store-comment-detail.html">')
        html.push('<p class="fn-clear"><span class="name fn-left">【我是后来的】</span><span class="star fn-right"><s><i></i></s></span></p>')
        html.push('<p class="content">好评！</p>')
        html.push('<p class="fn-clear"><span class="nickname fn-left">千值</span><span class="time fn-right">2017-03-20 16:34:23</span></p>')
        html.push('</a>')
        html.push('</div>')
    }
    $('.list').prepend(html.join(""));
  };


  // 加载更多
  var MoreCreateList = function () {
    var tab = $('.tabs .active'), index = tab.index();
    var html = [];
    for (var i = 0; i < 2; i += 1) {
        html.push('<div class="item">')
        html.push('<a href="store-comment-detail.html">')
        html.push('<p class="fn-clear"><span class="name fn-left">【我是后来的】</span><span class="star fn-right"><s><i></i></s></span></p>')
        html.push('<p class="content">好评！</p>')
        html.push('<p class="fn-clear"><span class="nickname fn-left">千值</span><span class="time fn-right">2017-03-20 16:34:23</span></p>')
        html.push('</a>')
        html.push('</div>')
    }
    $('.list').append(html.join(""));
  };


  new DragLoading($('.loading'), {
      onReload: function () {
          var self = this;
          setTimeout(function () {
              RefreshCreateList();
              self.origin();
          }, 2000* Math.random());
      }
  });


  // 加载更多
	$(document).ready(function() {
		$(window).scroll(function() {
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w;
			if ($(window).scrollTop() > scroll) {
          MoreCreateList();
			};
		});
	});



})
