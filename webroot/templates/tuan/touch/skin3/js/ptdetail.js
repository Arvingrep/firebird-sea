$(function(){

   var a = $('.people_list .swiper-slide').length;
   if(a == 1){
     $(".people .swiper-wrapper").css('height','1.1rem');
   }else if(a>=2){
     new Swiper('.people .swiper-container', {direction: 'vertical',autoplay:{delay: 5000,},slidesPerView:"auto",loop:true });
   }else{
     $('.people').html('');
   }



   // 轮播
    new Swiper('.topMain .swiper-container', {pagination: {el: '.swiper-pagination',type: 'fraction',},loop: false,grabCursor: true,paginationClickable: true});



    $('.video-box').on('click',function(){
        $('.video-btn').css('display','-webkit-flex');
        $('#video-control').css('display','-webkit-flex');
        setTimeout(function(){ $('#video-control').css('display','none'); $('.video-btn').css('display','none');}, 5000);
    });


    // 视频
    if($(".topMain .swiper-slide").hasClass('video-box')){

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
            }else{
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
    }
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
    })

    // 大图关闭
    $('.topMain .vClose').on('click',function(){
        $('.swiper-container').removeClass('fullscreen-box');
        $('.markBox').removeClass('show');
        return false;
    });
    $('.videoModal .vClose').on('click',function(){
        $('.videoModal').css('display','none');
        $('.markBox').removeClass('show');
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



    //查看图文详细
    $("#showDetail").bind("click", function(){
        $(this).hide();
        $("#bodyDetail .uknow-con").html($("#tuanDetail").val());
        $("#bodyDetail").show();
    });




    // 导航

      $(document).ready(function(){
        var navHeight= $(".detail_list").offset().top;
        var navFix=$("#nav-wrap");
        $(window).scroll(function(){
          if($(this).scrollTop()>navHeight){
            navFix.addClass("navFix");
          }
          else{
            navFix.removeClass("navFix");
          }
          })
      })
      // 内容信息导航锚点
      $('.nav-wrap').navScroll({
          mobileDropdown: false,
          slidesPerView : "auto",
          mobileBreakpoint: 768,
          scrollSpy: true
      });

        $('.click-me').navScroll({
          navHeight: 0
        });

        $('.nav-wrap').on('click', '.nav-mobile', function (e) {
          e.preventDefault();
          $('.nav-wrap ul').slideToggle('fast');
      });


    // 点击收藏
    $('.service .service_04').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

        var t = $(this), type = "add";
        if(t.hasClass('cang')){
            t.removeClass('cang');
            t.addClass('cang_active');
            t.text('已收藏');
        }else{
            type = "del";
            t.removeClass('cang_active');
            t.addClass('cang');
            t.text('收藏');
        }
         $.post("/include/ajax.php?service=member&action=collect&module=tuan&temp=detail&type="+type+"&id="+detailID);
    });

    // 点击
    $(".people .info_list").on("click",function(){
        $.smartScroll($('.pd_list'),'.pd_title_txt');
        $('html').addClass('nos');
        $('.pd_list').addClass('curr');
        return false;
    });
     $(".pd_list .modal-main .close").on("touchend",function(){
        $("html, .pd_list").removeClass('curr nos');
        return false;
     })
    $(".bgCover").on("click",function(){
        $("html, .pd_list").removeClass('curr nos');
    })






})