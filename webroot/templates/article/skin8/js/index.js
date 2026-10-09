$(function () {
    //右侧图片轮播
    $(".adbox .slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});
    //左侧侧图片轮播
    $(".elepress .slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});

    // 商城资讯--焦点图
    var swiperNav = [], mainNavLi = $('.slideBox4 .bd').find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        var item = mainNavLi.eq(i);
        var html = $.trim(item.html());
        if(html){
            swiperNav.push($('.slideBox4 .bd').find('li:eq('+i+')').html());
        }else{
            item.remove();
        }
    }
    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 5).join(""));
        i += 4;
    }
    $('.slideBox4 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    $(".slideBox4").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});

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