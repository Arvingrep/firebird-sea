$(function(){
	if($.browser.msie && parseInt($.browser.version) >= 8){
		$('.charge .charge-list:nth-child(3n)').css('margin-right','0');
		$('.footer .foot-bottom .wechat .wechat-pub:last-child').css('margin-right','0');
	}
	$('.charge .charge-list').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
	})
	$('.use-money .select-btn').click(function(){
		$(this).toggleClass('active');
	})
	// 立即充值弹窗
	$('.right-now .now-recharge').click(function(){
		$('.desk').show();
		$('.recharge-now-popup').show();
	})
	$('.recharge-close img').click(function(){
		$('.desk').hide();
		$('.recharge-now-popup').hide();
	})
})










