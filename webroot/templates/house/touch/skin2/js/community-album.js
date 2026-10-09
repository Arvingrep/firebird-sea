$(function() {
	$('img').scrollLoading();
	$(document).ready(function() {
		var top = [],glen = 0;
		$('.pic-box').each(function(){
			top.push($(this).offset().top);
			glen++;
		})
		$(window).scroll(function() {
			var sct = $(this).scrollTop() + 90;
			var n = 0;
			for(var i = 0; i < glen; i++){
				if(sct > top[i]){
					n = i;
				}
			}

			$('#wrapper .btn-box a').eq(n).addClass('active').siblings().removeClass('active');
		});
	});


	$('.h-menu').on('click', function() {
		if ($('.nav,.mask').css("display") == "none") {
			$('.nav,.mask').show();
			$('.header').css('z-index', '101');

		} else {
			$('.nav,.mask').hide();
			$('.header').css('z-index', '99');

		}
	})
	$('.mask').on('touchmove', function() {
		$(this).hide();
		$('.nav').hide();

	})
	$('.mask').on('click', function() {
		$(this).hide();
		$('.nav').hide();
		$('.header').css('z-index', '99');

	})

})
