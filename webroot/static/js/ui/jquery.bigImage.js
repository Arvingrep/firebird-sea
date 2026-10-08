;(function ($) {
    $.fn.bigImage = function (options) {
        var artMainCon = options.artMainCon;

        $('body').append('    <style type="text/css">.bigBoxShow{width: 100%;height: 100%;position: fixed;top:0;left:0;z-index: -1;opacity:0;background: #000;transition: all .4s;}.bigBoxShow .bigSwiper{position: relative;width: 100%;height: 100%;}.bigBoxShow .bigSwiper .swiper-wrapper{width: 100%;height: 100%;}.bigBoxShow .bigSwiper .swiper-wrapper .swiper-slide{width: 100%;height: 100%;}.bigBoxShow .bigSwiper .swiper-wrapper .swiper-slide .swiper-img{width: 100%;height: 100%;text-align: center; display: -webkit-box;  -webkit-box-flex: 1;-webkit-box-orient: vertical;-webkit-box-align: center;-webkit-box-pack: center;}.bigBoxShow .bigSwiper .swiper-wrapper .swiper-slide .swiper-img img{display: block; max-width: 100%;max-height: 80%;margin:0 auto;}.bigBoxShow .bigPagination{color:#fff;font-size: .28rem;bottom:.5rem;}.vClose{position: absolute;top: .2rem;left: .2rem;width: .5rem;height: .5rem;display: none;background-size: .5rem;z-index: 11;}.vClose img{width: .5rem;height: .5rem;}.bigBoxShow .vClose{display:block;}</style>');
        $('body').append('<div class="bigBoxShow"><div class="swiper-container bigSwiper"><i class="vClose"><img src="/static/images/vclose.png" alt=""></i><div class="swiper-wrapper"></div><div class="swiper-pagination bigPagination"></div></div></div>');
        /*调起大图 S*/
        var mySwiper = new Swiper('.bigSwiper', {pagination: {el:'.bigPagination',type: 'fraction',},loop: false})

        $(artMainCon).delegate('img', 'click', function() {
            var imgBox = $(this).closest(artMainCon).find('img');
            // console.log(imgBox.length)
            var i = $(imgBox).index(this);
            // console.log(i)
            $('.bigBoxShow .swiper-wrapper').html("");
            for(var j = 0 ,c = imgBox.length; j < c ;j++){
                $('.bigBoxShow .swiper-wrapper').append('<div class="swiper-slide"><div class="swiper-img"><img src="' + imgBox.eq(j).attr("src") + '" / ></div></div>');
            }
            mySwiper.update();
            $('.bigBoxShow').css({
                "z-index": 999999,
                "opacity": "1"
            });
            mySwiper.slideTo(i, 0, false);
            // console.log(i)
            return false;
        });

        $('.bigBoxShow').delegate('.vClose', 'click', function() {
            $(this).closest('.bigBoxShow').css({
                "z-index": "-1",
                "opacity": "0",

            });

        });
        /*调起大图 E*/
    }

})(Zepto);
