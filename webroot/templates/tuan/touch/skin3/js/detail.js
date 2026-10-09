$(function(){
    
    $('.appMapBtn').attr('href', OpenMap_URL);
	var now = date[0], stime = date[1], etime = date[2], state = 1;
	if(now < stime){
		state = 2;
		$(".daojishi").html("还未开始");
	}else if(now > etime){
		state = 3;
		$(".daojishi").html("已结束");
	}
	if(state > 1)	$(".price").find("a").addClass("disabled");

	var timeCompute = function (a, b) {
		if (this.time = a, !(0 >= a)) {
			for (var c = [86400 / b, 3600 / b, 60 / b, 1 / b], d = .1 === b ? 1 : .01 === b ? 2 : .001 === b ? 3 : 0, e = 0; d > e; e++) c.push(b * Math.pow(10, d - e));
			for (var f, g = [], e = 0; e < c.length; e++) f = Math.floor(a / c[e]),
			g.push(f),
			a -= f * c[e];
			return g
		}
	}
	,CountDown =	function(a) {
		this.time = a,
		this.countTimer = null,
		this.run = function(a) {
			var b, c = this;
			this.countTimer = setInterval(function() {
				b = timeCompute.call(c, c.time - 1, 1);
				b || (clearInterval(c.countTimer), c.countTimer = null);
				"function" == typeof a && a(b || [0, 0, 0, 0, 0], !c.countTimer)
			}, 1000);
		}
	};

	var begin = stime - now;
	var end   = etime - now;
	var time  = begin > 0 ? begin : end > 0 ? end : 0;
	var timeTypeText = '距结束';
	if(begin < 0 && end < 0 ){
		timeTypeText = '剩余';
	}else if (begin > 0 && end > 0) {
		timeTypeText = '距开始';
	} else if(begin < 0 && end > 0) {
		timeTypeText = '剩余';
	}

	var countDown = new CountDown(time);
	countDownRun();

	function countDownRun(time) {
	    console.log(time);
		time && (countDown.time = time);
		countDown.run(function(times, complete) {
		    var days = '';
		    if(times[0]>0){
				var days = '<span>' + times[0] + '</span>:';
		    }
			var html = timeTypeText + days + '<span>' + times[1] +
			'</span>:<span>' + times[2] +
			'</span>:<span>' + times[3] + '</span>';
			$(".daojishi").html(html);
			if (complete) {
				if(begin < 0 && end < 0 ){
					$(".price").find("a").addClass("disabled");
					 $(".daojishi").html("已结束");
				}else if (begin > 0) {
				    $(".price").find("a").removeClass("disabled");
					timeTypeText = '剩余';
					countDownRun(etime - stime);
					begin = null;
				} else {
				    $(".price").find("a").addClass("disabled");
					if( begin === null || begin <= 0 ){
					    $(".daojishi").html("已结束");
					}else{
					    $(".daojishi").html("还未开始");
					}
				}
			}
		});
	}


   // 轮播
    new Swiper('.swiper-container', {pagination: {el: '.swiper-pagination',type: 'fraction',},loop: false,grabCursor: true,paginationClickable: true});

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


    var nav_click = 1;
    // 导航
    $(document).ready(function(){
        var navHeight= $(".detail_list").offset().top;
        var navFix=$("#nav-wrap");
        $(window).scroll(function(){
            var scroll = $(window).scrollTop();
            if($(this).scrollTop()>navHeight){
                navFix.addClass("navFix");
            }else{
                navFix.removeClass("navFix");
            }
            // 内容滑动到哪,导航跟着变化
            $(".tuan_container .common_tuan").each(function(){
                var t = $(this);
                if((t.offset().top - 28 - $(".nav-wrap").height())<=scroll && nav_click){
                    $('.nav-wrap li').eq(t.index()).addClass('active').siblings().removeClass('active');
                }
            });
        })
    })
    //导航点击  
    $('.nav-wrap').delegate('li','click',function(){
        var t = $(this),index = t.index();
        t.addClass('active').siblings().removeClass('active');

        nav_click = 0;
        var scTop = $('.common_tuan').eq(index).offset().top  -$(".nav-wrap").height();
        $(window).scrollTop(scTop);
        setTimeout(function(){
           nav_click = 1;
        },500)
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





})