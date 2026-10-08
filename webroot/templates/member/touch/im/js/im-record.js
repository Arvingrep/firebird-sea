$(function(){
	wx.config({
	    debug: false,
	    appId: wxconfig.appId,
	    timestamp: wxconfig.timestamp,
	    nonceStr: wxconfig.nonceStr,
	    signature: wxconfig.signature,
	    jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice']
	  });
	var iswechat = false;
	//微信分享
	wx.ready(function() {
//	     alert('aa');
	    iswechat = true;
	    $('.im-yuyin').removeClass('disabled');
	    wx.error(function(res){
	       console.log(res);
	    });
	    wx.onVoicePlayEnd({
	      success: function (res) {
	        $('.second').removeClass('pause');
	        $('.nolock .audioBtn span').removeClass('pause');
	        $('.nolock').removeClass('swiper-no-swiping');
	        $('.nolock .tips').text(langData['siteConfig'][46][83]).show();//播放完成
	        $('.audio-panel').removeClass('play');
	        stopWave();
	      }
	    });
	});
	
	
	 //计时器（开始时间、结束时间、显示容器）
  var mtimer, audioTime;
	function countDown(time, obj){
		
    var active = $('.swiper-slide-active');
		obj.text(time);
		
		mtimer = setInterval(function(){
			obj.text(++time);
			if(time >= 60) {
				clearInterval(mtimer);
        audioTime = 60;
		console.log('录音完成，点击播放')//录音完成，点击播放
        if (active.hasClass('nolock')) {
          var t = $('.nolock .audioBtn span'), btn = t.closest('.audioBtn'), tips = btn.siblings('.tips');
          $('.second').removeClass('pause').addClass('stop');
          t.removeClass('pause').addClass('stop');
          clearTimeout(recordTimer1);
          tips.text(langData['siteConfig'][46][84]).show();//录音完成，点击播放
          
          $('.nolock').removeClass('swiper-no-swiping');
        
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              // alert(voiceId);

            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });
        }else {
          var t = $('.lock .audioBtn span'), timeObj = t.closest('.audioBtn').siblings('.second');
          t.removeClass('pause');
          $('.second').removeClass('pause');

          timeObj.text('0');

          event.preventDefault();
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              uploadVoice(1);
            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });

        }

			}
		}, 1000);
	}
	
	var voiceId, recordTimer1;
	 // 点击开始录音
  $('.nolock .audioBtn span').click(function(){
    var t = $(this), btn = t.closest('.audioBtn'), tips = btn.siblings('.tips'), timeObj = btn.siblings('.second');
    if (!t.hasClass('stop')) {
      if (!t.hasClass('pause')) {
        START = new Date().getTime();
        countDown(0, timeObj);
        recordTimer1 = setTimeout(function(){
//           alert(voiceId);
          wx.startRecord({
            success: function(){
                // localStorage.rainAllowRecord = 'true';
                $('.nolock').addClass('swiper-no-swiping');
                $('.second').addClass('pause');
                t.addClass('record_end');
                tips.text(langData['siteConfig'][46][85]).hide();//正在录音，点击停止录音
            },
            cancel: function () {
                alert(langData['siteConfig'][46][86]);//用户拒绝授权录音
            }
          });
        },300);
      }else {
        END = new Date().getTime();
        clearInterval(mtimer);
        // alert(voiceId);
        audioTime = timeObj.text();

        $('.second').removeClass('pause').addClass('stop');
        t.removeClass('pause').addClass('stop');
        clearTimeout(recordTimer1);
        tips.text(langData['siteConfig'][46][84]).show();//录音完成，点击播放
        $('.im-btn_group').show();
        $('.nolock').removeClass('swiper-no-swiping');

        if((END - START) < 300){
            END = 0;
            START = 0;
        }else{
            wx.stopRecord({
              success: function (res) {
                voiceId = res.localId;
              },
              fail: function (res) {
                //alert(JSON.stringify(res));
              }
            });
        }
      }
    }else {
      if (t.hasClass('pause')) {
        t.removeClass('pause');
        $('.second').removeClass('pause');
        wx.stopVoice({
            localId: voiceId, // 需要停止的音频的本地ID，由stopRecord接口获得
            success: function(res){
              $('.nolock').removeClass('swiper-no-swiping');
              tips.text(langData['siteConfig'][46][87]);//停止播放
            },
            fail: function(res){
              //alert(JSON.stringify(res));
            }
        });
      }else {
        t.addClass('pause');
        wx.playVoice({
            localId: voiceId, // 需要播放的音频的本地ID，由stopRecord接口获得
            success: function(res){
              $('.nolock').addClass('swiper-no-swiping');
              tips.text(langData['siteConfig'][46][88]);//正在播放
            },
            fail: function(res){
              //alert(JSON.stringify(res));
            }
        });
      }
    }
  });
  
   var recordTimer;
  // 按住录音
  $('.lock .audioBtn span').on('touchstart', function(){
    var t = $(this), timeObj = t.closest('.audioBtn').siblings('.second');
    START = new Date().getTime();
    if (iswechat) {
      event.preventDefault();
      recordTimer = setTimeout(function(){
        wx.startRecord({
          success: function(){
            // localStorage.rainAllowRecord = 'true';
            t.closest('.swiper-slide-active').find('.tips').text(langData['siteConfig'][46][90]).hide();//正在录音，松手停止录音
            $('.lock .audioBtn').removeClass('stop');
            t.removeClass('stop').addClass('pause');
            $('.second').removeClass('stop').addClass('pause');
            countDown(0, timeObj);
          },
          cancel: function () {
            alert(langData['siteConfig'][46][86]);//用户拒绝授权录音
          }
        });
      },300);
    }
  });

  $('.lock .audioBtn span').on('touchend', function(event){
    var t = $(this), timeObj = t.closest('.audioBtn').siblings('.second');
    END = new Date().getTime();
    clearInterval(mtimer);
    t.closest('.swiper-slide-active').find('.tips').text(langData['siteConfig'][46][89]).show();//按住说话
    clearTimeout(recordTimer);
    t.removeClass('pause');
    $('.second').removeClass('pause');
    audioTime = timeObj.text();
    timeObj.text('0');

    if (iswechat) {
      event.preventDefault();
      if((END - START) < 300){
          END = 0;
          START = 0;
      }else{
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              uploadVoice(1);
            },
            fail: function (res) {
                 alert(JSON.stringify(res));
            }
          });
      }
    }
  });

