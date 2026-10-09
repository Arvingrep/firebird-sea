$(function(){
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('.header').css('top', 'calc(0px + 20px)');
		$('.tabs').css('top', 'calc(.92rem + 20px)');
		$('#tabs-container').css('margin-top', 'calc(2.2rem + 20px)');
	}
	// 导航条左右切换模块
	var tabsSwiper = new Swiper('#tabs-container',{
		speed:350,
		autoHeight: true,
		touchAngle : 35,
		onSlideChangeStart: function(){
			loadMoreLock = false;
			$(".tabs .active").removeClass('active');
			$(".tabs a").eq(tabsSwiper.activeIndex).addClass('active');

			$("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).css('height', 'auto').siblings('.swiper-slide').height($(window).height());

		},
		onSliderMove: function(){
			// isload = true;
		},
		onSlideChangeEnd: function(){
			$('body, html').scrollTop(0);
		}
	})
	$(".tabs a").on('touchstart mousedown',function(e){
		e.preventDefault();
		$(".tabs .active").removeClass('active');
		$(this).addClass('active');
		tabsSwiper.slideTo( $(this).index() );
	})

})
