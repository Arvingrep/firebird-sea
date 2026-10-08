$(function(){
    var video = document.getElementById('video');
    // 轮播
    new Swiper('.swiper-container', {pagination: {el: '.swiper-pagination',type: 'fraction',},loop: false,grabCursor: true,paginationClickable: true});

    $('.video-box').on('click',function(){
        $('.video-btn').css('display','-webkit-flex');
        $('#video-control').css('display','-webkit-flex');
        setTimeout(function(){ $('#video-control').css('display','none'); $('.video-btn').css('display','none');}, 5000);
    });
  


    // 图片放大
    $('.topMain .swiper-slide img').on('click',function(){
        $(this).closest('.swiper-container').addClass('fullscreen-box');
        return false;
    });
    // 视频链接弹出
    $('.markBox .mark1').on('click',function(){
        $('.videoModal').css('display','block');
        $('.markBox').toggleClass('show');
        return false;
    });
    // 大图关闭
    $('.topMain .vClose').on('click',function(){
        $('.swiper-container').removeClass('fullscreen-box');
        $('.markBox').removeClass('show');
        video.pause();
        return false;
    });
    $('.videoModal .vClose').on('click',function(){
        $('.videoModal').css('display','none');
        $('.markBox').removeClass('show');
        video.pause();
        return false;
    })

    
	$.fn.scrollTo =function(options){
        var defaults = {
            toT : 0, //滚动目标位置
            durTime : 500, //过渡动画时间
            delay : 30, //定时器时间
            callback:null //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };

    

	$('.appMapBtn').attr('href', OpenMap_URL);

      // 收藏
      $('.btnCollect').click(function(){
        var t = $(this), type = t.hasClass("collect1") ? "del" : "add";
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          location.href = masterDomain + '/login.html';
          return false;
        }
        if(type == 'add'){
            t.addClass('collect1');
        }else{
            t.removeClass('collect1');
        }
        $.post("/include/ajax.php?service=member&action=collect&module=business&temp=detail&type="+type+'&id='+id);
      });
    

	var slideHeight = 100; 
    var defHeight = $('.textCon').height();
    if(defHeight >= slideHeight){
        $('.textCon').css('height' , slideHeight + 'px');
        $('.readMore').append('<a href="javascript:;">展开更多<i class="rmDown"></i></a>');
        $('.readMore a').click(function(){
            var curHeight = $('.textCon').height();
            if(curHeight == slideHeight){
                $('.textCon').animate({height: defHeight}, "normal");
                $('.readMore a').html('全部收起<i class="rmUp"></i>');
                $('.gradient').fadeOut();
            }else{
                $('.textCon').animate({height: slideHeight}, "normal");
                $('.readMore a').html('展开更多<i class="rmDown"></i>');
                $('.gradient').fadeIn();
            }
            return false;
        });        
    }

    
 	// 用户评论
    $(".userInfo ul li a").on("click",function(){
        $(this).parents().addClass("curr").siblings().removeClass("curr");
        var i = $(this).parents().index();
        if(i<=1){
            $('.userCon').eq(i).addClass("show").siblings().removeClass("show");
        }
        if(i>2){
            $('.userCon').eq(i-1).addClass("show").siblings().removeClass("show");
        }
        
    })

    // 用户评论
    $(".userInfo ul li a.userCom").on("click",function(){
        $(this).parents().addClass("curr").siblings().removeClass("curr");
        var dealTop = $("#c-info").offset().top+50;
        $("html,body").scrollTo({toT:dealTop})
        return false;
    })
    // 相册分类切换
    $(".photoTop li").on("click",function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i = $(this).index();
        $('.photoMain').eq(i).addClass("show").siblings().removeClass("show");
    })


	// 电话弹框
    $(".foot-2, .btnTel").on("click",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-telphone').addClass('curr');
        return false;
    });
    
     // 微信弹框
    $(".foot-3").on("click",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-wx').addClass('curr');
        return false;
    });
    // 关闭
    $(".modal-public .modal-main .close").on("touchstart",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
    })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

    function auto_data_size(){
        var imgss= $("figure img");
        $("figure a").each(function() {
            var t = $(this);
            var imgs = new Image();
            imgs.src = t.attr("href");

            if (imgs.complete) {
                t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
            } else {
                imgs.onload = function () {
                    t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
                    imgs.onload = null;
                };
            };

        })
    };
    auto_data_size();

    function getComment(){
        var page = 1, pageSize = 2;
        var where = $('.goodMark li.active').data('id');
        where = where ? '&'+where : '';
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=member&action=getComment&type=business&isAjax=0&aid='+id+where+'&page='+page+'&pageSize='+pageSize,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    var list = data.info.list;
                    var pageInfo = data.info.pageInfo;
                    var html = [];
                    for(var i = 0; i < list.length; i++){
                        var d = list[i];
                        html.push('<li class="fn-clear" data-id="'+d.id+'" data-url="comdetail.html">');
                        html.push('    <div class="lileft">');
                        html.push('        <a href="javascript:;" class="headImg">');
                        html.push('            <img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt="">');
                        html.push('        </a>');
                        html.push('    </div>');
                        html.push('    <div class="liCon">');
                        html.push('        <h4 class="fn-clear">'+d.user.nickname+' <span>'+huoniao.transTimes(d.dtime, 2).replace(/-/g, '.')+'</span></h4>');
                        html.push('        <div class="conInfo">');
                        html.push('          <a href="'+d.url+'" class="link">');
                        html.push('            <p>'+d.content.replace(/\n/g, '<br>')+'</p>');
                        if(d.pics.length){
                            html.push('            <div class="comPic">');
                            html.push('                <div class="wrapper fn-clear">');
                            html.push('          <div class="my-gallery comment-pic-slide" itemscope="" itemtype="" data-pswp-uid="1">');
                            html.push('              <div class="swiper-wrapper">');

                            for(var n = 0; n < d.pics.length; n++){
                                html.push('                  <figure itemprop="associatedMedia" itemscope="" itemtype="" class="swiper-slide">');
                                html.push('                        <div itemprop="contentUrl" data-size="800x800" class="picarr" id="pic0">');
                                html.push('                          <img src="'+d.pics[n]+'" itemprop="thumbnail" alt="Image description">');
                                html.push('                        </div>');
                                html.push('                   </figure>');
                            }
                            html.push('              </div>');
                            html.push('          </div>');
                            html.push('        </div>');
                            html.push('                <span class="vmark picNum">'+d.pics.length+'张</span>');
                            html.push('            </div>');
                        }
                        html.push('         </a>');
                        html.push('            <div class="conBottom">');
                        if(d.is_self != "1"){
                            html.push('                <span class="like'+(d.zan_has == "1" ? " like1" : "")+'"><i></i><em>'+d.zan+'</em></span>');
                        }
                        html.push('                <a href="'+d.url+'"><span class="comment"><i></i><em>评论</em></span></a>');
                        html.push('            </div>');
                        html.push('        </div>');
                        html.push('    </div>');
                        html.push('</li>');
                    }
                    $('.comment_total').text(pageInfo.totalCount);
                    $('#comment_good').text(pageInfo.sco4 + pageInfo.sco5);
                    $('#comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
                    $('#comment_bad').text(pageInfo.sco1);
                    $('#comment_pic').text(pageInfo.pic);

                    $('.proBox').each(function(i){
                        var t = $(this), s = t.find('s'), num = t.find('.num'), r = 0, n = 0;
                        if(i == 0){
                            n = pageInfo.sco5;
                        }else if(i == 1){
                            n = pageInfo.sco4;
                        }else if(i == 2){
                            n = pageInfo.sco3;
                        }else if(i == 3){
                            n = pageInfo.sco2;
                        }else if(i == 4){
                            n = pageInfo.sco1;
                        }
                        r = (n / pageInfo.totalCount * 100).toFixed(2);
                        s.width(r + '%');
                        num.text(n > 999 ? '999+' : n);
                    })

                    $('#comment_good_ratio').text(parseInt((pageInfo.sco4+pageInfo.sco5)/pageInfo.totalCount*100 ) + '%');
                    $('.showlist').html(html.join(""));
                }
            }
        })
    }
    getComment();

    // 全部评论
    $(".goodMark ul li").on("click",function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i = $(this).index();
        $('.detailBox ul').eq(i).addClass('showlist').siblings().removeClass("showlist");
        getComment();
    })
});

