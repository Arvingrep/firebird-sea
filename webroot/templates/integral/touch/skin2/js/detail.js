$(function(){

    /*调起大图 S*/
    $.fn.bigImage({
        artMainCon:".det-con",  //图片所在的列表标签
    });
  var video = document.getElementById("video");


	// 收藏
    $('.btn-collect').click(function(){
        var t = $(this), type = t.hasClass("collected") ? "del" : "add";
        if(type == 'add'){
            t.addClass('collected').html('<img src="'+templets+'images/collect1.png" alt="">');
        }else{
            t.removeClass('collected').html('<img src="'+templets+'images/collect.png" alt="">');
        }
		$.post("/include/ajax.php?service=member&action=collect&module=integral&temp=detail&type="+type+"&id="+detailID);
    });

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

  // 兑换弹出层
  $('.want').click(function(){
    if($(this).hasClass('disabled')){
      alert('抱歉，产品库存不足');
      return;
    }
    $('.mask').css({'opacity':'1','z-index':'100000'});
    $('.footBox').addClass('sizeShow');
    $('.closed').removeClass('sizeHide');
  })

  // 遮罩层
  $('.mask, .closed').click(function(){
      $('.mask').css({'opacity':'0','z-index':'-1'});
      $('.footBox').removeClass('sizeShow').addClass('sizeHide');
      $('body').unbind('touchmove')
  })

  // 兑换数量 加
  $('.add').click(function(){
    var count = $('.count'), num = parseInt(count.text()), inventory = parseInt(count.attr('data-inventory'));
    if($(this).hasClass('disabled')){
      alert('已达到库存数量');
      return;
    }
    if(num < inventory){
      count.text(num+1);
    }
    if(num + 1 == inventory){
      $(this).addClass('disabled');
    }
  })

  // 兑换数量 减
  $('.reduce').click(function(){
    var count = $('.count'), num = parseInt(count.text());
    if (num > 1) {
      count.text(num-1);
    }
    $('.add').removeClass('disabled');
  })

  // 礼品折扣
  $('.checkbox').click(function(){
    var t = $(this);
    if (t.hasClass('active')) {
      t.removeClass('active');
    }else {
      t.addClass('active');
    }
  })

  // 兑换方式
  $('.radio a').click(function(){
    if($(this).hasClass('disabled')){
      return;
    }
    $(this).addClass('active').siblings('a').removeClass('active');
  })

  // 兑换
  $('.sureBtn').click(function(){
    var t = $(this);
    if(t.hasClass('disabled')) return;

    var userid = $.cookie(cookiePre+'login_user');
    if(userid == undefined || userid == null || userid == ''){
      location.href = '/login.html';
      return;
    }

    var count = parseInt($('.count').text());

    // 如果使用全积分，判断用户积分
    var totalPoint = detail.price * pointRatio * count;
    var paytype = $('.radio a.active').attr('data-type');
    // if(paytype = 'point'){
    //   if(userPoint < totalPoint){
    //     alert('您的积分不足，请先充值');
    //     return;
    //   }
    // }

    window.location.href = confirmUrl.replace('#count', count).replace('#paytype', paytype);


  })








})