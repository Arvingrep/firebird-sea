$(function(){

    $('.markBox').find('a:first-child').addClass('curr');
    //轮播图
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,autoplay: true,loop: true,grabCursor: true,paginationClickable: true,
        on: {
            slideChangeTransitionStart: function(){
                var len = $('.markBox').find('a').length;
                var sindex = this.activeIndex;
                if(len==1){
                    $('.markBox').find('a:first-child').addClass('curr');
                }else if(len==3){
                    if(sindex > 1){
                        $('.pmark').removeClass('curr');
                        $('.picture').addClass('curr');
                    }else if(sindex == 1){
                        $('.pmark').removeClass('curr');
                        $('.video').addClass('curr');
                    }else{
                        $('.pmark').removeClass('curr');
                        $('.panorama').addClass('curr');
                    }
                }
            },
        }
    });

	$('.appMapBtn').attr('href', OpenMap_URL);


    //如果是安卓腾讯X5内核浏览器，使用腾讯TCPlayer播放器
    var player = document.getElementById('video'), videoWidth = 0, videoHeight = 0, videoCover = '', videoSrc = '', isTcPlayer = false;
    if(device.indexOf('MQQBrowser') > -1 && device.indexOf('Android') > -1 && player){
        videoSrc = player.getAttribute('src');
        videoCover = player.getAttribute('poster');
        var vid = player.getAttribute('id');

        videoWidth = $('#' + vid).width();
        videoHeight = $('#' + vid).height();

        $('#' + vid).after('<div id="tcPlayer"></div>');
        $('#' + vid).remove();
        document.head.appendChild(document.createElement('script')).src = '//imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.2.2.js';
        isTcPlayer = true;
    }


    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.topcomm', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i, 0, false);

        //安卓腾讯X5兼容
        if(player && isTcPlayer){
            new TcPlayer('tcPlayer', {
                "mp4": videoSrc, //请替换成实际可用的播放地址
                "autoplay" : false,  //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
                "coverpic" : videoCover,
                "width" :  videoWidth,  //视频的显示宽度，请尽量使用视频分辨率宽度
                "height" : videoHeight  //视频的显示高度，请尽量使用视频分辨率高度
            });
        }

        return false;
    });

    $(".videoModal").delegate('.vClose', 'click', function() {
        var video = $('.videoModal').find('video').attr('id');
        if(player && isTcPlayer){
            $('#tcPlayer').html('');
        }else{
            $(video).trigger('pause');
        }

        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
        return false;
    });



    // 点击微信
    $('.im_icon .im_wx').click(function(){
        $('.wx_frame').show();
        $('.desk').show();
    });
    $('.wx_frame .wx_cuo').click(function(){
        $('.wx_frame').hide();
        $('.desk').hide();
    });

    // 点击qq
    $('.im_icon .im_qq').click(function(){
        $('.qq_frame').show();
        $('.desk').show();
    });
    $('.qq_frame .qq_cuo').click(function(){
        $('.qq_frame').hide();
        $('.desk').hide();
    });

    // 点击电话
    $('.im_icon .im_iphone').click(function(){
        var t = $(this), phone = t.data('phone');
        if(phone){
            $('.phone_frame p').text(phone).next('a').attr('href', 'tel:'+phone);
        }
        $('.phone_frame').show();
        $('.desk').show();
    });
    $('.phone_frame .phone_cuo').click(function(){
        $('.phone_frame').hide();
        $('.desk').hide();
    });

    // 点击收藏
    $('.follow-wrapper').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.find('.follow-icon').hasClass('active')){
            t.find('.follow-icon').removeClass('active');
            t.find('.text-follow').text(langData['education'][0][2]);//收藏
            type = 'del';
        }else{
            t.find('.follow-icon').addClass('active');
            t.find('.text-follow').text(langData['education'][4][6]);//已收藏
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=education&temp=store-detail&type="+type+"&id="+pageData.id);
    });


    //售后弹出层

    $('.comp_content .shouhou').bind('click', function(){
        $('.sale-popup').css("visibility","visible");
    });

    $('.sale-popup .close').bind('click', function(){
        $('.sale-popup').css("visibility","hidden");
    });

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
              //解决左右两边切换高度不等问题
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

  var servepage = 1;
  var orderpage = 1;
  var totalpage = 0;
  var pageSize  = 5;
  var  objId = $('.tuijianInfo ul');
  var  objId2 = $('.tuijianshop ul');


    //加载
  var isload = isend = false;
  $(window).scroll(function() {
      var allh = $('body').height();
      var w = $(window).height();
      var scroll = allh - w;
      if($('#tab_serv').hasClass('active')){
          if ($(window).scrollTop() >= scroll && !isload) {
              servepage++;
              getList();
          }
      }else{
          if ($(window).scrollTop() >= scroll && !isend) {
              orderpage++;
              getList2();
          }
      }
  });

  function getHeight(){
    //解决左右两边切换高度不等问题
  var ulHeight=$('#tabs-container .swiper-slide-active ul').height();
  ulHeight = ulHeight==0 ? 40 : ulHeight;
  $("#tabs-container .swiper-slide").height(ulHeight);
}

  getList(1);
  getList2(1);
  //服务人员
  function getList(item) {
      isload = true;
      if(servepage == 1){
          $(".tuijianInfo ul").html('');
      }

      var data = [];
      data.push("page="+servepage);
      data.push("pageSize="+pageSize);
      data.push("store="+pageData.id);

      $.ajax({
          url: masterDomain + "/include/ajax.php?service=education&action=coursesList&"+data.join("&"),
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
              isload = false;
              if(data && data.state == 100){
                  $(".tuijianInfo ul .empty").remove();
                  var html = [], list = data.info.list, pageinfo = data.info.pageInfo,html2=[];
                  if(list.length>0){
                    console.log(333)
                    for (var i = 0; i < list.length; i++) {
                      
                      //填充海报数据
                      if(i==0){
                        console.log(444)
                        $('.html2_courseList h4 span').text(list[i].title);
                        var ntPrice = (list[i].price).split('.');
                        $('.html2_courseList .btn_price b').text(ntPrice[0]+(ntPrice[1] > 0?'.'+ntPrice[1]:''));
                      }else{
                        html2.push('<span>'+list[i].title+'</span>')
                      }
                      
                      
                      html.push('<li><a href="'+list[i].url+'">');
                      if(list[i].rec==1){
                          html.push('<img src="'+templets_skin+'images/new_recom.png" class="new_recom">');
                      }
                      html.push('<div class="left_b"><img src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" class="new_descrip_img"></div>');
                      html.push('<div class="right_b">');
                      html.push('<p class="class_title">'+list[i].title+'</p>');
                      html.push('<p class="recom_zu"><span>'+list[i].classname+'</span></p>');
                      html.push('<p class="class_price"><span>'+list[i].price+'</span><span>'+echoCurrency('short')+langData['education'][7][17]+'</span><span>'+list[i].sale+langData['education'][7][19]+'</span></p>');
                      html.push('</div>');
                      html.push('</a></li>');
                    }
                  }else{
                      $('.educationStore .html2Con .html2_courseList').remove();
                  }
                  if(html2.length>0){
                    $('.html_text h5').html(html2.join(""));
                  }else{
                    $('.educationStore .html2Con .html_text').remove();
                  }
                  
                  if(servepage == 1){
                      $(".tuijianInfo ul").html("");
                      $(".tuijianInfo ul").html(html.join(""));
                  }else{
                      $(".tuijianInfo ul").append(html.join(""));
                  }
                  isload = false;

                  if(servepage >= pageinfo.totalPage){
                      isload = true;
                      $(".tuijianInfo ul").append('<div class="empty">'+langData['homemaking'][8][65]+'</div>');
                  }
              }else{
                  if(servepage == 1){
                      $(".tuijianInfo ul").html("");
                  }
                  $(".tuijianInfo ul").html('<div class="empty">'+data.info+'</div>');
                  $('.educationStore .html2Con .html2_courseList').remove();
                  $('.educationStore .html2Con .html_text').remove();
              }
                getHeight();
          },
          error: function(){
              isload = false;
              if(servepage == 1){
                  $(".tuijianInfo ul").html("");
              }
              $(".tuijianInfo ul .empty").html(langData['homemaking'][8][66]).show();
                getHeight();
          }
      });

  }

  function getList2(item) {
      isend = true;
      if(orderpage == 1){
          $(".tuijianshop ul").html('');
      }

      var data = [];
      data.push("page="+orderpage);
      data.push("pageSize="+pageSize);
      data.push("store="+pageData.id);

      $.ajax({
          url: masterDomain + "/include/ajax.php?service=education&action=teacherList&"+data.join("&"),
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
              isload = false;
              if(data && data.state == 100){
                  $(".tuijianshop ul .empty").remove();
                  var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                  for (var i = 0; i < list.length; i++) {
                      html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                      html.push('<div class="teacher_info fn-clear">');
                      html.push('<div class="left_b"><img src="'+huoniao.changeFileSize(list[i].photo, "small")+'"></div>');
                      html.push('<div class="right_b fn-clear">');
                      var sex = list[i].sex==1 ? 'class="sex_nan"' : 'class="sex_nv"';
                      html.push('<div class="tec_name"><h1>'+list[i].name+'</h1><span '+sex+'></span></div>');
                      html.push('<div class="tec_class">主授课程：'+list[i].courses+'</div>');
                      var sk1 = list[i].certifyState ? '<span class="sk1">身份认证</span>' : '';
                      var sk2 = list[i].degreestate ? '<span class="sk2">学历认证 </span>' : '';
                      html.push('<div class="tec_skill">'+sk1+sk2+'</div>');
                      html.push('</div>');
                      html.push('</div>');
                      html.push('</a></li>');
                  }

                  if(orderpage == 1){
                      $(".tuijianshop ul").html("");
                      $(".tuijianshop ul").html(html.join(""));
                  }else{
                      $(".tuijianshop ul").append(html.join(""));
                  }
                  isend = false;

                  if(orderpage >= pageinfo.totalPage){
                      isend = true;
                      $(".tuijianshop ul").append('<div class="empty">'+langData['homemaking'][8][65]+'</div>');
                  }

              }else{
                  if(orderpage == 1){
                      $(".tuijianshop ul").html("");
                  }
                  $(".tuijianshop ul").html('<div class="empty">'+data.info+'</div>');
              }
                getHeight();
          },
          error: function(){
              isend = false;
              if(orderpage == 1){
                  $(".tuijianshop ul").html("");
              }
              $(".tuijianshop ul .empty").html(langData['homemaking'][8][66]).show();
                getHeight();
          }
      });
  }





})
