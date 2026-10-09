$(function(){

    $('.hx_top ul li').click(function(){
        var t = $(this);
        if(!t.hasClass('active')){
            t.addClass('active');
            t.siblings().removeClass('active');
            $('.huxing_main').hide();
            $('.huxing_main:eq('+t.index()+')').show();
        }
    });

})