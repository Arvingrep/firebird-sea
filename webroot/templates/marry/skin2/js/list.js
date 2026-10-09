$(function(){

    //css 样式设置
    $('.listr_con li:last-child:last-child').css('border-bottom','none')
    $('.wedding-wrap li:last-child').css('margin-right','0')

	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});

    //点击查看完整电话
    $('.hotelbottom').delegate('.seePhone','click',function(){
        var h3 = $(this).closest('.hotelbottom').find('.tel');
        var realCall = h3.attr('data-call');
        h3.text(realCall);
        $(this).fadeOut(500);
        return false;
    })



})
