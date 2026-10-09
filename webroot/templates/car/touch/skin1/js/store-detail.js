$(function () {
    // 轮播图
    $('.markBox').find('a:first-child').addClass('curr');
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,autoplay: true,loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});


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

    //更多服务
    $('.store-info .service-box .btn-more').on('click',function () {
        $(this).hide();
        $('.store-info .service-box .more-ser').show();
    });
    
    // 预约到店弹窗
    $('.others .make').click(function () {
        $('.pop-bg').show();
    });
    $('.pop-bg .pop-box .btns span.cancel').click(function () {
        $('.pop-bg').hide();
    });
    $('.pop-bg .pop-box .btns span.sure').click(function () {
        if($("#tel").val()==''){
            alert('请输入手机号码');
            return false;
        }
        var form = $("#storeform"), data = form.serialize();
        $.ajax({
            url: '/include/ajax.php?service=car&action=storeAppoint',
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    alert(data.info);
                    $('.pop-bg').hide();
                }else{
                    alert(data.info);
                }
            }
        });
    });
    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.topcomm', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal .swiper-wrapper").html("");
        for(var j = 0 ,c = imgBox.length; j < c ;j++){
            if(j==0){
                $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
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
            // oper = "-1";
            txt = langData['car'][5][35];
        }
        var x = t.offset().left, y = t.offset().top;

        t.html("<s></s>"+txt);

        $.post("/include/ajax.php?service=member&action=collect&module=car&temp=store-detail&type="+type+"&id="+id);

    });


    $('.adviser .adviser-list li .tel').on('click',function () {
        //$('.tel-box-bg').show();
        var t = $(this), phone = t.data('phone'), id = t.data('id');
        if(phone!=''){
            $(".tel-box p").html('即将拨打'+phone);
            $("#surephone").attr("href", "tel:" + phone);
            $("#surephone").attr("data-id", id);
            $('.tel-box-bg').show();
        }
    });

    $('.tel-box-bg>div .btns span.cancel').click(function () {
        $('.tel-box-bg').hide();
    });
    $('.tel-box-bg>div .btns span.sure').click(function () {
        var t = $(this), id = t.find('#surephone').data('id');
        $.ajax({
            url: '/include/ajax.php?service=car&action=updateAdviserClick&id=' + id,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                }else{
                }
            }
        });
        $('.tel-box-bg').hide();
    });


});