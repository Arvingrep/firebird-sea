$(function(){
	$('.tabbox').find('span:first-child').addClass('on_tab');
	new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,loop: false,grabCursor: true,paginationClickable: true,
		on: {
		    slideChangeTransitionStart: function(){
              var len = $('.tabbox').find('span').length;
		      var sindex = this.activeIndex;
              if(len==1){
                $('.tabbox').find('span:first-child').addClass('on_tab');
              }else{
                if(sindex > 0){
                    $('.tabbox span').removeClass('on_tab');
                    $('.picture').addClass('on_tab');
                }else{
                    $('.tabbox span').removeClass('on_tab');
                    $('.video').addClass('on_tab');
                }
              }

		    },
		}
	});

 
//查看大图
    var videoSwiper = new Swiper('.videoModal .swiper-container', {
    	pagination: {
	  		el:'.videoModal .swiper-pagination',
	  		type: 'fraction',
	  	},
    	loop: false})
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
    

//收藏
	$(".soucan").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = langData['travel'][5][13];   //"已收藏"
		
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			top.location.href = masterDomain + '/login.html';
			return false;
		}

		if(!t.hasClass("curr")){
			t.addClass("curr");
		}else{
			type = "del";
			t.removeClass("curr");
			oper = "-1";
			txt = langData['travel'][5][12];  //收藏
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
			$i.remove();
		});

        t.find('span').html(txt);
        
        var temp = '';
        if(catid == 'rentcar'){
            temp = 'rentcar-detail';
        }else if(catid == 'store'){
            temp = 'store-detail';
        }else if(catid == 'agency'){
            temp = 'agency-detail';
        }else if(catid == "visa"){
            temp = 'visa-detail';
        }else if(catid == 'hotel'){
            temp = 'hotel-detail';
        }

		$.post("/include/ajax.php?service=member&action=collect&module=travel&temp="+temp+"&type="+type+"&id="+id);   //收藏提交

	});
	
})


