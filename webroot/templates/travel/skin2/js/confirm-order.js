$(function(){

    // 左侧置顶
    //获取要定位元素距离浏览器顶部的距离
    var navH = $(".settlement").offset().top -100;
    var botH = $(".footer").offset().top-450; 
    //滚动条事件
    $(window).scroll(function(){
        //获取滚动条的滑动距离
        var scroH = $(this).scrollTop();
        //滚动条的滑动距离大于等于定位元素距离浏览器顶部的距离，就固定，反之就不固定
        if(scroH>=navH&&scroH<botH){
            $(".settlement").addClass('fixed');
        }else{
            $(".settlement").removeClass('fixed');
        }
    })



})
