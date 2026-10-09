$(function(){
	//头部轮播图
   $(".slideBox").slide({mainCell:".bd ul",autoPlay:true});
   $(".materials .sub_tab li:first-child").addClass('on')
   $(".materials .material-main .tab-pane:first-child").addClass('show');
    //所需材料切换
    $('.sub_tab').delegate('li','click',function(){
    	$(this).addClass('on').siblings().removeClass('on')
    	var i=$(this).index();
    	$('.material-main .tab-pane').eq(i).addClass('show').siblings('.tab-pane').removeClass('show');
    })
})
