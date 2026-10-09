$(function(){
  var isload = false;
  var tabsSwiper = new Swiper('#swiper-container2',{
    speed:500,
    autoHeight: true,
    onSlideChangeStart: function(){
      $("#swiper-container1 .active-nav").removeClass('active-nav');
      $("#swiper-container1 .swiper-slide").eq(tabsSwiper.activeIndex).addClass('active-nav');
      $("#swiper-container2 .swiper-slide").eq(tabsSwiper.activeIndex).css('height', 'auto').siblings('.swiper-slide').height($(window).height() - $('.header').height() - $('#swiper-container1').height());
      $(window).scrollTop(0);
    },
    onSliderMove: function(){
      isload = true;
    },
    onSlideChangeEnd: function(){
      isload = false;
    }
  })
  $("#swiper-container1 .swiper-slide").on('touchstart mousedown',function(e){
    e.preventDefault();
    $("#swiper-container1 .active-nav").removeClass('active-nav')
    $(this).addClass('active-nav')
    tabsSwiper.slideTo( $(this).index() )
  })
  $("#swiper-container1 .swiper-slide").click(function(e){
    e.preventDefault()
  })


})
