$(function(){

    toggleDragRefresh('off');

	$('#left-box').delegate('li', 'click', function(event) {
		$(this).addClass('active').siblings().removeClass('active');
		var index = $(this).index();
		$('.right-box .box_content').eq(index).show().siblings().hide();
	});


	var headHieght = $('.header').height();
	var winHeight  = $(window).height();

	// $('#left-box').height(winHeight - headHieght);
	$('#right-box').height(winHeight - headHieght);

	// var myScrollLeft  = new IScroll('#left-box', {click:true});
	// var myScrollRight = new IScroll('#right-box', {click:true});

	// $('#left-box li').click(function(){
	// 	var index = $(this).index();

	// 	$(this).addClass('active').siblings().removeClass('active');
	// 	$('.right-box ul').eq(index).show().siblings().hide();

	// 	myScrollRight.refresh();
		
	// 	myScrollLeft.scrollToElement('#left-box li:nth-child('+(index+1)+')',1000)

	// })
})