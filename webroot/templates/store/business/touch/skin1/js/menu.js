$(function(){
	$('#menu').show();
	$("#menu").mmenu({
	    extensions: ["theme-dark", "effect-listitems-slide"],
	    counters: true,
		slidingSubmenus: false
	})
	// 关闭按钮
	// var API = $("#menu").data("mmenu");
	// $(".closed").click(function(){
	// 	API.close();
	// })
})
