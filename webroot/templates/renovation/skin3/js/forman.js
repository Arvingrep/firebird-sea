$(function(){

		//设计师工长 立即预约
	$('.go_order').click(function(){
		$('.team_mask').show();
		var team_man=$(this).parents('.content').find('.name a').text();
		$('.team_man').text(team_man);
		$("#userid").val($(this).attr("data-userid"));
		$("#type").val($(this).attr("data-type"));
	})


})
