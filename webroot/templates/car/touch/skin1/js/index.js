$(function () {
  // var device = navigator.userAgent;
  // if(device.indexOf('huoniao') > -1){
  //   $('.area a').bind('click', function(e){
  //     e.preventDefault();
  //     setupWebViewJavascriptBridge(function(bridge) {
  //       bridge.callHandler('goToCity', {'module': 'car'}, function(){});
  //     });
  //   });
  // }
    // banner轮播图
    new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

    //推荐车型切换
    $('.nav-tab li').click(function(){
        $(this).addClass('curr').siblings().removeClass('curr');
        var i = $(this).index();
        $('.filter .container').eq(i).addClass('show').siblings().removeClass('show');
    });

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

    // 回到顶部
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>200 ){
            $(".gotop").show();
        }else {
            $(".gotop").hide();
        }
    });

    $(".inp").delegate("#search","click",function(){
        $("#myForm").submit();
    });

});