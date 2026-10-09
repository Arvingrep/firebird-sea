$(function () {
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
            $(hash).addClass('show').siblings().removeClass('show');
        }
    });

});