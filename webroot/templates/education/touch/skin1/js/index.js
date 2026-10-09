$(function(){
  //切换城市
  var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
        // $('.pos_sz').bind('click', function(e){
        //     e.preventDefault();
        //     setupWebViewJavascriptBridge(function(bridge) {
        //         bridge.callHandler('goToCity', {'module': 'education'}, function(){});
        //     });
        // });
    }else{
       $('.pos_sz').bind('click', function(){
          location.href = $(this).data('url');
        });
    }
//搜索框
//接受输入的值
  $('.btn-go').click(function(){
    var keywords = $('#keywords').val()

    $('.textIn-box ').submit();

  });

 



  // banner轮播图
  new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

   // 滑动导航
    var t = $('.tcInfo .swiper-wrapper');
    var swiperNav = [], mainNavLi = t.find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push('<li>'+t.find('li:eq('+i+')').html()+'</li>');
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 10).join(""));
        i += 9;
    }

    t.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
    new Swiper('.tcInfo .swiper-container', {pagination: {el:'.tcInfo .pagination',}, loop: false, grabCursor: true, paginationClickable: true});


    // 悬浮发布
  $(document).ready(function (ev) {
      $('.menu').on('touchend', function (ev) {
          if($('.mask').hasClass('show')){
             $('.mask').removeClass('show');
           }else{
             $('.mask').addClass('show');
           }
          $('.mIcon').toggleClass('close');
          $('.menu').toggleClass('m_active');
          $('.mIcon.wx').toggleClass('m_curr');
          $('.mIcon.my').toggleClass('m_curr');
            $('.mIcon.gt').toggleClass('m_curr');
      });

  });


});
