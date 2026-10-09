$(function () {
    // //选择城市
    // if(device.indexOf('huoniao') > -1){
    //     $('.area a').bind('click', function(e){
    //         e.preventDefault();
    //         setupWebViewJavascriptBridge(function(bridge) {
    //             bridge.callHandler('goToCity', {'module': 'business'}, function(){});
    //         });
    //     });
    // }


    // banner轮播图
    new Swiper('.banner .swiper-container', {pagination: '.banner .pagination',slideClass:'slideshow-item',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});

    //广告轮播
    new Swiper('.AdBox .swiper-container', {pagination: '.AdBox .pagination',slideClass:'slideshow-item',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});

    //横向滚动
    var swiper = new Swiper('.org_service .swiper-container', {
      slidesPerView: 'auto',
    });


    //导航
    $.ajax({
        type: "POST",
        url: "/include/ajax.php",
        dataType: "json",
        data: 'service=business&action=type',
        success: function (data) {
            if(data && data.state == 100){
                var tcInfoList = [], list = data.info;
                for (var i = 0; i < list.length; i++){
                    if(list[i].code != 'special' && list[i].code != 'paper' && list[i].code != 'website'){
                        tcInfoList.push(`<li><a href="${typeUrl.replace('%id', list[i].id)}"><span class="icon-circle"><img src="${(list[i].iconturl ? list[i].iconturl : '/static/images/type_default.png')}" onerror="this.src='/static/images/404.jpg'"></span><span class="icon-txt">${list[i].typename}</span></a></li>`);
                    }
                }

                var liArr = [];
                for(var i = 0; i < tcInfoList.length; i++){
                    liArr.push(tcInfoList.slice(i, i + 10).join(""));
                    i += 9;
                }

                $('.tcInfo .swiper-wrapper').html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
                new Swiper('.tcInfo .swiper-container', {pagination: '.tcInfo .pagination', loop: false, grabCursor: true, paginationClickable: true});

            }else{
                $('.tcInfo').hide();
            }
        },
        error: function(){
            $('.tcInfo').hide();
        }
    });

    //控制标题的字数
    $('.slice').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

   // 电话弹框
    $(".tel").on("touchend",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-telphone').addClass('curr');
        return false;
    });
    // 关闭
    $(".modal-public .modal-main .close").on("touchend",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
     })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

    var lng = lat = 0;
    var page = 1, isload = false;

    // 获取推荐商家
    function getList(){
      if(isload) return false;
      isload = true;
      var pageSize = 15;
      $.ajax({
        url: '/include/ajax.php?service=business&action=blist&store=2&orderby=1&page='+page+'&pageSize='+pageSize+'&lng='+lng+'&lat='+lat,
        type: 'get',
        dataType: 'jsonp',
        success: function(data){
          if(data && data.state == 100){
            var html = [];

            for(var i = 0; i < data.info.list.length; i++){
              var d = data.info.list[i];
              var txt = '',nostar ='';
              if(d.sco1 == 0){
                txt = '<em>'+langData['business'][6][11]+'</em>';//暂无评分
                nostar = 'nostar';
              }

              html.push('<li class="fn-clear">');
              html.push('<a href="'+d.url+'">');
              html.push('  <div class="rleft">');
              html.push(`    <img src="${(d.logo ? d.logo : (templets + 'images/fShop.png'))}" onerror="this.src='/static/images/bus_default.png'">`);
              html.push('  </div>');
              html.push('  <div class="rright">');
              html.push('    <div class="rtitle"><p>'+d.title+'</p></div>');
              html.push('    <p class="comment fn-clear"><span class="starbg '+nostar+'"><i class="star" style="width: '+(d.sco1 / 5 * 100)+'%;"></i></span>'+txt+'<span class="dis">'+d.distance+'</span></p>');
              html.push('    <p class="addr"><i></i>'+d.address+'</p>');
              html.push('  </div>');
              html.push('   </a>');
              html.push('</li>');
            }

            if(page == 1){
                $('.recomBus ul').html(html.join(''));
            }else {
                $('.recomBus ul').append(html.join(''));
            }

            if(data.info.pageInfo.totalPage <= page){

             // $('.btnMore').text(langData['siteConfig'][20][429]).addClass('disabled');//已加载全部数据
            }else{
              isload = false;
            }


          }else{
            $('.recomWrap').html('<div class="nobus">'+langData['siteConfig'][20][126]+'</div>');
            //$('.btnMore').text(langData['siteConfig'][20][126]);//暂无相关信息

            if(page == 1){
                $('.recomBus ul').hide();
            }
          }
        },
        error: function(){
          if(page == 1){

            $('.recomBus ul').hide();
          }
          $('.recomWrap').html('<div class="nobus">'+langData['siteConfig'][6][203]+'</div>');
         // $('.btnMore').text(langData['siteConfig'][6][203]);//网络错误，请重试！
          page = page > 1 ? page - 1 : 1;
        }
      })
    }
    function checkLocal(){

        HN_Location.init(function(data){
          if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            lat = lng = -1;
            getList();
            $('.recomBus .moreBox').show();
          }else{
            lng = data.lng;
            lat = data.lat;

            var time = Date.parse(new Date());
            utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));

            getList();
            $('.recomBus .moreBox').show();
          }
        })

    }

    // $('.btnMore').click(function(){
    //   var t = $(this);
    //   if(isload || t.hasClass('disabled')) return;
    //   page++;
    //   getList();
    // })

    checkLocal();

    // 最新入驻

      var galleryTop = new Swiper('.gallery-top', {
        onSlideChangeEnd: function(swiper){
          var acindex = $('.gallery-top .swiper-slide-active').index()
          $(".gallery-thumbs .slideImg").eq(acindex).addClass('active').siblings('.slideImg').removeClass('active');
        }

      });

      $(".gallery-thumbs").delegate('.slideImg','click', function (e) {
          e.preventDefault();
          galleryTop.slideTo($(this).index());
          $(".gallery-thumbs .slideImg").removeClass('active');
          $(this).addClass('active');

      });



})
