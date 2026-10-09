$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

    var userAgent = navigator.userAgent.toLowerCase();

    if(userAgent.toLowerCase().match(/micromessenger/)){
        $('.fi_02').show();
    }


var u = navigator.userAgent;
var isIOS = u.indexOf('iPhone') > -1
//创建播放器
var islive =false,type = $('.prism-player').data('type');
if(type==1){
	islive =true;
	$('#progress, #time').css('visibility','hidden');
}
var source = $('.prism-player').data('src');
var poster = $('.prism-player').data('poster');
var player = new Aliplayer({
  "id": "player-con",
  "source": detail_video,
  "cover": litpic,
  "width": "100%",
  "height": "4.2rem",
  "autoplay": false,
//"isLive": islive,
  "rePlay": false,
  "playsinline": true,
  "preload": true,
  "controlBarVisibility": "hover",
  "useH5Prism": true,
  "skinLayout": [],
}, function (player) {
  }
);


   //控制栏显示
 $('.prism-player video').on('click',function(){
    $('.video-btn').css('display','-webkit-flex');
    $('#video-control').css('display','-webkit-flex');
      setTimeout(function(){ $('#video-control').css('display','none'); $('.video-btn').css('display','none');}, 5000);
 });
        var box = $("#video-control"); //box对象
        var video = $("#video"); //视频对象
        var play = $("#play"); //播放按钮
        var vbplay = $("#vbplay");//视频中间播放按钮
        var time = $('#time');
        var progress = $("#progress"); //进度条
        var bar = $("#bar"); //蓝色进度条
        var control = $("#control"); //声音按钮
        var sound = $("#sound"); //喇叭
        var full = $("#full") //全屏
       player.on('pause',function(){
       		play.addClass('play').removeClass('pause');
       		$('.play-box').find('i').removeClass('pause-icon').addClass('play-icon');
       		
       });
       player.on('play',function(){
       		play.addClass('pause').removeClass('play');
       		vbplay.click();
       		$('.play-box').find('i').removeClass('play-icon').addClass('pause-icon');
		   	$('.load-box').hide();
		    
       });
        
		//数据缓冲
		player.on('waiting',function(){
			$('.video-btn').css('display','-webkit-flex');
			vbplay.hide();
		   	$('.load-box').show();	   
		});
		player.on('canplay',function(){
			vbplay.show();
		   	$('.load-box').hide();
		});
		
		player.on('ended',function(){
			$('.video-btn').css('display','-webkit-flex');
			vbplay.show();
		})
		//视频时间
       player.on('timeupdate',function(){
       	 var timeStr = parseInt(player.getCurrentTime());
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
            time.html(minute) ;
       });
       //当视频全屏的时候
       player.on('requestFullScreen',function(){
       	  if(!isIOS){
       	  	$('.full').addClass('small');
			$('#player-con video').css({
				'width':'100%',
				'height':'auto !important'
			})
       	  }
       		
       });
       //当视频取消全屏的时候
       player.on('cancelFullScreen',function(){
       		$('.full').removeClass('small');
       		player.play();
       });
       //进度条
       player.on('timeupdate',function(){
       	 var scales = player.getCurrentTime() / player.getDuration();
            bar.css('width',progress.width() * scales + "px") ;
            control.css('left',progress.width() * scales + "px") ;
       },false);
        var move = 'ontouchmove' in document ? 'touchmove' : 'mousemove';
        control.on("touchstart", function(e) {
            var leftv = e.touches[0].clientX - progress.offset().left - box.offset().left;
            if(leftv <= 0) {
                leftv = 0;
            }
            if(leftv >= progress.width()) {
                leftv = progress.width();
            }
            control.css('left',leftv + "px"); 
            console.log('开始'+leftv)
        }, false);
        control.on('touchmove', function(e) {
            var leftv = e.touches[0].clientX - progress.offset().left - box.offset().left;
            if(leftv <= 0) {
                leftv = 0;
            }
            if(leftv >= progress.width()) {
                leftv = progress.width();
            }
            control.css('left',leftv + "px"); 
            console.log('移动'+leftv)
        }, false);
        control.on("touchend", function(e) {
        	var leftv = e.changedTouches[0].clientX- progress.offset().left - box.offset().left
            var scales = leftv / progress.width();
          
            player.seek(player.getDuration() * scales);
           
            document.onmousemove = null;
            document.onmousedown = null;
            console.log(control.offset().left)
        }, false);
  
        //设置静音或者解除静音
      sound.click(function(){
      	if(sound.hasClass('soundon')){
      		sound.removeClass('soundon').addClass('soundoff');
      		player.setVolume(0);
      		console.log('静音')
      	}else{
      		sound.addClass('soundon').removeClass('soundoff');
      		player.setVolume(.5)
      	}
      })
      //设置全屏
     
       full.click(function(){
       	if(!isIOS){
       		if(player.fullscreenService.getIsFullScreen()){
	       	  	$(this).removeClass('small');
	       	  	 player.fullscreenService.cancelFullScreen();
	       	  }else{
	       	  	$(this).addClass('small')
	       	  	 player.fullscreenService.requestFullScreen();
	       	  }
       	}else{
       		player.fullscreenService.requestFullScreen();
       	}
       });
       
       //点击播放
      
       vbplay.click(function(){
       	 var status = player.getStatus()
       	 $('.prism-player video').click();
		   console.log(status);
		   if(status=='playing'){
		   	  player.pause();
		   }else{
		   	   player.play();
		   }
	   });

      play.click(function(){
      	if(play.hasClass('play')){
      		player.play();
            console.log('播放中')
      	}else{
      		player.pause();
             console.log('暂停中')    
      	}
      })


      getList(1);
      //视频推荐
      function  getList(tr){
          var data = [];
          data.push("page=1");
          data.push("pageSize=4");
          data.push("noid="+id);
  
          isload = true;
          if(tr){
              $(".tip").html(langData['travel'][12][57]).show();
          }
          
          $.ajax({
              url: masterDomain + "/include/ajax.php?service=travel&action=videoList&"+data.join("&"),
              type: "GET",
              dataType: "jsonp",
              success: function (data) {
                  isload = false;
                  if(data && data.state == 100){
                      var html = [], html1 = [], list = data.info.list, pageinfo = data.info.pageInfo;
                      for (var i = 0; i < list.length; i++) {
                          if(i%2==0){
                              html.push('<li><a class="li_video" href="'+list[i].url+'">');
                              var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "";
                              html.push('<div class="video_img"><img src="'+pic+'" /></div>');
                              html.push('<div class="videoInfo">');
                              html.push('<h2>'+list[i].title+'</h2>');
                              html.push('<div class="up_more">');
                              html.push('<div class="_left">');
                              var photo = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
                              html.push('<div class="headimg"><img src="'+photo+'"></div>');
                              html.push('<p class="up_name">'+list[i].user['nickname']+'</p>');
                              html.push('</div>');
                              html.push('<p class="_right">'+list[i].click+langData['travel'][6][9]+'</p>');
                              html.push('</div>');
                              html.push('</div>');
                              html.push('</a></li>');
                          }else{
                              html1.push('<li><a class="li_video" href="'+list[i].url+'">');
                              var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "";
                              html1.push('<div class="video_img"><img src="'+pic+'" /></div>');
                              html1.push('<div class="videoInfo">');
                              html1.push('<h2>'+list[i].title+'</h2>');
                              html1.push('<div class="up_more">');
                              html1.push('<div class="_left">');
                              var photo = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
                              html1.push('<div class="headimg"><img src="'+photo+'"></div>');
                              html1.push('<p class="up_name">'+list[i].user['nickname']+'</p>');
                              html1.push('</div>');
                              html1.push('<p class="_right">'+list[i].click+langData['travel'][6][9]+'</p>');
                              html1.push('</div>');
                              html1.push('</div>');
                              html1.push('</a></li>');
                          }
                      }
                      
                      
                      if(html!=''){
                        $(".left_list").html(html.join(""));
                      }
                      if(html1!=''){
                        $(".right_list").html(html1.join(""));
                     }
                      isload = false;
                      $(".tip").hide();
                  }else{
                      $(".left_list").html("");
                      $(".right_list").html("");
                      $(".tip").html(data.info).show();
                  }
              },
              error: function(){
                  $('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
              }
          });
          
      }

      

  
    
    //点赞
	$('.commentList').on('click','.btnUp',function(){
		var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
		}

		var t = $(this), id = t.attr("data-id");
        if(t.hasClass("active")) return false;
		
		var num = t.find('em').html();
        if( typeof(num) == 'object') {
          num = 0;
		}
		var type = 'add';
        if(t.hasClass("active")){
            type = 'del';
            num--;
        }else{
            num++;
        }

		$.ajax({
			url: '/include/ajax.php?service=member&action=dingComment&id=' + id + "&type=" + type,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
                    if(t.hasClass("active")){
                        t.removeClass('active');
                    }else{
                        t.addClass('active');
                    }
                    t.find('em').html(num);
                }else{
                    showErrAlert(data.info);
                    t.removeClass('active');
                }
			}
		});

	});
	
	$('.videoInfoBox').on('click','.numup',function(){
		var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
			return false;
		}

        var t = $(this);
        var zanTitle = wxconfig.title;
		$.post("/include/ajax.php?service=member&action=getZan&module=travel&temp=video-detail&title="+zanTitle+"&id="+id + "&uid=" + uid, function(data){
            if(data.state == 100){
                var num = t.text()*1;
                if(t.hasClass('aclick')){
                    t.removeClass('aclick');
                    t.text(num-1)
                }else{
                    t.addClass('aclick');
                    t.text(num+1)
                }
            }else{
                showErrAlert(data.info);
            }
        },"json");
	});
   

    //关注
	$('.videoInfoBox').on('click','.btn_care',function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
		
		if($(this).hasClass('cared')){
			$(this).html('<s></s>'+langData['travel'][6][11]);   //关注
			$(this).removeClass('cared')
		}else{
			$(this).html('<s></s>'+langData['travel'][6][12]);  //已关注
			$(this).addClass('cared')
		}

		var mediaid = $(this).attr("data-id");

		$.post("/include/ajax.php?service=member&action=followMember&id="+mediaid);
	});








})

//判断登录
function checkLogin(){
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
        window.location.href = masterDomain+'/login.html';
        return false;
    }
}