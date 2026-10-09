$(function() {
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('.photo-head-h').css('padding-top', '20px');
	}


	var mySwiper = new Swiper('.swiper-container', {
		onSlideChangeStart: function(swiper){
			getImage(swiper.activeIndex);
		}
	});

	mySwiper.swipeTo(atPage, 100, false);
	getImage(atPage);


	// $('.btn-box a').click(function() {
	// 	var t = $(this), index = t.data("index");
	// 	t.addClass('active');
	// 	t.siblings().removeClass('active');
	//
	// 	mySwiper.swipeTo(index, 100, false);
	// 	getImage(index);
	// })


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
