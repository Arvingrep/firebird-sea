$(function () {
    //放大图片
    $.fn.bigImage({
        artMainCon:".content",  //图片所在的列表标签
    });
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
    var oH = $('.commentBox .list-tit').height();
    //左侧导航点击
    $(".tab-ul li").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop = $(".tab_con:eq("+index+")").offset().top -oH-20;
        console.log(theadTop)
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
                var offsetNextTop = $(".tab_con:eq(" + (index + 1) + ")").offset().top -oH-20;
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

    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][20][486]+'</div>');//加载失败！
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    //立即预约
    //预约弹窗弹出
    $('.seeStore').click(function(e){
        $('.order_mask').show();
        return false;

    })
    // 立即预约 表单验证
    $('.btns .sure').click(function(){
        var f = $(this);  
        var txt = f.text();      
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val();  
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = par.find('.areaCodeinp').val();
        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {
            f.addClass("disabled").text(langData['siteConfig'][6][35]+"...");//提交中...
    

            $.ajax({
                url: '/include/ajax.php?service=marry&action=updateContactlog&img='+imconfig.imgUrl+'&link='+imconfig.link+'&username='+name+'&tel='+tel+'&areaCode='+areaCodev+'&title='+imconfig.title,
                type: 'post',
                dataType: 'json',
                success: function(data){
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        $('.order_mask').hide()
                        $('.order_mask2').show()
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(data){
                    alert(langData['siteConfig'][20][180]);//提交失败，请重试！
                    f.removeClass("disabled").text(txt);
                },
            });
        }
    })

    // 立即预约关闭
     $('.btns .cancel').click(function(){
        $('.order_mask').hide();
   
     })
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })
    

});