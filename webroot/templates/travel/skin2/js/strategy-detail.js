$(function(){

    //热门目的地搜索
    $('.i_search').click(function(){
        if ($('.textBox').val()!=''){
            $('.glForm').submit();
        } 
    })
    //控制目的地的字数
    $('.dest_a').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });
    $('.gl_con').delegate('li','click',function(){
        var txt = $(this).find('a').data('dest');
        location.href = channelDomain+'/grouptravel.html?keywords='+txt
    });

	
})
