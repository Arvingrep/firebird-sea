$(function () {
    //左侧导航吸顶
    var navHeight = $('.navlist').offset().top;


    $(window).scroll(function() {
        if ($(window).scrollTop() > navHeight) {
            $('.navlist').addClass('topfixed');
        } else {
            $('.navlist').removeClass('topfixed');
        }
    });



});