$(function(){
	$(".list-more").click(function(){
		$(".shop-tuan ul ").css("height","auto");
		$(".list-more").hide();
		$(".list-back").show();
	})
	$(".list-back").click(function(){
		$(".shop-tuan ul").css("height","6.3rem");
		$(".list-more").show();
		$(".list-back").hide();
	})
})
