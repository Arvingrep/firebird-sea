$(function(){

  //签约商家
  $('.sjSign').on('click', function() {
      var userid = $.cookie(cookiePre+'login_user');
      if(userid == undefined || userid == null || userid == 0 || userid == ''){
        location.href = masterDomain + '/login.html';
        return;
      }
      audio.play();
      $('.cd-bouncy-nav-modal').show().removeClass('fade-out').addClass('fade-in');
      if(myFabuIframe != 'join'){
        $("#myFabuIframe").attr("src", $("#myFabuIframe").data('src') + '#join');
      }
      myFabuIframe = 'join';
      noscroll();

  });

  var device = navigator.userAgent;
  if (device.indexOf('huoniao') > -1) {
    $("#appSetting").attr("style", "display: block");
    $('.sjSign').off().attr('href', joinBusiUrl+'#join');
  }

    //客户端登录验证
    if (device.indexOf('huoniao') > -1) {
        setupWebViewJavascriptBridge(function(bridge) {
            //未登录状态下，隔时验证是否已登录，如果已登录，则刷新页面
            var userid = $.cookie(cookiePre+"login_user");
            if(userid == null || userid == ""){
                var timer = setInterval(function(){
                    userid = $.cookie(cookiePre+"login_user");
                    if(userid){
                        $.ajax({
                            url: '/getUserInfo.html',
                            type: "get",
                            async: false,
                            dataType: "jsonp",
                            success: function (data) {
                                if(data){
                                    clearInterval(timer);
                                    bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo, 'dating_uid': data.dating_uid}, function(){});
                                    bridge.callHandler('pageReload', {}, function(responseData){});
                                }
                            }
                        });

                        // location.reload();
                    }
                }, 500);
            }else if($('.nlogin').size() > 0){
                location.reload();
            }
        })
    }

});
