$(function(){
	$(".img_list li:nth-child(4n)").css("margin-right","0");
	// $("#totalCount").html(totalCount);

	// 窄屏下鼠标移入公司列表
	var showlongt;
	// $('.list li').hover(function(){
	// 	if($('html').hasClass('w1200')) return;
	// 	$(this).addClass('hover');
	// },function(){
	// 	if($('html').hasClass('w1200')) return;
	// 	$(this).removeClass('hover');
	// });


	$('.sort li a').click(function(){
		var p = $(this).parents('li');
		$(this).toggleClass('curr');
		p.siblings().find('a').removeClass('curr');
		
	})
	//设计师工长 立即预约
	$('.tel span').click(function(){
		$('.team_mask').show();
		var team_man=$(this).parents('.content').find('.name a').text();
		$('.team_man').text(team_man);
		$("#userid").val($(this).attr("data-userid"));
		$("#type").val($(this).attr("data-type"));
	})


})
