$(function () {
      // 轮播图
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,loop: false,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

    //放大图片
    $.fn.bigImage({
        artMainCon:".source-photos .photos",  //图片所在的列表标签
    });

    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num) + '...');
        }
    });

    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.swiper-slide', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');

        var i = $(this).index();
        $(".videoModal .swiper-wrapper").html("");
        for(var j = 0 ,c = imgBox.length; j < c ;j++){
            if(j==0){
                //if(detail_video!=''){
                   // $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><video width="100%" height="100%" controls preload="meta" x5-video-player-type="h5" x5-playsinline playsinline webkit-playsinline  x5-video-player-fullscreen="true" id="video" src="'+detail_video+'"  poster="' + imgBox.eq(j).find("img").attr("src") + '"></video></div>');
                //}else{
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
                //}
            }else{
                $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
            }

        }
        videoSwiper.update();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i, 0, false);
        return false;
    });

    $(".videoModal").delegate('.vClose', 'click', function() {
        var video = $('.videoModal').find('video').attr('id');
        $(video).trigger('pause');
        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
    });

    //收藏
    $(".collect .coll-box").bind("click", function(){
        var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
        }
        
        var t = $(this), type = "add", oper = "+1", txt = langData['car'][5][36];


        if(!t.hasClass("has")){
            t.addClass("has");
        }else{
            type = "del";
            t.removeClass("has");
            oper = "-1";
            txt = langData['car'][5][35];
        }


        var x = t.offset().left, y = t.offset().top;


        t.html("<s></s>"+txt);

        $.post("/include/ajax.php?service=member&action=collect&module=car&temp=detail&type="+type+"&id="+id);

    });

    $('.source-description .description-personal .user-info .tel-btn').on('click',function () {
        $('.tel-box-bg').show();
    });

    $('.tel-box-bg>div .btns span.cancel').click(function () {
        $('.tel-box-bg').hide();
    });
    $('.tel-box-bg>div .btns span.sure').click(function () {
        $('.tel-box-bg').hide();
    });


});