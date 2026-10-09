$(function(){
    $('.appMapBtn').attr('href', OpenMap_URL);
    /*调起大图 S*/
    $.fn.bigImage({
        artMainCon:".uknow-con",  //图片所在的列表标签
    });
	
	  // 分销分享
    $(".fenxiao_share").click(function(){
      if (device.indexOf('huoniao_iOS') > -1 || device.indexOf('huoniao_Android') > -1){
        setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler("appShare", {
                    "platform": "all",
                    "title": wxconfig.title,
                    "url": wxconfig.link,
                    "imageUrl": wxconfig.imgUrl,
                    "summary": wxconfig.description
                }, function(responseData){
                    var data = JSON.parse(responseData);
                })
          });
      }else{
        $("#postFast").click();
      }
    })
    //判断返积分状态 如果是关闭的就是没有
    if($(".yhBox>div").length==0){
        $(".yhBox").hide()
    }


	/* 拼团倒计时s 2020-0701修改*/
	var nowDate = -1;
	getCountDown();
	setInterval(getCountDown,1000)
	 function getCountDown(){
		  $(".time_each").each(function(){
		  	var t = $(this);
			if(nowDate==-1){
				nowDate = t.find('.time_show').attr('data-now');
			}
		  	endtime = t.find('.time_show').attr('data-time');
			 var countTime = Number(endtime) - Number(nowDate)  ;
			 if(countTime<=0){
				  countTime = 0;
				  clearInterval(getCountDown)
			 }
			 var days = parseInt(countTime / 60 / 60 / 24 , 10); //计算剩余的天数
			 var hours = parseInt(countTime / 60 / 60 % 24 , 10); //计算剩余的小时 
			 var minutes = parseInt(countTime / 60 % 60, 10);//计算剩余的分钟 
			 var seconds = parseInt(countTime % 60, 10);//计算剩余的秒数 
			 t.find('.time_show').text("剩余"+(hours>9?hours:"0"+hours)+":"+(minutes>9?minutes:"0"+minutes)+":"+(seconds>9?seconds:"0"+seconds))
			
		  });
	 		nowDate ++;
	}
	
	/* 拼团倒计时e*/ 
	

    var a = $('.people_list .swiper-slide').length;
    if(a == 1){
      $(".people .swiper-wrapper").css('height','1.1rem');
    }else if(a>=2){
      new Swiper('.people .swiper-container', {direction: 'vertical',autoplay:{delay: 5000,},slidesPerView:"auto",loop:true });
    }else{
      $('.people').html('');
    }

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


    //查看图文详细
    $("#showDetail").bind("click", function(){
        $(this).hide();
        $("#bodyDetail").show();
    });

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