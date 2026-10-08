$(function(){

	// 播放视屏
    $('.view-content .view-item').click(function(){
        var t = $(this), url = t.attr('data-src'), title = t.attr('data-title');
        if(url!=undefined){
            $('.playdalog iframe').attr('src',url);
            $('.playdalog .title').html(title);
            $('.playdalog').show();
        }
    });

    $('.playdalog>div .close').click(function(){
        $('.playdalog').hide();
        $('.playdalog iframe').attr('src',0);

    });


})
