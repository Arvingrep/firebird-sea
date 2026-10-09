$(function(){

	$("img").scrollLoading();

	$('.txt_search').focus(function() {
		$(this).parents('.search_box').addClass('on');
	});
	$('.txt_search').blur(function() {
		$(this).parents('.search_box').removeClass('on');
	});

	 // 手机端、微信端
     $('.app-con .icon-box.app').hover(function(){
        $('.app-down').show();
     },function(){
        $('.app-down').hide();
     });
     $('.app-con .icon-box.wx').hover(function(){
        $('.wx-down').show();
     },function(){
        $('.wx-down').hide();
     })

	//导航【鼠标经过】
	$(".nav li").hover(function(){
		$(this).siblings("li").removeClass("active");
		$(this).addClass("active");
	}, function(){
		$(".nav li").removeClass("active");
		$(".nav ul").find(".curr").addClass("active");
	});

});
