
$(function(){
	$('.top_cont li').click(function(){
		var i = $(this).index();
		$(this).addClass('on').siblings().removeClass('on');
		$('.listBox .ul_box').eq(i).addClass('show').siblings('.ul_box').removeClass('show')
	});
})
