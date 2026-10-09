$(function () {
    // var navHeight = $('.navlist').offset().top;
    // //时间轴吸顶
    // $(window).scroll(function() {
    //     if ($(window).scrollTop() > navHeight) {
    //         $('.navlist').addClass('topfixed');
    //     } else {
    //         $('.navlist').removeClass('topfixed');
    //     }
    // });

    var keyWord=$('.txt_search').val();

    //	首页新闻ajax请求
    $.fn.getAjax({
        page:1,
        pageSize:6,
        title:encodeURIComponent(keyWord),
        container:'.nhc'
    })






});
