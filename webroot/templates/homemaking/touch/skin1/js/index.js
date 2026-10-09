$(function(){
  var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
        // $('.pos_sz').bind('click', function(e){       
        //     setupWebViewJavascriptBridge(function(bridge) {
        //         bridge.callHandler('goToCity', {'module': 'homemaking'}, function(){});
        //     });
        //   return false;
        // });
    }else{
      $('.pos_sz').bind('click', function(){
        location.href = $(this).data('url');
   	});
    }
//搜索框
//接受输入的值
  $('.btn-go').click(function(){
    var keywords = $('#keywords').val()

    $('.textIn-box ').submit();

  });



  // banner轮播图
  new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

   // 滑动导航
    var t = $('.tcInfo .swiper-wrapper');
    var swiperNav = [], mainNavLi = t.find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push('<li>'+t.find('li:eq('+i+')').html()+'</li>');
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 10).join(""));
        i += 9;
    }

    t.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
    new Swiper('.tcInfo .swiper-container', {pagination: {el:'.tcInfo .pagination',}, loop: false, grabCursor: true, paginationClickable: true});



  //左右导航切换(推荐信息、推荐店铺)
    var tabsSwiper = new Swiper('#tabs-container',{
    speed:350,
    touchAngle : 35,
    observer: true,
    observeParents: true,
    freeMode : false,
    longSwipesRatio : 0.1,
    on: {
          slideChangeTransitionStart: function(){
          // loadMoreLock = false;
              var recomTab = $('.recomTab');

              $(".recomTab .active").removeClass('active');
              $(".recomTab li").eq(tabsSwiper.activeIndex).addClass('active');

              $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).css('height', 'auto').siblings('.swiper-slide').height($(window).height());


          },
    },

  })

  $(".recomTab li").on('touchstart mousedown',function(e){
    e.preventDefault();
    $(".recomTab .active").removeClass('active');
    $(this).addClass('active');
    tabsSwiper.slideTo( $(this).index() );
  });


    //滚动信息
    $.ajax({
        url : "/include/ajax.php?service=homemaking&action=storeList",
        type : "GET",
        data : {},
        dataType : "json",
        success : function (data) {
            var obj = $(".mBox .swiper-wrapper");
            if(data.state == 100){
                var list = data.info.list;
                var html = '';
                var length = list.length;
                for (var i = 0; i < length; i++){
                    if(i < length){
                        if(i % 2 != 0 ){
                            continue;
                        }
                    }
                    var html2 = '';
                    if(i != length-1){
                        //欢迎。。。成功入驻
                        html2 =  '<a href="'+list[i+1].url+'" class="fn-clear"><p><span>'+huoniao.transTimes(list[i].pubdate, 5)+'</span><span>'+langData['homemaking'][0][4]+'</span><span>'+list[i+1].title+'</span><span>'+langData['homemaking'][0][5]+'</span></p></a>' ;
                    }
                    var html3='';
                    html += '<div class="swiper-slide swiper-no-swiping">' +
                        '<a href="'+list[i].url+'" class="fn-clear"><p><span>'+huoniao.transTimes(list[i].pubdate, 5)+'</span><span>'+langData['homemaking'][0][4]+'</span><span>'+list[i].title+'</span><span>'+langData['homemaking'][0][5]+'</span></p></a>' +
                        html2 +
                        '</div>';

                }
                obj.html(html);
                new Swiper('.tcNews .swiper-container', {direction: 'vertical', pagination: { el: '.tcNews .pagination'},loop: true,autoplay: {delay: 2000},observer: true,observeParents: true,disableOnInteraction: false});
            }
        }
    });


   //横向滚动
    var swiper = new Swiper('.jz_service .swiper-container', {
      slidesPerView: 2.5,
      spaceBetween: 15,
      slidesPerGroup: 3,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      }
    });

    // 悬浮发布
  $(document).ready(function (ev) {
      $('.menu').on('touchend', function (ev) {
          if($('.mask').hasClass('show')){
             $('.mask').removeClass('show');
           }else{
             $('.mask').addClass('show');
           }
          $('.mIcon').toggleClass('close');
          $('.menu').toggleClass('m_active');
          $('.mIcon.wx').toggleClass('m_curr');
          $('.mIcon.my').toggleClass('m_curr');
            $('.mIcon.gt').toggleClass('m_curr');
      });

  });

    var tabHeight = 1700;
    var lng = lat = 0;

    function getList(){
        var lat2 = lat,lng2 = lng;

            //推荐店铺
            $.ajax({
                url : '/include/ajax.php?service=info&action=shopList',
                data : {
                    'orderby' : 1,
                    'pagesize' : 10,
                    'page' : 1,
                    'lat2' : lat2,
                    'lng2' : lng2
                },
                type : 'get',
                dataType : 'json',
                success : function (data) {
                    if(data.state == 100){
                        list = data.info.list;

                        var obj = $(".tuijianshop .reShop");
                        var len = list.length;
                        var html = '';
                        var top_htm;

                        for (var i = 0; i < len; i++){
                            if(list[i].top == '1'){
                                top_htm = 'style="background:  #fff  url('+templatePath+'images/top.png)  no-repeat right top;background-size: .94rem;"';
                            }else{
                                top_htm = '';
                            }
                            var is_video = '';
                            if(list[i].video){
                                is_video = '<div class="mVideo"></div>';
                            }
                            var litphoto = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/404.jpg";

                            html += '<li class="acttop fn-clear" '+top_htm+'>' +
                                '<div class="rleft">' +
                                '<a href="'+list[i].url+'">' +
                                '<div class="rpic">' +
                                '<img src="'+litphoto+'" alt="">' +
                                is_video +
                                '</div>' +
                                '<div class="rinfo">' +
                                '<div class="rtitle">'+list[i].user.company+'</div>' +
                                '<p class="p-comment">'+list[i].shop_common+'评论</p>' +
                                // '<!--<span class="starbg"><i class="star" style="width: 60%;"></i></span>-->' +
                                '<p class="mark"><span class="mcolor1">商家</span><span class="mcolor2">'+list[i].typename+'</span></p>' +
                                '<p class="addr">'+list[i].address_[list[i].address_.length-1]+' <span><i class="pos"></i><em>'+list[i].lnglat_diff+'km</em></span></p>' +
                                '</div>' +
                                '</a>' +
                                '</div>' +
                                '<div class="rright tel" data-tel="'+list[i].tel+'">' +
                                '<img src="'+templatePath+'images/hPhone.png" alt="">' +
                                '</div>' +
                                '</li>';
                        }
                        obj.html(html+"<div class=\"loading\">到底了...</div>");
                    }else{
                        $(".tuijianshop .reShop").find('.empty').html('暂无数据！');
                    }
                }
            })


    }
    function checkLocal(){
        var local = false;
        if(!local){
            HN_Location.init(function(data){
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    lng = lat = -1;
                }else{
                    lng = data.lng;
                    lat = data.lat;
                    getList();
                }
            })
        }else{
            getList();
        }

    }

    checkLocal();




    $(window).scroll(function() {
        if ($(window).scrollTop() > tabHeight) {
            $('.recomTab').addClass('topfixed');
        } else {
            $('.recomTab').removeClass('topfixed');
        }
    });



});
