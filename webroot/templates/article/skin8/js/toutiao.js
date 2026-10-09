$(function () {
    //var navHeight = $('.navlist').offset().top;
    //时间轴吸顶
    //$(window).scroll(function() {
        //if ($(window).scrollTop() > navHeight) {
            //$('.navlist').addClass('topfixed');
        //} else {
           // $('.navlist').removeClass('topfixed');
        //}
    //});

    // $(window).scroll(function(){
    //     var sct = $(window).scrollTop();
    //     if(sct + $(window).height() + 50 > $(document).height() && !loadMoreLock) {
    //         var CLASSID = CLASSIDArray[showPanelIndex];
    //         var panel = $('#chanel_' + CLASSID),
    //             page = parseInt(panel.attr('data-page'));
    //         totalPage = parseInt(panel.attr('data-totalPage'));
    //         if(page < totalPage) {
    //             loadMoreLock = true;
    //             getData(CLASSID,++page);
    //         }
    //     }
    // })

    //	首页新闻ajax请求
    $.fn.getAjax({
        page:1,
        pageSize:6,
        typeid: typeid,

        container:'.nhc'
    })


    //左侧浮动导航定位
    //左侧浮动导航定位
//      $(document).scroll(function(){
//         var top =  $('.channel_mod').offset().top;
//         var left =  $('.channel_mod').offset().left;
//         if($(document).scrollTop()>top){
// //          console.log($('.left-content').offset().top)
//             $('.ch2-list').css({'left':left-184,'position':'fixed','z-index':'12'})
//         }else{
//             $('.ch2-list').css({'left':'0','position':'absolute','z-index':'12'})
//         }
        
//     });
    
    
    //左侧浮动导航栏二级导航定位

    //  $('.ch2-list>li').hover(function(){
    //     var nav_H = $('.ch2-list').height();
    //     var nav_second = $(this).find('.secondnac-box');
    //     var li_top =  $(this).offset().top;
    //     var ul_top =  $(this).parents('.ch2-list').offset().top;
    //     if(nav_second.find('li').length==0){
    //         nav_second.remove()
    //     }
    //     if(nav_second.height()>nav_H){
    //         nav_second.css('top','44px');
    //         $(this).css('position','static')
    //     }else if(li_top<nav_second.height()){
    //         nav_second.css('top','44px');
    //         $(this).css('position','relative')
        
    //     }else if(li_top>nav_second.height()){
    //         console.log()
    //         nav_second.css('bottom',-.5*(nav_second.height()));
    //         $(this).css('position','relative')
    //     }
        
    // },function(){});

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
            console.log()
            nav_second.css('bottom',-.5*(nav_second.height()));
            $(this).css('position','relative')
        }
        
    },function(){});
  






});