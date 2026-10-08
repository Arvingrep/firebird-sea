$(function(){

  var device = navigator.userAgent;
  if (device.indexOf('huoniao') > -1) {
    $("#appSetting").attr("style", "display: block");
  }

  //签约商家
  $('.sjSign').on('click', function() {
      var userid = $.cookie(cookiePre+'login_user');
      if(userid == undefined || userid == null || userid == 0 || userid == ''){
        location.href = masterDomain + '/login.html';
        return;
      }
      audio.play();
      $('.cd-bouncy-nav-modal').removeClass('fade-out').addClass('fade-in');
      if(myFabuIframe != 'join'){
        myFabuIframe = 'join';
        $("#myFabuIframe").attr("src", $("#myFabuIframe").data('src') + '#join');
      }
      noscroll();
  });

});
