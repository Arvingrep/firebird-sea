$(function(){
   $('.markBox').find('a:first-child').addClass('curr');
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,loop: false,grabCursor: true,paginationClickable: true,
        on: {
            slideChangeTransitionStart: function(){
              var len = $('.markBox').find('a').length;
              var sindex = this.activeIndex;
              if(len==1){
                $('.markBox').find('a:first-child').addClass('curr');
              }else{
                if(sindex>1){
                    $('.pmark').removeClass('curr');
                    $('.picture').addClass('curr');
                }else{
                    $('.pmark').removeClass('curr');
                    $('.markBox').find('a').eq(sindex).addClass('curr');
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
    $(".topSwiper").delegate('.swiper-slide', 'click', function() {
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
        $('.phone_frame').show();
        $('.desk').show();
    });
    $('.phone_frame .phone_cuo').click(function(){
        $('.phone_frame').hide();
        $('.desk').hide();
    });

    $('.appMapBtn').attr('href', OpenMap_URL);


})