$(function(){

  // 确认登录
  $('.sureLogin a').click(function(e){
    var t = $(this);
    if(t.hasClass("disabled")) return false;
    t.addClass("disabled").html("登录中...");
    $.ajax({
      url: '/include/ajax.php?service=siteConfig&action=appWebLogin&qr='+qr,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          t.addClass("disabled").html("登录成功");
          setTimeout(function() {
              setupWebViewJavascriptBridge(function(bridge) {
      			  bridge.callHandler('pageClose', function(){});
      		  });
          }, 2000);
        }else{
          alert(data.info);
          t.removeClass("disabled").html('确认登录');
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        t.removeClass("disabled").html('确认登录');
      }
    });

  })



})
