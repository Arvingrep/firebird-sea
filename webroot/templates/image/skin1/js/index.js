$(function(){
	$('img').scrollLoading();
	// 第一栏焦点图
	jQuery(".picFocus").slide({ mainCell:".bd ul",effect:"left",autoPlay:true});
	$(window).scrollTop(1);
})
