$(function(){
	
	// 二维码显示
	$(".code_btn").hover(function(){
		var p = $(this).parents('li');
		p.find(".code_box").show();
	},function(){
		var p = $(this).parents('li');
		p.find(".code_box").hide();
	})
	
})