// 重新录音
  $('.audiobox .reset').click(function(){
    $('.swiper-slide-active .second').text('0');
//  $('.lock .tips').text('按住按钮开始录音').show();
    $('.nolock .tips').text(langData['siteConfig'][46][91]).show();//点击开始录音
    $('.second').removeClass('pause');
    $('.second').removeClass('stop');
    $('.swiper-slide-active .audioBtn span').removeClass('start');
    $('.swiper-slide-active .audioBtn span').removeClass('stop');
    $('.swiper-slide-active .audioBtn span').removeClass('pause');
    $('.swiper-slide-active.swiper-no-swiping').removeClass('swiper-no-swiping');
    $('body').unbind('touchmove');
    clearInterval(mtimer);
    clearTimeout(recordTimer);
    clearTimeout(recordTimer1);

    // 停止录音
    wx.stopRecord({
      success: function (res) {
        voiceId = res.localId;
      },
      fail: function (res) {
        // alert(JSON.stringify(res));
      }
    });

  });
  
   // 录音完成
  $('.audiobox .finish').click(function(){
    var active = $('.swiper-slide-active'), btn = active.find('.audioBtn span');
    if (!btn.hasClass('pause')) {
      $('#audio .unlock_audio').show();
      hideAudioBox();
    }
  })

  // 隐藏录音弹出层
  function hideAudioBox(){
    var active = $('.swiper-slide-active'), noSwiper = active.find('.audioBtn span');
    if (active.hasClass('nolock') && noSwiper.hasClass('stop')) {
      uploadVoice();
    }
    $('.second').text('0');
    $('.audioBtn span').removeClass('pause');
    $('.audioBtn span').removeClass('stop');
    $('.second').removeClass('stop');
    $('.lock .tips').text(langData['siteConfig'][47][16]);//按住按钮开始录音
    $('.unlock .tips').text(langData['siteConfig'][46][91]);//点击开始录音
    $('.mask, .audiobox').hide();
    $('body').unbind('touchmove');
  }
	
	
	
	
	
	
	
})
