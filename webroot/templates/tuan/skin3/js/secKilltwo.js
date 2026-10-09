//导航全部分类
$(".lnav").find('.category-popup').hide();
$(".lnav").hover(function(){
    $(this).find(".category-popup").show();
}, function(){
    $(this).find(".category-popup").hide();
});

// 切换
$('.info_header ul li').click(function () {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
});