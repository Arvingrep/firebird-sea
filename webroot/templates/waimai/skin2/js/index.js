$(function(){
	$("#slideBox").slide({mainCell:".bd ul",effect:"leftLoop",autoPlay:true,autoPage:'<li></li>'});
	$('.buss-list li:nth-child(3n)').css('margin-right','0')
	$('.rightBox li:last-child').css('margin-right','0')

      // 鼠标经过产品列表
    $('.buss-list li').hover(function () {
		$(this).find('.move-info').hide();
        $(this).find('.see').addClass('show');
    },function () {
        $(this).find('.move-info').show();
        $(this).find('.see').removeClass('show');
    });
    

})
