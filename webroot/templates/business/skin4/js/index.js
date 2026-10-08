$(function(){
	$(".NavList li").hover(function(){
		$(this).addClass('active').siblings('li').removeClass('active');
	},function(){
		$(this).removeClass('active');
	});

	if($.browser.msie && parseInt($.browser.version) >= 8){
	  $('.tow_col li:nth-child(3n)').css('margin-right','0');

	}

	// 轮播图
	 $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slide_con",interTime:5000,effect:"fold",autoPlay:true,autoPage:"<li></li>"});


})
