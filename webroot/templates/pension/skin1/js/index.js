$(function(){

	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});

    //布局设置
    $('.org_content ul li:nth-child(3n)').css('margin-right','0');
    $('.org_content2 ul li:nth-child(4n)').css('margin-right','0');
    $('.org_news ul li:nth-child(2n)').css('margin-right','0');


})
