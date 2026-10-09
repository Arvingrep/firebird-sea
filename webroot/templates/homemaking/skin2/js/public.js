$(function(){
    // 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.baomu_wrap .content ul li:nth-child(5n)').css('margin-right','0')
    }
    //弹出二级分类
    $(".nav-con .xm-li").hover(function(){
        $(this).find(".sub-category").stop(false,false).slideDown();
    },function(){
        $(this).find(".sub-category").stop(false,false).slideUp();
    });

})
