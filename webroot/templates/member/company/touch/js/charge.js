$(function(){
	$('.pay_way ul li').click(function(){
		var x = $(this);
		x.addClass('on');
		x.siblings().removeClass('on');
	})
})