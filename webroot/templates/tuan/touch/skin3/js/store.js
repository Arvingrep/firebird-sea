$(function(){
	var lng = '', lat = '';
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		  //$('#store ul').html('<div class="loading" style="text-align:center;">定位失败，请刷新页面</div>');
		}else{
		  lng = data.lng, lat = data.lat;
		  getList();
		}

		function getList(){
			$.ajax({
			    url: masterDomain + '/include/ajax.php?service=tuan&action=storeList&pageSize=3&orderby=2&page=1'+'&lng='+lng+'&lat='+lat+'&addrid='+addrid,
			    dataType: 'jsonp',
			    success: function(data){
					if(data.state == 100){
				        var list = data.info.list, html = [];
				        for(var i = 0; i < list.length; i++){
				            if(detailID!=list[i].id){
								html.push('<li class="fn-clear">');
								html.push('<a href="'+list[i].url+'">');
								html.push('<div class="s_img"><img src="'+list[i].litpic+'"></div>');
								html.push('<div class="s_title">');
								html.push('<div class="bus_txt fn-clear"><span class="bus_txt_title business-txt">'+list[i].company+'</span></div>');
								html.push('<p class="tuan"><span>发布团购<em>'+list[i].tuannum+'</em></span>  <span>综合评分<em>'+list[i].rating+'分</em></span></p>');
								if(list[i].package!=''){
									html.push('<div class="quan fn-clear"><span>券</span><span>'+list[i].vouchers+'</span></div>');
								}
								html.push('<div class="addr fn-clear"><span><em>'+list[i].address+'</em><em>'+list[i].distance+'</em></span><div class="aa">进入店铺</div></div>');
								html.push('</div>');
								html.push('</a>');
								html.push('</li>');
							}
				        }
				        $('#store ul').append(html.join(''));
				    }else{
						$('#store ul').html('<div class="loading">'+data.info+'</div>');
				    }
			    },
			    error: function(){
		        	$('.loading').show();
					//$('#store ul').html('<div class="loading">网络错误！</div>');
			    }
			});
		}
	});


   // 轮播
    new Swiper('.swiper-container', {pagination: {el: '.swiper-pagination',type: 'fraction',},autoplay: true,loop: true,grabCursor: true,paginationClickable: true});

    $('.video-box').on('click',function(){
        $('.video-btn').css('display','-webkit-flex');
        $('#video-control').css('display','-webkit-flex');
        setTimeout(function(){ $('#video-control').css('display','none'); $('.video-btn').css('display','none');}, 5000);
    });


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
    $('.topMain .topcomm img').on('click',function(){
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


    // 电话弹框
    $(".tel,.fbuy").on("touchend",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-telphone').addClass('curr');
        return false;
    });
    $(".modal-public .modal-main .close").on("touchend",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
     })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })


    // 点击收藏
    $('.foot_bottom .scBox').click(function(){
    	var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

        var t = $(this), type = "add";
        if(t.hasClass('has')){
        	type = "del";
            t.removeClass('has');
           
              t.html('<s></s>收藏');
        }else{
            t.addClass('has');
            t.html('<s></s>已收藏');
        }
        $.post("/include/ajax.php?service=member&action=collect&module=tuan&temp=store&type="+type+"&id="+detailID);
    });
    $('.appMapBtn').attr('href', OpenMap_URL);

 




})