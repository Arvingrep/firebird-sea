$(function(){
	$('img').scrollLoading();
	// 幻灯片插件
	$(".lis_t li span").remove();
	$(".lis_t").slide({ mainCell:".bd ul",effect:"fold",autoPlay:true,});
	$(".slide_box").slide({mainCell:".bd ul",titCell:".hd ul",autoPage:"<li></li>",autoPlay:true,delayTime:500,effect:"fold"});
	$('.head_enter ul:nth-child(6n)').css('margin-right','0');
	//页面自适应设置
	$(window).resize(function(){
		var screenwidth = window.innerWidth || document.body.clientWidth;
		var criticalPoint = criticalPoint != undefined ? criticalPoint : 1500;
		var criticalClass = criticalClass != undefined ? criticalClass : "w1450";
		if(screenwidth < criticalPoint){
			$("html").removeClass(criticalClass);
		}else{
			$("html").addClass(criticalClass);
		}

		if($("#login_bg").html() != undefined){
			$("#login_bg").css({"height": $(document).height()});
		}
	})

})
