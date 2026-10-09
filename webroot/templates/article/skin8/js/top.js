$(function () {
    $('.header .wx_box').on('mouseover',function () {
        $('.header .wx_img').addClass('show');
    });
    $('.header .wx_box').on('mouseout',function () {
        $('.header .wx_img').removeClass('show');
    });
});