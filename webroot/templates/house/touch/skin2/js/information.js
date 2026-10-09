$(function(){

$('.hx_top ul li').click(function(){
	var t = $(this);
	if(!t.hasClass('active')){
		t.addClass('active');
		t.siblings().removeClass('active');
	}
});



})