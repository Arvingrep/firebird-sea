$(function() {
    //瀑布流布局
    var $container = $('#masonry');
    $container.imagesLoaded(function() {
        $container.masonry({
            itemSelector: '.item',
            gutter: 13,
            isAnimated: true,
        });
    });


});