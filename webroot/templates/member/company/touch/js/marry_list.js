$(function () {
    $('.tab-box a').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });
});