// 视频
$(function(){
    
    var box = document.getElementById("video-control"); //box对象
    var video = document.getElementById("video"); //视频对象
    var play = document.getElementById("play"); //播放按钮
    var vbplay = document.getElementById("vbplay");//视频中间播放按钮
    var time = document.getElementById('time');
    var progress = document.getElementById("progress"); //进度条
    var bar = document.getElementById("bar"); //蓝色进度条
    var control = document.getElementById("control"); //声音按钮
    var sound = document.getElementById("sound"); //喇叭
    var full = document.getElementById("full") //全屏
    video.addEventListener('play', function() {
        play.className = "pause";
        $('.play-box').find('i').removeClass('play-icon').addClass('pause-icon');
    });
    video.addEventListener('pause', function() {
        play.className = "play";
        $('.play-box').find('i').removeClass('pause-icon').addClass('play-icon');
    });
    video.addEventListener('timeupdate', function() {
        var timeStr = parseInt(video.currentTime);
        var minute = parseInt(timeStr/60);
        if(minute == 0){
            if(timeStr < 10){
                timeStr = "0"+timeStr  ;
            }
            minute = "00:"+timeStr;
        }else{
            var timeStr = timeStr%60;
            if(timeStr < 10){
                timeStr = "0"+timeStr  ;
            }
            minute = minute +":"+timeStr;
        }
        time.innerHTML = minute;
    });
    video.addEventListener('volumechange', function() {
        if(video.muted) {
            sound.className = "soundoff"
        } else {
            sound.className = "soundon"
        }
    });
    full.addEventListener("click", function() {
        $('.video-box').parent().parent().toggleClass('fullscreen-box');
        $('.markBox').toggleClass('show');
        var type = $(this).hasClass('small') ? "del" : "add";
        if(type=="del"){
            $(this).removeClass('small')
        }else if(type=="add"){
            $(this).addClass('small')
        }

    }, false)
    play.onclick = function() {
        if(video.paused) {
            play.className = "pause";
            video.play();
        } else {
            play.className = "play";
            video.pause();
        }
    }
    vbplay.onclick = function() {
        if (video.paused){
            video.play();
            video.value = "pause";
        }else{
            video.pause();
            video.value = "play";
        }
    }
    //进度条
    video.addEventListener("timeupdate", function() {
        var scales = video.currentTime / video.duration;
        bar.style.width = progress.offsetWidth * scales + "px";
        control.style.left = progress.offsetWidth * scales + "px";
    }, false);
    var move = 'ontouchmove' in document ? 'touchmove' : 'mousemove';
    control.addEventListener("touchstart", function(e) {
        var leftv = e.touches[0].clientX - progress.offsetLeft - box.offsetLeft;
            if(leftv <= 0) {
                leftv = 0;
            }
            if(leftv >= progress.offsetWidth) {
                leftv = progress.offsetWidth;
            }
            control.style.left = leftv + "px"
    }, false);
    control.addEventListener('touchmove', function(e) {
        var leftv = e.touches[0].clientX - progress.offsetLeft - box.offsetLeft;
            if(leftv <= 0) {
                leftv = 0;
            }
            if(leftv >= progress.offsetWidth) {
                leftv = progress.offsetWidth;
            }
        control.style.left = leftv + "px"
    }, false);
    control.addEventListener("touchend", function(e) {
        var scales = control.offsetLeft / progress.offsetWidth;
        video.currentTime = video.duration * scales;
        video.play();
        document.onmousemove = null;
        document.onmousedown = null;
    //video.pause();
    }, false);
    sound.onclick = function() {
        if(video.muted) {
            video.muted = false;
            sound.className = "soundon"
        } else {
            video.muted = true;
            sound.className = "soundoff"
        }
    }
})