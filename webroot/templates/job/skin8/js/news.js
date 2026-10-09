$(function () {
    // 右边攻略tab切换
    $('.contentchange li').hover(function(){
        var t = $(this), index = t.index(), strategy = t.closest('.cr-strategy');
        t.addClass('active').siblings('li').removeClass('active');
        strategy.find('.mail').removeClass('active');
        strategy.find('.mail:eq(' + index + ')').addClass('active');
    })
    // 分页内容修改
    $('.pagination li:eq(0) span, .pagination li:eq(0) a').html('<');
    $('.pagination li:last-child span, .pagination li:last-child a').html('>');
    new Swiper('.d-center',{
        pagination: {
            el: ".dc-pagination",
            clickable:true
        },
        navigation: {
            nextEl: ".dc-next",
            prevEl: ".dc-prev",
        },
        slidesPerView: 1,
        loop: true,
        autoplay:true
    })
})

