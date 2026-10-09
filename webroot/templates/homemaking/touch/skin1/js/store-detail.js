$(function(){

	$('.appMapBtn').attr('href', OpenMap_URL);

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
            t.find('.text-follow').text(langData['homemaking'][0][10]);
            type = 'del';
        }else{
            t.find('.follow-icon').addClass('active');
            t.find('.text-follow').text(langData['homemaking'][8][84]);
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=homemaking&temp=store-detail&type="+type+"&id="+pageData.id);
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
              getHeight();

          },
    },

  })

  function getHeight(){
  	//解决左右两边切换高度不等问题
    var ulHeight=$('#tabs-container .swiper-slide-active ul').height();
    ulHeight = ulHeight==0 ? 40 : ulHeight;
    $("#tabs-container .swiper-slide").height(ulHeight);
  }


  $(".recomTab li").on('click',function(e){
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
        var allh = $('body').height() - 100;
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
        data.push("store="+store);

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=homemaking&action=hList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".tuijianInfo ul .empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li><a href="'+list[i].url+'" class="fn-clear">');
                        html.push('<div class="store_img"><img onerror="this.src=\''+list[i].litpic+'\'" src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt="" class="new_descrip_img"></div>');
                        html.push('<div class="new_descrip_content">');
                        html.push('<p class="new_descrip">'+list[i].title+'</p>');
                        html.push('<p class="sale_after">');
                        if(list[i].store.flagArr!=''){
                            for(var m=0;m<list[i].store.flagArr.length;m++){
                                var className = '';
                                if(m==1){
                                    className = 'sale_after_span';
                                }
                                if(m>2) break;
                                html.push('<span '+className+'>');
                               if(list[i].store.flagArr[m].litpic){
                                 html.push('<img src="'+list[i].store.flagArr[m].litpic+'" alt="">');
                               }                              
                               html.push('<span>'+list[i].store.flagArr[m].val+'</span></span>');
                            }
                        }
                        html.push('</p>');
                        html.push('<p class="new_order">');
                        html.push('<span class="new_price"><span>'+echoCurrency('symbol')+'</span><span class="price_num">'+list[i].price+'</span></span>');
                        var service_order = '';
                        if(list[i].homemakingtype==0){
                            service_order = langData['homemaking'][8][59];
                        }else if(list[i].homemakingtype==1){
                            service_order = langData['homemaking'][8][60];
                        }else if(list[i].homemakingtype==2){
                            service_order = langData['homemaking'][8][61];
                        }
                        html.push('<span class="service_order">'+service_order+'</span>');
                        if(list[i].flagAll!=''){
                            for(var m=0;m<list[i].flagAll.jc.length;m++){
                                if(m>=1) break;
                                html.push('<span class="service_arrive">'+list[i].flagAll.jc[m]+'</span>');
                            }
                        }
                        html.push('<span class="new_sale">'+langData['homemaking'][2][2]+'<span>'+list[i].sale+'</span></span>');
                        html.push('</p>');
                        html.push('</div>');
                        html.push('</a></li>');
                    }

                    if(servepage == 1){
                        $(".tuijianInfo ul").html("");
                        $(".tuijianInfo ul").html(html.join(""));
                        // setTimeout(function(){$(".tuijianInfo ul").html(html.join(""))}, 200);
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
        data.push("store="+store);

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=homemaking&action=nannyList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".tuijianshop ul .empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li  class="fn-clear"><a href="'+list[i].url+'">');
                        if(list[i].tag.indexOf('1')>-1){
                            html.push('<img src="'+templets_skin+'images/jin.png" alt="" class="new_recom">');
                        }
                        html.push('<div class="bm_img"><img src="'+list[i].photo+'" alt="" ></div>');
                        html.push('<div class="bm_right">');
                        html.push('<p class="bm_name">'+list[i].username+'</p>');
                        html.push('<p class="bm_info"><span>'+list[i].age+langData['homemaking'][8][82]+'</span><span>'+list[i].placename+langData['homemaking'][8][83]+'</span><span>'+list[i].educationname+'</span><span>'+list[i].experiencename+'</span></p>');
                        if(list[i].naturedescname!=''){
                            html.push('<p class="bm_type">');
                            for(var m=0;m<list[i].naturedescname.length;m++){
                                if(m>5) break;
                                html.push('<span>'+list[i].naturedescname[m]+'</span>');
                            }
                            html.push('</p>');
                        }
                        html.push('<p class="bm_salary">'+langData['homemaking'][8][95]+list[i].salaryname+langData['homemaking'][8][96]+'</p>');
                        html.push('</div>');
                        html.push('</a></li>');
                    }

                    if(orderpage == 1){
                        $(".tuijianshop ul").html("");
                        $(".tuijianshop ul").html(html.join(""));
                        // setTimeout(function(){$(".tuijianshop ul").html(html.join(""))}, 200);
                    }else{
                        $(".tuijianshop ul").append(html.join(""));
                    }
                    isend = false;

                    if(orderpage >= pageinfo.totalPage){
                        isend = true;
                        $(".tuijianshop ul").append('<div class="empty">'+langData['homemaking'][8][65]+'</div>');
                    }
                }else{
                    $('#nanny').hide();
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
