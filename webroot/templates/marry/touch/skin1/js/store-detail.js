$(function () {
    $('.appMapBtn').attr('href', OpenMap_URL);
    //放大图片
    $.fn.bigImage({
        artMainCon:".introBox",  //图片所在的列表标签
    });

    

    // 赞
    $('.btnUp').on('click',function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var t = $(this), id = t.attr("data-id");
        // if(t.hasClass("active")) return false;
        var num = t.find('em').html();
        if( typeof(num) == 'object') {
            num = 0;
        }
        var type = 'add';
        if(t.hasClass("active")){
            type = 'del';
            num--;
        }else{
            num++;
        }

        $.ajax({
            url: '/include/ajax.php?service=member&action=dingComment&id=' + id + "&type=" + type,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data.state==100){
                    if(t.hasClass("active")){
                        t.removeClass('active');
                    }else{
                        t.addClass('active');
                    }
                    t.find('em').html(num);
                }else{
                    alert(data.info);
                    t.removeClass('active');
                }
            }
        });
    })

    // 轮播图
    $('.markBox').find('a:first-child').addClass('curr');
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,loop: false,grabCursor: true,paginationClickable: true,
        on: {
            slideChangeTransitionStart: function(){
                var len = $('.markBox').find('a').length;
                var sindex = this.activeIndex;
                if(len==1){
                    $('.markBox').find('a:first-child').addClass('curr');
                }else{
                    if(sindex > 0){
                        $('.pmark').removeClass('curr');
                        $('.picture').addClass('curr');
                    }else{
                        $('.pmark').removeClass('curr');
                        $('.video').addClass('curr');
                    }
                }

            },
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
                if(detail_video!=''){
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><video width="100%" height="100%" controls preload="meta" x5-video-player-type="h5" x5-playsinline playsinline webkit-playsinline  x5-video-player-fullscreen="true" id="video" src="'+detail_video+'"  poster="' + imgBox.eq(j).find("img").attr("src") + '"></video></div>');
                }else{
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
                }
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

    // 导航栏置顶
    var Ggoffset = $('.tab-ul').offset().top;               
    $(window).bind("scroll",function(){
        var d = $(window).scrollTop();   
        if(Ggoffset < d){
            $('.tab-ul').addClass('fixed');
        }else{
            $('.tab-ul').removeClass('fixed');
        }
     
    });
     //详情切换
    var isClick = 0;
    var oH = $('.pro_con .list-tit').height();
    //左侧导航点击
    $(".tab-ul li").bind("click", function(){
        
        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop = $(".tab_con:eq("+index+")").offset().top - oH -20;
        t.addClass("active").siblings("li").removeClass("active");
        $(window).scrollTop(theadTop);

        setTimeout(function(){
            isClick = 0;//开启滚动监听
          },500)
    });
    //滚动监听
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();  
        if(isClick) return false;//点击切换时关闭滚动监听
        
        var theadLength = $(".tab_con").length;
        $(".tab-ul li").removeClass("active");

        $(".tab_con").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".tab_con:eq(" + (index + 1) + ")").offset().top -oH -20;
                if (scroH < offsetNextTop) {
                    $(".tab-ul li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".tab-ul li:last").addClass("active");
                return false;
            }
        });

        
    });

    


});