$(function(){

	// 切换
    $(".albumsnav span").bind("click", function(){
        var t = $(this), id = t.find('a').attr("data-id");
        var  i = $(this).index();      
        t.addClass("active").siblings("span").removeClass("active");       
        $('.content-wrap .content').eq(i).addClass('show').siblings('.content').removeClass('show');
    });

    var len=$('.se_span').length;//如果只有店铺介绍时  无自定义介绍时 切换隐藏
    if(len == 0){
        $('.albumsnav').hide();
    }

})
