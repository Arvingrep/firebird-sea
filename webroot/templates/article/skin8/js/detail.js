$(function () {
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.part .content ul li:nth-child(2n)').css('margin-right','0');
    }
    $(".JQ-slide").Slide({
        effect:"scroolLoop",
        autoPlay:false,
        speed:"normal",
        timer:3000,
        steps:1
    });
    
    $('.imgList li').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
        var t = $(this), hash = t.attr("data-hash");
        if(hash != undefined){
            var top = $(hash).offset().top;
            console.log(top);
            $('html,body').animate({
                scrollTop: top
            },500)
        }
    });
    
});