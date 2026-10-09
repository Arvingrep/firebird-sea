$(function () {
    // var navHeight = $('.navlist').offset().top;
    // //时间轴吸顶
    // $(window).scroll(function() {
    //     if ($(window).scrollTop() > navHeight) {
    //         $('.navlist').addClass('topfixed');
    //     } else {
    //         $('.navlist').removeClass('topfixed');
    //     }
    // });

    // 焦点图
    // var swiperNav = [], mainNavLi = $('.slideBox2 .bd').find('li');
    // for (var i = 0; i < mainNavLi.length; i++) {
    //     swiperNav.push($('.slideBox2 .bd').find('li:eq('+i+')').html());
    // }
    // var liArr = [];
    // for(var i = 0; i < swiperNav.length; i++){
    //     liArr.push(swiperNav.slice(i, i + 1).join(""));
    //     i += 0;
    // }
    // $('.slideBox2 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    $(".slideBox2").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});

    // //加载更多
    // $('.channel_mod .list .loadmore').click(function () {
    //     page=page+1;
    //     getDatas(page);
    // });


    //  首页新闻ajax请求
    $.fn.getAjax({
        page:1,
        pageSize:10,
        typeid: typeid,

        container:'#piclist'
    })

        //左侧浮动导航定位
     $(document).scroll(function(){
        var top =  $('.channel_mod').offset().top;
        var left =  $('.channel_mod').offset().left;
        if($(document).scrollTop()>top){
          //console.log($('.channel_mod').offset().top)

            $('.fudong-nav').css({'left':left-180,'position':'fixed','z-index':'12'})
        }else{
            $('.fudong-nav').css({'left':'0','position':'absolute','z-index':'12'})
        }
        
    });
    
    //左侧浮动导航栏二级导航定位

     $('.fudong-nav>li').hover(function(){
        var nav_H = $('.fudong-nav').height();
        var nav_second = $(this).find('.secondnac-box');
        var li_top =  $(this).offset().top;
        var ul_top =  $(this).parents('.fudong-nav').offset().top;
        if(nav_second.find('li').length==0){
            nav_second.remove()
        }
        if(nav_second.height()>nav_H){
            nav_second.css('top','0');
            $(this).css('position','static')
        }else if(li_top<nav_second.height()){
            nav_second.css('top','0');
            $(this).css('position','relative')
        
        }else if(li_top>nav_second.height()){
            nav_second.css('bottom',-.75*(nav_second.height()));
            $(this).css('position','relative')
        }
        
    },function(){});

     





});