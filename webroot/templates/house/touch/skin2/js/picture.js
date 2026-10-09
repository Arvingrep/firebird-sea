$(function() {
	var device = navigator.userAgent;
  	if(device.indexOf('huoniao') > -1){
        $('.photo-head .back').hide();
    }
    
	var mySwiper = new Swiper('.swiper-container', {
		onSlideChangeStart: function(swiper){
			getImage(swiper.activeIndex);
		},
		// Disable preloading of all images
        preloadImages: false,
        // Enable lazy loading
        lazyLoading: true
	});

	mySwiper.swipeTo(atPage, 100, false);
	getImage(atPage);


	$('.btn-box a').click(function() {
		var t = $(this), index = t.index();
		t.addClass('active');
		t.siblings().removeClass('active');

		var start = 0;
		for(var i = 1; i <= index; i++){
			start += $('.group-'+i).length;
		}

		mySwiper.swipeTo(start, 100, false);
		getImage(start);
	})


	function getImage(index){
		var li = $(".swiper-container li:eq("+index+")"), type = li.data("type"), img = li.find("img"), src = img.data("src"), alt = img.attr("alt");

		img.attr("src", src);
		$(".f14").html(alt);

		$(".btn-box a:eq("+(type-1)+")").addClass("active").siblings("a").removeClass();
	}

	$('.swiper-container').click(function(){
		if ($('.photo-head').css("display")=="none") {
			$('.photo-head,.f10,.btn-box').show();
		}else{
			$('.photo-head,.f10,.btn-box').hide();
		}
	})


})
$(document).ready(function(){
	var height = $(window).height() - $('.pic-btn').height()-$('.photo-head-h').height();
	$('.swiper-container,.swiper-slide').css('height',height);
	$('.swiper-slide').css('line-height',height+'px');
});