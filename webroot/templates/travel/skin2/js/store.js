$(function(){
	
    //查看完整电话
    $('.info_view').delegate('.seePhone','click',function(){
        var h3 = $(this).closest('.info_view').find('em');
        var realCall = h3.attr('data-call');
        h3.text(realCall);
        $(this).fadeOut(500);
        return false;
   })

})
