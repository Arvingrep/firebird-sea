$(function () {
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.listBox ul.zt-list li:nth-child(3n)').css('margin-right','0');
    }
    $(".focusBox").slide({ titCell:".num li", mainCell:".pic",effect:"fold", autoPlay:true,trigger:"click",
    //下面startFun代码用于控制文字上下切换
        startFun:function(i){
            jQuery(".focusBox .txt li").eq(i).animate({"opacity":1}).siblings().animate({"opacity":0});
        }});

    $('.part-fir .fir-r .r-list li').hover(function () {
        $(this).addClass('on').siblings().removeClass('on');
    },function () {
        $(this).addClass('on');
    });

    // 中间文字滚动
    $(".qunar").slide({ mainCell:".e_pic_wrap ul",effect:"leftLoop", autoPlay:false, delayTime:400});
  
  //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num) + '...');
        }
    });
});